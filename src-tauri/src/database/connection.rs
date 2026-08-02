//! SQLite database connection.

use std::sync::OnceLock;
use std::path::PathBuf;
use rusqlite::{Connection, Result};

/// Static holder for the application's resolved database path.
pub static DB_PATH: OnceLock<PathBuf> = OnceLock::new();

/// Sets the database file path.
pub fn set_db_path(path: PathBuf) {
    println!("Using database: {:?}", path);

    let _ = DB_PATH.set(path);
}


/// Retrieves a connection to the SQLite database.
pub fn get_connection() -> Result<Connection> {
    let path = DB_PATH.get().ok_or_else(|| {
        rusqlite::Error::InvalidPath(PathBuf::from("Database path is not initialized"))
    })?;
    Connection::open(path)
}