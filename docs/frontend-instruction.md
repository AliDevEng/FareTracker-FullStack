# Frontend — Build Guide

The frontend is a React + TypeScript app built with Vite. It uses Tailwind CSS for styling, shadcn/ui for components, TanStack Query for server state, and React Hook Form + Zod for form handling.

Build this after the backend CRUD is working. The frontend should not contain validation logic that belongs in the API, and it should not make assumptions about database structure.

---

## Stack

| Layer | Library |
|---|---|
| Build tool | Vite |
| UI framework | React 18 + TypeScript |
| Styling | Tailwind CSS |
| Component library | shadcn/ui (Radix UI + Tailwind) |
| Server state | TanStack Query v5 |
| Forms | React Hook Form + Zod |

---

## Target folder structure

```
frontend/
├── src/
│   ├── api/
│   │   └── watches.ts           ← all backend API calls live here
│   ├── components/
│   │   ├── ui/                  ← shadcn/ui generated components
│   │   ├── FlightWatchForm.tsx
│   │   ├── FlightWatchList.tsx
│   │   └── FlightWatchCard.tsx
│   ├── pages/
│   │   └── HomePage.tsx
│   ├── types/
│   │   └── flight-watch.ts      ← shared TypeScript types
│   ├── lib/
│   │   └── utils.ts             ← shadcn/ui utility (cn helper)
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css                ← Tailwind directives
├── public/
├── components.json              ← shadcn/ui config
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
```

Add a `.env` file:

```env
VITE_API_URL=http://localhost:8000
```

And `.env.example`:

```env
VITE_API_URL=http://localhost:8000
```

**Checkpoint:** `npm run dev` starts and the default Vite page is visible at `http://localhost:5173`.

---

## Phase 2 — Install and configure Tailwind CSS

```bash
npm install -D tailwindcss @tailwindcss/vite
```

In `vite.config.ts`, add the Tailwind plugin:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

Replace the contents of `src/index.css` with just:

```css
@import "tailwindcss";
```

Make sure `main.tsx` imports `index.css`.

**Checkpoint:** Add `className="text-blue-500"` to any element and confirm the color applies.

---

## Phase 3 — Configure path alias (required for shadcn/ui)

shadcn/ui imports from `@/components/...`. Set up the alias.

Install `@types/node`:

```bash
npm install -D @types/node
```

Update `vite.config.ts`:

```ts
import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
```

Update `tsconfig.app.json` — add under `compilerOptions`:

```json
"baseUrl": ".",
"paths": {
  "@/*": ["./src/*"]
}
```

**Checkpoint:** `import { something } from "@/lib/utils"` resolves without a TypeScript error.

---

## Phase 4 — Install and configure shadcn/ui

```bash
npx shadcn@latest init
```

When prompted:
- Style: Default
- Base color: Slate (or your preference)
- CSS variables: Yes

This creates `components.json` and sets up `src/lib/utils.ts` and `src/index.css`.

Add your first component to test the setup:

```bash
npx shadcn@latest add button card badge input label
```

**Checkpoint:** Import `<Button>` from `@/components/ui/button` and render it — it should appear styled.

---

## Phase 5 — Install TanStack Query, React Hook Form, and Zod

```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
npm install react-hook-form @hookform/resolvers zod
```

Wrap the app with `QueryClientProvider` in `src/main.tsx`:

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import './index.css'
import App from './App.tsx'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>,
)
```

**Checkpoint:** The app still runs. The TanStack Query Devtools panel is visible in the bottom corner.

---

## Phase 6 — Clean the starter project

Strip out Vite boilerplate:

- Remove content from `App.css` (or delete it)
- Remove the default counter demo from `App.tsx`
- Keep `main.tsx` as-is

```tsx
// App.tsx after cleanup
function App() {
  return (
    <main className="min-h-screen bg-background p-8">
      <h1 className="text-3xl font-bold">FareTracker</h1>
    </main>
  )
}

