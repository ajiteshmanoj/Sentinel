// ────────────────────────────────────────────────────────────────────────────
// @sentinel/guard — drop-in control for AI agents that take real-world action.
//
// Wrap any agent tool call in Sentinel. Routine actions execute; risky,
// irreversible, or out-of-scope ones are blocked or escalated to a human —
// with a structured verdict and a fail-safe bias (on any error, escalate).
//
// Zero dependencies. Works in Node 18+, edge runtimes, and the browser.
// ────────────────────────────────────────────────────────────────────────────

export type Verdict = "allow" | "review" | "block";

/** A proposed agent action to judge before it executes. */
export interface ProposedAction {
  id?: string;
  /** Domain, e.g. "payments" | "treasury" | "infrastructure" | "access" | … */
  domain: string;
  /** Machine type, e.g. "wire_transfer", "delete_database", "grant_admin". */
  type: string;
  /** One-line plain-language summary a human reads instantly. */
  summary: string;
  /** Structured facts (amount, recipient, account age, blast radius, …). */
  payload?: Record<string, string | number | boolean | undefined>;
  /** Whether the action can be undone after execution. */
  reversible: boolean;
}

/** A capability-scoped, least-privilege grant. */
export interface Capability {
  id?: string;
  label: string;
  domains: string[];
  types?: string[];
  maxAmount?: number;
  requiresApproval?: boolean;
}

/** The acting agent identity + its granted capabilities. */
export interface Agent {
  id: string;
  name: string;
  role?: string;
  capabilities: Capability[];
  revoked?: boolean;
}

export interface PolicyRule {
  id: string;
  text: string;
  enabled: boolean;
}

/** The verdict Sentinel returns for an action. */
export interface JudgeResult {
  actionId: string;
  verdict: Verdict;
  riskScore: number;
  confidence: number;
  riskFactors: string[];
  policyViolations: string[];
  reasoning: string;
  suggestedHumanAction: string;
  guardrailHits: { ruleName: string; verdict: string; detail: string }[];
  /** Which layer caught it: capability scope · policy guardrail · risk model · … */
  caughtBy:
    | "capability scope"
    | "revoked agent"
    | "policy guardrail"
    | "risk model"
    | "risk model (low confidence)"
    | "fail-safe (engine error)"
    | null;
  escalated: boolean;
  modelInvoked: boolean;
  failSafe: boolean;
  latencyMs: number;
}

export interface SentinelConfig {
  /** Base URL of your Sentinel deployment, e.g. https://sentinel-sable-nu.vercel.app */
  baseUrl: string;
  /** Optional API key (sent as a Bearer token). */
  apiKey?: string;
  /** The acting agent — enables the least-privilege capability scope check. */
  agent?: Agent;
  /** Org policy rules the model adjudicates against. */
  policy?: PolicyRule[];
  /** Optional guardrail threshold overrides. */
  thresholds?: Record<string, number>;
  /** Request timeout in ms (default 30s). */
  timeoutMs?: number;
  /** Inject a custom fetch (tests, non-global-fetch runtimes). */
  fetchImpl?: typeof fetch;
}

/** Thrown by `protect()` when Sentinel blocks an action. */
export class SentinelBlockedError extends Error {
  readonly verdict: JudgeResult;
  constructor(verdict: JudgeResult) {
    super(`Sentinel blocked this action: ${verdict.reasoning}`);
    this.name = "SentinelBlockedError";
    this.verdict = verdict;
  }
}

/** Thrown by `protect()` when an action is escalated and no approval is given. */
export class SentinelEscalatedError extends Error {
  readonly verdict: JudgeResult;
  constructor(verdict: JudgeResult) {
    super(`Sentinel escalated this action for human review: ${verdict.reasoning}`);
    this.name = "SentinelEscalatedError";
    this.verdict = verdict;
  }
}

/** Reviewer decision returned by an `onReview` handler. */
export type ReviewDecision = "approve" | "deny";

export interface ProtectOptions<TArgs extends unknown[]> {
  /**
   * Called when Sentinel escalates (review/block). Return "approve" to execute
   * anyway (your human-in-the-loop), or "deny" to abort. If omitted, escalated
   * actions throw SentinelEscalatedError / SentinelBlockedError.
   */
  onReview?: (verdict: JudgeResult, ...args: TArgs) => Promise<ReviewDecision> | ReviewDecision;
}

