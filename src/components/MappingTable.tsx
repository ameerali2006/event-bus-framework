import React from "react";
import { EventActionMapping } from "../services/mappingApi";
import { ActionDefinition } from "../services/actionApi";

interface MappingTableProps {
  mappings: EventActionMapping[];
  actions: ActionDefinition[];
  loading: boolean;
  onEdit: (mapping: EventActionMapping) => void;
  onDelete: (mapping: EventActionMapping) => void;
}

export const MappingTable: React.FC<MappingTableProps> = ({
  mappings,
  actions,
  loading,
  onEdit,
  onDelete,
}) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
        <div className="w-8 h-8 border-2 border-white/5 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
        <p>Fetching mapped actions...</p>
      </div>
    );
  }

  if (mappings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-10 text-center bg-slate-900/10 border border-dashed border-white/10 rounded-xl">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-slate-600 mb-4"
        >
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
        <h3 className="mb-2 text-lg font-semibold text-slate-300">No actions mapped</h3>
        <p className="text-sm text-slate-500 max-w-xs">Define action trigger mappings for this event.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/30 backdrop-blur-lg border border-white/5 rounded-xl overflow-hidden shadow-xl shadow-black/20 animate-[fadeIn_0.4s_ease-out_forwards]">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="bg-slate-950/45 border-b border-white/5">
            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Action Name</th>
            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Parameters JSON</th>
            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Custom Constraint</th>
            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Sort Order</th>
            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {mappings.map((mapping) => {
            const mappedAction = actions.find((a) => a.id === mapping.action_id);
            const actionName = mappedAction
              ? `${mappedAction.action_type} ${mappedAction.name ? `(${mappedAction.name})` : ""}`
              : `Action #${mapping.action_id}`;

            return (
              <tr key={mapping.id} className="hover:bg-white/5 transition-all border-b border-white/5">
                <td className="px-6 py-4 text-sm font-semibold text-white">{actionName}</td>
                <td className="px-6 py-4 text-sm font-mono text-slate-400 text-xs max-w-xs overflow-hidden text-ellipsis whitespace-nowrap">
                  {mapping.parameter_values || "—"}
                </td>
                <td className="px-6 py-4 text-sm text-slate-300 font-mono text-xs">{mapping.custom_constraint || "—"}</td>
                <td className="px-6 py-4 text-sm">
                  <span className="bg-white/5 border border-white/10 px-2 py-0.5 rounded text-xs font-semibold text-slate-400 font-mono">
                    #{mapping.sort_order ?? 0}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onEdit(mapping)}
                      className="inline-flex items-center gap-1.5 bg-white/3 border border-white/5 text-slate-400 hover:bg-white/6 hover:text-indigo-400 hover:border-indigo-500/35 px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-200"
                      title="Edit Action Mapping"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z"></path></svg>
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => onDelete(mapping)}
                      className="inline-flex items-center gap-1.5 bg-white/3 border border-white/5 text-slate-400 hover:bg-white/6 hover:text-red-400 hover:border-red-500/35 px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-200"
                      title="Delete Action Mapping"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                      <span>Delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
