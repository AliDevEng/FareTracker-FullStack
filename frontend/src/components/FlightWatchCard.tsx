import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteWatch } from '@/api/watches'
import type { FlightWatch } from '@/types/flight-watch'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import FlightWatchEditDialog from './FlightWatchEditDialog'

interface Props {
  watch: FlightWatch
}

export default function FlightWatchCard({ watch }: Props) {
  const queryClient = useQueryClient()
  const [editOpen, setEditOpen] = useState(false)

  const deleteMutation = useMutation({
    mutationFn: () => deleteWatch(watch.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watches'] })
    },
  })

  const handleDelete = () => {
    if (!window.confirm('Remove this watch?')) return
    deleteMutation.mutate()
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-2 flex flex-row items-start justify-between gap-4">
          <div>
            <p className="text-lg font-semibold">
              {watch.origin} → {watch.destination}
            </p>
            <p className="text-sm text-muted-foreground">
              {watch.departure_date}
              {watch.return_date && ` — ${watch.return_date}`}
              {watch.is_round_trip && ' (round trip)'}
            </p>
          </div>
          <Badge variant={watch.is_active ? 'default' : 'secondary'}>
            {watch.is_active ? 'Active' : 'Paused'}
          </Badge>
        </CardHeader>

        <CardContent className="flex items-end justify-between gap-4">
          <div className="space-y-1 text-sm">
            <p>
              <span className="text-muted-foreground">Target: </span>
              <span className="font-medium">{watch.target_price} {watch.currency}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Current: </span>
              <span className="font-medium">
                {watch.current_price != null
                  ? `${watch.current_price} ${watch.currency}`
                  : 'Not checked yet'}
              </span>
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <FlightWatchEditDialog
        watch={watch}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </>
  )
}
