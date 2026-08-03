#![allow(dead_code)]

use std::collections::HashMap;
use std::str::FromStr;
use std::time::Duration;
use chrono::Utc;
use cron::Schedule;
use crate::repositories::trigger_repository::TriggerRepository;
use crate::services::event_dispatcher::EventDispatcher;

/// Service responsible for loading triggers and evaluating their cron schedule in the background.
pub struct TriggerService;

impl TriggerService {
    /// Starts the background scheduler loop.
    pub fn start_scheduler() {
        tauri::async_runtime::spawn(async move {
            println!("[SCHEDULER] Starting background trigger scheduler...");

            // In-memory state of active trigger schedules:
            // trigger_id -> (trigger_name, cron_expression, Schedule, next_run_time)
            let mut trigger_states: HashMap<i32, (String, String, Schedule, chrono::DateTime<Utc>)> = HashMap::new();

            loop {
                tokio::time::sleep(Duration::from_millis(500)).await;
                let now = Utc::now();

                // Fetch latest triggers from the database
                let db_triggers = match TriggerRepository::get_all_triggers() {
                    Ok(triggers) => triggers,
                    Err(e) => {
                        eprintln!("[SCHEDULER ERROR] Failed to query triggers: {}", e);
                        continue;
                    }
                };

                // Keep track of trigger IDs present in this database query to identify deletions
                let mut current_db_ids = std::collections::HashSet::new();

                for trigger in db_triggers {
                    current_db_ids.insert(trigger.id);

                    let needs_update = if let Some((ref_name, ref_expr, _, _)) = trigger_states.get(&trigger.id) {
                        ref_name != &trigger.name || ref_expr != &trigger.expression
                    } else {
                        true
                    };

                    if needs_update {
                        match Schedule::from_str(&trigger.expression) {
                            Ok(schedule) => {
                                let next_run = schedule.upcoming(Utc).next().unwrap_or_else(|| Utc::now());
                                println!(
                                    "[SCHEDULER] Registered/Updated trigger '{}' (ID: {}). Next run: {}",
                                    trigger.name, trigger.id, next_run.to_rfc3339()
                                );
                                trigger_states.insert(
                                    trigger.id,
                                    (trigger.name, trigger.expression, schedule, next_run),
                                );
                            }
                            Err(e) => {
                                // Log parse error once per update cycle to prevent log spamming
                                eprintln!(
                                    "[SCHEDULER ERROR] Failed to parse cron expression '{}' for trigger '{}': {}",
                                    trigger.expression, trigger.name, e
                                );
                            }
                        }
                    }
                }

                // Remove triggers from the state map that were deleted from the database
                trigger_states.retain(|id, _| current_db_ids.contains(id));

                // Evaluate trigger executions
                for (id, (name, expression, schedule, next_run)) in &mut trigger_states {
                    if now >= *next_run {
                        println!(
                            "[SCHEDULER] Firing trigger '{}' (scheduled for: {})",
                            name,
                            next_run.to_rfc3339()
                        );

                        // Create payload details
                        let mut payload = HashMap::new();
                        payload.insert("TriggerName".to_string(), name.clone());
                        payload.insert("TriggerExpression".to_string(), expression.clone());
                        payload.insert("TriggerTime".to_string(), now.to_rfc3339());

                        // Dispatch event dynamically through the EventDispatcher
                        match EventDispatcher::dispatch_event("TriggerExecuted", &payload) {
                            Ok(_) => {
                                println!("[SCHEDULER] Trigger '{}' event dispatched successfully.", name);
                                // Update database timestamp
                                let timestamp = now.timestamp();
                                if let Err(e) = TriggerRepository::update_last_trigger(*id, timestamp) {
                                    eprintln!("[SCHEDULER ERROR] Failed to update last_trigger for '{}': {}", name, e);
                                }
                            }
                            Err(e) => {
                                // Ignore or log dispatcher fail
                                eprintln!("[SCHEDULER ERROR] Trigger '{}' dispatch failed: {}", name, e);
                            }
                        }

                        // Recalculate next execution time
                        *next_run = schedule.upcoming(Utc).next().unwrap_or_else(|| Utc::now());
                    }
                }
            }
        });
    }
}
