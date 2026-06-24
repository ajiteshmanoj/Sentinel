# Hackathon Context — TheFirst Spark Challenge (for Claude Code)

> Purpose: this file gives Claude Code the full context of the competition Sentinel is being
> built for, so any code, copy, demo, or pitch-asset decisions are made with the real judging
> criteria, audience, and constraints in mind. Sentinel is the project; this is the arena.

---

## The event

**TheFirst Spark Challenge** — a 7-day AI build sprint and the pre-event for **TheFirst Spark
AI Youth Symposium**, a full-day Singapore gathering for student founders, builders, and
operators exploring how to build, work, and start up in the AI age.

- **Organisers:** Wavesparks (Asia's launchpad for young founders) and January Capital (a VC
  investing in APAC technology businesses; backers of ShopBack, Akulaku, CoLearn).
- **Sprint dates:** 19–25 June 2026. **Submissions close 25 June, 12:00 SGT** on Devpost.
- **Selection notified / live pitches:** 27 June. Top 10 teams pitch live on the main stage.
- **Open to:** JC, polytechnic, IHL, university students & NSmen — solo or teams of 1–4.

### Key dates
| Date | What happens |
|---|---|
| 19 Jun | Challenge begins (3pm) |
| 20 Jun | Credit collection form due |
| 25 Jun, 12:00 SGT | **Devpost submissions close** |
| 27 Jun | Selected teams notified; **Top 10 pitch live** |

---

## Why this matters for build & pitch decisions

The single most important contextual fact: **the audience is students, but the JUDGES are
operators and investors.** Optimise everything for the judges' worldview — "is this a real,
fundable, working product?" — while keeping the demo legible and exciting enough that the
student audience generates room energy.

Judging organisations span **OpenAI, AI Singapore, Grab, Workato, Hypotenuse AI, Sierra,
Nebius, and January Capital (VC).** Practical implications for Sentinel:
- These people have seen every "AI support chatbot" and "AI SDR." Lean on what makes Sentinel
  *not a wrapper*: the two-layer engine (deterministic guardrails + LLM adjudicator), the
  audit trail, and the fail-safe bias.
- **Sierra builds customer-service AI agents.** Do NOT frame Sentinel as a support tool — frame
  it as the trust/permission/control layer for agents that take consequential ACTIONS
  (money movement first). This avoids walking onto a judge's home turf.
- **OpenAI is a sponsor and provides the API credits; judges want to see real, visible AI
  usage.** Sentinel uses `gpt-5.4` live for the Layer-2 grey-zone verdicts — make that
  visible and provable (the live policy-edit re-run; the "Caught by: risk model" label).
- **January Capital (VC) is in the room.** The fintech wedge + build-vs-buy + defensibility
  framing exists to read as a fundable company, not a class project.

---

## Challenge statement being addressed

**Theme A — AI Operating Layer: Trust, Agency & Real-World Systems**
**Statement A-1: Trust and permissions for autonomous agents** —
*"How might we design permission layers, audit trails, and fail-safes so users can trust agents
to act on their behalf?"*

Sentinel maps to this almost verbatim: **permission layers** (which actions auto-execute vs
need sign-off), **audit trails** (tamper-evident decision log), **fail-safes** (deterministic
guardrails + fail-safe-to-review bias). The fintech / money-movement angle is the
go-to-market *wedge within* A-1, not a different statement.

Framing note to keep handy: A-1 says "act on their behalf" — read as **the business is the
user delegating actions to its AI agent; Sentinel is how it grants that trust safely.**

---

## Judging rubric (build and pitch to THIS)

