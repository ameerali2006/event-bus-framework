use serde::{Serialize, Deserialize};

/// Represents an event definition in the event bus registry.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[allow(dead_code)]
pub struct EventDefinition {
    /// Unique identifier for the event definition. Maps to `id` (PRIMARY KEY) in the SQLite table.
    pub id: i32,

    /// Unique name of the event type (e.g., "TicketCreated"). Maps to `event_name` (TEXT NOT NULL).
    pub event_name: String,

    /// Conditions/rules defined for the event. Maps to `event_constraints` (TEXT NULL).
    pub event_constraints: Option<String>,

    /// Specific JavaScript/Lua or payload validations. Maps to `custom_constraint` (TEXT NULL).
    pub custom_constraint: Option<String>,

    /// Rule engine expressions to match. Maps to `rule_constraints` (TEXT NULL).
    pub rule_constraints: Option<String>,

    /// Ordering position in layout structures. Maps to `sort_order` (INTEGER NULL).
    pub sort_order: Option<i32>,

    /// Friendly display label. Maps to `name` (TEXT NULL).
    pub name: Option<String>,
}
