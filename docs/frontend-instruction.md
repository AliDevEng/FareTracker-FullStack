# Frontend Instruction

This document explains how to build the frontend in phases. The frontend should stay focused on user interaction, page state, and calling the backend API.

Do not put business rules that belong in the backend into the frontend.

---

## Frontend Goal

Build a small frontend that can:

- create a flight watch
- display saved watches
- edit a watch
- delete a watch
- communicate with the backend cleanly

The first version should be minimal and functional. Styling can stay simple.

---

## Recommended Frontend Folder Structure

```text
frontend/
├── src/
│   ├── api/
│   │   └── watches.ts
│   ├── components/
│   │   ├── FlightWatchForm.tsx
│   │   ├── FlightWatchList.tsx
│   │   └── FlightWatchCard.tsx
│   ├── pages/
│   │   └── HomePage.tsx
│   ├── types/
│   │   └── flight-watch.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── styles/
├── public/
├── package.json
└── .env
```

This does not need to be perfect on day one, but it should move in this direction.

---

## Phase 1 — Create the Frontend App

### What to do
- Create the `frontend` folder
- Initialize a React project with TypeScript
- Prefer Vite for a lightweight setup
- Confirm that the app starts locally

### Checkpoint
- the dev server runs
- the default page opens in the browser

---

## Phase 2 — Clean the Starter Project

### What to do
Remove unnecessary starter code so the project becomes easier to understand.

### Keep only what you need
- root app
- one page
- one styles entry
- clear folder naming

### Checkpoint
- the app still runs
- the folder structure looks intentional

---

## Phase 3 — Define Frontend Types

### What to do
Create a shared type or interface for the flight watch object that matches backend responses.

### Include MVP fields
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

### Why this matters
This keeps your frontend predictable and easier to refactor.

### Checkpoint
- components can use typed props cleanly

---

## Phase 4 — Create API Layer

### What to do
Create a small API module dedicated to watch-related requests.

### Responsibilities of the API layer
- create watch
- fetch all watches
- fetch one watch if needed
- update watch
- delete watch

### Separation of concern
Do not call `fetch` directly from every component if you can avoid it.
Centralize backend communication.

### Checkpoint
- all backend requests can be triggered from one API module

---

## Phase 5 — Build the Create Form

### What to build
A simple form for creating a flight watch.

### Inputs to include
- origin
- destination
- departure date
- optional return date
- round trip toggle
- target price
- currency
- active status

### UX guidance
Keep it plain and readable.
Validation can be basic at first.

### Checkpoint
- the user can fill out the form
- submit triggers a backend create request

---

## Phase 6 — Build the Watch List

### What to build
A list that displays saved flight watches.

### Show at minimum
- route summary, such as origin to destination
- departure date
- optional return date
- target price
- current price if available
- active status

### Goal
The user should immediately see whether create and read are working.

### Checkpoint
- the list loads from the backend and renders records

---

## Phase 7 — Add Edit Capability

### What to do
Allow the user to update an existing watch.

### Simple approach
Use one of these:
- inline edit
- modal later
- reuse the create form for editing

For MVP, choose the simplest option.

### Checkpoint
- the user can update at least one field and save the change
- the list refreshes correctly

---

## Phase 8 — Add Delete Capability

### What to do
Allow the user to remove a watch.

### UX note
Use a simple button with a confirmation step if you want, but keep it minimal.

### Checkpoint
- delete request succeeds
- the watch disappears from the list

---

## Phase 9 — Improve Basic UX

Only do this after CRUD flow works.

### Good small improvements
- loading state
- error state
- empty state
- success message after create or update
- form reset after successful create

### Avoid overbuilding
Do not redesign the whole app before functionality works.

### Checkpoint
The application feels understandable and usable.

---

## Phase 10 — Prepare the Frontend for Future Features

### What to prepare for later
- filter by active status
- sort watches
- show last checked time
- show price history
- show alert badge when target reached

### Important
Do not implement all of these now. Just keep the structure open to them.

### End-of-phase outcome
You have a frontend that is simple, clean, and connected to a real backend.

---

## MVP Frontend Definition

The frontend MVP is complete when:

- the app starts
- the create form works
- the list loads watches from the backend
- update works
- delete works
- the UI reflects backend data correctly

---

## What Not to Build Yet

Do not add these before the MVP works:

- authentication screens
- advanced routing
- dashboard analytics
- charts
- design system complexity
- dark mode toggles
- optimistic updates unless you understand them well

---

## Suggested Commit Milestones

- `chore: initialize frontend app`
- `chore: clean starter structure`
- `feat: add flight watch types`
- `feat: add watch API module`
- `feat: add create watch form`
- `feat: add watch list`
- `feat: add update and delete actions`
- `feat: improve loading and error states`

---

## Definition of Success

When this instruction is completed, the frontend should let a user manage flight watches without needing direct database access.
