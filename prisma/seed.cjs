/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  if ((await prisma.topping.count()) === 0) {
    await prisma.topping.createMany({
      data: [
        { name: "Sprinkles", price: 0.75, available: true },
        { name: "Whipped cream", price: null, available: true },
        { name: "Chocolate drizzle", price: 0.5, available: true },
      ],
    });
  }
  if ((await prisma.extra.count()) === 0) {
    await prisma.extra.createMany({
      data: [
        { name: "Extra scoop", price: 2.5, available: true },
        { name: "Waffle cone upgrade", price: 1.25, available: true },
      ],
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
