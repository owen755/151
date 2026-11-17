const formatPrice = (price, currency) =>
  String(price).toLowerCase() === 'free' || Number(price) === 0
    ? 'Free'
    : `${Number(price).toLocaleString()} ${currency || 'KES'}`;

export default function SavedNightCard({ night, onUnsave, onView }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-white/10 bg-[#131519]">
      <div className="relative">
                <img
          src={night.image}
          alt={night.title}
          onError={(e) => {
            e.currentTarget.src =
              'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1000&auto=format&fit=crop&q=80';
          }}
          className="h-40 w-full object-cover"
        />
        <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold text-white">
          {formatPrice(night.price, night.currency)}
        </span>
        <button
          onClick={() => onUnsave(night.id)}
          aria-label={`Unsave ${night.title}`}
          className="absolute right-3 top-3 cursor-pointer rounded-full bg-black/60 p-2 text-[#d2ff38] transition hover:bg-black/80 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#d2ff38]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21s-7.5-4.6-9.6-9.1C1 8.7 2.7 5 6.2 5c2 0 3.3 1.1 3.8 2 .5-.9 1.8-2 3.8-2 3.5 0 5.2 3.7 3.8 6.9C19.5 16.4 12 21 12 21z" />
          </svg>
        </button>
      </div>

      <div className="p-4">
        <p className="text-[11px] font-bold uppercase tracking-widest text-[#d2ff38]">
          {night.category}
        </p>
        <h3 className="mt-1 text-lg font-bold text-white">{night.title}</h3>
        <div className="mt-3 flex items-end justify-between gap-3">
          <p className="text-xs leading-relaxed text-[#8b909a]">
            {night.startTime} – {night.endTime}
            <br />
            {night.location?.venue}
          </p>
          <button
            onClick={() => onView(night.id)}
            className="shrink-0 cursor-pointer rounded-full bg-[#d2ff38] px-4 py-2 text-xs font-bold text-[#0b0c0e] transition hover:brightness-110 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#d2ff38]"
          >
            View night
          </button>
        </div>
      </div>
    </article>
  );
}
