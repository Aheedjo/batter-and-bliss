import { ArrowLeft } from "lucide-react";
import Link from "next/link";

type Props = {
  href: string;
  children: React.ReactNode;
};

export function FlowNavBack({ href, children }: Props) {
  return (
    <Link
      href={href}
      className="group mb-7 inline-flex items-center gap-1.5 font-sans text-[12px] font-medium tracking-[0.01em] text-order-taupe transition hover:text-order-brown"
    >
      <ArrowLeft
        className="h-4 w-4 shrink-0 stroke-[2.25] text-order-brown/85 transition group-hover:text-order-brown"
        aria-hidden
      />
      {children}
    </Link>
  );
}
