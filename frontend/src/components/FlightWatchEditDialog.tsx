import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateWatch } from '@/api/watches'
import { createWatchSchema, type CreateWatchFormValues } from '@/lib/schemas'
import type { FlightWatch } from '@/types/flight-watch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

interface Props {
  watch: FlightWatch
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function FlightWatchEditDialog({ watch, open, onOpenChange }: Props) {
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateWatchFormValues>({
    resolver: zodResolver(createWatchSchema),
    defaultValues: {
      origin: watch.origin,
      destination: watch.destination,
      departure_date: watch.departure_date,
      return_date: watch.return_date ?? null,
      is_round_trip: watch.is_round_trip,
      target_price: watch.target_price,
      currency: watch.currency,
      is_active: watch.is_active,
    },
  })

  const mutation = useMutation({
    mutationFn: (values: CreateWatchFormValues) => updateWatch(watch.id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watches'] })
      onOpenChange(false)
    },
  })

  const onSubmit = (values: CreateWatchFormValues) => {
    mutation.mutate(values)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit watch — {watch.origin} → {watch.destination}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="edit-origin">Origin</Label>
              <Input id="edit-origin" {...register('origin')} />
              {errors.origin && <p className="text-destructive text-xs">{errors.origin.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit-destination">Destination</Label>
              <Input id="edit-destination" {...register('destination')} />
              {errors.destination && <p className="text-destructive text-xs">{errors.destination.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit-departure">Departure date</Label>
              <Input id="edit-departure" type="date" {...register('departure_date')} />
              {errors.departure_date && <p className="text-destructive text-xs">{errors.departure_date.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit-return">Return date (optional)</Label>
              <Input id="edit-return" type="date" {...register('return_date')} />
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit-price">Target price</Label>
              <Input id="edit-price" type="number" min={1} {...register('target_price')} />
              {errors.target_price && <p className="text-destructive text-xs">{errors.target_price.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit-currency">Currency</Label>
              <Input id="edit-currency" {...register('currency')} />
            </div>
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" {...register('is_round_trip')} className="h-4 w-4" />
              Round trip
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" {...register('is_active')} className="h-4 w-4" />
              Active
            </label>
          </div>

          {mutation.isError && (
            <p className="text-destructive text-sm">Failed to save. Please try again.</p>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving...' : 'Save changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
