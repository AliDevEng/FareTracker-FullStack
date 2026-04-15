# Backend — Build Guide

The backend is a FastAPI application that sits in front of PostgreSQL. Its job is to validate input, talk to the database, and return clean JSON. That's it. No frontend concerns, no business logic living in route handlers long-term.

Build it in phases. Each phase should leave you with something that runs.

---

## Target folder structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py          ← app entry point, routers registered here
│   ├── database.py      ← engine, session, base
│   ├── models.py        ← SQLAlchemy ORM models
│   ├── schemas.py       ← Pydantic request/response schemas
│   ├── config.py        ← environment variable loading
│   ├── dependencies.py  ← shared FastAPI dependencies (e.g. get_db)
│   └── routes/
│       ├── __init__.py
│       └── watches.py   ← all /watches endpoints
├── sql/
│   ├── 001_create_flight_watches.sql
│   └── 002_seed_flight_watches.sql
├── tests/
├── requirements.txt
├── .env
├── .env.example
└── .gitignore
```

You don't need all of this on day one. Start simple and grow into it.

---

## Phase 1 — Set up the workspace ✓

Create the `backend/` folder and get the Python environment ready.

```bash
mkdir backend && cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
```

Create the `app/` package:

```bash
mkdir -p app/routes app/services sql tests
touch app/__init__.py app/routes/__init__.py
```

Add a `.gitignore` at minimum containing:

```
venv/
__pycache__/
*.pyc
.env
```

**Checkpoint:** the folder structure is in place and the virtual environment activates.

---

## Phase 2 — Install dependencies ✓

Create `requirements.txt`:

```
fastapi
uvicorn[standard]
sqlalchemy
psycopg2-binary
python-dotenv
pydantic[email]
```

Install:

```bash
pip install -r requirements.txt
```

**Checkpoint:** `pip freeze` shows all expected packages with no errors.

---

## Phase 3 — Environment configuration ✓

Create `.env`:

```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/fare_tracker
```

Create `.env.example` (safe to commit — no real credentials):

```env
DATABASE_URL=postgresql://user:password@localhost:5432/fare_tracker
```

Create `app/config.py`:

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str

    class Config:
        env_file = ".env"

settings = Settings()
```

Note: `pydantic-settings` is a separate package from Pydantic v2 — add it to `requirements.txt` if needed (`pydantic-settings`).

**Checkpoint:** `settings.database_url` returns the correct value when imported.

---

## Phase 4 — Database connection layer ✓

Create `app/database.py`:

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.config import settings

