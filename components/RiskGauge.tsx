"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import type { Verdict } from "@/lib/engine/types";
import { VERDICT_THEME } from "@/lib/format";

/**
 * Refined radial arc gauge with an animated count-up. Color tracks the verdict
 * band (green / amber / sentinel-red).
 */
export function RiskGauge({
  score,
  verdict,
  size = 132,
}: {
  score: number;
  verdict: Verdict;
  size?: number;
}) {
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(reduce ? score : 0);
  const raf = useRef<number>(0);
  const theme = VERDICT_THEME[verdict];

  const stroke = 9;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  // Use 270° of the circle as the track.
  const arc = 0.75;
  const dash = c * arc;

  useEffect(() => {
    if (reduce) {
      setDisplay(score);
      return;
    }
    const start = performance.now();
    const dur = 900;
    const from = 0;
    const animate = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from + (score - from) * eased));
      if (t < 1) raf.current = requestAnimationFrame(animate);
    };
    raf.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf.current);
  }, [score, reduce]);

  const progress = (display / 100) * dash;

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-[135deg]"
      >
        {/* track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
        />
        {/* progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={theme.ring}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${progress} ${c}`}
          style={{
            filter: `drop-shadow(0 0 6px ${theme.ring}88)`,
            transition: reduce ? undefined : "stroke 0.3s ease",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-4xl font-semibold tabular-nums ${theme.text}`}>
          {display}
        </span>
        <span className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-white/40">
          risk
        </span>
      </div>
    </div>
  );
}
