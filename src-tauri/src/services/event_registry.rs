#![allow(dead_code)]

use rusqlite::params;
use crate::database::connection::get_connection;

/// Centralized service responsible for managing the registry of supported event types.
pub struct EventRegistry;

impl EventRegistry {
    /// Canonical list of all events defined and supported by the application.
    pub const SUPPORTED_EVENTS: &'static [&'static str] = &[
        "TicketCreated",
        "TriggerExecuted",
        "PaymentProcessed",
        "TicketClosing",
        "TicketOpened",
        "TicketDisplayed",
        "TicketEntityChanged",
        "OrderAdded",
        "WorkTimeStarts",
        "WorkTimeEnds",
    ];

    /// Centralized registry initializer using an existing database connection.
    pub fn initialize_events_with_conn(conn: &rusqlite::Connection) -> Result<(), rusqlite::Error> {
        println!("[EVENT REGISTRY] Registering event types in the database...");

        for (index, event_name) in Self::SUPPORTED_EVENTS.iter().enumerate() {
            let sort_order = (index + 1) as i32;
            let display_name = format!("{} Event", event_name);

            conn.execute(
                "
                INSERT INTO events (event_name, event_constraints, custom_constraint, rule_constraints, sort_order, name)
                SELECT ?1, '', '', '', ?2, ?3
                WHERE NOT EXISTS (SELECT 1 FROM events WHERE event_name = ?1);
                ",
                params![event_name, sort_order, display_name],
            )?;
        }

        println!("[EVENT REGISTRY] Dynamic event registration completed.");
        Ok(())
    }

    /// Centralized registry initializer that handles database connection lookup.
    #[allow(dead_code)]
    pub fn initialize_events() -> Result<(), String> {
        let conn = get_connection()
            .map_err(|e| format!("Failed to open connection for EventRegistry: {}", e))?;
        Self::initialize_events_with_conn(&conn)
            .map_err(|e| format!("Error registering events in SQLite database: {}", e))
    }
}