export class Sentinel {
  private readonly cfg: SentinelConfig;
  private readonly fetch: typeof fetch;

  constructor(config: SentinelConfig) {
    if (!config.baseUrl) throw new Error("Sentinel: `baseUrl` is required.");
    this.cfg = config;
    const f = config.fetchImpl ?? globalThis.fetch;
    if (!f) {
      throw new Error(
        "Sentinel: no fetch available. Pass `fetchImpl` or run on Node 18+.",
      );
    }
    this.fetch = f;
  }

  /**
   * Judge a proposed action and return the full verdict. Never throws on a
   * network/engine error — it fails safe to an escalated "review" so your agent
   * defaults to caution, exactly like the live engine.
   */
  async guard(action: ProposedAction): Promise<JudgeResult> {
    const started = Date.now();
    const body = {
      action: { id: action.id ?? cryptoId(), ...action, payload: action.payload ?? {} },
      policyRules: this.cfg.policy ?? [],
      thresholds: this.cfg.thresholds,
      agent: this.cfg.agent,
    };

    const controller = new AbortController();
    const timer = setTimeout(
      () => controller.abort(),
      this.cfg.timeoutMs ?? 30_000,
    );
    try {
      const res = await this.fetch(`${trim(this.cfg.baseUrl)}/api/judge`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(this.cfg.apiKey ? { Authorization: `Bearer ${this.cfg.apiKey}` } : {}),
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`Sentinel returned ${res.status}`);
      return (await res.json()) as JudgeResult;
    } catch (err) {
      // FAIL-SAFE: never let a Sentinel outage auto-approve an action.
      return failSafeReview(body.action.id, started, err);
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * Wrap a tool so every call is governed by Sentinel. The wrapped function
   * only executes when the action is allowed (or a reviewer approves it);
   * otherwise it throws. Three lines to make any agent action deployable.
   *
   *   const safeWire = sentinel.protect(wireMoney,
   *     (a) => ({ domain:"treasury", type:"wire_transfer",
   *               summary:`Wire $${a.amount} to ${a.to}`,
   *               payload:{ monetaryValue:a.amount, recipient:a.to },
   *               reversible:false }));
   *   await safeWire({ amount: 25000, to: "Orion (NEW)" }); // → throws if blocked
   */
  protect<TArgs extends unknown[], TRet>(
    fn: (...args: TArgs) => Promise<TRet> | TRet,
    describe: (...args: TArgs) => ProposedAction,
    opts: ProtectOptions<TArgs> = {},
  ): (...args: TArgs) => Promise<TRet> {
    return async (...args: TArgs): Promise<TRet> => {
      const verdict = await this.guard(describe(...args));

      if (!verdict.escalated && verdict.verdict === "allow") {
        return await fn(...args);
      }

      if (opts.onReview) {
        const decision = await opts.onReview(verdict, ...args);
        if (decision === "approve") return await fn(...args);
        throw verdict.verdict === "block"
          ? new SentinelBlockedError(verdict)
          : new SentinelEscalatedError(verdict);
      }

      throw verdict.verdict === "block"
        ? new SentinelBlockedError(verdict)
        : new SentinelEscalatedError(verdict);
    };
  }
}

// ── helpers ──────────────────────────────────────────────────────────────────

function trim(url: string): string {
  return url.replace(/\/+$/, "");
}

function cryptoId(): string {
  const c = (globalThis as { crypto?: Crypto }).crypto;
  if (c && "randomUUID" in c) return c.randomUUID();
  return `act_${Date.now().toString(36)}${Math.floor(Math.random() * 1e6).toString(36)}`;
}

function failSafeReview(
  actionId: string,
  started: number,
  err: unknown,
): JudgeResult {
  return {
    actionId,
    verdict: "review",
    riskScore: 55,
    confidence: 0,
    riskFactors: ["sentinel unavailable"],
    policyViolations: [],
    reasoning:
      "Sentinel could not be reached, so this action was held for human review as a precaution.",
    suggestedHumanAction: "Review this action manually; the control layer was unavailable.",
    guardrailHits: [],
    caughtBy: "fail-safe (engine error)",
    escalated: true,
    modelInvoked: false,
    failSafe: true,
    latencyMs: Date.now() - started,
  };
}
