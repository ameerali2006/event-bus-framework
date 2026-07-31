//! Service responsible for storing audit logs.

use rusqlite::{params, Result};
use crate::models::audit_log::AuditLog;
use crate::bus::event::Event;
use crate::database::connection::get_connection;

pub struct AuditService;

impl AuditService {
    pub fn save(event: &Event) -> Result<()> {
        let conn = get_connection()?;

        conn.execute(
            "
            INSERT INTO audit_logs (event_name, payload, timestamp)
            VALUES (?1, ?2, ?3)
            ",
            params![
                event.name,
                format!("{:?}", event.payload),
                event.timestamp
            ],
        )?;

        println!("[AUDIT] Event saved to database.");

        Ok(())
    }
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
}