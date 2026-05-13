import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        /** Pastel pink, kraft, chocolate — aligned with @batterandbliss IG */
        brand: {
          bg: "#FDF5F7",
          bgDeep: "#FCE9EF",
          chocolate: "#2E1A14",
          taupe: "#8B7570",
          card: "#FFFBFA",
          rose: "#E8B4BC",
          roseDeep: "#C77B8A",
          kraft: "#D4B896",
        },
        order: {
          bg: "#FDF2F5",
          bgAlt: "#FFF5F8",
          cream: "#FFFAFB",
          brown: "#4A3838",
          brownBtn: "#6B4349",
          brownDark: "#3E2C2C",
          brownInk: "#2C1816",
          taupe: "#7D6E6E",
          muted: "#9A8588",
          line: "rgba(232, 180, 195, 0.5)",
          orange: {
            bg: "#F9E8E4",
            text: "#9A4D3C",
            dot: "#C96B5A",
          },
          /** Warm sage — readable “success” without cool emerald clash */
          confirmed: {
            bg: "#E9EFE8",
            accent: "#CEDDCE",
            ink: "#2F3E31",
          },
          red: {
            bg: "#FCE8E8",
            text: "#A93226",
            border: "#E6B8B4",
            deep: "#922B21",
          },
          card: "#FFFBFA",
          beige: "#EDDED6",
          beigeActive: "#E5D1C8",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        brand: ["var(--font-brand-script)", "cursive"],
      },
      boxShadow: {
        soft:
          "0 1px 0 rgba(255,255,255,0.7) inset, 0 4px 24px rgba(90,52,60,0.06), 0 1px 2px rgba(90,52,60,0.04)",
        lift: "0 12px 40px rgba(90,52,60,0.09), 0 2px 8px rgba(90,52,60,0.05)",
        dock: "0 -8px 32px rgba(107,67,73,0.08), 0 -1px 0 rgba(107,67,73,0.06)",
        card: "0 4px 24px rgba(90,52,60,0.05), 0 1px 0 rgba(255,255,255,0.85) inset",
        "order-btn":
          "0 10px 28px rgba(107, 62, 73, 0.22), 0 2px 8px rgba(107, 62, 73, 0.08)",
        "order-btn-lg":
          "0 12px 36px rgba(107, 62, 73, 0.22), 0 4px 12px rgba(107, 62, 73, 0.1)",
        "brand-btn":
          "0 10px 28px rgba(46, 26, 20, 0.2), 0 2px 8px rgba(46, 26, 20, 0.08)",
        "order-progress": "0 0 0 2px rgba(107, 62, 73, 0.14)",
        "order-progress-sm": "0 0 0 3px rgba(107, 62, 73, 0.14)",
      },
      keyframes: {
        /** Irregular stops so motion feels less predictable */
        floatDrift: {
          "0%, 100%": { transform: "translate3d(0, 0, 0) rotate(-2.8deg)" },
          "22%": { transform: "translate3d(8px, -14px, 0) rotate(3.2deg)" },
          "48%": { transform: "translate3d(-6px, 10px, 0) rotate(-2deg)" },
          "71%": { transform: "translate3d(10px, 6px, 0) rotate(3.8deg)" },
        },
        floatDriftSlow: {
          "0%, 100%": { transform: "translate3d(0, 0, 0) rotate(2.2deg)" },
          "18%": { transform: "translate3d(-12px, 8px, 0) rotate(-3.4deg)" },
          "44%": { transform: "translate3d(6px, 16px, 0) rotate(2deg)" },
          "68%": { transform: "translate3d(-8px, -10px, 0) rotate(-3deg)" },
        },
        floatDriftRoam: {
          "0%, 100%": { transform: "translate3d(0, 0, 0) rotate(-2deg)" },
          "17%": { transform: "translate3d(14px, -12px, 0) rotate(4.2deg)" },
          "38%": { transform: "translate3d(-10px, -6px, 0) rotate(-3.6deg)" },
          "58%": { transform: "translate3d(8px, 14px, 0) rotate(3deg)" },
          "82%": { transform: "translate3d(-14px, 4px, 0) rotate(-4deg)" },
        },
        marqueeX: {
          from: { transform: "translate3d(0, 0, 0)" },
          to: { transform: "translate3d(-50%, 0, 0)" },
        },
        marqueeXRev: {
          from: { transform: "translate3d(-50%, 0, 0)" },
          to: { transform: "translate3d(0, 0, 0)" },
        },
        menuSheetIn: {
          from: { transform: "translate3d(0, 100%, 0)" },
          to: { transform: "translate3d(0, 0, 0)" },
        },
        menuBackdropIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
      animation: {
        "float-drift":
          "floatDrift 6.8s cubic-bezier(0.42, 0, 0.58, 1) infinite",
        "float-drift-medium":
          "floatDrift 8.2s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite",
        "float-drift-slow":
          "floatDriftSlow 9.6s cubic-bezier(0.4, 0, 0.2, 1) infinite",
        "float-drift-roam":
          "floatDriftRoam 11.4s cubic-bezier(0.42, 0, 0.58, 1) infinite",
        "marquee-slow":
          "marqueeX 165s linear infinite",
        "marquee-slow-reverse": "marqueeXRev 158s linear infinite",
        "marquee-slower": "marqueeX 180s linear infinite",
        "marquee-slower-reverse": "marqueeXRev 172s linear infinite",
        "marquee-slowest": "marqueeX 198s linear infinite",
        "marquee-slowest-reverse": "marqueeXRev 190s linear infinite",
        "menu-sheet-in":
          "menuSheetIn 0.38s cubic-bezier(0.22, 1, 0.36, 1) both",
        "menu-backdrop-in":
          "menuBackdropIn 0.28s ease-out both",
      },
    },
  },
  plugins: [],
} satisfies Config;
