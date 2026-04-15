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
