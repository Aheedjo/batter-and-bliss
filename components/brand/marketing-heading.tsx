type Props = {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "center" | "left";
  className?: string;
};

export function MarketingHeading({
  id,
  eyebrow,
  title,
  description,
  align = "center",
  className = "",
}: Props) {
  const alignClass = align === "center" ? "text-center mx-auto" : "text-left";

  return (
    <div className={`${alignClass} ${className}`}>
      {eyebrow ? (
        <p className="mb-2.5 font-sans text-[10px] font-semibold uppercase tracking-[0.24em] text-brand-taupe">
          {eyebrow}
        </p>
      ) : null}
      <h2
        id={id}
        className="font-serif text-[1.85rem] font-semibold leading-[1.12] tracking-[-0.025em] text-brand-chocolate sm:text-[2rem]"
      >
        {title}
      </h2>
      {description ? (
        <p
          className={`mt-3 max-w-md font-sans text-[15px] leading-[1.55] text-brand-taupe ${align === "center" ? "mx-auto" : ""}`}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
