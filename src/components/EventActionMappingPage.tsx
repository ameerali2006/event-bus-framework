import React, { useEffect, useState } from "react";
import { eventApi, EventDefinition } from "../services/eventApi";
import { actionApi, ActionDefinition } from "../services/actionApi";
import { mappingApi, EventActionMapping } from "../services/mappingApi";
import { MappingTable } from "./MappingTable";
import { MappingForm } from "./MappingForm";
import { DeleteMappingModal } from "./DeleteMappingModal";

export const EventActionMappingPage: React.FC = () => {
  const [events, setEvents] = useState<EventDefinition[]>([]);
  const [actions, setActions] = useState<ActionDefinition[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<number | "">("");
  const [mappings, setMappings] = useState<EventActionMapping[]>([]);

  const [loadingEvents, setLoadingEvents] = useState<boolean>(true);
  const [loadingMappings, setLoadingMappings] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Form Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [mappingToEdit, setMappingToEdit] = useState<EventActionMapping | null>(null);

  // Delete Modals
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [mappingToDelete, setMappingToDelete] = useState<EventActionMapping | null>(null);

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

  const loadInitialData = async () => {
    try {
      setLoadingEvents(true);
      setError(null);
      const evts = await eventApi.getEvents();
      // Sort events by name
      const sortedEvts = [...evts].sort((a, b) => a.event_name.localeCompare(b.event_name));
      setEvents(sortedEvts);

      const acts = await actionApi.getActions();
      setActions(acts);

      // Pre-select first event if exists
      if (sortedEvts.length > 0) {
        setSelectedEventId(sortedEvts[0].id);
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || String(err) || "Failed to load events/actions catalog.");
    } finally {
      setLoadingEvents(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const fetchMappings = async (eventId: number) => {
    try {
      setLoadingMappings(true);
      const data = await mappingApi.getMappings(eventId);
      // Sort mappings by sort_order ascending
      const sorted = [...data].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
      setMappings(sorted);
    } catch (err: any) {
      console.error(err);
      showToast(err?.message || String(err) || "Failed to fetch event mappings.", "error");
    } finally {
      setLoadingMappings(false);
    }
  };

  useEffect(() => {
    if (selectedEventId !== "") {
      fetchMappings(Number(selectedEventId));
    } else {
      setMappings([]);
    }
  }, [selectedEventId]);

  const handleFormSubmit = async (formData: Omit<EventActionMapping, "id"> & { id?: number }) => {
    try {
      const actionName = actions.find((a) => a.id === formData.action_id)?.action_type || `#${formData.action_id}`;
      if (formData.id !== undefined) {
        // Edit Mode
        await mappingApi.updateMapping(formData as EventActionMapping);
        showToast(`Mapping for action '${actionName}' updated successfully.`);
      } else {
        // Create Mode
        await mappingApi.createMapping(formData);
        showToast(`Action '${actionName}' mapped to event successfully.`);
      }
      if (selectedEventId !== "") {
        fetchMappings(Number(selectedEventId));
      }
    } catch (err: any) {
      showToast(err?.message || String(err) || "Failed to save mapping configuration.", "error");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!mappingToDelete) return;
    try {
      await mappingApi.deleteMapping(mappingToDelete.id);
      showToast(`Action mapping deleted successfully.`);
      setIsDeleteOpen(false);
      setMappingToDelete(null);
      if (selectedEventId !== "") {
        fetchMappings(Number(selectedEventId));
      }
    } catch (err: any) {
      showToast(err?.message || String(err) || "Failed to delete mapping.", "error");
    }
  };

  const handleEditClick = (mapping: EventActionMapping) => {
    setMappingToEdit(mapping);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (mapping: EventActionMapping) => {
    setMappingToDelete(mapping);
    setIsDeleteOpen(true);
  };

  const handleNewMappingClick = () => {
    setMappingToEdit(null);
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
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1.5">Event → Action Mappings</h1>
          <p className="text-slate-400 text-sm">
            Map cataloged actions to system events and adjust execution sequences and custom constraints.
          </p>
        </div>
        <button
          className="inline-flex items-center gap-2 font-semibold text-sm px-5 py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer border-none disabled:opacity-50"
          onClick={handleNewMappingClick}
          disabled={selectedEventId === ""}
          title="Create a new event action mapping definition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          <span>Map Action</span>
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-lg text-sm bg-red-500/10 border border-red-500/20 text-red-300">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <div>
            <strong>Error:</strong> {error}
          </div>
        </div>
      )}

      {/* Select Event Row */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1.5 flex-grow max-w-md">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Selected Source Event
          </label>
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value === "" ? "" : Number(e.target.value))}
            className="bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors w-full"
            disabled={loadingEvents}
          >
            <option value="">Select Event to View Mappings...</option>
            {events.map((evt) => (
              <option key={evt.id} value={evt.id}>
                {evt.event_name} {evt.name ? `(${evt.name})` : ""}
              </option>
            ))}
          </select>
        </div>

        {selectedEventId !== "" && (
          <div className="text-sm text-slate-400 font-medium sm:text-right">
            Total mapped actions: <strong className="text-indigo-400 font-mono text-base">{mappings.length}</strong>
          </div>
        )}
      </div>

      {/* Mapped Actions Table */}
      {selectedEventId === "" ? (
        <div className="flex flex-col items-center justify-center py-20 px-10 text-center bg-slate-900/10 border border-dashed border-white/10 rounded-xl">
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
            <path d="m15 18-6-6 6-6" />
            <path d="M9 12h12" />
          </svg>
          <h3 className="mb-2 text-lg font-semibold text-slate-300">Select an event above</h3>
          <p className="text-sm text-slate-500 max-w-xs">Select one registered event to display, create, or update its mapped action triggers.</p>
        </div>
      ) : (
        <MappingTable
          mappings={mappings}
          actions={actions}
          loading={loadingMappings}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
        />
      )}

      {/* Mapping Form Overlay Modal */}
      <MappingForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        mappingToEdit={mappingToEdit}
        events={events}
        actions={actions}
        defaultEventId={selectedEventId === "" ? undefined : Number(selectedEventId)}
      />

      {/* Deletion confirmation */}
      <DeleteMappingModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        mappingToDelete={mappingToDelete}
        actions={actions}
      />
    </div>
  );
};
