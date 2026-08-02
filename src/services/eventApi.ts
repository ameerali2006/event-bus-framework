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

  /// Creates a new event definition in the SQLite backend.
  createEvent: async (event: Omit<EventDefinition, "id">): Promise<void> => {
    return invoke<void>("create_event", {
      eventName: event.event_name,
      eventConstraints: event.event_constraints,
      customConstraint: event.custom_constraint,
      ruleConstraints: event.rule_constraints,
      sortOrder: event.sort_order,
      name: event.name,
    });
  },

  /// Updates an existing event definition in the SQLite backend.
  updateEvent: async (event: EventDefinition): Promise<void> => {
    return invoke<void>("update_event", {
      id: event.id,
      eventName: event.event_name,
      eventConstraints: event.event_constraints,
      customConstraint: event.custom_constraint,
      ruleConstraints: event.rule_constraints,
      sortOrder: event.sort_order,
      name: event.name,
    });
  },

  /// Deletes an event definition from the SQLite backend.
  deleteEvent: async (id: number): Promise<void> => {
    return invoke<void>("delete_event", { id });
  },
};
