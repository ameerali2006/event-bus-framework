mod audit;
mod bus;
mod database;
mod services;
mod subscribers;
mod models;
mod repositories;

use database::schema::initialize_database;
use services::event_bus_service::EventBusService;
use audit::audit_service::AuditService;
use models::audit_log::AuditLog;

#[tauri::command]
fn publish_event() -> String {
    let mut payload = std::collections::HashMap::new();
    payload.insert("ticket_id".to_string(), "TKT-1001".to_string());
    payload.insert("created_by".to_string(), "Ameer".to_string());
    payload.insert("Subject".to_string(), "Dynamic Event Dispatch Verification".to_string());

    match services::event_dispatcher::EventDispatcher::dispatch_event("TicketCreated", &payload) {
        Ok(_) => "Event published successfully!".to_string(),
        Err(e) => format!("Event dispatch failed: {}", e),
    }
}

#[tauri::command]
fn get_audit_logs() -> Result<Vec<AuditLog>, String> {
    AuditService::get_all_logs()
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn get_events() -> Result<Vec<models::event_definition::EventDefinition>, String> {
    repositories::event_repository::EventRepository::get_all_events()
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn create_event(
    event_name: String,
    event_constraints: Option<String>,
    custom_constraint: Option<String>,
    rule_constraints: Option<String>,
    sort_order: Option<i32>,
    name: Option<String>,
) -> Result<(), String> {
    repositories::event_repository::EventRepository::insert_event(
        &event_name,
        event_constraints.as_deref(),
        custom_constraint.as_deref(),
        rule_constraints.as_deref(),
        sort_order,
        name.as_deref(),
    ).map_err(|e| e.to_string())
}

#[tauri::command]
fn update_event(
    id: i32,
    event_name: String,
    event_constraints: Option<String>,
    custom_constraint: Option<String>,
    rule_constraints: Option<String>,
    sort_order: Option<i32>,
    name: Option<String>,
) -> Result<(), String> {
    repositories::event_repository::EventRepository::update_event(
        id,
        &event_name,
        event_constraints.as_deref(),
        custom_constraint.as_deref(),
        rule_constraints.as_deref(),
        sort_order,
        name.as_deref(),
    ).map_err(|e| e.to_string())
}

#[tauri::command]
fn delete_event(id: i32) -> Result<(), String> {
    repositories::event_repository::EventRepository::delete_event(id)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn get_actions() -> Result<Vec<models::action_definition::ActionDefinition>, String> {
    repositories::action_repository::ActionRepository::get_all_actions()
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn create_action(
    action_type: String,
    parameters: Option<String>,
    sort_order: Option<i32>,
    name: Option<String>,
) -> Result<(), String> {
    repositories::action_repository::ActionRepository::insert_action(
        &action_type,
        parameters.as_deref(),
        sort_order,
        name.as_deref(),
    ).map_err(|e| e.to_string())
}

#[tauri::command]
fn update_action(
    id: i32,
    action_type: String,
    parameters: Option<String>,
    sort_order: Option<i32>,
    name: Option<String>,
) -> Result<(), String> {
    repositories::action_repository::ActionRepository::update_action(
        id,
        &action_type,
        parameters.as_deref(),
        sort_order,
        name.as_deref(),
    ).map_err(|e| e.to_string())
}

#[tauri::command]
fn delete_action(id: i32) -> Result<(), String> {
    repositories::action_repository::ActionRepository::delete_action(id)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn get_event_action_mappings(event_id: i32) -> Result<Vec<models::event_action_container::EventActionContainer>, String> {
    repositories::event_action_container_repository::EventActionContainerRepository::get_mappings_for_event(event_id)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn create_event_action_mapping(
    event_id: i32,
    action_id: i32,
    parameter_values: Option<String>,
    custom_constraint: Option<String>,
    sort_order: Option<i32>,
) -> Result<(), String> {
    repositories::event_action_container_repository::EventActionContainerRepository::insert_mapping(
        event_id,
        action_id,
        parameter_values.as_deref(),
        custom_constraint.as_deref(),
        sort_order,
    ).map_err(|e| e.to_string())
}

#[tauri::command]
fn update_event_action_mapping(
    id: i32,
    event_id: i32,
    action_id: i32,
    parameter_values: Option<String>,
    custom_constraint: Option<String>,
    sort_order: Option<i32>,
) -> Result<(), String> {
    repositories::event_action_container_repository::EventActionContainerRepository::update_mapping(
        id,
        event_id,
        action_id,
        parameter_values.as_deref(),
        custom_constraint.as_deref(),
        sort_order,
    ).map_err(|e| e.to_string())
}

#[tauri::command]
fn delete_event_action_mapping(id: i32) -> Result<(), String> {
    repositories::event_action_container_repository::EventActionContainerRepository::delete_mapping(id)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn get_triggers() -> Result<Vec<models::trigger::Trigger>, String> {
    repositories::trigger_repository::TriggerRepository::get_all_triggers()
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn create_trigger(name: String, expression: String) -> Result<(), String> {
    repositories::trigger_repository::TriggerRepository::insert_trigger(&name, &expression)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn update_trigger(id: i32, name: String, expression: String) -> Result<(), String> {
    repositories::trigger_repository::TriggerRepository::update_trigger(id, &name, &expression)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn delete_trigger(id: i32) -> Result<(), String> {
    repositories::trigger_repository::TriggerRepository::delete_trigger(id)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn publish_custom_event(event_name: String, payload_json: String) -> Result<String, String> {
    let payload: std::collections::HashMap<String, String> = serde_json::from_str(&payload_json)
        .map_err(|e| format!("Invalid JSON payload: {}", e))?;

    match services::event_dispatcher::EventDispatcher::dispatch_event(&event_name, &payload) {
        Ok(_) => Ok("Event published successfully!".to_string()),
        Err(e) => Err(format!("Event dispatch failed: {}", e)),
    }
}

#[tauri::command]
fn get_total_mapping_count() -> Result<i32, String> {
    repositories::event_action_container_repository::EventActionContainerRepository::get_total_mapping_count()
        .map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            use tauri::Manager;
            
            // Dynamically resolve secure application data directory
            let app_data_dir = app.path().app_data_dir()?;
            
            // Create directories if they do not exist
            std::fs::create_dir_all(&app_data_dir)?;
            
            let db_path = app_data_dir.join("event_bus.db");
            
            // Register database path in OnceLock
            database::connection::set_db_path(db_path);
            
            // Initialize database schema
            initialize_database()?;

            // Start trigger scheduler background service
            services::trigger_service::TriggerService::start_scheduler();
            
            Ok(())
        })
        .manage(EventBusService::new())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(
            tauri::generate_handler![
                publish_event,
                get_audit_logs,
                get_events,
                create_event,
                update_event,
                delete_event,
                get_actions,
                create_action,
                update_action,
                delete_action,
                get_event_action_mappings,
                create_event_action_mapping,
                update_event_action_mapping,
                delete_event_action_mapping,
                get_triggers,
                create_trigger,
                update_trigger,
                delete_trigger,
                publish_custom_event,
                get_total_mapping_count
            ]
        )
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}