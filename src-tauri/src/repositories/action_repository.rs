#![allow(dead_code)]

use rusqlite::Result;
use crate::models::action_definition::ActionDefinition;
use crate::database::connection::get_connection;

/// Encapsulates database read access to the `actions` table.
pub struct ActionRepository;

impl ActionRepository {
    /// Retrieves a single action blueprint by its identifier, returning `None` if not found.
    pub fn get_action_by_id(id: i32) -> Result<Option<ActionDefinition>> {
        let conn = get_connection()?;
        let mut stmt = conn.prepare(
            "
            SELECT id, action_type, parameters, sort_order, name
            FROM actions
            WHERE id = ?1
            ",
        )?;

        let mut rows = stmt.query([id])?;
        if let Some(row) = rows.next()? {
            Ok(Some(ActionDefinition {
                id: row.get(0)?,
                action_type: row.get(1)?,
                parameters: row.get(2)?,
                sort_order: row.get(3)?,
                name: row.get(4)?,
            }))
        } else {
            Ok(None)
        }
    }

    /// Retrieves all actions blueprints cataloged in the system.
    pub fn get_all_actions() -> Result<Vec<ActionDefinition>> {
        let conn = get_connection()?;
        let mut stmt = conn.prepare(
            "
            SELECT id, action_type, parameters, sort_order, name
            FROM actions
            ",
        )?;

        let action_iter = stmt.query_map([], |row| {
            Ok(ActionDefinition {
                id: row.get(0)?,
                action_type: row.get(1)?,
                parameters: row.get(2)?,
                sort_order: row.get(3)?,
                name: row.get(4)?,
            })
        })?;

        let mut actions = Vec::new();
        for action in action_iter {
            actions.push(action?);
        }
        Ok(actions)
    }

    /// Inserts a new action definition record.
    pub fn insert_action(
        action_type: &str,
        parameters: Option<&str>,
        sort_order: Option<i32>,
        name: Option<&str>,
    ) -> Result<()> {
        let conn = get_connection()?;
        conn.execute(
            "
            INSERT INTO actions (action_type, parameters, sort_order, name)
            VALUES (?1, ?2, ?3, ?4)
            ",
            rusqlite::params![
                action_type,
                parameters,
                sort_order,
                name
            ],
        )?;
        Ok(())
    }

    /// Updates an existing action definition record.
    pub fn update_action(
        id: i32,
        action_type: &str,
        parameters: Option<&str>,
        sort_order: Option<i32>,
        name: Option<&str>,
    ) -> Result<()> {
        let conn = get_connection()?;
        conn.execute(
            "
            UPDATE actions
            SET action_type = ?1,
                parameters = ?2,
                sort_order = ?3,
                name = ?4
            WHERE id = ?5
            ",
            rusqlite::params![
                action_type,
                parameters,
                sort_order,
                name,
                id
            ],
        )?;
        Ok(())
    }

    /// Deletes an action definition record by its unique ID.
    pub fn delete_action(id: i32) -> Result<()> {
        let conn = get_connection()?;
        conn.execute(
            "
            DELETE FROM actions
            WHERE id = ?1
            ",
            rusqlite::params![id],
        )?;
        Ok(())
    }
}
