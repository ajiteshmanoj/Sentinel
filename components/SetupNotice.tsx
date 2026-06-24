"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * Clean, non-crashing handling for a missing OPENAI_API_KEY. The engine still
 * runs deterministic guardrails, so the demo degrades gracefully — but we tell
 * the operator clearly that Layer 2 (the live model) is offline.
 */
export function SetupNotice() {
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/judge")
      .then((r) => r.json())
      .then((d: { hasKey?: boolean }) => {
        if (active) setHasKey(Boolean(d.hasKey));
      })
      .catch(() => {
        if (active) setHasKey(null);
      });
    return () => {
      active = false;
    };
  }, []);

  const show = hasKey === false && !dismissed;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-0 top-0 z-[60] flex justify-center px-4 pt-4"
        >
          <div className="surface-strong flex max-w-2xl items-center gap-4 border-review/30 px-5 py-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-review/15 text-review">
              !
            </span>
            <div className="flex-1 text-sm">
              <p className="font-semibold text-white">
                Live model (Layer 2) is offline
              </p>
              <p className="text-white/55">
                Add <code className="rounded bg-white/10 px-1 font-mono text-xs">OPENAI_API_KEY</code>{" "}
                to <code className="rounded bg-white/10 px-1 font-mono text-xs">.env.local</code>{" "}
                to enable live verdicts. Deterministic guardrails still run.
              </p>
            </div>
            <button
              onClick={() => setDismissed(true)}
              className="text-white/40 transition-colors hover:text-white"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
