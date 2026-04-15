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
