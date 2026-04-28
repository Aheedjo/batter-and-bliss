import type { CSSProperties } from "react";
import Image from "next/image";

type Variant = "marketing" | "order";

const motionSafe =
  "motion-reduce:animate-none will-change-transform";

type Anim =
  | "animate-float-drift"
  | "animate-float-drift-medium"
  | "animate-float-drift-slow"
  | "animate-float-drift-roam";

type FloatPieceProps = {
  src: string;
  width: number;
  height: number;
  className: string;
  anim: Anim;
  /** Negative stagger in seconds (can be fractional). */
  delayS?: number;
};

function FloatPiece({
  src,
  width,
  height,
  className,
  anim,
  delayS = 0,
}: FloatPieceProps) {
  const style: CSSProperties | undefined =
    delayS !== 0 ? { animationDelay: `-${delayS}s` } : undefined;

  return (
    <div className={`${className} ${motionSafe} ${anim}`} style={style}>
      <Image
        src={src}
        alt=""
        width={width}
        height={height}
        className="h-auto w-full object-contain"
        sizes="(max-width: 640px) 112px, 160px"
      />
    </div>
  );
}

/**
 * Line-art decorations from /public (image1–4.png).
 * Motion: faster drift with irregular paths; staggered delays so pieces desync.
 */
export function FloatingBrandDecor({ variant = "marketing" }: { variant?: Variant }) {
  if (variant === "order") {
    return (
      <div
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
        aria-hidden
      >
        <FloatPiece
          src="/image1.png"
          width={433}
          height={577}
          anim="animate-float-drift-medium"
          delayS={1.4}
          className="absolute left-[max(0.25rem,env(safe-area-inset-left))] top-[11%] w-[4.75rem] opacity-[0.32] sm:left-3 sm:top-[13%] sm:w-[6.25rem] sm:opacity-[0.36]"
        />
        <FloatPiece
          src="/image2.png"
          width={447}
          height={559}
          anim="animate-float-drift-slow"
          delayS={4.7}
          className="absolute right-[max(0.25rem,env(safe-area-inset-right))] top-[14%] w-[4.5rem] opacity-[0.3] sm:right-3 sm:top-[12%] sm:w-[6rem] sm:opacity-[0.34]"
        />
        <FloatPiece
          src="/image3.png"
          width={408}
          height={612}
          anim="animate-float-drift-roam"
          delayS={2.3}
          className="absolute bottom-[18%] left-[max(0.25rem,env(safe-area-inset-left))] w-[4.5rem] opacity-[0.28] sm:bottom-[20%] sm:left-4 sm:w-[5.75rem] sm:opacity-[0.32]"
        />
        <FloatPiece
          src="/image4.png"
          width={433}
          height={577}
          anim="animate-float-drift"
          delayS={6.85}
          className="absolute bottom-[14%] right-[max(0.25rem,env(safe-area-inset-right))] w-[4.75rem] opacity-[0.3] sm:bottom-[16%] sm:right-4 sm:w-[6rem] sm:opacity-[0.35]"
        />
      </div>
    );
  }

  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-x-hidden"
      aria-hidden
    >
      <FloatPiece
        src="/image1.png"
        width={433}
        height={577}
        anim="animate-float-drift"
        delayS={0.6}
        className="absolute -right-4 top-24 w-[5.25rem] opacity-[0.28] sm:right-0 sm:top-28 sm:w-[7.5rem] sm:opacity-[0.34]"
      />
      <FloatPiece
        src="/image2.png"
        width={447}
        height={559}
        anim="animate-float-drift-slow"
        delayS={3.6}
        className="absolute -left-6 top-[22rem] w-[4.5rem] opacity-[0.24] sm:-left-2 sm:top-[26rem] sm:w-[6rem] sm:opacity-[0.3]"
      />
      <FloatPiece
        src="/image3.png"
        width={408}
        height={612}
        anim="animate-float-drift-roam"
        delayS={1.15}
        className="absolute -right-8 top-[46rem] w-[5rem] opacity-[0.22] sm:-right-2 sm:top-[50rem] sm:w-[6.5rem] sm:opacity-[0.28]"
      />
      <FloatPiece
        src="/image4.png"
        width={433}
        height={577}
        anim="animate-float-drift-slow"
        delayS={7.2}
        className="absolute -left-4 bottom-32 w-[4.25rem] opacity-[0.2] sm:bottom-40 sm:left-0 sm:w-[5.5rem] sm:opacity-[0.26]"
      />
    </div>
  );
}
