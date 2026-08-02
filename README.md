# Dynamic Event Framework

A robust, database-driven event execution engine and scheduling platform designed to handle dynamic event dispatching, logical constraint evaluation, parameter mapping resolution, and automated action execution. Built with Rust, Tauri, React, TypeScript, Tailwind CSS, and SQLite, this system provides a visual control center and a reliable runtime for event-driven automation.

---

## 📖 Project Overview

The **Dynamic Event Framework** decouples event producers from execution logic. Instead of hardcoding which subscriber receives an event and what action is executed, the entire flow is database-driven:
* **Events** are dynamically registered.
* **Actions** are defined as extensible plugins.
* **Event-Action Mappings** configure which events execute which actions, sorted by precedence, guarded by logical constraints, and parametrized via custom JSON overrides.
* **Triggers** act as cron-based automated schedulers that fire events at specified intervals.
* **Audit Trails** log all executions, payloads, and parameters for historical diagnostics.

The application starts with a zero-configuration SQLite database initialized automatically with seed events, actions, mappings, and triggers on startup. Users can configure and test their pipelines in real-time through the desktop interface.

---

## ✨ Features

### Core Backend Engine
* **Dynamic Event Registration:** Centralized catalog of supported system events (`TicketCreated`, `PaymentProcessed`, etc.) with customizable rules.
* **Dynamic Action Registration:** Register reusable action handlers via the `ActionProcessor` trait, supporting custom actions like logging, message publication, and email notifications.
* **Event Dispatcher:** Processes events, loads execution links, checks constraints, resolves parameters, and handles exceptions.
* **Constraint Evaluation:** Evaluates complex syntax constraints (e.g., `Priority == 'high'`) utilizing context variables at dispatch time.
* **Parameter Resolution:** Resolves parameters dynamically by extracting values from the event payload using token formats (e.g., `[:Subject]`).
* **Action Executor:** Executes action processors asynchronously, handles failures, and isolates mapping runs.
* **Trigger Scheduler:** A multi-threaded cron-based execution daemon that evaluates trigger records in SQLite and schedules background events.
* **Audit Logging:** Automatically captures log files, event names, execution times, and context payloads in SQLite for security reviews.

### Interactive Desktop UI
* **Dashboard:** Comprehensive metrics panels displaying total Events, Actions, Mappings, Triggers, and Audit Log counts alongside a feed of recent activities.
* **Events CRUD:** Create, update, or delete system events.
* **Actions CRUD:** Register reusable action handlers and specify default parameter schemas.
* **Event → Action Mapping CRUD:** Bind actions to specific events, configure execution sort orders, specify custom constraints, and override parameter templates.
* **Trigger Management CRUD:** Schedule cron jobs (e.g., `*/5 * * * * *`) to launch background event workflows.
* **Event Testing Console:** Test workflows by sending simulated events with custom JSON payloads.

---

## 📐 Architecture Diagram

```
                  +----------------------------------------------+
                  |                 React Desktop UI             |
                  | (Dashboard, Catalogs CRUD, Event Tester, CSS)|
                  +----------------------------------------------+
                                          |
                              Tauri IPC Commands Layer
                                          |
                                          v
+--------------------------------------------------------------------------------+
|                                Tauri Rust Core                                 |
|                                                                                |
|  +--------------------+      +--------------------+      +------------------+  |
|  |   Trigger Service  | ---> |  Event Dispatcher  | <--- |  Event Registry  |  |
|  |  (Cron Scheduler)  |      +---------+----------+      +------------------+  |
|  +--------------------+                |                                       |
|                                        v                                       |
|                              +--------------------+                            |
|                              |Constraint Evaluator|                            |
|                              +---------+----------+                            |
|                                        |                                       |
|                                        v                                       |
|                              +--------------------+                            |
|                              | Parameter Resolver |                            |
|                              +---------+----------+                            |
|                                        |                                       |
|                                        v                                       |
|                              +--------------------+      +------------------+  |
|                              |   Action Executor  | ---> | Action Registry  |  |
|                              +---------+----------+      +------------------+  |
|                                        |                                       |
|                                        v                                       |
|                              +--------------------+                            |
|                              |  Action Processors |                            |
|                              | (Log, Msg, Notification)                        |
|                              +---------+----------+                            |
|                                        |                                       |
|                                        v                                       |
|                              +--------------------+                            |
|                              |    Audit Service   |                            |
|                              +---------+----------+                            |
+--------------------------------------------------------------------------------+
                                         |
                                         v
                              +--------------------+
                              |  SQLite Database   |
                              | (Auto-seeded schema)                             |
                              +--------------------+
```

