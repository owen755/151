// "You" are at Nairobi CBD (the lime dot on the map).
export const YOU = { lat: -1.2864, lng: 36.8172 }

// Straight-line distance in miles between YOU and a point (haversine formula)
export function distanceMiles(lat, lng) {
  if (lat == null || lng == null) return null
  const R = 3958.8 // Earth radius in miles
  const toRad = (deg) => (deg * Math.PI) / 180
  const dLat = toRad(lat - YOU.lat)
  const dLng = toRad(lng - YOU.lng)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(YOU.lat)) * Math.cos(toRad(lat)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}
