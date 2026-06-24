"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import type { FeedItem } from "@/lib/store";
import { DOMAIN_LABEL, VERDICT_THEME, capitalizeFirst, formatMoney } from "@/lib/format";
import { DomainIcon, LockIcon, ShieldIcon } from "./icons";
import { RiskGauge } from "./RiskGauge";

const EASE = [0.22, 1, 0.36, 1] as const;

export function ReviewPanel({
  item,
  onClose,
  onDecide,
}: {
  item: FeedItem | null;
  onClose: () => void;
  onDecide: (id: string, d: "approved" | "edited" | "blocked") => void;
}) {
  // Close on Escape.
  useEffect(() => {
    if (!item) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [item, onClose]);

  const result = item?.result ?? null;
  const action = item?.action ?? null;
  const theme = result ? VERDICT_THEME[result.verdict] : null;
  const aiCaught =
    !!result &&
    result.escalated &&
    result.modelInvoked &&
    result.guardrailHits.length === 0;

  return (
    <AnimatePresence>
      {item && result && action && theme && (
        <motion.div
          className="fixed inset-0 z-50 flex items-stretch justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Panel */}
          <motion.aside
            className="surface-strong relative z-10 flex h-full w-full max-w-xl flex-col overflow-hidden border-l border-white/10"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.45, ease: EASE }}
            role="dialog"
            aria-modal="true"
            aria-label="Human review panel"
          >
            {/* Header */}
            <div
              className={`flex items-center justify-between border-b border-white/10 px-6 py-4 ${theme.bg}`}
            >
              <div className="flex items-center gap-2.5">
                <span className={`h-5 w-5 ${theme.text}`}>
                  <ShieldIcon />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">
                    Human review required
                  </p>
                  <p className={`text-xs ${theme.text}`}>
                    {result.caughtBy
                      ? `Caught by: ${result.caughtBy}`
                      : theme.label}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-white/50 transition-colors hover:text-white"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
              {/* Action header */}
              <div className="flex items-start gap-3">
                <div
                  className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl border ${theme.border} ${theme.bg} ${theme.text}`}
                >
                  <span className="h-5 w-5">
                    <DomainIcon domain={action.domain} />
                  </span>
                </div>
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <span className="chip h-5 px-2 py-0 text-[0.65rem]">
                      {DOMAIN_LABEL[action.domain]}
                    </span>
                    {!action.reversible && (
                      <span className="inline-flex items-center gap-1 text-[0.65rem] text-white/40">
                        <LockIcon className="h-3 w-3" /> irreversible
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-medium text-white">
                    {action.summary}
                  </h3>
                </div>
              </div>

              {/* AI hero badge — rules clear, the model caught it */}
              {aiCaught && (
                <div className="flex items-center gap-3 rounded-xl border border-indigo/40 bg-indigo/[0.1] px-4 py-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-indigo/20 text-base">
                    🧠
                  </span>
                  <p className="text-sm text-white/85">
                    <span className="font-semibold text-indigo-soft">
                      Every deterministic rule passed.
                    </span>{" "}
                    This was caught by the AI alone — the risk no rulebook
                    encodes.
                  </p>
                </div>
              )}

              {/* Gauge + scores */}
              <div className="surface flex items-center gap-6 p-5">
                <RiskGauge score={result.riskScore} verdict={result.verdict} />
                <div className="space-y-3">
                  <div>
                    <p className="text-[0.65rem] uppercase tracking-[0.14em] text-white/35">
                      Verdict
                    </p>
                    <p className={`text-lg font-semibold ${theme.text}`}>
                      {theme.label}
                    </p>
                  </div>
                  <div>
                    <p className="text-[0.65rem] uppercase tracking-[0.14em] text-white/35">
                      Model confidence
                    </p>
                    <p className="text-sm font-medium text-white/80">
                      {Math.round(result.confidence * 100)}%
                      {result.confidence < 0.6 && (
                        <span className="ml-2 text-review">low → escalated</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Reasoning */}
              <Section title="Why this was flagged">
                <p className="text-sm leading-relaxed text-white/75">
                  {result.reasoning}
                </p>
              </Section>

              {/* Risk factors */}
              {result.riskFactors.length > 0 && (
                <Section title="Risk factors">
                  <div className="flex flex-wrap gap-1.5">
                    {result.riskFactors.map((f, i) => (
                      <span
                        key={i}
                        className="rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-white/70"
                      >
                        {capitalizeFirst(f)}
                      </span>
                    ))}
                  </div>
                </Section>
              )}

              {/* Policy violations */}
              {result.policyViolations.length > 0 && (
                <Section title="Policy violations">
                  <ul className="space-y-1.5">
                    {result.policyViolations.map((v, i) => (
                      <li
                        key={i}
                        className="flex gap-2 rounded-lg border border-sentinel-red/30 bg-sentinel-red/[0.07] px-3 py-2 text-sm text-white/80"
                      >
                        <span className="mt-0.5 text-sentinel-red">▰</span>
                        {v}
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              {/* Deterministic guardrails */}
              {result.guardrailHits.length > 0 && (
                <Section title="Deterministic guardrails fired">
                  <ul className="space-y-1.5">
                    {result.guardrailHits.map((h, i) => (
                      <li
                        key={i}
                        className="rounded-lg border border-indigo/25 bg-indigo/[0.07] px-3 py-2 text-sm"
                      >
                        <span className="font-medium text-indigo-soft">
                          {h.ruleName}
                        </span>
                        <span className="block text-xs text-white/55">
                          {h.detail}
                        </span>
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              {/* Suggested action */}
              {result.suggestedHumanAction && (
                <Section title="Before you approve, verify">
                  <p className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm leading-relaxed text-white/80">
                    {result.suggestedHumanAction}
                  </p>
                </Section>
              )}
            </div>

            {/* Decision footer */}
            <div className="border-t border-white/10 bg-ink-800/80 px-6 py-4">
              {item.humanDecision ? (
                <p className="text-center text-sm text-white/55">
                  Reviewer{" "}
                  <span className="font-semibold text-white">
                    {item.humanDecision}
                  </span>{" "}
                  this action.
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => onDecide(action.id, "approved")}
                    className="btn border border-allow/40 bg-allow/10 text-allow hover:bg-allow/20"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => onDecide(action.id, "edited")}
                    className="btn-ghost"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDecide(action.id, "blocked")}
                    className="btn border border-sentinel-red/50 bg-sentinel-red/10 text-sentinel-red hover:bg-sentinel-red/20"
                  >
                    Block
                  </button>
                </div>
              )}
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-2 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-white/40">
        {title}
      </p>
      {children}
    </div>
  );
}
