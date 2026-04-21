<h1 align="center">✈️ FareTracker</h1>

<p align="center">
  <strong>Stop refreshing Skyscanner at 2am. Let the robots do it.</strong><br/>
  A fullstack flight price tracker — set a target, walk away, get notified when fares drop.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat-square&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/status-in_development-F59E0B?style=flat-square" />
  <img src="https://img.shields.io/badge/portfolio_project-yes-6366F1?style=flat-square" />
</p>

---

## 🤔 Why does this exist?

I fly between a handful of cities semi-regularly. My usual workflow was:

1. Open Skyscanner
2. Check the price
3. Close the tab
4. Reopen it 20 minutes later hoping it dropped
5. Repeat until I either bought the ticket or gave up

There's a better way. FareTracker lets you say *"I want to fly CPH → BCN in June, and I'm not paying more than 2,500 SEK"* — and then just... forget about it. The app watches the route and flags it when the price hits your target.

It's also my end-to-end portfolio project. Everything from PostgreSQL schema design to REST API to a pixel-polished React frontend — built the way a real codebase should be: structured, typed, tested, and actually useful.

---

## 🎯 What it does

### Right now ✅

- 🗂️ **Create flight watches** — set origin, destination, dates, target price, and currency
- 👀 **Track multiple routes** — CPH→BCN, ARN→JFK, whatever you need
- ✏️ **Full CRUD** — edit or remove any watch at any time
- ⏸️ **Active / Paused toggle** — pause a watch without deleting it (one click on the badge)
- 💰 **Price comparison** — see current price vs your target, with a `18% below` / `8% above` indicator
- ⏱️ **Days until flight** countdown on every card
- 💱 **Multi-currency** — SEK, EUR, GBP, USD
- 🗓️ **Custom date picker** — no ugly browser chrome, a proper calendar component

### Coming soon 🛠️

- 🌐 Live flight pricing API integration
- 🔄 Background scheduler to check prices automatically
- 📬 Email / Telegram alerts when a price drops below target
- 📈 Price history charts per route
- 🔐 User accounts and authentication
- 🐳 Docker Compose setup

---

## 🏗️ Tech stack

| Layer | Tech |
|---|---|
| **API** | Python 3.11+, FastAPI, Uvicorn |
| **ORM / DB** | SQLAlchemy, Pydantic v2, PostgreSQL |
| **Frontend** | React 19, TypeScript, Vite |
| **Styling** | Tailwind CSS v4, shadcn/ui |
| **State** | TanStack Query (server state), React Hook Form + Zod |
| **Calendar** | react-day-picker |
| **Tests** | pytest (12 tests, backend service layer) |

---

## 🚀 Getting started

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL running locally

### 1. Clone the repo

```bash
git clone https://github.com/AliDevEng/FareTracker-FullStack.git
cd FareTracker-FullStack
```

### 2. Database

```bash
psql -U postgres -c "CREATE DATABASE fare_tracker;"
psql -U postgres -d fare_tracker -f backend/sql/001_create_flight_watches.sql
psql -U postgres -d fare_tracker -f backend/sql/002_seed_flight_watches.sql
```

### 3. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env           # fill in your DATABASE_URL
uvicorn app.main:app --reload
```

API live at → `http://localhost:8000`  
Interactive docs at → `http://localhost:8000/docs` 🎉

### 4. Frontend

```bash
cd frontend
npm install
cp .env.example .env           # already points to localhost:8000
npm run dev
```

App live at → `http://localhost:5173`

---

## 🗂️ Project structure

```
FareTracker-FullStack/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI entry point
│   │   ├── models.py            # SQLAlchemy ORM models
│   │   ├── schemas.py           # Pydantic request/response schemas
│   │   ├── routes/watches.py    # CRUD endpoints
│   │   ├── services/watches.py  # database logic layer
│   │   ├── config.py            # environment config
│   │   ├── database.py          # engine + session
│   │   └── dependencies.py      # get_db dependency
│   ├── sql/                     # migration scripts
│   ├── tests/                   # pytest suite (12 tests)
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/          # FlightWatchCard, Form, List, EditDialog
│   │   │   └── ui/              # DatePicker, CurrencySelect, shadcn/ui
│   │   ├── pages/HomePage.tsx
│   │   ├── api/watches.ts       # typed API client
│   │   ├── types/               # TypeScript interfaces
│   │   └── lib/                 # Zod schemas, utils
│   └── package.json
│
└── docs/                        # architecture notes
```

---

## 🧪 Running tests

```bash
cd backend
pytest tests/ -v
```

12 tests covering the full service layer — create, read, update, delete, edge cases.

---

## 📍 Roadmap

| Phase | What | Status |
|---|---|---|
| 1 | Repo structure | ✅ Done |
| 2 | Database design | ✅ Done |
| 3 | Backend config + DB connection | ✅ Done |
| 4 | CRUD endpoints | ✅ Done |
| 5 | Manual API testing | ✅ Done |
| 6 | Frontend scaffold | ✅ Done |
| 7 | UI — create, list, edit, delete | ✅ Done |
| 8 | Frontend ↔ backend wiring | ✅ Done |
| 9 | Price history + charting | 🔜 Next |
| 10 | Background checks + alerts | 🔜 Planned |
| 11 | Auth + user accounts | 🔜 Planned |
| 12 | Docker Compose | 🔜 Planned |

---

## 👨‍💻 About

Built by **Ali Rezai** — Fullstack student graduating in 2026, building real things with real stacks.  
This project is part of my portfolio. If you're a recruiter or engineer reading this: hi! 👋

Feel free to open an issue, fork it, or just snoop around the code.

---

<p align="center">Made with ☕ and mild frustration at airline pricing algorithms</p>
