import type { ActionDomain } from "@/lib/engine/types";

type IconProps = { className?: string };

// Lightweight, crisp inline SVG icons (stroke-based, currentColor).
const base = "h-full w-full";

export function PaymentsIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className ?? base}>
      <rect x="2.5" y="5.5" width="19" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M2.5 9.5h19" stroke="currentColor" strokeWidth="1.6" />
      <path d="M6 14.5h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function TreasuryIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className ?? base}>
      <path d="M12 3l8 3.5V8H4V6.5L12 3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M6 8v8M10 8v8M14 8v8M18 8v8" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4 19.5h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function RefundsIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className ?? base}>
      <path d="M4 9a8 8 0 1 1-1 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M3 5v4h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PayrollIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className ?? base}>
      <circle cx="9" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M17 8.5v7M14.5 12h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function DataIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className ?? base}>
      <ellipse cx="12" cy="6" rx="7" ry="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M5 6v12c0 1.66 3.13 3 7 3s7-1.34 7-3V6" stroke="currentColor" strokeWidth="1.6" />
      <path d="M5 12c0 1.66 3.13 3 7 3s7-1.34 7-3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function MarketingIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className ?? base}>
      <path d="M3.5 10.5L19 5v11l-15.5-2.5v-3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M7 14v3.5a1.5 1.5 0 0 0 3 0V14.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function InfraIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className ?? base}>
      <rect x="3.5" y="4" width="17" height="5" rx="1.6" stroke="currentColor" strokeWidth="1.6" />
      <rect x="3.5" y="11" width="17" height="5" rx="1.6" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7 6.5h.01M7 13.5h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M9 19h6M12 16v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function AccessIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className ?? base}>
      <circle cx="8" cy="10" r="3.4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10.6 11.4l7.4 7.4M16 17l2-2M18.4 14.6l1.6 1.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function DomainIcon({
  domain,
  className,
}: {
  domain: ActionDomain;
  className?: string;
}) {
  switch (domain) {
    case "payments":
      return <PaymentsIcon className={className} />;
    case "treasury":
      return <TreasuryIcon className={className} />;
    case "refunds":
      return <RefundsIcon className={className} />;
    case "payroll":
      return <PayrollIcon className={className} />;
    case "data":
      return <DataIcon className={className} />;
    case "marketing":
      return <MarketingIcon className={className} />;
    case "infrastructure":
      return <InfraIcon className={className} />;
    case "access":
      return <AccessIcon className={className} />;
  }
}

export function CheckIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className ?? base}>
      <path d="M5 12.5l4.5 4.5L19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ShieldIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className ?? base}>
      <path d="M12 3l7 2.5v5c0 4.5-3 8-7 9.5-4-1.5-7-5-7-9.5v-5L12 3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

export function LockIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className ?? base}>
      <rect x="5" y="10.5" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 10.5V8a4 4 0 1 1 8 0v2.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function ChevronIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className ?? base}>
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
