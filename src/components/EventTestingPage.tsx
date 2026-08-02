import React, { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { eventApi, EventDefinition } from "../services/eventApi";

export const EventTestingPage: React.FC = () => {
  const [events, setEvents] = useState<EventDefinition[]>([]);
  const [selectedEventName, setSelectedEventName] = useState<string>("");
  const [payloadJson, setPayloadJson] = useState<string>('{\n  "Subject": "Hello from Antigravity Tester",\n  "ticket_id": "TKT-1002",\n  "created_by": "Ameer"\n}');
  
  const [loadingEvents, setLoadingEvents] = useState<boolean>(true);
  const [publishing, setPublishing] = useState<boolean>(false);
  const [response, setResponse] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const loadEvents = async () => {
    try {
      setLoadingEvents(true);
      const data = await eventApi.getEvents();
      const sorted = [...data].sort((a, b) => a.event_name.localeCompare(b.event_name));
      setEvents(sorted);
      if (sorted.length > 0) {
        setSelectedEventName(sorted[0].event_name);
      }
    } catch (err) {
      console.error("Failed to load events:", err);
    } finally {
      setLoadingEvents(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handlePublish = async () => {
    setResponse(null);
    if (!selectedEventName) {
      setResponse({ message: "Please select an event type to publish.", type: "error" });
      return;
    }

    const trimmedJson = payloadJson.trim();
    try {
      // Enforce JSON validation on the payload text
      JSON.parse(trimmedJson);
    } catch (err: any) {
      setResponse({ message: `Invalid JSON syntax: ${err?.message || String(err)}`, type: "error" });
      return;
    }

    try {
      setPublishing(true);
      const result = await invoke<string>("publish_custom_event", {
        eventName: selectedEventName,
        payloadJson: trimmedJson,
      });
      setResponse({ message: result || "Event published successfully!", type: "success" });
    } catch (err: any) {
      console.error(err);
      setResponse({ message: err?.message || String(err) || "Failed to publish event.", type: "error" });
    } finally {
      setPublishing(false);
    }
  };

  const handleEventChange = (eventName: string) => {
    setSelectedEventName(eventName);
    // Custom seed presets based on typical event names
    if (eventName === "TicketCreated") {
      setPayloadJson('{\n  "Subject": "New Support Ticket",\n  "ticket_id": "TKT-1003",\n  "created_by": "System Operator"\n}');
    } else if (eventName === "PaymentProcessed") {
      setPayloadJson('{\n  "Amount": "$250.00",\n  "TransactionId": "TXN-88746",\n  "Status": "Approved"\n}');
    } else if (eventName === "TriggerExecuted") {
      setPayloadJson('{\n  "trigger_id": "1",\n  "trigger_name": "HelloTrigger",\n  "timestamp": "1719284759"\n}');
    } else {
      setPayloadJson('{\n  "Subject": "Sample Custom Notification",\n  "context_id": "CTX-9901"\n}');
    }
  };

  return (
    <div className="flex flex-col gap-8 animate-[fadeIn_0.4s_ease-out_forwards]">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1.5">Event Testing Console</h1>
        <p className="text-slate-400 text-sm">
          Simulate system events by selecting registered event names and constructing JSON payload payloads.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Control Column */}
        <div className="lg:col-span-1 bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Select Target Event Type
            </label>
            <select
              value={selectedEventName}
              onChange={(e) => handleEventChange(e.target.value)}
              className="bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors w-full"
              disabled={loadingEvents}
            >
              {loadingEvents ? (
                <option>Loading event catalog...</option>
              ) : events.length === 0 ? (
                <option>No events registered</option>
              ) : (
                events.map((evt) => (
                  <option key={evt.id} value={evt.event_name}>
                    {evt.event_name}
                  </option>
                ))
              )}
            </select>
          </div>

          <button
            onClick={handlePublish}
            disabled={publishing || loadingEvents || !selectedEventName}
            className="inline-flex items-center justify-center gap-2 font-semibold text-sm px-5 py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer border-none disabled:opacity-50"
          >
            {publishing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Publishing Event...</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                <span>Fire Event Stream</span>
              </>
            )}
          </button>
        </div>

        {/* Right Payload Editor Column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                JSON Payload Editor
              </label>
              <span className="text-[11px] text-slate-500 font-mono">UTF-8 Format</span>
            </div>
            <textarea
              value={payloadJson}
              onChange={(e) => setPayloadJson(e.target.value)}
              className="bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-100 font-mono h-64 focus:outline-none focus:border-indigo-500 resize-none transition-colors"
            />
          </div>

          {/* Response Console Card */}
          {response && (
            <div
              className={`p-5 rounded-2xl border flex items-start gap-3.5 shadow-xl animate-[fadeIn_0.3s_ease-out_forwards] ${
                response.type === "success"
                  ? "bg-emerald-950/20 border-emerald-500/25 text-emerald-300"
                  : "bg-red-950/20 border-red-500/25 text-red-300"
              }`}
            >
              {response.type === "success" ? (
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
              ) : (
                <div className="p-2 rounded-lg bg-red-500/10 text-red-400 shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                </div>
              )}
              <div className="flex-grow">
                <h3 className="font-bold text-sm mb-1.5">
                  {response.type === "success" ? "Event Dispatched Successfully" : "Dispatch Execution Error"}
                </h3>
                <p className="text-xs font-mono break-all leading-relaxed bg-black/20 p-3 rounded-lg border border-white/5">
                  {response.message}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
