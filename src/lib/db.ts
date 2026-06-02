import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set in .env");
  }
  if (connectionString.startsWith("prisma+postgres://")) {
    throw new Error(
      "DATABASE_URL must be a standard postgresql:// URL. " +
        "The prisma+postgres:// value from `prisma init` does not work with this app. " +
        "Use your Supabase connection string, or run `npx prisma dev` and copy the postgresql:// URL it prints.",
    );
  }
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
