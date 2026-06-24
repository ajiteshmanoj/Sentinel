# Sentinel — Complete Claude Code Build Prompt (Fintech wedge, engine prompt embedded)

> This is the COMPLETE, ready-to-paste prompt. The hand-tuned risk-engine system prompt is already embedded inside the Layer 2 section (between the SENTINEL_LAYER2_SYSTEM_PROMPT markers). You do not need a second file.
> Paste everything in the code block below into Claude Code as a single first message.
> Build the engine first, polish the visuals second. The functionality is the foundation; the beauty sells it.
> This version is positioned around a **fintech / money-movement wedge** and includes a **positioning section** (sequencing + regulatory moat, no market-sizing chart).

---

```
Build a production-quality web app called SENTINEL. Read this entire spec before writing any code, then build it in the phases listed at the end.

## WHAT SENTINEL IS
Sentinel is an audit-grade control layer that sits between an AI agent and the real-world actions it takes — purpose-built first for FINANCIAL SERVICES, where agents move money. Before any agent action executes, Sentinel judges its risk in real time. Routine, in-policy actions pass straight through. Risky, irreversible, or policy-violating actions are FROZEN and escalated to a human, who approves, edits, or blocks them — with full context and a tamper-evident audit trail, in seconds.

The product thesis: "Fintechs and digital banks have capable AI agents they're too scared to let touch money — because an agent that pays, refunds, or wires can act wrong, and a regulator will ask why. Sentinel catches the risky action before it executes, brings in a human at exactly the right moment, and logs an auditable record of every decision — so financial institutions can finally let their agents run."

## WHY FINTECH FIRST (positioning — keep this lens throughout the copy and scenarios)
- The actions are high-stakes and often IRREVERSIBLE (wires, payouts, payroll changes) — escalation is obviously valuable.
- Regulation makes this BUY, not build: in Singapore, MAS expects auditable controls, segregation of duties / maker-checker, and a clear trail for automated decisions. "We'll add a flag in a sprint" does not survive an audit or the liability. The compliance depth is the moat.
- The buyer already exists: risk, fraud, and compliance teams who think in escalation thresholds and false-positive rates, and who have budget.
- Neutral, cross-vendor control plane: a bank running agents from several vendors won't let each vendor grade its own homework — they want one independent, auditable layer over all of them. (This is the defense against the model platforms bundling guardrails.)
- Expansion path (mention, don't build): insurance & healthcare claims/payouts next, then broader enterprise.

## ARCHITECTURE — THE CRITICAL DISTINCTION
- The AGENT and its ACTION STREAM are SCRIPTED (pre-authored scenario files). This makes the demo 100% reproducible. This is intentional and fine.
- The RISK VERDICT IS LIVE AND REAL. Every action — even though the action text is pre-written — is judged at runtime. NOTHING about the risk score, the verdict, or the reasoning is hardcoded, cached, or faked. This separation must be architecturally clean and obvious in the code, because we demonstrate to judges that the AI is genuinely deciding.
- Add a visible "View raw model response" affordance on each judged action so we can prove the verdict came from the live model.

## TECH STACK (use exactly this)
- Next.js 14 (App Router), TypeScript strict mode
- Tailwind CSS + Framer Motion for animations
- OpenAI via the official `openai` npm SDK, called ONLY from server-side route handlers / server actions
- All OpenAI calls use the Responses API
- State: React state + a lightweight store (Zustand). No database needed; scenarios are local TS/JSON files.

## OPENAI MODELS (use exactly these model IDs)
- Risk-judgment engine: `gpt-5.4` with reasoning effort "high". Use Structured Outputs with a strict JSON schema so the verdict is always valid JSON. This is the core consequential call.
- (Optional, only if you add a live "explain to reviewer" summary): `gpt-5.4-mini` with reasoning "low".
- The API key is in process.env.OPENAI_API_KEY, loaded from .env.local. NEVER expose it client-side. NEVER hardcode it. Create a .env.local.example with the var name only.

## THE RISK ENGINE (the heart — make this rock-solid; HYBRID, not pure-LLM)
A server route `POST /api/judge` that accepts one agent action and returns a structured verdict. Decisions are made in TWO layers so the escalation logic is defensible and auditable — this is the answer to "how does it decide to escalate, and why can't a regulator argue with it":

LAYER 1 — DETERMINISTIC GUARDRAILS (run in code first, before any model call):
- Hard, auditable rules evaluated in TypeScript. Any hit => immediate escalate (review or block) with the rule named, NO LLM needed. These protect the customer and are 100% explainable. Examples (derive from the policy rules + action fields):
  - monetaryValue over a configured threshold (e.g. > $1,000) => review
  - recipient account added within last 30 days AND monetaryValue > 0 => review/block
  - action.reversible === false AND monetaryValue > threshold => review
  - action affects > N customers => review
  - data export / deletion / bulk PII access => review/block
  - changes to payout, payroll, or bank-account details => review
- Emit which deterministic rule(s) fired.

LAYER 2 — LLM ADJUDICATOR (only for what the guardrails don't settle):
- Send the action + the org's plain-language policy rules to gpt-5.4 for the ambiguous middle ("is this normal for this agent / this account?"). Enforce this exact JSON schema via Structured Outputs:
{
  "verdict": "allow" | "review" | "block",
  "riskScore": number (0-100),
  "confidence": number (0-1),
  "riskFactors": string[],          // e.g. ["irreversible", "high monetary value", "external recipient", "new payee", "policy violation: <rule>"]
  "policyViolations": string[],     // which specific policy rules were triggered, empty if none
  "reasoning": string,              // 1-2 sentence plain-English explanation a human reads in 3 seconds
  "suggestedHumanAction": string    // what the reviewer should verify before approving
}
- Use the EXACT system prompt below verbatim as the Layer 2 system message. Do NOT rewrite, paraphrase, soften, or "improve" it — the fail-safe bias, per-rule policy checking, and proportional scoring are deliberate. The action and policy rules are passed in the user message; this is the system message:

<<<SENTINEL_LAYER2_SYSTEM_PROMPT
You are Sentinel, a risk adjudicator that sits between an autonomous AI agent and the
real-world actions it is about to take. Your only job is to decide whether a proposed action
is safe to execute automatically, must be escalated to a human, or must be blocked.

You are the last line of defence before an irreversible action happens. A wrongly approved
action can cost money, leak data, damage a customer relationship, or break the law. A wrongly
escalated action only costs a human a few seconds. Therefore you operate under a strict
FAIL-SAFE BIAS: when you are uncertain, you escalate. You never resolve uncertainty in favour
of "allow".

You will receive:
1. A proposed agent action, including its domain, type, a plain-language summary, structured
   payload details, whether it is reversible, and (where relevant) a monetary value and a
   recipient.
2. A set of plain-language POLICY RULES defined by the organisation.

Note: clear-cut cases are already handled by deterministic guardrails before you are called.
You are adjudicating the ambiguous middle — the cases where judgment is genuinely required.
Apply even more care here, and reflect your certainty honestly in the confidence field.

Judge the action against BOTH general risk principles and EVERY policy rule provided.

GENERAL RISK PRINCIPLES — weigh each of these:
- Reversibility: irreversible actions (deletions, exports, sent communications, executed
  payments) carry far higher risk than reversible ones.
- Monetary magnitude: larger amounts carry more risk; judge proportionally, not by a fixed line.
- Recipient: actions sent to external, new, or unverified recipients are riskier than internal
  or established ones.
- Data sensitivity: actions touching personal data, credentials, financial records, or bulk
  customer data are high-risk.
- Blast radius: actions affecting many people or records at once are riskier than single-record
  actions.
- Unusualness: an action that deviates from a routine pattern warrants a closer look.

POLICY RULES — these are authoritative:
- Check the action against each rule individually.
- If an action violates a rule, name the specific rule it violated in policyViolations.
- A clear policy violation should normally result in "block" or, at minimum, "review" — never
  "allow".
- Policy rules can only make you MORE cautious, never less. An action that passes all policy
  rules can still be escalated on general risk grounds.

VERDICTS:
- "allow": the action is routine, low-stakes, clearly reversible or trivial, and clearly within
  every policy rule. Only use when you have no meaningful doubt.
- "review": the action is consequential, unusual, high-value, irreversible, touches sensitive
  data, or you are uncertain for any reason. This is your default when in doubt.
- "block": the action clearly violates a policy rule or is obviously harmful, fraudulent, or
  unsafe.

SCORING:
- riskScore is an integer from 0 to 100 reflecting the overall risk of executing the action
  automatically. Keep it consistent with the verdict: allow ≈ 0–30, review ≈ 31–79,
  block ≈ 80–100.
- confidence is a number from 0 to 1 reflecting how certain you are in your own judgment. Be
  honest: if the action is genuinely ambiguous or you lack information, report low confidence.
  Low confidence will itself trigger escalation, which is the correct, safe outcome.

OUTPUT:
- Return only the structured fields requested. No preamble, no markdown.
- riskFactors: short, concrete tags for what makes this risky (e.g. "irreversible",
  "$25,000 transfer", "unverified recipient", "affects 12,000 customers"). Empty only if truly
  none apply.
- policyViolations: the exact rule(s) triggered, quoted or closely paraphrased. Empty array if
  none.
- reasoning: one or two plain-English sentences a busy human can read in three seconds to
  understand why this was flagged. Write for a non-technical risk/compliance reviewer, not an
  engineer.
- suggestedHumanAction: the single most important thing the reviewer should verify before
  approving (e.g. "Confirm the new bank account belongs to the real vendor before releasing
  payment.").

Be decisive, be proportionate, and when in doubt, escalate.
SENTINEL_LAYER2_SYSTEM_PROMPT

DECISION COMBINATION (the final verdict):
- Threshold bands owned by policy, not the model's whim: riskScore < 30 => allow, 30-70 => review, > 70 => block.
- Escalate if ANY of: a deterministic guardrail fired, the band is review/block, OR confidence < 0.6 (low confidence => escalate regardless of score).
- FAIL-SAFE BIAS: when uncertain, escalate (prefer review over allow). A false escalation is cheap; a missed money-moving action is catastrophic. On any API error / malformed output / timeout, default to "review" — never crash, never allow by default.
- Add request timeout + one retry. Log the raw response server-side for the "view raw" feature.
- The UI must show WHICH layer caused the escalation (a "Caught by: policy guardrail" vs "Caught by: risk model (low confidence)" label). This sells the trust story.

## SCENARIOS (scripted action stream — FINTECH-LED)
Create a scenarios file with ~10-12 pre-authored agent actions. Lead with money-movement so the wedge is unmistakable; keep 2-3 cross-domain ones to show horizontal potential:
- Payments / treasury: pay a $180 recurring invoice to a known vendor (allow); wire $25,000 to a newly-added unverified account (block/review — the money moment); release a $4,200 vendor payout flagged as a duplicate (review); change a supplier's bank-account details (review).
- Customer money ops: issue a $20 goodwill refund (allow); issue a $4,000 refund outside policy (review); reverse a settled card transaction (review).
- Payroll / finance ops: update an employee's payroll bank details (review); schedule month-end payroll run, amounts within norm (allow).
- Cross-domain (show breadth): export the full customer database (block/review); send a marketing blast to 12,000 users (review).
- Include at least one genuinely ambiguous money action so the fail-safe bias and the "low confidence => escalate" path are visible.
Each scenario has realistic payload detail (amounts, recipient, account-age, reversibility). Balance the mix of allow/review/block and engineer a clear "poisoned wire gets frozen" moment.

Default policy rules in plain language (MAS / maker-checker flavored) — make them EDITABLE in the UI:
- "Never move more than $1,000 to an account added in the last 30 days without human approval."
- "Any single payment above $10,000 requires human approval (maker-checker)."
- "Changes to payout, payroll, or bank-account details always require human approval."
- "Refunds over $500 require human approval."
- "Never delete or export customer data without human approval."
Editing a rule and re-running must visibly change the verdict — this proves the engine genuinely reads the policy.

## THE INTERFACE (Apple-grade — this matters as much as the engine)
Overall feel: calm, premium, confident — fintech-serious, trustworthy. Reference the fluidity and restraint of apple.com/sg — generous whitespace, slow purposeful motion, depth via subtle shadows and blur, no clutter. Dark theme primary, refined accent palette (deep indigo/violet #6C5CE7 family), with a sentinel-red #FF3B5C reserved ONLY for blocked/caught actions for maximum contrast at the key moment.

Build these screens:

1. LANDING / HERO (the "do people want to buy it" surface)
   - Immaculate wordmark logo for "Sentinel" — clean custom logotype, subtle motif of a watchful line/scanning beam or a shield formed from a single unbroken stroke. Inline SVG, crisp.
   - Hero headline + the one-liner, fintech-framed (e.g. "The control layer for AI agents that move money."). A single confident CTA ("See it live").
   - AMBIENT MOVING BACKGROUND: a slow elegant animated gradient mesh OR subtle particle/grid field that reacts to cursor (parallax — elements ease toward/away from the cursor). Smooth 60fps, GPU-accelerated (transform/opacity only), never janky. Tasteful, not gamey.
   - Apple-style scroll transitions: sections fade/slide/scale into view with easing (Framer Motion + intersection observers). Smooth scroll.

2. THE CONSOLE (the live demo — the star)
   - A live "agent action feed": scripted actions arrive one by one with a satisfying entrance animation.
   - Each action card shows: domain icon, summary, key payload facts (amount, recipient, account-age). As it's judged LIVE, show a brief "Sentinel is assessing…" state (a refined scanning beam passing over the card), then resolve to the verdict.
   - ALLOW: card glides through with a calm green check.
   - REVIEW / BLOCK: the moment of catch — a sharp but elegant animation (red scan-line flares, card freezes and lifts into a HUMAN REVIEW PANEL). This is the money moment — crisp, consequential, like a real wire just got stopped.
   - The review panel shows: the action, the riskScore (animated count-up + refined radial/arc gauge), the "Caught by:" layer label (policy guardrail vs risk model / low confidence), riskFactors as tags, policyViolations highlighted, plain-English reasoning, suggestedHumanAction, and three buttons: Approve / Edit / Block.
   - A live stats strip: actions processed, auto-approved, escalated, blocked — animate as the feed runs.
   - "View raw model response" expandable on each card (proves it's real).
   - "Run scenario" + reset, optional speed control.
   - The editable policy rules panel (edit a rule → re-run → verdict changes).

3. HOW IT WORKS — 3-step animated diagram: Agent acts → Sentinel judges (guardrails + model) → Human owns the risky call. Keep it tight.

4. POSITIONING SECTION (a dedicated, pitch-ready section judges can read in 20 seconds — this is POSITIONING, not a market-sizing slide; do NOT include any TAM/SAM/SOM chart or dollar figures)
   Title: "Start where the stakes are highest: AI agents that move money."
   Layout: a left "wedge" visual + right supporting points, all scroll-animated. Include:
   - THE WEDGE (a simple expanding-rings / funnel graphic, animated): center ring "Fintechs & digital banks — agentic money movement" → next ring "Insurance & healthcare claims & payouts" → outer ring "All enterprise AI-agent actions". Label it Beachhead → Expand → Platform. This shows we've thought about sequencing — start narrow where the pain is sharpest, expand to a horizontal control plane.
   - WHY HERE FIRST (4 compact cards): "Irreversible, high-value actions", "MAS-grade audit & maker-checker required", "Risk/compliance buyers with budget", "Neutral cross-vendor control plane".
   - BUILD vs BUY (one line that defuses the objection): "A flag is a sprint. An audit-grade, cross-vendor control layer that a regulator will accept is not — and it isn't their core product."
   - DEFENSIBILITY (one row of chips): Audit trail · Compliance posture · Cross-vendor neutrality · Accumulated policy/risk patterns.
   Animate the rings in on scroll; keep the palette consistent with the rest of the app.
   IMPORTANT: NO market-size numbers, NO stacked bars, NO TAM/SAM/SOM, NO invented dollar figures anywhere. The strength of this section is the sequencing logic and the regulatory moat, not a market chart. Keep it to the rings, the four cards, the build-vs-buy line, and the defensibility chips.

## ANIMATION & POLISH REQUIREMENTS
- All motion GPU-accelerated (transform/opacity), 60fps, deliberate easing (cubic-bezier, ~300-500ms). No abrupt jumps.
- Respect prefers-reduced-motion (calm fallbacks).
- Micro-interactions on every interactive element (hover lift, button press, focus states).
- Cursor-reactive hero background with smooth lerp (ease toward cursor, don't snap).
- Loading/assessing states must themselves be beautiful — never a plain spinner.
- Fully responsive, but optimize for a laptop/projector (the demo is on stage).
- Typography: a premium sans (Inter or similar via next/font), tight tracking on headlines.

## ROBUSTNESS (rock-solid, non-negotiable)
- The app must NEVER crash during a demo. Wrap all API calls in try/catch; on failure, fail safe to "review" with a clear (non-alarming) note.
- No unhandled promise rejections. No console errors in the happy path.
- If OPENAI_API_KEY is missing, show a clean setup screen, not a crash.
- Type everything. No `any` in the engine path.
- Keep the OpenAI call server-side only; verify nothing leaks the key to the client bundle.

## BUILD ORDER (do in phases, verify each works before moving on)
1. Scaffold (Next 14, TS strict, Tailwind, Framer Motion, Zustand, openai SDK), .env.local.example, clean folders.
2. The risk engine: /api/judge with LAYER 1 deterministic guardrails + LAYER 2 gpt-5.4 Structured Outputs (using the embedded verbatim Layer 2 system prompt) + decision combination + fail-safe handling. Test with hardcoded fintech actions; confirm verdicts are sane, JSON always valid, and the "Caught by" layer is correct.
3. Scenario data files (fintech-led actions + MAS-flavored default policy rules).
4. The Console wired to the live engine: feed → assessing → verdict → review panel → resolve. Get FUNCTION correct before heavy styling.
5. The "catch" animation + review-panel polish — the money moment — including the "Caught by:" label.
6. The landing/hero (logo, ambient cursor-reactive background, scroll transitions) with fintech-framed copy.
7. The Positioning section (section 4) — animated wedge rings, the four "why fintech first" cards, the build-vs-buy line, and the defensibility chips. NO market-size chart.
8. Stats strip, editable policy panel, "view raw response", reduced-motion fallbacks.
9. Final pass: robustness, no console errors, responsive on a 1440px+ projector, remove dead code.

Start with phase 1 and the engine. Make the engine genuinely correct and the verdicts trustworthy before anything visual — the functionality is the foundation, the beauty sells it.
```

