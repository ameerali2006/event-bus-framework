import { invoke } from "@tauri-apps/api/core";

export interface Trigger {
  id: number;
  expression: string;
  last_trigger: number | null;
  name: string;
}

export const triggerApi = {
  /// Fetches all trigger definitions from the SQLite backend.
  getTriggers: async (): Promise<Trigger[]> => {
    return invoke<Trigger[]>("get_triggers");
  },

  /// Creates a new trigger entry in the SQLite backend.
  createTrigger: async (trigger: Omit<Trigger, "id" | "last_trigger">): Promise<void> => {
    return invoke<void>("create_trigger", {
      name: trigger.name,
      expression: trigger.expression,
    });
  },

  /// Updates an existing trigger entry in the SQLite backend.
  updateTrigger: async (trigger: Omit<Trigger, "last_trigger">): Promise<void> => {
    return invoke<void>("update_trigger", {
      id: trigger.id,
      name: trigger.name,
      expression: trigger.expression,
    });
  },

  /// Deletes a trigger from the SQLite backend.
  deleteTrigger: async (id: number): Promise<void> => {
    return invoke<void>("delete_trigger", { id });
  },
};
