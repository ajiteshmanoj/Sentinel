"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { FeedItem } from "@/lib/store";
import type { AgentAction } from "@/lib/engine/types";
import {
  DOMAIN_LABEL,
  VERDICT_THEME,
  capitalizeFirst,
  formatMoney,
} from "@/lib/format";
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

/** Short, concrete facts strip for the dramatic catch banner. */
function catchFacts(action: AgentAction): string {
  const p = action.payload;
  const parts: string[] = [];
  if (typeof p.monetaryValue === "number")
    parts.push(formatMoney(p.monetaryValue, (p.currency as string) ?? "USD"));
  if (!action.reversible) parts.push("irreversible");
  if (typeof p.recipientAccountAgeDays === "number" && p.recipientAccountAgeDays <= 30)
    parts.push(`account opened ${p.recipientAccountAgeDays} days ago`);
  if (typeof p.affectedCount === "number" && p.affectedCount > 1000)
    parts.push(`${p.affectedCount.toLocaleString()} customers`);
  return parts.join(" · ");
}

/** What the agent is "doing" while being assessed (raises the stakes). */
function executingLabel(action: AgentAction): string {
  const p = action.payload;
  const amount =
    typeof p.monetaryValue === "number"
      ? formatMoney(p.monetaryValue, (p.currency as string) ?? "USD")
      : null;
  const to = typeof p.recipient === "string" ? p.recipient : null;
  if (amount && to) return `Authorizing ${amount} → ${to}`;
  if (amount) return `Authorizing ${amount}`;
  if (action.domain === "data") return "Preparing data export…";
  if (action.domain === "marketing") return "Queueing send…";
  return "Executing action…";
}

