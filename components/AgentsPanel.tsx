"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useConsole } from "@/lib/store";
import type { AgentIdentity } from "@/lib/engine/types";
import { ChevronIcon } from "./icons";

const COLORS: Record<string, string> = {
  "support-agent": "#33D69F",
  "payments-agent": "#6C5CE7",
  "treasury-agent": "#8B7CF0",
  "payroll-agent": "#F5A623",
  "insights-agent": "#4B9FE7",
  "ops-agent": "#E7864B",
  "it-agent": "#4BD0E7",
};

function monogram(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function AgentRow({ agent }: { agent: AgentIdentity }) {
  const toggle = useConsole((s) => s.toggleAgentRevoked);
  const color = COLORS[agent.id] ?? "#6C5CE7";

  return (
    <div
      className={`flex items-start gap-3.5 rounded-xl border px-3.5 py-3 transition-colors ${
        agent.revoked
          ? "border-sentinel-red/30 bg-sentinel-red/[0.05]"
          : "border-white/10 bg-white/[0.025]"
      }`}
    >
      <span
        className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[0.7rem] font-bold"
        style={{
          color: agent.revoked ? "#FF3B5C" : color,
          background: `${agent.revoked ? "#FF3B5C" : color}1f`,
          border: `1px solid ${agent.revoked ? "#FF3B5C" : color}55`,
        }}
      >
        {monogram(agent.name)}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className={`text-sm font-semibold ${
              agent.revoked ? "text-white/50 line-through" : "text-white"
            }`}
          >
            {agent.name}
          </span>
          <span className="text-[0.7rem] text-white/40">· {agent.role}</span>
          {agent.revoked && (
            <span className="rounded border border-sentinel-red/40 bg-sentinel-red/10 px-1.5 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-sentinel-red">
              revoked
            </span>
          )}
        </div>

        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {agent.capabilities.map((c) => (
            <span
              key={c.id}
              className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-0.5 font-mono text-[0.68rem] text-white/55"
            >
              {c.label}
            </span>
          ))}
        </div>
      </div>

      <button
        onClick={() => toggle(agent.id)}
        className={`shrink-0 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
          agent.revoked
            ? "border-allow/40 bg-allow/10 text-allow hover:bg-allow/20"
            : "border-sentinel-red/40 bg-sentinel-red/[0.07] text-sentinel-red hover:bg-sentinel-red/20"
        }`}
      >
        {agent.revoked ? "Restore" : "Revoke"}
      </button>
    </div>
  );
}

/**
 * Agent identities + their least-privilege capabilities (Auth0 model). Each
 * action is checked against the acting agent's grant before risk is considered.
 * Revoke an agent and its next action is denied instantly.
 */
export function AgentsPanel() {
  const agents = useConsole((s) => s.agents);
  const [open, setOpen] = useState(true);
  const active = agents.filter((a) => !a.revoked).length;

  return (
    <div className="surface overflow-hidden border-indigo/20">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-white">
            Agents
            <span className="chip h-5 border-indigo/30 bg-indigo/10 px-2 py-0 text-[0.6rem] text-indigo-soft">
              least-privilege · revocable
            </span>
          </p>
          <p className="text-xs text-white/45">
            {active} of {agents.length} active · every action is checked against
            the acting agent&apos;s grant first
          </p>
        </div>
        <ChevronIcon
          className={`h-5 w-5 text-white/40 transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="space-y-2.5 border-t border-white/[0.06] px-5 py-4">
              {agents.map((a) => (
                <AgentRow key={a.id} agent={a} />
              ))}
              <p className="pt-1 text-[0.7rem] leading-relaxed text-white/40">
                Capabilities are scoped grants, not broad roles. An action outside
                an agent&apos;s grant is a privilege escalation and is blocked
                on sight — before the risk model is even called.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