---

## 📂 Project Structure

```
event-bus-framework/
├── src/                         # Frontend React Source Code
│   ├── components/              # UI Component Modules
│   │   ├── ActionForm.tsx       # Action configuration dialog
│   │   ├── ActionsPage.tsx      # Actions catalog layout
│   │   ├── ActionsTable.tsx     # Grid listing action handlers
│   │   ├── AuditLogsPage.tsx    # System audit trails page
│   │   ├── EventForm.tsx        # Event registration dialog
│   │   ├── EventsPage.tsx       # Events page layout
│   │   ├── EventsTable.tsx      # Grid listing event definitions
│   │   ├── EventTestingPage.tsx # Event dispatch console tester
│   │   ├── MappingForm.tsx      # Event-Action linking dialog
│   │   ├── MappingTable.tsx     # Precedence sorting table
│   │   ├── TriggerForm.tsx      # Cron scheduling dialog
│   │   ├── TriggerPage.tsx      # Trigger management layout
│   │   └── TriggerTable.tsx     # Active schedulers listing
│   ├── services/                # Tauri RPC Command Handlers
│   │   ├── actionApi.ts
│   │   ├── eventApi.ts
│   │   ├── mappingApi.ts
│   │   └── triggerApi.ts
│   ├── App.tsx                  # Main router and Sidebar layout
│   ├── index.css                # Global styles and Tailwind base
│   └── main.tsx                 # Client entry bootstrap
├── src-tauri/                   # Backend Tauri Rust Source Code
│   ├── src/
│   │   ├── audit/               # Execution logger services
│   │   ├── database/            # SQLite connection pool and schema scripts
│   │   ├── models/              # Struct declarations (Event, Action, Trigger)
│   │   ├── repositories/        # Database CRUD modules
│   │   ├── services/            # Engine pipelines
│   │   │   ├── action_executor.rs
│   │   │   ├── action_registry.rs
│   │   │   ├── constraint_evaluator.rs
│   │   │   ├── event_dispatcher.rs
│   │   │   ├── event_registry.rs
│   │   │   ├── parameter_resolver.rs
│   │   │   └── trigger_service.rs
│   │   └── lib.rs               # Command router and initialization hooks
│   └── Cargo.toml               # Rust package dependencies
├── tailwind.config.js           # Tailwind utility scanner configurations
├── package.json                 # Node package scripts and packages
└── README.md                    # System documentation
```

---

## 🛠️ Tech Stack

