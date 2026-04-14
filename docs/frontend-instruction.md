# Frontend — Build Guide

The frontend is a React + TypeScript app built with Vite. Its job is to let the user manage flight watches through a UI that talks to the FastAPI backend.

Build this after the backend CRUD is working. The frontend should not contain validation logic that belongs in the API, and it should not make assumptions about database structure.

---

## Target folder structure

```
frontend/
├── src/
│   ├── api/
│   │   └── watches.ts       ← all backend API calls live here
│   ├── components/
│   │   ├── FlightWatchForm.tsx
│   │   ├── FlightWatchList.tsx
│   │   └── FlightWatchCard.tsx
│   ├── pages/
│   │   └── HomePage.tsx
│   ├── types/
│   │   └── flight-watch.ts  ← shared TypeScript types
│   ├── App.tsx
│   ├── main.tsx
│   └── styles/
├── public/
├── .env
├── .env.example
└── package.json
```

---

## Phase 1 — Scaffold the app

```bash
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
npm run dev
```

Confirm the default Vite page loads at `http://localhost:5173` before touching anything else.

Add a `.env` file:

```env
VITE_API_URL=http://localhost:8000
```

And `.env.example`:

```env
VITE_API_URL=http://localhost:8000
```

**Checkpoint:** dev server starts and the default page is visible.

---

## Phase 2 — Clean the starter project

The default Vite template includes boilerplate that gets in the way. Strip it down:

- delete the default CSS content or replace with a minimal reset
- remove the counter demo from `App.tsx`
- keep `main.tsx` as-is (it just mounts the app)
- keep the folder structure clean and intentional from the start

```tsx
// App.tsx after cleanup
function App() {
  return (
    <div>
      <h1>FareTracker</h1>
    </div>
  )
}

export default App
```

**Checkpoint:** the app still runs with no console errors and the cleaned-up page is visible.

---

## Phase 3 — Define TypeScript types

Create `src/types/flight-watch.ts`. This type should match what the backend returns.

```typescript
export interface FlightWatch {
  id: number
  origin: string
  destination: string
  departure_date: string   // ISO date string, e.g. "2026-07-10"
  return_date: string | null
  is_round_trip: boolean
  target_price: number
  current_price: number | null
  currency: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateFlightWatchPayload {
  origin: string
  destination: string
  departure_date: string
  return_date?: string | null
  is_round_trip: boolean
  target_price: number
  currency: string
  is_active: boolean
}

export interface UpdateFlightWatchPayload {
  origin?: string
  destination?: string
  departure_date?: string
  return_date?: string | null
  is_round_trip?: boolean
  target_price?: number
  currency?: string
  is_active?: boolean
}
```

Having these types here means every component that touches watch data is typed from one source.

**Checkpoint:** no TypeScript errors when importing these types into a component.

---

## Phase 4 — API layer

Create `src/api/watches.ts`. This is the only file that talks to the backend.

```typescript
import { FlightWatch, CreateFlightWatchPayload, UpdateFlightWatchPayload } from "../types/flight-watch"

const BASE_URL = import.meta.env.VITE_API_URL

export async function getWatches(): Promise<FlightWatch[]> {
  const res = await fetch(`${BASE_URL}/watches/`)
  if (!res.ok) throw new Error("Failed to fetch watches")
  return res.json()
}

export async function createWatch(data: CreateFlightWatchPayload): Promise<FlightWatch> {
  const res = await fetch(`${BASE_URL}/watches/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Failed to create watch")
  return res.json()
}

