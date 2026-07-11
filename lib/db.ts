import { PrismaClient } from "@prisma/client";

/**
 * Bump this when `prisma/schema.prisma` changes in a way that requires a fresh
 * client (e.g. new columns). Prevents Next.js dev HMR from reusing an old
 * PrismaClient that still expects the previous schema.
 */
const PRISMA_SCHEMA_STAMP = "2026-07-topping-platter-stack";

/** Default Prisma pool wait (s); dev HMR + parallel RSC can exhaust short pools. */
const DEFAULT_POOL_TIMEOUT_S = 30;
const DEFAULT_CONNECT_TIMEOUT_S = 20;

function prismaDatabaseUrlWithPoolTuning(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return trimmed;
  try {
    const u = new URL(trimmed);
    if (!u.searchParams.has("pool_timeout")) {
      u.searchParams.set("pool_timeout", String(DEFAULT_POOL_TIMEOUT_S));
    }
    if (!u.searchParams.has("connect_timeout")) {
      u.searchParams.set("connect_timeout", String(DEFAULT_CONNECT_TIMEOUT_S));
    }
    return u.toString();
  } catch {
    return trimmed;
  }
}

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
    const fromEnv = process.env.DATABASE_URL?.trim();
    const url = fromEnv ? prismaDatabaseUrlWithPoolTuning(fromEnv) : undefined;
    globalForPrisma.prisma = url
      ? new PrismaClient({
          datasources: { db: { url } },
        })
      : new PrismaClient();
    globalForPrisma.prismaSchemaStamp = PRISMA_SCHEMA_STAMP;
  }

  return globalForPrisma.prisma;
}

export const prisma = getPrisma();
