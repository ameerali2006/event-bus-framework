//! Creates the database schema.

use rusqlite::Result;
use super::connection::get_connection;

pub fn initialize_database() -> Result<()> {
    let conn = get_connection()?;

    // Enable foreign keys constraint enforcement in SQLite
    conn.execute("PRAGMA foreign_keys = ON;", [])?;

    // Create audit_logs table
    conn.execute(
        "
        CREATE TABLE IF NOT EXISTS audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_name TEXT NOT NULL,
            payload TEXT NOT NULL,
            timestamp INTEGER NOT NULL
        );
        ",
        [],
    )?;

    // Create events table
    conn.execute(
        "
        CREATE TABLE IF NOT EXISTS events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_name TEXT NOT NULL,
            event_constraints TEXT,
            custom_constraint TEXT,
            rule_constraints TEXT,
            sort_order INTEGER,
            name TEXT
        );
        ",
        [],
    )?;

    // Create actions table
    conn.execute(
        "
        CREATE TABLE IF NOT EXISTS actions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            action_type TEXT NOT NULL,
            parameters TEXT,
            sort_order INTEGER,
            name TEXT
        );
        ",
        [],
    )?;

    // Create event_action_containers table
    conn.execute(
        "
        CREATE TABLE IF NOT EXISTS event_action_containers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_id INTEGER,
            action_id INTEGER,
            parameter_values TEXT,
            custom_constraint TEXT,
            sort_order INTEGER,
            FOREIGN KEY(event_id) REFERENCES events(id) ON DELETE CASCADE,
            FOREIGN KEY(action_id) REFERENCES actions(id) ON DELETE CASCADE
        );
        ",
        [],
    )?;

    // Create triggers table
    conn.execute(
        "
        CREATE TABLE IF NOT EXISTS triggers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            expression TEXT NOT NULL,
            last_trigger INTEGER,
            name TEXT NOT NULL
        );
        ",
        [],
    )?;

    // Alter table to add custom_constraint column to existing database tables if they exist
    let _ = conn.execute("ALTER TABLE event_action_containers ADD COLUMN custom_constraint TEXT;", []);

    // Create indexes for performance tuning
    conn.execute(
        "
        CREATE INDEX IF NOT EXISTS idx_event_name
        ON audit_logs(event_name);
        ",
        [],
    )?;

    conn.execute(
        "
        CREATE INDEX IF NOT EXISTS idx_timestamp
        ON audit_logs(timestamp);
        ",
        [],
    )?;

    conn.execute(
        "
        CREATE INDEX IF NOT EXISTS idx_events_event_name
        ON events(event_name);
        ",
        [],
    )?;

    conn.execute(
        "
        CREATE INDEX IF NOT EXISTS idx_actions_action_type
        ON actions(action_type);
        ",
        [],
    )?;

    conn.execute(
        "
        CREATE INDEX IF NOT EXISTS idx_containers_event_id
        ON event_action_containers(event_id);
        ",
        [],
    )?;

    conn.execute(
        "
        CREATE INDEX IF NOT EXISTS idx_containers_action_id
        ON event_action_containers(action_id);
        ",
        [],
    )?;

    println!("Seeding database with default events and actions if not present...");

    // Initialize centralized EventRegistry
    crate::services::event_registry::EventRegistry::initialize_events_with_conn(&conn)?;

    // 2. Seed actions (CreateLog, SendMessage, SendNotification) if not present
    conn.execute(
        "
        INSERT INTO actions (action_type, parameters, sort_order, name)
        SELECT 'CreateLog', '', 1, 'Create Log Action'
        WHERE NOT EXISTS (SELECT 1 FROM actions WHERE action_type = 'CreateLog');
        ",
        [],
    )?;

    conn.execute(
        "
        INSERT INTO actions (action_type, parameters, sort_order, name)
        SELECT 'SendMessage', '', 2, 'Send Message Action'
        WHERE NOT EXISTS (SELECT 1 FROM actions WHERE action_type = 'SendMessage');
        ",
        [],
    )?;

    conn.execute(
        "
        INSERT INTO actions (action_type, parameters, sort_order, name)
        SELECT 'SendNotification', '', 3, 'Send Notification Action'
        WHERE NOT EXISTS (SELECT 1 FROM actions WHERE action_type = 'SendNotification');
        ",
        [],
    )?;

    // 3. Seed Mappings in event_action_containers if not present
    conn.execute(
        "
        INSERT INTO event_action_containers (event_id, action_id, parameter_values, custom_constraint, sort_order)
        SELECT e.id, a.id, '[{\"Key\":\"LogMessage\",\"Value\":\"Ticket created with Subject: [:Subject]\"}]', '', 1
        FROM events e, actions a
        WHERE e.event_name = 'TicketCreated' AND a.action_type = 'CreateLog'
          AND NOT EXISTS (
              SELECT 1 FROM event_action_containers
              WHERE event_id = e.id AND action_id = a.id
          );
        ",
        [],
    )?;

    conn.execute(
        "
        INSERT INTO event_action_containers (event_id, action_id, parameter_values, custom_constraint, sort_order)
        SELECT e.id, a.id, '[{\"Key\":\"Recipient\",\"Value\":\"SupportTeam\"},{\"Key\":\"MessageText\",\"Value\":\"New ticket opened: [:Subject]\"}]', '', 2
        FROM events e, actions a
        WHERE e.event_name = 'TicketCreated' AND a.action_type = 'SendMessage'
          AND NOT EXISTS (
              SELECT 1 FROM event_action_containers
              WHERE event_id = e.id AND action_id = a.id
          );
        ",
        [],
    )?;

    conn.execute(
        "
        INSERT INTO event_action_containers (event_id, action_id, parameter_values, custom_constraint, sort_order)
        SELECT e.id, a.id, '[{\"Key\":\"NotificationTitle\",\"Value\":\"Ticket Opened\"},{\"Key\":\"NotificationBody\",\"Value\":\"Ticket [:Subject] has been created.\"}]', '', 3
        FROM events e, actions a
        WHERE e.event_name = 'TicketCreated' AND a.action_type = 'SendNotification'
          AND NOT EXISTS (
              SELECT 1 FROM event_action_containers
              WHERE event_id = e.id AND action_id = a.id
          );
        ",
        [],
    )?;

    // Update existing mappings to have default parameters if they were seeded as empty
    conn.execute(
        "
        UPDATE event_action_containers
        SET parameter_values = '[{\"Key\":\"LogMessage\",\"Value\":\"Ticket created with Subject: [:Subject]\"}]'
        WHERE (parameter_values = '' OR parameter_values IS NULL)
          AND event_id = (SELECT id FROM events WHERE event_name = 'TicketCreated')
          AND action_id = (SELECT id FROM actions WHERE action_type = 'CreateLog');
        ",
        [],
    )?;

    conn.execute(
        "
        UPDATE event_action_containers
        SET parameter_values = '[{\"Key\":\"Recipient\",\"Value\":\"SupportTeam\"},{\"Key\":\"MessageText\",\"Value\":\"New ticket opened: [:Subject]\"}]'
        WHERE (parameter_values = '' OR parameter_values IS NULL)
          AND event_id = (SELECT id FROM events WHERE event_name = 'TicketCreated')
          AND action_id = (SELECT id FROM actions WHERE action_type = 'SendMessage');
        ",
        [],
    )?;

    conn.execute(
        "
        UPDATE event_action_containers
        SET parameter_values = '[{\"Key\":\"NotificationTitle\",\"Value\":\"Ticket Opened\"},{\"Key\":\"NotificationBody\",\"Value\":\"Ticket [:Subject] has been created.\"}]'
        WHERE (parameter_values = '' OR parameter_values IS NULL)
          AND event_id = (SELECT id FROM events WHERE event_name = 'TicketCreated')
          AND action_id = (SELECT id FROM actions WHERE action_type = 'SendNotification');
        ",
        [],
    )?;


    // Seed HelloTrigger trigger if not present
    conn.execute(
        "
        INSERT INTO triggers (expression, last_trigger, name)
        SELECT '*/5 * * * * *', NULL, 'HelloTrigger'
        WHERE NOT EXISTS (SELECT 1 FROM triggers WHERE name = 'HelloTrigger');
        ",
        [],
    )?;

    // Seed mapping for TriggerExecuted to execute CreateLog
    conn.execute(
        "
        INSERT INTO event_action_containers (event_id, action_id, parameter_values, custom_constraint, sort_order)
        SELECT e.id, a.id, '[{\"Key\":\"LogMessage\",\"Value\":\"Trigger HelloTrigger executed successfully!\"}]', '', 1
        FROM events e, actions a
        WHERE e.event_name = 'TriggerExecuted' AND a.action_type = 'CreateLog'
          AND NOT EXISTS (
              SELECT 1 FROM event_action_containers
              WHERE event_id = e.id AND action_id = a.id
          );
        ",
        [],
    )?;

    println!("Database seeded successfully.");
    println!("Database initialized successfully.");

    Ok(())
}