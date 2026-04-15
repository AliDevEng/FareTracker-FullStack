import FlightWatchForm from '@/components/FlightWatchForm'
import FlightWatchList from '@/components/FlightWatchList'

export default function HomePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-10">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">FareTracker</h1>
        <p className="text-muted-foreground mt-1">Track flight prices and get notified when they drop.</p>
      </header>

      <section>
        <h2 className="text-lg font-semibold mb-4">Add a Watch</h2>
        <FlightWatchForm />
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Your Watches</h2>
        <FlightWatchList />
      </section>
    </div>
  )
}
