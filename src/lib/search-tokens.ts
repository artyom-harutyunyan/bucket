import { createHmac } from "crypto";

const TOKEN_PREFIX = "tok:v1:";
const CHARSET = "abcdefghijklmnopqrstuvwxyz0123456789";
const MIN_PREFIX_LEN = 2;
const MIN_QUERY_TOKEN_LEN = 1;

let substitutionMap: Map<string, string> | null = null;

function getSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("AUTH_SECRET must be at least 16 characters");
  }
  return secret;
}

/** Deterministic letter/digit substitution derived from AUTH_SECRET. */
function getSubstitutionMap(): Map<string, string> {
  if (substitutionMap) {
    return substitutionMap;
  }

  const digest = createHmac("sha256", getSecret())
    .update("bucket-search-token-v1")
    .digest();
  const chars = CHARSET.split("");
  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = digest[i % digest.length] % (i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  substitutionMap = new Map(
    CHARSET.split("").map((plain, index) => [plain, chars[index]]),
  );
  return substitutionMap;
}

export function obfuscateSearchToken(token: string): string {
  const map = getSubstitutionMap();
  return token
    .toLowerCase()
    .split("")
    .map((char) => map.get(char) ?? char)
    .join("");
}

export function normalizeSearchWords(text: string): string[] {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 0);
}

/** Words plus prefixes (for partial queries) — all obfuscated, never stored as plain text. */
export function collectSearchTokens(...texts: string[]): string[] {
  const unique = new Set<string>();

  for (const text of texts) {
    for (const word of normalizeSearchWords(text)) {
      if (word.length >= MIN_PREFIX_LEN) {
        for (let len = MIN_PREFIX_LEN; len <= word.length; len += 1) {
          unique.add(obfuscateSearchToken(word.slice(0, len)));
        }
      } else if (word.length === MIN_QUERY_TOKEN_LEN) {
        unique.add(obfuscateSearchToken(word));
      }
    }
  }

  return [...unique].sort();
}

/** Pipe-delimited obfuscated tokens for DB storage (`search_text` column). */
export function buildSearchTokenIndex(title: string, description: string): string {
  const tokens = collectSearchTokens(title, description);
  if (tokens.length === 0) {
    return "";
  }
  return `${TOKEN_PREFIX}|${tokens.join("|")}|`;
}

export function tokenizeSearchQuery(query: string): string[] {
  return normalizeSearchWords(query)
    .filter((word) => word.length >= MIN_QUERY_TOKEN_LEN)
    .map((word) => obfuscateSearchToken(word));
}

function delimitedToken(token: string): string {
  return `|${token}|`;
}

export function itemSearchFilter(q: string | undefined) {
  const trimmed = q?.trim();
  if (!trimmed) {
    return {};
  }

  const tokens = tokenizeSearchQuery(trimmed);
  if (tokens.length === 0) {
    return {};
  }

  return {
    AND: tokens.map((token) => ({
      searchText: { contains: delimitedToken(token) },
    })),
  };
}

export function isObfuscatedSearchIndex(stored: string): boolean {
  return stored.startsWith(TOKEN_PREFIX);
}
