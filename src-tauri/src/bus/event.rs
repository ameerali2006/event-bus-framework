//! Defines the Event model used by the Event Bus.

use std::collections::HashMap;
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Debug, Clone)]
pub struct Event {
    /// Unique event name.
    pub name: String,

    /// Additional event data.
    pub payload: HashMap<String, String>,

    /// Unix timestamp when the event was created.
    pub timestamp: u64,
}

impl Event {
    /// Creates a new event.
    pub fn new(name: impl Into<String>, payload: HashMap<String, String>) -> Self {
        let timestamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .expect("System time error")
            .as_secs();

        Self {
            name: name.into(),
            payload,
            timestamp,
        }
    }
}