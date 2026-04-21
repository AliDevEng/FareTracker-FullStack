import { Plane, Plus, Radar } from 'lucide-react'
import FlightWatchForm from '@/components/FlightWatchForm'
import FlightWatchList from '@/components/FlightWatchList'

export default function HomePage() {
  return (
    <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
      <header className="text-center space-y-3 pt-4 pb-2">
        <div className="inline-flex items-center gap-1.5 bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full">
          <Radar className="h-3 w-3" />
          Flight Price Tracker
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-blue-500 to-sky-400 bg-clip-text text-transparent">
          FareTracker
        </h1>
        <p className="text-muted-foreground text-sm">
          Set a target price, we'll watch the skies. Get notified when fares drop.
        </p>
      </header>

      <section className="bg-white rounded-2xl shadow-sm border border-indigo-100 p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-foreground mb-5 flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100">
            <Plus className="h-3 w-3 text-indigo-600" />
          </span>
          Add a Watch
        </h2>
        <FlightWatchForm />
      </section>

      <section>
        <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100">
            <Plane className="h-3 w-3 text-indigo-600" />
          </span>
          Your Watches
        </h2>
        <FlightWatchList />
      </section>
    </div>
  )
}
