use serde::{Serialize, Deserialize};

/// Represents a trigger (scheduler configuration) stored in SQLite.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Trigger {
    /// Unique identifier for the trigger. Maps to `id` (PRIMARY KEY).
    pub id: i32,

    /// Cron expression pattern (e.g. `*/5 * * * * *`). Maps to `expression`.
    pub expression: String,

    /// Unix timestamp when the trigger was last run. Maps to `last_trigger` (nullable).
    pub last_trigger: Option<i64>,

    /// Descriptive name of the trigger. Maps to `name`.
    pub name: String,
}
