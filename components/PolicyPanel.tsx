"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useConsole } from "@/lib/store";
import type { GuardrailThresholds } from "@/lib/engine/types";
import { ChevronIcon } from "./icons";

const THRESHOLD_FIELDS: { key: keyof GuardrailThresholds; label: string }[] = [
  { key: "newAccountValue", label: "New-payee limit" },
  { key: "makerCheckerValue", label: "Maker-checker limit" },
  { key: "refundReviewValue", label: "Refund approval limit" },
  { key: "irreversibleValue", label: "Irreversible high-value limit" },
];

function ThresholdField({
  fieldKey,
  label,
}: {
  fieldKey: keyof GuardrailThresholds;
  label: string;
}) {
  const value = useConsole((s) => s.thresholds[fieldKey]);
  const setThreshold = useConsole((s) => s.setThreshold);
  return (
    <label className="flex flex-col gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
      <span className="text-[0.65rem] uppercase tracking-[0.12em] text-white/40">
        {label}
      </span>
      <div className="flex items-center gap-1">
        <span className="text-sm text-white/50">$</span>
        <input
          type="number"
          min={0}
          step={100}
          value={value}
          onChange={(e) => setThreshold(fieldKey, Number(e.target.value) || 0)}
          className="w-full bg-transparent text-sm font-semibold text-white outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
        />
      </div>
    </label>
  );
}

/**
 * Editable policy — plain-language rules (read by the model) AND deterministic
 * thresholds (used by the guardrails). Editing either and re-running visibly
 * changes verdicts: proof the engine reads the policy, not a script.
 */
export function PolicyPanel() {
  const rules = useConsole((s) => s.policyRules);
  const update = useConsole((s) => s.updatePolicyRule);
  const toggle = useConsole((s) => s.togglePolicyRule);
  const add = useConsole((s) => s.addPolicyRule);
  const remove = useConsole((s) => s.removePolicyRule);
  const resetPolicy = useConsole((s) => s.resetPolicy);
  const [open, setOpen] = useState(true);

  const enabledCount = rules.filter((r) => r.enabled).length;

  return (
    <div className="surface overflow-hidden border-indigo/20">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-white">
            Policy
            <span className="chip h-5 border-indigo/30 bg-indigo/10 px-2 py-0 text-[0.6rem] text-indigo-soft">
              live · edit &amp; re-run
            </span>
          </p>
          <p className="text-xs text-white/45">
            {enabledCount} rules + {THRESHOLD_FIELDS.length} thresholds · change a
            limit, re-run, watch a verdict flip
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
            <div className="space-y-4 border-t border-white/[0.06] px-5 py-4">
              {/* Editable deterministic thresholds */}
              <div>
                <p className="mb-2 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-white/40">
                  Guardrail thresholds
                </p>
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                  {THRESHOLD_FIELDS.map((f) => (
                    <ThresholdField
                      key={f.key}
                      fieldKey={f.key}
                      label={f.label}
                    />
                  ))}
                </div>
              </div>

              {/* Plain-language rules */}
              <div>
                <p className="mb-2 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-white/40">
                  Plain-language rules (read by the model)
                </p>
                <div className="space-y-2.5">
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
                        className={`mt-1 flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors ${
                          rule.enabled
                            ? "justify-end bg-indigo"
                            : "justify-start bg-white/10"
                        }`}
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
                </div>
              </div>

              <div className="flex items-center gap-3 pt-0.5">
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
