import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PRESET_FLYERS = [
  {
    label: 'Neon Crowd',
    url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1000&auto=format&fit=crop&q=80'
  },
  {
    label: 'Club Lasers',
    url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1000&auto=format&fit=crop&q=80'
  },
  {
    label: 'Confetti Night',
    url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1000&auto=format&fit=crop&q=80'
  },
  {
    label: 'Red Booth',
    url: 'https://images.unsplash.com/photo-1545128485-c400e7702796?w=1000&auto=format&fit=crop&q=80'
  }
];

const NAIROBI_ZONES = [
  { city: 'Westlands, Nairobi', neighborhood: 'WESTLANDS' },
  { city: 'Kilimani, Nairobi', neighborhood: 'KILIMANI' },
  { city: 'Karen, Nairobi', neighborhood: 'KAREN' },
  { city: 'Lavington, Nairobi', neighborhood: 'LAVINGTON' },
  { city: 'Kileleshwa, Nairobi', neighborhood: 'KILELESHWA' },
  { city: 'Ngong Road, Nairobi', neighborhood: 'NGONG RD' }
];

const VIBE_OPTIONS = [
  'House',
  'Rooftop',
  'Amapiano',
  'Afrobeats',
  'Techno',
  'Warehouse',
  'Disco',
  'Hip-Hop',
  'Lounge'
];

const formatKsh = (amount) =>
  Number(amount) === 0 ? 'Free' : `KSh ${Number(amount).toLocaleString()}`;

