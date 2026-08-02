use std::collections::HashMap;
use crate::models::action_definition::ActionDefinition;

/// Trait defining the execution interface for action processors.
pub trait ActionProcessor: Send + Sync {
    /// Executes the action with its resolved parameters.
    fn execute(&self, action: &ActionDefinition, params: &HashMap<String, String>) -> Result<(), String>;
}

/// Processor implementation for CreateLog actions.
pub struct CreateLogProcessor;
impl ActionProcessor for CreateLogProcessor {
    fn execute(&self, _action: &ActionDefinition, params: &HashMap<String, String>) -> Result<(), String> {
        let log_message = params.get("LogMessage")
            .ok_or_else(|| "Missing required parameter 'LogMessage' for CreateLog action".to_string())?;

        println!("[ACTION EXECUTE - CreateLog] Log Message: {}", log_message);
        Ok(())
    }
}

/// Processor implementation for SendMessage actions.
pub struct SendMessageProcessor;
impl ActionProcessor for SendMessageProcessor {
    fn execute(&self, _action: &ActionDefinition, params: &HashMap<String, String>) -> Result<(), String> {
        let recipient = params.get("Recipient")
            .ok_or_else(|| "Missing required parameter 'Recipient' for SendMessage action".to_string())?;
        let message_text = params.get("MessageText")
            .ok_or_else(|| "Missing required parameter 'MessageText' for SendMessage action".to_string())?;

        println!(
            "[ACTION EXECUTE - SendMessage] Recipient: '{}' | Message Text: '{}'",
            recipient, message_text
        );
        Ok(())
    }
}

/// Processor implementation for SendNotification actions.
pub struct SendNotificationProcessor;
impl ActionProcessor for SendNotificationProcessor {
    fn execute(&self, _action: &ActionDefinition, params: &HashMap<String, String>) -> Result<(), String> {
        let title = params.get("NotificationTitle")
            .ok_or_else(|| "Missing required parameter 'NotificationTitle' for SendNotification action".to_string())?;
        let body = params.get("NotificationBody")
            .ok_or_else(|| "Missing required parameter 'NotificationBody' for SendNotification action".to_string())?;

        println!(
            "[ACTION EXECUTE - SendNotification] Title: '{}' | Body: '{}'",
            title, body
        );
        Ok(())
    }
}
