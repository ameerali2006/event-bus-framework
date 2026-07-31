mod audit;
mod bus;
mod database;
mod services;
mod subscribers;
mod models;

use database::schema::initialize_database;
use services::event_bus_service::EventBusService;
use audit::audit_service::AuditService;
use models::audit_log::AuditLog;

#[tauri::command]
fn publish_event(
    service: tauri::State<EventBusService>,
) -> String {
    service.publish_ticket_created();
    "Event published successfully!".to_string()
}
#[tauri::command]
fn get_audit_logs() -> Result<Vec<AuditLog>, String> {
    AuditService::get_all_logs()
        .map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    initialize_database().expect("Failed to initialize database");

    tauri::Builder::default()
        .manage(EventBusService::new())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(
        tauri::generate_handler![
            publish_event,
            get_audit_logs
        ]
    )
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}