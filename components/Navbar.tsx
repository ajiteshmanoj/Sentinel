"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Logo } from "./Logo";

const LINKS = [
  { href: "#console", label: "Live console" },
  { href: "#architecture", label: "Architecture" },
  { href: "#integrate", label: "Integrate" },
  { href: "#positioning", label: "Why fintech first" },
];

/**
 * Site-wide nav that starts full-width and transparent at the top, then
 * condenses into a compact floating glass pill as you scroll.
 */
export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 36);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed inset-x-0 top-0 z-50 flex justify-center px-4">
      <motion.div
        initial={false}
        animate={{
          maxWidth: scrolled ? 780 : 1280,
          marginTop: scrolled ? 14 : 0,
          paddingTop: scrolled ? 9 : 18,
          paddingBottom: scrolled ? 9 : 18,
          borderRadius: scrolled ? 999 : 0,
          backgroundColor: scrolled ? "rgba(17,17,29,0.72)" : "rgba(7,7,12,0)",
          borderColor: scrolled
            ? "rgba(255,255,255,0.10)"
            : "rgba(255,255,255,0)",
        }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className={`flex w-full items-center justify-between gap-6 border px-5 ${
          scrolled ? "shadow-lift backdrop-blur-xl" : ""
        }`}
      >
        <a href="#top" aria-label="Sentinel home">
          <Logo />
        </a>

        <nav className="hidden items-center gap-8 text-sm text-white/60 lg:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="transition-colors hover:text-white"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <a href="#console" className="btn-ghost hidden h-9 py-0 text-sm sm:inline-flex">
          See it live
        </a>
      </motion.div>
    </div>
  );
}
