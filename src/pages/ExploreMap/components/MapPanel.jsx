import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import '../map.css'
import { YOU } from '../distance'

const TILES = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'

// A pill with the price, like $20 / $15 / Free in the design
function priceIcon(label, selected) {
  return L.divIcon({
    className: '',
    html: `<div class="price-pin ${selected ? 'on' : ''}">${label}</div>`,
    iconSize: [0, 0],
  })
}

const youIcon = L.divIcon({
  className: '',
  html: '<div class="you-dot"></div>',
  iconSize: [14, 14],
})

// When a night is selected, the map glides to it
function FlyToSelected({ event }) {
  const map = useMap()
  useEffect(() => {
    if (event && event.lat !== null) {
      map.flyTo([event.lat, event.lng], 14, { duration: 0.8 })
    }
  }, [map, event])
  return null
}

const roundButton =
  'flex h-9 w-9 cursor-pointer items-center justify-center text-white hover:bg-white/10'

export default function MapPanel({ events, selectedId, onSelect, flyId, areaActive, onSearchArea, className = 'h-full' }) {
  const [map, setMap] = useState(null)
  const navigate = useNavigate()
  const selected = events.find((e) => e.id === selectedId)

  return (
    <div className={`flex min-h-0 flex-col ${className}`}>
      <div className="relative min-h-0 flex-1 overflow-hidden rounded-2xl border border-[#2a2c2f]">
        <MapContainer
          ref={setMap}
          center={[YOU.lat, YOU.lng]}
          zoom={13}
          zoomControl={false}
          attributionControl={false}
          className="h-full w-full"
        >
          <TileLayer url={TILES} />
          <Marker position={[YOU.lat, YOU.lng]} icon={youIcon} interactive={false} />

          {events
            .filter((e) => e.lat !== null)
            .map((e) => (
              <Marker
                key={e.id}
                position={[e.lat, e.lng]}
                icon={priceIcon(e.priceLabel, e.id === selectedId)}
                zIndexOffset={e.id === selectedId ? 1000 : 0}
                eventHandlers={{ click: () => onSelect(e.id) }}
              />
            ))}

          <FlyToSelected event={events.find((e) => e.id === flyId)} />
        </MapContainer>

        {/* Search this area (wired up in the filters commit) */}
        <button
          type="button"
          onClick={() => onSearchArea(areaActive ? null : map?.getBounds() ?? null)}
          className={`absolute left-1/2 top-4 z-[1000] -translate-x-1/2 cursor-pointer rounded-full border px-4 py-2 text-xs ${
            areaActive
              ? 'border-[#d2ff38]/40 bg-[#1e2418] text-[#d2ff38]'
              : 'border-[#2a2c2f] bg-[#131519] text-white'
          }`}
        >
          Search this area
        </button>

        {/* Zoom and locate buttons */}
        <div className="absolute right-4 top-4 z-[1000] flex flex-col gap-2">
          <div className="overflow-hidden rounded-xl border border-[#2a2c2f] bg-[#131519]">
            <button type="button" aria-label="Zoom in" onClick={() => map?.zoomIn()} className={roundButton}>
              +
            </button>
            <button type="button" aria-label="Zoom out" onClick={() => map?.zoomOut()} className={`${roundButton} border-t border-[#2a2c2f]`}>
              −
            </button>
          </div>
          <button
            type="button"
            aria-label="Go to my location"
            onClick={() => map?.flyTo([YOU.lat, YOU.lng], 13)}
            className={`${roundButton} rounded-xl border border-[#2a2c2f] bg-[#131519] text-[#d2ff38]`}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
          </button>
        </div>

        {/* Preview card for the selected night */}
        {selected && (
          <div className="absolute bottom-4 left-4 right-4 z-[1000] flex items-center gap-4 rounded-2xl border border-[#2a2c2f] bg-[#131519]/95 p-3">
            <img
              src={selected.image}
              alt={selected.title}
              className="h-[84px] w-[64px] shrink-0 rounded-lg object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-[#d2ff38]">
                Tonight · {selected.time}
              </p>
              <h3 className="truncate text-xl font-bold text-white">{selected.title}</h3>
              <p className="truncate text-xs text-neutral-400">
                {[selected.venue, selected.milesLabel].filter(Boolean).join(' · ')}
              </p>
              <p className="truncate text-xs capitalize text-white">
                {selected.label} · {selected.priceLabel}
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate(`/events/${selected.id}`)}
              className="shrink-0 cursor-pointer rounded-full bg-[#d2ff38] px-4 py-2 text-xs font-bold text-[#0b0c0e]"
            >
              View night →
            </button>
          </div>
        )}
      </div>

      <p className="mt-2 text-[10px] text-neutral-500">
        Map © OpenStreetMap contributors · Locations approximate
      </p>
    </div>
  )
}
