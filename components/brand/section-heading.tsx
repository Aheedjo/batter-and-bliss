type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
  italic?: boolean;
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  italic = false,
  className = "",
}: Props) {
  return (
    <div className={className}>
      {eyebrow ? (
        <p className="mb-2.5 font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-order-muted">
          {eyebrow}
        </p>
      ) : null}
      <h1
        className={`max-w-[20ch] font-serif text-[1.85rem] leading-[1.12] tracking-[-0.025em] text-order-brownInk sm:text-[2.1rem] ${
          italic
            ? "font-medium italic"
            : "font-semibold"
        }`}
      >
        {title}
      </h1>
      {description ? (
        <p className="mt-3 max-w-md font-sans text-[15px] font-normal leading-[1.55] text-order-taupe">
          {description}
        </p>
      ) : null}
    </div>
  );
}
