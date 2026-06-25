// ────────────────────────────────────────────────────────────────────────────
// Engine configuration. Models are LOCKED per the spec; thresholds are policy-
// owned (not the model's whim). Centralized so they are auditable in one place.
// ────────────────────────────────────────────────────────────────────────────

/** Core consequential risk-judgment call. */
export const JUDGE_MODEL = process.env.SENTINEL_JUDGE_MODEL ?? "gpt-5.4";

/** Optional secondary "explain to reviewer" summariser. */
export const SUMMARY_MODEL =
  process.env.SENTINEL_SUMMARY_MODEL ?? "gpt-5.4-mini";

/**
 * Text-to-speech for the guided demo's voice (the presenter actually speaks),
 * powered by ElevenLabs. The key is read server-side only.
 */
export const ELEVENLABS_MODEL =
  process.env.ELEVENLABS_MODEL_ID ?? "eleven_turbo_v2_5";
/** Default voice: "Rachel" — calm, clear narrator. Override with ELEVENLABS_VOICE_ID. */
export const ELEVENLABS_VOICE =
  process.env.ELEVENLABS_VOICE_ID ?? "21m00Tcm4TlvDq8ikWAM";

/** Reasoning effort for the judge. Spec: "high". */
export const JUDGE_REASONING_EFFORT: "low" | "medium" | "high" = "high";

/**
 * Threshold bands — owned by policy, applied AFTER the model returns. These map
 * a riskScore to a verdict band deterministically so the escalation logic is
 * defensible and not subject to model drift.
 */
export const RISK_BANDS = {
  /** riskScore < ALLOW_MAX  => allow band */
  ALLOW_MAX: 30,
  /** riskScore > BLOCK_MIN  => block band  (30..70 inclusive => review) */
  BLOCK_MIN: 70,
} as const;

/** Below this confidence we escalate regardless of score (fail-safe bias). */
export const MIN_CONFIDENCE = 0.6;

/** Server-side request timeout for the model call (ms). */
export const MODEL_TIMEOUT_MS = 30_000;

import type { GuardrailThresholds } from "./types";

/** Deterministic guardrail tuning (mirrors the default policy rules). */
export const GUARDRAILS = {
  /** New-payee window in days. */
  NEW_ACCOUNT_DAYS: 30,
  /** Move above this to a new account => escalate. */
  NEW_ACCOUNT_VALUE: 1_000,
  /** Single payment above this => maker-checker review. */
  MAKER_CHECKER_VALUE: 10_000,
  /** Refunds above this => review. */
  REFUND_REVIEW_VALUE: 500,
  /** Irreversible + above this value => review. */
  IRREVERSIBLE_VALUE: 1_000,
  /** Affecting more than this many customers => review. */
  BLAST_RADIUS_COUNT: 1_000,
} as const;

/** The editable subset of thresholds, with their defaults. */
export const DEFAULT_THRESHOLDS: GuardrailThresholds = {
  newAccountValue: GUARDRAILS.NEW_ACCOUNT_VALUE,
  makerCheckerValue: GUARDRAILS.MAKER_CHECKER_VALUE,
  refundReviewValue: GUARDRAILS.REFUND_REVIEW_VALUE,
  irreversibleValue: GUARDRAILS.IRREVERSIBLE_VALUE,
};
