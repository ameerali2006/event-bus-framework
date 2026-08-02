#![allow(dead_code)]

use std::collections::HashMap;
use std::sync::{Arc, OnceLock};
use crate::services::action_processor::{
    ActionProcessor, CreateLogProcessor, SendMessageProcessor, SendNotificationProcessor,
};

/// Registry service responsible for registering and resolving action processors by type.
pub struct ActionRegistry;

static REGISTRY: OnceLock<HashMap<String, Arc<dyn ActionProcessor>>> = OnceLock::new();

impl ActionRegistry {
    /// Returns the global registry map, initializing it with standard action processors on the first call.
    fn get_registry() -> &'static HashMap<String, Arc<dyn ActionProcessor>> {
        REGISTRY.get_or_init(|| {
            let mut map = HashMap::new();
            map.insert("CreateLog".to_string(), Arc::new(CreateLogProcessor) as Arc<dyn ActionProcessor>);
            map.insert("SendMessage".to_string(), Arc::new(SendMessageProcessor) as Arc<dyn ActionProcessor>);
            map.insert("SendNotification".to_string(), Arc::new(SendNotificationProcessor) as Arc<dyn ActionProcessor>);
            map
        })
    }

    /// Resolves an action processor implementation by its ActionType string.
    pub fn get_processor(action_type: &str) -> Option<Arc<dyn ActionProcessor>> {
        Self::get_registry().get(action_type).cloned()
    }
}
