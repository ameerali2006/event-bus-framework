#![allow(dead_code)]

//! Subscriber responsible for sending messages.

use crate::bus::event::Event;
use crate::bus::subscriber::Subscriber;

pub struct MessageSubscriber;

impl Subscriber for MessageSubscriber {
    fn name(&self) -> &str {
        "MessageSubscriber"
    }

    fn handle(&self, event: &Event) {
        println!(
            "[MESSAGE] Sending message for event: {}",
            event.name
        );

        println!(
            "[MESSAGE] Event payload: {:?}",
            event.payload
        );
    }
}