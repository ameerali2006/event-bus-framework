//! Defines the contract for all event subscribers.

use super::event::Event;

pub trait Subscriber: Send + Sync {
    /// Returns the unique subscriber name.
    fn name(&self) -> &str;

    /// Handles an incoming event.
    fn handle(&self, event: &Event);
}