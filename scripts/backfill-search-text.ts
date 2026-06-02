import "dotenv/config";
import { buildSearchText, safeDecryptAtRest } from "../src/lib/field-crypto";
import { prisma } from "../src/lib/db";

async function main() {
  const items = await prisma.item.findMany({
    select: { id: true, title: true, description: true, searchText: true },
  });

  let updated = 0;

  for (const item of items) {
    const title = safeDecryptAtRest(item.title);
    const description = safeDecryptAtRest(item.description);
    const searchText = buildSearchText(title, description);

    if (searchText === item.searchText) {
      continue;
    }

    await prisma.item.update({
      where: { id: item.id },
      data: { searchText },
    });
    updated += 1;
  }

  console.log(`Backfilled search text for ${updated} of ${items.length} items.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
