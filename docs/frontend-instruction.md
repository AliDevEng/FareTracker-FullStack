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
