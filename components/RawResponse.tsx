"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import type { JudgeResult } from "@/lib/engine/types";
import { ChevronIcon } from "./icons";

/**
 * "View raw model response" affordance — proves the verdict came from the live
 * model, not a hardcoded value. Shows the raw text the model returned plus the
 * engine metadata (which layer, latency, fail-safe).
 */
export function RawResponse({ result }: { result: JudgeResult }) {
  const [open, setOpen] = useState(false);

  const meta = {
    modelInvoked: result.modelInvoked,
    caughtBy: result.caughtBy,
    latencyMs: result.latencyMs,
    failSafe: result.failSafe,
    confidence: result.confidence,
  };

  return (
    <div className="border-t border-white/[0.06] pt-3">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-xs font-medium text-white/45 transition-colors hover:text-white/75"
      >
        <span className="inline-flex items-center gap-1.5">
          <span className="font-mono text-[0.7rem] text-indigo-soft/70">{`{ }`}</span>
          View raw model response
        </span>
        <ChevronIcon
          className={`h-4 w-4 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-2">
              <pre className="max-h-64 overflow-auto rounded-lg border border-white/[0.06] bg-black/40 p-3 font-mono text-[0.7rem] leading-relaxed text-white/70">
                {result.rawModelResponse ??
                  "(Layer 2 model was not invoked — verdict produced by deterministic guardrails only.)"}
              </pre>
              <pre className="overflow-auto rounded-lg border border-white/[0.06] bg-black/40 p-3 font-mono text-[0.7rem] leading-relaxed text-white/50">
                {JSON.stringify(meta, null, 2)}
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
