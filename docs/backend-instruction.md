# Backend Instruction

This document explains how to build the backend in small phases. Follow the phases in order. Do not jump ahead before the current phase works.

The backend should remain focused on API logic, validation, and communication with the database. It should not contain frontend concerns.

---

## Backend Goal

Build a Python FastAPI backend that can:

- connect to PostgreSQL
- expose CRUD endpoints for flight watches
- validate input data
- return structured JSON responses
- remain easy to extend later

---

## Recommended Backend Folder Structure

```text
backend/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── config.py
│   ├── dependencies.py
│   ├── routes/
│   │   ├── __init__.py
│   │   └── watches.py
│   └── services/
│       └── __init__.py
├── tests/
├── requirements.txt
├── .env
└── .gitignore
```

You may start simpler, but keep this target structure in mind.

---

## Phase 1 — Prepare Backend Workspace

### What to do
- Create the `backend` folder
- Create a Python virtual environment
- Add `requirements.txt`
- Add `.gitignore`
- Add `.env`
- Create the `app` package

### Minimum outcome
You should have a clean backend folder ready for installation and development.

### Checkpoint
- the folder structure exists
- the virtual environment works
- dependencies can be installed

---

## Phase 2 — Install Backend Dependencies

### What to do
Install the first backend dependencies:

- FastAPI
- Uvicorn
- SQLAlchemy
- psycopg2-binary
- python-dotenv
- Pydantic

### Why this phase exists
This gives you the minimum stack needed for a PostgreSQL-backed API.

### Checkpoint
- dependencies install without errors
- `pip freeze` shows the expected packages

---

## Phase 3 — Configure Environment Settings

### What to do
- Create a `.env` file
- Store the PostgreSQL connection string in it
- Add a configuration module that loads environment variables

### Environment variables to define
At minimum:

- `DATABASE_URL`

Later you may add:

- `APP_ENV`
- `DEBUG`
- `FRONTEND_URL`

### Goal
The application should not hardcode database credentials.

### Checkpoint
- the backend can read the environment variable successfully

---

## Phase 4 — Create Database Connection Layer

### What to do
Create a dedicated database module that handles:

- engine creation
- session creation
- declarative base
- dependency for obtaining a database session in routes

### Separation of concern
This file should only manage database connectivity, not business rules.

### Checkpoint
- the backend starts without crashing
- importing the database layer works

---

## Phase 5 — Create the Domain Model

### What to build
Create the main backend model for a flight watch.

The backend model should reflect the database design from `database-instruction.md`.

### Initial entity
Use one main entity:

- `FlightWatch`

### MVP fields to support
- id
- origin
- destination
- departure_date
- return_date
- is_round_trip
- target_price
- current_price
- currency
- is_active
- created_at
- updated_at

### Rule
Keep it simple. Do not add users or notifications yet.

### Checkpoint
- the ORM model exists
- it matches the database schema

---

## Phase 6 — Create Pydantic Schemas

### What to do
Create separate schemas for:

- create request
- update request
- response model

### Why separate them
This keeps validation logic explicit and prevents accidental overexposure of fields.

### Recommendations
- create schema for create input
- create schema for update input with optional fields
- create schema for response output
- use proper date and numeric types

### Checkpoint
- request validation works
- response output is structured and predictable

---

## Phase 7 — Create the FastAPI App Entry Point

### What to do
Create the main application file.

It should:
- initialize FastAPI
- include routers
- provide a root health endpoint
- optionally create tables only if you are using temporary startup creation for MVP

### Important note
For learning, it is acceptable to create tables on startup in a very early MVP.
For a cleaner project, move toward explicit SQL scripts or migrations later.

### Checkpoint
- the server starts
- `/docs` opens successfully
- the root endpoint returns a message

---

## Phase 8 — Build CRUD Routes for Flight Watches

### What to implement
Create routes for:

- create a watch
- get all watches
- get one watch by id
- update a watch
- delete a watch

### Behavior expectations
- return `404` when a record does not exist
- validate incoming payloads
- use database sessions correctly
- return meaningful JSON

### Keep this phase narrow
Do not add price-check services yet.

### Checkpoint
You can use Swagger to create and manage records end-to-end.

---

## Phase 9 — Manual Testing

### What to do
Test all endpoints using:
- FastAPI Swagger UI
- Postman or Insomnia

### Scenarios to test
- valid create request
- invalid create request
- read all records
- read one existing record
- read one non-existing record
- update one record
- delete one record
- delete non-existing record

### Checkpoint
Every CRUD path has been tested at least once manually.

---

## Phase 10 — Refactor for Growth

Only begin this phase after MVP works.

### What to improve
- move reusable logic into service functions
- separate route logic from business logic
- prepare a `services` folder
- add better error handling
- prepare test folders
- add migration tooling later

### Future-ready backend extensions
Later you can add:
- price provider integration
- scheduled jobs
- notification service
- price history logic
- user ownership

### End-of-phase outcome
You now have a backend that is small, clean, and ready to grow.

---

## MVP Backend Definition

The backend MVP is complete when:

- FastAPI runs locally
- PostgreSQL is connected
- a flight watch can be created
- a flight watch can be listed
- a flight watch can be updated
- a flight watch can be deleted
- the backend returns predictable JSON responses

---

## What Not to Build Yet

Do not add these before the MVP works:

- authentication
- background workers
- email alerts
- Telegram alerts
- real flight APIs
- complex filtering
- Docker if it slows you down

---

## Suggested Commit Milestones

- `chore: initialize backend structure`
- `chore: add backend dependencies`
- `feat: add environment config`
- `feat: add database connection layer`
- `feat: add flight watch model and schemas`
- `feat: add watch CRUD routes`
- `test: verify CRUD endpoints manually`

---

## Definition of Success

When this instruction is completed, the backend should be independently usable even without the frontend.
