# @sentinel/guard

Drop-in control for AI agents that take real-world action. Wrap any tool call;
routine actions execute, risky/irreversible/out-of-scope ones are **blocked or
escalated to a human** — with a structured verdict and a **fail-safe bias** (on
any error, escalate rather than execute).

Zero dependencies. Node 18+, edge runtimes, and the browser.

## Install

```bash
npm install @sentinel/guard
```

## Three-line integration

```ts
import { Sentinel } from "@sentinel/guard";

const sentinel = new Sentinel({
  baseUrl: "https://sentinel-sable-nu.vercel.app",
  agent: {
    id: "payments-agent",
    name: "Payments Agent",
    capabilities: [
      { label: "Vendor payments up to $10,000", domains: ["payments", "treasury"], maxAmount: 10_000 },
    ],
  },
});

// Wrap the tool your agent calls. Now every call is governed.
const safeWire = sentinel.protect(wireMoney, (a) => ({
  domain: "treasury",
  type: "wire_transfer",
  summary: `Wire $${a.amount} to ${a.to}`,
  payload: { monetaryValue: a.amount, recipient: a.to },
  reversible: false,
}));

await safeWire({ amount: 25_000, to: "Orion (NEW)" });
// → throws SentinelBlockedError before a cent moves
```

## Judge without wrapping

```ts
const verdict = await sentinel.guard({
  domain: "infrastructure",
  type: "delete_database",
  summary: "Delete the production customers database",
  payload: { affectedCount: 48_000_000 },
  reversible: false,
});

if (verdict.escalated) {
  // route to your human reviewer
} else {
  // execute
}
```

## Human-in-the-loop

```ts
const safeRefund = sentinel.protect(issueRefund, describeRefund, {
  onReview: async (verdict, args) => {
    const approved = await askReviewer(verdict); // your UI / Slack / CIBA
    return approved ? "approve" : "deny";
  },
});
```

## What you get back

Every call returns (or throws with) a structured `JudgeResult`:

```ts
{
  verdict: "allow" | "review" | "block",
  riskScore, confidence,
  riskFactors[], policyViolations[],
  reasoning, suggestedHumanAction,
  caughtBy,        // "capability scope" | "policy guardrail" | "risk model" | …
  escalated, modelInvoked, failSafe, latencyMs
}
```

## How it works

Each action is judged by the Sentinel control plane:

1. **Capability scope** — is it inside the agent's least-privilege grant? (out of scope → blocked instantly)
2. **Deterministic guardrails** — hard, auditable rules (limits, blast radius, data protection)
3. **LLM adjudicator** — `gpt-5.4` for the grey zone, returning a strict structured verdict
4. **Fail-safe combiner** — low confidence or any error → escalate to a human, never auto-approve

Live demo: **https://sentinel-sable-nu.vercel.app**

## License

MIT
