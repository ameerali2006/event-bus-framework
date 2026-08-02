use serde::{Serialize, Deserialize};

/// Represents the connection mapping between a given Event and its corresponding configured Action.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[allow(dead_code)]
pub struct EventActionContainer {
    /// Unique identifier for the association. Maps to `id` (PRIMARY KEY) in the SQLite table.
    pub id: i32,

    /// Reference to the event definition. Maps to `event_id` (INTEGER -> events.id).
    pub event_id: i32,

    /// Reference to the action definition. Maps to `action_id` (INTEGER -> actions.id).
    pub action_id: i32,

    /// Action parameter values configured for this specific connection. Maps to `parameter_values` (TEXT NULL).
    pub parameter_values: Option<String>,

    /// Specific JavaScript/Lua or payload validations for this event-action mapping. Maps to `custom_constraint` (TEXT NULL).
    pub custom_constraint: Option<String>,

    /// Ordered sequence of action execution under the mapped event. Maps to `sort_order` (INTEGER NULL).
    pub sort_order: Option<i32>,
}
