// ────────────────────────────────────────────────────────────────────────────
// Agent identities + least-privilege capabilities (Auth0 agent-permission model).
// Each agent is granted ONLY the specific, bounded capabilities it needs. Sentinel
// checks every action against the acting agent's grant BEFORE risk is considered —
// an action outside the grant is a privilege escalation and is denied on sight.
// ────────────────────────────────────────────────────────────────────────────

import type { AgentIdentity } from "./engine/types";

export const DEFAULT_AGENTS: AgentIdentity[] = [
  {
    id: "support-agent",
    name: "Support Agent",
    role: "Customer service",
    revoked: false,
    capabilities: [
      {
        id: "cap-support-refund",
        label: "Issue refunds up to $100",
        domains: ["refunds"],
        types: ["issue_refund"],
        maxAmount: 100,
      },
    ],
  },
  {
    id: "payments-agent",
    name: "Payments Agent",
    role: "Accounts payable",
    revoked: false,
    capabilities: [
      {
        id: "cap-payments",
        label: "Vendor payments up to $10,000",
        domains: ["payments"],
        maxAmount: 10_000,
      },
    ],
  },
  {
    id: "treasury-agent",
    name: "Treasury Agent",
    role: "Treasury operations",
    revoked: false,
    capabilities: [
      {
        id: "cap-treasury-wire",
        label: "Wires up to $50,000 (always reviewed)",
        domains: ["treasury"],
        maxAmount: 50_000,
        requiresApproval: true,
      },
    ],
  },
  {
    id: "payroll-agent",
    name: "Payroll Agent",
    role: "Payroll & finance ops",
    revoked: false,
    capabilities: [
      {
        id: "cap-payroll",
        label: "Run payroll & update payroll details",
        domains: ["payroll"],
      },
    ],
  },
  {
    id: "insights-agent",
    name: "Insights Agent",
    role: "Analytics & lifecycle",
    revoked: false,
    capabilities: [
      {
        id: "cap-insights-read",
        label: "Read-only customer analytics",
        domains: ["data"],
        types: ["read", "query", "analyze"],
      },
      {
        id: "cap-insights-marketing",
        label: "Send marketing campaigns",
        domains: ["marketing"],
      },
    ],
  },

  // ── Beyond finance: the same model governs non-money agents too ──────────
  {
    id: "ops-agent",
    name: "Ops Agent",
    role: "DevOps & infrastructure",
    revoked: false,
    capabilities: [
      {
        id: "cap-ops",
        label: "Deploy & read-only ops (no destructive changes)",
        domains: ["infrastructure"],
        types: ["deploy", "read", "restart", "scale", "rollback"],
      },
    ],
  },
  {
    id: "it-agent",
    name: "IT Agent",
    role: "Identity & access",
    revoked: false,
    capabilities: [
      {
        id: "cap-it",
        label: "Provision standard roles (no admin grants)",
        domains: ["access"],
        types: ["reset", "provision_standard", "disable", "unlock"],
      },
    ],
  },
];
