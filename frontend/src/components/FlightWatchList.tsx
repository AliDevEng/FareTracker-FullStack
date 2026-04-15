import { useQuery } from '@tanstack/react-query'
import { getWatches } from '@/api/watches'
import FlightWatchCard from './FlightWatchCard'

export default function FlightWatchList() {
  const { data: watches, isLoading, isError } = useQuery({
    queryKey: ['watches'],
    queryFn: getWatches,
  })

  if (isLoading) {
    return <p className="text-muted-foreground text-sm">Loading watches...</p>
  }

  if (isError) {
    return <p className="text-destructive text-sm">Failed to load watches. Is the backend running?</p>
  }

  if (!watches?.length) {
    return <p className="text-muted-foreground text-sm">No watches yet. Add one above.</p>
  }

  return (
    <div className="grid gap-4">
      {watches.map(watch => (
        <FlightWatchCard key={watch.id} watch={watch} />
      ))}
    </div>
  )
}
