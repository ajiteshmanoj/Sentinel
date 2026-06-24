import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] px-6 py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 md:flex-row">
        <div className="flex flex-col items-center gap-2 md:items-start">
          <Logo />
          <p className="text-sm text-white/40">
            The audit-grade control layer for AI agents that move money.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/45">
          <a href="#console" className="transition-colors hover:text-white">
            Live console
          </a>
          <a href="#how" className="transition-colors hover:text-white">
            How it works
          </a>
          <a href="#positioning" className="transition-colors hover:text-white">
            Why fintech first
          </a>
        </div>
      </div>
      <p className="mx-auto mt-8 max-w-6xl text-center text-xs text-white/25 md:text-left">
        Demo build. The agent action stream is scripted for reproducibility; every
        risk verdict is judged live by the model at runtime.
      </p>
    </footer>
  );
}
