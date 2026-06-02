import "dotenv/config";
import {
  buildSearchText,
  prepareItemForDb,
  safeDecryptAtRest,
} from "../src/lib/field-crypto";
import { prisma } from "../src/lib/db";

const ENCRYPTED_PREFIX = "enc:v1:";

function isEncrypted(value: string): boolean {
  return value.startsWith(ENCRYPTED_PREFIX);
}

async function main() {
  const items = await prisma.item.findMany({
    select: {
      id: true,
      title: true,
      description: true,
      source: true,
      searchText: true,
    },
  });

  let updated = 0;

  for (const item of items) {
    const title = safeDecryptAtRest(item.title);
    const description = safeDecryptAtRest(item.description);
    const source = safeDecryptAtRest(item.source);
    const searchText = buildSearchText(title, description);
    const prepared = prepareItemForDb({ title, description, source });

    const needsEncrypt =
      !isEncrypted(item.title) ||
      !isEncrypted(item.description) ||
      (source !== "" && !isEncrypted(item.source));
    const needsSearchText = searchText !== item.searchText;

    if (!needsEncrypt && !needsSearchText) {
      continue;
    }

    await prisma.item.update({
      where: { id: item.id },
      data: prepared,
    });
    updated += 1;
  }

  console.log(
    `Encrypted fields and/or search text for ${updated} of ${items.length} items.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
