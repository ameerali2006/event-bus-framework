import React, { useEffect, useState } from "react";
import { actionApi, ActionDefinition } from "../services/actionApi";
import { ActionsTable } from "./ActionsTable";
import { ActionForm } from "./ActionForm";
import { DeleteActionModal } from "./DeleteActionModal";

export const ActionsPage: React.FC = () => {
  const [actions, setActions] = useState<ActionDefinition[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [actionToEdit, setActionToEdit] = useState<ActionDefinition | null>(null);

  // Delete Confirm State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [actionToDelete, setActionToDelete] = useState<ActionDefinition | null>(null);

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

  const fetchActions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await actionApi.getActions();
      // Sort actions by sort_order ascending
      const sorted = [...data].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
      setActions(sorted);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || String(err) || "Failed to load action definitions from SQLite.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActions();
  }, []);

  const handleFormSubmit = async (formData: Omit<ActionDefinition, "id"> & { id?: number }) => {
    if (formData.id !== undefined) {
      // Edit Mode
      await actionApi.updateAction(formData as ActionDefinition);
      showToast(`Action '${formData.action_type}' updated successfully.`);
    } else {
      // Create Mode
      await actionApi.createAction(formData);
      showToast(`Action '${formData.action_type}' registered successfully.`);
    }
    fetchActions();
  };

  const handleDeleteConfirm = async () => {
    if (!actionToDelete) return;
    try {
      await actionApi.deleteAction(actionToDelete.id);
      showToast(`Action '${actionToDelete.action_type}' deleted successfully.`);
      setIsDeleteOpen(false);
      setActionToDelete(null);
      fetchActions();
    } catch (err: any) {
      showToast(err?.message || String(err) || "Failed to delete action.", "error");
    }
  };

  const handleEditClick = (action: ActionDefinition) => {
    setActionToEdit(action);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (action: ActionDefinition) => {
    setActionToDelete(action);
    setIsDeleteOpen(true);
  };

  const handleNewActionClick = () => {
    setActionToEdit(null);
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
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1.5">Actions Catalog</h1>
          <p className="text-slate-400 text-sm">
            Manage system-wide action handlers, loggers, messages, and email dispatchers.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="inline-flex items-center gap-2 font-semibold text-sm px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all cursor-pointer"
            onClick={fetchActions}
            title="Refresh Actions Catalog"
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
            onClick={handleNewActionClick}
            title="Register new action handler definition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            <span>New Action</span>
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
      <ActionsTable
        actions={actions}
        loading={loading}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
      />

      {/* CRUD Action Form Modal */}
      <ActionForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        actionToEdit={actionToEdit}
      />

      {/* Safety Confirmation Dialog */}
      <DeleteActionModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        actionToDelete={actionToDelete}
      />
    </div>
  );
};
