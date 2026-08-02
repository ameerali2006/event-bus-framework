#![allow(dead_code)]

use std::collections::HashMap;
use crate::repositories::event_repository::EventRepository;
use crate::repositories::action_repository::ActionRepository;
use crate::repositories::event_action_container_repository::EventActionContainerRepository;
use crate::models::event_definition::EventDefinition;
use crate::models::action_definition::ActionDefinition;
use crate::services::constraint_evaluator::ConstraintEvaluator;
use crate::services::parameter_resolver::ParameterResolver;
use crate::services::action_executor::ActionExecutor;

/// Service responsible for loading event configurations dynamically from the database.
pub struct EventDispatcher;

impl EventDispatcher {
    /// Loads the configuration for the given event name, evaluating constraints,
    /// resolving action parameters, executing actions via `ActionExecutor`,
    /// and returning all associated actions and parameters.
    pub fn dispatch_event(
        event_name: &str,
        payload: &HashMap<String, String>,
    ) -> Result<(EventDefinition, Vec<(ActionDefinition, HashMap<String, String>, Option<String>)>), String> {
        // 0. Automatically record an audit log entry for this event dispatch execution
        let event_obj = crate::bus::event::Event::new(event_name, payload.clone());
        let _ = crate::audit::audit_service::AuditService::save(&event_obj);

        // 1. Retrieve the EventDefinition by event name
        let event = EventRepository::get_event_by_name(event_name)
            .map_err(|e| format!("Database query error fetching event definition: {}", e))?
            .ok_or_else(|| format!("Event '{}' was not found in the database definitions registry", event_name))?;

        // 2. Evaluate all event execution constraints (EventConstraint, CustomConstraint, RuleConstraint)
        ConstraintEvaluator::evaluate(
            event.event_constraints.as_deref(),
            event.custom_constraint.as_deref(),
            event.rule_constraints.as_deref(),
            payload,
        )?;

        // 3. Retrieve mappings from event_action_containers ordered by sort_order
        let mappings = EventActionContainerRepository::get_actions_for_event(event.id)
            .map_err(|e| format!("Database query error fetching event-action mappings: {}", e))?;

        // 4. Resolve the ActionDefinition and parameters for each mapping
        let mut actions_with_params = Vec::new();
        for mapping in mappings {
            let action = ActionRepository::get_action_by_id(mapping.action_id)
                .map_err(|e| format!("Database query error fetching action definition (id: {}): {}", mapping.action_id, e))?
                .ok_or_else(|| format!("Action definition (id: {}) mapped to event '{}' was not found in actions catalog", mapping.action_id, event_name))?;

            // Evaluate mapping-level custom constraint if present
            if let Some(ref cc) = mapping.custom_constraint {
                if !cc.trim().is_empty() {
                    let passed = ConstraintEvaluator::evaluate_custom_constraint(cc, payload)?;
                    if !passed {
                        println!(
                            "[DISPATCH] Skipping action '{}' because mapping-level custom constraint '{}' evaluated to false",
                            action.name.as_deref().unwrap_or("Unnamed"),
                            cc
                        );
                        continue;
                    }
                }
            }

            // Fetch parameter string, fallback to template action defaults if container overrides are empty
            let raw_params = if let Some(ref pv) = mapping.parameter_values {
                if !pv.trim().is_empty() {
                    pv.as_str()
                } else {
                    action.parameters.as_deref().unwrap_or("")
                }
            } else {
                action.parameters.as_deref().unwrap_or("")
            };

            // Resolve placeholders in parameters
            let resolved_params = ParameterResolver::resolve(raw_params, payload)?;

            actions_with_params.push((action, resolved_params, mapping.custom_constraint));
        }

        // 5. Execute all loaded actions in their designated sequence
        ActionExecutor::execute(&actions_with_params)?;

        // Return resolved layout mappings with resolved parameters and constraints
        Ok((event, actions_with_params))
    }
}
