# Database Instruction

This document explains how to design and rebuild the PostgreSQL database for the Flight Price Tracker project.

This is written with an MVP-first mindset. The first version should be small, stable, and easy to understand. The schema should also leave room for future growth.

---

## Database Goal

Build a PostgreSQL database that can support:

- flight watch records
- future price history
- future notifications
- future user ownership

The MVP should only require one main table, but the structure should be documented so the system can be rebuilt consistently.

---

## Database Technology

Use:

- PostgreSQL

Do not overcomplicate the setup in the beginning with multiple schemas, extensions, or unnecessary abstraction.

---

## Phase 1 — Create the Database

### What to do
Create a PostgreSQL database dedicated to this project.

### Suggested database name
- `flight_tracker`

### Goal
You should have a clean, empty database ready for tables.

### Checkpoint
- the database exists
- you can connect to it from your SQL client or terminal

---

## Phase 2 — Define the MVP Table

For the MVP, create one main table:

- `flight_watches`

This table stores the watches the user creates.

### Required columns

| Column | Type | Null? | Default | Purpose |
|---|---|---:|---|---|
| id | SERIAL or IDENTITY | No | auto | Primary key |
| origin | VARCHAR(100) | No |  | Departure location or airport code |
| destination | VARCHAR(100) | No |  | Arrival location or airport code |
| departure_date | DATE | No |  | Outbound travel date |
| return_date | DATE | Yes | NULL | Return travel date for round trip |
| is_round_trip | BOOLEAN | No | FALSE | Indicates trip type |
| target_price | NUMERIC(10,2) | No |  | User-defined desired price |
| current_price | NUMERIC(10,2) | Yes | NULL | Most recently known price |
| currency | VARCHAR(10) | No | 'SEK' | Currency code |
| is_active | BOOLEAN | No | TRUE | Whether this watch should still be checked |
| created_at | TIMESTAMP | No | CURRENT_TIMESTAMP | Record creation time |
| updated_at | TIMESTAMP | No | CURRENT_TIMESTAMP | Last update time |

### Why these columns exist
- `origin` and `destination` identify the route
- `departure_date` and `return_date` identify the travel window
- `target_price` defines the alert condition
- `current_price` stores the latest known price
- `is_active` allows logical deactivation without deletion
- timestamps make debugging and history easier later

---

## Phase 3 — Add Basic Constraints

### What to do
Define safe baseline constraints.

### Recommended constraints
- primary key on `id`
- `target_price > 0`
- `current_price IS NULL OR current_price > 0`
- optional check: if `is_round_trip = FALSE`, `return_date` may remain NULL
- optional check: `return_date >= departure_date` when return date exists

### Why this matters
This protects the database from obviously bad data.

### Checkpoint
- the table rejects invalid prices
- the table structure enforces basic consistency

---

## Phase 4 — Write the SQL for Rebuilding the MVP Database

Use a rebuild script that can be understood and rerun safely during development.

### MVP SQL blueprint

```sql
CREATE TABLE IF NOT EXISTS flight_watches (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    origin VARCHAR(100) NOT NULL,
    destination VARCHAR(100) NOT NULL,
    departure_date DATE NOT NULL,
    return_date DATE NULL,
    is_round_trip BOOLEAN NOT NULL DEFAULT FALSE,
    target_price NUMERIC(10,2) NOT NULL CHECK (target_price > 0),
    current_price NUMERIC(10,2) NULL CHECK (current_price IS NULL OR current_price > 0),
    currency VARCHAR(10) NOT NULL DEFAULT 'SEK',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_return_date CHECK (
        return_date IS NULL OR return_date >= departure_date
    )
);
```

### Important note
You can later switch to migration tooling, but for the beginning this blueprint is enough.

---

## Phase 5 — Seed a Small Set of Test Data

### Why seed data matters
It helps you test the backend and frontend early.

### Recommended sample records
Create 2 to 3 watches manually.

