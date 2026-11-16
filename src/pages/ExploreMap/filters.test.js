import { filterEvents, nextOption } from './filters'
import { normalizeEvent } from './normalizeEvent'
import { dbEvents } from './testEvents'

const events = dbEvents.map(normalizeEvent)
const noFilters = { search: '', maxMiles: 25, category: 'all', price: 'any', bounds: null }
const titles = (list) => list.map((e) => e.title)

describe('filterEvents', () => {
  test('shows every night when no filter is set', () => {
    expect(filterEvents(events, noFilters)).toHaveLength(4)
  })

  test('search matches title or venue and ignores capital letters', () => {
    expect(titles(filterEvents(events, { ...noFilters, search: 'ZAWADI' }))).toEqual([
      'Zawadi Band Perfomance',
    ])
    expect(titles(filterEvents(events, { ...noFilters, search: 'kicc' }))).toEqual([
      'MindTech Conference',
    ])
  })

  test('hides nights that are further away than the distance limit', () => {
    const near = filterEvents(events, { ...noFilters, maxMiles: 5 })
    expect(titles(near)).not.toContain('AmapianoLand')
    expect(near).toHaveLength(3)
  })

  test('category filter keeps only that category', () => {
    expect(titles(filterEvents(events, { ...noFilters, category: 'tech' }))).toEqual([
      'MindTech Conference',
    ])
  })

  test('price filter separates free and paid nights', () => {
    expect(titles(filterEvents(events, { ...noFilters, price: 'free' }))).toEqual([
      'Zawadi Band Perfomance',
      'MindTech Conference',
    ])
    expect(titles(filterEvents(events, { ...noFilters, price: 'paid' }))).toEqual([
      'Detty Dezemba',
      'AmapianoLand',
    ])
  })

  test('filters work together', () => {
    const result = filterEvents(events, { ...noFilters, category: 'music', price: 'free' })
    expect(titles(result)).toEqual(['Zawadi Band Perfomance'])
  })

  test('Search this area keeps only nights inside the map bounds', () => {
    const bounds = { contains: ([lat]) => lat > -1.285 }
    expect(titles(filterEvents(events, { ...noFilters, bounds }))).toEqual([
      'Zawadi Band Perfomance',
    ])
  })

  test('a night without a location is not hidden by the distance limit', () => {
    const noPlace = normalizeEvent({ id: 9, title: 'No place', price: 0, location: { venue: '?' } })
    const result = filterEvents([noPlace], { ...noFilters, maxMiles: 1 })
    expect(titles(result)).toEqual(['No place'])
  })
})

describe('nextOption', () => {
  test('moves to the next option and loops back to the start', () => {
    expect(nextOption(['any', 'free', 'paid'], 'any')).toBe('free')
    expect(nextOption(['any', 'free', 'paid'], 'paid')).toBe('any')
  })
})

describe('filterEvents by zone', () => {
  test('keeps only nights whose venue or address matches the picked zone', () => {
    const result = filterEvents(events, { ...noFilters, zone: 'KICC Nairobi' })
    expect(titles(result)).toEqual(['MindTech Conference'])
  })

  test('"All Nairobi Zones" keeps every night', () => {
    expect(filterEvents(events, { ...noFilters, zone: 'All Nairobi Zones' })).toHaveLength(4)
  })
})
