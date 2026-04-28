import type { SVGProps } from "react";

/** Update handles / URLs in one place. */
export const socialProfile = {
  instagram: {
    href: "https://www.instagram.com/batterandbliss",
    handle: "@batterandbliss",
  },
  tiktok: {
    href: "https://www.tiktok.com/@batterandbliss",
    handle: "@batterandbliss",
  },
} as const;

function IconInstagram(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <circle cx="12" cy="12" r="3.75" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconTiktok(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
    </svg>
  );
}

const items = [
  {
    key: "instagram",
    label: "Instagram",
    href: socialProfile.instagram.href,
    handle: socialProfile.instagram.handle,
    Icon: IconInstagram,
  },
  {
    key: "tiktok",
    label: "TikTok",
    href: socialProfile.tiktok.href,
    handle: socialProfile.tiktok.handle,
    Icon: IconTiktok,
  },
] as const;

type Layout = "footer" | "pills";

export function SocialFollowLinks({ layout }: { layout: Layout }) {
  if (layout === "pills") {
    return (
      <div className="mt-10 flex w-full max-w-md flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center sm:gap-4">
        {items.map(({ key, label, href, handle, Icon }) => (
          <a
            key={key}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-1 items-center justify-center gap-2.5 rounded-full border border-order-line bg-order-card px-5 py-3.5 font-sans text-sm text-order-brownInk shadow-soft transition hover:bg-order-bg sm:flex-initial sm:min-w-[200px]"
            aria-label={`${label}: ${handle}`}
          >
            <Icon className="h-5 w-5 shrink-0 opacity-90" />
            <span className="min-w-0 text-left leading-tight">
              <span className="block font-semibold">{label}</span>
              <span className="block text-[12px] font-normal text-order-taupe">
                {handle}
              </span>
            </span>
          </a>
        ))}
      </div>
    );
  }

  return (
    <ul className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
      {items.map(({ key, label, href, handle, Icon }) => (
        <li key={key}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 font-sans text-[13px] text-brand-chocolate transition hover:text-brand-chocolate/85"
            aria-label={`${label}: ${handle}`}
          >
            <Icon className="h-4 w-4 shrink-0 opacity-80 transition group-hover:opacity-100" />
            <span className="font-semibold">{label}</span>
            <span className="text-brand-taupe">{handle}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
