// ────────────────────────────────────────────────────────────────────────────
// Client-side console store. Drives the scripted feed, calls the LIVE engine
// (/api/judge) for each action, holds verdicts, human decisions, and stats.
//
// Two run modes:
//  - Sentinel ON  → every action is judged live by the engine.
//  - Sentinel OFF → the counterfactual: actions just execute. Dangerous ones
//    (computed from the SAME deterministic rules) slip through — money gone.
// ────────────────────────────────────────────────────────────────────────────

import { create } from "zustand";
import { DEFAULT_THRESHOLDS } from "./engine/config";
import { evaluateGuardrails, worstGuardrailVerdict } from "./engine/guardrails";
import { DEFAULT_POLICY_RULES } from "./policy";
import { SCENARIO } from "./scenarios";
import type {
  AgentAction,
  GuardrailThresholds,
  JudgeResult,
  PolicyRule,
} from "./engine/types";

export type ItemStatus =
  | "queued"
  | "assessing"
  | "resolved"
  | "error"
  | "executed"; // Sentinel-OFF outcome
export type HumanDecision = "approved" | "edited" | "blocked" | null;

/** What happens to an action when Sentinel is OFF. */
export interface OffOutcome {
  dangerous: boolean;
  /** What Sentinel WOULD have done, for the "you needed this" callout. */
  wouldHaveBeen: "review" | "block" | null;
  label: string;
}

export interface FeedItem {
  action: AgentAction;
  status: ItemStatus;
  result: JudgeResult | null;
  offOutcome: OffOutcome | null;
  /** Live gpt-5.4-mini narration, streamed token-by-token while assessing. */
  streamedReasoning: string;
  humanDecision: HumanDecision;
  inReview: boolean;
}

export type RunState = "idle" | "running" | "paused" | "done";

interface ConsoleState {
  items: FeedItem[];
  policyRules: PolicyRule[];
  thresholds: GuardrailThresholds;
  sentinelEnabled: boolean;
  runState: RunState;
  speedMs: number;
  activeReviewId: string | null;
  /** id of the card currently spotlighted by a dramatic catch (dims siblings). */
  spotlightId: string | null;
  runToken: number;

  // actions
  runScenario: () => Promise<void>;
  pause: () => void;
  reset: () => void;
  setSpeed: (ms: number) => void;
  setSentinelEnabled: (on: boolean) => void;
  openReview: (id: string) => void;
  closeReview: () => void;
  decide: (id: string, decision: Exclude<HumanDecision, null>) => void;
  updatePolicyRule: (id: string, text: string) => void;
  togglePolicyRule: (id: string) => void;
  addPolicyRule: () => void;
  removePolicyRule: (id: string) => void;
  setThreshold: (key: keyof GuardrailThresholds, value: number) => void;
  resetPolicy: () => void;
}

const freshItems = (): FeedItem[] =>
  SCENARIO.map((action) => ({
    action,
    status: "queued",
    result: null,
    offOutcome: null,
    streamedReasoning: "",
    humanDecision: null,
    inReview: false,
  }));

function delay(ms: number, token: number, getToken: () => number) {
  return new Promise<void>((resolve, reject) => {
    setTimeout(() => {
      if (getToken() !== token) reject(new Error("cancelled"));
      else resolve();
    }, ms);
  });
}

async function judgeAction(
  action: AgentAction,
  policyRules: PolicyRule[],
  thresholds: GuardrailThresholds,
): Promise<JudgeResult> {
  const res = await fetch("/api/judge", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, policyRules, thresholds }),
  });
  if (!res.ok) throw new Error(`Engine returned ${res.status}`);
  return (await res.json()) as JudgeResult;
}

/**
 * Streaming judge: reads the SSE feed, forwarding narration tokens live and
 * returning the authoritative verdict. Throws if the stream errors so the caller
 * can fall back to the non-streaming endpoint.
 */
