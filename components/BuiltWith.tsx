"use client";

import { BUILT_WITH } from "./brand";

// Slow auto-scrolling "Built with" strip. The list is duplicated so the -50%
// marquee loops seamlessly. Honest framing: the real stack, not customer logos.
export function BuiltWith() {
  const row = [...BUILT_WITH, ...BUILT_WITH];

  return (
    <section className="relative overflow-hidden border-y border-white/[0.05] bg-white/[0.012] py-10">
      <p className="mb-7 text-center text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-white/35">
        Built with
      </p>

      <div
        className="group relative flex overflow-hidden"
        style={{
          maskImage:
            "linear-gradient(90deg, transparent, black 10%, black 90%, transparent)",
          WebkitMaskImage:
            "linear-gradient(90deg, transparent, black 10%, black 90%, transparent)",
        }}
      >
        <div className="flex w-max shrink-0 items-center gap-3 pr-3 animate-marquee group-hover:[animation-play-state:paused]">
          {row.map((t, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-2.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-white/70 transition-colors hover:border-white/20 hover:text-white"
            >
              <t.Mark className="h-5 w-5" />
              <span className="whitespace-nowrap text-sm font-medium tracking-tight">
                {t.name}
              </span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
