-- Baseline schema for PostgreSQL (replaces prior SQLite-only migrations).

CREATE SCHEMA IF NOT EXISTS "public";

CREATE TABLE "Topping" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'topping',
    "price" DOUBLE PRECISION,
    "description" TEXT,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Topping_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Extra" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION,
    "description" TEXT,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Extra_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Stack" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'pancake',
    "price" DOUBLE PRECISION,
    "description" TEXT,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Stack_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ShopSetting" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "dailyOrderCap" INTEGER,
    "orderIntakeEnabled" BOOLEAN NOT NULL DEFAULT true,
    "orderIntakeScheduleEnabled" BOOLEAN NOT NULL DEFAULT true,
    "serviceWeekdaysJson" TEXT NOT NULL DEFAULT '[3]',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShopSetting_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "placedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "placedByName" TEXT NOT NULL,
    "buyerPhone" TEXT NOT NULL,
    "expectedBankSenderName" TEXT NOT NULL,
    "email" TEXT,
    "deliveryAddress" TEXT NOT NULL,
    "stackId" TEXT NOT NULL,
    "stackName" TEXT NOT NULL,
    "customization" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "etaLabel" TEXT,
    "rejectionReason" TEXT,
    "transferReportedAt" TEXT,
    "summaryLines" JSONB,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Order_reference_key" ON "Order"("reference");

INSERT INTO "ShopSetting" ("id", "dailyOrderCap", "orderIntakeEnabled", "orderIntakeScheduleEnabled", "serviceWeekdaysJson", "updatedAt")
VALUES ('default', NULL, true, true, '[3]', CURRENT_TIMESTAMP);
