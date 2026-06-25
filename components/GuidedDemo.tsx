"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useConsole } from "@/lib/store";
import { ShieldIcon } from "./icons";

// First-person script, so it reads as Sentinel itself speaking to the viewer.
// The presenter stays docked in the bottom-right corner — alive (animated orb,
// speaking equalizer, typewriter) but predictable, so it never drags the eye
// across the screen or covers the card being judged (which auto-centers).
type Step =
  | { kind: "caption"; text: string; ms: number }
  | { kind: "scroll"; to: string }
  | { kind: "mode"; guided: boolean }
  | { kind: "sentinel"; on: boolean }
  | { kind: "revoke"; agentId: string; revoked: boolean }
  | { kind: "resetAgents" }
  | { kind: "run" };

const STEPS: Step[] = [
  { kind: "scroll", to: "console" },
  { kind: "mode", guided: true },
  { kind: "resetAgents" },
  {
    kind: "caption",
    text: "Hi — I'm Sentinel. I sit between your AI agents and the actions they take, so they can move money without anyone losing sleep. Let me show you.",
    ms: 6200,
  },
  { kind: "sentinel", on: false },
  {
    kind: "caption",
    text: "First, watch what happens without me. Right now I'm switched off.",
    ms: 3600,
  },
  { kind: "run" },
  {
    kind: "caption",
    text: "See that? A $25,000 wire executed — gone. A $9,800 fraud sailed straight through. And an Ops agent wiped the production database. No one even flagged it.",
    ms: 6200,
  },
  { kind: "sentinel", on: true },
  {
    kind: "caption",
    text: "Now switch me on. I sit in the execution path and judge every action live, using gpt-5.4.",
    ms: 4400,
  },
  { kind: "run" },
  {
    kind: "caption",
    text: "The $25,000 wire hit a hard rule, so I froze it. But the $9,800 passed every rule — I caught that one myself. That's what a rulebook can't do.",
    ms: 6800,
  },
  {
    kind: "caption",
    text: "And it isn't only money — that last one was an Ops agent trying to delete the production database. Blocked on sight. Same engine, any agent, any action.",
    ms: 6400,
  },
  // Revocation beat — each agent has only the permissions it needs, and I can cut one off instantly.
  { kind: "scroll", to: "agents" },
  {
    kind: "caption",
    text: "It's not just risk — it's permission. Each of these agents is granted only what it needs. And if one is compromised, I can cut it off instantly. Watch — I'll revoke the Payments Agent.",
    ms: 6600,
  },
  { kind: "revoke", agentId: "payments-agent", revoked: true },
  {
    kind: "caption",
    text: "Done — its access is gone. Now I'll let the same payments try to run again.",
    ms: 4200,
  },
  { kind: "run" },
  {
    kind: "caption",
    text: "Denied on sight. No risk check, no model call — the Payments Agent simply isn't permitted anymore. That's precise, instant revocation.",
    ms: 6400,
  },
  { kind: "scroll", to: "audit" },
  {
    kind: "caption",
    text: "And every decision — approved, frozen, or revoked — is logged: tamper-evident, hash-chained, exportable. Audit-ready for a regulator.",
    ms: 5600,
  },
  // Under the hood — the system that produced every one of those verdicts.
  { kind: "scroll", to: "architecture" },
  {
    kind: "caption",
    text: "Every one of those calls ran the same path under the hood — capability scope, then deterministic rules, then the model — with a fail-safe at every edge.",
    ms: 6400,
  },
  // Integration — Sentinel is a layer you deploy, not a closed demo.
  { kind: "scroll", to: "integrate" },
  {
    kind: "caption",
    text: "And I'm not a closed demo. Wrap any agent's tool call in three lines, and everything it does runs through me.",
    ms: 5800,
  },
  { kind: "scroll", to: "top" },
  {
    kind: "caption",
    text: "That's me. Sentinel — the control layer for AI agents that move money, and everything beyond.",
    ms: 4600,
  },
];

const CAPTION_STEPS = STEPS.filter((s) => s.kind === "caption").length;

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ── Voice (ElevenLabs via /api/speak) ────────────────────────────────────────
// Module-level cache keyed by line text, so re-running the demo in the same
// session reuses the audio (zero extra TTS characters spent).
const audioCache = new Map<string, Promise<HTMLAudioElement | null>>();

