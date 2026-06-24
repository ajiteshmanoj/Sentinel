# Sentinel

The audit-grade control layer for AI agents that move money. Sentinel judges
every proposed agent action in real time — routine actions pass through; risky,
irreversible, or policy-violating ones are **frozen and escalated to a human**
with full context and a tamper-evident trail.

## Architecture (the critical distinction)

- **The agent action stream is scripted** (`lib/scenarios.ts`) so the demo is
  100% reproducible.
- **The risk verdict is live and real.** Every action is judged at runtime by a
  two-layer engine. Nothing about the score, verdict, or reasoning is hardcoded
  or cached. Each judged action exposes **"View raw model response"** to prove it.

### The hybrid engine

| Layer | What it does | Where |
|-------|--------------|-------|
| **Layer 1 — Deterministic guardrails** | Hard, auditable rules in TypeScript. Any hit → immediate escalation, no model needed. 100% explainable. | `lib/engine/guardrails.ts` |
| **Layer 2 — LLM adjudicator** | `gpt-5.4` (reasoning `high`) via the OpenAI **Responses API** with **Structured Outputs**, for the ambiguous middle. | `lib/engine/adjudicator.ts` |
| **Decision combination** | Policy-owned threshold bands + fail-safe bias. On any error/timeout → defaults to `review`, never `allow`, never crashes. | `lib/engine/decision.ts` |

Every escalation is labelled with the layer that caught it
(`Caught by: policy guardrail` vs `risk model (low confidence)`).

## Run it

```bash
cp .env.local.example .env.local   # then add your OPENAI_API_KEY
npm install
npm run dev
```

Open the printed URL. Without a key the app still runs the deterministic
guardrails (and shows a clear "Layer 2 offline" notice) — it never crashes.

## Scripts

- `npm run dev` — dev server
- `npm run build` / `npm start` — production
- `npm run typecheck` — strict TypeScript, no `any` in the engine path

The Layer 2 system prompt (`lib/engine/prompt.ts`) is verbatim and deliberate —
the fail-safe bias and per-rule policy checking are load-bearing. Do not soften it.
