import { decryptAtRest, encryptAtRest } from "@/lib/field-crypto";

export function prepareCategoryForDb(name: string) {
  return { name: encryptAtRest(name.trim()) };
}

export function withDecryptedCategory<T extends { name: string }>(category: T): T {
  return { ...category, name: decryptAtRest(category.name) };
}

export function withDecryptedCategories<T extends { name: string }>(
  categories: T[],
): T[] {
  return categories.map(withDecryptedCategory);
}

export function sortCategoriesByName<T extends { name: string }>(
  categories: T[],
): T[] {
  return [...categories].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
  );
}
