use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ActionExecutionLog {
    pub id: i32,
    pub event_name: String,
    pub action_name: String,
    pub action_type: String,
    pub status: String,
    pub message: String,
    pub executed_at: i64,
}