---

## Setup notes (for you, not for Claude Code)

- **Fintech wedge framing is now baked into the copy, scenarios, and the new Market Wedge slide.** The positioning line to say on stage: *"Sentinel is the audit-grade control layer for AI agents that move money — starting with fintechs and digital banks, expanding to insurance and the broader enterprise."*
- **The risk-engine system prompt is already embedded** in the Layer 2 section (between the `SENTINEL_LAYER2_SYSTEM_PROMPT` markers). It governs the LLM adjudicator that handles the grey-zone cases the deterministic guardrails don't settle. If Claude Code tries to rewrite or "improve" it, tell it to keep it verbatim — the fail-safe bias and per-rule checking are deliberate.
- **Hybrid engine = the defensible answer** to "how does it escalate / why can't they build it themselves": deterministic guardrails (auditable, regulator-proof) for the clear cases, the model only for the grey zone, low-confidence always escalates. The "Caught by:" label makes this visible live.
- **Models locked:** `gpt-5.4` (reasoning `high`) for the engine; optional `gpt-5.4-mini` (reasoning `low`) for any secondary summary. If on-stage latency feels slow, drop to reasoning `medium` after checking verdict quality.
- **No market-sizing chart, by design.** The positioning section sells *sequencing logic* (beachhead → expand → platform) and the *regulatory moat*, not a TAM/SAM/SOM. In a 3-minute, no-Q&A slot, a student-team market chart invites the one question you can't answer on stage ("where did these numbers come from?") and spends seconds on your weakest story instead of your strongest. Lead with the frozen wire; if you want to gesture at market size, say it in one spoken sentence rather than putting figures on screen.
- **Naming caution:** "Sentinel" overlaps with existing security products (e.g. SentinelOne). Fine for a hackathon; revisit if it becomes a company.
- **Expect 2–3 visual iteration passes** for Apple-grade motion (ambient background, the catch moment, the wedge rings).
