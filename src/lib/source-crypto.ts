import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} from "crypto";

const PREFIX = "enc:v1:";
const ALGORITHM = "aes-256-gcm";
const KEY_SALT = "bucket-source-v1";

function getEncryptionKey(): Buffer {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("AUTH_SECRET must be at least 16 characters");
  }
  return scryptSync(secret, KEY_SALT, 32);
}

/** Encrypt source for database storage (reversible, not one-way hash). */
export function encryptSourceAtRest(plain: string): string {
  const trimmed = plain.trim();
  if (!trimmed) {
    return "";
  }

  const key = getEncryptionKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(trimmed, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return `${PREFIX}${iv.toString("base64url")}.${ciphertext.toString("base64url")}.${tag.toString("base64url")}`;
}

/** Decrypt source from DB; legacy plaintext rows are returned as-is. */
export function decryptSourceAtRest(stored: string): string {
  if (!stored) {
    return "";
  }
  if (!stored.startsWith(PREFIX)) {
    return stored;
  }

  const payload = stored.slice(PREFIX.length);
  const [ivB64, ciphertextB64, tagB64] = payload.split(".");
  if (!ivB64 || !ciphertextB64 || !tagB64) {
    return "";
  }

  const key = getEncryptionKey();
  const iv = Buffer.from(ivB64, "base64url");
  const ciphertext = Buffer.from(ciphertextB64, "base64url");
  const tag = Buffer.from(tagB64, "base64url");

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]).toString("utf8");
}

/** Decrypt source only; title/description stay as stored in DB. */
export function withDecryptedSource<T extends { source: string }>(item: T): T {
  return { ...item, source: decryptSourceAtRest(item.source) };
}

export function withDecryptedSources<T extends { source: string }>(
  items: T[],
): T[] {
  return items.map(withDecryptedSource);
}

/**
 * Some rows may still have encrypted title/description from an earlier version.
 * Plaintext rows are returned unchanged.
 */
export function withReadableTextFields<
  T extends { title: string; description: string; source: string },
>(item: T): T {
  const readable = withDecryptedSource(item);
  return {
    ...readable,
    title: decryptSourceAtRest(readable.title),
    description: decryptSourceAtRest(readable.description),
  };
}

export function withReadableTextFieldsList<
  T extends { title: string; description: string; source: string },
>(items: T[]): T[] {
  return items.map(withReadableTextFields);
}
