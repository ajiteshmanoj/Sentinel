"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Slow, elegant animated gradient-mesh field that eases toward the cursor
 * (parallax). GPU-accelerated: only transform/opacity on a few blurred blobs.
 * Honours prefers-reduced-motion with a calm static fallback.
 */
export function AmbientBackground() {
  const reduce = useReducedMotion();
  const layerA = useRef<HTMLDivElement>(null);
  const layerB = useRef<HTMLDivElement>(null);
  const grid = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduce) return;

    let raf = 0;
    // target (from cursor) and current (lerped) positions in [-1, 1]
    const target = { x: 0, y: 0 };
    const cur = { x: 0, y: 0 };

    const onMove = (e: MouseEvent) => {
      target.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.y = (e.clientY / window.innerHeight) * 2 - 1;
    };

    const tick = () => {
      // ease toward cursor, don't snap
      cur.x += (target.x - cur.x) * 0.045;
      cur.y += (target.y - cur.y) * 0.045;

      if (layerA.current) {
        layerA.current.style.transform = `translate3d(${cur.x * 34}px, ${cur.y * 34}px, 0)`;
      }
      if (layerB.current) {
        layerB.current.style.transform = `translate3d(${cur.x * -22}px, ${cur.y * -22}px, 0)`;
      }
      if (grid.current) {
        grid.current.style.transform = `translate3d(${cur.x * 10}px, ${cur.y * 10}px, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [reduce]);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {/* Subtle grid field */}
      <div
        ref={grid}
        className="absolute inset-[-10%] opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 35%, black, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 60% at 50% 35%, black, transparent 75%)",
        }}
      />

      {/* Gradient mesh blobs */}
      <div
        ref={layerA}
        className={`absolute -top-40 left-1/2 h-[42rem] w-[42rem] -translate-x-1/2 rounded-full blur-[120px] ${
          reduce ? "" : "animate-[float_14s_ease-in-out_infinite]"
        }`}
        style={{
          background:
            "radial-gradient(circle, rgba(108,92,231,0.42), rgba(108,92,231,0) 70%)",
        }}
      />
      <div
        ref={layerB}
        className="absolute right-[8%] top-[28%] h-[30rem] w-[30rem] rounded-full blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, rgba(75,63,176,0.32), rgba(75,63,176,0) 70%)",
        }}
      />
      <div
        className="absolute left-[6%] top-[55%] h-[26rem] w-[26rem] rounded-full blur-[130px]"
        style={{
          background:
            "radial-gradient(circle, rgba(139,124,240,0.20), rgba(139,124,240,0) 70%)",
        }}
      />

      {/* Fade to canvas at the bottom for a clean section transition */}
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-ink-900" />

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            translate: 0 0;
          }
          50% {
            translate: 0 26px;
          }
        }
      `}</style>
    </div>
  );
}
