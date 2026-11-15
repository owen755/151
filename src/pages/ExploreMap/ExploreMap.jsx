import { useState } from 'react'
import FilterChip from './components/FilterChip'
import NightCard from './components/NightCard'
import { sampleEvents } from './sampleEvents'

export default function ExploreMap() {
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState(sampleEvents[0].id)

  return (
    <div className="min-h-screen px-11 py-10">
      <header>
        <h1 className="text-[32px] font-bold leading-tight tracking-tight text-white">
          Your city. After dark.
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          Find a good night, right around the corner.
        </p>
      </header>

      <div className="mt-6 flex items-center gap-3">
        <FilterChip label="All dates" active />
        <FilterChip label="Within 5 mi" />
        <FilterChip label="All vibes" />
        <FilterChip label="Any price" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search DJs or venues"
          className="h-[38px] w-64 rounded-full border border-[#2a2c2f] bg-[#1b1c1f] px-4 text-[13px] text-white placeholder:text-neutral-500 focus:border-[#c8f56a]/40 focus:outline-none"
        />
        <div className="ml-auto">
          <FilterChip label="List view" />
        </div>
      </div>

      <div className="mt-8 grid grid-cols-[345px_1fr] gap-6">
        <section>
          <h2 className="text-lg font-semibold text-white">
            {sampleEvents.length} good nights nearby
          </h2>
          <p className="mt-1 text-xs text-neutral-500">
            Nairobi, Kenya · Within 5 miles
          </p>

          <div className="mt-4 flex flex-col gap-3">
            {sampleEvents.map((event) => (
              <NightCard
                key={event.id}
                event={event}
                selected={event.id === selectedId}
                onSelect={() => setSelectedId(event.id)}
              />
            ))}
          </div>
        </section>

        <section className="flex min-h-[500px] items-center justify-center rounded-2xl border border-[#2a2c2f] bg-[#1b1c1f] text-sm text-neutral-500">
          Map goes here
        </section>
      </div>
    </div>
  )
}
