#![allow(dead_code)]

use std::collections::HashMap;
use crate::models::action_definition::ActionDefinition;

/// Service responsible for executing resolved actions based on their `action_type`.
pub struct ActionExecutor;

impl ActionExecutor {
    /// Executes a list of action definitions, resolved parameter maps, and custom constraints in the order they are provided.
    pub fn execute(actions: &[(ActionDefinition, HashMap<String, String>, Option<String>)]) -> Result<(), String> {
        for (action, params, _custom_constraint) in actions {
            match action.action_type.as_str() {
                "CreateLog" => Self::execute_create_log(action, params)?,
                "SendMessage" => Self::execute_send_message(action, params)?,
                "SendNotification" => Self::execute_send_notification(action, params)?,
                _ => return Err(format!("Unknown ActionType: '{}' encountered in action registry", action.action_type)),
            }
        }
        Ok(())
    }

    /// Internal execution method for creating a log entry.
    fn execute_create_log(action: &ActionDefinition, params: &HashMap<String, String>) -> Result<(), String> {
        println!(
            "[ACTION EXECUTE] CreateLog | Name: '{}' | Resolved Params: {:?}",
            action.name.as_deref().unwrap_or("Unnamed CreateLog Action"),
            params
        );
        Ok(())
    }

    /// Internal execution method for sending messages.
    fn execute_send_message(action: &ActionDefinition, params: &HashMap<String, String>) -> Result<(), String> {
        println!(
            "[ACTION EXECUTE] SendMessage | Name: '{}' | Resolved Params: {:?}",
            action.name.as_deref().unwrap_or("Unnamed SendMessage Action"),
            params
        );
        Ok(())
    }

    /// Internal execution method for sending notifications.
    fn execute_send_notification(action: &ActionDefinition, params: &HashMap<String, String>) -> Result<(), String> {
        println!(
            "[ACTION EXECUTE] SendNotification | Name: '{}' | Resolved Params: {:?}",
            action.name.as_deref().unwrap_or("Unnamed SendNotification Action"),
            params
        );
        Ok(())
    }
}
