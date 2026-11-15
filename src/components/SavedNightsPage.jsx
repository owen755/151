import { useState } from 'react';
import SavedNightCard from './SavedNightCard';

const INITIAL_NIGHTS = [
  { id: 1, title: 'Above the city', subtitle: 'House · Rooftop', venue: 'Westlands Rooftop', distance: '1.2 km', distanceKm: 1.2, price: 2000, image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1000&auto=format&fit=crop&q=80' },
  { id: 2, title: 'Basement frequencies', subtitle: 'Techno · Late night', venue: 'The Basement', distance: '2.4 km', distanceKm: 2.4, price: 1000, image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1000&auto=format&fit=crop&q=80' },
  { id: 3, title: 'Disco, not dead.', subtitle: 'Disco · Throwback', venue: 'Kilimani Hall', distance: '0.8 km', distanceKm: 0.8, price: 0, image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1000&auto=format&fit=crop&q=80' },
  { id: 4, title: 'Sunday on the roof', subtitle: 'House · Sunset', venue: 'Westlands Rooftop', distance: '1.2 km', distanceKm: 1.2, price: 1500, image: 'https://images.unsplash.com/photo-1545128485-c400e7702796?w=1000&auto=format&fit=crop&q=80' },
];
    
export default function SavedNightsPage() {
    const [nights, setNights] = useState(INITIAL_NIGHTS);

    const handleUnsave = (id) =>
    setNights((prev) => prev.filter((n) => n.id !== id));

    return (
        <div className="min-h-screen bg-[#0b0c0e] p-6 text-[#f56f8]">
            <h1>Your next good nights</h1>
            <p className="mt-1 text-[#8b909a]">All the nights you loved. Now make a plan.</p>


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