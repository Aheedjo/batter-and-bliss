import { PrismaClient } from "@prisma/client";

/**
 * Bump this when `prisma/schema.prisma` changes in a way that requires a fresh
 * client (e.g. new columns). Prevents Next.js dev HMR from reusing an old
 * PrismaClient that still expects the previous schema.
 */
const PRISMA_SCHEMA_STAMP = "2026-04-topping-category";

type GlobalPrisma = {
  prisma?: PrismaClient;
  prismaSchemaStamp?: string;
};

const globalForPrisma = globalThis as unknown as GlobalPrisma;

function getPrisma(): PrismaClient {
  const needsNew =
    !globalForPrisma.prisma ||
    globalForPrisma.prismaSchemaStamp !== PRISMA_SCHEMA_STAMP;

  if (needsNew && globalForPrisma.prisma) {
    void globalForPrisma.prisma.$disconnect();
    globalForPrisma.prisma = undefined;
  }

  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient();
    globalForPrisma.prismaSchemaStamp = PRISMA_SCHEMA_STAMP;
  }

  return globalForPrisma.prisma;
}

export const prisma = getPrisma();
