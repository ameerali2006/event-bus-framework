import { invoke } from "@tauri-apps/api/core";

export interface EventDefinition {
  id: number;
  event_name: string;
  event_constraints: string | null;
  custom_constraint: string | null;
  rule_constraints: string | null;
  sort_order: number | null;
  name: string | null;
}

export const eventApi = {
  /// Fetches all event definitions from the SQLite backend.
  getEvents: async (): Promise<EventDefinition[]> => {
    return invoke<EventDefinition[]>("get_events");
  },
};
