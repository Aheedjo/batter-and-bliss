export type PublicTopping = {
  id: string;
  name: string;
  price: number | null;
  category: string;
  imageUrl?: string | null;
  /** Set for platter_topping / platter_drizzle only. */
  stackId?: string | null;
};