* **Desktop Shell:** [Tauri v2](https://tauri.app/) (Lightweight Rust framework for native apps)
* **Backend Language:** [Rust](https://www.rust-lang.org/) (Thread-safe, high performance)
* **Frontend Framework:** [React v18](https://react.dev/) with [Vite](https://vite.dev/) and [TypeScript](https://www.typescriptlang.org/)
* **CSS Framework:** [Tailwind CSS v3](https://tailwindcss.com/)
* **Database:** [SQLite](https://sqlite.org/) via parameterized `rusqlite`
* **Cron Library:** `cron` (Cron pattern parsing in background loops)

---

## ⚙️ Installation

### Prerequisites
1. **Rust Toolchain:** Install `rustup` via [rustup.rs](https://rustup.rs/).
2. **Node.js:** Install Node LTS via [nodejs.org](https://nodejs.org/).
3. **OS Build Tools:** Ensure C++ build toolchains are available (Build Tools for Visual Studio on Windows, Xcode on macOS, or `build-essential` on Linux).

### Clone and Install Dependencies
```bash
# Clone the repository
git clone https://github.com/your-username/event-bus-framework.git
cd event-bus-framework

# Install node dependencies
npm install
```

---

## 🚀 Running the Application

To run the application locally in development mode:
```bash
# Launches the Tauri dev server and hot-reloads the React client
npm run tauri dev
```

---

## 📦 Building for Production

To bundle the application into a self-contained, native installer:
```bash
# Compiles React files, compiles Rust in release mode, and packages the binary
npm run tauri build
```
Installers will be generated under `src-tauri/target/release/bundle/`.

---

## 🗄️ Database Initialization

The SQLite database path is resolved dynamically relative to the operating system's standard application data directory (e.g. `AppData/Local/event-bus-framework` on Windows).

On first boot:
1. The database connection is opened.
2. Table schemas (`events`, `actions`, `event_action_containers`, `triggers`, `audit_logs`) are created.
3. Seeding logic populates standard values:
   * **Events:** `TicketCreated`, `PaymentProcessed`, `TriggerExecuted`, `TicketOpened`, and others.
   * **Actions:** Reusable logging (`CreateLog`), message printing (`SendMessage`), and system alert alerts (`SendNotification`).
   * **Mappings:** Configured links mapping events to actions with precedence orders and parameter templates.
   * **Triggers:** A sample `HelloTrigger` configured to fire the `TriggerExecuted` event every 5 seconds (`*/5 * * * * *`).

---

## 🔄 Event Processing Flow

When an event is dispatched (via Tauri command, user interface testing console, or trigger schedule):

```
       +-----------------------+
       |   Event Dispatched    |
       +-----------+-----------+
                   |
                   v
+-------------------------------------+
|      Load Action Containers         |  <--- SELECT mappings FROM SQLite
+------------------+------------------+
                   |
                   v
         [ For Each Container ]
                   |
                   v
+-------------------------------------+
|         Evaluate Constraint         |  <--- Skip action if evaluates to false
+------------------+------------------+
                   |
                   v
+-------------------------------------+
|         Resolve Parameters          |  <--- Parse [:Subject] token replacements
+------------------+------------------+
                   |
                   v
+-------------------------------------+
|          Execute Action             |  <--- Invoke specific ActionProcessor
+------------------+------------------+
                   |
                   v
+-------------------------------------+
|         Record Audit Log            |  <--- Write payload results to SQLite
+-------------------------------------+
```

---

## ⏰ Trigger Flow

The trigger scheduler loop runs continuously in a background thread:

1. Every second, it polls active triggers from SQLite.
2. Checks trigger cron patterns against the current system time.
3. If a pattern matches:
   * Dispatches the `TriggerExecuted` event with metadata payload (trigger ID, name, fire timestamp).
   * Updates the `last_trigger` timestamp in the database.
   * The `TriggerExecuted` event enters the event dispatcher pipeline, triggering its mapped actions.

---

## 📝 Example Event Payload

Below is an example JSON payload dispatched when publishing a support ticket event:

```json
{
  "Subject": "Database server out of memory",
  "ticket_id": "TKT-9912",
  "created_by": "Ops Bot",
  "Priority": "high"
}
```

If mapped to a message action with parameters:
```json
[
  { "key": "Recipient", "value": "Slack-Channel-Ops" },
  { "key": "Body", "value": "Alert: [:Subject] (ID: [:ticket_id])" }
]
```
The parameter resolver parses this into:
* **Recipient:** `Slack-Channel-Ops`
* **Body:** `Alert: Database server out of memory (ID: TKT-9912)`

---

## 📸 Screenshots Section

Below are visual examples of the application layout (placeholders for compiled runtime preview illustrations):

#### 1. Operational Dashboard
* Displays metrics summaries for registered assets and the recent audit trail.
* *[Image Placeholder: Operational Dashboard Preview]*

#### 2. Event Action Mappings Layout
* Precedence, constraints, and configuration settings interface.
* *[Image Placeholder: Mappings Manager View]*

#### 3. Event Testing Console
* Code editor playground with dropdown selection triggers and response logs.
* *[Image Placeholder: Custom Event Publisher Testbed]*

---

## 🚀 Future Improvements

* **Advanced logical expressions:** Support parenthesis grouping and OR operators inside mapping constraints evaluator.
* **Variable autocomplete:** Provide dynamic autocomplete menus showing available event payload properties inside parameter forms.
* **Pause Schedulers:** Add start/pause toggle switches to temporarily pause trigger loops.
* **Webhooks integration:** Implement a webhook action processor to post JSON outputs to HTTP endpoint APIs.

---

## 👤 Author

Developed by **Ameer Ali** as part of the Dynamic Event Framework implementation.
