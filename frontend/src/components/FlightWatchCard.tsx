import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteWatch, updateWatch } from '@/api/watches'
import type { FlightWatch } from '@/types/flight-watch'
import { Button } from '@/components/ui/button'
import FlightWatchEditDialog from './FlightWatchEditDialog'
import { Plane, Edit2, Trash2, TrendingDown, TrendingUp, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, parseISO, differenceInDays } from 'date-fns'

function formatPrice(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function DaysChip({ dateStr }: { dateStr: string }) {
  const days = differenceInDays(parseISO(dateStr), new Date())
  if (days < 0) return <span className="text-xs text-muted-foreground">Past</span>
  if (days === 0) return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
      Today!
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      <Clock className="h-3 w-3" />
      {days}d away
    </span>
  )
}

interface Props {
  watch: FlightWatch
}

export default function FlightWatchCard({ watch }: Props) {
  const queryClient = useQueryClient()
  const [editOpen, setEditOpen] = useState(false)

  const deleteMutation = useMutation({
    mutationFn: () => deleteWatch(watch.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['watches'] }),
  })

  const toggleMutation = useMutation({
    mutationFn: () => updateWatch(watch.id, { is_active: !watch.is_active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['watches'] }),
  })

  const hasCurrentPrice = watch.current_price != null
  const priceBelow = hasCurrentPrice && watch.current_price! < watch.target_price
  const priceAbove = hasCurrentPrice && watch.current_price! > watch.target_price
  const pricePct = hasCurrentPrice
    ? Math.abs(Math.round(((watch.current_price! - watch.target_price) / watch.target_price) * 100))
    : null

  return (
    <>
      <div className={cn(
        'bg-white rounded-xl border shadow-sm overflow-hidden transition-shadow hover:shadow-md',
        'border-l-[3px]',
        watch.is_active ? 'border-l-emerald-400' : 'border-l-amber-300'
      )}>
        <div className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 font-bold text-base sm:text-lg leading-tight">
                <span className="font-mono tracking-wide">{watch.origin}</span>
                <Plane className="h-4 w-4 text-indigo-400 -rotate-[10deg] shrink-0" />
                <span className="font-mono tracking-wide">{watch.destination}</span>
                {watch.is_round_trip && (
                  <span className="text-[11px] font-normal text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
                    Round trip
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                <span className="text-xs text-muted-foreground">
                  {format(parseISO(watch.departure_date), 'MMM d, yyyy')}
                  {watch.return_date && ` → ${format(parseISO(watch.return_date), 'MMM d, yyyy')}`}
                </span>
                <DaysChip dateStr={watch.departure_date} />
              </div>
            </div>

            <button
              onClick={() => toggleMutation.mutate()}
              disabled={toggleMutation.isPending}
              title={watch.is_active ? 'Click to pause' : 'Click to activate'}
              className={cn(
                'shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full transition-colors',
                watch.is_active
                  ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                  : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
              )}
            >
              {watch.is_active ? 'Active' : 'Paused'}
            </button>
          </div>

          <div className="mt-4 flex items-end gap-5 flex-wrap">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5">Target</p>
              <p className="text-sm font-semibold tabular-nums">
                {formatPrice(watch.target_price, watch.currency)}
              </p>
            </div>

            <div className="h-8 w-px bg-border hidden sm:block" />

            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5">Current</p>
              {hasCurrentPrice ? (
                <div className="flex items-center gap-1.5">
                  <p className={cn(
                    'text-sm font-semibold tabular-nums',
                    priceBelow ? 'text-emerald-600' : priceAbove ? 'text-red-500' : ''
                  )}>
                    {priceBelow && <TrendingDown className="inline h-3.5 w-3.5 mr-0.5 -mt-0.5" />}
                    {priceAbove && <TrendingUp className="inline h-3.5 w-3.5 mr-0.5 -mt-0.5" />}
                    {formatPrice(watch.current_price!, watch.currency)}
                  </p>
                  {pricePct !== null && pricePct > 0 && (
                    <span className={cn(
                      'text-[11px] font-medium px-1.5 py-0.5 rounded-full',
                      priceBelow ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
                    )}>
                      {priceBelow ? `${pricePct}% below` : `${pricePct}% above`}
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">Not checked yet</p>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditOpen(true)}
              className="h-7 px-2.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <Edit2 className="h-3 w-3 mr-1" />
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.confirm('Remove this watch?') && deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
              className="h-7 px-2.5 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </div>

      <FlightWatchEditDialog
        watch={watch}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </>
  )
}
