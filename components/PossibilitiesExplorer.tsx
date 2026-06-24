"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Verdict } from "@/lib/engine/types";
import { VERDICT_THEME } from "@/lib/format";
import { Reveal } from "./Reveal";
import {
  AccessIcon,
  CartIcon,
  CheckIcon,
  HealthIcon,
  InfraIcon,
  MarketingIcon,
  ShieldIcon,
  SupportIcon,
  TreasuryIcon,
} from "./icons";

type IconCmp = (p: { className?: string }) => JSX.Element;

interface Example {
  agent: string;
  action: string;
  verdict: Verdict;
  caughtBy: string | null;
}

interface UseCase {
  id: string;
  name: string;
  desc: string;
  Icon: IconCmp;
  tagline: string;
  examples: Example[];
  enforces: string[];
}

const USE_CASES: UseCase[] = [
  {
    id: "fintech",
    name: "Fintech & banking",
    desc: "Agents that pay, refund & wire",
    Icon: TreasuryIcon,
    tagline: "The control layer for agents that move money.",
    examples: [
      {
        agent: "Treasury Agent",
        action: "Wire $25,000 to a 2-day-old account",
        verdict: "block",
        caughtBy: "policy guardrail",
      },
      {
        agent: "Payments Agent",
        action: "Pay $9,800 — just under the approval line",
        verdict: "review",
        caughtBy: "risk model",
      },
    ],
    enforces: [
      "Maker-checker thresholds",
      "New-payee & velocity limits",
      "Fraud-pattern detection",
      "MAS-grade audit trail",
    ],
  },
  {
    id: "devops",
    name: "DevOps & infrastructure",
    desc: "Agents with production access",
    Icon: InfraIcon,
    tagline: "Least-privilege control for agents that touch production.",
    examples: [
      {
        agent: "Ops Agent",
        action: "Delete the production `customers` database",
        verdict: "block",
        caughtBy: "capability scope",
      },
      {
        agent: "Ops Agent",
        action: "Deploy hotfix v2.3.1 to checkout",
        verdict: "allow",
        caughtBy: null,
      },
    ],
    enforces: [
      "Destructive-action denial",
      "Scoped deploy permissions",
      "Instant revocation on compromise",
      "Tamper-evident change log",
    ],
  },
  {
    id: "identity",
    name: "Identity & access",
    desc: "Agents that grant access",
    Icon: AccessIcon,
    tagline: "Stop privilege escalation before it happens.",
    examples: [
      {
        agent: "IT Agent",
        action: "Grant Org Admin to an external contractor",
        verdict: "block",
        caughtBy: "capability scope",
      },
    ],
    enforces: [
      "Privilege-escalation blocks",
      "Delegation-chain provenance",
      "Standard-role provisioning only",
      "Revoke an agent in one click",
    ],
  },
  {
    id: "healthcare",
    name: "Healthcare",
    desc: "Agents touching patient data",
    Icon: HealthIcon,
    tagline: "Guardrails for agents handling patient records and claims.",
    examples: [
      {
        agent: "Records Agent",
        action: "Export 12,000 patient records externally",
        verdict: "block",
        caughtBy: "capability scope",
      },
      {
        agent: "Claims Agent",
        action: "Approve a $14,000 procedure claim",
        verdict: "review",
        caughtBy: "policy guardrail",
      },
    ],
    enforces: [
      "PHI / PII protection",
      "Bulk-access controls",
      "Human sign-off on claims",
      "Tamper-evident audit",
    ],
  },
  {
    id: "insurance",
    name: "Insurance",
    desc: "Agents approving claims & payouts",
    Icon: ShieldIcon,
    tagline: "Human-in-the-loop for agents approving payouts.",
    examples: [
      {
        agent: "Claims Agent",
        action: "Approve a $48,000 payout outside policy",
        verdict: "review",
        caughtBy: "policy guardrail",
      },
    ],
    enforces: [
      "Payout approval limits",
      "Duplicate-claim detection",
      "Fraud-pattern review",
      "Every decision logged",
    ],
  },
  {
    id: "support",
    name: "Customer support",
    desc: "Agents acting on accounts",
    Icon: SupportIcon,
    tagline: "Per-agent caps for agents acting on customer accounts.",
    examples: [
      {
        agent: "Support Agent",
        action: "Issue a $4,000 refund (scoped for $100)",
        verdict: "block",
        caughtBy: "capability scope",
      },
      {
        agent: "Support Agent",
        action: "Close 12,000 customer accounts",
        verdict: "review",
        caughtBy: "policy guardrail",
      },
    ],
    enforces: [
      "Per-agent spend caps",
      "Blast-radius limits",
      "Account-change control",
      "Reviewer context + audit",
    ],
  },
  {
    id: "retail",
    name: "E-commerce & retail",
    desc: "Agents adjusting prices & orders",
    Icon: CartIcon,
    tagline: "Catch runaway pricing and bulk order actions.",
    examples: [
      {
        agent: "Pricing Agent",
        action: "Apply a 90% discount across the full catalog",
        verdict: "review",
        caughtBy: "policy guardrail",
      },
    ],
    enforces: [
      "Price-change limits",
      "Bulk-order review",
      "Inventory-impact checks",
      "Audit of every change",
    ],
  },
  {
    id: "comms",
    name: "Comms & marketing",
    desc: "Agents sending at scale",
    Icon: MarketingIcon,
    tagline: "Hold irreversible, high-blast-radius communications.",
    examples: [
      {
        agent: "Comms Agent",
        action: "Email a breach notice to 50,000 users",
        verdict: "review",
        caughtBy: "policy guardrail",
      },
    ],
    enforces: [
      "Blast-radius limits",
      "Irreversible-send review",
      "Approved-template checks",
      "Send audit log",
    ],
  },
];

