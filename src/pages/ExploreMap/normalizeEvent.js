import { distanceMiles } from './distance'

// Makes events from db.json (Mundia) and from the Host page (Owen)
// look the same, so the rest of the page does not care where they came from.
export function normalizeEvent(ev) {
  const loc = ev.location || {}
  const lat = loc.lat ?? null
  const lng = loc.long ?? loc.lng ?? null
  const isFree = ev.price == null || ev.price === 'free' || Number(ev.price) === 0
  const miles = distanceMiles(lat, lng)

  let time = ev.time || ''
  if (ev.startTime) {
    time = ev.endTime ? `${ev.startTime} – ${ev.endTime}` : ev.startTime
  }

  return {
    ...ev,
    label: ev.category || ev.vibe || ev.tags?.[0] || 'Night',
    venue: loc.venue || ev.venue || '',
    lat,
    lng,
    time,
    isFree,
    priceLabel: isFree
      ? 'Free'
      : `${ev.currency || 'KES'} ${Number(ev.price).toLocaleString()}`,
    miles,
    milesLabel: miles === null ? '' : `${miles.toFixed(1)} mi`,
  }
}
