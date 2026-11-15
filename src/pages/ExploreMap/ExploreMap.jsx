import FilterChip from './components/FilterChip'

export default function ExploreMap() {
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
        <div className="ml-auto">
          <FilterChip label="List view" />
        </div>
      </div>
    </div>
  )
}
