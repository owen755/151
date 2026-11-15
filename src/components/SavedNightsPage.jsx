import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SavedNightCard from './SavedNightCard';

const API = 'http://localhost:3001';

export default function SavedNightsPage() {
  const navigate = useNavigate();
  const [nights, setNights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetch(`${API}/saved`)
      .then((res) => {
        if (!res.ok) throw new Error('Could not load saved nights');
        return res.json();
      })
      .then(setNights)
      .catch(() => setError('Could not load saved nights. Is the server running?'))
      .finally(() => setLoading(false));
  }, []);

  const handleUnsave = async (id) => {
    try {
      await fetch(`${API}/saved/${id}`, { method: 'DELETE' });
      setNights((prev) => prev.filter((n) => n.id !== id));
    } catch {
      setError('Could not remove that night. Try again.');
    }
  };

  // Tabs built from the categories of the saved nights
  const categories = useMemo(
    () => ['all', ...new Set(nights.map((n) => n.category).filter(Boolean))],
    [nights]
  );

  const visibleNights =
    filter === 'all' ? nights : nights.filter((n) => n.category === filter);

  // If the active tab's last night was removed, fall back to "all"
  useEffect(() => {
    if (filter !== 'all' && !categories.includes(filter)) setFilter('all');
  }, [categories, filter]);

  return (
    <div className="min-h-screen bg-[#0b0c0e] p-6 text-[#f5f6f8]">
      <h1 className="text-3xl font-bold">Your next good nights</h1>
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
        </div>
      )}

      {error && <p className="mt-6 text-sm text-red-400">{error}</p>}
      {loading && <p className="mt-6 text-[#8b909a]">Loading…</p>}

            {!loading && !error && nights.length === 0 && (
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
            onView={(id) => navigate(`/events/${id}`)}
          />
        ))}
      </div>

       <p className="mt-10 text-xs text-[#8b909a]">
        Real events. Local energy. Always a good story.
      </p>
    </div>
  );
}
