#![allow(dead_code)]

use rusqlite::Result;
use crate::models::event_definition::EventDefinition;
use crate::database::connection::get_connection;

/// Encapsulates database read access to the `events` table.
pub struct EventRepository;

impl EventRepository {
    /// Retrieves a single event definition by its unique name, returning `None` if not found.
    pub fn get_event_by_name(event_name: &str) -> Result<Option<EventDefinition>> {
        let conn = get_connection()?;
        let mut stmt = conn.prepare(
            "
            SELECT id, event_name, event_constraints, custom_constraint, rule_constraints, sort_order, name
            FROM events
            WHERE event_name = ?1
            ",
        )?;

        let mut rows = stmt.query([event_name])?;
        if let Some(row) = rows.next()? {
            Ok(Some(EventDefinition {
                id: row.get(0)?,
                event_name: row.get(1)?,
                event_constraints: row.get(2)?,
                custom_constraint: row.get(3)?,
                rule_constraints: row.get(4)?,
                sort_order: row.get(5)?,
                name: row.get(6)?,
            }))
        } else {
            Ok(None)
        }
    }

    /// Retrieves all event definitions registered in the system.
    pub fn get_all_events() -> Result<Vec<EventDefinition>> {
        let conn = get_connection()?;
        let mut stmt = conn.prepare(
            "
            SELECT id, event_name, event_constraints, custom_constraint, rule_constraints, sort_order, name
            FROM events
            ",
        )?;

        let event_iter = stmt.query_map([], |row| {
            Ok(EventDefinition {
                id: row.get(0)?,
                event_name: row.get(1)?,
                event_constraints: row.get(2)?,
                custom_constraint: row.get(3)?,
                rule_constraints: row.get(4)?,
                sort_order: row.get(5)?,
                name: row.get(6)?,
            })
        })?;

        let mut events = Vec::new();
        for event in event_iter {
            events.push(event?);
        }
        Ok(events)
    }
}