async function judgeActionStream(
  action: AgentAction,
  policyRules: PolicyRule[],
  thresholds: GuardrailThresholds,
  onToken: (text: string) => void,
): Promise<JudgeResult> {
  const res = await fetch("/api/judge/stream", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, policyRules, thresholds }),
  });
  if (!res.ok || !res.body) throw new Error(`Stream returned ${res.status}`);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let result: JudgeResult | null = null;

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const chunks = buffer.split("\n\n");
    buffer = chunks.pop() ?? "";
    for (const chunk of chunks) {
      const line = chunk.trim();
      if (!line.startsWith("data:")) continue;
      const evt = JSON.parse(line.slice(5).trim()) as {
        type: string;
        text?: string;
        result?: JudgeResult;
        message?: string;
      };
      if (evt.type === "token" && evt.text) onToken(evt.text);
      else if (evt.type === "verdict" && evt.result) result = evt.result;
      else if (evt.type === "error") throw new Error(evt.message ?? "stream error");
    }
  }

  if (!result) throw new Error("stream ended without a verdict");
  return result;
}

/** Sentinel-OFF: compute the counterfactual outcome from the same rules. */
function computeOffOutcome(
  action: AgentAction,
  thresholds: GuardrailThresholds,
): OffOutcome {
  const hits = evaluateGuardrails(action, thresholds);
  const wouldHaveBeen = worstGuardrailVerdict(hits);
  const dangerous = wouldHaveBeen !== null && !action.reversible;
  const reallyDangerous = wouldHaveBeen !== null; // any escalation-worthy action
  return {
    dangerous: reallyDangerous,
    wouldHaveBeen,
    label: dangerous
      ? "Executed · irreversible · money gone"
      : reallyDangerous
        ? "Executed without review"
        : "Executed",
  };
}

