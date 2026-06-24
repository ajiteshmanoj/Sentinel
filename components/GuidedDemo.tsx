"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useConsole } from "@/lib/store";
import { ShieldIcon } from "./icons";

// Where the floating presenter parks for each line. It glides between these so
// it feels like Sentinel is moving around the screen, talking to the viewer —
// always at an edge so it never covers the card being judged (which auto-centers).
type Anchor =
  | "bottomCenter"
  | "bottomLeft"
  | "bottomRight"
  | "midLeft"
  | "midRight"
  | "topRight";

type Step =
  | { kind: "caption"; text: string; ms: number; pos: Anchor }
  | { kind: "scroll"; to: string }
  | { kind: "mode"; guided: boolean }
  | { kind: "sentinel"; on: boolean }
  | { kind: "run" };

const STEPS: Step[] = [
  { kind: "scroll", to: "console" },
  { kind: "mode", guided: true },
  {
    kind: "caption",
    pos: "bottomCenter",
    text: "Hi — I'm Sentinel. I sit between your AI agents and the actions they take, so they can move money without anyone losing sleep. Let me show you.",
    ms: 6200,
  },
  { kind: "sentinel", on: false },
  {
    kind: "caption",
    pos: "midLeft",
    text: "First, watch what happens without me. Right now I'm switched off.",
    ms: 3600,
  },
  { kind: "run" },
  {
    kind: "caption",
    pos: "bottomRight",
    text: "See that? A $25,000 wire just executed — irreversible, gone. And a $9,800 fraud sailed straight through, because nothing even flagged it.",
    ms: 6200,
  },
  { kind: "sentinel", on: true },
  {
    kind: "caption",
    pos: "midLeft",
    text: "Now switch me on. I sit in the execution path and judge every action live, using gpt-5.4.",
    ms: 4400,
  },
  { kind: "run" },
  {
    kind: "caption",
    pos: "midRight",
    text: "The $25,000 wire hit a hard rule, so I froze it. But the $9,800 passed every rule — I caught that one myself. That's what a rulebook can't do.",
    ms: 6800,
  },
  { kind: "scroll", to: "audit" },
  {
    kind: "caption",
    pos: "bottomLeft",
    text: "And every decision I make is logged — tamper-evident, hash-chained, exportable. Audit-ready for a regulator.",
    ms: 5400,
  },
  {
    kind: "caption",
    pos: "bottomCenter",
    text: "That's me. Sentinel — the control layer for AI agents that move money.",
    ms: 4400,
  },
];

const CAPTION_STEPS = STEPS.filter((s) => s.kind === "caption").length;

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

const clamp = (n: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, n));

/** Pixel position for an anchor given viewport + card size. */
function posFor(
  anchor: Anchor,
  W: number,
  H: number,
  cw: number,
  ch: number,
): { x: number; y: number } {
  const m = 24;
  const left = m;
  const right = W - cw - m;
  const centerX = (W - cw) / 2;
  const top = 88;
  const bottom = H - ch - m;
  const midY = (H - ch) / 2;
  const map: Record<Anchor, { x: number; y: number }> = {
    bottomCenter: { x: centerX, y: bottom },
    bottomLeft: { x: left, y: bottom },
    bottomRight: { x: right, y: bottom },
    midLeft: { x: left, y: midY },
    midRight: { x: right, y: midY },
    topRight: { x: right, y: top },
  };
  const p = map[anchor];
  return { x: clamp(p.x, m, Math.max(m, W - cw - m)), y: clamp(p.y, m, Math.max(m, H - ch - m)) };
}

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
  const [anchor, setAnchor] = useState<Anchor>("bottomCenter");
  const [vp, setVp] = useState({ w: 1280, h: 800 });
  const [cardH, setCardH] = useState(168);
  const tokenRef = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const typed = useTypewriter(caption);
  const speaking = typed.length < caption.length;

  const cardW = Math.min(400, vp.w - 24);

  // Track viewport size.
  useEffect(() => {
    const onResize = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Measure the card height so bottom anchors sit flush.
  useEffect(() => {
    if (!cardRef.current) return;
    const ro = new ResizeObserver(([e]) => setCardH(e.contentRect.height));
    ro.observe(cardRef.current);
    return () => ro.disconnect();
  }, [active]);

  const target = useMemo(
    () =>
      reduce
        ? posFor("bottomCenter", vp.w, vp.h, cardW, cardH)
        : posFor(anchor, vp.w, vp.h, cardW, cardH),
    [anchor, vp, cardW, cardH, reduce],
  );

  useEffect(() => {
    if (!active) return;
    const myToken = ++tokenRef.current;
    const cancelled = () => tokenRef.current !== myToken;
    const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

    const finish = () => {
      const api = useConsole.getState();
      api.setSpeed(1100);
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
          case "run":
            await api().runScenario();
            break;
          case "caption":
            setCaption(step.text);
            setAnchor(step.pos);
            setCaptionIndex(++capCount);
            await wait(step.ms);
            break;
        }
      }
      if (!cancelled()) finish();
    })();

    return () => {
      tokenRef.current++;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const stop = () => {
    tokenRef.current++;
    const api = useConsole.getState();
    api.setSpeed(1100);
    api.pause();
    api.setMode("full");
    setActive(false);
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

          {/* Floating AI presenter — glides between anchors, talking to the viewer */}
          <motion.div
            className="pointer-events-none fixed left-0 top-0 z-[70]"
            style={{ width: cardW }}
            initial={{ x: target.x, y: vp.h, opacity: 0 }}
            animate={{ x: target.x, y: target.y, opacity: 1 }}
            exit={{ opacity: 0, y: target.y + 40 }}
            transition={{ type: "spring", stiffness: 90, damping: 18, opacity: { duration: 0.4 } }}
          >
            {/* gentle idle bob so it always feels alive */}
            <motion.div
              animate={reduce ? {} : { y: [0, -7, 0] }}
              transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
            >
              <div
                ref={cardRef}
                className="pointer-events-auto relative flex items-start gap-3.5 rounded-2xl border border-indigo/40 bg-ink-700/85 px-4 py-4 shadow-[0_24px_70px_-18px_rgba(108,92,231,0.55)] backdrop-blur-2xl"
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
                    <button
                      onClick={stop}
                      className="shrink-0 rounded-md px-1.5 py-1 text-xs text-white/40 transition-colors hover:bg-white/5 hover:text-white"
                    >
                      Skip ✕
                    </button>
                  </div>

                  <p className="text-[0.98rem] font-medium leading-relaxed text-white/90">
                    {typed}
                    {speaking && (
                      <span className="ml-0.5 inline-block h-4 w-[3px] translate-y-0.5 animate-pulse rounded-full bg-indigo-soft" />
                    )}
                  </p>
                </div>
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
