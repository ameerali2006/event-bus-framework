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

            // Load triggers from DB
            let active_triggers = match TriggerRepository::get_all_triggers() {
                Ok(triggers) => triggers,
                Err(e) => {
                    eprintln!("[SCHEDULER ERROR] Failed to load triggers: {}", e);
                    return;
                }
            };

            // Map each trigger to its next execution time
            let mut trigger_schedules = Vec::new();
            for trigger in active_triggers {
                match Schedule::from_str(&trigger.expression) {
                    Ok(schedule) => {
                        let next_run = schedule.upcoming(Utc).next().unwrap_or_else(|| Utc::now());
                        trigger_schedules.push((trigger, schedule, next_run));
                    }
                    Err(e) => {
                        eprintln!(
                            "[SCHEDULER ERROR] Failed to parse cron expression '{}' for trigger '{}': {}",
                            trigger.expression, trigger.name, e
                        );
                    }
                }
            }

            loop {
                tokio::time::sleep(Duration::from_millis(500)).await;
                let now = Utc::now();

                for (trigger, schedule, next_run) in &mut trigger_schedules {
                    if now >= *next_run {
                        println!(
                            "[SCHEDULER] Firing trigger '{}' (scheduled for: {})",
                            trigger.name,
                            next_run.to_rfc3339()
                        );

                        // Create payload details
                        let mut payload = HashMap::new();
                        payload.insert("TriggerName".to_string(), trigger.name.clone());
                        payload.insert("TriggerExpression".to_string(), trigger.expression.clone());
                        payload.insert("TriggerTime".to_string(), now.to_rfc3339());

                        // Dispatch event dynamically through the EventDispatcher
                        match EventDispatcher::dispatch_event("TriggerExecuted", &payload) {
                            Ok(_) => {
                                println!("[SCHEDULER] Trigger '{}' event dispatched successfully.", trigger.name);
                                // Update database timestamp
                                let timestamp = now.timestamp();
                                if let Err(e) = TriggerRepository::update_last_trigger(trigger.id, timestamp) {
                                    eprintln!("[SCHEDULER ERROR] Failed to update last_trigger for '{}': {}", trigger.name, e);
                                } else {
                                    trigger.last_trigger = Some(timestamp);
                                }
                            }
                            Err(e) => {
                                eprintln!("[SCHEDULER ERROR] Trigger '{}' dispatch failed: {}", trigger.name, e);
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
