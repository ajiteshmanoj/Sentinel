// ────────────────────────────────────────────────────────────────────────────
// Shared engine contract. Everything the deterministic guardrails (Layer 1),
// the LLM adjudicator (Layer 2), the decision combiner, and the UI agree on.
// No `any` anywhere in this file or the engine path that imports it.
// ────────────────────────────────────────────────────────────────────────────

export type Verdict = "allow" | "review" | "block";

export type ActionDomain =
  | "payments"
  | "treasury"
  | "refunds"
  | "payroll"
  | "data"
  | "marketing";

/**
 * A single proposed agent action. The action TEXT is scripted (authored in
 * lib/scenarios.ts) so the demo is reproducible — but it is judged LIVE.
 */
export interface AgentAction {
  id: string;
  domain: ActionDomain;
  /** Short machine type, e.g. "wire_transfer", "issue_refund". */
  type: string;
  /** One-line plain-language summary a human reads instantly. */
  summary: string;
  /** Structured payload facts shown on the card and sent to the model. */
  payload: {
    monetaryValue?: number;
    currency?: string;
    recipient?: string;
    /** How many days ago the recipient account was added, if relevant. */
    recipientAccountAgeDays?: number;
    /** Number of customers / records affected. */
    affectedCount?: number;
    /** Free-form extra facts surfaced to the model + UI. */
    [key: string]: string | number | boolean | undefined;
  };
  /** Whether the action can be undone after execution. */
  reversible: boolean;
  /** Marks the centerpiece "money moment" actions for extra demo drama. */
  headline?: boolean;
}

/** An organisation policy rule, editable in the UI. */
export interface PolicyRule {
  id: string;
  text: string;
  enabled: boolean;
}

/**
 * Editable deterministic-guardrail thresholds. Surfaced in the UI so an operator
 * can change a limit live and re-run — proving the engine reads the policy, not a
 * script. Any omitted field falls back to the locked config default.
 */
export interface GuardrailThresholds {
  newAccountValue: number;
  makerCheckerValue: number;
  refundReviewValue: number;
  irreversibleValue: number;
}

/** A deterministic guardrail hit (Layer 1). */
export interface GuardrailHit {
  ruleName: string;
  verdict: Exclude<Verdict, "allow">;
  detail: string;
}

/** The strict JSON the LLM adjudicator (Layer 2) must return. */
export interface AdjudicatorOutput {
  verdict: Verdict;
  riskScore: number;
  confidence: number;
  riskFactors: string[];
  policyViolations: string[];
  reasoning: string;
  suggestedHumanAction: string;
}

/** Which layer is responsible for the final escalation. */
export type CaughtBy =
  | "policy guardrail"
  | "risk model"
  | "risk model (low confidence)"
  | "fail-safe (engine error)"
  | null; // null === auto-approved, nothing caught it

/** The complete verdict returned by POST /api/judge. */
export interface JudgeResult {
  actionId: string;
  verdict: Verdict;
  riskScore: number;
  confidence: number;
  riskFactors: string[];
  policyViolations: string[];
  reasoning: string;
  suggestedHumanAction: string;
  /** Deterministic guardrails that fired (Layer 1). */
  guardrailHits: GuardrailHit[];
  /** Human-readable provenance of the final decision. */
  caughtBy: CaughtBy;
  /** True when the action was escalated (review or block). */
  escalated: boolean;
  /** Whether Layer 2 (the model) was actually invoked. */
  modelInvoked: boolean;
  /** Raw model response text for the "View raw model response" affordance. */
  rawModelResponse: string | null;
  /** Engine timing in ms, for the demo. */
  latencyMs: number;
  /** Set when the engine fell back to a fail-safe review. */
  failSafe: boolean;
}

export interface JudgeRequestBody {
  action: AgentAction;
  policyRules: PolicyRule[];
  /** Optional live overrides for the deterministic guardrail thresholds. */
  thresholds?: Partial<GuardrailThresholds>;
}
