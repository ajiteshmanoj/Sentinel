// ────────────────────────────────────────────────────────────────────────────
// LAYER 2 — LLM ADJUDICATOR
// Calls gpt-5.4 via the OpenAI Responses API with Structured Outputs (strict
// JSON schema) so the verdict is ALWAYS valid JSON. This is the live, real,
// consequential call — nothing here is cached or faked.
// ────────────────────────────────────────────────────────────────────────────

import "server-only";
import OpenAI from "openai";
import {
  JUDGE_MODEL,
  JUDGE_REASONING_EFFORT,
  MODEL_TIMEOUT_MS,
  SUMMARY_MODEL,
} from "./config";
import {
  SENTINEL_ANALYST_PROMPT,
  SENTINEL_LAYER2_SYSTEM_PROMPT,
} from "./prompt";
import type { AdjudicatorOutput, AgentAction, PolicyRule } from "./types";

let client: OpenAI | null = null;
function getClient(): OpenAI {
  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
}

export function hasApiKey(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

/** Strict JSON schema enforced on the model via Structured Outputs. */
const ADJUDICATOR_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    verdict: { type: "string", enum: ["allow", "review", "block"] },
    riskScore: { type: "integer", minimum: 0, maximum: 100 },
    confidence: { type: "number", minimum: 0, maximum: 1 },
    riskFactors: { type: "array", items: { type: "string" } },
    policyViolations: { type: "array", items: { type: "string" } },
    reasoning: { type: "string" },
    suggestedHumanAction: { type: "string" },
  },
  required: [
    "verdict",
    "riskScore",
    "confidence",
    "riskFactors",
    "policyViolations",
    "reasoning",
    "suggestedHumanAction",
  ],
} as const;

function buildUserMessage(action: AgentAction, rules: PolicyRule[]): string {
  const enabledRules = rules.filter((r) => r.enabled);
  const rulesBlock =
    enabledRules.length > 0
      ? enabledRules.map((r, i) => `${i + 1}. ${r.text}`).join("\n")
      : "(no policy rules defined)";

  return [
    "PROPOSED AGENT ACTION:",
    JSON.stringify(
      {
        domain: action.domain,
        type: action.type,
        summary: action.summary,
        reversible: action.reversible,
        payload: action.payload,
      },
      null,
      2,
    ),
    "",
    "ORGANISATION POLICY RULES:",
    rulesBlock,
    "",
    "Adjudicate this action now. Return only the structured fields.",
  ].join("\n");
}

export interface AdjudicatorResult {
  output: AdjudicatorOutput;
  raw: string;
}

/**
 * Run the live LLM adjudication. Throws on API error / timeout / malformed
 * output — the caller (decision combiner) is responsible for the fail-safe.
 */
export async function adjudicate(
  action: AgentAction,
  rules: PolicyRule[],
): Promise<AdjudicatorResult> {
  const response = await getClient().responses.create(
    {
      model: JUDGE_MODEL,
      reasoning: { effort: JUDGE_REASONING_EFFORT },
      input: [
        { role: "system", content: SENTINEL_LAYER2_SYSTEM_PROMPT },
        { role: "user", content: buildUserMessage(action, rules) },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "sentinel_verdict",
          strict: true,
          schema: ADJUDICATOR_SCHEMA,
        },
      },
    },
    { timeout: MODEL_TIMEOUT_MS, maxRetries: 1 },
  );

  const raw = response.output_text;
  if (!raw) {
    throw new Error("Empty model response");
  }

  const parsed = JSON.parse(raw) as AdjudicatorOutput;
  return { output: normalize(parsed), raw };
}

/**
 * Stream a live, plain-English risk narration (gpt-5.4-mini) token-by-token via
 * the onToken callback. This is the visible "watch the AI think" layer — it is
 * NOT the authoritative verdict. Best-effort: callers ignore failures.
 */
export async function streamNarration(
  action: AgentAction,
  rules: PolicyRule[],
  onToken: (text: string) => void,
): Promise<string> {
  const stream = await getClient().responses.create({
    model: SUMMARY_MODEL,
    reasoning: { effort: "low" },
    stream: true,
    input: [
      { role: "system", content: SENTINEL_ANALYST_PROMPT },
      { role: "user", content: buildUserMessage(action, rules) },
    ],
  });

  let full = "";
  for await (const event of stream) {
    if (event.type === "response.output_text.delta") {
      full += event.delta;
      onToken(event.delta);
    }
  }
  return full;
}

/** Defensive clamping — Structured Outputs already guarantees shape. */
function normalize(o: AdjudicatorOutput): AdjudicatorOutput {
  return {
    verdict: o.verdict,
    riskScore: clamp(Math.round(o.riskScore), 0, 100),
    confidence: clamp(o.confidence, 0, 1),
    riskFactors: Array.isArray(o.riskFactors) ? o.riskFactors : [],
    policyViolations: Array.isArray(o.policyViolations) ? o.policyViolations : [],
    reasoning: o.reasoning ?? "",
    suggestedHumanAction: o.suggestedHumanAction ?? "",
  };
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}
