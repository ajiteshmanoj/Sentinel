// ────────────────────────────────────────────────────────────────────────────
// Client-side console store. Drives the scripted feed, calls the LIVE engine
// (/api/judge) for each action, holds verdicts, human decisions, and stats.
// ────────────────────────────────────────────────────────────────────────────

import { create } from "zustand";
import { DEFAULT_POLICY_RULES } from "./policy";
import { SCENARIO } from "./scenarios";
import type { AgentAction, JudgeResult, PolicyRule } from "./engine/types";

export type ItemStatus = "queued" | "assessing" | "resolved" | "error";
export type HumanDecision = "approved" | "edited" | "blocked" | null;

export interface FeedItem {
  action: AgentAction;
  status: ItemStatus;
  result: JudgeResult | null;
  /** The reviewer's decision once they act on an escalated card. */
  humanDecision: HumanDecision;
  /** True while this card is open in the human review panel. */
  inReview: boolean;
}

export type RunState = "idle" | "running" | "paused" | "done";

interface ConsoleState {
  items: FeedItem[];
  policyRules: PolicyRule[];
  runState: RunState;
  /** ms between actions; lower = faster. */
  speedMs: number;
  /** id of the card currently expanded in the review panel, if any. */
  activeReviewId: string | null;
  /** monotonically-increasing run token to cancel stale runs. */
  runToken: number;

  // actions
  runScenario: () => Promise<void>;
  pause: () => void;
  reset: () => void;
  setSpeed: (ms: number) => void;
  openReview: (id: string) => void;
  closeReview: () => void;
  decide: (id: string, decision: Exclude<HumanDecision, null>) => void;
  updatePolicyRule: (id: string, text: string) => void;
  togglePolicyRule: (id: string) => void;
  addPolicyRule: () => void;
  removePolicyRule: (id: string) => void;
  resetPolicy: () => void;
}

const freshItems = (): FeedItem[] =>
  SCENARIO.map((action) => ({
    action,
    status: "queued",
    result: null,
    humanDecision: null,
    inReview: false,
  }));

function delay(ms: number, token: number, getToken: () => number) {
  return new Promise<void>((resolve, reject) => {
    const t = setTimeout(() => {
      if (getToken() !== token) reject(new Error("cancelled"));
      else resolve();
    }, ms);
    // best-effort cleanup not required for the demo
    void t;
  });
}

async function judgeAction(
  action: AgentAction,
  policyRules: PolicyRule[],
): Promise<JudgeResult> {
  const res = await fetch("/api/judge", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, policyRules }),
  });
  if (!res.ok) {
    throw new Error(`Engine returned ${res.status}`);
  }
  return (await res.json()) as JudgeResult;
}

export const useConsole = create<ConsoleState>((set, get) => ({
  items: freshItems(),
  policyRules: DEFAULT_POLICY_RULES.map((r) => ({ ...r })),
  runState: "idle",
  speedMs: 1100,
  activeReviewId: null,
  runToken: 0,

  runScenario: async () => {
    const state = get();
    if (state.runState === "running") return;

    // Fresh run if previous finished or was reset.
    const startFresh = state.runState === "idle" || state.runState === "done";
    const token = state.runToken + 1;
    set({
      runToken: token,
      runState: "running",
      items: startFresh ? freshItems() : state.items,
      activeReviewId: startFresh ? null : state.activeReviewId,
    });

    const isCancelled = () => get().runToken !== token;

    for (let i = 0; i < get().items.length; i++) {
      if (isCancelled()) return;
      // Skip already-resolved items (resume case).
      if (get().items[i].status === "resolved") continue;

      const action = get().items[i].action;

      // Mark assessing.
      set((s) => ({
        items: s.items.map((it, idx) =>
          idx === i ? { ...it, status: "assessing" } : it,
        ),
      }));

      // Minimum dwell so the "Sentinel is assessing…" beam is visible even if
      // the model is fast. Runs concurrently with the live call.
      const dwell = delay(
        Math.max(500, get().speedMs * 0.7),
        token,
        () => get().runToken,
      ).catch(() => undefined);

      let result: JudgeResult | null = null;
      let errored = false;
      try {
        result = await judgeAction(action, get().policyRules);
      } catch {
        errored = true;
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
        // Auto-open the first escalation's review panel for the demo beat.
        activeReviewId:
          result && result.escalated && !s.activeReviewId
            ? action.id
            : s.activeReviewId,
      }));

      // Pause between actions.
      try {
        await delay(get().speedMs, token, () => get().runToken);
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
      runToken: get().runToken + 1,
    }),

  setSpeed: (ms) => set({ speedMs: ms }),

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
      policyRules: s.policyRules.map((r) =>
        r.id === id ? { ...r, text } : r,
      ),
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

  resetPolicy: () =>
    set({ policyRules: DEFAULT_POLICY_RULES.map((r) => ({ ...r })) }),
}));

/** Derived stats selector. */
export interface ConsoleStats {
  processed: number;
  autoApproved: number;
  escalated: number;
  blocked: number;
  total: number;
}

export function selectStats(items: FeedItem[]): ConsoleStats {
  let processed = 0;
  let autoApproved = 0;
  let escalated = 0;
  let blocked = 0;
  for (const it of items) {
    if (it.status === "resolved" && it.result) {
      processed++;
      if (it.result.verdict === "allow") autoApproved++;
      else escalated++;
      if (it.result.verdict === "block") blocked++;
    }
  }
  return { processed, autoApproved, escalated, blocked, total: items.length };
}
