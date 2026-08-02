#![allow(dead_code)]

use rusqlite::{params, Result};
use crate::models::trigger::Trigger;
use crate::database::connection::get_connection;

/// Encapsulates database read and write access to the `triggers` table.
pub struct TriggerRepository;

impl TriggerRepository {
    /// Retrieves all triggers registered in the SQLite database.
    pub fn get_all_triggers() -> Result<Vec<Trigger>> {
        let conn = get_connection()?;
        let mut stmt = conn.prepare(
            "
            SELECT id, expression, last_trigger, name
            FROM triggers
            ",
        )?;

        let trigger_iter = stmt.query_map([], |row| {
            Ok(Trigger {
                id: row.get(0)?,
                expression: row.get(1)?,
                last_trigger: row.get(2)?,
                name: row.get(3)?,
            })
        })?;

        let mut triggers = Vec::new();
        for trigger in trigger_iter {
            triggers.push(trigger?);
        }
        Ok(triggers)
    }

    /// Inserts a new trigger entry into the database.
    pub fn insert_trigger(name: &str, expression: &str) -> Result<()> {
        let conn = get_connection()?;
        conn.execute(
            "
            INSERT INTO triggers (expression, last_trigger, name)
            VALUES (?1, NULL, ?2)
            ",
            params![expression, name],
        )?;
        Ok(())
    }

    /// Updates the last executed timestamp for a specific trigger.
    pub fn update_last_trigger(id: i32, timestamp: i64) -> Result<()> {
        let conn = get_connection()?;
        conn.execute(
            "
            UPDATE triggers
            SET last_trigger = ?1
            WHERE id = ?2
            ",
            params![timestamp, id],
        )?;
        Ok(())
    }
}
