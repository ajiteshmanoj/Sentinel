# Sentinel — Pitch Deck (10 slides)

> For the 3-minute on-stage pitch (no Q&A) and the Devpost. 10 slides max. Each slide below has the
> on-screen content + a speaker note + visual direction. Keep slides sparse — you talk, the slide
> reinforces. **No market-size chart anywhere** (by design — it invites the one question you can't
> answer on a no-Q&A stage).

---

## Slide 1 — Title
**Sentinel**
The control layer for AI agents that move money.

`sentinel-sable-nu.vercel.app` · [team / school]

- *Speaker:* "Sentinel is the audit-grade control layer for AI agents that move money."
- *Visual:* the wordmark + shield logo on near-black; one line. Nothing else.

---

## Slide 2 — The problem
**Agents can act. Nobody trusts them to.**

- AI agents can now pay, refund, and wire — real, often **irreversible** actions.
- One wrong move moves money that doesn't come back, and a regulator asks why.
- So capable agents sit unused. **The bottleneck is trust, not capability.**

- *Speaker:* "Every team is building more capable agents. Almost nobody will let one touch money,
  because the bottleneck isn't capability anymore — it's trust."
- *Visual:* an agent → [ ? ] → money. The gap is the product.

---

## Slide 3 — Who feels it most
**Fintechs & digital banks — where the stakes are highest.**

- Actions are high-value and irreversible (wires, payouts, payroll).
- Regulation (e.g. MAS: maker-checker, auditable controls) makes this **buy, not build**.
- The buyer already exists: risk, fraud & compliance teams — with budget.

- *Speaker:* "We start where the pain is sharpest: regulated money movement, where a flag in a
  sprint doesn't survive an audit."
- *Visual:* three icons — irreversible · regulated · budgeted buyer.

---

## Slide 4 — The solution
**Sentinel judges every agent action — live — before it executes.**

- Routine, in-policy actions **pass straight through.**
- Risky, irreversible, or policy-violating actions are **frozen and escalated to a human.**
- Full context + a tamper-evident audit trail, in seconds.

- *Speaker:* "Sentinel sits in the execution path. Safe actions pass; risky ones freeze and go to a
  human — with the context to decide in seconds."
- *Visual:* the console catch moment (a frozen red card lifting into the review panel).

---

## Slide 5 — How it works (beyond a wrapper)
**A hybrid engine — not an LLM wrapper.**

- **Layer 1 — Deterministic guardrails:** auditable rules in code. Clear cases, regulator-proof.
- **Layer 2 — `gpt-5.4` adjudicator:** the grey zone only. Strict JSON, reasoning *high*.
- **Fail-safe bias:** low confidence escalates; any error defaults to *review*. Never auto-approves.
- Every catch is labelled **"Caught by: guardrail"** vs **"risk model."**

- *Speaker:* "Rules for the clear cases, the model for the judgment calls, and a fail-safe that
  escalates when unsure. That's why a regulator can't argue with the escalation logic."
- *Visual:* the two-layer diagram with the "Caught by" labels.

---

## Slide 6 — The moment a rulebook can't catch
**Rules catch the obvious. The AI catches the fraud.**

- $25,000 wire → 2-day-old account → **a hard rule freezes it.**
- **$9,800** payment — just under the $10k line, established vendor, reversible. **Passes every rule.**
- `gpt-5.4` flags it: threshold-shopping + bank details changed last week + "urgent" = invoice
  redirection. **Caught by the model alone.**

- *Speaker:* "This is the whole point. The $9,800 passes every rule. The AI catches it anyway. No
  rulebook encodes that — the model does."
- *Visual:* the $9,800 card with the **"Every deterministic rule passed — the AI caught this"** badge.

---

## Slide 7 — It's live, and you can prove it
**Visible, provable AI.**

- Watch `gpt-5.4-mini` **stream its reasoning** token-by-token as it judges.
- **Edit any rule or threshold, re-run** → the verdict and "Caught by" label change live.
- Every decision → **tamper-evident, SHA-256 hash-chained audit trail**, exportable.

- *Speaker:* "Nothing here is hardcoded. Change the policy and the verdict changes. And every
  decision is logged in an audit trail a regulator would accept."
- *Visual:* split — streaming reasoning + the audit-trail ledger with the export button.

---

## Slide 8 — Why fintech first (sequencing + moat)
**Beachhead → Expand → Platform.**

- **Beachhead:** fintechs & digital banks — agentic money movement.
- **Expand:** insurance & healthcare claims & payouts.
- **Platform:** all enterprise AI-agent actions — one neutral, cross-vendor control plane.

- *Speaker:* "Start narrow where the pain is sharpest, expand to a horizontal control plane. A bank
  won't let each agent vendor grade its own homework — they want one independent layer."
- *Visual:* the expanding-rings wedge. **No dollar figures.**

---

## Slide 9 — Why it's defensible
**Build vs. buy — and why it compounds.**

- "A flag is a sprint. An audit-grade, cross-vendor control layer a regulator will accept is not —
  and it isn't the agent vendors' core product."
- Moat: **audit trail · compliance posture · cross-vendor neutrality · accumulated policy/risk
  patterns.**

- *Speaker:* "The defensibility is the compliance depth and the neutrality — and it compounds with
  every decision the system logs."
- *Visual:* the four defensibility chips.

---

## Slide 10 — Close
**Everyone builds the agent. We build the layer that makes it deployable.**

- Live now: **sentinel-sable-nu.vercel.app**
- Sentinel — the control layer for AI agents that move money.

- *Speaker:* "It's live right now. Go let an agent move money — safely."
- *Visual:* hero + URL. End on the logo.

---

### Build/quality talking points (keep in your back pocket — they map to the rubric)
- **Works in the demo (25%):** scripted action stream = reproducible; live verdict = authentic;
  fail-safe to *review* on any error; a self-running guided demo so it can't go off-script.
- **Beyond a wrapper (25%):** the two-layer engine + "Caught by" provenance + the AI-only catch.
- **Originality (20%):** the reframe — the layer that makes agents deployable, not another agent.
- **Product/UX (20%):** the catch → review-panel flow; editable policy; the audit trail.
- **Demand (15%):** kept honest — self-evident, provable live; no invented validation.
