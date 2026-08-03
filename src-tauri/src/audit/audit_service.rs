//! Service responsible for storing audit logs.

use rusqlite::{params, Result};
use crate::models::audit_log::AuditLog;
use crate::bus::event::Event;
use crate::database::connection::get_connection;

pub struct AuditService;

impl AuditService {
    /// Saves an event to the SQLite database with payload serialized to JSON.
    pub fn save(event: &Event) -> Result<()> {
        let conn = get_connection()?;

        // Serialize payload map to structured JSON string
        let payload_json = serde_json::to_string(&event.payload)
            .map_err(|err| rusqlite::Error::ToSqlConversionFailure(Box::new(err)))?;

        conn.execute(
            "
            INSERT INTO audit_logs (event_name, payload, timestamp)
            VALUES (?1, ?2, ?3)
            ",
            params![
                event.name,
                payload_json,
                event.timestamp
            ],
        )?;

        println!("[AUDIT] Event saved to database.");

        Ok(())
    }

    /// Retrieves all audit logs from the database, sorted by timestamp descending.
    pub fn get_all_logs() -> Result<Vec<AuditLog>> {
        let conn = get_connection()?;

        let mut stmt = conn.prepare(
            "
            SELECT id, event_name, payload, timestamp
            FROM audit_logs
            ORDER BY timestamp DESC
            ",
        )?;

        let logs = stmt
            .query_map([], |row| {
                Ok(AuditLog {
                    id: row.get(0)?,
                    event_name: row.get(1)?,
                    payload: row.get(2)?,
                    timestamp: row.get(3)?,
                })
            })?
            .collect::<Result<Vec<_>, _>>()?;

        Ok(logs)
    }

    /// Retrieves the most recent audit logs, up to a specified limit, sorted by timestamp descending.
    pub fn get_recent_logs(limit: i32) -> Result<Vec<AuditLog>> {
        let conn = get_connection()?;

        let mut stmt = conn.prepare(
            "
            SELECT id, event_name, payload, timestamp
            FROM audit_logs
            ORDER BY timestamp DESC
            LIMIT ?1
            ",
        )?;

        let logs = stmt
            .query_map([limit], |row| {
                Ok(AuditLog {
                    id: row.get(0)?,
                    event_name: row.get(1)?,
                    payload: row.get(2)?,
                    timestamp: row.get(3)?,
                })
            })?
            .collect::<Result<Vec<_>, _>>()?;

        Ok(logs)
    }

    /// Returns the total count of audit log entries in the database.
    pub fn get_total_log_count() -> Result<i32> {
        let conn = get_connection()?;
        let mut stmt = conn.prepare("SELECT COUNT(*) FROM audit_logs")?;
        let count: i32 = stmt.query_row([], |row| row.get(0))?;
        Ok(count)
    }
}