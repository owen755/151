import { normalizeEvent } from './normalizeEvent'
import { dbEvents } from './testEvents'

describe('normalizeEvent', () => {
  test('builds the label, venue, time and price text from a db.json event', () => {
    const ev = normalizeEvent(dbEvents[0])
    expect(ev.label).toBe('music')
    expect(ev.venue).toBe('Uhuru Gardens')
    expect(ev.time).toBe('19:00 – Till Dawn')
    expect(ev.priceLabel).toBe('KES 4,500')
    expect(ev.lng).toBe(36.8)
  })

  test('"free" and 0 are both treated as free', () => {
    expect(normalizeEvent(dbEvents[1]).isFree).toBe(true)
    expect(normalizeEvent(dbEvents[1]).priceLabel).toBe('Free')
    expect(normalizeEvent({ id: 5, price: 0 }).priceLabel).toBe('Free')
  })

  test('accepts a party from the Host page, which uses lng and tags', () => {
    const hosted = normalizeEvent({
      id: '99',
      title: 'Rooftop night',
      price: 1000,
      time: 'Tonight, 9 PM – late',
      tags: ['House', 'Rooftop'],
      location: { venue: 'The Roof', lat: -1.2864, lng: 36.8172 },
    })
    expect(hosted.label).toBe('House')
    expect(hosted.lng).toBe(36.8172)
    expect(hosted.time).toBe('Tonight, 9 PM – late')
  })

  test('calculates the distance from lat and long', () => {
    expect(normalizeEvent(dbEvents[0]).milesLabel).toBe('2.6 mi')
    const atCenter = normalizeEvent({ id: 1, price: 0, location: { lat: -1.2864, long: 36.8172 } })
    expect(atCenter.milesLabel).toBe('0.0 mi')
  })
})
