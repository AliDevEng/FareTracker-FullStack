# Flight Price Tracker

A phased fullstack learning project for tracking flight prices and later sending alerts when prices drop below a target threshold.

This repository is intentionally planned as an **MVP-first** project. The goal is to build a small working slice, test it, commit it, and then expand the system in controlled phases with clear separation of concerns.

## Project Goal

Build a fullstack application that allows a user to:

- create a flight watch
- store that watch in PostgreSQL
- view saved watches
- update and delete watches
- later connect to a flight pricing source
- later compare new prices with stored prices
- later notify the user when a price drops enough

## Core Principles

This project should be built with the following mindset:

- **MVP first**: start with the smallest useful version
- **Incremental delivery**: build a little, test, push, repeat
- **Scalability in mind**: simple now, but structured for growth
- **Separation of concerns**: database, backend, and frontend should evolve independently
- **Testability**: every phase should produce something you can run and verify
- **Portfolio quality**: structure the repo like a real project, not a one-file experiment

## Stack

### Frontend
- React
- TypeScript
- Vite
- Fetch API or Axios
- Basic CSS or Tailwind later if wanted

### Backend
- Python
- FastAPI
- SQLAlchemy
- Pydantic
- Uvicorn

### Database
- PostgreSQL

## Repository Structure

```text
flight-price-tracker/
├── README.md
├── backend/
├── frontend/
└── docs/
    ├── backend-instruction.md
    ├── frontend-instruction.md
    └── database-instruction.md
```

## Development Strategy

Do not try to build the complete product immediately.

Use this order:

1. establish repository structure
2. prepare PostgreSQL design
3. build backend MVP
4. test backend manually
5. connect frontend to backend
6. test full CRUD flow
7. push stable milestone
8. add price-history support
9. add background checking
10. add notifications

Each phase should result in a project state that still runs.

## MVP Scope

The MVP should support:

- creating a flight watch
- reading all flight watches
- reading one flight watch
- updating a flight watch
- deleting a flight watch

The MVP should **not** yet include:

- real flight provider integration
- scheduled price checking
- email or Telegram notifications
- login and user accounts
- advanced analytics
- deployment optimization

## Functional Overview

A flight watch should minimally contain:

- origin
- destination
- departure date
- optional return date
- trip type
- target price
- currency
- current price placeholder
- active status

Later versions may add:

- provider name
- last checked timestamp
- historical price log
- price drop percent
- notification status
- created by user

## Phase Overview

### Phase 1
Create the repository and folder structure.

### Phase 2
Design the database and document the schema.

### Phase 3
Build backend configuration and connect PostgreSQL.

### Phase 4
Implement CRUD endpoints for flight watches.

### Phase 5
Test endpoints in Swagger and Postman.

### Phase 6
Create frontend project structure.

### Phase 7
Build UI for creating and listing flight watches.

### Phase 8
Connect frontend to backend.

### Phase 9
Add history-ready database structure.

### Phase 10
Prepare for real price-check integrations and notifications.

## What “Done” Looks Like for MVP

The MVP is complete when you can:

- open the frontend
- create a flight watch
- save it to PostgreSQL through the API
- fetch and display the saved records
- edit a record
- delete a record
- verify changes directly in the database

## How to Work Through This Project

Use the instruction files in the `docs` folder:

- `database-instruction.md`
- `backend-instruction.md`
- `frontend-instruction.md`

Read them in that order.


## Important Constraint

This project should stay small at the beginning.

Do not build future phases too early. Only add complexity after the current phase is working and tested.

