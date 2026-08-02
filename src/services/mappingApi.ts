import { invoke } from "@tauri-apps/api/core";

export interface EventActionMapping {
  id: number;
  event_id: number;
  action_id: number;
  parameter_values: string | null;
  custom_constraint: string | null;
  sort_order: number | null;
}

export const mappingApi = {
  /// Fetches all event action mapping containers registered for a given event.
  getMappings: async (eventId: number): Promise<EventActionMapping[]> => {
    return invoke<EventActionMapping[]>("get_event_action_mappings", { eventId });
  },

  /// Creates a new event action mapping container in the SQLite backend.
  createMapping: async (mapping: Omit<EventActionMapping, "id">): Promise<void> => {
    return invoke<void>("create_event_action_mapping", {
      eventId: mapping.event_id,
      actionId: mapping.action_id,
      parameterValues: mapping.parameter_values,
      customConstraint: mapping.custom_constraint,
      sortOrder: mapping.sort_order,
    });
  },

  /// Updates an existing event action mapping container in the SQLite backend.
  updateMapping: async (mapping: EventActionMapping): Promise<void> => {
    return invoke<void>("update_event_action_mapping", {
      id: mapping.id,
      eventId: mapping.event_id,
      actionId: mapping.action_id,
      parameterValues: mapping.parameter_values,
      customConstraint: mapping.custom_constraint,
      sortOrder: mapping.sort_order,
    });
  },

  /// Deletes an event action mapping container from the SQLite backend.
  deleteMapping: async (id: number): Promise<void> => {
    return invoke<void>("delete_event_action_mapping", { id });
  },
};
