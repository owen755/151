function formatPrice(price) {
  if (price === 'free') return 'Free'
  return 'KES ' + Number(price).toLocaleString()
}

export default function NightCard({ event }) {
  return (
    <div className="flex gap-4 rounded-2xl border border-[#2a2c2f] bg-[#1b1c1f] p-3">
      <img
        src={event.image}
        alt={event.title}
        className="h-[114px] w-[76px] rounded-lg object-cover"
      />

      <div className="flex flex-col justify-center">
        <p className="text-[10px] uppercase tracking-wide text-[#c8f56a]">
          {event.vibe} · {event.location.venue}
        </p>
        <h3 className="mt-1 text-lg font-semibold text-white">{event.title}</h3>
        <p className="mt-1 text-xs text-neutral-400">
          {event.startTime} – {event.endTime}
        </p>
        <p className="mt-2 text-xs text-white">{formatPrice(event.price)}</p>
        <p className="mt-2 text-xs text-[#c8f56a]">View night →</p>
      </div>
    </div>
  )
}
