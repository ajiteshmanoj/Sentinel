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
a structured verdict. Decisions are made in **three layers** so the escalation logic is
defensible and auditable.

### Layer 0 — Capability scope check · `lib/engine/scope.ts`
Runs in the agent runtime **before any risk assessment or model call**. Each agent holds
an Auth0-style **least-privilege grant** (`lib/agents.ts`); Sentinel confirms the proposed
action falls inside it. A **revoked** agent is denied instantly; an action outside the
grant (wrong domain, wrong type, or over the capability's `maxAmount`) is a **privilege
escalation** and is blocked on sight — no model needed. Emits a deterministic block verdict
labelled `Caught by: capability scope` / `revoked agent`.

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

A second route `POST /api/judge/stream` (Server-Sent Events) lets a viewer **watch the
model reason**: it emits the Layer 1 guardrail result instantly, streams a `gpt-5.4-mini`
narration token-by-token, then sends the authoritative `gpt-5.4` verdict. The narration is
best-effort decoration; the verdict comes from the same verbatim engine and fails safe, so
the stream can never crash the demo (the client falls back to `POST /api/judge` on error).

### Decision combination · `lib/engine/decision.ts`
- Policy-owned threshold bands: `< 30` allow · `30–70` review · `> 70` block.
- Escalate if **any** of: a guardrail fired, the band is review/block, or
  `confidence < 0.6` (low confidence always escalates).
- **Fail-safe bias:** on any API error / malformed output / timeout → default to
  `review`. Never crash, never allow by default. (1 retry, 30s timeout.)
- Emits a **"Caught by:"** label — `capability scope` / `revoked agent` vs
  `policy guardrail` vs `risk model` vs `risk model (low confidence)` — which sells the
  trust story.
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
3. **Agent Permissions** — the Auth0-style least-privilege layer made visible: each agent
   and its bounded grant, with a **live revoke** beat that instantly denies a revoked
   agent's actions (Layer 0 in action).
4. **Audit Trail** — a tamper-evident decision log; every verdict is chained so the record
   can be shown to be unaltered.
5. **How It Works** — 3-step animated diagram (Agent acts → Sentinel judges → Human owns
   the risky call) plus a hybrid-engine explainer.
6. **Possibilities Explorer** — an interactive "the possibilities are endless" panel showing
   the same engine governing **cross-domain** agents/actions (beyond finance — ops, IT,
   data), to make the horizontality legible.
7. **Positioning** — animated wedge rings (Beachhead → Expand → Platform), four
   "why fintech first" cards, the build-vs-buy line, and defensibility chips.
   **No market-size chart**, by design.

There is also a self-running **Guided Demo** mode driven by a credible AI-presenter persona
(floating, narrated walkthrough that auto-scrolls the judged card into view and hits the
live-revocation beat) so the demo explains itself without a human narrating.

Chrome: a floating, shrinking **Navbar** and a "Built with" sponsor-logo marquee.

Polish: GPU-accelerated 60fps motion, `prefers-reduced-motion` fallbacks throughout,
micro-interactions, fully responsive (optimized for a 1440px+ projector).

---

## Scenarios & policy

`lib/scenarios.ts` — 16 scripted actions, fintech-led with a cross-domain tail. The money
core: routine vendor invoice (allow), $20 goodwill refund (allow), **$25k wire to a
2-day-old account (the money moment → block)**, duplicate-flagged payout (review), supplier
bank-detail change (review), $4k out-of-policy refund (review), an intentionally
**ambiguous** $920 invoice (exercises the low-confidence path), reverse a settled
transaction (review), payroll bank-detail change (review), routine payroll run (allow),
full DB export (block), 12k-user marketing blast (review). The **cross-domain** tail
(`access`, `infrastructure`, `data`) proves the same engine governs non-money agents too —
including out-of-scope / revoked actions caught by **Layer 0** before any model runs.

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
  api/judge/stream/route.ts   # POST = SSE: guardrails + live narration + verdict
lib/
  engine/
    types.ts                  # shared contract (no `any`)
    config.ts                 # locked models + policy thresholds
    prompt.ts                 # verbatim Layer 2 system prompt
    scope.ts                  # Layer 0 (capability / revocation scope check)
    guardrails.ts             # Layer 1
    adjudicator.ts            # Layer 2 (Responses API + Structured Outputs) + narration
    decision.ts               # combination + fail-safe
  agents.ts                   # Auth0-style agent identities + least-privilege grants
  scenarios.ts, policy.ts, store.ts, format.ts
components/
  Hero, AmbientBackground, GlyphField, Logo, brand, Navbar, BuiltWith, Reveal,
  Console, ActionCard, ReviewPanel, RiskGauge, StatsStrip, PolicyPanel,
  AgentsPanel, AuditTrail, GuidedDemo, PossibilitiesExplorer, HowItWorks,
  Positioning, SetupNotice, Footer, icons
```

---

## Work completed this session

1. Scaffolded the project (Next 14, TS strict, Tailwind, Framer Motion, Zustand, openai SDK).
2. Built the hybrid engine and verified every guardrail verdict end-to-end.
3. Built all screens with the full animation/polish pass and reduced-motion fallbacks.
4. Deployed to Vercel; set `OPENAI_API_KEY`; verified the live `gpt-5.4` engine in production.
5. Connected the GitHub repo to Vercel for push-to-deploy.
6. Console polish round: removed the "view raw model response" affordance, froze the
   assessing scan-beam while paused, and sentence-cased risk-factor tags.
7. Added **Layer 0** — an Auth0-style agent-permission model (`lib/agents.ts` + `scope.ts`)
   with a live-revocation beat: revoked/out-of-scope actions are blocked before any model call.
8. Closed rubric gaps: a tamper-evident **Audit Trail** and a self-running **Guided Demo**
   with an AI-presenter persona; made OpenAI visible via **live streamed reasoning**
   (`/api/judge/stream`).
9. Showed **horizontality** — cross-domain agents/actions and a **Possibilities Explorer** —
   proving the same engine works beyond finance.
10. Chrome/polish: floating shrinking navbar, "Built with" logo marquee, animated glyph
    background.

## Known follow-ups

- **Rotate the OpenAI key** — it was pasted in plaintext during setup. It is **not** in
  the GitHub repo (`.env.local` is gitignored), but rotate it before long-term use, then
  update it on Vercel.
- Optional secondary `gpt-5.4-mini` "explain to reviewer" summary is specced but not built.
