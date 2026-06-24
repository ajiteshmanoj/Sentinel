"use client";

import { motion, useReducedMotion } from "framer-motion";

// Faint, slow-drifting field of money / transaction marks behind the hero.
// Subtle texture (very low opacity), GPU transforms only. Deterministic
// positions so there's no hydration mismatch.
type Glyph = {
  c: string;
  x: number; // %
  y: number; // %
  size: number; // px
  o: number; // opacity
  dur: number; // drift seconds
  delay: number;
  mono?: boolean;
};

const GLYPHS: Glyph[] = [
  { c: "$", x: 7, y: 22, size: 40, o: 0.07, dur: 9, delay: 0 },
  { c: "€", x: 88, y: 18, size: 32, o: 0.06, dur: 11, delay: 1.4 },
  { c: "£", x: 16, y: 72, size: 30, o: 0.05, dur: 10, delay: 0.6 },
  { c: "¥", x: 80, y: 74, size: 36, o: 0.06, dur: 12, delay: 2.1 },
  { c: "$", x: 94, y: 48, size: 26, o: 0.05, dur: 8, delay: 0.9 },
  { c: "₿", x: 4, y: 50, size: 28, o: 0.05, dur: 10, delay: 1.8 },
  { c: "WIRE", x: 24, y: 32, size: 14, o: 0.05, dur: 13, delay: 0.3, mono: true },
  { c: "PAY", x: 70, y: 30, size: 14, o: 0.05, dur: 11, delay: 1.1, mono: true },
  { c: "REFUND", x: 30, y: 84, size: 13, o: 0.045, dur: 12, delay: 2.4, mono: true },
  { c: "PAYOUT", x: 66, y: 86, size: 13, o: 0.045, dur: 10, delay: 0.5, mono: true },
  { c: "→", x: 50, y: 14, size: 30, o: 0.05, dur: 9, delay: 1.6 },
  { c: "→", x: 12, y: 40, size: 22, o: 0.045, dur: 8, delay: 0.2 },
  { c: "%", x: 86, y: 60, size: 26, o: 0.05, dur: 11, delay: 1.3 },
  { c: "$", x: 40, y: 90, size: 28, o: 0.05, dur: 10, delay: 2.0 },
  { c: "€", x: 58, y: 64, size: 22, o: 0.04, dur: 9, delay: 0.8 },
  { c: "TRANSFER", x: 78, y: 44, size: 12, o: 0.04, dur: 13, delay: 1.9, mono: true },
];

export function GlyphField() {
  const reduce = useReducedMotion();
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{
        maskImage:
          "radial-gradient(ellipse 60% 55% at 50% 42%, transparent, black 80%)",
        WebkitMaskImage:
          "radial-gradient(ellipse 60% 55% at 50% 42%, transparent, black 80%)",
      }}
    >
      {GLYPHS.map((g, i) => (
        <motion.span
          key={i}
          className={`absolute select-none ${g.mono ? "font-mono tracking-[0.2em]" : "font-semibold"}`}
          style={{
            left: `${g.x}%`,
            top: `${g.y}%`,
            fontSize: g.size,
            color: i % 3 === 0 ? "rgba(139,124,240,1)" : "rgba(255,255,255,1)",
            opacity: g.o,
          }}
          animate={reduce ? {} : { y: [0, -14, 0], opacity: [g.o, g.o * 1.6, g.o] }}
          transition={{
            duration: g.dur,
            repeat: Infinity,
            ease: "easeInOut",
            delay: g.delay,
          }}
        >
          {g.c}
        </motion.span>
      ))}
    </div>
  );
}
