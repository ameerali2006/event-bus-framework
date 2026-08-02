import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { EventsPage } from "./components/EventsPage";
import { eventApi } from "./services/eventApi";

interface AuditLog {
  id: number;
  event_name: string;
  payload: string;
  timestamp: number;
}

function App() {
  const [view, setView] = useState<"dashboard" | "events">("dashboard");
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [eventCount, setEventCount] = useState<number>(0);
  const [loadingLogs, setLoadingLogs] = useState<boolean>(true);
  const [publishing, setPublishing] = useState<boolean>(false);

  async function loadLogs() {
    try {
      setLoadingLogs(true);
      const data = await invoke<AuditLog[]>("get_audit_logs");
      setLogs(data);
    } catch (e) {
      console.error("Failed to load audit logs:", e);
    } finally {
      setLoadingLogs(false);
    }
  }

  async function loadMetrics() {
    try {
      const events = await eventApi.getEvents();
      setEventCount(events.length);
    } catch (e) {
      console.error("Failed to load metrics:", e);
    }
  }

  async function triggerPublishEvent() {
    try {
      setPublishing(true);
      await invoke("publish_event");
      await loadLogs();
      await loadMetrics();
    } catch (e) {
      console.error("Failed to publish event:", e);
    } finally {
      setPublishing(false);
    }
  }

  useEffect(() => {
    loadLogs();
    loadMetrics();
  }, []);

  return (
    <div className="flex min-h-screen text-slate-100 font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900/60 backdrop-blur-md border-r border-white/5 p-6 flex flex-col justify-between shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-9">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 w-9 h-9 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
            </div>
            <span className="font-bold text-lg tracking-wide bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">Antigravity EB</span>
          </div>

          <nav className="flex flex-col gap-2">
            <button
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 w-100 text-left cursor-pointer border-none bg-transparent ${
                view === "dashboard"
                  ? "bg-indigo-500/15 text-indigo-400 border-l-4 border-indigo-500 rounded-l-none"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
              onClick={() => {
                setView("dashboard");
                loadLogs();
                loadMetrics();
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>
              <span>Dashboard</span>
            </button>
            <button
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 w-100 text-left cursor-pointer border-none bg-transparent ${
                view === "events"
                  ? "bg-indigo-500/15 text-indigo-400 border-l-4 border-indigo-500 rounded-l-none"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
              onClick={() => setView("events")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="M12 6v6l4 2"></path></svg>
              <span>Events Catalog</span>
            </button>
          </nav>
        </div>

        <div className="text-xs text-slate-600 text-center border-t border-white/5 pt-4">
          <span>v1.0.0 • SQLite Engine</span>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-grow p-10 max-w-7xl mx-auto w-full box-border">
        {view === "dashboard" ? (
          <div className="flex flex-col gap-8 animate-[fadeIn_0.4s_ease-out_forwards]">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1.5">Operational Dashboard</h1>
                <p className="text-slate-400 text-sm">
                  Monitor event streams, system audit logs, and trigger statuses.
                </p>
              </div>
              <button
                className="inline-flex items-center gap-2 font-semibold text-sm px-5 py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer border-none disabled:opacity-50"
                onClick={triggerPublishEvent}
                disabled={publishing}
                title="Publish mock TicketCreated event"
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
                  className={publishing ? "animate-spin" : ""}
                >
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                <span>{publishing ? "Publishing..." : "Publish TicketCreated"}</span>
              </button>
            </div>

            {/* Metrics Section */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-xl p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-indigo-500/15 text-indigo-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                </div>
                <div>
                  <h3 className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Seeded Event Types</h3>
                  <p className="text-2xl font-bold text-slate-100">{eventCount}</p>
                </div>
              </div>

              <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-xl p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-purple-500/15 text-purple-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><polyline points="12 6 12 12 16 14"></polyline></svg>
                </div>
                <div>
                  <h3 className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Audit Logs Logged</h3>
                  <p className="text-2xl font-bold text-slate-100">{logs.length}</p>
                </div>
              </div>

              <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-xl p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-emerald-500/15 text-emerald-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                </div>
                <div>
                  <h3 className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Scheduler Status</h3>
                  <p className="text-2xl font-bold text-slate-100">Running</p>
                </div>
              </div>
            </section>

            {/* Audit Logs Table */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">System Audit Logs</h2>
                <button
                  className="inline-flex items-center gap-2 font-semibold text-xs px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all duration-200 cursor-pointer"
                  onClick={loadLogs}
                  title="Refresh Logs Table"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={loadingLogs ? "animate-spin" : ""}
                  >
                    <path d="M21.5 2v6h-6" />
                    <path d="M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                  </svg>
                  <span>Sync Logs</span>
                </button>
              </div>

              {loadingLogs ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                  <div className="w-8 h-8 border-2 border-white/5 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
                  <p>Loading audit trails...</p>
                </div>
              ) : logs.length === 0 ? (
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
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <h3 className="mb-2 text-lg font-semibold text-slate-300">No audit logs logged</h3>
                  <p className="text-sm text-slate-500 max-w-xs">Trigger an event using the "Publish TicketCreated" command above to record actions.</p>
                </div>
              ) : (
                <div className="bg-slate-900/30 backdrop-blur-lg border border-white/5 rounded-xl overflow-hidden shadow-xl shadow-black/20">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="bg-slate-950/45 border-b border-white/5">
                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">ID</th>
                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Event Type</th>
                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Payload Context</th>
                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Timestamp (Unix)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log) => (
                        <tr key={log.id} className="hover:bg-white/5 transition-all border-b border-white/5">
                          <td className="px-6 py-4 text-sm font-mono text-slate-400">#{log.id}</td>
                          <td className="px-6 py-4 text-sm text-indigo-400 font-semibold">{log.event_name}</td>
                          <td className="px-6 py-4 text-sm font-mono text-slate-400 max-w-md overflow-hidden text-ellipsis whitespace-nowrap">
                            {log.payload}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-400">{log.timestamp}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : (
          <EventsPage />
        )}
      </main>
    </div>
  );
}

export default App;