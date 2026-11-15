import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';

const PRESET_FLYERS = [
  {
    label: 'Detty Dezemba Poster',
    url: 'https://res.cloudinary.com/b9tb2cpo/image/upload/f_auto,q_auto/DettyDezembaFestPoster'
  },
  {
    label: 'AmapianoLand Poster',
    url: 'https://res.cloudinary.com/b9tb2cpo/image/upload/f_auto,q_auto/amapianoland'
  },
  {
    label: 'Rhythm & Identity',
    url: 'https://res.cloudinary.com/b9tb2cpo/image/upload/f_auto,q_auto/rafiki_alphabet'
  },
  {
    label: 'MindTech Poster',
    url: 'https://res.cloudinary.com/b9tb2cpo/image/upload/f_auto,q_auto/mindtech'
  }
];

const NAIROBI_LOCATIONS = [
  { address: 'Nairobi, Uhuru Gardens', lat: -1.32, long: 36.8 },
  { address: 'Kimathi Street, Nairobi', lat: -1.28, long: 36.82 },
  { address: 'Ngong Racecourse, Nairobi', lat: -1.3, long: 36.74 },
  { address: 'Argwings Kodhek Rd, Nairobi', lat: -1.29, long: 36.79 },
  { address: 'Brookside Dr, Nairobi', lat: -1.25, long: 36.79 },
  { address: 'Laikipia Rd, Nairobi', lat: -1.27, long: 36.79 },
  { address: 'Jakaya Kikwete Road, Nairobi', lat: -1.29, long: 36.81 },
  { address: 'Haile Selassie Ave, Nairobi', lat: -1.29, long: 36.82 }
];

const CATEGORIES = ['music', 'charity', 'education', 'tech', 'wellness'];

