-- Configurable fee for personalized box messages at checkout.
ALTER TABLE "ShopSetting" ADD COLUMN "boxNoteFee" INTEGER NOT NULL DEFAULT 500;
