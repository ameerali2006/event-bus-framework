//! Subscriber responsible for sending notifications.

use crate::bus::event::Event;
use crate::bus::subscriber::Subscriber;

pub struct NotificationSubscriber;

impl Subscriber for NotificationSubscriber {
    fn name(&self) -> &str {
        "NotificationSubscriber"
    }

    fn handle(&self, event: &Event) {
        println!(
            "[NOTIFICATION] Sending notification for event: {}",
            event.name
        );

        println!(
            "[NOTIFICATION] Payload: {:?}",
            event.payload
        );
    }
}