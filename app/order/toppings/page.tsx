import { redirect } from "next/navigation";

export default function ToppingsRedirectPage() {
  redirect("/order/customize");
}