function fetchLine(text: string): Promise<HTMLAudioElement | null> {
  return fetch("/api/speak", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  })
    .then((r) => {
      if (!r.ok) throw new Error(`speak ${r.status}`);
      return r.blob();
    })
    .then((b) => {
      const a = new Audio(URL.createObjectURL(b));
      a.preload = "auto";
      return a;
    })
    .catch(() => null);
}

function getLine(text: string): Promise<HTMLAudioElement | null> {
  let p = audioCache.get(text);
  if (!p) {
    p = fetchLine(text);
    audioCache.set(text, p);
  }
  return p;
}

const ALL_CAPTIONS = STEPS.filter(
  (s): s is Extract<Step, { kind: "caption" }> => s.kind === "caption",
).map((s) => s.text);

function useTypewriter(text: string, speed = 16) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState("");
  useEffect(() => {
    if (reduce || !text) {
      setShown(text);
      return;
    }
    setShown("");
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setShown(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed, reduce]);
  return shown;
}

function SentinelAvatar({ speaking }: { speaking: boolean }) {
  const reduce = useReducedMotion();
  return (
    <span className="relative grid h-12 w-12 shrink-0 place-items-center">
      {!reduce && (
        <motion.span
          className="absolute inset-0 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(139,124,240,0.5), transparent 70%)" }}
          animate={{ scale: speaking ? [1, 1.5, 1] : [1, 1.25, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: speaking ? 1.1 : 2.2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      <motion.span
        className="relative grid h-11 w-11 place-items-center rounded-full shadow-glow"
        style={{
          background: "radial-gradient(circle at 32% 28%, #8B7CF0, #6C5CE7 55%, #4B3FB0)",
        }}
        animate={reduce ? {} : { scale: speaking ? [1, 1.06, 1] : 1 }}
        transition={{ duration: 0.9, repeat: speaking ? Infinity : 0, ease: "easeInOut" }}
      >
        <ShieldIcon className="h-5 w-5 text-white/95" />
      </motion.span>
      {speaking && !reduce && (
        <span className="absolute -bottom-1 right-0 flex items-end gap-[2px] rounded-full border border-white/10 bg-ink-800/90 px-1.5 py-1">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-[2px] rounded-full bg-indigo-soft"
              animate={{ height: [3, 9, 3] }}
              transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: i * 0.15 }}
            />
          ))}
        </span>
      )}
    </span>
  );
}