export default App
```

**Checkpoint:** App runs, shows the heading with Tailwind styles, no console errors.

---

## Phase 7 — Define TypeScript types

Create `src/types/flight-watch.ts`. This type mirrors what the backend returns.

```typescript
export interface FlightWatch {
  id: number
  origin: string
  destination: string
  departure_date: string
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

**Checkpoint:** No TypeScript errors when importing these types.

---

## Phase 8 — Define Zod schemas for forms

Create `src/lib/schemas.ts`. These drive form validation and are derived from the TypeScript types.

```typescript
import { z } from "zod"

export const createWatchSchema = z.object({
  origin: z.string().min(2, "Origin is required"),
  destination: z.string().min(2, "Destination is required"),
  departure_date: z.string().min(1, "Departure date is required"),
  return_date: z.string().nullable().optional(),
  is_round_trip: z.boolean(),
  target_price: z.coerce.number().positive("Price must be greater than 0"),
  currency: z.string().min(1),
  is_active: z.boolean(),
})

export type CreateWatchFormValues = z.infer<typeof createWatchSchema>
```

**Checkpoint:** `z.infer<typeof createWatchSchema>` matches `CreateFlightWatchPayload`.

---

## Phase 9 — API layer

Create `src/api/watches.ts`. This is the only file that talks to the backend.

```typescript
import type { FlightWatch, CreateFlightWatchPayload, UpdateFlightWatchPayload } from "@/types/flight-watch"

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

**Checkpoint:** Importing `getWatches` and calling it returns real data from the backend.

---

## Phase 10 — Build the watch list with TanStack Query

Create `src/components/FlightWatchList.tsx`.

Use `useQuery` instead of `useEffect + useState`:

```tsx
import { useQuery } from "@tanstack/react-query"
import { getWatches } from "@/api/watches"
import FlightWatchCard from "./FlightWatchCard"

export default function FlightWatchList() {
  const { data: watches, isLoading, isError } = useQuery({
    queryKey: ["watches"],
    queryFn: getWatches,
  })

  if (isLoading) return <p className="text-muted-foreground">Loading watches...</p>
  if (isError) return <p className="text-destructive">Failed to load watches.</p>
  if (!watches?.length) return <p className="text-muted-foreground">No watches yet. Add one above.</p>

  return (
    <div className="grid gap-4">
      {watches.map(watch => (
        <FlightWatchCard key={watch.id} watch={watch} />
      ))}
    </div>
  )
}
```

**Checkpoint:** The list loads and shows all records from the database.

---

## Phase 11 — Build the watch card

Create `src/components/FlightWatchCard.tsx` using shadcn/ui `Card` and `Badge`.

Show at minimum:
- origin → destination
- departure date (and return date if present)
- target price and currency
- current price or "Not checked yet"
- active status badge
- delete button

**Checkpoint:** Each watch displays all key fields, delete removes it from the list.

---

## Phase 12 — Build the create form with React Hook Form

Create `src/components/FlightWatchForm.tsx`.

Use `useForm` with the Zod resolver and `useMutation` to submit:

```tsx
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createWatch } from "@/api/watches"
import { createWatchSchema, CreateWatchFormValues } from "@/lib/schemas"

