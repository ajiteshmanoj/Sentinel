// ────────────────────────────────────────────────────────────────────────────
// POST /api/speak  — text-to-speech for the guided demo's voice (ElevenLabs).
// The ElevenLabs key is read ONLY here (server-side). Returns audio/mpeg.
// An in-memory cache (per warm instance) avoids re-synthesizing the same line,
// which conserves a trial account's character quota.
// Degrades cleanly: 503 when no key, 502 on upstream failure — the client then
// falls back to text-only captions, so the demo never breaks.
// ────────────────────────────────────────────────────────────────────────────

import { ELEVENLABS_MODEL, ELEVENLABS_VOICE } from "@/lib/engine/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// key: `${voice}:${model}:${text}` → mp3 bytes
const cache = new Map<string, ArrayBuffer>();

export async function POST(request: Request) {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) {
    return new Response("ElevenLabs key not configured.", { status: 503 });
  }

  let text: unknown;
  try {
    ({ text } = (await request.json()) as { text?: unknown });
  } catch {
    return new Response("Bad request", { status: 400 });
  }
  if (typeof text !== "string" || !text.trim()) {
    return new Response("`text` is required.", { status: 400 });
  }

  const cacheKey = `${ELEVENLABS_VOICE}:${ELEVENLABS_MODEL}:${text}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    return new Response(cached, {
      headers: audioHeaders(true),
    });
  }

  try {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": key,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          model_id: ELEVENLABS_MODEL,
          voice_settings: {
            stability: 0.45,
            similarity_boost: 0.8,
            style: 0.15,
            use_speaker_boost: true,
          },
        }),
      },
    );

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return new Response(`TTS upstream ${res.status}: ${detail.slice(0, 200)}`, {
        status: 502,
      });
    }

    const bytes = await res.arrayBuffer();
    // Cap the cache so a long session can't grow unbounded.
    if (cache.size < 200) cache.set(cacheKey, bytes);

    return new Response(bytes, { headers: audioHeaders(false) });
  } catch (err) {
    return new Response(
      `TTS error: ${err instanceof Error ? err.message : "unknown"}`,
      { status: 502 },
    );
  }
}

function audioHeaders(cached: boolean): HeadersInit {
  return {
    "Content-Type": "audio/mpeg",
    "Cache-Control": "public, max-age=86400",
    "X-Sentinel-TTS-Cache": cached ? "hit" : "miss",
  };
}
