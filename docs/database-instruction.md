# Database — Design and Setup

PostgreSQL is the only database this project needs right now. The goal here is to get a clean schema in place that covers the MVP and has enough thought behind it that it won't need to be completely redesigned once price history and notifications come in later.

---

## Phase 1 — Create the database

Nothing fancy here. Just create a dedicated database for the project.

```bash
psql -U postgres
CREATE DATABASE flight_tracker;
\q
```

Confirm you can connect to it before moving on.

---

## Phase 2 — Design the main table

The MVP needs one table: `flight_watches`.

This stores the routes a user wants to track, along with the price they're targeting and the most recently known price.

### Schema

| Column | Type | Nullable | Default | Notes |
|---|---|---|---|---|
| id | INTEGER GENERATED ALWAYS AS IDENTITY | No | auto | Primary key |
| origin | VARCHAR(100) | No | — | Airport code or city |
| destination | VARCHAR(100) | No | — | Airport code or city |
| departure_date | DATE | No | — | Outbound travel date |
| return_date | DATE | Yes | NULL | Only set for round trips |
| is_round_trip | BOOLEAN | No | FALSE | Whether this is a round trip |
| target_price | NUMERIC(10,2) | No | — | Price the user wants to pay |
| current_price | NUMERIC(10,2) | Yes | NULL | Latest known price — NULL until first check |
| currency | VARCHAR(10) | No | 'SEK' | Currency code |
| is_active | BOOLEAN | No | TRUE | Inactive watches are skipped during price checks |
| created_at | TIMESTAMP | No | CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | No | CURRENT_TIMESTAMP | Updated by application logic, not a DB trigger |

A few things worth noting about this design:
- `current_price` starts NULL because we haven't checked yet. That's intentional and meaningful.
- `is_active` lets a watch be paused without deleting the record or its history.
- `updated_at` is managed in code, not by a database trigger. That's fine for now.

---

## Phase 3 — Add constraints

These protect the data from obviously wrong values.

```sql
CHECK (target_price > 0)
CHECK (current_price IS NULL OR current_price > 0)
CHECK (return_date IS NULL OR return_date >= departure_date)
```

The third constraint is the most important one — it prevents a return date that's before the departure date.

---

## Phase 4 — The full CREATE TABLE script

Save this as `backend/sql/001_create_flight_watches.sql`.

```sql
CREATE TABLE IF NOT EXISTS flight_watches (
    id              INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    origin          VARCHAR(100) NOT NULL,
    destination     VARCHAR(100) NOT NULL,
    departure_date  DATE NOT NULL,
    return_date     DATE NULL,
    is_round_trip   BOOLEAN NOT NULL DEFAULT FALSE,
    target_price    NUMERIC(10,2) NOT NULL CHECK (target_price > 0),
    current_price   NUMERIC(10,2) NULL CHECK (current_price IS NULL OR current_price > 0),
    currency        VARCHAR(10) NOT NULL DEFAULT 'SEK',
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT valid_return_date CHECK (
        return_date IS NULL OR return_date >= departure_date
    )
);
```

`IF NOT EXISTS` means this is safe to run more than once without blowing up.

---

## Phase 5 — Seed data for development

Having a few rows in the database from the start makes it much easier to test the API and the frontend.

Save this as `backend/sql/002_seed_flight_watches.sql`.

```sql
INSERT INTO flight_watches
    (origin, destination, departure_date, return_date, is_round_trip, target_price, current_price, currency, is_active)
VALUES
    ('CPH', 'BCN', '2026-07-10', '2026-07-17', TRUE,  1800.00, 2200.00, 'SEK', TRUE),
    ('MMX', 'LHR', '2026-08-03', NULL,          FALSE,  950.00, NULL,    'SEK', TRUE),
    ('ARN', 'FCO', '2026-09-12', '2026-09-18', TRUE,  2100.00, 2450.00, 'SEK', FALSE);
```

The third record uses `is_active = FALSE` on purpose — good for testing that the filter works.

---

## Phase 6 — Plan for price history (don't build yet)

Once the MVP is working, the natural next table is `price_history`. Every time the backend checks a price, it logs the result here.

### Proposed schema

| Column | Type | Nullable | Notes |
|---|---|---|---|
| id | IDENTITY | No | Primary key |
| flight_watch_id | INTEGER | No | FK to `flight_watches.id` |
| price | NUMERIC(10,2) | No | Observed price at this moment |
| currency | VARCHAR(10) | No | |
| checked_at | TIMESTAMP | No | When the check ran |
| source_name | VARCHAR(100) | Yes | Which provider returned this price |

One `flight_watches` row → many `price_history` rows.

Don't create this table until the MVP CRUD is fully working.

---

## Phase 7 — Plan for notifications (even later)

When background checks are running, a `notifications` table will log which alerts were sent and their status.

Columns: `id`, `flight_watch_id`, `channel` (email / telegram), `message`, `sent_at`, `status`.

Sketch it now, build it later.

---

## Phase 8 — Naming conventions

Stick to these throughout the project to keep ORM mapping simple:

- table names: plural snake_case (`flight_watches`, `price_history`, `notifications`)
- column names: snake_case (`departure_date`, `target_price`, `created_at`)
- no abbreviations in column names unless they're standard like `id`

---

## Phase 9 — SQL folder structure

Keep all database scripts under `backend/sql/` with a numbered prefix:

```
backend/sql/
├── 001_create_flight_watches.sql
├── 002_seed_flight_watches.sql
└── 003_create_price_history.sql   ← add later
```

The numbering makes the intended run order obvious. Anyone cloning the project can rebuild the database by running them in sequence.

---

## Phase 10 — Migrations later

Plain SQL scripts work fine for the MVP phase. Once the schema starts changing regularly, add Alembic:

```bash
pip install alembic
alembic init alembic
```

Then each schema change becomes a versioned migration file instead of a manual script. That's the right tool once things stabilize — it's overkill before the first working version.

---

## SQL reference

### MVP tables
- `flight_watches`

### Planned future tables
- `price_history`
- `notifications`

---

## Done when

- `flight_tracker` database exists
- `flight_watches` table is created with all constraints
- seed data inserts without errors
- the backend can connect to the database and read/write records

---

## Suggested commits

```
docs: define initial database schema
feat: add flight_watches table SQL
feat: add seed data for development
```
