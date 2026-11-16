export const DISTANCE_OPTIONS = [1, 3, 5, 10, 25] // miles
export const PRICE_OPTIONS = ['any', 'free', 'paid']
export const PRICE_LABELS = { any: 'Any price', free: 'Free', paid: 'Paid' }

// Clicking a chip moves to the next option in its list, then loops back
export function nextOption(list, current) {
  return list[(list.indexOf(current) + 1) % list.length]
}

export function filterEvents(events, { search, maxMiles, category, price, bounds, zone = 'All Nairobi Zones' }) {
  const text = search.trim().toLowerCase()

  return events.filter((e) => {
    if (e.miles !== null && e.miles > maxMiles) return false
    if (bounds && e.lat !== null && !bounds.contains([e.lat, e.lng])) return false
    if (zone !== 'All Nairobi Zones') {
      const place = [e.venue, e.location?.address].join(' ').toLowerCase()
      if (!place.includes(zone.toLowerCase())) return false
    }
    if (category !== 'all' && e.label.toLowerCase() !== category) return false
    if (price === 'free' && !e.isFree) return false
    if (price === 'paid' && e.isFree) return false

    if (text) {
      const words = [e.title, e.venue, e.description, e.label].join(' ').toLowerCase()
      if (!words.includes(text)) return false
    }
    return true
  })
}
