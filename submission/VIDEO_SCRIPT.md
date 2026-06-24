# Sentinel — 3-Minute Demo Video Script

> Hard cap **3:00**. This script runs **~2:55**. The demo segment is just a screen recording of
> the **self-running guided demo** on the live site (the "Watch the 90-second guided demo" button),
> so you don't have to drive anything live — press it once and narrate over it.
>
> **Recording recipe:** screen-record https://sentinel-sable-nu.vercel.app, click the guided-demo
> button, and read the voiceover. Record VO separately and lay it over the capture if you can —
> cleaner audio. Keep cuts tight. No on-stage Q&A exists, so every objection is pre-empted here.

---

## 0:00–0:14 — Hook (face-to-cam or over the hero)
> "AI agents can now move money — they pay invoices, issue refunds, send wires. But almost no bank
> lets them do it unsupervised. Because an agent that moves money can act wrong — and that wire
> doesn't come back."

*On screen:* the Sentinel hero — "The control layer for AI agents that move money."

## 0:14–0:30 — The bottleneck
> "The bottleneck isn't agent capability anymore. It's trust. In regulated finance, 'we'll add a
> flag in a sprint' doesn't survive an audit. So capable agents sit on the shelf. Sentinel is the
> layer that lets them off it."

*On screen:* scroll to the live console; hover the "guided demo" button.

## 0:30–0:40 — Frame the demo
> "Sentinel sits between the agent and the action, and judges every action's risk live. Let me show
> you — this runs by itself."

*Action:* click **"Watch the 90-second guided demo."**

## 0:40–1:05 — Without Sentinel (let the captions + UI do the work)
> "First, with no control layer. The agent fires its actions and they just… execute. A twenty-five
> thousand dollar wire — gone, irreversible. And here's the scary one: a $9,800 payment that's
> actually fraud sails straight through, because nothing even flags it."

*On screen:* Sentinel OFF run; the red "money gone" / "unchecked" states; the audit trail logging
unchecked executions.

## 1:05–1:55 — With Sentinel (the core)
> "Now switch Sentinel on. Watch the model reason in real time — that's `gpt-5.4`, live, on every
> action. The $25,000 wire hits a hard deterministic rule and freezes instantly — caught by policy.
> But watch this one: the $9,800 payment passes *every* rule — it's under the limit, the vendor's
> established, it's reversible. A rulebook waves it through. The AI doesn't: just-under-the-threshold,
> bank details changed last week, marked urgent — a textbook invoice-redirection fraud. Caught by the
> risk model alone. **That's the value a rulebook can't deliver.**"

*On screen:* Sentinel ON run; streaming reasoning; the $25k freeze (red "Sentinel froze this wire");
the $9,800 with the **"Every deterministic rule passed — the AI caught this"** badge; the human
review panel with the risk gauge.

## 1:55–2:15 — Proof it's live + audit trail
> "And this isn't scripted. Edit any rule, re-run, and the verdict changes — because the engine reads
> the policy. Every decision lands in a tamper-evident, hash-chained audit trail you can export.
> Permission layer, audit trail, fail-safes — exactly what a regulator asks for."

*On screen:* the policy edit + re-run flipping a verdict / the "Caught by" label; then the audit trail
panel with the SHA-256 chain and the export button.

## 2:15–2:40 — Why this, why now (beyond a wrapper + wedge)
> "Under the hood it's a hybrid engine, not a wrapper: deterministic guardrails for the clear cases —
> auditable, regulator-proof — and the model only for the grey zone, with a fail-safe bias that
> escalates when unsure. We start where the stakes are highest: fintechs and digital banks moving
> money, where regulation makes this *buy*, not build. Then insurance, then the broader enterprise."

*On screen:* the "How it works" two-layer diagram; the positioning wedge (Beachhead → Expand →
Platform).

## 2:40–2:55 — Close
> "Everyone's building the agent. Sentinel is the layer that makes the agent something a bank can
> actually deploy. It's live right now — go try it."

*On screen:* hero + URL card: **sentinel-sable-nu.vercel.app**

---

### Delivery notes
- **Pace:** brisk but calm. The product is "trustworthy," so don't shout.
- **Let the screen breathe** during the two catch moments (the $25k freeze and the $9,800 AI-catch) —
  those two beats are the whole pitch.
- **Names to drop once each:** OpenAI / `gpt-5.4`, "hybrid engine," "tamper-evident audit trail,"
  "buy, not build."
- **Do not** put up any market-size numbers — it invites the one question you can't answer.
