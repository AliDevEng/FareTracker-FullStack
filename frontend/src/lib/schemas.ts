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
