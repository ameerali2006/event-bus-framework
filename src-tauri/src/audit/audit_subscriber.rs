#![allow(dead_code)]

//! Subscriber responsible for auditing every event.

use crate::audit::audit_service::AuditService;
use crate::bus::event::Event;
use crate::bus::subscriber::Subscriber;

pub struct AuditSubscriber;

impl Subscriber for AuditSubscriber {
    fn name(&self) -> &str {
        "AuditSubscriber"
    }

    fn handle(&self, event: &Event) {
        match AuditService::save(event) {
            Ok(_) => println!("[AUDIT] Audit log stored successfully."),
            Err(err) => eprintln!("[AUDIT ERROR] {}", err),
        }
    }
}