### Example data ideas
- Copenhagen to Barcelona
- Malmö to London
- Stockholm to Rome

### Example seed SQL

```sql
INSERT INTO flight_watches
(origin, destination, departure_date, return_date, is_round_trip, target_price, current_price, currency, is_active)
VALUES
('Copenhagen', 'Barcelona', '2026-07-10', '2026-07-17', TRUE, 1800.00, 2200.00, 'SEK', TRUE),
('Malmö', 'London', '2026-08-03', NULL, FALSE, 950.00, NULL, 'SEK', TRUE),
('Stockholm', 'Rome', '2026-09-12', '2026-09-18', TRUE, 2100.00, 2450.00, 'SEK', FALSE);
```

### Checkpoint
- test rows can be inserted successfully
- selecting from the table returns expected values

---

## Phase 6 — Plan for the First Future Table

After the MVP works, prepare for price history.

### First future table
- `price_history`

### Purpose
Store every checked price over time.

### Suggested columns
| Column | Type | Null? | Purpose |
|---|---|---:|---|
| id | IDENTITY | No | Primary key |
| flight_watch_id | INTEGER | No | Foreign key to `flight_watches.id` |
| price | NUMERIC(10,2) | No | Observed price |
| currency | VARCHAR(10) | No | Currency code |
| checked_at | TIMESTAMP | No | When the price was checked |
| source_name | VARCHAR(100) | Yes | Which provider/API returned the price |

### Recommended relationship
- many `price_history` rows can belong to one `flight_watches` row

### Do not build this table on day one unless MVP is complete.

---

## Phase 7 — Plan for Notifications

Only after price checking exists.

### Future table
- `notifications`

### Purpose
Log alerts that were sent.

### Suggested columns
- id
- flight_watch_id
- channel
- message
- sent_at
- status

Again, do not build this before it is needed.

---

## Phase 8 — Decide on Naming Standards

### Recommended table naming
Use plural snake_case table names:
- `flight_watches`
- `price_history`
- `notifications`

### Recommended column naming
Use snake_case consistently:
- `departure_date`
- `target_price`
- `created_at`

### Why this matters
It keeps ORM mapping and SQL scripts easier to read.

---

## Phase 9 — Create a Rebuild Strategy

You asked for a structure that can always be rebuilt.

### Recommended approach
Keep SQL scripts in a dedicated folder, for example:

```text
backend/sql/
├── 001_create_flight_watches.sql
├── 002_seed_flight_watches.sql
└── 003_future_notes.sql
```

### MVP use
At minimum create:
- one script for table creation
- one script for seed data

### Goal
Anyone can recreate the same local database structure later.

---

## Phase 10 — Move Toward Migrations Later

After the MVP is stable, you can introduce migration tooling.

### Recommended future step
Use Alembic later for:
- schema changes
- versioned migrations
- safer evolution over time

### Important
Do not let migration tooling delay the MVP.

---

## SQL Reference Summary

### MVP database object
- `flight_watches`

### MVP required columns
- `id`
- `origin`
- `destination`
- `departure_date`
- `return_date`
- `is_round_trip`
- `target_price`
- `current_price`
- `currency`
- `is_active`
- `created_at`
- `updated_at`

### Future database objects
- `price_history`
- `notifications`

---

## MVP Database Definition of Success

The database phase is complete when:

- PostgreSQL database exists
- `flight_watches` table exists
- constraints work
- seed data can be inserted
- backend can connect and read/write records

---

## What Not to Build Yet

Do not add these in the first database version:

- users table
- roles and permissions
- notification templates
- audit tables
- provider-specific tables
- heavy normalization too early

---

## Suggested Commit Milestones

- `docs: define database schema phases`
- `feat: create flight_watches table`
- `feat: add seed data for flight_watches`
- `refactor: prepare sql folder for rebuild scripts`

---

## Definition of Success

When this instruction is completed, you should be able to rebuild the project database from scratch in a repeatable way.