export default function HostPage() {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [venue, setVenue] = useState('');
  const [selectedZone, setSelectedZone] = useState(NAIROBI_ZONES[0].city);
  const [time, setTime] = useState('Tonight, 9 PM – late');
  const [price, setPrice] = useState('1000');
  const [spotsLeft, setSpotsLeft] = useState('15');
  const [distanceKm, setDistanceKm] = useState('1.4');
  const [pickLabel, setPickLabel] = useState('HOST EXCLUSIVE');
  const [selectedTags, setSelectedTags] = useState(['House', 'Rooftop']);
  const [image, setImage] = useState(PRESET_FLYERS[0].url);

  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      if (selectedTags.length > 1) {
        setSelectedTags(selectedTags.filter((t) => t !== tag));
      }
    } else if (selectedTags.length < 3) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim() || !venue.trim() || !subtitle.trim()) {
      setErrorMsg('Please fill in the party title, one-line pitch, and venue name.');
      return;
    }

    const numericPrice = Math.max(0, Number(price) || 0);
    const numericSpots = Math.max(1, Number(spotsLeft) || 10);
    const numericDist = Math.max(0.2, Number(distanceKm) || 1.5);
    const zoneObj =
      NAIROBI_ZONES.find((z) => z.city === selectedZone) || NAIROBI_ZONES[0];

    const newParty = {
      id: String(Date.now()),
      city: zoneObj.city,
      neighborhood: zoneObj.neighborhood,
      pickLabel,
      title: title.trim(),
      subtitle: subtitle.trim(),
      venue: venue.trim(),
      distance: `${numericDist.toFixed(1)} km`,
      distanceKm: Number(numericDist.toFixed(1)),
      time: time.trim() || 'Tonight, 9 PM – late',
      price: numericPrice,
      tags: selectedTags,
      spotsLeft: numericSpots,
      image: image.trim() || PRESET_FLYERS[0].url
    };

    setIsSubmitting(true);

    try {
      const existing = JSON.parse(sessionStorage.getItem('aftr_hosted_events') || '[]');
      sessionStorage.setItem('aftr_hosted_events', JSON.stringify([newParty, ...existing]));
    } catch (err) {
      console.error(err);
    }

    setPublishSuccess(true);
    setTimeout(() => {
      navigate('/');
    }, 700);
  };

  return (
    <div className="min-h-screen w-full bg-[#0b0c0e] text-[#f5f6f8] flex overflow-x-hidden">
      {/* ================= LEFT SIDEBAR (Desktop lg+) ================= */}
      <aside className="hidden lg:flex w-[240px] xl:w-[260px] bg-[#0e1013] border-r border-white/[0.08] px-5 py-6 flex-col shrink-0 sticky top-0 h-screen">
        <div className="px-1">
          <div className="text-[28px] font-extrabold tracking-tight leading-none">
            aftr<span className="text-[#d2ff38]">.</span>
          </div>
          <p className="text-[9px] tracking-[1.4px] text-[#8b909a] mt-1.5">
            GO OUT. FIND YOUR PEOPLE.
          </p>
        </div>

        <nav className="mt-8 flex flex-col gap-1.5">
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-medium text-[#8b909a] hover:text-white hover:bg-white/[0.04] transition cursor-pointer"
          >
            <span>Discover</span>
          </button>

          <button
            onClick={() => navigate('/saved-nights')}
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-medium text-[#8b909a] hover:text-white hover:bg-white/[0.04] transition cursor-pointer"
          >
            <span>Saved nights</span>
          </button>

          <button
            onClick={() => navigate('/my-tickets')}
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-medium text-[#8b909a] hover:text-white hover:bg-white/[0.04] transition cursor-pointer"
          >
            <span>My tickets</span>
          </button>

          <button
            onClick={() => navigate('/explore')}
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-medium text-[#8b909a] hover:text-white hover:bg-white/[0.04] transition cursor-pointer"
          >
            <span>Explore map</span>
          </button>
        </nav>

        <div className="mt-auto mb-5 bg-[#1e2418] border border-[#d2ff38]/40 rounded-2xl p-4">
          <span className="inline-block text-[9px] font-extrabold tracking-wider text-[#d2ff38] mb-1">
            ACTIVE MODE
          </span>
          <h4 className="text-[14px] font-bold mb-1 text-white">Host Creator Portal</h4>
          <p className="text-[11px] text-[#8b909a] leading-snug">
            Launch your event into tonight's live swipe deck across Nairobi.
          </p>
        </div>

        <div className="border-t border-white/[0.08] pt-4 flex flex-col gap-3">
          <button
            onClick={() => navigate('/')}
            className="text-[11px] text-[#8b909a] text-left hover:text-white cursor-pointer"
          >
            ← Back to Discover
          </button>
        </div>
      </aside>

      {/* ================= MAIN WORKSPACE ================= */}
      <div className="flex-1 flex flex-col px-4 py-4 sm:px-7 sm:py-5 lg:px-10 lg:py-6 min-w-0">
        {/* TOP BAR */}
        <header className="flex items-center justify-between pb-3.5 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <span
              onClick={() => navigate('/')}
              className="lg:hidden text-[22px] font-extrabold tracking-tight cursor-pointer"
            >
              aftr<span className="text-[#d2ff38]">.</span>
            </span>
            <span className="bg-[#1e2418] text-[#d2ff38] border border-[#d2ff38]/30 text-[11px] font-bold px-3 py-1 rounded-full">
              HOST A PARTY • TONIGHT ONLY
            </span>
          </div>

          <button
            onClick={() => navigate('/')}
            className="text-xs font-semibold text-[#8b909a] hover:text-white bg-white/[0.04] border border-white/[0.08] px-3.5 py-1.5 rounded-full cursor-pointer transition"
          >
            ← Back to Discover Deck
          </button>
        </header>

        {/* HERO HEADER */}
        <section className="my-5">
          <h1 className="text-[26px] sm:text-[30px] font-bold tracking-tight leading-tight">
            Put your night on the map.
          </h1>
          <p className="text-[12px] sm:text-[13px] text-[#8b909a] mt-0.5">
            Fill in tonight's plot details on the left and watch your live swipe card update on the right.
          </p>
        </section>

        {/* 2-COLUMN FORM + LIVE CARD PREVIEW */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-8 items-start flex-1">
          {/* LEFT: CONTROLLED FORM */}
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
                Party published! Redirecting you to the Discover swipe deck...
              </div>
            )}

            {/* Title & Venue */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[11px] font-bold tracking-wider text-[#8b909a] mb-1.5">
                  PARTY TITLE *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Midnight Rooftop Groove"
                  className="w-full bg-[#0e1013] border border-white/[0.1] focus:border-[#d2ff38] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold tracking-wider text-[#8b909a] mb-1.5">
                  VENUE NAME *
                </label>
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="e.g. The Alchemist Deck"
                  className="w-full bg-[#0e1013] border border-white/[0.1] focus:border-[#d2ff38] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold tracking-wider text-[#8b909a] mb-1.5">
                ONE-LINE VIBE PITCH *
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g. A rooftop, a sunset, and deep amapiano sets till dawn."
                className="w-full bg-[#0e1013] border border-white/[0.1] focus:border-[#d2ff38] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
              />
            </div>

            {/* Zone, Time, Badge */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-[11px] font-bold tracking-wider text-[#8b909a] mb-1.5">
                  NAIROBI ZONE
                </label>
                <select
                  value={selectedZone}
                  onChange={(e) => setSelectedZone(e.target.value)}
                  className="w-full bg-[#0e1013] border border-white/[0.1] focus:border-[#d2ff38] rounded-xl px-3 py-2.5 text-xs text-white outline-none"
                >
                  {NAIROBI_ZONES.map((z) => (
                    <option key={z.city} value={z.city}>
                      {z.city}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold tracking-wider text-[#8b909a] mb-1.5">
                  START TIME
                </label>
                <input
                  type="text"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  placeholder="Tonight, 9 PM – late"
                  className="w-full bg-[#0e1013] border border-white/[0.1] focus:border-[#d2ff38] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold tracking-wider text-[#8b909a] mb-1.5">
                  TOP BADGE
                </label>
                <select
                  value={pickLabel}
                  onChange={(e) => setPickLabel(e.target.value)}
                  className="w-full bg-[#0e1013] border border-white/[0.1] focus:border-[#d2ff38] rounded-xl px-3 py-2.5 text-xs text-white outline-none"
                >
                  <option value="HOST EXCLUSIVE">HOST EXCLUSIVE</option>
                  <option value="TONIGHT'S PICK">TONIGHT'S PICK</option>
                  <option value="SECRET PIN">SECRET PIN</option>
                  <option value="FILLING FAST">FILLING FAST</option>
                  <option value="VIP CURATED">VIP CURATED</option>
                </select>
              </div>
            </div>

            {/* KSh Price, Spots Left, Distance */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-[11px] font-bold tracking-wider text-[#8b909a] mb-1.5">
                  COVER CHARGE (KSh)
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0 for Free"
                  className="w-full bg-[#0e1013] border border-white/[0.1] focus:border-[#d2ff38] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold tracking-wider text-[#8b909a] mb-1.5">
                  SPOTS LEFT
                </label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={spotsLeft}
                  onChange={(e) => setSpotsLeft(e.target.value)}
                  className="w-full bg-[#0e1013] border border-white/[0.1] focus:border-[#d2ff38] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold tracking-wider text-[#8b909a] mb-1.5">
                  DISTANCE (KM)
                </label>
                <input
                  type="number"
                  min="0.2"
                  step="0.2"
                  value={distanceKm}
                  onChange={(e) => setDistanceKm(e.target.value)}
                  className="w-full bg-[#0e1013] border border-white/[0.1] focus:border-[#d2ff38] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                />
              </div>
            </div>

            {/* Vibe Tags Selector */}
            <div>
              <label className="block text-[11px] font-bold tracking-wider text-[#8b909a] mb-2">
                SELECT UP TO 3 VIBE TAGS
              </label>
              <div className="flex flex-wrap gap-2">
                {VIBE_OPTIONS.map((tag) => {
                  const active = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition cursor-pointer ${
                        active
                          ? 'bg-[#1e2418] text-[#d2ff38] border-[#d2ff38]/50 font-semibold'
                          : 'bg-[#0e1013] text-[#8b909a] border-white/[0.08] hover:text-white'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cover Flyer Image Picker */}
            <div>
              <label className="block text-[11px] font-bold tracking-wider text-[#8b909a] mb-2">
                FLYER BACKGROUND IMAGE
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
                placeholder="Or paste custom image URL (https://...)"
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
              <span className="text-[#d2ff38]">REAL-TIME</span>
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
                <span className="bg-[#d2ff38] text-[#0b0c0e] text-[10px] font-extrabold px-3 py-1 rounded-full">
                  {pickLabel}
                </span>
                <span className="bg-black/75 backdrop-blur-md text-white text-[11px] font-semibold px-3 py-1 rounded-full border border-white/15">
                  {Number(price) === 0 ? 'Free' : `${formatKsh(price)} cover`}
                </span>
              </div>

              <div>
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {selectedTags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-white/15 backdrop-blur-md text-white text-[11px] px-2.5 py-0.5 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                  <span className="bg-[#d2ff38]/20 text-[#d2ff38] border border-[#d2ff38]/35 text-[11px] px-2.5 py-0.5 rounded-full font-semibold">
                    {spotsLeft || 15} spots left
                  </span>
                </div>

                <h2 className="text-[26px] sm:text-[30px] font-extrabold tracking-tight leading-tight mb-1">
                  {title.trim() || 'Your Party Title.'}
                </h2>
                <p className="text-[12px] sm:text-[13px] text-gray-300 mb-3.5">
                  {subtitle.trim() || 'Your one-line pitch appears right here.'}
                </p>

                <div className="flex items-end justify-between">
                  <div className="flex flex-col gap-0.5 text-[12px] text-gray-300">
                    <span>
                      {venue.trim() || 'Venue Name'} • {Number(distanceKm || 1.4).toFixed(1)} km
                    </span>
                    <span>{time || 'Tonight, 9 PM – late'}</span>
                  </div>

                  <span className="w-9 h-9 rounded-full bg-white/15 border border-white/20 text-white text-sm flex items-center justify-center">
                    →
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}