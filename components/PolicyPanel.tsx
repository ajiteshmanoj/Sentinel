"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useConsole } from "@/lib/store";
import { ChevronIcon } from "./icons";

/**
 * Editable policy rules. Editing a rule and re-running visibly changes the
 * verdict — proof the engine genuinely reads the policy, not a script.
 */
export function PolicyPanel() {
  const rules = useConsole((s) => s.policyRules);
  const update = useConsole((s) => s.updatePolicyRule);
  const toggle = useConsole((s) => s.togglePolicyRule);
  const add = useConsole((s) => s.addPolicyRule);
  const remove = useConsole((s) => s.removePolicyRule);
  const resetPolicy = useConsole((s) => s.resetPolicy);
  const [open, setOpen] = useState(false);

  const enabledCount = rules.filter((r) => r.enabled).length;

  return (
    <div className="surface overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <div>
          <p className="text-sm font-semibold text-white">Policy rules</p>
          <p className="text-xs text-white/45">
            {enabledCount} active · edit a rule, then re-run to change verdicts
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
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className={`flex items-start gap-3 rounded-xl border px-3 py-2.5 transition-colors ${
                    rule.enabled
                      ? "border-white/10 bg-white/[0.03]"
                      : "border-white/[0.05] bg-transparent opacity-50"
                  }`}
                >
                  <button
                    onClick={() => toggle(rule.id)}
                    aria-label={rule.enabled ? "Disable rule" : "Enable rule"}
                    className={`mt-1 grid h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors ${
                      rule.enabled ? "bg-indigo justify-end" : "bg-white/10 justify-start"
                    } flex`}
                  >
                    <span className="h-4 w-4 rounded-full bg-white shadow" />
                  </button>
                  <textarea
                    value={rule.text}
                    onChange={(e) => update(rule.id, e.target.value)}
                    rows={2}
                    className="min-h-0 flex-1 resize-none rounded-md bg-transparent text-sm leading-relaxed text-white/80 outline-none placeholder:text-white/30 focus:bg-white/[0.03]"
                  />
                  <button
                    onClick={() => remove(rule.id)}
                    aria-label="Remove rule"
                    className="mt-0.5 text-white/30 transition-colors hover:text-sentinel-red"
                  >
                    ✕
                  </button>
                </div>
              ))}

              <div className="flex items-center gap-3 pt-1">
                <button onClick={add} className="btn-ghost h-8 px-3 py-0 text-xs">
                  + Add rule
                </button>
                <button
                  onClick={resetPolicy}
                  className="text-xs text-white/40 transition-colors hover:text-white/70"
                >
                  Reset to defaults
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