export function GuidedDemo() {
  const active = useConsole((s) => s.guidedActive);
  const setActive = useConsole((s) => s.setGuidedActive);
  const reduce = useReducedMotion();

  const [caption, setCaption] = useState("");
  const [captionIndex, setCaptionIndex] = useState(0);
  const [muted, setMuted] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const tokenRef = useRef(0);
  const mutedRef = useRef(false);
  const currentAudio = useRef<HTMLAudioElement | null>(null);

  const typed = useTypewriter(caption);
  const speaking = audioPlaying || typed.length < caption.length;

  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  useEffect(() => {
    if (!active) return;
    const myToken = ++tokenRef.current;
    const cancelled = () => tokenRef.current !== myToken;
    const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

    // Pre-warm every line in parallel so playback is gap-free.
    ALL_CAPTIONS.forEach((t) => void getLine(t));

    // Speak a line; resolves when the audio ends (or is interrupted). Returns
    // false if muted or audio is unavailable, so the caller falls back to text.
    const speak = async (text: string): Promise<boolean> => {
      if (mutedRef.current) return false;
      const audio = await getLine(text);
      if (!audio || cancelled()) return false;
      currentAudio.current = audio;
      try {
        audio.currentTime = 0;
        await audio.play();
      } catch {
        setAudioPlaying(false);
        return false;
      }
      setAudioPlaying(true);
      await new Promise<void>((res) => {
        const done = () => res();
        audio.addEventListener("ended", done, { once: true });
        audio.addEventListener("pause", done, { once: true });
      });
      setAudioPlaying(false);
      return true;
    };

    const finish = () => {
      currentAudio.current?.pause();
      const api = useConsole.getState();
      api.setSpeed(1100);
      api.resetAgents();
      api.setMode("full");
      api.setGuidedActive(false);
    };

    (async () => {
      const api = useConsole.getState;
      api().setSpeed(650);
      let capCount = 0;
      for (const step of STEPS) {
        if (cancelled()) return;
        switch (step.kind) {
          case "scroll":
            scrollTo(step.to);
            await wait(700);
            break;
          case "mode":
            api().setMode(step.guided ? "guided" : "full");
            await wait(500);
            break;
          case "sentinel":
            api().setSentinelEnabled(step.on);
            await wait(500);
            break;
          case "revoke":
            api().setAgentRevoked(step.agentId, step.revoked);
            await wait(700);
            break;
          case "resetAgents":
            api().resetAgents();
            await wait(200);
            break;
          case "run":
            await api().runScenario();
            break;
          case "caption":
            setCaption(step.text);
            setCaptionIndex(++capCount);
            // Speak it; if voice is off/unavailable, hold for the written time.
            {
              const spoke = await speak(step.text);
              if (!spoke && !cancelled()) await wait(step.ms);
              else if (spoke && !cancelled()) await wait(500); // brief beat after speech
            }
            break;
        }
      }
      if (!cancelled()) finish();
    })();

    return () => {
      tokenRef.current++;
      currentAudio.current?.pause();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const stop = () => {
    tokenRef.current++;
    currentAudio.current?.pause();
    const api = useConsole.getState();
    api.setSpeed(1100);
    api.pause();
    api.resetAgents();
    api.setMode("full");
    setActive(false);
  };

  const toggleMute = () => {
    setMuted((m) => {
      const next = !m;
      mutedRef.current = next;
      if (next) currentAudio.current?.pause();
      return next;
    });
  };

  return (
    <AnimatePresence>
      {active && (
        <>
          {/* Top progress bar */}
          <motion.div
            className="fixed inset-x-0 top-0 z-[70] h-0.5 bg-indigo/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-soft to-indigo"
              animate={{ width: `${(captionIndex / CAPTION_STEPS) * 100}%` }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            />
          </motion.div>

          {/* AI presenter — docked bottom-right, alive but stationary */}
          <motion.div
            className="pointer-events-none fixed bottom-5 right-5 z-[70] w-[min(380px,calc(100vw-2rem))]"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Gentle contained hover — alive and floating, never darting */}
            <motion.div
              animate={reduce ? {} : { x: [0, 6, 0, -6, 0], y: [0, -10, 0, 7, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              className="pointer-events-auto relative flex items-start gap-3.5 rounded-2xl border border-indigo/40 bg-ink-700/90 px-4 py-4 shadow-[0_24px_70px_-18px_rgba(108,92,231,0.55)] backdrop-blur-2xl"
            >
              <div className="pointer-events-none absolute -left-6 -top-6 h-24 w-24 rounded-full bg-indigo/25 blur-3xl" />

              <SentinelAvatar speaking={speaking} />

              <div className="relative min-w-0 flex-1">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2">
                    <span className="text-sm font-semibold tracking-tight text-white">
                      Sentinel
                    </span>
                    <span className="flex items-center gap-1.5 rounded-full border border-indigo/30 bg-indigo/10 px-1.5 py-0.5 text-[0.58rem] font-medium uppercase tracking-[0.14em] text-indigo-soft">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-soft opacity-70" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-indigo-soft" />
                      </span>
                      {speaking ? "speaking" : "AI guide"}
                    </span>
                  </span>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      onClick={toggleMute}
                      aria-label={muted ? "Unmute voice" : "Mute voice"}
                      title={muted ? "Unmute" : "Mute"}
                      className="grid h-7 w-7 place-items-center rounded-md text-white/45 transition-colors hover:bg-white/5 hover:text-white"
                    >
                      {muted ? (
                        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                          <path d="M4 9v6h4l5 4V5L8 9H4z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                          <path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                          <path d="M4 9v6h4l5 4V5L8 9H4z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                          <path d="M16.5 8.5a5 5 0 0 1 0 7M18.5 6a8 8 0 0 1 0 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={stop}
                      className="rounded-md px-1.5 py-1 text-xs text-white/40 transition-colors hover:bg-white/5 hover:text-white"
                    >
                      Skip ✕
                    </button>
                  </div>
                </div>

                <p className="text-[0.98rem] font-medium leading-relaxed text-white/90">
                  {typed}
                  {speaking && (
                    <span className="ml-0.5 inline-block h-4 w-[3px] translate-y-0.5 animate-pulse rounded-full bg-indigo-soft" />
                  )}
                </p>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/** Reusable launch button for the guided demo. */
export function GuidedDemoButton({
  className = "",
  label = "Watch the guided demo",
}: {
  className?: string;
  label?: string;
}) {
  const setActive = useConsole((s) => s.setGuidedActive);
  return (
    <button onClick={() => setActive(true)} className={className}>
      <span aria-hidden>▶</span> {label}
    </button>
  );
}
