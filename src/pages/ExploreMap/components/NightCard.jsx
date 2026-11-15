import CapacityBadge from './CapacityBadge'

function formatPrice(price) {
  if (price === 'free') return 'Free'
  return 'KES ' + Number(price).toLocaleString()
}

export default function NightCard({ event, selected = false, onSelect }) {
  const borderStyle = selected
    ? 'border-[#d2ff38]'
    : 'border-[#2a2c2f] hover:border-neutral-500'

  return (
    <div
      onClick={onSelect}
      className={`flex cursor-pointer gap-4 rounded-2xl border bg-[#1b1c1f] p-3 ${borderStyle}`}
    >
      <img
        src={event.image}
        alt={event.title}
        className="h-[114px] w-[76px] rounded-lg object-cover"
      />

      <div className="flex flex-col justify-center">
        <p className="text-[10px] uppercase tracking-wide text-[#d2ff38]">
          {event.vibe} · {event.location.venue}
        </p>
        <h3 className="mt-1 text-lg font-semibold text-white">{event.title}</h3>
        <p className="mt-1 text-xs text-neutral-400">
          {event.startTime} – {event.endTime}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <p className="text-xs text-white">{formatPrice(event.price)}</p>
          <CapacityBadge spotsLeft={event.spotsLeft} capacity={event.capacity} />
        </div>
        <p className="mt-2 text-xs text-[#d2ff38]">View night →</p>
      </div>
    </div>
  )
}
