use crate::models::action_execution_log::ActionExecutionLog;
use crate::repositories::action_execution_log_repository::ActionExecutionLogRepository;
use chrono::Utc;

pub struct ActionExecutionLogService;

impl ActionExecutionLogService {
    /// Saves an execution result to the SQLite database.
    pub fn save(
        event_name: &str,
        action_name: &str,
        action_type: &str,
        status: &str,
        message: &str,
    ) -> Result<(), String> {
        let executed_at = Utc::now().timestamp();
        ActionExecutionLogRepository::insert_log(
            event_name,
            action_name,
            action_type,
            status,
            message,
            executed_at,
        )
        .map_err(|e| format!("Failed to insert action execution log: {}", e))
    }

    /// Fetches all action execution logs.
    pub fn get_all() -> Result<Vec<ActionExecutionLog>, String> {
        ActionExecutionLogRepository::get_all_logs()
            .map_err(|e| format!("Failed to retrieve action execution logs: {}", e))
    }

    /// Fetches the most recent action execution logs.
    pub fn get_recent(limit: i32) -> Result<Vec<ActionExecutionLog>, String> {
        ActionExecutionLogRepository::get_recent_logs(limit)
            .map_err(|e| format!("Failed to retrieve recent action execution logs: {}", e))
    }
}
