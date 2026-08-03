import React, { useEffect, useState } from "react";
import { actionExecutionLogApi, ActionExecutionLog } from "../services/actionExecutionLogApi";

export const ActionExecutionLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<ActionExecutionLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await actionExecutionLogApi.getActionExecutionLogs();
      setLogs(data);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || String(err) || "Failed to load action execution logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="flex flex-col gap-8 animate-[fadeIn_0.4s_ease-out_forwards]">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1.5">Action Execution Logs</h1>
          <p className="text-slate-400 text-sm">
            Inspect real-time action dispatcher execution statuses and success/failure diagnostics.
          </p>
        </div>
        <button
          className="inline-flex items-center gap-2 font-semibold text-sm px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all cursor-pointer"
          onClick={fetchLogs}
          title="Refresh action logs"
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
          <span>Refresh Logs</span>
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

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <div className="w-8 h-8 border-2 border-white/5 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
          <p>Loading execution traces...</p>
        </div>
      ) : logs.length === 0 ? (
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
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <h3 className="mb-2 text-lg font-semibold text-slate-300">No execution logs found</h3>
          <p className="text-sm text-slate-500 max-w-xs">Fire event triggers from the console page to generate action execution history.</p>
        </div>
      ) : (
        <div className="bg-slate-900/30 backdrop-blur-lg border border-white/5 rounded-xl overflow-hidden shadow-xl shadow-black/20">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-950/45 border-b border-white/5">
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 w-24">ID</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 w-48">Execution Time</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 w-44">Event Name</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 w-44">Action Name</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 w-40">Action Type</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 w-32">Status</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Log Message</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => {
                const formattedTime = new Date(log.executed_at * 1000).toLocaleString();

                return (
                  <tr key={log.id} className="hover:bg-white/5 transition-all border-b border-white/5">
                    <td className="px-6 py-4 text-sm font-mono text-slate-400">#{log.id}</td>
                    <td className="px-6 py-4 text-sm text-slate-400 font-mono text-xs">{formattedTime}</td>
                    <td className="px-6 py-4 text-sm text-indigo-400 font-semibold">{log.event_name}</td>
                    <td className="px-6 py-4 text-sm text-slate-300 font-medium">{log.action_name}</td>
                    <td className="px-6 py-4 text-sm font-mono text-slate-400 text-xs">{log.action_type}</td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          log.status === "Success"
                            ? "bg-emerald-500/15 text-emerald-400"
                            : "bg-red-500/15 text-red-400"
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-slate-300 text-xs break-all whitespace-pre-wrap max-w-sm">
                      {log.message}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
