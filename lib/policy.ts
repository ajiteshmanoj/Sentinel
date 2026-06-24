// ────────────────────────────────────────────────────────────────────────────
// Default organisation policy rules — MAS / maker-checker flavored.
// EDITABLE in the UI. Editing a rule and re-running visibly changes verdicts,
// which proves the engine genuinely reads the policy.
// ────────────────────────────────────────────────────────────────────────────

import type { PolicyRule } from "./engine/types";

export const DEFAULT_POLICY_RULES: PolicyRule[] = [
  {
    id: "rule-new-payee",
    text: "Never move more than $1,000 to an account added in the last 30 days without human approval.",
    enabled: true,
  },
  {
    id: "rule-maker-checker",
    text: "Any single payment above $10,000 requires human approval (maker-checker).",
    enabled: true,
  },
  {
    id: "rule-banking-details",
    text: "Changes to payout, payroll, or bank-account details always require human approval.",
    enabled: true,
  },
  {
    id: "rule-refunds",
    text: "Refunds over $500 require human approval.",
    enabled: true,
  },
  {
    id: "rule-customer-data",
    text: "Never delete or export customer data without human approval.",
    enabled: true,
  },
];
