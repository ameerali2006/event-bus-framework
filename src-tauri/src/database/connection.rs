//! SQLite database connection.

use rusqlite::{Connection, Result};

pub fn get_connection() -> Result<Connection> {
    Connection::open("event_bus.db")
}