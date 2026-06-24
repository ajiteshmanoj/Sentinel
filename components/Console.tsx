"use client";

import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { selectStats, useConsole } from "@/lib/store";
import { ActionCard } from "./ActionCard";
import { AuditTrail } from "./AuditTrail";
import { GuidedDemoButton } from "./GuidedDemo";
import { PolicyPanel } from "./PolicyPanel";
import { ReviewPanel } from "./ReviewPanel";
import { StatsStrip } from "./StatsStrip";
import { Reveal } from "./Reveal";
import { ShieldIcon } from "./icons";

const SPEEDS: { label: string; ms: number }[] = [
  { label: "0.5×", ms: 1900 },
  { label: "1×", ms: 1100 },
  { label: "2×", ms: 550 },
];

function SentinelSwitch() {
  const on = useConsole((s) => s.sentinelEnabled);
  const setOn = useConsole((s) => s.setSentinelEnabled);
  return (
    <button
      onClick={() => setOn(!on)}
      className={`group inline-flex items-center gap-3 rounded-2xl border px-4 py-2.5 transition-all duration-300 ${
        on
          ? "border-indigo/40 bg-indigo/10"
          : "border-sentinel-red/40 bg-sentinel-red/10"
      }`}
      aria-pressed={on}
    >
      <span
        className={`grid h-7 w-7 place-items-center rounded-lg ${
          on ? "text-indigo-soft" : "text-sentinel-red"
        }`}
      >
        <ShieldIcon className="h-5 w-5" />
      </span>
      <span className="text-left">
        <span className="block text-[0.65rem] uppercase tracking-[0.16em] text-white/40">
          Sentinel
        </span>
        <span
          className={`block text-sm font-semibold ${
            on ? "text-white" : "text-sentinel-red"
          }`}
        >
          {on ? "Protecting" : "Switched off"}
        </span>
      </span>
      <span
        className={`relative ml-1 inline-flex h-6 w-11 items-center rounded-full p-0.5 transition-colors ${
          on ? "justify-end bg-indigo" : "justify-start bg-sentinel-red/60"
        }`}
      >
        <span className="h-5 w-5 rounded-full bg-white shadow" />
      </span>
    </button>
  );
}

export function Console() {
  const items = useConsole((s) => s.items);
  const runState = useConsole((s) => s.runState);
  const speedMs = useConsole((s) => s.speedMs);
  const activeReviewId = useConsole((s) => s.activeReviewId);
  const spotlightId = useConsole((s) => s.spotlightId);
  const sentinelOn = useConsole((s) => s.sentinelEnabled);

  const run = useConsole((s) => s.runScenario);
  const pause = useConsole((s) => s.pause);
  const reset = useConsole((s) => s.reset);
  const setSpeed = useConsole((s) => s.setSpeed);
  const setSentinelEnabled = useConsole((s) => s.setSentinelEnabled);
  const openReview = useConsole((s) => s.openReview);
  const closeReview = useConsole((s) => s.closeReview);
  const decide = useConsole((s) => s.decide);

  const stats = useMemo(() => selectStats(items), [items]);
  const activeItem = useMemo(
    () => items.find((it) => it.action.id === activeReviewId) ?? null,
    [items, activeReviewId],
  );

  const running = runState === "running";
  const done = runState === "done";
  const runLabel =
    runState === "running"
      ? "Pause"
      : runState === "done"
        ? sentinelOn
          ? "Run again"
          : "Replay"
        : runState === "paused"
          ? "Resume"
          : sentinelOn
            ? "Run scenario"
            : "Run with Sentinel off";

  return (
    <section id="console" className="relative mx-auto max-w-6xl px-6 py-24 md:py-32">
      <Reveal className="mb-8 text-center">
        <p className="label-eyebrow mb-3">The live console</p>
        <h2 className="headline text-4xl text-white md:text-5xl">
          Watch a poisoned wire get frozen.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-white/60">
          A scripted agent fires real money-movement actions. Watch{" "}
          <span className="text-white/90">gpt-5.4 reason in real time</span> on
          each one — the deterministic rules catch the obvious, the model catches
          the fraud a rulebook never could. Edit any rule and re-run; nothing
          here is hardcoded.
        </p>
        <div className="mt-6">
          <GuidedDemoButton
            className="btn-primary text-base"
            label="Watch the 90-second guided demo"
          />
        </div>
      </Reveal>

      {/* Sentinel on/off + run controls */}
      <Reveal delay={0.05} className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <SentinelSwitch />
        </div>
        <div className="flex items-center gap-3">
          <button onClick={running ? pause : run} className="btn-primary">
            {runLabel}
          </button>
          <button onClick={reset} className="btn-ghost">
            Reset
          </button>
          <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1">
            {SPEEDS.map((s) => (
              <button
                key={s.label}
                onClick={() => setSpeed(s.ms)}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  speedMs === s.ms
                    ? "bg-indigo text-white"
                    : "text-white/50 hover:text-white"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Sentinel-OFF warning band */}
      <AnimatePresence>
        {!sentinelOn && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-sentinel-red/40 bg-sentinel-red/[0.08] px-5 py-4 sm:flex-row sm:items-center">
              <p className="text-sm text-white/80">
                <span className="font-semibold text-sentinel-red">
                  Sentinel is off.
                </span>{" "}
                The agent&apos;s actions execute with no review — watch what slips
                through.
              </p>
              <button
                onClick={() => setSentinelEnabled(true)}
                className="btn border border-indigo/40 bg-indigo/15 text-indigo-soft hover:bg-indigo/25"
              >
                Turn Sentinel on →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <Reveal delay={0.1} className="mb-6">
        <StatsStrip stats={stats} sentinelOff={!sentinelOn} />
      </Reveal>

      {/* Policy (the live-proof beat) */}
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
              paused={runState === "paused"}
              dimmed={spotlightId !== null && spotlightId !== item.action.id}
              onOpenReview={openReview}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Audit trail — the A-1 "audit trails" pillar, made visible */}
      <div id="audit" className="mt-8 scroll-mt-24">
        <AuditTrail />
      </div>

      {/* Done CTA when Sentinel was off */}
      <AnimatePresence>
        {done && !sentinelOn && stats.slippedThrough > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-6"
          >
            <div className="surface flex flex-col items-center gap-4 border-sentinel-red/30 p-7 text-center">
              <p className="text-lg text-white/85">
                <span className="font-semibold text-sentinel-red">
                  {stats.slippedThrough} risky action
                  {stats.slippedThrough === 1 ? "" : "s"}
                </span>{" "}
                executed unchecked — including irreversible money movement.
              </p>
              <button
                onClick={() => setSentinelEnabled(true)}
                className="btn-primary text-base"
              >
                Now turn Sentinel on and run it again →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Review panel */}
      <ReviewPanel item={activeItem} onClose={closeReview} onDecide={decide} />
    </section>
  );
}
