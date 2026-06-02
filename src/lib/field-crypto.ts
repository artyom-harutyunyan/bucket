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

/** Encrypt a text field for database storage (reversible, not one-way hash). */
export function encryptAtRest(plain: string): string {
  if (!plain) {
    return "";
  }

  const key = getEncryptionKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(plain, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return `${PREFIX}${iv.toString("base64url")}.${ciphertext.toString("base64url")}.${tag.toString("base64url")}`;
}

/** Decrypt a field from DB; legacy plaintext rows are returned as-is. */
export function decryptAtRest(stored: string): string {
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

export type ItemTextFields = {
  title: string;
  description: string;
  source: string;
};

/** Lowercase index for DB search (title + description, not encrypted). */
export function normalizeSearchText(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

export function buildSearchText(title: string, description: string): string {
  return normalizeSearchText(`${title} ${description}`);
}

export function encryptItemFieldsForDb(fields: ItemTextFields): ItemTextFields {
  return {
    title: encryptAtRest(fields.title.trim()),
    description: encryptAtRest(fields.description.trim()),
    source: encryptAtRest(fields.source.trim()),
  };
}

export function prepareItemForDb(fields: ItemTextFields) {
  return {
    ...encryptItemFieldsForDb(fields),
    searchText: buildSearchText(fields.title, fields.description),
  };
}

export function safeDecryptAtRest(stored: string): string {
  try {
    return decryptAtRest(stored);
  } catch {
    return "";
  }
}

export function withDecryptedItem<T extends ItemTextFields>(item: T): T {
  return {
    ...item,
    title: decryptAtRest(item.title),
    description: decryptAtRest(item.description),
    source: decryptAtRest(item.source),
  };
}

export function withDecryptedItems<T extends ItemTextFields>(items: T[]): T[] {
  return items.map(withDecryptedItem);
}
