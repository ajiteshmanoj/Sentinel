# Sentinel — Project Summary

**The audit-grade control layer for AI agents that move money.**

Sentinel sits between an AI agent and the real-world actions it takes. Before any
action executes, Sentinel judges its risk in real time: routine, in-policy actions
pass straight through; risky, irreversible, or policy-violating ones are **frozen
and escalated to a human** — with full context, a "caught by" provenance label, and
a tamper-evident trail, in seconds.

Positioned around a **fintech / money-movement wedge** (fintechs & digital banks first,
then insurance/healthcare claims, then broader enterprise).

---

## Status at a glance

| | |
|---|---|
| **Live URL** | https://sentinel-sable-nu.vercel.app |
| **GitHub** | https://github.com/ajiteshmanoj/Sentinel (`main`) |
| **Vercel project** | `ajiteshs-projects-93071f5c/sentinel` |
| **Deploy pipeline** | `git push origin main` → Vercel auto-builds & promotes to production |
| **Build state** | Typecheck clean (strict, no `any` in engine path) · production build green |
| **Live engine** | `gpt-5.4` verified working in prod (`modelInvoked: true`, `failSafe: false`) |

---

## The core idea — scripted stream, live verdicts

The architectural distinction the whole demo rests on:

- **The agent action stream is SCRIPTED** (pre-authored scenario files) so the demo is
  100% reproducible.
- **The risk verdict is LIVE and REAL.** Every action — even though its text is
  pre-written — is judged at runtime. Nothing about the score, verdict, or reasoning
  is hardcoded, cached, or faked.

This separation is architecturally clean: scripted data lives in `lib/scenarios.ts`;
the verdict comes only from the engine in `lib/engine/`.

---

## The hybrid risk engine (the heart)

A server route `POST /api/judge` accepts one action + the org's policy rules and returns
a structured verdict. Decisions are made in **two layers** so the escalation logic is
defensible and auditable.

### Layer 1 — Deterministic guardrails · `lib/engine/guardrails.ts`
Hard, auditable rules evaluated in TypeScript **before any model call**. Any hit →
immediate escalation with the rule named. 100% explainable, regulator-proof. Rules:
- New-payee transfer limit (`> $1,000` to an account `≤ 30` days old → block)
- Maker-checker threshold (single payment `> $10,000` → review)
- Banking-detail change control (payout/payroll/bank-account changes → review)
- Refund approval limit (`> $500` → review)
- Irreversible high-value action (irreversible + `> $1,000` → review)
- Customer-data protection (bulk export/delete → block)
- Blast-radius limit (`> 1,000` customers affected → review)

### Layer 2 — LLM adjudicator · `lib/engine/adjudicator.ts`
For the ambiguous middle only. Calls **`gpt-5.4`** (reasoning `high`) via the OpenAI
**Responses API** with **Structured Outputs** (strict JSON schema), so the verdict is
always valid JSON: `verdict`, `riskScore`, `confidence`, `riskFactors`,
`policyViolations`, `reasoning`, `suggestedHumanAction`.

The Layer 2 system prompt (`lib/engine/prompt.ts`) is used **verbatim** — its fail-safe
bias, per-rule policy checking, and proportional scoring are deliberate.

### Decision combination · `lib/engine/decision.ts`
- Policy-owned threshold bands: `< 30` allow · `30–70` review · `> 70` block.
- Escalate if **any** of: a guardrail fired, the band is review/block, or
  `confidence < 0.6` (low confidence always escalates).
- **Fail-safe bias:** on any API error / malformed output / timeout → default to
  `review`. Never crash, never allow by default. (1 retry, 30s timeout.)
- Emits a **"Caught by:"** label — `policy guardrail` vs `risk model` vs
  `risk model (low confidence)` — which sells the trust story.
- Degrades gracefully with **no API key**: guardrails still run; the UI shows a
  non-blocking "live model offline" notice instead of crashing.

---

## The interface

Apple-grade, calm/premium fintech aesthetic. Dark theme, deep indigo/violet accent
(`#6C5CE7`), with **sentinel-red `#FF3B5C` reserved only for blocked/caught actions**.

