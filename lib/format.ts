import type { ActionDomain, Verdict } from "./engine/types";

export function formatMoney(value: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}

export function titleCase(s: string): string {
  return s.replace(/(^|[\s_-])(\w)/g, (_, p1, p2) => p1.replace(/[_-]/, " ") + p2.toUpperCase());
}

/** Sentence-case: capitalize the first character (leaves "$4,200 …" untouched). */
export function capitalizeFirst(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Belt-and-suspenders for the streamed narration: if the model slips into JSON
 * (e.g. {"reason":"…"}), surface just the reason prose — progressively, even
 * mid-stream — so raw braces never show in the card.
 */
export function cleanNarration(text: string): string {
  const s = text.trimStart();
  if (!s.startsWith("{") && !s.startsWith("[")) return text;
  const m = s.match(/"reason"\s*:\s*"((?:[^"\\]|\\.)*)/);
  if (m) {
    return m[1]
      .replace(/\\"/g, '"')
      .replace(/\\n/g, " ")
      .replace(/\\t/g, " ")
      .trim();
  }
  return ""; // JSON started but the reason field hasn't streamed yet
}

export const DOMAIN_LABEL: Record<ActionDomain, string> = {
  payments: "Payments",
  treasury: "Treasury",
  refunds: "Refunds",
  payroll: "Payroll",
  data: "Data",
  marketing: "Marketing",
  infrastructure: "Infrastructure",
  access: "Access",
};

export interface VerdictTheme {
  label: string;
  text: string;
  border: string;
  bg: string;
  ring: string;
  dot: string;
  glow: string;
}

export const VERDICT_THEME: Record<Verdict, VerdictTheme> = {
  allow: {
    label: "Allowed",
    text: "text-allow",
    border: "border-allow/40",
    bg: "bg-allow/10",
    ring: "#33D69F",
    dot: "bg-allow",
    glow: "shadow-[0_0_30px_-12px_rgba(51,214,159,0.6)]",
  },
  review: {
    label: "Held for review",
    text: "text-review",
    border: "border-review/40",
    bg: "bg-review/10",
    ring: "#F5A623",
    dot: "bg-review",
    glow: "shadow-[0_0_30px_-10px_rgba(245,166,35,0.55)]",
  },
  block: {
    label: "Blocked",
    text: "text-sentinel-red",
    border: "border-sentinel-red/50",
    bg: "bg-sentinel-red/10",
    ring: "#FF3B5C",
    dot: "bg-sentinel-red",
    glow: "shadow-glow-red",
  },
};

/** Humanize the "caughtBy" provenance for the trust label. */
export function caughtByLabel(caughtBy: string | null): string | null {
  if (!caughtBy) return null;
  return caughtBy;
}
