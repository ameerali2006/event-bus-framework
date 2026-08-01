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
            SELECT id, event_id, action_id, parameter_values, sort_order
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
                sort_order: row.get(4)?,
            })
        })?;

        let mut containers = Vec::new();
        for container in container_iter {
            containers.push(container?);
        }
        Ok(containers)
    }
}