engine = create_engine(settings.database_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Base(DeclarativeBase):
    pass
```

Create `app/dependencies.py`:

```python
from app.database import SessionLocal

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

This dependency is injected into route functions. The session opens, the route runs, the session closes — regardless of whether the route succeeded or raised an exception.

**Checkpoint:** importing `database.py` and `dependencies.py` works without crashing.

---

## Phase 5 — The ORM model ✓

Create `app/models.py`:

```python
from sqlalchemy import Boolean, Column, Date, Integer, Numeric, String, TIMESTAMP, func
from app.database import Base

class FlightWatch(Base):
    __tablename__ = "flight_watches"

    id             = Column(Integer, primary_key=True, index=True)
    origin         = Column(String(100), nullable=False)
    destination    = Column(String(100), nullable=False)
    departure_date = Column(Date, nullable=False)
    return_date    = Column(Date, nullable=True)
    is_round_trip  = Column(Boolean, nullable=False, default=False)
    target_price   = Column(Numeric(10, 2), nullable=False)
    current_price  = Column(Numeric(10, 2), nullable=True)
    currency       = Column(String(10), nullable=False, default="SEK")
    is_active      = Column(Boolean, nullable=False, default=True)
    created_at     = Column(TIMESTAMP, server_default=func.now(), nullable=False)
    updated_at     = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now(), nullable=False)
```

This mirrors the `flight_watches` table from `database-instruction.md`. Column names match exactly — that matters for SQLAlchemy mapping.

**Checkpoint:** the model imports cleanly and reflects the database schema.

---

## Phase 6 — Pydantic schemas ✓

Three schemas cover the main cases: creating a watch, updating one, and returning one in a response.

Create `app/schemas.py`:

```python
from datetime import date, datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, field_validator

class FlightWatchCreate(BaseModel):
    origin: str
    destination: str
    departure_date: date
    return_date: Optional[date] = None
    is_round_trip: bool = False
    target_price: Decimal
    currency: str = "SEK"
    is_active: bool = True

    @field_validator("target_price")
    @classmethod
    def price_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError("target_price must be greater than 0")
        return v

class FlightWatchUpdate(BaseModel):
    origin: Optional[str] = None
    destination: Optional[str] = None
    departure_date: Optional[date] = None
    return_date: Optional[date] = None
    is_round_trip: Optional[bool] = None
    target_price: Optional[Decimal] = None
    currency: Optional[str] = None
    is_active: Optional[bool] = None

class FlightWatchResponse(BaseModel):
    id: int
    origin: str
    destination: str
    departure_date: date
    return_date: Optional[date]
    is_round_trip: bool
    target_price: Decimal
    current_price: Optional[Decimal]
    currency: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
```

`FlightWatchUpdate` uses all optional fields so a PATCH request can update only what changed.
`from_attributes = True` is what lets Pydantic serialize SQLAlchemy models directly.

**Checkpoint:** schemas validate and reject bad input (try a negative `target_price`).

---

## Phase 7 — App entry point ✓

Create `app/main.py`:

```python
from fastapi import FastAPI
from app.routes import watches

app = FastAPI(title="FareTracker API", version="0.1.0")

app.include_router(watches.router, prefix="/watches", tags=["watches"])

@app.get("/")
def health_check():
    return {"status": "ok"}
```

Start the server:

```bash
uvicorn app.main:app --reload
```

**Checkpoint:** `http://localhost:8000/docs` opens and the `/` endpoint returns `{"status": "ok"}`.

---

## Phase 8 — CRUD routes ✓

Create `app/routes/watches.py`:

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app import models, schemas
from app.dependencies import get_db

router = APIRouter()

@router.post("/", response_model=schemas.FlightWatchResponse, status_code=status.HTTP_201_CREATED)
def create_watch(payload: schemas.FlightWatchCreate, db: Session = Depends(get_db)):
    watch = models.FlightWatch(**payload.model_dump())
    db.add(watch)
    db.commit()
    db.refresh(watch)
    return watch

@router.get("/", response_model=List[schemas.FlightWatchResponse])
def get_watches(db: Session = Depends(get_db)):
    return db.query(models.FlightWatch).all()

@router.get("/{watch_id}", response_model=schemas.FlightWatchResponse)
def get_watch(watch_id: int, db: Session = Depends(get_db)):
    watch = db.query(models.FlightWatch).filter(models.FlightWatch.id == watch_id).first()
    if not watch:
        raise HTTPException(status_code=404, detail="Watch not found")
    return watch

@router.patch("/{watch_id}", response_model=schemas.FlightWatchResponse)
def update_watch(watch_id: int, payload: schemas.FlightWatchUpdate, db: Session = Depends(get_db)):
    watch = db.query(models.FlightWatch).filter(models.FlightWatch.id == watch_id).first()
    if not watch:
        raise HTTPException(status_code=404, detail="Watch not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(watch, field, value)
    db.commit()
    db.refresh(watch)
    return watch

@router.delete("/{watch_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_watch(watch_id: int, db: Session = Depends(get_db)):
    watch = db.query(models.FlightWatch).filter(models.FlightWatch.id == watch_id).first()
    if not watch:
        raise HTTPException(status_code=404, detail="Watch not found")
    db.delete(watch)
    db.commit()
```

A few design decisions worth noting:
- `exclude_unset=True` in the PATCH route is important — it means only fields the client actually sent get updated.
- `DELETE` returns `204 No Content`, not `200`. That's the correct HTTP status for a successful deletion with no body.
- Every route that looks up by ID raises a `404` if nothing is found. The frontend should handle that.

**Checkpoint:** all five endpoints are visible in Swagger and can be called successfully.

---

## Phase 9 — Manual testing ✓

Before moving to the frontend, test every code path through Swagger UI (`/docs`) or Postman.

Scenarios to cover:

| Scenario | Expected result |
|---|---|
| POST valid watch | 201 with created record |
| POST with negative target_price | 422 validation error |
| POST with missing required field | 422 validation error |
| GET all watches | 200 with list |
| GET one existing watch | 200 with record |
| GET non-existing watch | 404 |
| PATCH one field on existing watch | 200 with updated record |
| PATCH non-existing watch | 404 |
| DELETE existing watch | 204, record gone |
| DELETE non-existing watch | 404 |

Run each one. If something behaves unexpectedly, fix it before moving on.

**Checkpoint:** every row in the table above has been manually verified.

---

## Phase 10 — Refactor before frontend ✓

Once the MVP routes all work, clean up before wiring up the frontend.

What's worth doing now:
- move inline DB logic into a `services/watches.py` module so routes just call service functions
- add `pytest` and write a few basic tests for create and delete
- add proper error messages instead of bare `"Watch not found"` strings
- double-check that `.env` is in `.gitignore` and never committed

What to skip for now:
- Alembic migrations (use SQL scripts while the schema is still changing)
- Docker (add it once the code itself works)
- authentication (no users yet)

---

## MVP complete when

- FastAPI starts without errors
- PostgreSQL is connected
- all five CRUD endpoints work
- input validation rejects bad data
- manual test coverage across all scenarios

---

## Suggested commits

```
chore: initialize backend structure and venv
chore: add backend dependencies
feat: add environment config and settings module
feat: add database connection layer
feat: add flight watch model
feat: add pydantic schemas for watch create, update, response
feat: add app entry point and health check
feat: add watch CRUD routes
test: manual verification of all CRUD endpoints
```
