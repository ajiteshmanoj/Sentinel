"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import type { ConsoleStats } from "@/lib/store";

function useCountUp(value: number) {
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);
  const raf = useRef<number>(0);

  useEffect(() => {
    if (reduce) {
      setDisplay(value);
      prev.current = value;
      return;
    }
    const from = prev.current;
    const start = performance.now();
    const dur = 450;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from + (value - from) * eased));
      if (t < 1) raf.current = requestAnimationFrame(step);
      else prev.current = value;
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [value, reduce]);

  return display;
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: string;
}) {
  const display = useCountUp(value);
  return (
    <div className="flex flex-col items-center px-4 py-3 sm:items-start">
      <span className={`text-2xl font-semibold tabular-nums sm:text-3xl ${accent}`}>
        {display}
      </span>
      <span className="mt-0.5 text-[0.7rem] uppercase tracking-[0.14em] text-white/40">
        {label}
      </span>
    </div>
  );
}

export function StatsStrip({
  stats,
  sentinelOff = false,
}: {
  stats: ConsoleStats;
  sentinelOff?: boolean;
}) {
  if (sentinelOff) {
    return (
      <div className="surface grid grid-cols-2 divide-white/[0.06] border-sentinel-red/20 sm:grid-cols-4 sm:divide-x">
        <Stat label="Executed" value={stats.processed} accent="text-white" />
        <Stat label="Reviewed" value={0} accent="text-white/40" />
        <Stat label="Blocked" value={0} accent="text-white/40" />
        <Stat
          label="Slipped through"
          value={stats.slippedThrough}
          accent="text-sentinel-red"
        />
      </div>
    );
  }
  return (
    <div className="surface grid grid-cols-2 divide-white/[0.06] sm:grid-cols-4 sm:divide-x">
      <Stat label="Processed" value={stats.processed} accent="text-white" />
      <Stat label="Auto-approved" value={stats.autoApproved} accent="text-allow" />
      <Stat label="Escalated" value={stats.escalated} accent="text-review" />
      <Stat label="Blocked" value={stats.blocked} accent="text-sentinel-red" />
    </div>
  );
}