export default function HostPage() {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('music');
  const [description, setDescription] = useState('');
  const [venue, setVenue] = useState('');
  const [address, setAddress] = useState(NAIROBI_LOCATIONS[0].address);
  const [startTime, setStartTime] = useState('19:00');
  const [endTime, setEndTime] = useState('Till Dawn');
  const [price, setPrice] = useState('1000');
  const [image, setImage] = useState(PRESET_FLYERS[0].url);

  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim() || !venue.trim() || !description.trim()) {
      setErrorMsg('Please fill in the event title, venue name, and description.');
      return;
    }

    const locCoords =
      NAIROBI_LOCATIONS.find((l) => l.address === address) || NAIROBI_LOCATIONS[0];
    const normalizedPrice =
      String(price).trim() === '0' || String(price).trim().toLowerCase() === 'free'
        ? 'free'
        : String(Math.max(0, Number(price) || 0));

    // Matches server/db.json event schema 100%
    const newParty = {
      id: Date.now(),
      title: title.trim(),
      category,
      description: description.trim(),
      image: image.trim() || PRESET_FLYERS[0].url,
      startTime: startTime.trim() || '19:00',
      endTime: endTime.trim() || 'Till Dawn',
      price: normalizedPrice,
      currency: 'KES',
      location: {
        venue: venue.trim(),
        address,
        lat: locCoords.lat,
        long: locCoords.long
      }
    };

    setIsSubmitting(true);

    try {
      const existing = JSON.parse(sessionStorage.getItem('aftr_hosted_events') || '[]');
      sessionStorage.setItem('aftr_hosted_events', JSON.stringify([newParty, ...existing]));
    } catch (err) {
      console.error(err);
    }

    fetch('http://localhost:3000/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newParty)
    }).catch(() => {});

    setPublishSuccess(true);
    setTimeout(() => {
      navigate('/');
    }, 700);
  };

  const previewPriceNum = Number(price) || 0;

  return (
    <Sidebar>
      <section className="my-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-[26px] sm:text-[30px] font-bold tracking-tight leading-tight">
            Put your night on the map.
          </h1>
          <p className="text-[12px] sm:text-[13px] text-[#8b909a] mt-0.5">
            Creates an event matching the exact team db.json schema.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/')}
          className="self-start sm:self-auto text-xs font-semibold text-[#8b909a] hover:text-white bg-white/[0.04] border border-white/[0.08] px-4 py-2 rounded-full cursor-pointer transition"
        >
          ← Back to Discover Deck
        </button>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-8 items-start flex-1">
        <form
          onSubmit={handleSubmit}
          className="bg-[#131519] border border-white/[0.08] rounded-[22px] p-5 sm:p-6 space-y-4"
        >
          {errorMsg && (
            <div className="bg-red-500/15 border border-red-500/40 text-red-300 text-xs px-4 py-3 rounded-xl">
              {errorMsg}
            </div>
          )}

          {publishSuccess && (
            <div className="bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-xs font-bold px-4 py-3 rounded-xl">
              Event published! Redirecting you to the Discover swipe deck...
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-bold tracking-wider text-[#8b909a] mb-1.5">
                EVENT TITLE *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Detty Dezemba"
                className="w-full bg-[#0e1013] border border-white/[0.1] focus:border-[#d2ff38] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold tracking-wider text-[#8b909a] mb-1.5">
                VENUE NAME (location.venue) *
              </label>
              <input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="e.g. Uhuru Gardens"
                className="w-full bg-[#0e1013] border border-white/[0.1] focus:border-[#d2ff38] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold tracking-wider text-[#8b909a] mb-1.5">
              DESCRIPTION *
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Live Afro house artists in Nairobi, with a special guest performance."
              className="w-full bg-[#0e1013] border border-white/[0.1] focus:border-[#d2ff38] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-bold tracking-wider text-[#8b909a] mb-1.5">
                ADDRESS (location.address)
              </label>
              <select
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-[#0e1013] border border-white/[0.1] focus:border-[#d2ff38] rounded-xl px-3 py-2.5 text-xs text-white outline-none"
              >
                {NAIROBI_LOCATIONS.map((loc) => (
                  <option key={loc.address} value={loc.address}>
                    {loc.address}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold tracking-wider text-[#8b909a] mb-1.5">
                PRICE (KES — enter 0 for "free")
              </label>
              <input
                type="number"
                min="0"
                step="100"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0 for free"
                className="w-full bg-[#0e1013] border border-white/[0.1] focus:border-[#d2ff38] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-bold tracking-wider text-[#8b909a] mb-1.5">
                START TIME (startTime)
              </label>
              <input
                type="text"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                placeholder="19:00"
                className="w-full bg-[#0e1013] border border-white/[0.1] focus:border-[#d2ff38] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold tracking-wider text-[#8b909a] mb-1.5">
                END TIME (endTime)
              </label>
              <input
                type="text"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                placeholder="Till Dawn"
                className="w-full bg-[#0e1013] border border-white/[0.1] focus:border-[#d2ff38] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold tracking-wider text-[#8b909a] mb-2">
              CATEGORY
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition cursor-pointer capitalize ${
                    category === cat
                      ? 'bg-[#1e2418] text-[#d2ff38] border-[#d2ff38]/50 font-semibold'
                      : 'bg-[#0e1013] text-[#8b909a] border-white/[0.08] hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold tracking-wider text-[#8b909a] mb-2">
              POSTER IMAGE URL
            </label>
            <div className="flex flex-wrap gap-2 mb-2.5">
              {PRESET_FLYERS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setImage(preset.url)}
                  className={`px-3 py-1 rounded-full text-[11px] border cursor-pointer transition ${
                    image === preset.url
                      ? 'bg-[#1e2418] text-[#d2ff38] border-[#d2ff38]/40 font-semibold'
                      : 'bg-[#0e1013] text-[#8b909a] border-white/10 hover:text-white'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <input
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="Paste Cloudinary or image URL (https://...)"
              className="w-full bg-[#0e1013] border border-white/[0.1] focus:border-[#d2ff38] rounded-xl px-3.5 py-2 text-xs text-white outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#d2ff38] text-[#0b0c0e] font-extrabold text-xs sm:text-sm py-3.5 rounded-full hover:brightness-110 active:scale-98 transition cursor-pointer shadow-[0_8px_24px_rgba(210,255,56,0.3)] disabled:opacity-50"
          >
            {isSubmitting ? 'Publishing...' : 'Launch Party to Tonight’s Deck →'}
          </button>
        </form>

        {/* RIGHT: LIVE SWIPE CARD PREVIEW */}
        <div className="w-full max-w-[440px] mx-auto lg:max-w-none">
          <div className="flex justify-between text-[10px] tracking-[1.2px] text-[#8b909a] mb-2">
            <span>LIVE SWIPE CARD PREVIEW</span>
            <span className="text-[#d2ff38]">DB.JSON SCHEMA</span>
          </div>

          <div
            style={{
              backgroundImage: `linear-gradient(180deg, rgba(10,10,14,0.12) 0%, rgba(10,10,14,0.95) 82%), url(${
                image || PRESET_FLYERS[0].url
              })`
            }}
            className="w-full h-[420px] rounded-[22px] bg-cover bg-center p-5 sm:p-6 flex flex-col justify-between border border-white/[0.14] shadow-[0_18px_40px_rgba(0,0,0,0.65)]"
          >
            <div className="flex items-center justify-between">
              <span className="bg-[#d2ff38] text-[#0b0c0e] text-[10px] font-extrabold px-3 py-1 rounded-full uppercase">
                TONIGHT'S {category}
              </span>
              <span className="bg-black/75 backdrop-blur-md text-white text-[11px] font-semibold px-3 py-1 rounded-full border border-white/15">
                {previewPriceNum === 0
                  ? 'Free Entry'
                  : `KES ${previewPriceNum.toLocaleString()} cover`}
              </span>
            </div>

            <div>
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                <span className="bg-white/15 backdrop-blur-md text-white text-[11px] px-2.5 py-0.5 rounded-full capitalize">
                  {category}
                </span>
                <span className="bg-white/15 backdrop-blur-md text-white text-[11px] px-2.5 py-0.5 rounded-full">
                  {address}
                </span>
              </div>

              <h2 className="text-[26px] sm:text-[30px] font-extrabold tracking-tight leading-tight mb-1">
                {title.trim() || 'Your Event Title'}
              </h2>
              <p className="text-[12px] sm:text-[13px] text-gray-300 mb-3.5 line-clamp-2">
                {description.trim() || 'Your event description appears right here.'}
              </p>

              <div className="flex items-end justify-between">
                <div className="flex flex-col gap-0.5 text-[12px] text-gray-300">
                  <span>
                    {venue.trim() || 'Venue Name'} • {address}
                  </span>
                  <span>
                    {startTime || '19:00'} – {endTime || 'Till Dawn'}
                  </span>
                </div>

                <span className="w-9 h-9 rounded-full bg-white/15 border border-white/20 text-white text-sm flex items-center justify-center">
                  →
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Sidebar>
  );
}