1. **Landing / Hero** — custom single-stroke shield logotype with a scanning beam,
   cursor-reactive animated gradient-mesh background (lerped parallax, GPU transforms),
   Apple-style scroll reveals, fintech-framed headline ("The control layer for AI agents
   that move money").
2. **The Console (the star)** — live agent action feed; each card animates in, shows a
   "Sentinel is assessing…" scan-beam, then resolves. Allow glides through with a green
   check; review/block freezes and lifts into a **Human Review Panel** (animated radial
   risk gauge + count-up, "Caught by" label, risk-factor tags, highlighted policy
   violations, plain-English reasoning, suggested human action, and **Approve / Edit /
   Block**). Live stats strip, editable policy rules (edit → re-run → verdict changes),
   run/pause/reset, and a speed control.
3. **How It Works** — 3-step animated diagram (Agent acts → Sentinel judges → Human owns
   the risky call) plus a hybrid-engine explainer.
4. **Positioning** — animated wedge rings (Beachhead → Expand → Platform), four
   "why fintech first" cards, the build-vs-buy line, and defensibility chips.
   **No market-size chart**, by design.

Polish: GPU-accelerated 60fps motion, `prefers-reduced-motion` fallbacks throughout,
micro-interactions, fully responsive (optimized for a 1440px+ projector).

---

## Scenarios & policy

`lib/scenarios.ts` — 12 fintech-led scripted actions: routine vendor invoice (allow),
$20 goodwill refund (allow), **$25k wire to a 2-day-old account (the money moment →
block)**, duplicate-flagged payout (review), supplier bank-detail change (review),
$4k out-of-policy refund (review), an intentionally **ambiguous** $920 invoice (exercises
the low-confidence path), reverse a settled transaction (review), payroll bank-detail
change (review), routine payroll run (allow), full DB export (block), 12k-user marketing
blast (review).

`lib/policy.ts` — 5 editable, MAS / maker-checker-flavored default rules. Editing a rule
and re-running visibly changes verdicts, proving the engine genuinely reads the policy.

---

## Tech stack

Next.js 14 (App Router) · TypeScript strict · Tailwind CSS · Framer Motion · Zustand ·
`openai` SDK (Responses API), called **server-side only**. No database — scenarios are
local TS files. The OpenAI key is read only in the route handler and never reaches the
client bundle (`server-only` guards the engine modules).

---

## File map

```
app/
  layout.tsx, globals.css, page.tsx
  api/judge/route.ts          # POST = judge, GET = health/hasKey
lib/
  engine/
    types.ts                  # shared contract (no `any`)
    config.ts                 # locked models + policy thresholds
    prompt.ts                 # verbatim Layer 2 system prompt
    guardrails.ts             # Layer 1
    adjudicator.ts            # Layer 2 (Responses API + Structured Outputs)
    decision.ts               # combination + fail-safe
  scenarios.ts, policy.ts, store.ts, format.ts
components/
  Hero, AmbientBackground, Logo, Reveal, Console, ActionCard, ReviewPanel,
  RiskGauge, StatsStrip, PolicyPanel, HowItWorks, Positioning, SetupNotice,
  Footer, icons
```

---

## Work completed this session

1. Scaffolded the project (Next 14, TS strict, Tailwind, Framer Motion, Zustand, openai SDK).
2. Built the two-layer engine and verified every guardrail verdict end-to-end.
3. Built all four screens with the full animation/polish pass and reduced-motion fallbacks.
4. Deployed to Vercel; set `OPENAI_API_KEY`; verified the live `gpt-5.4` engine in production.
5. Connected the GitHub repo to Vercel for push-to-deploy.
6. Console polish round: removed the "view raw model response" affordance, froze the
   assessing scan-beam while paused, and sentence-cased risk-factor tags.

## Known follow-ups

- **Rotate the OpenAI key** — it was pasted in plaintext during setup. It is **not** in
  the GitHub repo (`.env.local` is gitignored), but rotate it before long-term use, then
  update it on Vercel.
- Optional secondary `gpt-5.4-mini` "explain to reviewer" summary is specced but not built.
