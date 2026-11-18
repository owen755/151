import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function SavedNightsPage({ savedEvents = [] }) {
  const navigate = useNavigate();
  
  // We use this to instantly hide a card if the user clicks the "unsave" heart
  const [hiddenIds, setHiddenIds] = useState(new Set());
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('soonest');

  // This reads the master list from App.jsx, minus any the user just removed
  const nights = savedEvents.filter((n) => !hiddenIds.has(n.id));

  const handleUnsave = (id) => {
    setHiddenIds((prev) => new Set(prev).add(id));
  };

  // Tabs built from the categories of the saved nights
  const categories = useMemo(
    () => ['all', ...new Set(nights.map((n) => n.category).filter(Boolean))],
    [nights]
  );

  const priceNum = (p) => (String(p).toLowerCase() === 'free' ? 0 : Number(p) || 0);

  const visibleNights = [
    ...(filter === 'all' ? nights : nights.filter((n) => n.category === filter)),
  ].sort((a, b) =>
    sort === 'soonest'
      ? String(a.startTime).localeCompare(String(b.startTime))
      : priceNum(a.price) - priceNum(b.price)
  );

  // If the active tab's last night was removed, fall back to "all"
  useEffect(() => {
    if (filter !== 'all' && !categories.includes(filter)) setFilter('all');
  }, [categories, filter]);

  return (
    <Sidebar>
      <section className="my-5">
        <h1 className="text-[26px] sm:text-[30px] font-bold tracking-tight leading-tight">
          Your next good nights
        </h1>
        <p className="mt-1 text-[#8b909a]">
          All the nights you loved. Now make a plan.
        </p>

        {nights.length > 0 && (
          <p className="mt-4 text-xs text-[#8b909a]">
            {nights.length} {nights.length === 1 ? 'night' : 'nights'} saved
          </p>
        )}

        {nights.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`cursor-pointer rounded-full border px-4 py-2 text-sm capitalize transition ${
                  filter === c
                    ? 'border-[#d2ff38]/50 bg-[#d2ff38]/10 text-[#d2ff38]'
                    : 'border-white/10 text-[#8b909a] hover:text-white'
                }`}
              >
                {c === 'all' ? 'All saved' : c}
              </button>
            ))}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="ml-auto cursor-pointer rounded-full border border-white/10 bg-[#131519] px-4 py-2 text-sm text-[#8b909a]"
            >
              <option value="soonest">Time earliest</option>
              <option value="price">Price lowest</option>
            </select>
          </div>
        )}

        {nights.length === 0 && (
          <div className="mt-10 rounded-2xl border border-white/10 bg-[#131519] p-8 text-center">
            <h2 className="text-xl font-bold">No saved nights yet</h2>
            <p className="mt-2 text-sm text-[#8b909a]">
              Tap the heart on a night you like and it will show up here.
            </p>
            <button
              onClick={() => navigate('/')}
              className="mt-5 cursor-pointer rounded-full bg-[#d2ff38] px-5 py-2.5 text-sm font-bold text-[#0b0c0e] transition hover:brightness-110 active:scale-95"
            >
              Discover nights
            </button>
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {visibleNights.map((night) => (
            <SavedNightCard
              key={night.id}
              night={night}
              onUnsave={handleUnsave}
              onBuyTickets={(event) => navigate(`/checkout/${event.id}`, { state: { event } })}
            />
          ))}
        </div>

      </section>
    </Sidebar>
  );
}

const formatPrice = (price, currency) =>
  String(price).toLowerCase() === 'free' || Number(price) === 0
    ? 'Free'
    : `${Number(price).toLocaleString()} ${currency || 'KES'}`;

// Removed the second "export default" to prevent React crashing
function SavedNightCard({ night, onUnsave, onBuyTickets }) {
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
        </div>
        <button
            onClick={() => onBuyTickets(night)}
            className="mt-4 w-full cursor-pointer rounded-full bg-[#d2ff38] px-4 py-2.5 text-xs font-bold text-[#0b0c0e] transition hover:brightness-110 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#d2ff38]"
          >
            Get tickets <span aria-hidden="true">→</span>
          </button>
      </div>
    </article>
  );
}