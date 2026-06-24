"use client";

import { Reveal, RevealGroup, RevealItem } from "./Reveal";
import { ShieldIcon } from "./icons";

const STEPS = [
  {
    n: "01",
    title: "Agent acts",
    body: "Your AI agent proposes a real-world action — a payment, a refund, a data export. It never executes directly.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
        <circle cx="12" cy="8" r="3.4" stroke="currentColor" strokeWidth="1.6" />
        <path d="M5 20a7 7 0 0 1 14 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    n: "02",
    title: "Sentinel judges",
    body: "Deterministic guardrails screen the clear cases instantly. The model adjudicates the grey zone. Low confidence always escalates.",
    icon: <ShieldIcon className="h-6 w-6" />,
  },
  {
    n: "03",
    title: "Human owns the risky call",
    body: "Routine actions pass through. Risky ones freeze and surface to a reviewer with full context — approved, edited, or blocked in seconds.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
        <path d="M5 12.5l4.5 4.5L19 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="relative mx-auto max-w-6xl px-6 py-24 md:py-32">
      <Reveal className="mb-14 text-center">
        <p className="label-eyebrow mb-3">How it works</p>
        <h2 className="headline text-4xl text-white md:text-5xl">
          A control layer, not a co-pilot.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-white/60">
          Sentinel sits in the execution path. Three steps, one job: catch the
          risky action before it happens.
        </p>
      </Reveal>

      <RevealGroup className="relative grid gap-5 md:grid-cols-3">
        {/* Connecting line */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-0 right-0 top-[3.4rem] hidden h-px bg-gradient-to-r from-transparent via-indigo/40 to-transparent md:block"
        />
        {STEPS.map((s) => (
          <RevealItem key={s.n}>
            <div className="surface relative h-full p-6">
              <div className="mb-5 flex items-center justify-between">
                <div className="grid h-12 w-12 place-items-center rounded-xl border border-indigo/30 bg-indigo/10 text-indigo-soft">
                  {s.icon}
                </div>
                <span className="font-mono text-sm text-white/25">{s.n}</span>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">
                {s.title}
              </h3>
              <p className="text-sm leading-relaxed text-white/60">{s.body}</p>
            </div>
          </RevealItem>
        ))}
      </RevealGroup>

      {/* Hybrid-engine explainer */}
      <Reveal delay={0.1} className="mt-8">
        <div className="surface flex flex-col items-start gap-6 p-7 md:flex-row md:items-center">
          <div className="flex-1">
            <p className="label-eyebrow mb-2">The hybrid engine</p>
            <p className="text-lg leading-relaxed text-white/80">
              Deterministic guardrails for the clear cases — auditable and
              regulator-proof. The model only for the ambiguous middle. Every
              escalation is labelled with the layer that caught it.
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-2">
            <span className="inline-flex items-center gap-2 rounded-lg border border-indigo/30 bg-indigo/10 px-3 py-2 text-sm text-indigo-soft">
              <span className="h-2 w-2 rounded-full bg-indigo-soft" />
              Layer 1 · Deterministic guardrails
            </span>
            <span className="inline-flex items-center gap-2 rounded-lg border border-review/30 bg-review/10 px-3 py-2 text-sm text-review">
              <span className="h-2 w-2 rounded-full bg-review" />
              Layer 2 · LLM adjudicator (grey zone)
            </span>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
