import "dotenv/config";
import { prepareCategoryForDb, withDecryptedCategory } from "../src/lib/category-crypto";
import { prisma } from "../src/lib/db";

const ENCRYPTED_PREFIX = "enc:v1:";

async function main() {
  const categories = await prisma.category.findMany({
    select: { id: true, name: true },
  });

  let updated = 0;

  for (const row of categories) {
    if (row.name.startsWith(ENCRYPTED_PREFIX)) {
      continue;
    }

    const plain = withDecryptedCategory(row).name;
    await prisma.category.update({
      where: { id: row.id },
      data: prepareCategoryForDb(plain),
    });
    updated += 1;
  }

  console.log(`Encrypted names for ${updated} of ${categories.length} categories.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
