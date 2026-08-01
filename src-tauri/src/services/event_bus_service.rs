//! Service responsible for managing the Event Bus.

use std::collections::HashMap;
use std::sync::Arc;

use crate::audit::audit_subscriber::AuditSubscriber;
use crate::bus::event::Event;
use crate::bus::event_bus::EventBus;
use crate::bus::publisher::Publisher;

use crate::subscribers::log_subscriber::LogSubscriber;
use crate::subscribers::message_subscriber::MessageSubscriber;
use crate::subscribers::notification_subscriber::NotificationSubscriber;

pub struct EventBusService {
    event_bus: EventBus,
}

impl EventBusService {
    pub fn new() -> Self {
        let event_bus = EventBus::new();

        event_bus.subscribe(Arc::new(LogSubscriber));
        event_bus.subscribe(Arc::new(MessageSubscriber));
        event_bus.subscribe(Arc::new(NotificationSubscriber));
        event_bus.subscribe(Arc::new(AuditSubscriber));

        Self { event_bus }
    }

    pub fn publish_ticket_created(&self) {
        let mut payload = HashMap::new();

        payload.insert("ticket_id".to_string(), "TKT-1001".to_string());
        payload.insert("created_by".to_string(), "Ameer".to_string());

        let event = Event::new("TicketCreated", payload);

        // Instantiate the Publisher abstraction to dispatch the event
        let publisher = Publisher::new(&self.event_bus);
        publisher.publish(event);
    }
}