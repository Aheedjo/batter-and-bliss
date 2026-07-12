import { notFound, redirect } from "next/navigation";
import { cuidSchema } from "@/lib/validations/ids";

/** Legacy URL — packing slips now open in a modal on the order page. */
export default async function AdminOrderReceiptRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!cuidSchema.safeParse(id).success) notFound();
  redirect(`/admin/orders/${id}`);
}