export function ActionCard({
  item,
  index,
  paused = false,
  dimmed = false,
  onOpenReview,
}: {
  item: FeedItem;
  index: number;
  paused?: boolean;
  dimmed?: boolean;
  onOpenReview: (id: string) => void;
}) {
  const reduce = useReducedMotion();
  const { action, status, result, offOutcome, streamedReasoning, humanDecision } =
    item;
  const verdict = result?.verdict;
  const theme = verdict ? VERDICT_THEME[verdict] : null;

  const assessing = status === "assessing";
  const beamActive = assessing && !paused;
  const blocked = verdict === "block";
  const executed = status === "executed";
  const offDanger = executed && offOutcome?.dangerous;
  // The AI hero moment: escalated with NO deterministic rule firing → the model
  // alone caught it. This is the value rules can't deliver, made visible.
  const aiCaught =
    !!result &&
    result.escalated &&
    result.modelInvoked &&
    result.guardrailHits.length === 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      animate={{
        opacity: dimmed ? 0.35 : 1,
        y: 0,
        scale: blocked && !dimmed && !reduce ? 1.01 : dimmed ? 0.99 : 1,
        filter: dimmed ? "saturate(0.5)" : "saturate(1)",
      }}
      transition={{ duration: 0.5, ease: EASE }}
      className={`surface relative overflow-hidden p-5 transition-shadow duration-500 ${
        blocked
          ? "border-sentinel-red/70 shadow-glow-red"
          : offDanger
            ? "border-sentinel-red/50"
            : theme
              ? `${theme.border} ${theme.glow}`
              : "border-white/[0.07]"
      }`}
    >
      {/* Executing progress bar (Sentinel ON, assessing) */}
      {assessing && (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-0.5 bg-white/[0.06]">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-soft to-indigo"
            initial={{ width: "6%" }}
            animate={beamActive ? { width: "94%" } : {}}
            transition={{
              duration: beamActive ? 1.5 : 0,
              ease: "easeInOut",
            }}
          />
        </div>
      )}

      {/* Assessing scan beam — frozen while paused */}
      {assessing && !reduce && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-[5]"
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
        </motion.div>
      )}

      {/* Block flare — the catch */}
      {blocked && !reduce && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[6]"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255,59,92,0.45), transparent)",
          }}
        />
      )}

      {/* FROZEN banner — the money moment */}
      {blocked && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="relative z-10 mb-4 flex items-center gap-3 rounded-xl border border-sentinel-red/50 bg-sentinel-red/[0.12] px-4 py-3"
        >
          <motion.span
            className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-sentinel-red/20 text-sentinel-red"
            animate={reduce ? {} : { scale: [1, 1.18, 1] }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <LockIcon className="h-4 w-4" />
          </motion.span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-sentinel-red">
              Sentinel froze this {action.headline ? "wire" : "action"}
            </p>
            <p className="truncate text-xs text-white/70">{catchFacts(action)}</p>
          </div>
        </motion.div>
      )}

      {/* OFF-mode "money gone" banner */}
      {offDanger && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="relative z-10 mb-4 flex items-center gap-3 rounded-xl border border-sentinel-red/40 bg-sentinel-red/[0.08] px-4 py-3"
        >
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-sentinel-red/15 text-sentinel-red">
            !
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white">
              {offOutcome?.label}
            </p>
            <p className="truncate text-xs text-sentinel-red/90">
              Sentinel would have{" "}
              {offOutcome?.wouldHaveBeen === "block" ? "blocked" : "held"} this —
              but it was switched off.
            </p>
          </div>
        </motion.div>
      )}

      <div className="relative z-[7] flex items-start gap-4">
        {/* Domain icon */}
        <div
          className={`mt-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-xl border ${
            blocked || offDanger
              ? "border-sentinel-red/50 bg-sentinel-red/10 text-sentinel-red"
              : theme
                ? `${theme.border} ${theme.bg} ${theme.text}`
                : "border-white/10 bg-white/[0.03] text-indigo-soft"
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
                  {paused ? "Paused" : "Executing…"}
                </span>
              )}
              {status === "queued" && (
                <span className="text-xs text-white/30">queued</span>
              )}
              {executed && (
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
                    offDanger
                      ? "border-sentinel-red/50 bg-sentinel-red/10 text-sentinel-red"
                      : "border-white/15 bg-white/[0.05] text-white/60"
                  }`}
                >
                  {offDanger ? "Money gone" : "Executed"}
                </span>
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

          {/* Executing label + live AI narration while assessing */}
          {assessing && (
            <div className="mt-3 space-y-2.5">
              <p className="font-mono text-xs text-indigo-soft/80">
                {paused
                  ? "Paused mid-flight — Sentinel is holding execution."
                  : `${executingLabel(action)}…`}
              </p>
              {!paused && (
                <div className="rounded-xl border border-indigo/20 bg-indigo/[0.05] p-3">
                  <p className="mb-1.5 flex items-center gap-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-indigo-soft/80">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-soft opacity-70" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-indigo-soft" />
                    </span>
                    Sentinel is reasoning · gpt-5.4-mini
                  </p>
                  <p className="text-sm leading-relaxed text-white/75">
                    {streamedReasoning || (
                      <span className="text-white/40">Analyzing the action…</span>
                    )}
                    {streamedReasoning && !reduce && (
                      <span className="ml-0.5 inline-block h-3.5 w-1.5 translate-y-0.5 animate-pulse bg-indigo-soft/80" />
                    )}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="mt-4">
            <PayloadFacts action={action} />
          </div>

          {/* Resolved detail (Sentinel ON) */}
          {result && (
            <div className="mt-4 space-y-3">
              {/* The AI hero badge: rules all clear, the model caught it. */}
              {aiCaught && (
                <div className="flex items-center gap-2.5 rounded-xl border border-indigo/40 bg-indigo/[0.1] px-3.5 py-2.5">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-indigo/20 text-sm">
                    🧠
                  </span>
                  <p className="text-sm text-white/85">
                    <span className="font-semibold text-indigo-soft">
                      Every deterministic rule passed.
                    </span>{" "}
                    The AI caught this one — no rulebook would.
                  </p>
                </div>
              )}

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
                      className={`btn h-8 px-3 py-0 text-xs ${
                        blocked
                          ? "border border-sentinel-red/50 bg-sentinel-red/10 text-sentinel-red hover:bg-sentinel-red/20"
                          : "btn-ghost"
                      }`}
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
