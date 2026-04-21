import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createWatch } from '@/api/watches'
import { createWatchSchema, type CreateWatchFormValues } from '@/lib/schemas'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { CurrencySelect } from '@/components/ui/currency-select'

export default function FlightWatchForm() {
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<CreateWatchFormValues>({
    resolver: zodResolver(createWatchSchema),
    defaultValues: {
      origin: '',
      destination: '',
      departure_date: '',
      return_date: null,
      is_round_trip: false,
      target_price: 0,
      currency: 'SEK',
      is_active: true,
    },
  })

  const mutation = useMutation({
    mutationFn: createWatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watches'] })
      reset()
    },
  })

  const onSubmit = (values: CreateWatchFormValues) => {
    mutation.mutate({
      ...values,
      origin: values.origin.toUpperCase().trim(),
      destination: values.destination.toUpperCase().trim(),
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="origin" className="text-xs font-medium">Origin</Label>
          <Input
            id="origin"
            placeholder="CPH"
            maxLength={4}
            className="uppercase tracking-widest font-mono text-sm"
            {...register('origin')}
          />
          {errors.origin && <p className="text-destructive text-xs">{errors.origin.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="destination" className="text-xs font-medium">Destination</Label>
          <Input
            id="destination"
            placeholder="BCN"
            maxLength={4}
            className="uppercase tracking-widest font-mono text-sm"
            {...register('destination')}
          />
          {errors.destination && <p className="text-destructive text-xs">{errors.destination.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="departure_date" className="text-xs font-medium">Departure</Label>
          <Controller
            name="departure_date"
            control={control}
            render={({ field }) => (
              <DatePicker
                id="departure_date"
                value={field.value}
                onChange={(v) => field.onChange(v ?? '')}
                placeholder="Pick date"
              />
            )}
          />
          {errors.departure_date && <p className="text-destructive text-xs">{errors.departure_date.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="return_date" className="text-xs font-medium">
            Return <span className="text-muted-foreground font-normal">(optional)</span>
          </Label>
          <Controller
            name="return_date"
            control={control}
            render={({ field }) => (
              <DatePicker
                id="return_date"
                value={field.value}
                onChange={field.onChange}
                placeholder="Pick date"
                nullable
              />
            )}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="target_price" className="text-xs font-medium">Target price</Label>
          <Input
            id="target_price"
            type="number"
            min={1}
            placeholder="2500"
            {...register('target_price')}
          />
          {errors.target_price && <p className="text-destructive text-xs">{errors.target_price.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="currency" className="text-xs font-medium">Currency</Label>
          <Controller
            name="currency"
            control={control}
            render={({ field }) => (
              <CurrencySelect
                id="currency"
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
            <input type="checkbox" className="sr-only peer" defaultChecked {...register('is_active')} />
            <span className="block h-5 w-9 rounded-full bg-muted peer-checked:bg-primary transition-colors" />
            <span className="pointer-events-none absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
          </span>
          Active
        </label>
      </div>

      {mutation.isError && (
        <p className="text-destructive text-sm">Failed to create watch. Please try again.</p>
      )}

      <Button type="submit" disabled={mutation.isPending} className="w-full sm:w-auto">
        {mutation.isPending ? 'Adding...' : 'Add watch'}
      </Button>
    </form>
  )
}
