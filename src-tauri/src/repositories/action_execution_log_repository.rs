use rusqlite::{params, Result};
use crate::models::action_execution_log::ActionExecutionLog;
use crate::database::connection::get_connection;

pub struct ActionExecutionLogRepository;

impl ActionExecutionLogRepository {
    /// Inserts a new action execution log entry.
    pub fn insert_log(
        event_name: &str,
        action_name: &str,
        action_type: &str,
        status: &str,
        message: &str,
        executed_at: i64,
    ) -> Result<()> {
        let conn = get_connection()?;
        conn.execute(
            "
            INSERT INTO action_execution_logs (event_name, action_name, action_type, status, message, executed_at)
            VALUES (?1, ?2, ?3, ?4, ?5, ?6)
            ",
            params![event_name, action_name, action_type, status, message, executed_at],
        )?;
        Ok(())
    }

    /// Retrieves all action execution logs ordered by newest first.
    pub fn get_all_logs() -> Result<Vec<ActionExecutionLog>> {
        let conn = get_connection()?;
        let mut stmt = conn.prepare(
            "
            SELECT id, event_name, action_name, action_type, status, message, executed_at
            FROM action_execution_logs
            ORDER BY executed_at DESC, id DESC
            ",
        )?;

        let iter = stmt.query_map([], |row| {
            Ok(ActionExecutionLog {
                id: row.get(0)?,
                event_name: row.get(1)?,
                action_name: row.get(2)?,
                action_type: row.get(3)?,
                status: row.get(4)?,
                message: row.get(5)?,
                executed_at: row.get(6)?,
            })
        })?;

        let mut logs = Vec::new();
        for log in iter {
            logs.push(log?);
        }
        Ok(logs)
    }

    /// Retrieves the most recent action execution logs up to a limit, ordered by newest first.
    pub fn get_recent_logs(limit: i32) -> Result<Vec<ActionExecutionLog>> {
        let conn = get_connection()?;
        let mut stmt = conn.prepare(
            "
            SELECT id, event_name, action_name, action_type, status, message, executed_at
            FROM action_execution_logs
            ORDER BY executed_at DESC, id DESC
            LIMIT ?1
            ",
        )?;

        let iter = stmt.query_map([limit], |row| {
            Ok(ActionExecutionLog {
                id: row.get(0)?,
                event_name: row.get(1)?,
                action_name: row.get(2)?,
                action_type: row.get(3)?,
                status: row.get(4)?,
                message: row.get(5)?,
                executed_at: row.get(6)?,
            })
        })?;

        let mut logs = Vec::new();
        for log in iter {
            logs.push(log?);
        }
        Ok(logs)
    }
}
