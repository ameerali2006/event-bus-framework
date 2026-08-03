import React, { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { eventApi, EventDefinition } from "../services/eventApi";
import { actionApi, ActionDefinition } from "../services/actionApi";
import { mappingApi, EventActionMapping } from "../services/mappingApi";

export const EventTestingPage: React.FC = () => {
  const [events, setEvents] = useState<EventDefinition[]>([]);
  const [actions, setActions] = useState<ActionDefinition[]>([]);
  const [selectedEventName, setSelectedEventName] = useState<string>("");
  const [payloadJson, setPayloadJson] = useState<string>("{}");
  const [requiredFields, setRequiredFields] = useState<string[]>([]);
  
  const [loadingEvents, setLoadingEvents] = useState<boolean>(true);
  const [publishing, setPublishing] = useState<boolean>(false);
  const [response, setResponse] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const extractRequiredFields = (
    mappings: EventActionMapping[],
    allActions: ActionDefinition[]
  ): string[] => {
    const fields = new Set<string>();
    const regex = /\[:([^\]]+)\]/g;

    for (const mapping of mappings) {
      const action = allActions.find((a) => a.id === mapping.action_id);
      const rawParams = mapping.parameter_values?.trim()
        ? mapping.parameter_values
        : action?.parameters?.trim()
        ? action.parameters
        : "";

      if (rawParams) {
        let match;
        regex.lastIndex = 0;
        while ((match = regex.exec(rawParams)) !== null) {
          fields.add(match[1].trim());
        }
      }
    }
    return Array.from(fields).sort();
  };

  const updateRequiredFieldsForEvent = async (
    eventId: number,
    currentActions: ActionDefinition[]
  ) => {
    try {
      const mappingsData = await mappingApi.getMappings(eventId);
      const fields = extractRequiredFields(mappingsData, currentActions);
      setRequiredFields(fields);

      // Automatically generate a sample payload JSON
      const sampleObj: Record<string, string> = {};
      for (const field of fields) {
        sampleObj[field] = "";
      }
      setPayloadJson(JSON.stringify(sampleObj, null, 2));
    } catch (err) {
      console.error("Failed to update required fields for event:", err);
    }
  };

  const loadEvents = async () => {
    try {
      setLoadingEvents(true);
      const [eventsData, actionsData] = await Promise.all([
        eventApi.getEvents(),
        actionApi.getActions(),
      ]);
      const sortedEvents = [...eventsData].sort((a, b) => a.event_name.localeCompare(b.event_name));
      setEvents(sortedEvents);
      setActions(actionsData);

      if (sortedEvents.length > 0) {
        const firstEvent = sortedEvents[0];
        setSelectedEventName(firstEvent.event_name);
        await updateRequiredFieldsForEvent(firstEvent.id, actionsData);
      }
    } catch (err) {
      console.error("Failed to load events/actions catalog:", err);
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
    let parsedPayload: any = null;
    try {
      // Enforce JSON validation on the payload text
      parsedPayload = JSON.parse(trimmedJson);
    } catch (err: any) {
      setResponse({ message: `Invalid JSON syntax: ${err?.message || String(err)}`, type: "error" });
      return;
    }

    // Validate payload is a JSON object
    if (!parsedPayload || typeof parsedPayload !== "object" || Array.isArray(parsedPayload)) {
      setResponse({ message: "Payload must be a valid JSON object.", type: "error" });
      return;
    }

    // Validate that every required field has a non-empty value
    const missingFields: string[] = [];
    for (const field of requiredFields) {
      const val = parsedPayload[field];
      if (val === undefined || String(val).trim() === "") {
        missingFields.push(field);
      }
    }

    if (missingFields.length > 0) {
      const missingList = missingFields.map((f) => `- ${f}`).join("\n");
      setResponse({
        message: `Missing required payload fields:\n${missingList}`,
        type: "error",
      });
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

  const handleEventChange = async (eventName: string) => {
    setSelectedEventName(eventName);
    const event = events.find((evt) => evt.event_name === eventName);
    if (event) {
      await updateRequiredFieldsForEvent(event.id, actions);
    } else {
      setRequiredFields([]);
      setPayloadJson("{}");
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

            {/* Required payload fields display */}
            <div className="flex flex-col gap-2 p-4 bg-slate-950/40 border border-white/5 rounded-xl transition-all duration-300">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Required Payload Fields
              </div>
              {requiredFields.length === 0 ? (
                <div className="text-xs text-slate-500 italic">
                  No required payload fields for this event mapping.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 mt-1">
                  {requiredFields.map((field) => {
                    let isPresent = false;
                    try {
                      const parsed = JSON.parse(payloadJson);
                      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
                        isPresent = parsed[field] !== undefined && String(parsed[field]).trim() !== "";
                      }
                    } catch (e) {
                      // ignore parse errors
                    }

                    return (
                      <span
                        key={field}
                        className={`text-xs font-mono px-2.5 py-1 rounded-full border transition-all duration-200 ${
                          isPresent
                            ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-300"
                            : "bg-amber-500/10 border-amber-500/30 text-amber-300 animate-pulse"
                        }`}
                      >
                        {field}
                      </span>
                    );
                  })}
                </div>
              )}
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
                <p className="text-xs font-mono break-all leading-relaxed bg-black/20 p-3 rounded-lg border border-white/5 whitespace-pre-wrap">
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
