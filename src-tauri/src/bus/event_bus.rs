//! Core Event Bus implementation.

use std::sync::Arc;

use super::event::Event;
use super::subscriber::Subscriber;

pub struct EventBus {
    subscribers: Vec<Arc<dyn Subscriber>>,
}

impl EventBus {
    /// Creates a new Event Bus.
    pub fn new() -> Self {
        Self {
            subscribers: Vec::new(),
        }
    }

    /// Registers a subscriber.
    pub fn subscribe(&mut self, subscriber: Arc<dyn Subscriber>) {
        self.subscribers.push(subscriber);
    }

    /// Publishes an event to all subscribers.
    pub fn publish(&self, event: &Event) {
        println!("Publishing event: {}", event.name);

        for subscriber in &self.subscribers {
            println!("Executing subscriber: {}", subscriber.name());
            subscriber.handle(event);
        }
    }
}