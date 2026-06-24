"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useConsole } from "@/lib/store";
import { Logo } from "./Logo";

// The guided arc — synced to real state (each await is a true store operation),
// so captions never desync from what's on screen. Drives the curated 3-beat run.
type Step =
  | { kind: "caption"; text: string; ms: number }
  | { kind: "scroll"; to: string }
  | { kind: "mode"; guided: boolean }
  | { kind: "sentinel"; on: boolean }
  | { kind: "run" };

const STEPS: Step[] = [
  { kind: "scroll", to: "console" },
  { kind: "mode", guided: true },
  {
    kind: "caption",
    text: "AI agents can now move money — pay, refund, wire. Every bank asks the same question: can we trust them to act?",
    ms: 5000,
  },
  { kind: "sentinel", on: false },
  {
    kind: "caption",
    text: "First, watch with no control layer. Sentinel is OFF.",
    ms: 3200,
  },
  { kind: "run" },
  {
    kind: "caption",
    text: "The $25,000 wire executed — irreversible, gone. And a $9,800 fraud sailed straight through, unflagged. A regulator will ask why.",
    ms: 5800,
  },
  { kind: "sentinel", on: true },
  {
    kind: "caption",
    text: "Now switch Sentinel ON — it sits in the execution path and judges every action live with gpt-5.4.",
    ms: 4200,
  },
  { kind: "run" },
  {
    kind: "caption",
    text: "The $25k hit a hard deterministic rule. The $9,800 passed every rule — the AI caught it alone. That's the value a rulebook can't deliver.",
    ms: 6500,
  },
  { kind: "scroll", to: "audit" },
  {
    kind: "caption",
    text: "Every decision is logged — tamper-evident, hash-chained, exportable. Audit-ready for a regulator.",
    ms: 5200,
  },
  {
    kind: "caption",
    text: "Sentinel — the control layer for AI agents that move money.",
    ms: 4200,
  },
];

const CAPTION_STEPS = STEPS.filter((s) => s.kind === "caption").length;

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function GuidedDemo() {
  const active = useConsole((s) => s.guidedActive);
  const setActive = useConsole((s) => s.setGuidedActive);
  const [caption, setCaption] = useState<string>("");
  const [captionIndex, setCaptionIndex] = useState(0);
  const tokenRef = useRef(0);

  useEffect(() => {
    if (!active) return;
    const myToken = ++tokenRef.current;
    const cancelled = () => tokenRef.current !== myToken;

    const wait = (ms: number) =>
      new Promise<void>((resolve) => setTimeout(resolve, ms));

    const finish = () => {
      // Restore the full experience for free exploration.
      const api = useConsole.getState();
      api.setSpeed(1100);
      api.setMode("full");
      api.setGuidedActive(false);
    };

    (async () => {
      const api = useConsole.getState;
      // Snappier pacing for the guided run.
      api().setSpeed(650);
      let capCount = 0;

      for (const step of STEPS) {
        if (cancelled()) return;
        switch (step.kind) {
          case "scroll":
            scrollTo(step.to);
            await wait(700);
            break;
          case "mode":
            api().setMode(step.guided ? "guided" : "full");
            await wait(500);
            break;
          case "sentinel":
            api().setSentinelEnabled(step.on);
            await wait(500);
            break;
          case "run":
            await api().runScenario();
            break;
          case "caption":
            setCaption(step.text);
            setCaptionIndex(++capCount);
            await wait(step.ms);
            break;
        }
      }

      if (!cancelled()) finish();
    })();

    return () => {
      tokenRef.current++; // cancel any in-flight sequence
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const stop = () => {
    tokenRef.current++;
    const api = useConsole.getState();
    api.setSpeed(1100);
    api.pause();
    api.setMode("full");
    setActive(false);
  };

  return (
    <AnimatePresence>
      {active && (
        <>
          {/* Top progress bar */}
          <motion.div
            className="fixed inset-x-0 top-0 z-[70] h-0.5 bg-indigo/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-soft to-indigo"
              animate={{ width: `${(captionIndex / CAPTION_STEPS) * 100}%` }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            />
          </motion.div>

          {/* Caption lower-third */}
          <motion.div
            className="pointer-events-none fixed inset-x-0 bottom-0 z-[70] flex justify-center px-4 pb-7"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="pointer-events-auto w-full max-w-2xl">
              <div className="surface-strong flex items-start gap-4 px-5 py-4 shadow-lift">
                <Logo showWordmark={false} className="mt-0.5" />
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="label-eyebrow">Guided demo</span>
                    <button
                      onClick={stop}
                      className="text-xs text-white/40 transition-colors hover:text-white"
                    >
                      Exit ✕
                    </button>
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={caption}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.35 }}
                      className="text-[0.95rem] leading-relaxed text-white/90"
                    >
                      {caption}
                    </motion.p>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/** Reusable launch button for the guided demo. */
export function GuidedDemoButton({
  className = "",
  label = "Watch the guided demo",
}: {
  className?: string;
  label?: string;
}) {
  const setActive = useConsole((s) => s.setGuidedActive);
  return (
    <button onClick={() => setActive(true)} className={className}>
      <span aria-hidden>▶</span> {label}
    </button>
  );
}
