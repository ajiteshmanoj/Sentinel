// Minimal monochrome marks for the "Built with" strip. currentColor so chips
// can tint them. Simplified but recognizable alongside the wordmarks.

type P = { className?: string };
const base = "h-5 w-5";

export function OpenAIMark({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className ?? base}>
      <g stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
        <line x1="12" y1="3.5" x2="12" y2="20.5" />
        <line x1="4.6" y1="7.75" x2="19.4" y2="16.25" />
        <line x1="4.6" y1="16.25" x2="19.4" y2="7.75" />
      </g>
      <circle cx="12" cy="12" r="2.1" fill="currentColor" />
    </svg>
  );
}

export function NextMark({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className ?? base}>
      <circle cx="12" cy="12" r="9.4" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8.6 8v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8.6 8l7.4 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M15.6 8.5v5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function VercelMark({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className ?? base}>
      <path d="M12 4l9 15.6H3z" />
    </svg>
  );
}

export function TypeScriptMark({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className ?? base}>
      <rect x="2.5" y="2.5" width="19" height="19" rx="3.5" fill="currentColor" opacity="0.16" />
      <rect x="2.5" y="2.5" width="19" height="19" rx="3.5" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <text
        x="12.2"
        y="16.2"
        textAnchor="middle"
        fontSize="8.6"
        fontWeight="700"
        fontFamily="ui-monospace, monospace"
        fill="currentColor"
      >
        TS
      </text>
    </svg>
  );
}

export function TailwindMark({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className ?? base}>
      <path
        d="M6 11c1.3-3.4 3.4-4.2 6.2-2.4 1.6 1 2.6 1.7 4 1.4-1.3 3.4-3.4 4.2-6.2 2.4-1.6-1-2.6-1.7-4-1.4z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M2.5 15c1.3-3.4 3.4-4.2 6.2-2.4 1.6 1 2.6 1.7 4 1.4-1.3 3.4-3.4 4.2-6.2 2.4-1.6-1-2.6-1.7-4-1.4z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
        opacity="0.55"
      />
    </svg>
  );
}

export function FramerMark({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className ?? base}>
      <path d="M6 3h12v6H12zM6 9h6l6 6H6zM6 15h6v6z" />
    </svg>
  );
}

export function ReactMark({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className ?? base}>
      <circle cx="12" cy="12" r="1.7" fill="currentColor" />
      <g stroke="currentColor" strokeWidth="1.1">
        <ellipse cx="12" cy="12" rx="10" ry="3.9" />
        <ellipse cx="12" cy="12" rx="10" ry="3.9" transform="rotate(60 12 12)" />
        <ellipse cx="12" cy="12" rx="10" ry="3.9" transform="rotate(120 12 12)" />
      </g>
    </svg>
  );
}

export interface TechItem {
  name: string;
  Mark: (p: P) => JSX.Element;
}

export const BUILT_WITH: TechItem[] = [
  { name: "OpenAI", Mark: OpenAIMark },
  { name: "Next.js", Mark: NextMark },
  { name: "Vercel", Mark: VercelMark },
  { name: "TypeScript", Mark: TypeScriptMark },
  { name: "Tailwind CSS", Mark: TailwindMark },
  { name: "Framer Motion", Mark: FramerMark },
  { name: "React", Mark: ReactMark },
];
