"use client";

type Props = {
  children: React.ReactNode;
};

export function StickyAction({ children }: Props) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-order-line/80 bg-order-bg/90 px-5 py-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-dock backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto w-full max-w-lg">{children}</div>
    </div>
  );
}