export default function FlightWatchForm() {
  const queryClient = useQueryClient()

  const form = useForm<CreateWatchFormValues>({
    resolver: zodResolver(createWatchSchema),
    defaultValues: {
      origin: "",
      destination: "",
      departure_date: "",
      return_date: null,
      is_round_trip: false,
      target_price: 0,
      currency: "SEK",
      is_active: true,
    },
  })

  const mutation = useMutation({
    mutationFn: createWatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watches"] })
      form.reset()
    },
  })

  const onSubmit = (values: CreateWatchFormValues) => {
    mutation.mutate(values)
  }

  // render form using shadcn/ui Input, Label, Button, etc.
}
```

`invalidateQueries` tells TanStack Query to refetch the list after a successful create — no manual state management needed.

**Checkpoint:** Submitting the form creates a record and the list refreshes automatically.

---

## Phase 13 — Add edit capability

For edit, use `useMutation` with `updateWatch` and pre-fill the form with the existing record's values.

The simplest approach: a dialog (shadcn/ui `Dialog`) triggered from the card, with `FlightWatchForm` pre-filled.

**Checkpoint:** Changing the target price saves correctly and the card reflects the update.

---

## Phase 14 — Wire up delete

In `FlightWatchCard`, use `useMutation` with `deleteWatch`:

```tsx
const deleteMutation = useMutation({
  mutationFn: deleteWatch,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["watches"] })
  },
})
```

**Checkpoint:** Deleting a watch removes it from the UI and from the database.

---

## Phase 15 — Structure for later features

Before moving to background jobs and notifications:

- the `api/` layer should be easy to extend with new endpoints
- the `types/` file should be easy to expand with `PriceHistory` and `Notification` interfaces
- TanStack Query keys should be centralised so refetching is easy to coordinate
- component structure should support adding a price history chart per watch later

---

## Phase 16 — Add query key and API structure for growth

The frontend already has working CRUD. The next step is making state management easier to extend before more features arrive.

Add a small query key module:

```ts
// src/lib/query-keys.ts
export const queryKeys = {
  watches: ['watches'] as const,
  watchHistory: (watchId: number) => ['watches', watchId, 'history'] as const,
}
```

Then clean up the API layer:
- keep `src/api/watches.ts` focused on watch CRUD and watch-specific actions
- add future API functions in predictable files instead of one giant module
- standardise error handling so components don't invent their own strings everywhere

This is a small refactor, but it pays off once history, manual checks, and notifications are added.

**Checkpoint:** all components use shared query keys, and invalidation stays consistent across create, edit, delete, and toggle actions.

---

## Phase 17 — Add manual "check price now" UI

When the backend exposes `POST /watches/{watch_id}/check-price`, the frontend should support it directly from each card.

Add in `src/api/watches.ts`:

```ts
export async function checkWatchPrice(id: number) {
  const res = await fetch(`${BASE_URL}/watches/${id}/check-price`, {
    method: 'POST',
  })
  if (!res.ok) throw new Error('Failed to check price')
  return res.json()
}
```

Then in `FlightWatchCard.tsx`:
- add a `Check now` button
- use `useMutation`
- disable the button while the request is running
- invalidate the watch list and history queries on success

This lets users trigger one immediate price refresh instead of waiting for a scheduled backend check later.

**Checkpoint:** clicking `Check now` updates the card's current price and any price delta badges after the mutation succeeds.

---

## Phase 18 — Add per-watch price history UI

Once the backend exposes history endpoints, the next frontend phase is surfacing that data clearly.

Start with types:

```ts
export interface PriceHistoryPoint {
  id: number
  flight_watch_id: number
  price: number
  currency: string
  checked_at: string
  source_name: string | null
}
```

Then add:
- `getWatchHistory(watchId: number, limit?: number)` in the API layer
- a query per watch using a dedicated history key
- a compact expandable section or dialog attached to each card

Do not overbuild the visualization at first. A readable list of timestamps and prices is enough before adding charts.

**Checkpoint:** opening a watch's history shows recent price points from the backend without affecting the rest of the page.

---

## Phase 19 — Add charting for price trends

After the raw history list works, make it visual.

Keep the first version simple:
- one lightweight chart component
- one line per watch
- x-axis = `checked_at`
- y-axis = `price`

Good placement options:
- inline expand area below a card
- dialog opened from the card

Important UX details:
- show a loading state for the chart
- show an empty state if there is no history yet
- format prices with the watch currency
- avoid visual clutter on mobile

The chart should help answer one question quickly: is the fare moving toward or away from the target?

**Checkpoint:** a user can open a watch and instantly understand the recent price trend visually.

---

## Phase 20 — Improve filtering and sorting

Once users track more than a few routes, the list needs controls.

Add lightweight filters above `FlightWatchList`:
- active vs paused
- currency
- departure date ordering
- price status such as `below target`, `above target`, `not checked`

Keep this as UI state local to the page unless a clear reason appears to persist it.

This should work on top of TanStack Query data already in memory. No new backend endpoint is needed for the first version.

**Checkpoint:** a user with many watches can quickly narrow the list to the routes that matter right now.

---

## Phase 21 — Notification and status surfaces

When the backend starts sending alerts, the frontend should expose that state in a helpful but lightweight way.

Examples:
- last checked timestamp on each card
- last alert sent indicator
- small badge when a watch is currently under target
- optional notification preferences section later

This is also a good point to add richer status messaging:
- `checking now`
- `price dropped`
- `paused`
- `not yet checked`
- `backend unavailable`

These states help the app feel alive once background checks start running.

**Checkpoint:** a user can tell whether a watch has been checked recently and whether it has already triggered an alert.

---

## Next frontend milestone complete when

- query keys and API modules are organized for growth
- users can trigger a manual price check from the UI
- each watch can show its own price history
- price history can be visualized as a trend
- the list is easier to scan with filtering and clearer status states

---

## MVP complete when

- the app starts without errors
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
- global state management (Redux, Zustand) — TanStack Query covers server state
- optimistic UI updates

---

## Suggested commits

```
chore: initialize frontend app with Vite and React TS
chore: add Tailwind CSS
chore: configure path alias and shadcn/ui
feat: add TanStack Query and React Hook Form setup
chore: clean starter boilerplate
feat: add flight watch TypeScript types and Zod schemas
feat: add watch API module
feat: add watch list with TanStack Query
feat: add watch card component
feat: add create watch form with React Hook Form
feat: add edit and delete for watches
```
