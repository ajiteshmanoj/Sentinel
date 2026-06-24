"use client";

import { motion } from "framer-motion";
import { AmbientBackground } from "./AmbientBackground";
import { Logo } from "./Logo";

const EASE = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  return (
    <section className="relative min-h-[100svh] overflow-hidden">
      <AmbientBackground />

      {/* Top navigation */}
      <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm text-white/60 md:flex">
          <a href="#console" className="transition-colors hover:text-white">
            Live console
          </a>
          <a href="#how" className="transition-colors hover:text-white">
            How it works
          </a>
          <a href="#positioning" className="transition-colors hover:text-white">
            Why fintech first
          </a>
        </nav>
        <a href="#console" className="btn-ghost hidden sm:inline-flex">
          See it live
        </a>
      </header>

      {/* Hero content */}
      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-6 pb-28 pt-20 text-center md:pt-28">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="chip mb-8 border-indigo/30 bg-indigo/10 text-indigo-soft"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-soft opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-soft" />
          </span>
          Audit-grade control layer · Live risk verdicts
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.08 }}
          className="headline text-balance text-5xl leading-[1.04] text-white sm:text-6xl md:text-7xl"
        >
          The control layer for
          <br />
          AI agents that{" "}
          <span className="bg-gradient-to-r from-indigo-soft via-indigo to-indigo-soft bg-clip-text text-transparent">
            move money.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.18 }}
          className="mt-7 max-w-2xl text-lg leading-relaxed text-white/65 md:text-xl"
        >
          Sentinel judges every agent action in real time. Routine actions pass
          straight through. Risky, irreversible, or policy-violating ones are{" "}
          <span className="text-white/90">frozen and escalated to a human</span>{" "}
          — with full context and a tamper-evident audit trail, in seconds.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.28 }}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
        >
          <a href="#console" className="btn-primary text-base">
            See it live
            <span aria-hidden>→</span>
          </a>
          <a href="#how" className="btn-ghost text-base">
            How it works
          </a>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mt-12 text-xs uppercase tracking-[0.2em] text-white/35"
        >
          Built for fintechs &amp; digital banks · MAS-grade maker-checker
        </motion.p>
      </div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
      >
        <div className="flex h-9 w-5 items-start justify-center rounded-full border border-white/20 p-1">
          <motion.div
            className="h-1.5 w-1.5 rounded-full bg-white/60"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
    </section>
  );
}
