import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Calm, premium fintech palette. Deep near-black canvas.
        ink: {
          900: "#07070C",
          800: "#0B0B14",
          700: "#11111D",
          600: "#181826",
          500: "#222236",
        },
        // Primary accent — deep indigo/violet family.
        indigo: {
          DEFAULT: "#6C5CE7",
          soft: "#8B7CF0",
          deep: "#4B3FB0",
        },
        // Reserved ONLY for blocked / caught actions.
        sentinel: {
          red: "#FF3B5C",
          redDeep: "#C81E3E",
        },
        allow: "#33D69F",
        review: "#F5A623",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        glow: "0 0 40px -10px rgba(108,92,231,0.45)",
        "glow-red": "0 0 50px -8px rgba(255,59,92,0.5)",
        lift: "0 24px 60px -20px rgba(0,0,0,0.7)",
      },
      backgroundImage: {
        "radial-fade":
          "radial-gradient(ellipse at top, rgba(108,92,231,0.18), transparent 60%)",
      },
      transitionTimingFunction: {
        sentinel: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.8)", opacity: "0.6" },
          "100%": { transform: "scale(2.2)", opacity: "0" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
      },
      animation: {
        shimmer: "shimmer 1.6s cubic-bezier(0.22,1,0.36,1) infinite",
        "pulse-ring": "pulse-ring 1.8s ease-out infinite",
        marquee: "marquee 32s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
