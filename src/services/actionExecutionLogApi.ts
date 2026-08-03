import { invoke } from "@tauri-apps/api/core";

export interface ActionExecutionLog {
  id: number;
  event_name: string;
  action_name: string;
  action_type: string;
  status: "Success" | "Failed";
  message: string;
  executed_at: number;
}

export const actionExecutionLogApi = {
  /// Fetches all action execution logs from the SQLite backend.
  getActionExecutionLogs: async (): Promise<ActionExecutionLog[]> => {
    return invoke<ActionExecutionLog[]>("get_action_execution_logs");
  },

  /// Fetches the recent action execution logs with a specified limit from the SQLite backend.
  getRecentActionExecutionLogs: async (limit: number): Promise<ActionExecutionLog[]> => {
    return invoke<ActionExecutionLog[]>("get_recent_action_execution_logs", { limit });
  },
};
