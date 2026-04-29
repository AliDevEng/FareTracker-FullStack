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

## Phase 11 — Add price history persistence

The next backend feature should start in the database, not the routes.

Create a new SQL script: `backend/sql/003_create_price_history.sql`

```sql
CREATE TABLE IF NOT EXISTS price_history (
    id               INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    flight_watch_id  INTEGER NOT NULL REFERENCES flight_watches(id) ON DELETE CASCADE,
    price            NUMERIC(10,2) NOT NULL CHECK (price > 0),
    currency         VARCHAR(10) NOT NULL,
    checked_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    source_name      VARCHAR(100) NULL
);
```

Then add:
- a `PriceHistory` ORM model in `app/models.py`
- response schemas in `app/schemas.py`
- a small service module or helper functions for writing and reading history rows

Do not add chart endpoints yet. The backend goal here is just to persist historical checks cleanly.

**Checkpoint:** you can insert a price history row for a watch and fetch it back through SQLAlchemy.

---

## Phase 12 — Introduce a price-checking provider layer

Before wiring in a real API, create a provider abstraction so the rest of the backend doesn't care where prices come from.

Suggested structure:

```
app/
├── providers/
│   ├── __init__.py
│   └── flights.py
└── services/
    ├── watches.py
    └── price_checks.py
```

In `providers/flights.py`, define one simple interface:

```python
from decimal import Decimal
from typing import TypedDict

class PriceCheckResult(TypedDict):
    price: Decimal
    currency: str
    source_name: str

def get_latest_price(origin: str, destination: str, departure_date, return_date=None) -> PriceCheckResult:
    ...
```

Start with a fake implementation if needed. The important thing is separating:
- provider call
- watch update logic
- history write logic

**Checkpoint:** one service function can fetch a price from the provider and return normalized data without touching the route layer.

---

## Phase 13 — Add a "check price now" backend flow

Once the provider layer exists, add a service that performs a full price check for one watch:

1. load the watch
2. fetch the latest price from the provider
3. update `flight_watches.current_price`
4. insert a `price_history` row
5. return the updated watch plus check metadata

Expose that through a dedicated endpoint instead of overloading PATCH:

```python
POST /watches/{watch_id}/check-price
```

This should be an action endpoint, not a generic update endpoint, because it represents a backend operation with side effects.

Keep route handlers thin:
- route validates the request
- service performs the workflow
- route maps missing watches to `404`

**Checkpoint:** calling the endpoint updates `current_price` and creates one matching `price_history` record.

---

## Phase 14 — Expose history endpoints

Once price checks are stored, make the data available to the frontend.

Suggested endpoints:

```python
GET /watches/{watch_id}/history
GET /watches/{watch_id}/history?limit=30
```

Response shape should be simple:
- watch id
- list of historical price points ordered by `checked_at`

Good defaults:
- newest first in the database query
- reverse in the response only if the frontend chart wants oldest first
- optional `limit` so the endpoint stays lightweight

This is enough for charting later without committing to a chart library now.

**Checkpoint:** the frontend can request one watch's price history and receive a clean JSON list.

---

## Phase 15 — Background scheduler for active watches

Manual checks are useful for development. The real feature is automated checks.

Add a scheduler layer that:
- runs on an interval
- loads all `is_active = TRUE` watches
- skips watches that already departed
- calls the price-check service for each watch
- logs failures without crashing the whole run

Keep this logic out of FastAPI route handlers. A separate module such as `app/jobs/price_monitor.py` is a better fit.

Use a lightweight scheduler first. APScheduler is a reasonable option once you're ready to install it.

Important design rule:
- the scheduler should call the same service function as `POST /watches/{watch_id}/check-price`

That way there is one source of truth for price-check behavior.

**Checkpoint:** one scheduled run can process all active watches and persist results without manual API calls.

---

## Phase 16 — Notification pipeline

After scheduled checks work, add alerts when a price drops to or below the user's target.

This is where the `notifications` table planned in `database-instruction.md` becomes real.

Add:
- `backend/sql/004_create_notifications.sql`
- a `Notification` ORM model
- a notification service that records send attempts
- a delivery adapter per channel (email first, Telegram later if wanted)

The alert rule should live in the service layer:

```text
if current_price <= target_price and watch is active:
    create and send notification
```

Do not send alerts directly from route handlers. Notifications should happen as a consequence of the price-check workflow.

Also decide early whether repeated alerts are allowed:
- alert every qualifying check
- or only alert the first time a watch crosses below target

Both are valid, but the project should choose intentionally.

**Checkpoint:** a qualifying price check creates a notification record and sends one real or mocked alert.

---

## Next backend milestone complete when

- price history is stored in its own table
- one watch can be checked on demand through the API
- active watches can be processed automatically on a schedule
- target-price alerts are persisted and delivered through at least one channel

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
