// ────────────────────────────────────────────────────────────────────────────
// DECISION COMBINATION — the final verdict.
// Orchestrates Layer 1 (guardrails) then Layer 2 (model) and combines them with
// policy-owned threshold bands + a strict fail-safe bias. This is the single
// place the escalation decision is made, so it is auditable and testable.
// ────────────────────────────────────────────────────────────────────────────

import "server-only";
import { adjudicate, hasApiKey } from "./adjudicator";
import { MIN_CONFIDENCE, RISK_BANDS } from "./config";
import { evaluateGuardrails, worstGuardrailVerdict } from "./guardrails";
import type {
  AgentAction,
  CaughtBy,
  GuardrailThresholds,
  JudgeResult,
  PolicyRule,
  Verdict,
} from "./types";

/** Map a model riskScore to a policy-owned verdict band. */
function bandFor(score: number): Verdict {
  if (score < RISK_BANDS.ALLOW_MAX) return "allow";
  if (score > RISK_BANDS.BLOCK_MIN) return "block";
  return "review";
}

/** Severity ordering for combining verdicts (higher = more severe). */
const SEVERITY: Record<Verdict, number> = { allow: 0, review: 1, block: 2 };
function mostSevere(a: Verdict, b: Verdict): Verdict {
  return SEVERITY[a] >= SEVERITY[b] ? a : b;
}

/**
 * Judge one action end-to-end. NEVER throws — on any failure it falls back to a
 * fail-safe "review". This is the function the route handler calls.
 */
export async function judge(
  action: AgentAction,
  policyRules: PolicyRule[],
  thresholds?: Partial<GuardrailThresholds>,
): Promise<JudgeResult> {
  const start = Date.now();

  // ── LAYER 1: deterministic guardrails (always run, in code, first) ────────
  const guardrailHits = evaluateGuardrails(action, thresholds);
  const guardrailVerdict = worstGuardrailVerdict(guardrailHits);

  // If a hard guardrail fires, we already have a defensible escalation. We STILL
  // run the model for its reasoning/score (richer human context) — but the
  // floor verdict is owned by the guardrail and the model can only raise it.

  // If there's no API key, run a guardrail-only fail-safe path cleanly.
  if (!hasApiKey()) {
    return guardrailOnlyResult(action, guardrailHits, guardrailVerdict, start);
  }

  try {
    const { output, raw } = await adjudicate(action, policyRules);

    // Policy-owned band from the model's score (not the model's free-text verdict).
    const band = bandFor(output.riskScore);
    const lowConfidence = output.confidence < MIN_CONFIDENCE;

    // Combine: most severe of (model's own verdict, score band, guardrail floor).
    let finalVerdict: Verdict = mostSevere(output.verdict, band);
    if (guardrailVerdict) {
      finalVerdict = mostSevere(finalVerdict, guardrailVerdict);
    }
    // Low confidence escalates regardless of score (never below review).
    if (lowConfidence && finalVerdict === "allow") {
      finalVerdict = "review";
    }

    const escalated = finalVerdict !== "allow";
    const caughtBy = determineCaughtBy(
      escalated,
      guardrailVerdict !== null,
      lowConfidence,
    );

    return {
      actionId: action.id,
      verdict: finalVerdict,
      riskScore: output.riskScore,
      confidence: output.confidence,
      riskFactors: output.riskFactors,
      policyViolations: output.policyViolations,
      reasoning: output.reasoning,
      suggestedHumanAction: output.suggestedHumanAction,
      guardrailHits,
      caughtBy,
      escalated,
      modelInvoked: true,
      rawModelResponse: raw,
      latencyMs: Date.now() - start,
      failSafe: false,
    };
  } catch (err) {
    // FAIL-SAFE BIAS: on any API error / malformed output / timeout, default to
    // "review". Never crash, never allow by default. If a guardrail demanded
    // block, honour that stronger verdict.
    const failVerdict: Verdict = guardrailVerdict
      ? mostSevere("review", guardrailVerdict)
      : "review";
    return {
      actionId: action.id,
      verdict: failVerdict,
      riskScore: failVerdict === "block" ? 85 : 55,
      confidence: 0,
      riskFactors: guardrailHits.map((h) => h.ruleName),
      policyViolations: [],
      reasoning:
        "Sentinel could not complete a live risk assessment, so this action was held for human review as a precaution.",
      suggestedHumanAction:
        "Review this action manually; the automated assessment was unavailable.",
      guardrailHits,
      caughtBy: guardrailVerdict ? "policy guardrail" : "fail-safe (engine error)",
      escalated: true,
      modelInvoked: true,
      rawModelResponse:
        err instanceof Error ? `Engine error: ${err.message}` : "Engine error",
      latencyMs: Date.now() - start,
      failSafe: true,
    };
  }
}

function determineCaughtBy(
  escalated: boolean,
  guardrailFired: boolean,
  lowConfidence: boolean,
): CaughtBy {
  if (!escalated) return null;
  // A deterministic guardrail is the strongest, most defensible provenance.
  if (guardrailFired) return "policy guardrail";
  if (lowConfidence) return "risk model (low confidence)";
  return "risk model";
}

/** Path used when no API key is configured: guardrails still protect, cleanly. */
function guardrailOnlyResult(
  action: AgentAction,
  guardrailHits: ReturnType<typeof evaluateGuardrails>,
  guardrailVerdict: "review" | "block" | null,
  start: number,
): JudgeResult {
  const verdict: Verdict = guardrailVerdict ?? "allow";
  const escalated = verdict !== "allow";
  return {
    actionId: action.id,
    verdict,
    riskScore: verdict === "block" ? 85 : verdict === "review" ? 55 : 12,
    confidence: 1,
    riskFactors: guardrailHits.map((h) => h.ruleName),
    policyViolations: guardrailHits.map((h) => h.detail),
    reasoning: escalated
      ? guardrailHits.map((h) => h.detail).join(" ")
      : "No deterministic guardrail fired. (Live model assessment is offline — add OPENAI_API_KEY to enable Layer 2.)",
    suggestedHumanAction: escalated
      ? "Verify the flagged details before approving."
      : "",
    guardrailHits,
    caughtBy: escalated ? "policy guardrail" : null,
    escalated,
    modelInvoked: false,
    rawModelResponse: null,
    latencyMs: Date.now() - start,
    failSafe: false,
  };
}
