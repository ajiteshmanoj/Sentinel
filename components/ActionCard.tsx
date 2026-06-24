"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { FeedItem } from "@/lib/store";
import type { AgentAction } from "@/lib/engine/types";
import { DOMAIN_LABEL, VERDICT_THEME, capitalizeFirst, formatMoney } from "@/lib/format";
import { CheckIcon, DomainIcon, LockIcon } from "./icons";

const EASE = [0.22, 1, 0.36, 1] as const;

function PayloadFacts({ action }: { action: AgentAction }) {
  const p = action.payload;
  const facts: { label: string; value: string; strong?: boolean }[] = [];

  if (typeof p.monetaryValue === "number") {
    facts.push({
      label: "Amount",
      value: formatMoney(p.monetaryValue, (p.currency as string) ?? "USD"),
      strong: true,
    });
  }
  if (typeof p.recipient === "string") {
    facts.push({ label: "Recipient", value: p.recipient });
  }
  if (typeof p.recipientAccountAgeDays === "number") {
    facts.push({
      label: "Account age",
      value:
        p.recipientAccountAgeDays <= 30
          ? `${p.recipientAccountAgeDays}d (new)`
          : `${p.recipientAccountAgeDays}d`,
      strong: p.recipientAccountAgeDays <= 30,
    });
  }
  if (typeof p.affectedCount === "number") {
    facts.push({
      label: "Affects",
      value: `${p.affectedCount.toLocaleString()}`,
      strong: p.affectedCount > 1000,
    });
  }
  facts.push({
    label: "Reversible",
    value: action.reversible ? "Yes" : "No",
    strong: !action.reversible,
  });

  return (
    <div className="flex flex-wrap gap-x-6 gap-y-2">
      {facts.map((f) => (
        <div key={f.label} className="flex flex-col">
          <span className="text-[0.65rem] uppercase tracking-[0.14em] text-white/35">
            {f.label}
          </span>
          <span
            className={`text-sm ${f.strong ? "font-semibold text-white" : "text-white/70"}`}
          >
            {f.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export function ActionCard({
  item,
  index,
  paused = false,
  onOpenReview,
}: {
  item: FeedItem;
  index: number;
  paused?: boolean;
  onOpenReview: (id: string) => void;
}) {
  const reduce = useReducedMotion();
  const { action, status, result, humanDecision } = item;
  const verdict = result?.verdict;
  const theme = verdict ? VERDICT_THEME[verdict] : null;

  const assessing = status === "assessing";
  // While paused, freeze the in-flight "assessing" animation too.
  const beamActive = assessing && !paused;
  const blocked = verdict === "block";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: EASE }}
      className={`surface relative overflow-hidden p-5 transition-shadow duration-500 ${
        theme ? `${theme.border} ${theme.glow}` : "border-white/[0.07]"
      } ${blocked ? "border-sentinel-red/60" : ""}`}
    >
      {/* Assessing scan beam — frozen while paused */}
      {assessing && !reduce && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-10"
          aria-hidden
        >
          <motion.div
            className="absolute inset-y-0 w-1/3"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(139,124,240,0.28), transparent)",
            }}
            initial={{ x: "-120%" }}
            animate={beamActive ? { x: "320%" } : { x: "-120%" }}
            transition={
              beamActive
                ? { duration: 1.1, repeat: Infinity, ease: "easeInOut" }
                : { duration: 0 }
            }
          />
          <div className="absolute inset-0 border-y border-indigo-soft/20" />
        </motion.div>
      )}

      {/* Block flare */}
      {blocked && !reduce && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.9, 0] }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255,59,92,0.35), transparent)",
          }}
        />
      )}

      <div className="relative flex items-start gap-4">
        {/* Domain icon */}
        <div
          className={`mt-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-xl border ${
            theme ? `${theme.border} ${theme.bg} ${theme.text}` : "border-white/10 bg-white/[0.03] text-indigo-soft"
          }`}
        >
          <span className="h-5 w-5">
            <DomainIcon domain={action.domain} />
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="mb-1 flex items-center gap-2">
                <span className="chip h-5 px-2 py-0 text-[0.65rem]">
                  {DOMAIN_LABEL[action.domain]}
                </span>
                {!action.reversible && (
                  <span className="inline-flex items-center gap-1 text-[0.65rem] font-medium text-white/40">
                    <LockIcon className="h-3 w-3" /> irreversible
                  </span>
                )}
              </div>
              <h3 className="truncate text-[0.95rem] font-medium text-white">
                {action.summary}
              </h3>
            </div>

            {/* Status badge */}
            <div className="shrink-0">
              {assessing && (
                <span className="inline-flex items-center gap-2 rounded-full border border-indigo/30 bg-indigo/10 px-3 py-1 text-xs font-medium text-indigo-soft">
                  <span
                    className={`h-1.5 w-1.5 rounded-full bg-indigo-soft ${
                      paused ? "" : "animate-pulse"
                    }`}
                  />
                  {paused ? "Paused" : "Assessing…"}
                </span>
              )}
              {status === "queued" && (
                <span className="text-xs text-white/30">queued</span>
              )}
              {theme && (
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${theme.border} ${theme.bg} ${theme.text}`}
                >
                  {verdict === "allow" ? (
                    <CheckIcon className="h-3.5 w-3.5" />
                  ) : (
                    <span className={`h-1.5 w-1.5 rounded-full ${theme.dot}`} />
                  )}
                  {theme.label}
                </span>
              )}
            </div>
          </div>

          <div className="mt-4">
            <PayloadFacts action={action} />
          </div>

          {/* Resolved detail */}
          {result && (
            <div className="mt-4 space-y-3">
              {result.caughtBy && (
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[0.7rem] font-medium ${
                      result.caughtBy.startsWith("policy")
                        ? "border-indigo/40 bg-indigo/10 text-indigo-soft"
                        : "border-review/40 bg-review/10 text-review"
                    }`}
                  >
                    Caught by: {result.caughtBy}
                  </span>
                  {result.failSafe && (
                    <span className="chip h-5 border-review/30 px-2 py-0 text-[0.65rem] text-review">
                      fail-safe
                    </span>
                  )}
                </div>
              )}

              <p className="text-sm leading-relaxed text-white/70">
                {result.reasoning}
              </p>

              {result.riskFactors.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {result.riskFactors.map((f, i) => (
                    <span
                      key={i}
                      className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[0.7rem] text-white/60"
                    >
                      {capitalizeFirst(f)}
                    </span>
                  ))}
                </div>
              )}

              {result.escalated && (
                <div className="flex items-center gap-3 pt-1">
                  {humanDecision ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-white/50">
                      <CheckIcon className="h-3.5 w-3.5 text-allow" />
                      Reviewer {humanDecision}
                    </span>
                  ) : (
                    <button
                      onClick={() => onOpenReview(action.id)}
                      className="btn-ghost h-8 px-3 py-0 text-xs"
                    >
                      Open in review panel →
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
