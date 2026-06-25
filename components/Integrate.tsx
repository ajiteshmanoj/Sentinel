"use client";

import { Reveal } from "./Reveal";
import { CheckIcon } from "./icons";

const GET = [
  "Governs any tool call — money, infra, identity, data",
  "Returns a structured verdict (allow / review / block + reasoning)",
  "Fail-safe: on any error it escalates, never auto-executes",
  "Capability scope + human-in-the-loop, built in",
  "Zero dependencies · Node, edge & browser",
];

// Tiny hand-highlighter so the snippet reads like real code without a lib.
const k = (s: string) => <span className="text-indigo-soft">{s}</span>;
const str = (s: string) => <span className="text-allow/90">{s}</span>;
const com = (s: string) => <span className="text-white/35">{s}</span>;
const fn = (s: string) => <span className="text-white">{s}</span>;
const dim = (s: string) => <span className="text-white/55">{s}</span>;

export function Integrate() {
  return (
    <section
      id="integrate"
      className="relative mx-auto max-w-6xl scroll-mt-24 px-6 py-24 md:py-32"
    >
      <Reveal className="mb-12 max-w-3xl">
        <p className="label-eyebrow mb-3">Integrate</p>
        <h2 className="headline text-4xl text-white md:text-5xl">
          Drop-in control for any agent.<br />Three lines.
        </h2>
        <p className="mt-4 text-white/60">
          Sentinel isn&apos;t a closed demo — it&apos;s a layer you wrap around
          your agent&apos;s tool calls. Wrap the tool, and every call it makes is
          judged before it can execute.
        </p>
      </Reveal>

      <div className="grid items-start gap-8 lg:grid-cols-[1.5fr_1fr]">
        {/* Code window */}
        <Reveal>
          <div className="surface overflow-hidden">
            <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-sentinel-red/70" />
              <span className="h-3 w-3 rounded-full bg-review/70" />
              <span className="h-3 w-3 rounded-full bg-allow/70" />
              <span className="ml-3 font-mono text-xs text-white/40">
                agent.ts
              </span>
            </div>
            <pre className="overflow-x-auto p-5 font-mono text-[0.82rem] leading-relaxed text-white/80">
{k("import")} {dim("{")} Sentinel {dim("}")} {k("from")} {str('"@sentinel/guard"')}{dim(";")}
{"\n\n"}
{k("const")} sentinel {dim("=")} {k("new")} {fn("Sentinel")}{dim("({")}
{"\n  "}baseUrl{dim(":")} {str('"https://sentinel-sable-nu.vercel.app"')}{dim(",")}
{"\n  "}agent{dim(":")} paymentsAgent{dim(",")}  {com("// least-privilege grant")}
{"\n"}{dim("});")}
{"\n\n"}
{com("// Wrap the tool your agent calls — now every call is governed.")}
{"\n"}{k("const")} safeWire {dim("=")} sentinel{dim(".")}{fn("protect")}{dim("(")}wireMoney{dim(",")} describeWire{dim(");")}
{"\n\n"}
{k("await")} {fn("safeWire")}{dim("({")} amount{dim(":")} {str("25_000")}{dim(",")} to{dim(":")} {str('"Orion (NEW)"')} {dim("});")}
{"\n"}{com("// ⛔ throws SentinelBlockedError before a cent moves")}
            </pre>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className="chip mono border-indigo/30 bg-indigo/10 text-indigo-soft">
              npm install @sentinel/guard
            </span>
            <span className="text-xs text-white/40">
              Self-contained SDK · <span className="font-mono">sdk/</span> in the repo
            </span>
          </div>
        </Reveal>

        {/* What you get */}
        <Reveal delay={0.05}>
          <div className="surface p-6">
            <p className="mb-4 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-indigo-soft/80">
              What you get
            </p>
            <ul className="space-y-3.5">
              {GET.map((g) => (
                <li key={g} className="flex items-start gap-3 text-sm text-white/75">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border border-indigo/30 bg-indigo/10 text-indigo-soft">
                    <CheckIcon className="h-3 w-3" />
                  </span>
                  {g}
                </li>
              ))}
            </ul>

            <div className="mt-6 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <p className="font-mono text-[0.72rem] leading-relaxed text-white/55">
                <span className="text-white/40">{"// or judge without wrapping"}</span>
                {"\n"}
                <span className="text-indigo-soft">const</span> v{" "}
                <span className="text-white/45">=</span>{" "}
                <span className="text-indigo-soft">await</span> sentinel.
                <span className="text-white">guard</span>(action);
                {"\n"}
                <span className="text-indigo-soft">if</span> (v.escalated){" "}
                <span className="text-white/40">/* route to a human */</span>
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
