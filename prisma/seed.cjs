/* eslint-disable @typescript-eslint/no-require-imports */
const path = require("node:path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const menuPath = path.join(__dirname, "../lib/data/default-menu.json");
/** Keep in sync with `lib/data/default-menu.json` (single source of truth). */
const { toppings: TOPPINGS, extras: EXTRAS } = require(menuPath);
const STACKS = [
  { name: "~Morado", kind: "pancake", price: 7000 },
  { name: "Regular Pancakes", kind: "pancake", price: 2500 },
  { name: "Chocolate filled Pancakes", kind: "pancake", price: 3000 },
  { name: "White chocolate filled Pancakes", kind: "pancake", price: 3200 },
  { name: "Jam filled Pancakes", kind: "pancake", price: 2800 },
  { name: "Chocolate chip Pancakes", kind: "pancake", price: 3000 },
  { name: "Breakfast Platter", kind: "platter", price: 15000 },
];

function atToday(hours, minutes = 0) {
  const d = new Date();
  d.setHours(hours, minutes, 0, 0);
  return d;
}

function atYesterday(hours, minutes = 0) {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

/** Demo orders for `/admin` overview + orders (re-seeded idempotently via `BB-DEMO-` references). */
function demoOrders() {
  const stackId = "regular";
  const stackName = "Regular Pancakes";
  const base = {
    buyerPhone: "+234 801 000 0000",
    expectedBankSenderName: "Demo customer",
    email: null,
    deliveryAddress: "12 Admiralty Way, Lekki Phase 1, Lagos",
    stackId,
    stackName,
    customization: "Glazing: Classic maple · Toppings: Fresh berries",
    note: "",
    transferReportedAt: null,
  };

  const line = (title, details, lineTotal) => [
    {
      kind: "pancake",
      title,
      details,
      lineTotal,
    },
  ];

  return [
    {
      reference: "BB-DEMO-001",
      status: "pending",
      placedAt: atYesterday(16, 0),
      placedByName: "Chidi Okonkwo",
      total: 5200,
      etaLabel: "Today, 4:30 PM",
      rejectionReason: null,
      summaryLines: line(stackName, "Maple, blueberries", 5200),
      ...base,
    },
    {
      reference: "BB-DEMO-002",
      status: "pending",
      placedAt: atToday(9, 0),
      placedByName: "Aisha Khan",
      total: 7500,
      etaLabel: "Today, 4:30 PM",
      rejectionReason: null,
      summaryLines: line("The Signature Stack", "Strawberry, whipped cream", 7500),
      ...base,
      buyerPhone: "+234 802 111 2233",
    },
    {
      reference: "BB-DEMO-003",
      status: "pending",
      placedAt: atToday(10, 30),
      placedByName: "Marcus Lee",
      total: 6800,
      etaLabel: null,
      rejectionReason: null,
      summaryLines: line(stackName, "Chocolate drizzle", 6800),
      ...base,
    },
    {
      reference: "BB-DEMO-004",
      status: "pending",
      placedAt: atToday(12, 0),
      placedByName: "Sofia Reyes",
      total: 8200,
      etaLabel: "Tomorrow, 11:00 AM",
      rejectionReason: null,
      summaryLines: line("~Morado", "Dubai chocolate glaze", 8200),
      ...base,
      stackId: "morado",
      stackName: "~Morado",
    },
    {
      reference: "BB-DEMO-005",
      status: "pending",
      placedAt: atToday(14, 0),
      placedByName: "Jordan Park",
      total: 5400,
      etaLabel: null,
      rejectionReason: null,
      summaryLines: line(stackName, "Syrup flight", 5400),
      ...base,
    },
    {
      reference: "BB-DEMO-006",
      status: "pending",
      placedAt: atToday(15, 30),
      placedByName: "Taylor Kim",
      total: 6100,
      etaLabel: null,
      rejectionReason: null,
      summaryLines: line(stackName, "Extra butter", 6100),
      ...base,
    },
    {
      reference: "BB-DEMO-007",
      status: "confirmed",
      placedAt: atToday(8, 0),
      placedByName: "Early Bird Cafe",
      total: 9000,
      etaLabel: null,
      rejectionReason: null,
      summaryLines: line(stackName, "Office platter", 9000),
      ...base,
    },
    {
      reference: "BB-DEMO-008",
      status: "confirmed",
      placedAt: atToday(11, 0),
      placedByName: "Ngozi Adeyemi",
      total: 4800,
      etaLabel: null,
      rejectionReason: null,
      summaryLines: line("Jam filled Pancakes", "Berry compote", 4800),
      ...base,
      stackId: "jam-filled",
      stackName: "Jam filled Pancakes",
    },
    {
      reference: "BB-DEMO-009",
      status: "rejected",
      placedAt: atToday(16, 0),
      placedByName: "Demo Rejected",
      total: 3000,
      etaLabel: null,
      rejectionReason: "Kitchen closed for private event — please try Sunday.",
      summaryLines: line(stackName, null, 3000),
      ...base,
    },
    {
      reference: "BB-DEMO-010",
      status: "confirmed",
      placedAt: atYesterday(10, 0),
      placedByName: "Yesterday Confirmed",
      total: 4200,
      etaLabel: null,
      rejectionReason: null,
      summaryLines: line(stackName, "Plain", 4200),
      ...base,
    },
  ];
}

async function main() {
  await prisma.topping.deleteMany({});
  await prisma.topping.createMany({
    data: TOPPINGS.map((t) => ({
      name: t.name,
      price: t.price == null ? null : t.price,
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

  if ((await prisma.stack.count()) === 0) {
    await prisma.stack.createMany({
      data: STACKS.map((s) => ({
        name: s.name,
        kind: s.kind,
        price: s.price,
        available: true,
      })),
    });
  }

  await prisma.shopSetting.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      dailyOrderCap: null,
      orderIntakeEnabled: true,
      orderIntakeScheduleEnabled: true,
      serviceWeekdaysJson: "[3]",
    },
    update: {},
  });

  await prisma.order.deleteMany({
    where: { reference: { startsWith: "BB-DEMO-" } },
  });
  await prisma.order.createMany({
    data: demoOrders().map((o) => ({
      ...o,
      summaryLines: o.summaryLines,
    })),
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
