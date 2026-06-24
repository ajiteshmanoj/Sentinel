"use client";

import { useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import { selectStats, useConsole } from "@/lib/store";
import { ActionCard } from "./ActionCard";
import { PolicyPanel } from "./PolicyPanel";
import { ReviewPanel } from "./ReviewPanel";
import { StatsStrip } from "./StatsStrip";
import { Reveal } from "./Reveal";

const SPEEDS: { label: string; ms: number }[] = [
  { label: "0.5×", ms: 1900 },
  { label: "1×", ms: 1100 },
  { label: "2×", ms: 550 },
];

export function Console() {
  const items = useConsole((s) => s.items);
  const runState = useConsole((s) => s.runState);
  const speedMs = useConsole((s) => s.speedMs);
  const activeReviewId = useConsole((s) => s.activeReviewId);

  const run = useConsole((s) => s.runScenario);
  const pause = useConsole((s) => s.pause);
  const reset = useConsole((s) => s.reset);
  const setSpeed = useConsole((s) => s.setSpeed);
  const openReview = useConsole((s) => s.openReview);
  const closeReview = useConsole((s) => s.closeReview);
  const decide = useConsole((s) => s.decide);

  const stats = useMemo(() => selectStats(items), [items]);
  const activeItem = useMemo(
    () => items.find((it) => it.action.id === activeReviewId) ?? null,
    [items, activeReviewId],
  );

  const running = runState === "running";
  const runLabel =
    runState === "running"
      ? "Running…"
      : runState === "done"
        ? "Run again"
        : runState === "paused"
          ? "Resume"
          : "Run scenario";

  return (
    <section id="console" className="relative mx-auto max-w-6xl px-6 py-24 md:py-32">
      <Reveal className="mb-10 text-center">
        <p className="label-eyebrow mb-3">The live console</p>
        <h2 className="headline text-4xl text-white md:text-5xl">
          Watch a poisoned wire get frozen.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-white/60">
          A scripted agent streams real money-movement actions. Every verdict
          below is judged <span className="text-white/90">live</span> by the
          model — nothing here is hardcoded.
        </p>
      </Reveal>

      {/* Controls */}
      <Reveal delay={0.05} className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={running ? pause : run}
            className="btn-primary"
            disabled={false}
          >
            {running ? "Pause" : runLabel}
          </button>
          <button onClick={reset} className="btn-ghost">
            Reset
          </button>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-1">
          {SPEEDS.map((s) => (
            <button
              key={s.label}
              onClick={() => setSpeed(s.ms)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                speedMs === s.ms
                  ? "bg-indigo text-white"
                  : "text-white/50 hover:text-white"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </Reveal>

      {/* Stats */}
      <Reveal delay={0.1} className="mb-6">
        <StatsStrip stats={stats} />
      </Reveal>

      {/* Policy */}
      <Reveal delay={0.12} className="mb-6">
        <PolicyPanel />
      </Reveal>

      {/* Feed */}
      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {items.map((item, i) => (
            <ActionCard
              key={item.action.id}
              item={item}
              index={i}
              onOpenReview={openReview}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Review panel */}
      <ReviewPanel item={activeItem} onClose={closeReview} onDecide={decide} />
    </section>
  );
}
