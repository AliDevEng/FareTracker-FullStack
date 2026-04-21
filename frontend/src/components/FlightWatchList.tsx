import { useQuery } from '@tanstack/react-query'
import { getWatches } from '@/api/watches'
import FlightWatchCard from './FlightWatchCard'
import { Plane } from 'lucide-react'

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-l-[3px] border-l-gray-200 shadow-sm overflow-hidden animate-pulse">
      <div className="p-4 sm:p-5">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="h-5 w-36 bg-gray-200 rounded" />
            <div className="h-3 w-52 bg-gray-100 rounded" />
          </div>
          <div className="h-6 w-14 bg-gray-100 rounded-full" />
        </div>
        <div className="mt-4 flex gap-6">
          <div className="space-y-1">
            <div className="h-2.5 w-10 bg-gray-100 rounded" />
            <div className="h-4 w-20 bg-gray-200 rounded" />
          </div>
          <div className="space-y-1">
            <div className="h-2.5 w-10 bg-gray-100 rounded" />
            <div className="h-4 w-20 bg-gray-200 rounded" />
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end gap-2">
          <div className="h-6 w-12 bg-gray-100 rounded" />
          <div className="h-6 w-14 bg-gray-100 rounded" />
        </div>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 mb-4">
        <Plane className="h-8 w-8 text-indigo-200" />
      </div>
      <p className="font-medium text-foreground">No watches yet</p>
      <p className="mt-1 text-sm text-muted-foreground max-w-xs">
        Add your first flight above and we'll start tracking prices for you.
      </p>
    </div>
  )
}

export default function FlightWatchList() {
  const { data: watches, isLoading, isError } = useQuery({
    queryKey: ['watches'],
    queryFn: getWatches,
  })

  if (isLoading) {
    return (
      <div className="space-y-3">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
        Failed to load watches. Is the backend running?
      </div>
    )
  }

  if (!watches?.length) {
    return <EmptyState />
  }

  const active = watches.filter(w => w.is_active).length
  const sorted = [...watches].sort((a, b) => a.departure_date.localeCompare(b.departure_date))

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground px-0.5">
        {watches.length} watch{watches.length !== 1 ? 'es' : ''} · {active} active · {watches.length - active} paused
      </p>
      {sorted.map(watch => (
        <FlightWatchCard key={watch.id} watch={watch} />
      ))}
    </div>
  )
}
