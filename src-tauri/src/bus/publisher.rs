#![allow(dead_code)]

//! Publisher responsible for publishing events to the Event Bus.

use super::event::Event;
use super::event_bus::EventBus;

pub struct Publisher<'a> {
    event_bus: &'a EventBus,
}

impl<'a> Publisher<'a> {
    /// Creates a new Publisher.
    pub fn new(event_bus: &'a EventBus) -> Self {
        Self { event_bus }
    }

    /// Publishes an event.
    pub fn publish(&self, event: Event) {
        println!("Publisher -> {}", event.name);

        self.event_bus.publish(&event);
    }
}