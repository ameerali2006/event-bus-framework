import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

interface AuditLog {
  id: number;
  event_name: string;
  payload: string;
  timestamp: number;
}

function App() {
  const [logs, setLogs] = useState<AuditLog[]>([]);

  async function loadLogs() {
    const data = await invoke<AuditLog[]>("get_audit_logs");
    setLogs(data);
  }

  async function publishEvent() {
    await invoke("publish_event");
    await loadLogs();
  }

  useEffect(() => {
    loadLogs();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Event Bus Framework</h1>

      <button onClick={publishEvent}>
        Publish TicketCreated Event
      </button>

      <h2>Audit Logs</h2>

      <table border={1} cellPadding={8}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Event</th>
            <th>Payload</th>
            <th>Timestamp</th>
          </tr>
        </thead>

        <tbody>
          {logs.map((log) => (
            <tr key={log.id}>
              <td>{log.id}</td>
              <td>{log.event_name}</td>
              <td>{log.payload}</td>
              <td>{log.timestamp}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;