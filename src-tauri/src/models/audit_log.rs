use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct AuditLog {
    pub id: i32,
    pub event_name: String,
    pub payload: String,
    pub timestamp: u64,
}