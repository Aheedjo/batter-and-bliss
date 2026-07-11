-- Link platter toppings and drizzles to a specific platter base.
ALTER TABLE "Topping" ADD COLUMN "stackId" TEXT;

ALTER TABLE "Topping"
ADD CONSTRAINT "Topping_stackId_fkey"
FOREIGN KEY ("stackId") REFERENCES "Stack"("id") ON DELETE SET NULL ON UPDATE CASCADE;
