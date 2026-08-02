import React, { useState, useEffect } from "react";
import { Trigger } from "../services/triggerApi";

interface TriggerFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (trigger: Omit<Trigger, "id" | "last_trigger"> & { id?: number }) => Promise<void>;
  triggerToEdit?: Trigger | null;
}

export const TriggerForm: React.FC<TriggerFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  triggerToEdit,
}) => {
  const [name, setName] = useState("");
  const [expression, setExpression] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (triggerToEdit) {
      setName(triggerToEdit.name || "");
      setExpression(triggerToEdit.expression || "");
    } else {
      setName("");
      setExpression("");
    }
    setValidationError(null);
  }, [triggerToEdit, isOpen]);

  if (!isOpen) return null;

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setValidationError("Trigger Name is required.");
      return;
    }

    const trimmedExpression = expression.trim();
    if (!trimmedExpression) {
      setValidationError("Cron Expression is required.");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        id: triggerToEdit?.id,
        name: trimmedName,
        expression: trimmedExpression,
      });
      onClose();
    } catch (err: any) {
      setValidationError(err?.message || String(err) || "Failed to save trigger.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-[fadeIn_0.3s_ease-out_forwards]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-950/60 border-b border-white/5 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">
            {triggerToEdit ? "Edit Scheduler Trigger" : "Create Scheduler Trigger"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors bg-transparent border-none cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleFormSubmit} className="p-6 flex flex-col gap-4">
          {validationError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-300 rounded-lg text-sm flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              <span>{validationError}</span>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Trigger Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. DailyBackupTrigger, HelloTrigger"
              className="bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Cron Expression <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={expression}
              onChange={(e) => setExpression(e.target.value)}
              placeholder="e.g. */5 * * * * * (Every 5 seconds, standard format)"
              className="bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors font-mono"
              required
            />
            <p className="text-[11px] text-slate-500">
              Supports 6-field standard cron format (Seconds Minutes Hours Days Months Weekdays).
            </p>
          </div>

          {/* Modal Actions */}
          <div className="flex justify-end gap-3 mt-4 border-t border-white/5 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center font-semibold text-sm px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center font-semibold text-sm px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/35 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 transition-all cursor-pointer border-none"
            >
              {isSubmitting ? "Saving..." : "Save Trigger"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
