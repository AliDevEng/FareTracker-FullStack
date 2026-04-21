import { useForm, Controller } from 'react-hook-form'
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
import { DatePicker } from '@/components/ui/date-picker'
import { CurrencySelect } from '@/components/ui/currency-select'

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
    control,
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
    mutationFn: (values: CreateWatchFormValues) => updateWatch(watch.id, {
      ...values,
      origin: values.origin.toUpperCase().trim(),
      destination: values.destination.toUpperCase().trim(),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watches'] })
      onOpenChange(false)
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-mono tracking-wide">
            {watch.origin} → {watch.destination}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4 pt-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-origin" className="text-xs font-medium">Origin</Label>
              <Input
                id="edit-origin"
                maxLength={4}
                className="uppercase tracking-widest font-mono text-sm"
                {...register('origin')}
              />
              {errors.origin && <p className="text-destructive text-xs">{errors.origin.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-destination" className="text-xs font-medium">Destination</Label>
              <Input
                id="edit-destination"
                maxLength={4}
                className="uppercase tracking-widest font-mono text-sm"
                {...register('destination')}
              />
              {errors.destination && <p className="text-destructive text-xs">{errors.destination.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-departure" className="text-xs font-medium">Departure</Label>
              <Controller
                name="departure_date"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    id="edit-departure"
                    value={field.value}
                    onChange={(v) => field.onChange(v ?? '')}
                    placeholder="Pick date"
                  />
                )}
              />
              {errors.departure_date && <p className="text-destructive text-xs">{errors.departure_date.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-return" className="text-xs font-medium">
                Return <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Controller
                name="return_date"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    id="edit-return"
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Pick date"
                    nullable
                  />
                )}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-price" className="text-xs font-medium">Target price</Label>
              <Input
                id="edit-price"
                type="number"
                min={1}
                {...register('target_price')}
              />
              {errors.target_price && <p className="text-destructive text-xs">{errors.target_price.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-currency" className="text-xs font-medium">Currency</Label>
              <Controller
                name="currency"
                control={control}
                render={({ field }) => (
                  <CurrencySelect
                    id="edit-currency"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>
          </div>

          <div className="flex items-center gap-6 pt-1">
            <label className="flex items-center gap-2.5 text-sm cursor-pointer select-none">
              <span className="relative inline-flex">
                <input type="checkbox" className="sr-only peer" {...register('is_round_trip')} />
                <span className="block h-5 w-9 rounded-full bg-muted peer-checked:bg-primary transition-colors" />
                <span className="pointer-events-none absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
              </span>
              Round trip
            </label>

            <label className="flex items-center gap-2.5 text-sm cursor-pointer select-none">
              <span className="relative inline-flex">
                <input type="checkbox" className="sr-only peer" {...register('is_active')} />
                <span className="block h-5 w-9 rounded-full bg-muted peer-checked:bg-primary transition-colors" />
                <span className="pointer-events-none absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
              </span>
              Active
            </label>
          </div>

          {mutation.isError && (
            <p className="text-destructive text-sm">Failed to save. Please try again.</p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving...' : 'Save changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
