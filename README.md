# FareTracker — Flight Price Tracker

A fullstack application for tracking flight prices and getting notified when they drop below a target threshold.

Built with Python, FastAPI, PostgreSQL, React, and TypeScript.

---

## Why I built this

I fly between a few cities fairly often and always end up either paying too much or spending too much time manually checking prices. I wanted something that just watches a route and tells me when the price is actually worth it.

The project also gave me a good excuse to build something end-to-end — from database schema design to REST API to a React frontend — and to practice structuring a real codebase instead of a tutorial project.

---

## What it does (current scope)

Right now the focus is the core flight watch system:

- create a flight watch for a specific route, date, and target price
- store it in PostgreSQL
- read, update, and delete watches through a REST API
- view and manage watches from a React frontend

Coming later:

- connect to a real flight pricing source
- run background checks on saved watches
- send an alert (email or Telegram) when a price drops below target
- show price history over time

---

## Stack

**Backend**
- Python 3.11+
- FastAPI
- SQLAlchemy
- Pydantic v2
- Uvicorn
- PostgreSQL (psycopg2)

**Frontend**
- React 18
- TypeScript
- Vite
- Fetch API (no extra HTTP library for now)

**Database**
- PostgreSQL

---

## Project structure

```
FareTracker-FullStack/
├── README.md
├── .gitignore
├── .gitattributes
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── config.py            ✓ env config
│   │   ├── database.py          ✓ engine and session
│   │   ├── dependencies.py      ✓ get_db
│   │   ├── models.py            ✓ FlightWatch ORM model
│   │   ├── schemas.py           ✓ create / update / response
│   │   ├── main.py              ✓ app entry point, /docs live
│   │   ├── routes/
│   │   │   └── watches.py       ← CRUD endpoints (in progress)
│   │   └── services/
│   ├── sql/
│   │   ├── 001_create_flight_watches.sql  ✓
│   │   └── 002_seed_flight_watches.sql    ✓
│   ├── tests/
│   ├── requirements.txt         ✓
│   └── .env.example             ✓
├── frontend/                    (not started)
└── docs/
    ├── backend-instruction.md
    ├── frontend-instruction.md
    └── database-instruction.md
```

---

## Getting started

### Prerequisites

- Python 3.11+
- PostgreSQL running locally
- Node.js 18+

### Backend setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env       # then fill in your DATABASE_URL
uvicorn app.main:app --reload
```

The API will be at `http://localhost:8000` and the auto-generated docs at `http://localhost:8000/docs`.

### Database setup

```bash
psql -U postgres -c "CREATE DATABASE fare_tracker;"
psql -U postgres -d fare_tracker -f backend/sql/001_create_flight_watches.sql
psql -U postgres -d fare_tracker -f backend/sql/002_seed_flight_watches.sql
```

### Frontend setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The app will be at `http://localhost:5173`.

---

## Development phases

The project is built in phases rather than all at once. Each phase produces something that runs.

| Phase | Focus | Status |
|---|---|---|
| 1 | Repo structure | Done |
| 2 | Database design and setup | Done |
| 3 | Backend config and DB connection | Done |
| 4 | CRUD endpoints | In progress |
| 5 | Manual API testing | Pending |
| 6 | Frontend scaffold | Pending |
| 7 | UI for create and list | Pending |
| 8 | Full frontend-backend wiring | Pending |
| 9 | Price history support | Pending |
| 10 | Background checks and notifications | Pending |

---

## MVP definition

The MVP is done when:

- a flight watch can be created through the frontend
- it gets saved to PostgreSQL through the FastAPI backend
- the list loads and shows all saved watches
- individual records can be updated and deleted
- changes are visible directly in the database

Everything after that is an extension.

---

## What is intentionally not here yet

- authentication or user accounts
- real flight pricing API integration
- background job scheduling
- email or Telegram alerts
- Docker setup (will add once the core works)
- Alembic migrations (using plain SQL scripts for now)

---

## Docs

- [Database design](docs/database-instruction.md)
- [Backend build guide](docs/backend-instruction.md)
- [Frontend build guide](docs/frontend-instruction.md)
