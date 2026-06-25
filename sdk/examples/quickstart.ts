// Run: npx tsx sdk/examples/quickstart.ts
// Governs real tool calls against the live Sentinel deployment.

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

// 2. Your real tools — the things that actually move money.
async function payInvoice(a: { amount: number; to: string; accountAgeDays: number }) {
  console.log(`   ✅ EXECUTED: paid $${a.amount} to ${a.to}`);
  return { ok: true };
}
async function wireMoney(a: { amount: number; to: string; accountAgeDays: number }) {
  console.log(`   💸 EXECUTED: wired $${a.amount} to ${a.to}`);
  return { ok: true };
}

// 3. Wrap them. Every call is now judged by Sentinel before it can execute.
const safePay = sentinel.protect(payInvoice, (a) => ({
  domain: "payments",
  type: "pay_invoice",
  summary: `Pay $${a.amount} to ${a.to}`,
  payload: { monetaryValue: a.amount, recipient: a.to, recipientAccountAgeDays: a.accountAgeDays },
  reversible: true,
}));

const safeWire = sentinel.protect(wireMoney, (a) => ({
  domain: "treasury",
  type: "wire_transfer",
  summary: `Wire $${a.amount} to ${a.to}`,
  payload: { monetaryValue: a.amount, recipient: a.to, recipientAccountAgeDays: a.accountAgeDays },
  reversible: false,
}));

async function run(fn: () => Promise<unknown>) {
  try {
    await fn();
  } catch (e) {
    if (e instanceof SentinelBlockedError || e instanceof SentinelEscalatedError) {
      console.log(`   🛡  STOPPED — caught by: ${e.verdict.caughtBy}`);
      console.log(`      ${e.verdict.reasoning}`);
    } else throw e;
  }
}

async function main() {
  // Routine, in-scope, reversible → allowed, executes automatically.
  console.log("Routine $180 invoice to a known vendor:");
  await run(() => safePay({ amount: 180, to: "Acme Cloud", accountAgeDays: 540 }));

  // $25,000 wire — over the agent's $10k grant → privilege escalation, frozen.
  console.log("\n$25,000 wire to a 2-day-old account:");
  await run(() => safeWire({ amount: 25_000, to: "Orion (NEW)", accountAgeDays: 2 }));
}

main();
