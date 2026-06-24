"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Reveal, RevealGroup, RevealItem } from "./Reveal";

const EASE = [0.22, 1, 0.36, 1] as const;

const RINGS = [
  {
    label: "Fintechs & digital banks",
    sub: "agentic money movement",
    stage: "Beachhead",
    size: 168,
    color: "rgba(108,92,231,0.95)",
    fill: "rgba(108,92,231,0.18)",
  },
  {
    label: "Insurance & healthcare",
    sub: "claims & payouts",
    stage: "Expand",
    size: 270,
    color: "rgba(108,92,231,0.55)",
    fill: "rgba(108,92,231,0.08)",
  },
  {
    label: "All enterprise",
    sub: "AI-agent actions",
    stage: "Platform",
    size: 380,
    color: "rgba(108,92,231,0.28)",
    fill: "rgba(108,92,231,0.03)",
  },
];

const CARDS = [
  {
    title: "Irreversible, high-value actions",
    body: "Wires, payouts, and payroll can't be undone. Escalation is obviously worth it.",
  },
  {
    title: "MAS-grade audit & maker-checker",
    body: "Regulators expect auditable controls and segregation of duties. This makes it buy, not build.",
  },
  {
    title: "Risk & compliance buyers with budget",
    body: "Teams that already think in escalation thresholds and false-positive rates — and own the budget.",
  },
  {
    title: "Neutral cross-vendor control plane",
    body: "Banks won't let each agent vendor grade its own homework. They want one independent layer.",
  },
];

const CHIPS = [
  "Audit trail",
  "Compliance posture",
  "Cross-vendor neutrality",
  "Accumulated policy/risk patterns",
];

function WedgeRings() {
  const reduce = useReducedMotion();
  const max = RINGS[RINGS.length - 1].size;

  return (
    <div
      className="relative mx-auto grid place-items-center"
      style={{ width: max, height: max, maxWidth: "100%" }}
    >
      {[...RINGS].reverse().map((ring, i) => {
        const idx = RINGS.length - 1 - i; // original index (outer first here)
        return (
          <motion.div
            key={ring.label}
            className="absolute grid place-items-center rounded-full"
            style={{
              width: ring.size,
              height: ring.size,
              border: `1.5px solid ${ring.color}`,
              background: ring.fill,
              boxShadow: `0 0 60px -20px ${ring.color}`,
            }}
            initial={{ opacity: 0, scale: reduce ? 1 : 0.7 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-15%" }}
            transition={{
              duration: 0.8,
              ease: EASE,
              delay: reduce ? 0 : (RINGS.length - 1 - idx) * 0.18,
            }}
          >
            {/* center ring label */}
            {idx === 0 && (
              <div className="px-4 text-center">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-indigo-soft">
                  {ring.stage}
                </p>
                <p className="mt-1 text-sm font-medium leading-tight text-white">
                  {ring.label}
                </p>
                <p className="text-xs text-white/55">{ring.sub}</p>
              </div>
            )}
          </motion.div>
        );
      })}

      {/* Outer-ring labels positioned at the top of each ring */}
      {RINGS.slice(1).map((ring) => (
        <motion.div
          key={`label-${ring.label}`}
          className="absolute left-1/2 -translate-x-1/2 text-center"
          style={{ top: `calc(50% - ${ring.size / 2}px - 6px)` }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <span className="rounded-full bg-ink-900/80 px-2 py-0.5 text-[0.7rem] font-medium text-white/70 backdrop-blur">
            <span className="text-indigo-soft">{ring.stage}</span> · {ring.label}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

export function Positioning() {
  return (
    <section
      id="positioning"
      className="relative mx-auto max-w-6xl px-6 py-24 md:py-32"
    >
      <Reveal className="mb-14 max-w-3xl">
        <p className="label-eyebrow mb-3">Positioning</p>
        <h2 className="headline text-4xl text-white md:text-5xl">
          Start where the stakes are highest: AI agents that move money.
        </h2>
        <p className="mt-4 text-white/60">
          Start narrow where the pain is sharpest, then expand to a horizontal
          control plane. Beachhead → Expand → Platform.
        </p>
      </Reveal>

      <div className="grid items-center gap-12 lg:grid-cols-2">
        {/* Wedge */}
        <Reveal className="flex justify-center py-8">
          <WedgeRings />
        </Reveal>

        {/* Why here first */}
        <div>
          <RevealGroup className="grid gap-4 sm:grid-cols-2">
            {CARDS.map((c) => (
              <RevealItem key={c.title}>
                <div className="surface h-full p-5">
                  <h3 className="mb-2 text-sm font-semibold text-white">
                    {c.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-white/60">
                    {c.body}
                  </p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </div>

      {/* Build vs buy */}
      <Reveal delay={0.05} className="mt-12">
        <div className="surface relative overflow-hidden p-8">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-indigo/10 blur-3xl" />
          <p className="label-eyebrow mb-3">Build vs buy</p>
          <p className="relative max-w-4xl text-xl font-medium leading-relaxed text-white/85 md:text-2xl">
            “A flag is a sprint. An audit-grade, cross-vendor control layer that
            a regulator will accept is not — and it isn&apos;t their core
            product.”
          </p>
        </div>
      </Reveal>

      {/* Defensibility chips */}
      <Reveal delay={0.1} className="mt-8">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <span className="text-sm font-medium text-white/45">
            Defensibility:
          </span>
          <div className="flex flex-wrap gap-2.5">
            {CHIPS.map((chip) => (
              <span
                key={chip}
                className="chip border-indigo/25 bg-indigo/[0.06] text-indigo-soft"
              >
                {chip}
              </span>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
