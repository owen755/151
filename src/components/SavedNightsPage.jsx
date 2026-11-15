import { useEffect, useState } from 'react';
import SavedNightCard from './SavedNightCard';

const API = 'http://localhost:3001';

export default function SavedNightsPage() {
  const [nights, setNights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  return (
    <div className="min-h-screen bg-[#0b0c0e] p-6 text-[#f5f6f8]">
      <h1 className="text-3xl font-bold">Your next good nights</h1>
      <p className="mt-1 text-[#8b909a]">
        All the nights you loved. Now make a plan.
      </p>

      {error && <p className="mt-6 text-sm text-red-400">{error}</p>}
      {loading && <p className="mt-6 text-[#8b909a]">Loading…</p>}

      {!loading && !error && nights.length === 0 && (
        <p className="mt-6 text-[#8b909a]">
          No saved nights yet. Go find your kind of night.
        </p>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {nights.map((night) => (
          <SavedNightCard
            key={night.id}
            night={night}
            onUnsave={handleUnsave}
            onView={() => {}}
          />
        ))}
      </div>
    </div>
  );
}
