"use client";

import { Reveal, RevealGroup, RevealItem } from "./Reveal";

type Layer = {
  tag: string;
  where: string;
  title: string;
  body: string;
  exit: string | null;
  color: string; // border/rail color
};

const LAYERS: Layer[] = [
  {
    tag: "Input",
    where: "Agent runtime",
    title: "An agent proposes an action",
    body: "Each action arrives tagged with the acting agent's identity — the start of a traceable delegation chain (user → agent → action).",
    exit: null,
    color: "#8B7CF0",
  },
  {
    tag: "Layer 0",
    where: "Runtime · before any model",
    title: "Capability scope",
    body: "Is the action inside the agent's least-privilege grant? Is the agent revoked? Enforced in the runtime before anything else runs.",
    exit: "Out of scope or revoked → blocked instantly. No model call.",
    color: "#4BD0E7",
  },
  {
    tag: "Layer 1",
    where: "Server · TypeScript",
    title: "Deterministic guardrails",
    body: "Hard, auditable rules in code: maker-checker thresholds, new-payee limits, blast radius, customer-data protection. 100% explainable.",
    exit: "Any rule fires → escalate with the rule named. No model needed.",
    color: "#6C5CE7",
  },
  {
    tag: "Layer 2",
    where: "Server · gpt-5.4",
    title: "LLM adjudicator",
    body: "The ambiguous middle only. gpt-5.4 (reasoning high) via the OpenAI Responses API with Structured Outputs → a strict, always-valid JSON verdict. A gpt-5.4-mini analyst streams its reasoning over SSE so you watch it think.",
    exit: null,
    color: "#F5A623",
  },
  {
    tag: "Combine",
    where: "Policy-owned",
    title: "Decision combiner",
    body: "Maps the model's score to policy-owned threshold bands and takes the most severe of (scope, guardrail, model). A fail-safe bias governs the edges.",
    exit: "Low confidence, timeout, or malformed output → review. Never auto-approves on doubt.",
    color: "#9AA0B5",
  },
  {
    tag: "Owner",
    where: "Human-in-the-loop",
    title: "Human review",
    body: "Escalations lift into a review panel with the risk gauge, factors, policy violations, delegation chain, and a suggested action — approve, edit, or block.",
    exit: null,
    color: "#33D69F",
  },
  {
    tag: "Record",
    where: "Append-only ledger",
    title: "Audit trail",
    body: "Every verdict and human decision is appended to a SHA-256 hash-chained, exportable log. Altering any row breaks every hash after it.",
    exit: null,
    color: "#9AA0B5",
  },
];

const GUARANTEES = [
  {
    t: "The LLM never holds credentials",
    d: "Identity, runtime, and tool layers are separate (the Auth0 model). The model judges — it never executes the action or holds a token.",
  },
  {
    t: "Server-side only",
    d: "The OpenAI key is read in a single route handler. It never reaches the client bundle — verified at build time.",
  },
  {
    t: "Fail-safe by default",
    d: "Any error, timeout, or low confidence defaults to review. The engine never crashes the demo and never auto-allows by mistake.",
  },
  {
    t: "Deterministic + probabilistic",
    d: "Auditable rules settle the clear cases; the model is reserved for genuine judgment. Each escalation is labelled with the layer that caught it.",
  },
  {
    t: "Scripted stream, live verdict",
    d: "The action stream is pre-authored for a reproducible demo; every risk verdict is judged at runtime. Nothing about the score is hardcoded.",
  },
  {
    t: "Tamper-evident by design",
    d: "The audit log is hash-chained, so the record can be handed to a regulator and independently verified.",
  },
];

const SCHEMA = `// Layer 2 is forced to return this exact shape
// (OpenAI Responses API · Structured Outputs · strict)
{
  verdict:        "allow" | "review" | "block",
  riskScore:      0-100,
  confidence:     0-1,
  riskFactors:    string[],
  policyViolations: string[],
  reasoning:      string,   // 1-2 plain-English sentences
  suggestedHumanAction: string
}

// The runtime returns a combined JudgeResult:
{ ...verdict, guardrailHits[], caughtBy,
  escalated, modelInvoked, failSafe, latencyMs }`;

export function Architecture() {
  return (
    <section
      id="architecture"
      className="relative mx-auto max-w-6xl scroll-mt-24 px-6 py-24 md:py-32"
    >
      <Reveal className="mb-14 max-w-3xl">
        <p className="label-eyebrow mb-3">Architecture</p>
        <h2 className="headline text-4xl text-white md:text-5xl">
          Under the hood: how one action is judged.
        </h2>
        <p className="mt-4 text-white/60">
          A single agent action flows through seven stages. Most are deterministic
          and never touch the model; the model is reserved for the grey zone — and
          a fail-safe bias governs every edge.
        </p>
      </Reveal>

      <div className="grid gap-10 lg:grid-cols-[1.35fr_1fr]">
        {/* Request lifecycle */}
        <RevealGroup className="relative space-y-3">
          {/* vertical connector */}
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-6 left-[1.15rem] top-6 w-px bg-gradient-to-b from-indigo-soft/40 via-white/10 to-white/5"
          />
          {LAYERS.map((l, i) => (
            <RevealItem key={l.title}>
              <div className="relative flex gap-4">
                <div className="relative z-10 mt-1.5 flex flex-col items-center">
                  <span
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full border bg-ink-800 text-[0.7rem] font-bold"
                    style={{ borderColor: `${l.color}88`, color: l.color }}
                  >
                    {i}
                  </span>
                </div>
                <div
                  className="surface flex-1 border-l-2 p-4"
                  style={{ borderLeftColor: l.color }}
                >
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span
                      className="rounded-md px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-[0.1em]"
                      style={{ color: l.color, background: `${l.color}1f` }}
                    >
                      {l.tag}
                    </span>
                    <span className="text-[0.65rem] uppercase tracking-[0.12em] text-white/35">
                      {l.where}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-white">{l.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-white/60">
                    {l.body}
                  </p>
                  {l.exit && (
                    <p className="mt-2.5 flex items-start gap-2 rounded-lg border border-sentinel-red/25 bg-sentinel-red/[0.06] px-3 py-2 text-xs text-sentinel-red/90">
                      <span className="mt-px font-bold">↳</span>
                      {l.exit}
                    </p>
                  )}
                </div>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>

        {/* Guarantees + contract */}
        <div className="space-y-6">
          <Reveal>
            <div className="surface p-5">
              <p className="mb-3 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-indigo-soft/80">
                Architectural guarantees
              </p>
              <div className="space-y-3">
                {GUARANTEES.map((g) => (
                  <div key={g.t} className="border-l border-white/10 pl-3">
                    <p className="text-sm font-semibold text-white">{g.t}</p>
                    <p className="text-[0.8rem] leading-relaxed text-white/55">
                      {g.d}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <div className="surface overflow-hidden">
              <p className="border-b border-white/[0.06] px-4 py-2.5 font-mono text-[0.7rem] text-white/45">
                the data contract
              </p>
              <pre className="overflow-x-auto p-4 font-mono text-[0.68rem] leading-relaxed text-white/70">
                {SCHEMA}
              </pre>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
