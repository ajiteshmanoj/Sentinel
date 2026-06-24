// ────────────────────────────────────────────────────────────────────────────
// POST /api/judge/stream  (Server-Sent Events)
// Streams the live AI assessment so a viewer can WATCH the model reason:
//   1. { type: "guardrails" } — Layer 1 result, emitted instantly.
//   2. { type: "token" }      — gpt-5.4-mini narration, token-by-token.
//   3. { type: "verdict" }    — the authoritative gpt-5.4 JudgeResult.
//   4. { type: "error" }      — client falls back to POST /api/judge.
// The narration is best-effort decoration; the verdict comes from the same
// verbatim Layer-2 engine and fails safe. This handler never crashes the demo.
// ────────────────────────────────────────────────────────────────────────────

import { streamNarration } from "@/lib/engine/adjudicator";
import { judge } from "@/lib/engine/decision";
import { evaluateGuardrails } from "@/lib/engine/guardrails";
import type { JudgeRequestBody } from "@/lib/engine/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: Partial<JudgeRequestBody>;
  try {
    body = (await request.json()) as Partial<JudgeRequestBody>;
  } catch {
    return new Response("Bad request", { status: 400 });
  }

  const { action, policyRules, thresholds } = body;
  if (!action || !Array.isArray(policyRules)) {
    return new Response("Request must include `action` and `policyRules`.", {
      status: 400,
    });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let closed = false;
      const send = (obj: unknown) => {
        if (closed) return;
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
      };

      try {
        // 1. Deterministic guardrails — instant, makes Layer 1 visible.
        const guardrailHits = evaluateGuardrails(action, thresholds);
        send({ type: "guardrails", hits: guardrailHits });

        // 2. Kick off the authoritative verdict in parallel (verbatim engine).
        const verdictPromise = judge(action, policyRules, thresholds);

        // 3. Stream the live narration (best-effort).
        try {
          await streamNarration(action, policyRules, (text) =>
            send({ type: "token", text }),
          );
        } catch {
          // Narration failed — no problem, the verdict still arrives.
        }

        // 4. Emit the authoritative verdict (judge() never throws).
        const result = await verdictPromise;
        send({ type: "verdict", result });
      } catch (err) {
        send({
          type: "error",
          message: err instanceof Error ? err.message : "stream error",
        });
      } finally {
        closed = true;
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
