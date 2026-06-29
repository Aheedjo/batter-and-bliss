import { redirect } from "next/navigation";

/** Legacy route — gift/note is collected on checkout only. */
export default function OrderNotePage() {
  redirect("/order/checkout");
}
