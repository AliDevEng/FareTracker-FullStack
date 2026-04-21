# FareTracker — Frontend

The React/TypeScript frontend for FareTracker. Built mobile-first with a custom component system, custom date picker, and real-time optimistic UI via TanStack Query.

---

## Tech

| | |
|---|---|
| Framework | React 19 + TypeScript |
| Build tool | Vite 8 |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui (base-nova) + custom |
| Data fetching | TanStack Query v5 |
| Forms | React Hook Form + Zod |
| Calendar | react-day-picker v9 |
| Date utils | date-fns |
| Icons | lucide-react |

---

## Structure

```
src/
├── api/
│   └── watches.ts              # typed fetch wrappers (GET, POST, PATCH, DELETE)
├── components/
│   ├── ui/
│   │   ├── date-picker.tsx     # custom calendar popover (react-day-picker)
│   │   ├── currency-select.tsx # SEK / EUR / GBP / USD dropdown
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   └── dialog.tsx
│   ├── FlightWatchForm.tsx     # create form
│   ├── FlightWatchList.tsx     # list + skeleton + empty state + stats
│   ├── FlightWatchCard.tsx     # card with quick toggle, price indicator, countdown
│   └── FlightWatchEditDialog.tsx
├── pages/
│   └── HomePage.tsx
├── types/
│   └── flight-watch.ts         # FlightWatch, CreateFlightWatchPayload, UpdateFlightWatchPayload
├── lib/
│   ├── schemas.ts              # Zod validation schema
│   └── utils.ts                # cn() helper
├── App.tsx
├── main.tsx                    # QueryClientProvider root
└── index.css                   # Tailwind + shadcn theme (indigo brand color)
```

---

## Running locally

Requires the backend running at `http://localhost:8000` (see root README).

```bash
npm install
cp .env.example .env    # VITE_API_URL=http://localhost:8000
npm run dev
```

App runs at `http://localhost:5173`.

---

## Key design decisions

**TanStack Query for all server state** — no manual loading/error booleans. Mutations automatically invalidate the `['watches']` query so the list always reflects the latest data without a page reload.

**React Hook Form + Zod** — validation runs at submit time, error messages come from the Zod schema, and form state stays out of the component tree.

**`Controller` for custom inputs** — the `DatePicker` and `CurrencySelect` components are uncontrolled under the hood, so they use `Controller` from react-hook-form instead of `register`.

**No global state library** — TanStack Query covers server state, `useState` covers local UI state (dialog open/close). That's enough.

---

## Environment

```env
VITE_API_URL=http://localhost:8000
```

---

## Scripts

```bash
npm run dev       # start dev server with HMR
npm run build     # type-check + Vite production build
npm run lint      # ESLint
npm run preview   # preview production build locally
```
