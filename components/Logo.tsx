"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Sentinel wordmark — a shield formed from a single unbroken stroke with a
 * watchful scanning beam sweeping across it. Inline SVG, crisp at any size.
 */
export function Logo({
  className = "",
  showWordmark = true,
}: {
  className?: string;
  showWordmark?: boolean;
}) {
  const reduce = useReducedMotion();

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span className="relative inline-block h-8 w-8 shrink-0">
        <svg viewBox="0 0 40 40" fill="none" className="h-full w-full">
          <defs>
            <linearGradient id="sentinel-shield" x1="0" y1="0" x2="40" y2="40">
              <stop offset="0%" stopColor="#8B7CF0" />
              <stop offset="100%" stopColor="#6C5CE7" />
            </linearGradient>
            <clipPath id="sentinel-clip">
              <path d="M20 3.5l13 4.2v9.3c0 8.2-5.4 14.6-13 17-7.6-2.4-13-8.8-13-17V7.7L20 3.5z" />
            </clipPath>
          </defs>

          {/* Shield — single unbroken stroke. */}
          <path
            d="M20 3.5l13 4.2v9.3c0 8.2-5.4 14.6-13 17-7.6-2.4-13-8.8-13-17V7.7L20 3.5z"
            stroke="url(#sentinel-shield)"
            strokeWidth="2"
            strokeLinejoin="round"
            fill="rgba(108,92,231,0.08)"
          />

          {/* Inner watchful check / sentinel mark. */}
          <path
            d="M13.5 20.2l4.6 4.6L27 14.5"
            stroke="url(#sentinel-shield)"
            strokeWidth="2.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Scanning beam sweeping the shield. */}
          {!reduce && (
            <g clipPath="url(#sentinel-clip)">
              <motion.rect
                x="-12"
                y="0"
                width="10"
                height="40"
                fill="rgba(139,124,240,0.55)"
                style={{ filter: "blur(3px)" }}
                animate={{ x: [-12, 40] }}
                transition={{
                  duration: 2.6,
                  repeat: Infinity,
                  repeatDelay: 1.8,
                  ease: "easeInOut",
                }}
              />
            </g>
          )}
        </svg>
      </span>
      {showWordmark && (
        <span className="text-[1.35rem] font-semibold tracking-[-0.04em] text-white">
          Sentinel
        </span>
      )}
    </span>
  );
}
