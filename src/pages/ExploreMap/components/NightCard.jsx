import { useNavigate } from 'react-router-dom'

export default function NightCard({ event, selected = false, onSelect }) {
  const navigate = useNavigate()
  const borderStyle = selected
    ? 'border-[#d2ff38]'
    : 'border-[#2a2c2f] hover:border-neutral-500'

  return (
    <div
      onClick={onSelect}
      className={`flex shrink-0 cursor-pointer gap-4 rounded-2xl border bg-[#1b1c1f] p-3 ${borderStyle}`}
    >
      <img
        src={event.image}
        alt={event.title}
        className="h-[114px] w-[76px] shrink-0 rounded-lg object-cover"
      />

      <div className="flex min-w-0 flex-col justify-center">
        <p className="truncate text-[10px] uppercase tracking-wide text-[#d2ff38]">
          {event.label} · {event.venue}
        </p>
        <h3 className="mt-1 text-lg font-semibold leading-snug text-white">
          {event.title}
        </h3>
        <p className="mt-1 text-xs text-neutral-400">Tonight · {event.time}</p>
        <p className="mt-2 text-xs text-white">
          {[event.milesLabel, event.priceLabel].filter(Boolean).join(' · ')}
        </p>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            navigate(`/events/${event.id}`)
          }}
          className="mt-2 cursor-pointer text-left text-xs text-[#d2ff38]"
        >
          View night →
        </button>
      </div>
    </div>
  )
}
