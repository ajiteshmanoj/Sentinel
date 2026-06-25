// Run: npx tsx sdk/examples/quickstart.ts
// Governs a real tool call against the live Sentinel deployment.

import { Sentinel, SentinelBlockedError, SentinelEscalatedError } from "../src/index.js";

// 1. Point the SDK at your Sentinel deployment + declare the acting agent's grant.
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

// 2. Your real tool — the thing that actually moves money.
async function wireMoney(args: { amount: number; to: string; accountAgeDays: number }) {
  console.log(`💸 EXECUTED: wired $${args.amount} to ${args.to}`);
  return { ok: true };
}

// 3. Wrap it. Every call is now judged by Sentinel before it can execute.
const safeWire = sentinel.protect(
  wireMoney,
  (a) => ({
    domain: "treasury",
    type: "wire_transfer",
    summary: `Wire $${a.amount} to ${a.to}`,
    payload: { monetaryValue: a.amount, recipient: a.to, recipientAccountAgeDays: a.accountAgeDays },
    reversible: false,
  }),
);

async function main() {
  // Routine, in-scope payment → allowed, executes automatically.
  await safeWire({ amount: 180, to: "Acme Cloud", accountAgeDays: 540 });

  // Poisoned wire → frozen before a cent moves.
  try {
    await safeWire({ amount: 25_000, to: "Orion (NEW)", accountAgeDays: 2 });
  } catch (e) {
    if (e instanceof SentinelBlockedError || e instanceof SentinelEscalatedError) {
      console.log(`🛡  STOPPED — caught by: ${e.verdict.caughtBy}`);
      console.log(`   ${e.verdict.reasoning}`);
    } else throw e;
  }
}

main();
