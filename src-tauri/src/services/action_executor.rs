#![allow(dead_code)]

use std::collections::HashMap;
use crate::models::action_definition::ActionDefinition;
use crate::services::action_registry::ActionRegistry;

/// Service responsible for executing resolved actions based on their `action_type`.
pub struct ActionExecutor;

impl ActionExecutor {
    /// Executes a list of action definitions, resolved parameter maps, and custom constraints in the order they are provided.
    pub fn execute(actions: &[(ActionDefinition, HashMap<String, String>, Option<String>)]) -> Result<(), String> {
        for (action, params, _custom_constraint) in actions {
            let processor = ActionRegistry::get_processor(&action.action_type)
                .ok_or_else(|| format!("Unknown ActionType: '{}' encountered in action registry", action.action_type))?;

            processor.execute(action, params)?;
        }
        Ok(())
    }
}
