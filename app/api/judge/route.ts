// ────────────────────────────────────────────────────────────────────────────
// POST /api/judge
// Accepts one agent action + the org's policy rules, returns a live JudgeResult.
// The OpenAI key is read ONLY here (server-side). Nothing leaks to the client.
// This handler NEVER throws to the client — it always returns a JSON verdict.
// ────────────────────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { judge } from "@/lib/engine/decision";
import type { JudgeRequestBody } from "@/lib/engine/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<JudgeRequestBody>;

    if (!body.action || !Array.isArray(body.policyRules)) {
      return NextResponse.json(
        { error: "Request must include `action` and `policyRules`." },
        { status: 400 },
      );
    }

    const result = await judge(
      body.action,
      body.policyRules,
      body.thresholds,
      body.agent,
    );
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    // Last-resort guard: even a malformed request must not crash the demo.
    return NextResponse.json(
      {
        error: "Unexpected engine error.",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    );
  }
}

// Simple health probe used by the setup screen / status indicator.
export async function GET() {
  return NextResponse.json({
    ok: true,
    hasKey: Boolean(process.env.OPENAI_API_KEY),
  });
}
