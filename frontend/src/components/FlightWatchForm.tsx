import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createWatch } from '@/api/watches'
import { createWatchSchema, type CreateWatchFormValues } from '@/lib/schemas'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export default function FlightWatchForm() {
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    reset,
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
    mutation.mutate(values)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="origin">Origin</Label>
          <Input id="origin" placeholder="CPH" {...register('origin')} />
          {errors.origin && <p className="text-destructive text-xs">{errors.origin.message}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="destination">Destination</Label>
          <Input id="destination" placeholder="BCN" {...register('destination')} />
          {errors.destination && <p className="text-destructive text-xs">{errors.destination.message}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="departure_date">Departure date</Label>
          <Input id="departure_date" type="date" {...register('departure_date')} />
          {errors.departure_date && <p className="text-destructive text-xs">{errors.departure_date.message}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="return_date">Return date (optional)</Label>
          <Input id="return_date" type="date" {...register('return_date')} />
        </div>

        <div className="space-y-1">
          <Label htmlFor="target_price">Target price</Label>
          <Input id="target_price" type="number" min={1} {...register('target_price')} />
          {errors.target_price && <p className="text-destructive text-xs">{errors.target_price.message}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="currency">Currency</Label>
          <Input id="currency" placeholder="SEK" {...register('currency')} />
        </div>
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" {...register('is_round_trip')} className="h-4 w-4" />
          Round trip
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" {...register('is_active')} className="h-4 w-4" defaultChecked />
          Active
        </label>
      </div>

      {mutation.isError && (
        <p className="text-destructive text-sm">Failed to create watch. Please try again.</p>
      )}

      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Adding...' : 'Add watch'}
      </Button>
    </form>
  )
}