export async function updateWatch(id: number, data: UpdateFlightWatchPayload): Promise<FlightWatch> {
  const res = await fetch(`${BASE_URL}/watches/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Failed to update watch")
  return res.json()
}

export async function deleteWatch(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/watches/${id}`, { method: "DELETE" })
  if (!res.ok) throw new Error("Failed to delete watch")
}
```

Keeping all API calls in one place means if the base URL changes or you swap to Axios later, there's exactly one file to update.

**Checkpoint:** importing `getWatches` in a component and calling it returns real data from the backend.

---

## Phase 5 — Build the create form

Create `src/components/FlightWatchForm.tsx`.

Fields to include:
- origin (text)
- destination (text)
- departure date (date input)
- return date (date input, optional)
- round trip (checkbox)
- target price (number)
- currency (text, pre-filled with "SEK")
- active (checkbox, defaults to true)

Keep the form controlled — manage values in state with `useState`. On submit, call `createWatch` from the API layer.

```tsx
// rough structure
const [form, setForm] = useState<CreateFlightWatchPayload>({
  origin: "",
  destination: "",
  departure_date: "",
  return_date: null,
  is_round_trip: false,
  target_price: 0,
  currency: "SEK",
  is_active: true,
})

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  await createWatch(form)
  onSuccess()  // callback to refresh the list
}
```

**Checkpoint:** submitting the form creates a record in the database (verify in Swagger or psql).

---

## Phase 6 — Build the watch list

Create `src/components/FlightWatchList.tsx`.

Fetch watches on mount using `useEffect` and render each one in a card or row.

Show at minimum:
- origin → destination
- departure date (and return date if it exists)
- target price and currency
- current price if not null, otherwise "not checked yet"
- active status (a badge or label works fine)

```tsx
useEffect(() => {
  getWatches().then(setWatches).catch(console.error)
}, [])
```

**Checkpoint:** the list loads and shows all records from the database. Adding a new watch through the form and refreshing shows it in the list.

---

## Phase 7 — Add edit capability

For the MVP, the simplest approach is to reuse `FlightWatchForm` and pre-fill it with the existing record's values when editing.

Alternatively, render a small inline form inside the card. Either approach works at this stage — pick the one that feels cleaner to you.

When the user saves, call `updateWatch(id, changedFields)`. Then refresh the list.

**Checkpoint:** changing the target price on an existing watch saves correctly and reflects in the list.

---

## Phase 8 — Add delete

Add a delete button to each watch card. On click, call `deleteWatch(id)` and remove the item from the list.

A basic confirmation — even just `window.confirm` — is fine for now.

```tsx
const handleDelete = async (id: number) => {
  if (!window.confirm("Remove this watch?")) return
  await deleteWatch(id)
  setWatches(prev => prev.filter(w => w.id !== id))
}
```

**Checkpoint:** deleting a watch removes it from the UI and from the database.

---

## Phase 9 — UX improvements

After the full CRUD flow works, these are worth adding before calling the frontend done:

- loading state while fetching (`isLoading` boolean in state)
- empty state message when the list has no records
- error message when a fetch or submit fails
- reset the create form after a successful submit
- disable the submit button while a request is in-flight

None of these require a library. Keep it simple.

**Checkpoint:** the app feels predictable and gives feedback when something is happening.

---

## Phase 10 — Structure for later features

Before moving on to background jobs and notifications, make sure the frontend structure won't block future additions:

- the `api/` layer should be easy to extend with new endpoints
- the `types/` file should be easy to expand with `PriceHistory` and `Notification` interfaces when needed
- the component structure should support adding a price history chart per watch later

Don't build those things now. Just don't build in a way that makes them painful to add.

---

## MVP complete when

- the app starts
- the create form submits and the record appears in the list
- editing a watch updates it correctly
- deleting a watch removes it
- loading and error states are handled
- no console errors during normal use

---

## What to skip for now

- React Router / multi-page navigation
- authentication screens
- charts and analytics
- global state management (Redux, Zustand) — component state is enough for now
- Tailwind — plain CSS or inline styles are fine until the core works
- optimistic UI updates

---

## Suggested commits

```
chore: initialize frontend app with Vite and React TS
chore: clean starter boilerplate
feat: add flight watch TypeScript types
feat: add watch API module
feat: add create watch form
feat: add watch list with fetch on mount
feat: add edit and delete for watches
feat: add loading, error, and empty states
```
