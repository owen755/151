const formatPrice = (price) => 
    Number (price) === 0 ? 'Free' : `$${Number(price).toLocaleString()}`;

export default function SavedNightCard({ night, onUse, onView }) {
    return (
        <article classname="overflow-hidden rounded-2xl border border-white/10 bg-[#131519]">
            <div className="relative">
               <img
          src={night.image}
          alt={night.title}
          className="h-40 w-full object-cover"
        />
        <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold text-white">
          {formatPrice(night.price)}
        </span>
        <button
          onClick={() => onUnsave(night.id)}
          aria-label={`Unsave ${night.title}`}
          className="absolute right-3 top-3 cursor-pointer rounded-full bg-black/60 p-2 text-[#d2ff38] transition hover:bg-black/80 active:scale-95"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21s-7.5-4.6-9.6-9.1C1 8.7 2.7 5 6.2 5c2 0 3.3 1.1 3.8 2 .5-.9 1.8-2 3.8-2 3.5 0 5.2 3.7 3.8 6.9C19.5 16.4 12 21 12 21z" />
          </svg>
        </button>
      </div>

      <div className="p-4">
        <p className="text-[11px] font-bold uppercase tracking-widest text-[#d2ff38]">
          {night.subtitle}
        </p>
        <h3 className="mt-1 text-lg font-bold text-white">{night.title}</h3>
        <p className="mt-1 text-xs text-[#8b909a]">
          {night.venue} · {night.distance}
        </p>
        <button
          onClick={() => onView(night.id)}
          className="mt-4 cursor-pointer rounded-full bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          View night
        </button>
      
            </div>
        </article>
    );
}