/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

/** Batter & Bliss menu prices. Re-run seed to refresh add-ons after schema changes. */
const TOPPINGS = [
  // Glazing
  { name: "Fluffy glaze coat", price: 800, category: "glazing" },
  { name: "Choco Whip", price: 1500, category: "glazing" },
  { name: "Nutella drizzle", price: 900, category: "glazing" },
  { name: "Milky Chocolate fusion", price: 1200, category: "glazing" },
  // Topping
  { name: "Oreo", price: 200, category: "topping" },
  { name: "Lotus", price: 100, category: "topping" },
  { name: "Marshmallows", price: 200, category: "topping" },
  { name: "Twix", price: 300, category: "topping" },
  // Syrup
  { name: "Caramel Syrup", price: 200, category: "syrup" },
  { name: "Chocolate Syrup", price: 300, category: "syrup" },
  { name: "Strawberry Syrup", price: 200, category: "syrup" },
  { name: "Kiwi Syrup", price: 400, category: "syrup" },
  { name: "Pistachio Syrup", price: 600, category: "syrup" },
  { name: "Lotus Syrup", price: 500, category: "syrup" },
  // Drinks
  { name: "Tiger nut drink (Kunun Aya)", price: 1500, category: "drink" },
  { name: "Coconut Milk", price: 2000, category: "drink" },
];

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
      data: [
        { name: "Extra scoop", price: 500, available: true },
        { name: "Waffle cone upgrade", price: 400, available: true },
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
