#![allow(dead_code)]

use std::collections::HashMap;
use crate::models::action_definition::ActionDefinition;
use crate::services::action_registry::ActionRegistry;
use crate::services::action_execution_log_service::ActionExecutionLogService;

/// Service responsible for executing resolved actions based on their `action_type`.
pub struct ActionExecutor;

impl ActionExecutor {
    /// Executes a list of action definitions, resolved parameter maps, and custom constraints in the order they are provided.
    pub fn execute(event_name: &str, actions: &[(ActionDefinition, HashMap<String, String>, Option<String>)]) -> Result<(), String> {
        for (action, params, _custom_constraint) in actions {
            let action_name = action.name.as_deref().unwrap_or("Unnamed");

            let processor = match ActionRegistry::get_processor(&action.action_type) {
                Some(p) => p,
                None => {
                    let err_msg = format!("Unknown ActionType: '{}' encountered in action registry", action.action_type);
                    eprintln!("[ACTION EXECUTION ERROR] {}", err_msg);
                    let _ = ActionExecutionLogService::save(
                        event_name,
                        action_name,
                        &action.action_type,
                        "Failed",
                        &err_msg,
                    );
                    return Err(err_msg);
                }
            };

            match processor.execute(action, params) {
                Ok(_) => {
                    let success_msg = format!("Action '{}' executed successfully", action_name);
                    println!("[ACTION EXECUTION] {}", success_msg);
                    let _ = ActionExecutionLogService::save(
                        event_name,
                        action_name,
                        &action.action_type,
                        "Success",
                        &success_msg,
                    );
                }
                Err(err_msg) => {
                    eprintln!("[ACTION EXECUTION ERROR] Action '{}' failed: {}", action_name, err_msg);
                    let _ = ActionExecutionLogService::save(
                        event_name,
                        action_name,
                        &action.action_type,
                        "Failed",
                        &err_msg,
                    );
                    return Err(err_msg);
                }
            }
        }
        Ok(())
    }
}
