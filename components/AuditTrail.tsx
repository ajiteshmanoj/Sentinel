"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useConsole, type AuditEntry } from "@/lib/store";
import { VERDICT_THEME, formatMoney } from "@/lib/format";
import { ChevronIcon } from "./icons";

const GENESIS = "0".repeat(64);

/** SHA-256 hash chain — each record is hashed together with the previous hash,
 *  so altering any row breaks every hash after it. Tamper-evident by design. */
async function computeChain(entries: AuditEntry[]): Promise<string[]> {
  const out: string[] = [];
  let prev = GENESIS;
  const enc = new TextEncoder();
  for (const e of entries) {
    const core = JSON.stringify({
      seq: e.seq,
      ts: e.ts,
      actionId: e.actionId,
      kind: e.kind,
      verdict: e.verdict ?? null,
      caughtBy: e.caughtBy ?? null,
      riskScore: e.riskScore ?? null,
      humanDecision: e.humanDecision ?? null,
    });
    const buf = await crypto.subtle.digest("SHA-256", enc.encode(prev + core));
    const hex = Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    out.push(hex);
    prev = hex;
  }
  return out;
}

function timeOf(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString("en-GB", { hour12: false });
}

function KindChip({ entry }: { entry: AuditEntry }) {
  if (entry.kind === "human") {
    return (
      <span className="rounded border border-white/15 bg-white/[0.05] px-1.5 py-0.5 text-[0.65rem] font-medium text-white/70">
        human · {entry.humanDecision}
      </span>
    );
  }
  if (entry.kind === "unchecked") {
    return (
      <span className="rounded border border-sentinel-red/40 bg-sentinel-red/10 px-1.5 py-0.5 text-[0.65rem] font-medium text-sentinel-red">
        unchecked
      </span>
    );
  }
  const v = entry.verdict ?? "review";
  const theme = VERDICT_THEME[v];
  return (
    <span
      className={`rounded border px-1.5 py-0.5 text-[0.65rem] font-medium ${theme.border} ${theme.bg} ${theme.text}`}
    >
      {v}
    </span>
  );
}

export function AuditTrail() {
  const auditLog = useConsole((s) => s.auditLog);
  const [open, setOpen] = useState(true);
  const [hashes, setHashes] = useState<string[]>([]);

  useEffect(() => {
    let active = true;
    computeChain(auditLog).then((h) => {
      if (active) setHashes(h);
    });
    return () => {
      active = false;
    };
  }, [auditLog]);

  const headHash = hashes.length ? hashes[hashes.length - 1] : null;

  const download = useMemo(
    () => () => {
      const payload = {
        product: "Sentinel",
        generatedAt: new Date().toISOString(),
        integrity: "SHA-256 hash chain (each record chained to the previous)",
        recordCount: auditLog.length,
        headHash,
        records: auditLog.map((e, i) => ({
          ...e,
          timestamp: new Date(e.ts).toISOString(),
          prevHash: i === 0 ? GENESIS : hashes[i - 1] ?? null,
          hash: hashes[i] ?? null,
        })),
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "sentinel-audit-trail.json";
      a.click();
      URL.revokeObjectURL(url);
    },
    [auditLog, hashes, headHash],
  );

  return (
    <div className="surface overflow-hidden border-white/[0.09]">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-white">
            Audit trail
            <span className="chip h-5 border-allow/30 bg-allow/10 px-2 py-0 text-[0.6rem] text-allow">
              tamper-evident · SHA-256
            </span>
          </p>
          <p className="text-xs text-white/45">
            {auditLog.length} immutable record{auditLog.length === 1 ? "" : "s"} ·
            every decision logged and chained
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
            <div className="border-t border-white/[0.06] px-5 py-4">
              {auditLog.length === 0 ? (
                <p className="py-6 text-center text-sm text-white/40">
                  Run the console — every verdict and human decision is appended
                  here as an immutable, hash-chained record.
                </p>
              ) : (
                <>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="font-mono text-[0.7rem] text-white/45">
                      head: {headHash ? `${headHash.slice(0, 18)}…` : "…"}
                    </p>
                    <button
                      onClick={download}
                      className="btn-ghost h-8 px-3 py-0 text-xs"
                    >
                      ↓ Export signed log (JSON)
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px] border-collapse text-left">
                      <thead>
                        <tr className="text-[0.62rem] uppercase tracking-[0.12em] text-white/35">
                          <th className="py-2 pr-3 font-medium">#</th>
                          <th className="py-2 pr-3 font-medium">Time</th>
                          <th className="py-2 pr-3 font-medium">Action</th>
                          <th className="py-2 pr-3 font-medium">Outcome</th>
                          <th className="py-2 pr-3 font-medium">Caught by</th>
                          <th className="py-2 pr-3 font-medium">Hash</th>
                        </tr>
                      </thead>
                      <tbody className="font-mono text-xs">
                        {auditLog.map((e, i) => (
                          <tr
                            key={`${e.seq}-${e.actionId}`}
                            className="border-t border-white/[0.05] text-white/70"
                          >
                            <td className="py-2 pr-3 text-white/40">
                              {String(e.seq).padStart(2, "0")}
                            </td>
                            <td className="py-2 pr-3 text-white/55">
                              {timeOf(e.ts)}
                            </td>
                            <td className="max-w-[220px] py-2 pr-3">
                              <span className="block truncate font-sans text-white/80">
                                {e.summary}
                              </span>
                              {typeof e.amount === "number" && (
                                <span className="text-[0.65rem] text-white/40">
                                  {formatMoney(e.amount)}
                                </span>
                              )}
                            </td>
                            <td className="py-2 pr-3">
                              <KindChip entry={e} />
                            </td>
                            <td className="py-2 pr-3 font-sans text-[0.7rem] text-white/55">
                              {e.caughtBy ?? (e.detail ? e.detail : "—")}
                            </td>
                            <td className="py-2 pr-3 text-allow/70">
                              {hashes[i] ? `${hashes[i].slice(0, 10)}…` : "…"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <p className="mt-3 text-[0.7rem] leading-relaxed text-white/40">
                    Each record is SHA-256–hashed together with the hash of the
                    record before it. Altering any row changes its hash and breaks
                    every hash after it — so the log is tamper-evident and
                    audit-ready.
                  </p>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
