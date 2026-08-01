use serde::{Serialize, Deserialize};

/// Represents an action blueprint in the system actions catalog.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[allow(dead_code)]
pub struct ActionDefinition {
    /// Unique identifier for the action definition. Maps to `id` (PRIMARY KEY) in the SQLite table.
    pub id: i32,

    /// Handlers dispatcher tag (e.g., "SendMessage"). Maps to `action_type` (TEXT NOT NULL).
    pub action_type: String,

    /// Schema specification for configuration. Maps to `parameters` (TEXT NULL).
    pub parameters: Option<String>,

    /// Display alignment value. Maps to `sort_order` (INTEGER NULL).
    pub sort_order: Option<i32>,

    /// Friendly display label. Maps to `name` (TEXT NULL).
    pub name: Option<String>,
}
