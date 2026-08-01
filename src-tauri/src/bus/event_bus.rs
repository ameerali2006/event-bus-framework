//! Core Event Bus implementation.

use std::sync::{Arc, RwLock};

use super::event::Event;
use super::subscriber::Subscriber;

pub struct EventBus {
    subscribers: RwLock<Vec<Arc<dyn Subscriber>>>,
}

impl EventBus {
    /// Creates a new Event Bus.
    pub fn new() -> Self {
        Self {
            subscribers: RwLock::new(Vec::new()),
        }
    }

    /// Registers a subscriber thread-safely at runtime.
    pub fn subscribe(&self, subscriber: Arc<dyn Subscriber>) {
        if let Ok(mut subs) = self.subscribers.write() {
            subs.push(subscriber);
        }
    }

    /// Publishes an event to all subscribers asynchronously and independently.
    pub fn publish(&self, event: &Event) {
        println!("Publishing event: {}", event.name);

        if let Ok(subs) = self.subscribers.read() {
            for subscriber in subs.iter() {
                let subscriber = Arc::clone(subscriber);
                let event = event.clone();

                // Spawn task asynchronously to prevent a slow or failing subscriber from blocking others
                tauri::async_runtime::spawn(async move {
                    println!("Executing subscriber: {}", subscriber.name());
                    subscriber.handle(&event);
                });
            }
        }
    }
}