| Criterion | Weight | What judges look for | Sentinel's angle |
|---|---|---|---|
| **Challenge–Solution Fit** | 20% | Meaningfully solves the challenge? Target user well-defined? Addresses the core bottleneck? | Near-verbatim fit to A-1; the bottleneck is "capable agents nobody trusts to act." |
| **AI Leverage & Technical Execution** | 25% | Does it work in the demo? APIs integrated with real value? Custom logic / system design beyond a basic LLM wrapper? | The two-layer hybrid engine is the proof of "beyond a wrapper." Live `gpt-5.4` on grey-zone cases. Must run cleanly. |
| **Product Thinking & UI/UX** | 20% | Clear, intuitive flow? Reduces friction vs alternatives? Feels like a complete experience? | Apple-grade console; the catch → human-review-panel moment; editable policy. |
| **Originality & Insight** | 20% | Differentiated? Reframes the problem interestingly? Could evolve into a strong product? | The reframe: everyone builds the agent; we build the layer that makes the agent deployable. |
| **Evidence of Real Demand** | 15% | Did the team speak to users? Evidence of pain, behaviour, validated assumptions? | Provable live ("who'd let an agent move money unsupervised?"); the weakest rubric line — do not over-claim. |

**Highest-leverage criteria:** the 25% (does it work + not-a-wrapper) and 20% originality.
The build's defensibility lives or dies on the engine running cleanly and the two-layer
architecture being visible.

---

## Submission requirements (Devpost)

Each submission must include:
- Project name and team members.
- Problem statement and target user.
- 2–3 sentence solution summary.
- Demo video — YouTube link, **max 3 minutes**.
- Live demo link, prototype link, or screenshots.
- Pitch deck (**10 slides max**), used for the 3-min on-stage pitch if selected.
- Tools used (e.g. OpenAI, ElevenLabs, Supabase, Vercel, Replit).
- Optional: GitHub repo, Figma, technical architecture, user feedback.

At least one public progress update must be posted on LinkedIn / X / Instagram / TikTok during
the sprint.

---

## Pitch format (if selected to top 10)

- **3 minutes on stage — NO Q&A during demos.** The pitch must be fully self-contained; you
  cannot rescue it by answering questions. Every objection must be pre-empted in the 3 minutes.
- Use the Devpost pitch deck (10 slides max).
- Presenting from organisers' laptop — **share public links in the submission** (the live
  Vercel URL matters).
- Arrival/AV instructions sent to selected teams on 26 June.

### Selection process
1. Wavesparks removes incomplete/ineligible submissions.
2. Each submission assigned to two reviewers.
3. Each judge shortlists top 20 by score + 5 alternates.
4. Top 10 selected for main-stage pitches.

**Implication:** the Devpost (especially the 3-min video + live link) must score well in
*asynchronous review by two judges* before you ever reach a stage. The video and the live
demo URL are the gatekeepers — they must stand alone without you narrating.

---

## Prizes (context for ambition framing)

- **1st:** $25,000 OpenAI credits + 3 months ElevenLabs Pro per team member.
- **2nd:** $15,000 OpenAI credits. **3rd:** $10,000 OpenAI credits.
- Participant perks: $250 OpenAI API credits, 3 months ChatGPT Pro, 1 month ElevenLabs Creator.

---

## What this means for Claude Code specifically

When generating or revising Sentinel's code, copy, demo flow, or pitch assets, optimise for:

1. **"Does it work in the demo" (25%)** — robustness above all. Never crash; fail-safe to
   `review` on any error; the scripted stream guarantees reproducibility; the live verdict
   guarantees authenticity. The demo runs on an unfamiliar laptop/network — assume that.
2. **"Beyond a wrapper" (25%)** — keep the two-layer engine and the "Caught by:" provenance
   label prominent and legible. This is the differentiator a technical judge cares about.
3. **Self-contained storytelling** — the 3-min video and the live URL are reviewed without a
   human present. The product must explain itself: the catch moment, the human review panel,
   the live policy-edit re-run all need to read instantly.
4. **Visible, provable AI** — OpenAI is the sponsor; make the live `gpt-5.4` usage evident and
   defensible (the policy-edit-and-re-run is the cleanest proof of liveness).
5. **Fundable framing for an operator/VC room** — the fintech wedge, build-vs-buy line, and
   defensibility chips read as a company. Avoid social-good/charity framing; avoid an
   invented market-size chart (it invites the one question you can't answer on a no-Q&A stage).
6. **No over-claiming on demand (15%)** — this is the weakest rubric line and the team is not
   running user interviews. State the demand as self-evident/provable-live; never fabricate
   validation or user counts.
