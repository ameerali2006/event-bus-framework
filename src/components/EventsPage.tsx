import React, { useEffect, useState } from "react";
import { eventApi, EventDefinition } from "../services/eventApi";
import { EventsTable } from "./EventsTable";

export const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<EventDefinition[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await eventApi.getEvents();
      // Sort events by sort_order ascending
      const sorted = [...data].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
      setEvents(sorted);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || String(err) || "Failed to load events definitions from SQLite.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className="flex flex-col gap-8 animate-[fadeIn_0.4s_ease-out_forwards]">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1.5">Events Catalog</h1>
          <p className="text-slate-400 text-sm">
            Configure dynamic database-driven triggers, parameters, and action handlers.
          </p>
        </div>
        <button
          className="inline-flex items-center gap-2 font-semibold text-sm px-5 py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer border-none"
          onClick={fetchEvents}
          title="Refresh Events Database"
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
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-lg text-sm bg-red-500/10 border border-red-500/20 text-red-300">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <div>
            <strong>Database Error:</strong> {error}
          </div>
        </div>
      )}

      <EventsTable events={events} loading={loading} />
    </div>
  );
};
