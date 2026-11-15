import { useState, useEffect } from 'react'
import FilterChip from './components/FilterChip'
import NightCard from './components/NightCard'
import TopBar from './components/TopBar'
import MapPanel from './components/MapPanel'
import { API_URL } from './api'
import { normalizeEvent } from './normalizeEvent'
import {
  DISTANCE_OPTIONS,
  PRICE_OPTIONS,
  PRICE_LABELS,
  nextOption,
  filterEvents,
} from './filters'

export default function ExploreMap() {
  const [events, setEvents] = useState([])
  const [status, setStatus] = useState('loading') // loading | error | ready
  const [selectedId, setSelectedId] = useState(null)

  const [search, setSearch] = useState('')
  const [maxMiles, setMaxMiles] = useState(5)
  const [category, setCategory] = useState('all')
  const [price, setPrice] = useState('any')
  const [listView, setListView] = useState(false)

  useEffect(() => {
    fetch(`${API_URL}/events`)
      .then((res) => {
        if (!res.ok) throw new Error('Bad response')
        return res.json()
      })
      .then((data) => {
        setEvents(data.map(normalizeEvent))
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [])

  // The categories come from the data: music, education, charity...
  const categories = ['all', ...new Set(events.map((e) => e.label.toLowerCase()))]
  const categoryLabel =
    category === 'all'
      ? 'All vibes'
      : category.charAt(0).toUpperCase() + category.slice(1)

  const shown = filterEvents(events, { search, maxMiles, category, price })

  // If the selected night was filtered out, the first one on the list is selected
  const activeId = shown.some((e) => e.id === selectedId)
    ? selectedId
    : shown[0]?.id

  return (
    <div className="min-h-screen">
      <TopBar />

      <div className="px-11 py-8">
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
          <FilterChip
            label={`Within ${maxMiles} mi`}
            active={maxMiles !== 5}
            onClick={() => setMaxMiles(nextOption(DISTANCE_OPTIONS, maxMiles))}
          />
          <FilterChip
            label={categoryLabel}
            active={category !== 'all'}
            onClick={() => setCategory(nextOption(categories, category))}
          />
          <FilterChip
            label={PRICE_LABELS[price]}
            active={price !== 'any'}
            onClick={() => setPrice(nextOption(PRICE_OPTIONS, price))}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search DJs or venues"
            className="h-[38px] w-64 rounded-full border border-[#2a2c2f] bg-[#1b1c1f] px-4 text-[13px] text-white placeholder:text-neutral-500 focus:border-[#d2ff38]/40 focus:outline-none"
          />
          <div className="ml-auto">
            <FilterChip
              label={listView ? 'Map view' : 'List view'}
              active={listView}
              onClick={() => setListView(!listView)}
            />
          </div>
        </div>

        <div
          className={
            listView
              ? 'mt-8'
              : 'mt-8 grid h-[560px] grid-cols-[345px_1fr] gap-6'
          }
        >
          <section className="flex min-h-0 flex-col">
            <h2 className="text-lg font-semibold text-white">
              {status === 'ready'
                ? `${shown.length} good ${shown.length === 1 ? 'night' : 'nights'} nearby`
                : 'Finding good nights...'}
            </h2>
            <p className="mt-1 text-xs text-neutral-500">
              Nairobi, Kenya · Within {maxMiles} miles
            </p>

            {status === 'error' && (
              <p className="mt-4 rounded-2xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300">
                Could not load nights. Is the data server running?
              </p>
            )}

            {status === 'ready' && shown.length === 0 && (
              <p className="mt-4 text-xs text-neutral-400">
                No nights match your filters.
              </p>
            )}

            <div
              className={
                listView
                  ? 'mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3'
                  : 'mt-4 flex flex-col gap-3 overflow-y-auto pr-1'
              }
            >
              {shown.map((event) => (
                <NightCard
                  key={event.id}
                  event={event}
                  selected={event.id === activeId}
                  onSelect={() => setSelectedId(event.id)}
                />
              ))}
              {status === 'ready' && (
                <p className="shrink-0 rounded-2xl bg-[#1e2418] px-4 py-3 text-xs text-[#d2ff38]/80">
                  A little closer to your next story.
                </p>
              )}
            </div>
          </section>

          {!listView && (
            <MapPanel events={shown} selectedId={activeId} onSelect={setSelectedId} />
          )}
        </div>

        <footer className="mt-10 flex items-center justify-between border-t border-[#2a2c2f] pt-4 text-[10px] uppercase tracking-wider text-neutral-500">
          <span>Good people. Great nights.</span>
          <span className="normal-case tracking-normal">
            Discover spontaneously. Party responsibly. 21+
          </span>
        </footer>
      </div>
    </div>
  )
}
