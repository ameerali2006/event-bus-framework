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

    /// Inserts a new event definition record.
    pub fn insert_event(
        event_name: &str,
        event_constraints: Option<&str>,
        custom_constraint: Option<&str>,
        rule_constraints: Option<&str>,
        sort_order: Option<i32>,
        name: Option<&str>,
    ) -> Result<()> {
        let conn = get_connection()?;
        conn.execute(
            "
            INSERT INTO events (event_name, event_constraints, custom_constraint, rule_constraints, sort_order, name)
            VALUES (?1, ?2, ?3, ?4, ?5, ?6)
            ",
            rusqlite::params![
                event_name,
                event_constraints,
                custom_constraint,
                rule_constraints,
                sort_order,
                name
            ],
        )?;
        Ok(())
    }

    /// Updates an existing event definition record.
    pub fn update_event(
        id: i32,
        event_name: &str,
        event_constraints: Option<&str>,
        custom_constraint: Option<&str>,
        rule_constraints: Option<&str>,
        sort_order: Option<i32>,
        name: Option<&str>,
    ) -> Result<()> {
        let conn = get_connection()?;
        conn.execute(
            "
            UPDATE events
            SET event_name = ?1,
                event_constraints = ?2,
                custom_constraint = ?3,
                rule_constraints = ?4,
                sort_order = ?5,
                name = ?6
            WHERE id = ?7
            ",
            rusqlite::params![
                event_name,
                event_constraints,
                custom_constraint,
                rule_constraints,
                sort_order,
                name,
                id
            ],
        )?;
        Ok(())
    }

    /// Deletes an event definition record by its unique ID.
    pub fn delete_event(id: i32) -> Result<()> {
        let conn = get_connection()?;
        conn.execute(
            "
            DELETE FROM events
            WHERE id = ?1
            ",
            rusqlite::params![id],
        )?;
        Ok(())
    }
}
