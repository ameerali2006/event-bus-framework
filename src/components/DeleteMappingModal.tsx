import React from "react";
import { EventActionMapping } from "../services/mappingApi";
import { ActionDefinition } from "../services/actionApi";

interface DeleteMappingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  mappingToDelete: EventActionMapping | null;
  actions: ActionDefinition[];
}

export const DeleteMappingModal: React.FC<DeleteMappingModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  mappingToDelete,
  actions,
}) => {
  if (!isOpen || !mappingToDelete) return null;

  const mappedAction = actions.find((a) => a.id === mappingToDelete.action_id);
  const actionName = mappedAction
    ? `${mappedAction.action_type} (${mappedAction.name || "—"})`
    : `Action #${mappingToDelete.action_id}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-[fadeIn_0.3s_ease-out_forwards]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-950/60 border-b border-white/5 flex justify-between items-center">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            <span>Delete Action Mapping?</span>
          </h2>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          <p className="text-slate-300 text-sm leading-relaxed mb-6">
            Are you sure you want to delete the mapping for action <strong className="text-indigo-400 font-mono">{actionName}</strong>?
            This will stop the action from being triggered when this event fires.
          </p>

          {/* Modal Actions */}
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="inline-flex items-center justify-center font-semibold text-sm px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="inline-flex items-center justify-center font-semibold text-sm px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white text-red-300 shadow-lg shadow-red-500/10 transition-all cursor-pointer"
            >
              Confirm Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
