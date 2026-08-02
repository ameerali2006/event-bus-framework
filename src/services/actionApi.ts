import { invoke } from "@tauri-apps/api/core";

export interface ActionDefinition {
  id: number;
  action_type: string;
  parameters: string | null;
  sort_order: number | null;
  name: string | null;
}

export const actionApi = {
  /// Fetches all action definitions from the SQLite backend.
  getActions: async (): Promise<ActionDefinition[]> => {
    return invoke<ActionDefinition[]>("get_actions");
  },

  /// Creates a new action definition in the SQLite backend.
  createAction: async (action: Omit<ActionDefinition, "id">): Promise<void> => {
    return invoke<void>("create_action", {
      actionType: action.action_type,
      parameters: action.parameters,
      sortOrder: action.sort_order,
      name: action.name,
    });
  },

  /// Updates an existing action definition in the SQLite backend.
  updateAction: async (action: ActionDefinition): Promise<void> => {
    return invoke<void>("update_action", {
      id: action.id,
      actionType: action.action_type,
      parameters: action.parameters,
      sortOrder: action.sort_order,
      name: action.name,
    });
  },

  /// Deletes an action definition from the SQLite backend.
  deleteAction: async (id: number): Promise<void> => {
    return invoke<void>("delete_action", { id });
  },
};
