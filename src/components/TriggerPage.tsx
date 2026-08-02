import React, { useEffect, useState } from "react";
import { triggerApi, Trigger } from "../services/triggerApi";
import { TriggerTable } from "./TriggerTable";
import { TriggerForm } from "./TriggerForm";
import { DeleteTriggerModal } from "./DeleteTriggerModal";

export const TriggerPage: React.FC = () => {
  const [triggers, setTriggers] = useState<Trigger[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [triggerToEdit, setTriggerToEdit] = useState<Trigger | null>(null);

  // Delete Confirm State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [triggerToDelete, setTriggerToDelete] = useState<Trigger | null>(null);

  // Toast Notification State
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchTriggers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await triggerApi.getTriggers();
      // Sort triggers by name
      const sorted = [...data].sort((a, b) => a.name.localeCompare(b.name));
      setTriggers(sorted);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || String(err) || "Failed to load triggers from SQLite database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTriggers();
    // Auto-refresh trigger last_trigger status periodically (every 5 seconds) to display real-time scheduler runs
    const interval = setInterval(fetchTriggers, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleFormSubmit = async (formData: Omit<Trigger, "id" | "last_trigger"> & { id?: number }) => {
    if (formData.id !== undefined) {
      // Edit Mode
      await triggerApi.updateTrigger(formData as Omit<Trigger, "last_trigger">);
      showToast(`Trigger '${formData.name}' updated successfully. Please restart/reload to apply scheduling modifications.`);
    } else {
      // Create Mode
      await triggerApi.createTrigger(formData);
      showToast(`Trigger '${formData.name}' registered successfully. Cron scheduler will pick it up on startup.`);
    }
    fetchTriggers();
  };

  const handleDeleteConfirm = async () => {
    if (!triggerToDelete) return;
    try {
      await triggerApi.deleteTrigger(triggerToDelete.id);
      showToast(`Trigger '${triggerToDelete.name}' deleted successfully.`);
      setIsDeleteOpen(false);
      setTriggerToDelete(null);
      fetchTriggers();
    } catch (err: any) {
      showToast(err?.message || String(err) || "Failed to delete trigger.", "error");
    }
  };

  const handleEditClick = (trigger: Trigger) => {
    setTriggerToEdit(trigger);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (trigger: Trigger) => {
    setTriggerToDelete(trigger);
    setIsDeleteOpen(true);
  };

  const handleNewTriggerClick = () => {
    setTriggerToEdit(null);
    setIsFormOpen(true);
  };

  return (
    <div className="flex flex-col gap-8 animate-[fadeIn_0.4s_ease-out_forwards] relative">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-2xl animate-[fadeIn_0.3s_ease-out_forwards] ${
            toast.type === "success"
              ? "bg-emerald-950/95 border-emerald-500/30 text-emerald-200"
              : "bg-red-950/95 border-red-500/30 text-red-200"
          }`}
        >
          {toast.type === "success" ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          )}
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1.5">Triggers Scheduler</h1>
          <p className="text-slate-400 text-sm">
            Configure system execution triggers, monitor real-time execution times, and set cron schedules.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="inline-flex items-center gap-2 font-semibold text-sm px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all cursor-pointer"
            onClick={fetchTriggers}
            title="Refresh Triggers Lists"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={loading ? "animate-spin" : ""}
            >
              <path d="M21.5 2v6h-6" />
              <path d="M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
            <span>Refresh</span>
          </button>
          <button
            className="inline-flex items-center gap-2 font-semibold text-sm px-5 py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer border-none"
            onClick={handleNewTriggerClick}
            title="Add a new cron trigger"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            <span>New Trigger</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-lg text-sm bg-red-500/10 border border-red-500/20 text-red-300">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <div>
            <strong>Database Error:</strong> {error}
          </div>
        </div>
      )}

      {/* Table view */}
      <TriggerTable
        triggers={triggers}
        loading={loading}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
      />

      {/* CRUD Trigger Form Modal */}
      <TriggerForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        triggerToEdit={triggerToEdit}
      />

      {/* Safety Confirmation Dialog */}
      <DeleteTriggerModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        triggerToDelete={triggerToDelete}
      />
    </div>
  );
};
