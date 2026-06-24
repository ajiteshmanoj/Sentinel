// ────────────────────────────────────────────────────────────────────────────
// LAYER 1 — DETERMINISTIC GUARDRAILS
// Hard, auditable rules evaluated in TypeScript BEFORE any model call. Any hit
// => immediate escalation with the rule named, no LLM needed. 100% explainable.
// These are the regulator-proof clear cases; the model only sees the grey zone.
// ────────────────────────────────────────────────────────────────────────────

import { GUARDRAILS } from "./config";
import type { AgentAction, GuardrailHit } from "./types";

const money = (n: number, currency = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(n);

/**
 * Evaluate all deterministic guardrails against an action.
 * Returns every rule that fired (may be empty). Order is stable for audit.
 */
export function evaluateGuardrails(action: AgentAction): GuardrailHit[] {
  const hits: GuardrailHit[] = [];
  const p = action.payload;
  const value = typeof p.monetaryValue === "number" ? p.monetaryValue : 0;
  const currency = (p.currency as string) ?? "USD";
  const accountAge =
    typeof p.recipientAccountAgeDays === "number"
      ? p.recipientAccountAgeDays
      : undefined;
  const affected =
    typeof p.affectedCount === "number" ? p.affectedCount : undefined;

  // New payee + money movement.
  if (
    value > GUARDRAILS.NEW_ACCOUNT_VALUE &&
    accountAge !== undefined &&
    accountAge <= GUARDRAILS.NEW_ACCOUNT_DAYS
  ) {
    hits.push({
      ruleName: "New-payee transfer limit",
      verdict: "block",
      detail: `${money(value, currency)} to an account added ${accountAge} day(s) ago (limit: ${money(
        GUARDRAILS.NEW_ACCOUNT_VALUE,
        currency,
      )} within ${GUARDRAILS.NEW_ACCOUNT_DAYS} days).`,
    });
  }

  // Maker-checker for large single payments.
  if (
    value > GUARDRAILS.MAKER_CHECKER_VALUE &&
    (action.domain === "payments" || action.domain === "treasury")
  ) {
    hits.push({
      ruleName: "Maker-checker threshold",
      verdict: "review",
      detail: `Single payment of ${money(value, currency)} exceeds the ${money(
        GUARDRAILS.MAKER_CHECKER_VALUE,
        currency,
      )} maker-checker limit.`,
    });
  }

  // Changes to payout / payroll / bank-account details.
  if (
    action.type.includes("bank_detail") ||
    action.type.includes("payout_detail") ||
    action.type.includes("payroll_detail") ||
    action.domain === "payroll"
  ) {
    if (action.type.includes("run")) {
      // A routine payroll RUN within norms is not a details change — skip here.
    } else {
      hits.push({
        ruleName: "Banking-detail change control",
        verdict: "review",
        detail: "Changes to payout, payroll, or bank-account details always require human approval.",
      });
    }
  }

  // Refunds above the review threshold.
  if (action.domain === "refunds" && value > GUARDRAILS.REFUND_REVIEW_VALUE) {
    hits.push({
      ruleName: "Refund approval limit",
      verdict: "review",
      detail: `Refund of ${money(value, currency)} exceeds the ${money(
        GUARDRAILS.REFUND_REVIEW_VALUE,
        currency,
      )} approval limit.`,
    });
  }

  // Irreversible + high value.
  if (
    action.reversible === false &&
    value > GUARDRAILS.IRREVERSIBLE_VALUE &&
    !hits.some((h) => h.ruleName === "New-payee transfer limit")
  ) {
    hits.push({
      ruleName: "Irreversible high-value action",
      verdict: "review",
      detail: `Irreversible action moving ${money(value, currency)} (over ${money(
        GUARDRAILS.IRREVERSIBLE_VALUE,
        currency,
      )}).`,
    });
  }

  // Bulk data export / deletion / PII access.
  if (
    action.domain === "data" &&
    (action.type.includes("export") ||
      action.type.includes("delete") ||
      action.type.includes("bulk"))
  ) {
    hits.push({
      ruleName: "Customer-data protection",
      verdict: "block",
      detail: "Export, deletion, or bulk access of customer data requires human approval.",
    });
  }

  // Blast radius — affects many people at once.
  if (affected !== undefined && affected > GUARDRAILS.BLAST_RADIUS_COUNT) {
    hits.push({
      ruleName: "Blast-radius limit",
      verdict: "review",
      detail: `Action affects ${affected.toLocaleString()} customers (limit: ${GUARDRAILS.BLAST_RADIUS_COUNT.toLocaleString()}).`,
    });
  }

  return hits;
}

/** Pick the most severe verdict among guardrail hits (block > review). */
export function worstGuardrailVerdict(
  hits: GuardrailHit[],
): "review" | "block" | null {
  if (hits.length === 0) return null;
  return hits.some((h) => h.verdict === "block") ? "block" : "review";
}
