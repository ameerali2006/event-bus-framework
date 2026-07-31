//! Subscriber responsible for logging events.

use crate::bus::event::Event;
use crate::bus::subscriber::Subscriber;

pub struct LogSubscriber;

impl Subscriber for LogSubscriber {
    fn name(&self) -> &str {
        "LogSubscriber"
    }

    fn handle(&self, event: &Event) {
        println!(
            "[LOG] Event: {} | Timestamp: {}",
            event.name,
            event.timestamp
        );

        println!("[LOG] Payload: {:?}", event.payload);
    }
}