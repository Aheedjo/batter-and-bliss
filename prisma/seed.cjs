/* eslint-disable @typescript-eslint/no-require-imports */
const path = require("node:path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const menuPath = path.join(__dirname, "../lib/data/default-menu.json");
/** Keep in sync with `lib/data/default-menu.json` (single source of truth). */
const { toppings: TOPPINGS, extras: EXTRAS } = require(menuPath);

async function main() {
  await prisma.topping.deleteMany({});
  await prisma.topping.createMany({
    data: TOPPINGS.map((t) => ({
      name: t.name,
      price: t.price,
      category: t.category,
      available: true,
    })),
  });

  if ((await prisma.extra.count()) === 0) {
    await prisma.extra.createMany({
      data: EXTRAS.map((e) => ({
        name: e.name,
        price: e.price,
        available: true,
      })),
    });
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
