#![allow(dead_code)]

use rusqlite::Result;
use crate::models::event_action_container::EventActionContainer;
use crate::database::connection::get_connection;

/// Encapsulates database read access to the junction `event_action_containers` table.
pub struct EventActionContainerRepository;

impl EventActionContainerRepository {
    /// Retrieves all mapped event-action links for a given event, ordered by execution precedence.
    pub fn get_actions_for_event(event_id: i32) -> Result<Vec<EventActionContainer>> {
        let conn = get_connection()?;
        let mut stmt = conn.prepare(
            "
            SELECT id, event_id, action_id, parameter_values, custom_constraint, sort_order
            FROM event_action_containers
            WHERE event_id = ?1
            ORDER BY sort_order ASC
            ",
        )?;

        let container_iter = stmt.query_map([event_id], |row| {
            Ok(EventActionContainer {
                id: row.get(0)?,
                event_id: row.get(1)?,
                action_id: row.get(2)?,
                parameter_values: row.get(3)?,
                custom_constraint: row.get(4)?,
                sort_order: row.get(5)?,
            })
        })?;

        let mut containers = Vec::new();
        for container in container_iter {
            containers.push(container?);
        }
        Ok(containers)
    }

    /// Retrieves all mapped event-action links for a given event, ordered by execution precedence.
    pub fn get_mappings_for_event(event_id: i32) -> Result<Vec<EventActionContainer>> {
        Self::get_actions_for_event(event_id)
    }

    /// Inserts a new event action mapping container record.
    pub fn insert_mapping(
        event_id: i32,
        action_id: i32,
        parameter_values: Option<&str>,
        custom_constraint: Option<&str>,
        sort_order: Option<i32>,
    ) -> Result<()> {
        let conn = get_connection()?;
        conn.execute(
            "
            INSERT INTO event_action_containers (event_id, action_id, parameter_values, custom_constraint, sort_order)
            VALUES (?1, ?2, ?3, ?4, ?5)
            ",
            rusqlite::params![
                event_id,
                action_id,
                parameter_values,
                custom_constraint,
                sort_order
            ],
        )?;
        Ok(())
    }

    /// Updates an existing event action mapping container record.
    pub fn update_mapping(
        id: i32,
        event_id: i32,
        action_id: i32,
        parameter_values: Option<&str>,
        custom_constraint: Option<&str>,
        sort_order: Option<i32>,
    ) -> Result<()> {
        let conn = get_connection()?;
        conn.execute(
            "
            UPDATE event_action_containers
            SET event_id = ?1,
                action_id = ?2,
                parameter_values = ?3,
                custom_constraint = ?4,
                sort_order = ?5
            WHERE id = ?6
            ",
            rusqlite::params![
                event_id,
                action_id,
                parameter_values,
                custom_constraint,
                sort_order,
                id
            ],
        )?;
        Ok(())
    }

    /// Deletes an event action mapping container record.
    pub fn delete_mapping(id: i32) -> Result<()> {
        let conn = get_connection()?;
        conn.execute(
            "
            DELETE FROM event_action_containers
            WHERE id = ?1
            ",
            rusqlite::params![id],
        )?;
        Ok(())
    }

    /// Returns the total count of event action mapping records in the database.
    pub fn get_total_mapping_count() -> Result<i32> {
        let conn = get_connection()?;
        let mut stmt = conn.prepare("SELECT COUNT(*) FROM event_action_containers")?;
        let count: i32 = stmt.query_row([], |row| row.get(0))?;
        Ok(count)
    }
}