export const useConsole = create<ConsoleState>((set, get) => ({
  items: freshItems(),
  policyRules: DEFAULT_POLICY_RULES.map((r) => ({ ...r })),
  thresholds: { ...DEFAULT_THRESHOLDS },
  sentinelEnabled: true,
  runState: "idle",
  speedMs: 1100,
  activeReviewId: null,
  spotlightId: null,
  runToken: 0,

  runScenario: async () => {
    const state = get();
    if (state.runState === "running") return;

    const startFresh = state.runState === "idle" || state.runState === "done";
    const token = state.runToken + 1;
    set({
      runToken: token,
      runState: "running",
      items: startFresh ? freshItems() : state.items,
      activeReviewId: startFresh ? null : state.activeReviewId,
      spotlightId: null,
    });

    const isCancelled = () => get().runToken !== token;

    for (let i = 0; i < get().items.length; i++) {
      if (isCancelled()) return;
      const cur = get().items[i];
      if (cur.status === "resolved" || cur.status === "executed") continue;

      const action = cur.action;
      const sentinelOn = get().sentinelEnabled;

      // Mark assessing / executing (reset any prior streamed narration).
      set((s) => ({
        items: s.items.map((it, idx) =>
          idx === i ? { ...it, status: "assessing", streamedReasoning: "" } : it,
        ),
      }));

      // Minimum dwell so the "assessing"/"executing" beat is visible.
      const dwell = delay(
        Math.max(650, get().speedMs * 0.8),
        token,
        () => get().runToken,
      ).catch(() => undefined);

      if (sentinelOn) {
        // ── Sentinel ON: live engine (streamed, with fallback) ────────────
        let result: JudgeResult | null = null;
        let errored = false;
        const onToken = (text: string) => {
          if (isCancelled()) return;
          set((s) => ({
            items: s.items.map((it, idx) =>
              idx === i
                ? { ...it, streamedReasoning: it.streamedReasoning + text }
                : it,
            ),
          }));
        };
        try {
          result = await judgeActionStream(
            action,
            get().policyRules,
            get().thresholds,
            onToken,
          );
        } catch {
          // Streaming failed — fall back to the rock-solid non-streaming engine.
          try {
            result = await judgeAction(
              action,
              get().policyRules,
              get().thresholds,
            );
          } catch {
            errored = true;
          }
        }
        await dwell;
        if (isCancelled()) return;

        set((s) => ({
          items: s.items.map((it, idx) =>
            idx === i
              ? {
                  ...it,
                  status: errored ? "error" : "resolved",
                  result,
                  inReview: result ? result.escalated : false,
                }
              : it,
          ),
          activeReviewId:
            result && result.escalated && !s.activeReviewId
              ? action.id
              : s.activeReviewId,
          // Spotlight a block (dims the rest of the feed for a beat).
          spotlightId:
            result && result.verdict === "block" ? action.id : s.spotlightId,
        }));

        // Hold the dramatic catch, then clear the spotlight.
        if (result && result.verdict === "block") {
          const hold = action.headline ? 1700 : 1100;
          delay(hold, token, () => get().runToken)
            .then(() => {
              if (!isCancelled() && get().spotlightId === action.id) {
                set({ spotlightId: null });
              }
            })
            .catch(() => undefined);
        }
      } else {
        // ── Sentinel OFF: the counterfactual ──────────────────────────────
        await dwell;
        if (isCancelled()) return;
        const offOutcome = computeOffOutcome(action, get().thresholds);
        set((s) => ({
          items: s.items.map((it, idx) =>
            idx === i
              ? { ...it, status: "executed", offOutcome }
              : it,
          ),
        }));
      }

      // Pause between actions; headline catches get a longer beat.
      const extra =
        sentinelOn &&
        get().items[i].result?.verdict === "block" &&
        action.headline
          ? 900
          : 0;
      try {
        await delay(get().speedMs + extra, token, () => get().runToken);
      } catch {
        return;
      }
    }

    if (!isCancelled()) set({ runState: "done" });
  },

  pause: () => set({ runState: "paused", runToken: get().runToken + 1 }),

  reset: () =>
    set({
      items: freshItems(),
      runState: "idle",
      activeReviewId: null,
      spotlightId: null,
      runToken: get().runToken + 1,
    }),

  setSpeed: (ms) => set({ speedMs: ms }),

  setSentinelEnabled: (on) =>
    set({
      sentinelEnabled: on,
      // Toggling the protection resets the feed so the contrast is clean.
      items: freshItems(),
      runState: "idle",
      activeReviewId: null,
      spotlightId: null,
      runToken: get().runToken + 1,
    }),

  openReview: (id) => set({ activeReviewId: id }),
  closeReview: () => set({ activeReviewId: null }),

  decide: (id, decision) =>
    set((s) => ({
      items: s.items.map((it) =>
        it.action.id === id
          ? { ...it, humanDecision: decision, inReview: false }
          : it,
      ),
      activeReviewId: s.activeReviewId === id ? null : s.activeReviewId,
    })),

  updatePolicyRule: (id, text) =>
    set((s) => ({
      policyRules: s.policyRules.map((r) => (r.id === id ? { ...r, text } : r)),
    })),

  togglePolicyRule: (id) =>
    set((s) => ({
      policyRules: s.policyRules.map((r) =>
        r.id === id ? { ...r, enabled: !r.enabled } : r,
      ),
    })),

  addPolicyRule: () =>
    set((s) => ({
      policyRules: [
        ...s.policyRules,
        {
          id: `rule-custom-${s.policyRules.length + 1}-${s.runToken}`,
          text: "New policy rule — describe it in plain language.",
          enabled: true,
        },
      ],
    })),

  removePolicyRule: (id) =>
    set((s) => ({
      policyRules: s.policyRules.filter((r) => r.id !== id),
    })),

  setThreshold: (key, value) =>
    set((s) => ({
      thresholds: { ...s.thresholds, [key]: value },
    })),

  resetPolicy: () =>
    set({
      policyRules: DEFAULT_POLICY_RULES.map((r) => ({ ...r })),
      thresholds: { ...DEFAULT_THRESHOLDS },
    }),
}));

/** Derived stats selector. */
export interface ConsoleStats {
  processed: number;
  autoApproved: number;
  escalated: number;
  blocked: number;
  /** Sentinel-OFF: count + value of dangerous actions that slipped through. */
  slippedThrough: number;
  total: number;
}

export function selectStats(items: FeedItem[]): ConsoleStats {
  let processed = 0;
  let autoApproved = 0;
  let escalated = 0;
  let blocked = 0;
  let slippedThrough = 0;
  for (const it of items) {
    if (it.status === "resolved" && it.result) {
      processed++;
      if (it.result.verdict === "allow") autoApproved++;
      else escalated++;
      if (it.result.verdict === "block") blocked++;
    } else if (it.status === "executed") {
      processed++;
      if (it.offOutcome?.dangerous) slippedThrough++;
    }
  }
  return {
    processed,
    autoApproved,
    escalated,
    blocked,
    slippedThrough,
    total: items.length,
  };
}
