import { useState } from 'react'
import FilterChip from './components/FilterChip'

export default function ExploreMap() {
  const [search, setSearch] = useState('')

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
    </div>
  )
}
