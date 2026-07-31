//! Creates the database schema.

use rusqlite::Result;

use super::connection::get_connection;

pub fn initialize_database() -> Result<()> {
    let conn = get_connection()?;

    conn.execute(
        "
        CREATE TABLE IF NOT EXISTS audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_name TEXT NOT NULL,
            payload TEXT NOT NULL,
            timestamp INTEGER NOT NULL
        );
        ",
        [],
    )?;

    conn.execute(
        "
        CREATE INDEX IF NOT EXISTS idx_event_name
        ON audit_logs(event_name);
        ",
        [],
    )?;

    conn.execute(
        "
        CREATE INDEX IF NOT EXISTS idx_timestamp
        ON audit_logs(timestamp);
        ",
        [],
    )?;

    println!("Database initialized successfully.");

    Ok(())
}