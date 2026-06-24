// ────────────────────────────────────────────────────────────────────────────
// LAYER 0 — CAPABILITY SCOPE CHECK
// Runs in the agent runtime BEFORE any risk assessment or model call. Confirms
// the proposed action falls within the acting agent's least-privilege grant.
// A revoked agent is denied instantly; an action outside the grant is a
// privilege escalation and is blocked on sight — no model needed.
// ────────────────────────────────────────────────────────────────────────────

import type {
  AgentAction,
  AgentIdentity,
  Capability,
  JudgeResult,
} from "./types";

const money = (n: number, currency = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(n);

export interface ScopeResult {
  allowed: boolean;
  reason: "revoked" | "out_of_scope" | null;
  detail: string;
  /** The grant that authorized the action, when allowed. */
  matched?: Capability;
}

function capabilityCovers(cap: Capability, action: AgentAction): boolean {
  if (!cap.domains.includes(action.domain)) return false;
  if (cap.types && !cap.types.some((t) => action.type.includes(t))) return false;
  const amount =
    typeof action.payload.monetaryValue === "number"
      ? action.payload.monetaryValue
      : 0;
  if (cap.maxAmount !== undefined && amount > cap.maxAmount) return false;
  return true;
}

/** Check an action against the acting agent's granted capabilities. */
export function checkScope(
  agent: AgentIdentity,
  action: AgentAction,
): ScopeResult {
  if (agent.revoked) {
    return {
      allowed: false,
      reason: "revoked",
      detail: `${agent.name}'s access has been revoked — all of its actions are denied.`,
    };
  }

  const matched = agent.capabilities.find((c) => capabilityCovers(c, action));
  if (matched) {
    return {
      allowed: true,
      reason: null,
      detail: `Within grant: "${matched.label}".`,
      matched,
    };
  }

  // Build a precise privilege-escalation explanation.
  const amount = action.payload.monetaryValue;
  const sameDomain = agent.capabilities.find((c) =>
    c.domains.includes(action.domain),
  );
  let detail: string;
  if (sameDomain && sameDomain.maxAmount !== undefined && typeof amount === "number") {
    detail = `${agent.name} is granted "${sameDomain.label}", but attempted ${money(
      amount,
    )} — beyond its capability.`;
  } else if (sameDomain) {
    detail = `${agent.name} is not granted this action type within ${action.domain} (privilege escalation).`;
  } else {
    detail = `${agent.name} holds no capability for ${action.domain} actions (privilege escalation).`;
  }

  return { allowed: false, reason: "out_of_scope", detail };
}

/** A deterministic block verdict for an out-of-scope / revoked action. */
export function scopeBlockResult(
  action: AgentAction,
  agent: AgentIdentity,
  scope: ScopeResult,
  startedAt: number,
): JudgeResult {
  const revoked = scope.reason === "revoked";
  return {
    actionId: action.id,
    verdict: "block",
    riskScore: revoked ? 95 : 88,
    confidence: 1,
    riskFactors: [
      revoked ? "revoked agent" : "out of scope",
      "privilege escalation",
    ].filter((_, i) => (revoked ? i === 0 : true)),
    policyViolations: [scope.detail],
    reasoning: scope.detail,
    suggestedHumanAction: revoked
      ? "Restore the agent only if this access is intended."
      : "Confirm whether this agent should be granted this capability, or deny the action.",
    guardrailHits: [],
    caughtBy: revoked ? "revoked agent" : "capability scope",
    escalated: true,
    modelInvoked: false,
    rawModelResponse: null,
    latencyMs: Date.now() - startedAt,
    failSafe: false,
  };
}