function VerdictPill({ verdict }: { verdict: Verdict }) {
  const t = VERDICT_THEME[verdict];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[0.7rem] font-semibold ${t.border} ${t.bg} ${t.text}`}
    >
      {verdict === "allow" ? (
        <CheckIcon className="h-3 w-3" />
      ) : (
        <span className={`h-1.5 w-1.5 rounded-full ${t.dot}`} />
      )}
      {t.label}
    </span>
  );
}

export function PossibilitiesExplorer() {
  const reduce = useReducedMotion();
  const [sel, setSel] = useState(0);
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    if (!auto || reduce) return;
    const id = setInterval(
      () => setSel((s) => (s + 1) % USE_CASES.length),
      4800,
    );
    return () => clearInterval(id);
  }, [auto, reduce]);

  const uc = USE_CASES[sel];

  return (
    <section className="relative mx-auto max-w-6xl px-6 py-24 md:py-32">
      <Reveal className="mb-12 text-center">
        <p className="label-eyebrow mb-3">Use cases</p>
        <h2 className="headline text-4xl text-white md:text-5xl">
          The possibilities are{" "}
          <span className="bg-gradient-to-r from-indigo-soft to-indigo bg-clip-text text-transparent">
            endless.
          </span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-white/60">
          Sentinel governs any AI agent that takes a consequential action — in any
          industry. Tap through a few of the countless ways it&apos;s used.
        </p>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="surface grid overflow-hidden lg:grid-cols-[clamp(260px,30%,320px)_1fr]">
          {/* Left — industry list */}
          <div className="border-b border-white/[0.06] p-4 lg:border-b-0 lg:border-r">
            <div className="mb-2 flex items-center justify-between px-2">
              <span className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-indigo-soft/80">
                Explore
              </span>
              <button
                onClick={() => setAuto((v) => !v)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.65rem] font-medium transition-colors ${
                  auto
                    ? "border-indigo/30 bg-indigo/10 text-indigo-soft"
                    : "border-white/10 text-white/40 hover:text-white/70"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${auto ? "bg-indigo-soft" : "bg-white/30"}`}
                />
                Auto-rotate
              </button>
            </div>

            <div className="flex gap-2 overflow-x-auto lg:flex-col lg:gap-1 lg:overflow-visible">
              {USE_CASES.map((u, i) => {
                const active = i === sel;
                return (
                  <button
                    key={u.id}
                    onClick={() => {
                      setSel(i);
                      setAuto(false);
                    }}
                    className={`flex shrink-0 items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors lg:w-full ${
                      active
                        ? "border-indigo/40 bg-indigo/10"
                        : "border-transparent hover:bg-white/[0.03]"
                    }`}
                  >
                    <span
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${
                        active ? "text-indigo-soft" : "text-white/45"
                      }`}
                    >
                      <u.Icon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0">
                      <span
                        className={`block text-sm font-medium ${active ? "text-white" : "text-white/70"}`}
                      >
                        {u.name}
                      </span>
                      <span className="hidden text-[0.7rem] text-white/40 lg:block">
                        {u.desc}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="mt-3 px-3 text-xs text-indigo-soft/60">And many more…</p>
          </div>

          {/* Right — live panel */}
          <div className="relative min-h-[24rem] p-6 md:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={uc.id}
                initial={{ opacity: 0, y: reduce ? 0 : 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduce ? 0 : -12 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="mb-4 flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-xl border border-indigo/30 bg-indigo/10 text-indigo-soft">
                    <uc.Icon className="h-6 w-6" />
                  </span>
                  <div>
                    <span className="chip h-5 border-indigo/30 bg-indigo/10 px-2 py-0 text-[0.6rem] text-indigo-soft">
                      Live use case
                    </span>
                    <h3 className="mt-1 text-xl font-semibold text-white">
                      {uc.name}
                    </h3>
                  </div>
                </div>

                <p className="mb-5 max-w-xl text-white/65">{uc.tagline}</p>

                {/* Example actions + verdicts */}
                <div className="mb-6 space-y-2.5">
                  {uc.examples.map((ex, i) => {
                    const theme = VERDICT_THEME[ex.verdict];
                    return (
                      <div
                        key={i}
                        className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3 ${theme.border} bg-white/[0.02]`}
                      >
                        <div className="min-w-0">
                          <p className="text-[0.65rem] uppercase tracking-[0.12em] text-white/40">
                            User → {ex.agent}
                          </p>
                          <p className="text-sm text-white/85">{ex.action}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <VerdictPill verdict={ex.verdict} />
                          {ex.caughtBy && (
                            <span className="hidden text-[0.7rem] text-white/40 sm:inline">
                              {ex.caughtBy}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* What Sentinel enforces */}
                <p className="mb-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-white/40">
                  What Sentinel enforces here
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {uc.enforces.map((e) => (
                    <div key={e} className="flex items-center gap-2 text-sm text-white/70">
                      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full border border-indigo/30 bg-indigo/10 text-indigo-soft">
                        <CheckIcon className="h-3 w-3" />
                      </span>
                      {e}
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <p className="mt-8 text-center text-sm font-medium text-indigo-soft/70">
          One control plane. Any agent. Any action.
        </p>
      </Reveal>
    </section>
  );
}
