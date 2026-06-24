# Sentinel — Devpost Submission

> Copy/paste-ready. Fill the bracketed team fields before submitting.

---

## Project name
**Sentinel**

## Tagline
The audit-grade control layer for AI agents that move money.

## Team
[Your name(s) / handle(s)] — [school / IHL] — solo or team of [N].

## Links
- **Live demo:** https://sentinel-sable-nu.vercel.app
- **GitHub:** https://github.com/ajiteshmanoj/Sentinel
- **Demo video (≤3 min):** [YouTube link]

---

## Challenge addressed
**Theme A — AI Operating Layer: Trust, Agency & Real-World Systems.**
**Statement A-1: Trust and permissions for autonomous agents** — *"How might we design
permission layers, audit trails, and fail-safes so users can trust agents to act on their
behalf?"*

Sentinel maps to A-1 directly: a **permission layer** (which agent actions auto-execute vs.
need human sign-off), a **tamper-evident audit trail**, and **fail-safes** (deterministic
guardrails + a fail-safe-to-review bias).

## Problem statement
Businesses now have AI agents capable of taking real, consequential actions — paying invoices,
issuing refunds, wiring money, changing payout details. But almost nobody lets them act
unsupervised, because an agent that moves money can act wrong, and the action can be
irreversible and unauditable. In regulated finance, "we'll add a flag in a sprint" does not
survive an audit or the liability. **The bottleneck isn't agent capability — it's trust.**

## Target user
Risk, fraud, and compliance teams at **fintechs and digital banks** — buyers who already think
in escalation thresholds and false-positive rates, and who own the budget. (Expansion path:
insurance & healthcare claims/payouts, then broader enterprise.)

## Solution summary (2–3 sentences)
Sentinel sits between an AI agent and the real-world actions it takes, and judges every action's
risk in real time. Routine, in-policy actions pass straight through; risky, irreversible, or
policy-violating ones are **frozen and escalated to a human**, with full context and a
tamper-evident audit trail — in seconds. It is a neutral, cross-vendor control plane, so a bank
running agents from several vendors gets one independent, auditable layer over all of them.

## How it works — a hybrid engine (not a wrapper)
Decisions are made in **two layers**, which is what makes the escalation logic defensible to a
regulator:

1. **Layer 1 — Deterministic guardrails.** Hard, auditable rules run in code first (new-payee
   limits, maker-checker thresholds, banking-detail change control, bulk-data protection).
   Any hit → immediate escalation with the rule named. 100% explainable, no model needed.
2. **Layer 2 — LLM adjudicator.** For the ambiguous middle, the action + the org's plain-language
   policy go to **OpenAI `gpt-5.4`** (reasoning *high*) via the **Responses API** with
   **Structured Outputs**, returning a strict JSON verdict (verdict, risk score, confidence,
   risk factors, policy violations, reasoning, suggested human action).
3. **Decision combiner.** Policy-owned threshold bands + a strict **fail-safe bias**: low
   confidence always escalates; on any API error / timeout the engine defaults to *review* —
   never crashes, never auto-approves by mistake. Every escalation is labelled with the layer
   that caught it (**"Caught by: policy guardrail"** vs **"risk model"**).

**The insight that makes the AI matter:** deterministic rules catch the *obvious* (a $25,000 wire
to a 2-day-old account). The model catches the *subtle* — e.g. a **$9,800 payment** that sits just
under the $10k approval line, to an established vendor whose bank details changed last week, marked
"urgent." It passes **every** deterministic rule, but `gpt-5.4` flags it as a textbook
invoice-redirection fraud pattern. *No rulebook encodes that. The AI does.*

## Visible, provable AI
- A live **`gpt-5.4-mini` analyst narration streams token-by-token** as each action is judged —
  you watch the model reason in real time.
- **Edit any policy rule or threshold and re-run** — the verdict (and the "Caught by" label)
  changes live, proving the engine reads the policy rather than running a script.
- The **tamper-evident audit trail** (SHA-256 hash-chained, exportable) records every decision.

## What we built
A production-quality Next.js app: the two-layer engine, a streaming judge endpoint, 12 scripted
fintech actions, an Apple-grade live console (the catch moment → human review panel), an editable
policy + thresholds panel, the hash-chained audit trail, and a **self-running 90-second guided
demo** so the live URL explains itself with no narrator. The agent action stream is scripted for
a reproducible demo; **every risk verdict is judged live by the model at runtime** — nothing about
the score, verdict, or reasoning is hardcoded.

## Tools used
OpenAI (`gpt-5.4` + `gpt-5.4-mini`, Responses API, Structured Outputs, streaming) · Next.js 14
(App Router) · TypeScript (strict) · Tailwind CSS · Framer Motion · Zustand · Vercel.

## Inspiration
Every team is building the agent. Almost none are building the thing that makes an agent
*deployable* in a business that can't afford a mistake. We started from the question a bank
actually asks — "who'd let an agent move money unsupervised?" — and built the layer that answers it.

## Challenges
Keeping the AI **visible and provable** without sacrificing reliability: we stream a live
narration for the show, but the authoritative verdict comes from a separate structured call that
fails safe — if streaming ever fails, the engine silently falls back so the demo can't break.

## Accomplishments we're proud of
A genuinely hybrid engine (not a wrapper), a fraud the rules can't catch but the model can, and a
tamper-evident audit trail — the three things an operator/VC/compliance judge looks for under A-1.

## What's next
Connectors to real agent frameworks and payment rails; learned, org-specific policy patterns;
expansion from money movement to insurance/healthcare claims and broader enterprise actions.

## A note on demand (kept honest)
We did not run formal user interviews during the sprint. The pain is self-evident and provable
live: ask any risk/compliance owner whether they'd let an AI agent wire money unsupervised. We
present the demand as self-evident, and do not claim validated user counts.
