import { notFound } from "next/navigation";
import { OrderDetailClient } from "@/components/admin/order-detail-client";
import {
  formatOrderSlotLabel,
  formatPlacedSubtitle,
} from "@/lib/admin/order-display";
import { orderToAdminDetail } from "@/lib/admin/map-prisma-order";
import { prisma } from "@/lib/db";
import { cuidSchema } from "@/lib/validations/ids";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!cuidSchema.safeParse(id).success) notFound();

  const row = await prisma.order.findUnique({ where: { id } });
  if (!row) notFound();

  const order = orderToAdminDetail(row);
  // eslint-disable-next-line react-hooks/purity -- per-request clock snapshot
  const renderedAtMs = Date.now();
  const placedSubtitle = formatPlacedSubtitle(order.placedAt, renderedAtMs);
  const deliverySlotLabel =
    order.etaLabel ?? formatOrderSlotLabel(order.placedAt, null, renderedAtMs);

  return (
    <OrderDetailClient
      order={order}
      placedSubtitle={placedSubtitle}
      deliverySlotLabel={deliverySlotLabel}
    />
  );
}
