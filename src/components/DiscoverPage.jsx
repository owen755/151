import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1000&auto=format&fit=crop&q=80';

const PARTY_IMAGES = [
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1545128485-c400e7702796?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=1000&auto=format&fit=crop&q=80'
];

function generate60TonightEvents() {
  const zones = [
    { area: 'Westlands, Nairobi', neighborhood: 'WESTLANDS' },
    { area: 'Kilimani, Nairobi', neighborhood: 'KILIMANI' },
    { area: 'Karen, Nairobi', neighborhood: 'KAREN' },
    { area: 'Lavington, Nairobi', neighborhood: 'LAVINGTON' },
    { area: 'Kileleshwa, Nairobi', neighborhood: 'KILELESHWA' },
    { area: 'Ngong Road, Nairobi', neighborhood: 'NGONG RD' }
  ];

  const titles = [
    'Above the city.',
    'Basement frequencies',
    'Disco, not dead.',
    'Velvet Afterhours',
    'Skyline Amapiano Sundowner',
    'Westlands Bass Bunker',
    'Neon Rooftop Sessions',
    'Midnight Vinyl Society',
    'Subzero Warehouse Rave',
    'Afro-House & Sunset Grill',
    'Golden Hour Penthouse',
    'Underground Drill & Bass',
    'Secret Garden Nocturne',
    'Electric Mirage Night',
    'Boiler Room Nairobi Edition',
    'Lo-Fi & Cocktails Unplugged',
    'Afterdark Techno Syndicate',
    'Pulse 254 Rooftop',
    'Rhythm & Smoke Courtyard',
    'Eclipse Secret Pin Drop'
  ];

  const venues = [
    'The Alchemist Deck',
    'Kilimani Penthouse Loft',
    '1824 Secret Courtyard',
    'K1 Klubhouse Vault',
    'SkyLuxx Panorama Lounge',
    'Karen Oasis Villa',
    'Lavington Glasshouse',
    'B-Club VIP Terrace',
    'Muze Open Air',
    'The Sanctuary Rooftop'
  ];

  const vibePairs = [
    ['House', 'Rooftop'],
    ['Techno', 'Warehouse'],
    ['Amapiano', 'Afrobeats'],
    ['Disco', 'House'],
    ['Hip-Hop', 'Lounge'],
    ['Afrobeats', 'Rooftop']
  ];

  const subtitles = [
    'A rooftop, a sunset, and your new favorite DJ.',
    'Raw industrial warehouse sound system all night.',
    'Vinyl-only grooves, mirrorballs, and zero pretension.',
    'Late-night amapiano log drums and secret guest sets.',
    'Intimate penthouse energy with panoramic city lights.',
    'High-voltage club edits, heavy basslines, and late-night bites.'
  ];

  const pickLabels = [
    "TONIGHT'S PICK",
    'CROWD FAVORITE',
    'UNDERGROUND PICK',
    'SECRET PIN',
    'FILLING FAST',
    'VIP CURATED'
  ];

  const kshPrices = [0, 500, 800, 1000, 1200, 1500, 2000, 2500, 3000];
  const startTimes = [
    'Tonight, 7 PM – late',
    'Tonight, 8 PM – late',
    'Tonight, 9 PM – 3 AM',
    'Tonight, 10 PM – 4 AM',
    'Tonight, 11 PM – dawn'
  ];

  return Array.from({ length: 60 }, (_, i) => {
    const zone = zones[i % zones.length];
    const baseTitle = titles[i % titles.length];
    const edition = i >= titles.length ? ` Vol. ${Math.floor(i / titles.length) + 1}` : '';
    const dist = Number((0.6 + ((i * 0.45) % 6.8)).toFixed(1));
    const price = kshPrices[i % kshPrices.length];
    const spotsLeft = 3 + ((i * 7) % 28);

    return {
      id: String(i + 1),
      city: zone.area,
      neighborhood: zone.neighborhood,
      pickLabel: pickLabels[i % pickLabels.length],
      title: `${baseTitle}${edition}`,
      subtitle: subtitles[i % subtitles.length],
      venue: `${venues[i % venues.length]}`,
      distance: `${dist} km`,
      distanceKm: dist,
      time: startTimes[i % startTimes.length],
      price,
      tags: vibePairs[i % vibePairs.length],
      spotsLeft,
      image: PARTY_IMAGES[i % PARTY_IMAGES.length]
    };
  });
}

const SIXTY_EVENTS = generate60TonightEvents();

const LOCATIONS = [
  'All Nairobi Zones',
  'Westlands, Nairobi',
  'Kilimani, Nairobi',
  'Karen, Nairobi',
  'Lavington, Nairobi',
  'Kileleshwa, Nairobi',
  'Ngong Road, Nairobi'
];

const formatKsh = (amount) =>
  Number(amount) === 0 ? 'Free' : `KSh ${Number(amount).toLocaleString()}`;

export default function DiscoverPage() {
  const navigate = useNavigate();

  const [events, setEvents] = useState(SIXTY_EVENTS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [history, setHistory] = useState([]);
  const [nearbyVisibleCount, setNearbyVisibleCount] = useState(8);

  const [selectedLocation, setSelectedLocation] = useState('All Nairobi Zones');
  const [locationMenuOpen, setLocationMenuOpen] = useState(false);

  // Search Bar States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);

  const [activeVibe, setActiveVibe] = useState('All vibes');
  const [freeOnly, setFreeOnly] = useState(false);
  const [within5Km, setWithin5Km] = useState(false);

  const [animState, setAnimState] = useState(''); // 'left' | 'right' | 'rewind'
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const locationDropdownRef = useRef(null);
  const searchBoxRef = useRef(null);

  const [surpriseModalOpen, setSurpriseModalOpen] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [surpriseEvent, setSurpriseEvent] = useState(null);
  const [surpriseCriteria, setSurpriseCriteria] = useState('fit');
  const [matchReason, setMatchReason] = useState('');
  const lastSurpriseIdRef = useRef(null);
  const rollIntervalRef = useRef(null);

  useEffect(() => {
    fetch('http://localhost:3000/events')
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (Array.isArray(data) && data.length >= 10) {
          setEvents(data);
        }
      })
      .catch(() => {});
  }, []);

  // Close Location & Search dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(e.target)) {
        setLocationMenuOpen(false);
      }
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setSearchDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      if (rollIntervalRef.current) clearInterval(rollIntervalRef.current);
    };
  }, []);

  // Multi-field, multi-word live search + filter engine
  const filteredEvents = useMemo(() => {
    const rawQuery = searchQuery.trim().toLowerCase();
    const queryWords = rawQuery ? rawQuery.split(/\s+/) : [];

    return events.filter((ev) => {
      const cityStr = (ev.city || '').toLowerCase();
      const matchesLocation =
        selectedLocation === 'All Nairobi Zones' ||
        !cityStr ||
        cityStr === selectedLocation.toLowerCase();

      // Build a single searchable string from all event properties
      const tagsList = Array.isArray(ev.tags)
        ? ev.tags
        : ev.vibe
        ? [ev.vibe]
        : [];
      const priceLabel = Number(ev.price) === 0 ? 'free 0' : `${ev.price} ksh`;
      const searchableBlob = [
        ev.title,
        ev.subtitle,
        ev.venue,
        ev.neighborhood,
        ev.city,
        ev.pickLabel,
        ev.time,
        priceLabel,
        ...tagsList
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      // Every word typed in the search box must match somewhere in the event
      const matchesSearch =
        queryWords.length === 0 ||
        queryWords.every((word) => searchableBlob.includes(word));

      const matchesVibe =
        activeVibe === 'All vibes' ||
        tagsList.some((t) => String(t).toLowerCase().includes(activeVibe.toLowerCase()));

      const matchesPrice = !freeOnly || Number(ev.price) === 0;
      const distVal = typeof ev.distanceKm === 'number' ? ev.distanceKm : parseFloat(ev.distance) || 0;
      const matchesDistance = !within5Km || distVal <= 5;

      return matchesLocation && matchesSearch && matchesVibe && matchesPrice && matchesDistance;
    });
  }, [events, selectedLocation, searchQuery, activeVibe, freeOnly, within5Km]);

  // Keep currentIndex valid whenever search results change
  useEffect(() => {
    setCurrentIndex(0);
    setAnimState('');
    setDragOffset({ x: 0, y: 0 });
  }, [searchQuery, selectedLocation, activeVibe, freeOnly, within5Km]);

  const currentCard = filteredEvents[currentIndex];
  const nextCard = filteredEvents[currentIndex + 1];

  // --- SWIPE LEFT (RED / PASS) & SWIPE RIGHT (GREEN / I'M IN) ---
  const triggerSwipe = (direction) => {
    if (!currentCard || animState) return;

    setAnimState(direction);
    setDragOffset({ x: 0, y: 0 });

    setTimeout(() => {
      setHistory((prev) => [...prev, { index: currentIndex, direction, card: currentCard }]);
      setCurrentIndex((prev) => prev + 1);
      setAnimState('');
    }, 360);
  };

  const handleUndo = () => {
    if (history.length === 0 || animState) return;
    const lastAction = history[history.length - 1];

    setHistory((prev) => prev.slice(0, -1));
    setCurrentIndex(lastAction.index);
    setAnimState('rewind');
    setTimeout(() => setAnimState(''), 280);
  };

  const pickRandomSuitableEvent = (criteria = surpriseCriteria) => {
    if (rollIntervalRef.current) clearInterval(rollIntervalRef.current);

    const basePool = filteredEvents.length > 1 ? filteredEvents : events;
    setIsRolling(true);
    setSurpriseCriteria(criteria);

    let candidates = [...basePool];
    let reasonText = 'Curated match from tonight’s 60 live plots';

    if (criteria === 'fit') {
      candidates = basePool.filter((ev) => ev.spotsLeft <= 15);
      reasonText = 'High-energy crowd favorite tonight';
    } else if (criteria === 'closest') {
      candidates = [...basePool]
        .sort((a, b) => a.distanceKm - b.distanceKm)
        .slice(0, Math.max(8, Math.floor(basePool.length * 0.25)));
      reasonText = 'Selected from the closest venues near you';
    } else if (criteria === 'budget') {
      candidates = basePool.filter((e) => e.price <= 1000);
      reasonText = 'Budget friendly • KSh 1,000 or less';
    } else if (criteria === 'free') {
      candidates = basePool.filter((e) => e.price === 0);
      reasonText = 'Zero cover charge tonight';
    }

    if (candidates.length === 0) {
      candidates = [...basePool];
      reasonText = 'Wildcard pick from all 60 plots tonight';
    }

    const nonRepeatingPool =
      candidates.length > 1
        ? candidates.filter((c) => c.id !== lastSurpriseIdRef.current)
        : candidates;

    const finalWinner =
      nonRepeatingPool[Math.floor(Math.random() * nonRepeatingPool.length)];
    lastSurpriseIdRef.current = finalWinner.id;

    let step = 0;
    rollIntervalRef.current = setInterval(() => {
      const randomPreview = basePool[Math.floor(Math.random() * basePool.length)];
      setSurpriseEvent(randomPreview);
      step += 1;

      if (step >= 7) {
        clearInterval(rollIntervalRef.current);
        setSurpriseEvent(finalWinner);
        setMatchReason(reasonText);
        setIsRolling(false);
      }
    }, 75);
  };

  const handleSurpriseMe = () => {
    setSurpriseModalOpen(true);
    pickRandomSuitableEvent(surpriseCriteria);
  };

  const handleAcceptSurprise = () => {
    if (!surpriseEvent) return;
    setSurpriseModalOpen(false);
    navigate(`/events/${surpriseEvent.id}`);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (surpriseModalOpen || document.activeElement?.tagName === 'INPUT') return;
      if (e.key === 'ArrowLeft') triggerSwipe('left');
      if (e.key === 'ArrowRight') triggerSwipe('right');
      if (e.key === 'Backspace') handleUndo();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const handlePointerDown = (e) => {
    if (!currentCard || animState) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = (e.clientY - dragStartRef.current.y) * 0.25;
    setDragOffset({ x: dx, y: dy });
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (dragOffset.x > 100) {
      triggerSwipe('right');
    } else if (dragOffset.x < -100) {
      triggerSwipe('left');
    } else {
      setDragOffset({ x: 0, y: 0 });
    }
  };

  const getCardTransform = () => {
    if (isDragging) {
      return {
        transform: `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0) rotate(${dragOffset.x * 0.06}deg)`,
        transition: 'none'
      };
    }
    if (animState === 'left') {
      return {
        transform: 'translate3d(-130%, 20px, 0) rotate(-16deg)',
        opacity: 0,
        transition: 'transform 0.36s ease, opacity 0.36s ease'
      };
    }
    if (animState === 'right') {
      return {
        transform: 'translate3d(130%, 20px, 0) rotate(16deg)',
        opacity: 0,
        transition: 'transform 0.36s ease, opacity 0.36s ease'
      };
    }
    return {
      transform: 'translate3d(0, 0, 0) rotate(0deg)',
      opacity: 1,
      transition: 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.28s ease'
    };
  };

  const isPassingRed = dragOffset.x < -25 || animState === 'left';
  const isLikingGreen = dragOffset.x > 25 || animState === 'right';
  const stampOpacity = animState ? 1 : Math.min(Math.abs(dragOffset.x) / 85, 1);

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
          <button className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-semibold bg-[#1e2418] text-[#d2ff38] cursor-pointer">
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

        <div className="mt-auto mb-5 bg-gradient-to-br from-[#1b2116] to-[#141812] border border-[#d2ff38]/20 rounded-2xl p-4">
          <h4 className="text-[14px] font-bold mb-1">Make it a night.</h4>
          <p className="text-[11px] text-[#8b909a] leading-snug mb-3">
            Bring your people together. We'll bring the good vibes.
          </p>
          <button
            onClick={() => navigate('/host')}
            className="w-full flex items-center justify-between text-[#d2ff38] text-[12px] font-semibold cursor-pointer hover:underline"
          >
            <span>Host a party</span>
            <span>→</span>
          </button>
        </div>

        <div className="border-t border-white/[0.08] pt-4 flex flex-col gap-3">
          <button
            onClick={() => navigate('/help')}
            className="text-[11px] text-[#8b909a] text-left hover:text-white cursor-pointer"
          >
            Help & feedback
          </button>
          <div className="flex items-center gap-2.5">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120"
              alt="Jamie Miller"
              className="w-8 h-8 rounded-full object-cover"
            />
            <div>
              <strong className="block text-[12px] font-semibold leading-tight">Jamie Miller</strong>
              <span className="text-[10px] text-[#8b909a]">Your next story awaits</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ================= MAIN WORKSPACE ================= */}
      <div className="flex-1 flex flex-col px-4 py-4 sm:px-7 sm:py-5 lg:px-10 lg:py-6 min-w-0">
        {/* TOP HEADER BAR */}
        <header className="flex items-center justify-between pb-3.5 border-b border-white/[0.08]">
          <div className="flex items-center gap-3" ref={locationDropdownRef}>
            <span className="lg:hidden text-[22px] font-extrabold tracking-tight">
              aftr<span className="text-[#d2ff38]">.</span>
            </span>

            <div className="relative">
              <button
                onClick={() => setLocationMenuOpen((prev) => !prev)}
                className="flex items-center gap-1.5 text-[12px] sm:text-[13px] font-medium text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] px-3.5 py-1.5 rounded-full cursor-pointer transition"
              >
                <span>{selectedLocation}</span>
                <span
                  className={`inline-block text-[11px] transition-transform ${
                    locationMenuOpen ? 'rotate-180 text-[#d2ff38]' : ''
                  }`}
                >
                  ▾
                </span>
              </button>

              {locationMenuOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-[#14171d] border border-[#d2ff38]/30 rounded-2xl p-2 shadow-2xl z-50 flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold tracking-wider text-[#8b909a] px-2.5 py-1">
                    SWITCH TONIGHT'S ZONE
                  </span>
                  {LOCATIONS.map((loc) => (
                    <button
                      key={loc}
                      onClick={() => {
                        setSelectedLocation(loc);
                        setLocationMenuOpen(false);
                      }}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-[12px] text-left cursor-pointer transition ${
                        selectedLocation === loc
                          ? 'bg-[#1e2418] text-[#d2ff38] font-semibold'
                          : 'text-white hover:bg-white/5'
                      }`}
                    >
                      <span>{loc}</span>
                      {selectedLocation === loc && <span className="text-[#d2ff38] text-[10px]">●</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden lg:inline text-[12px] text-[#8b909a]">
              A little spontaneous looks good on you.
            </span>
            <button
              onClick={() => navigate('/notifications')}
              className="relative bg-white/[0.05] border border-white/[0.08] px-3.5 py-1 rounded-full text-[11px] text-white cursor-pointer hover:bg-white/10"
            >
              Alerts
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#d2ff38] rounded-full" />
            </button>
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120"
              alt="Profile"
              className="lg:hidden w-8 h-8 rounded-full object-cover"
            />
          </div>
        </header>

        {/* TABLET & MOBILE HORIZONTAL NAV BAR */}
        <nav className="lg:hidden grid grid-cols-4 gap-1.5 py-2.5 border-b border-white/[0.08]">
          <button className="flex flex-col items-center justify-center py-2 px-2 rounded-xl bg-[#1e2418] text-[#d2ff38] text-[11px] sm:text-[12px] font-semibold cursor-pointer">
            <span>Discover</span>
          </button>

          <button
            onClick={() => navigate('/saved-nights')}
            className="flex flex-col items-center justify-center py-2 px-2 rounded-xl text-[#8b909a] hover:bg-white/5 text-[11px] sm:text-[12px] cursor-pointer"
          >
            <span>Saved nights</span>
          </button>

          <button
            onClick={() => navigate('/my-tickets')}
            className="flex flex-col items-center justify-center py-2 px-2 rounded-xl text-[#8b909a] hover:bg-white/5 text-[11px] sm:text-[12px] cursor-pointer"
          >
            <span>My tickets</span>
          </button>

          <button
            onClick={() => navigate('/explore')}
            className="flex flex-col items-center justify-center py-2 px-2 rounded-xl text-[#8b909a] hover:bg-white/5 text-[11px] sm:text-[12px] cursor-pointer"
          >
            <span>Explore map</span>
          </button>
        </nav>

        {/* HERO TITLE + SURPRISE ME + WORKING LIVE SEARCH + FILTER PILLS */}
        <section className="my-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3.5">
            <div>
              <h1 className="text-[26px] sm:text-[30px] font-bold tracking-tight leading-tight">
                Find your kind of night.
              </h1>
              <p className="text-[12px] sm:text-[13px] text-[#8b909a] mt-0.5">
                Less scrolling. More stories worth telling.
              </p>
            </div>

            <button
              onClick={handleSurpriseMe}
              className="w-full sm:w-auto bg-[#d2ff38] text-[#0b0c0e] font-bold text-[13px] px-6 py-2.5 rounded-full hover:brightness-110 active:scale-95 transition cursor-pointer shadow-[0_6px_20px_rgba(210,255,56,0.28)]"
            >
              Surprise me
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* LIVE SEARCH INPUT + QUICK-JUMP RESULTS DROPDOWN */}
            <div ref={searchBoxRef} className="relative w-full sm:w-64">
              <div className="flex items-center bg-[#14171c] border border-white/[0.1] focus-within:border-[#d2ff38] rounded-full px-3.5 py-1.5 w-full transition">
                <input
                  type="text"
                  value={searchQuery}
                  onFocus={() => setSearchDropdownOpen(true)}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSearchDropdownOpen(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      setCurrentIndex(0);
                      setSearchDropdownOpen(false);
                    }
                    if (e.key === 'Escape') {
                      setSearchDropdownOpen(false);
                    }
                  }}
                  placeholder="Search party, venue, vibe, zone..."
                  className="bg-transparent border-none outline-none text-[12px] text-white placeholder-[#8b909a] w-full"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setCurrentIndex(0);
                      setSearchDropdownOpen(false);
                    }}
                    className="text-[11px] text-[#8b909a] hover:text-white ml-1.5 cursor-pointer"
                    aria-label="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Instant Search Results Dropdown when typing */}
              {searchDropdownOpen && searchQuery.trim() !== '' && (
                <div className="absolute top-full left-0 mt-2 w-full sm:w-80 bg-[#14171d] border border-[#d2ff38]/35 rounded-2xl p-2 shadow-2xl z-50 max-h-64 overflow-y-auto">
                  <div className="flex items-center justify-between px-2.5 py-1 text-[10px] font-bold tracking-wider text-[#8b909a]">
                    <span>MATCHING PLOTS ({filteredEvents.length})</span>
                    <span>PRESS ENTER TO FILTER</span>
                  </div>

                  {filteredEvents.length === 0 ? (
                    <div className="px-3 py-3 text-xs text-[#8b909a]">
                      No parties match “{searchQuery}”. Try another vibe or venue.
                    </div>
                  ) : (
                    filteredEvents.slice(0, 8).map((ev, idx) => (
                      <button
                        key={ev.id}
                        type="button"
                        onClick={() => {
                          setCurrentIndex(idx);
                          setSearchDropdownOpen(false);
                        }}
                        className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl hover:bg-white/[0.06] text-left transition cursor-pointer"
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white truncate">{ev.title}</div>
                          <div className="text-[10px] text-[#8b909a] truncate">
                            {ev.venue} • {ev.neighborhood} • {ev.tags.join(', ')}
                          </div>
                        </div>
                        <span className="text-[11px] font-bold text-[#d2ff38] shrink-0">
                          {formatKsh(ev.price)}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedLocation('All Nairobi Zones');
                setActiveVibe('All vibes');
                setFreeOnly(false);
                setWithin5Km(false);
              }}
              className="px-3.5 py-1.5 rounded-full text-[12px] font-semibold bg-[#1e2418] text-[#d2ff38] border border-[#d2ff38]/40 cursor-pointer"
            >
              Tonight ({filteredEvents.length})
            </button>

            <button
              onClick={() => setWithin5Km(!within5Km)}
              className={`px-3.5 py-1.5 rounded-full text-[12px] font-medium border transition cursor-pointer ${
                within5Km
                  ? 'bg-[#1e2418] text-[#d2ff38] border-[#d2ff38]/40'
                  : 'bg-[#15181d] text-[#8b909a] border-white/[0.08] hover:text-white'
              }`}
            >
              Within 5 km
            </button>

            <button
              onClick={() => {
                const vibes = ['All vibes', 'House', 'Techno', 'Amapiano', 'Disco', 'Afrobeats', 'Rooftop'];
                const next = vibes[(vibes.indexOf(activeVibe) + 1) % vibes.length];
                setActiveVibe(next);
              }}
              className={`px-3.5 py-1.5 rounded-full text-[12px] font-medium border transition cursor-pointer ${
                activeVibe !== 'All vibes'
                  ? 'bg-[#1e2418] text-[#d2ff38] border-[#d2ff38]/40'
                  : 'bg-[#15181d] text-[#8b909a] border-white/[0.08] hover:text-white'
              }`}
            >
              {activeVibe}
            </button>

            <button
              onClick={() => setFreeOnly(!freeOnly)}
              className={`px-3.5 py-1.5 rounded-full text-[12px] font-medium border transition cursor-pointer ${
                freeOnly
                  ? 'bg-[#1e2418] text-[#d2ff38] border-[#d2ff38]/40'
                  : 'bg-[#15181d] text-[#8b909a] border-white/[0.08] hover:text-white'
              }`}
            >
              {freeOnly ? 'Free only' : 'Any price'}
            </button>

            <button
              onClick={() => navigate('/explore')}
              className="px-3.5 py-1.5 rounded-full text-[12px] font-medium bg-[#15181d] text-[#8b909a] border border-white/[0.08] hover:text-white cursor-pointer"
            >
              Filters
            </button>
          </div>
        </section>

        {/* ================= 2-COLUMN DASHBOARD GRID ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] xl:grid-cols-[1.18fr_0.82fr] gap-7 xl:gap-10 items-start flex-1">
          {/* LEFT COLUMN: SWIPE DECK */}
          <div className="w-full max-w-[540px] mx-auto lg:max-w-none lg:mx-0">
            <div className="flex items-center justify-between text-[10px] tracking-[1.2px] text-[#8b909a] mb-2">
              <span>
                {searchQuery.trim()
                  ? `SEARCH RESULTS FOR "${searchQuery.toUpperCase()}"`
                  : 'CURATED FOR YOUR ENERGY'}
              </span>
              <span>
                {filteredEvents.length > 0 && currentCard
                  ? `${String(currentIndex + 1).padStart(2, '0')} / ${String(filteredEvents.length).padStart(2, '0')}`
                  : '00 / 00'}
              </span>
            </div>

            {/* Card Stack Stage */}
            <div className="relative w-full h-[400px] sm:h-[440px]">
              {nextCard && (
                <div
                  className="absolute inset-0 rounded-[22px] bg-cover bg-center border border-white/10 scale-[0.96] translate-y-3 opacity-55 brightness-75 transition-all duration-300"
                  style={{
                    backgroundImage: `linear-gradient(180deg, rgba(10,10,14,0.15) 0%, rgba(10,10,14,0.92) 85%), url(${nextCard.image})`
                  }}
                />
              )}

              {currentCard ? (
                <div
                  style={{
                    backgroundImage: `linear-gradient(180deg, rgba(10,10,14,0.1) 0%, rgba(10,10,14,0.95) 82%), url(${currentCard.image})`,
                    ...getCardTransform()
                  }}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerLeave={handlePointerUp}
                  className={`absolute inset-0 z-10 rounded-[22px] bg-cover bg-center p-5 sm:p-6 flex flex-col justify-between border-2 select-none touch-pan-y cursor-grab active:cursor-grabbing overflow-hidden ${
                    isLikingGreen
                      ? 'border-emerald-400 shadow-[0_0_50px_rgba(34,197,94,0.55)]'
                      : isPassingRed
                      ? 'border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.55)]'
                      : 'border-white/[0.12] shadow-[0_18px_40px_rgba(0,0,0,0.65)]'
                  }`}
                >
                  {/* Full-Card Color Wash Overlay on Swipe Left (Red) or Right (Green) */}
                  {isLikingGreen && (
                    <div
                      style={{ opacity: stampOpacity * 0.35 }}
                      className="absolute inset-0 bg-emerald-500 pointer-events-none z-0"
                    />
                  )}
                  {isPassingRed && (
                    <div
                      style={{ opacity: stampOpacity * 0.35 }}
                      className="absolute inset-0 bg-red-600 pointer-events-none z-0"
                    />
                  )}

                  {/* GREEN "I'M IN" STAMP */}
                  {isLikingGreen && (
                    <div
                      style={{ opacity: stampOpacity }}
                      className="absolute top-16 left-6 z-20 border-3 border-emerald-400 text-emerald-400 bg-black/80 px-4 py-1.5 rounded-xl text-2xl font-black tracking-widest -rotate-12 shadow-[0_0_25px_rgba(34,197,94,0.6)] pointer-events-none"
                    >
                      I'M IN ♡
                    </div>
                  )}

                  {/* RED "PASS" STAMP */}
                  {isPassingRed && (
                    <div
                      style={{ opacity: stampOpacity }}
                      className="absolute top-16 right-6 z-20 border-3 border-red-500 text-red-500 bg-black/80 px-4 py-1.5 rounded-xl text-2xl font-black tracking-widest rotate-12 shadow-[0_0_25px_rgba(239,68,68,0.6)] pointer-events-none"
                    >
                      PASS ✕
                    </div>
                  )}

                  {/* Top Badges */}
                  <div className="relative z-10 flex items-center justify-between">
                    <span className="bg-[#d2ff38] text-[#0b0c0e] text-[10px] font-extrabold px-3 py-1 rounded-full">
                      {currentCard.pickLabel}
                    </span>
                    <span className="bg-black/75 backdrop-blur-md text-white text-[11px] font-semibold px-3 py-1 rounded-full border border-white/15">
                      {currentCard.price === 0 ? 'Free' : `${formatKsh(currentCard.price)} cover`}
                    </span>
                  </div>

                  {/* Bottom Card Info */}
                  <div className="relative z-10">
                    <div className="flex flex-wrap gap-1.5 mb-2.5">
                      {currentCard.tags.map((tag) => (
                        <span
                          key={tag}
                          className="bg-white/15 backdrop-blur-md text-white text-[11px] px-2.5 py-0.5 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                      <span className="bg-[#d2ff38]/20 text-[#d2ff38] border border-[#d2ff38]/35 text-[11px] px-2.5 py-0.5 rounded-full font-semibold">
                        {currentCard.spotsLeft} spots left
                      </span>
                    </div>

                    <h2 className="text-[26px] sm:text-[32px] font-extrabold tracking-tight leading-tight mb-1">
                      {currentCard.title}
                    </h2>
                    <p className="text-[12px] sm:text-[13px] text-gray-300 mb-3.5">
                      {currentCard.subtitle}
                    </p>

                    <div className="flex items-end justify-between">
                      <div className="flex flex-col gap-0.5 text-[12px] text-gray-300">
                        <span>
                          {currentCard.venue} • {currentCard.distance}
                        </span>
                        <span>{currentCard.time}</span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/events/${currentCard.id}`);
                        }}
                        title="View event details"
                        className="w-9 h-9 rounded-full bg-white/15 hover:bg-[#d2ff38] hover:text-[#0b0c0e] border border-white/20 text-white text-sm flex items-center justify-center transition cursor-pointer"
                      >
                        →
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full rounded-[22px] bg-[#131519] border border-dashed border-white/15 flex flex-col items-center justify-center text-center p-6 gap-2.5">
                  <h3 className="text-base font-bold">No plots match that search tonight.</h3>
                  <p className="text-xs text-[#8b909a]">
                    Reset your search or filters to browse all 60 live places.
                  </p>
                  <button
                    onClick={() => {
                      setCurrentIndex(0);
                      setSearchQuery('');
                      setActiveVibe('All vibes');
                      setFreeOnly(false);
                      setWithin5Km(false);
                      setSelectedLocation('All Nairobi Zones');
                    }}
                    className="mt-1 bg-[#d2ff38] text-[#0b0c0e] font-bold text-xs px-4 py-2 rounded-full cursor-pointer"
                  >
                    Reset Search & Filters
                  </button>
                </div>
              )}
            </div>

            {/* Color-Coded Swipe Action Buttons (Red Pass / Green I'm In) */}
            <div className="flex flex-col items-center mt-4">
              <div className="flex items-start gap-6">
                <button
                  onClick={handleUndo}
                  disabled={history.length === 0}
                  title="Undo last swipe"
                  className="w-11 h-11 mt-2 rounded-full bg-[#15181e] border border-white/[0.12] text-white/80 hover:text-white disabled:opacity-35 flex items-center justify-center text-base cursor-pointer transition active:scale-90"
                >
                  ↺
                </button>

                {/* RED PASS BUTTON */}
                <div className="flex flex-col items-center gap-1">
                  <button
                    onClick={() => triggerSwipe('left')}
                    disabled={!currentCard}
                    className="w-14 h-14 rounded-full bg-red-500/15 border-2 border-red-500/60 text-red-400 hover:bg-red-500 hover:text-white flex items-center justify-center text-lg font-bold cursor-pointer shadow-[0_6px_20px_rgba(239,68,68,0.25)] transition active:scale-90"
                  >
                    ✕
                  </button>
                  <span className="text-[10px] font-extrabold tracking-widest text-red-400">
                    PASS
                  </span>
                </div>

                {/* GREEN I'M IN BUTTON */}
                <div className="flex flex-col items-center gap-1">
                  <button
                    onClick={() => triggerSwipe('right')}
                    disabled={!currentCard}
                    className="w-16 h-16 rounded-full bg-emerald-400 text-[#0b0c0e] hover:bg-emerald-300 flex items-center justify-center text-xl font-black cursor-pointer shadow-[0_6px_24px_rgba(34,197,94,0.45)] transition active:scale-90"
                  >
                    ♡
                  </button>
                  <span className="text-[10px] font-extrabold tracking-widest text-emerald-400">
                    I'M IN
                  </span>
                </div>
              </div>

              <p className="text-[10px] text-[#8b909a] mt-2">
                <span className="text-red-400">← Pass</span> •{' '}
                <span className="text-emerald-400">I'm In →</span>
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN: GOOD NIGHTS NEARBY & PROMO CARDS */}
          <div className="w-full flex flex-col min-w-0">
            <div className="flex items-center justify-between mb-2.5">
              <div>
                <h3 className="text-[17px] font-bold leading-snug">Good nights nearby</h3>
                <p className="text-[12px] text-[#8b909a]">
                  {searchQuery.trim()
                    ? `${filteredEvents.length} matching tonight’s search`
                    : `A few more reasons to leave the couch. (${filteredEvents.length} tonight)`}
                </p>
              </div>
              <button
                onClick={() => navigate('/explore')}
                className="hidden sm:inline-flex lg:hidden items-center gap-1.5 text-[12px] font-semibold border border-white/[0.08] px-3.5 py-1.5 rounded-full hover:bg-white/5 cursor-pointer"
              >
                Explore all nearby parties <span>→</span>
              </button>
            </div>

            {filteredEvents.length === 0 ? (
              <div className="bg-[#131519] border border-white/[0.08] rounded-2xl p-5 text-center my-2">
                <p className="text-xs text-[#8b909a]">
                  No nearby parties match “{searchQuery}”.
                </p>
              </div>
            ) : (
              <div className="max-h-[255px] overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/15 [&::-webkit-scrollbar-thumb]:rounded-full">
                {filteredEvents.slice(0, nearbyVisibleCount).map((item, idx) => (
                  <div
                    key={item.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`flex items-center gap-3 bg-[#131519] border p-2.5 rounded-2xl cursor-pointer transition hover:-translate-y-0.5 ${
                      currentCard?.id === item.id
                        ? 'border-[#d2ff38]/50 bg-[#171b13]'
                        : 'border-white/[0.08] hover:border-[#d2ff38]/30'
                    }`}
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = FALLBACK_IMAGE;
                      }}
                      className="w-16 h-16 rounded-xl object-cover shrink-0 bg-[#1a1d24]"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="block text-[9px] font-bold tracking-wider text-[#d2ff38] truncate">
                        {item.tags[0].toUpperCase()} • {item.neighborhood}
                      </span>
                      <h4 className="text-[14px] font-bold text-white truncate leading-snug">
                        {item.title}
                      </h4>
                      <span className="block text-[11px] text-[#8b909a] truncate">
                        {item.time.split('–')[0]} • {item.distance}
                      </span>
                      <span className="block text-[11px] font-bold text-[#d2ff38]">
                        {formatKsh(item.price)}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/events/${item.id}`);
                      }}
                      className="text-base text-[#8b909a] hover:text-[#d2ff38] px-1.5"
                      title="Open event details"
                    >
                      ›
                    </button>
                  </div>
                ))}
              </div>
            )}

            {nearbyVisibleCount < filteredEvents.length && (
              <button
                onClick={() =>
                  setNearbyVisibleCount((prev) => Math.min(prev + 12, filteredEvents.length))
                }
                className="w-full mt-2 py-1.5 rounded-full bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] text-[11px] font-semibold text-[#d2ff38] cursor-pointer transition"
              >
                Show more places ({filteredEvents.length - nearbyVisibleCount} more)
              </button>
            )}

            <button
              onClick={() => navigate('/explore')}
              className="w-full my-3 sm:hidden lg:flex py-2.5 px-4 rounded-full border border-white/[0.08] hover:border-white/20 text-[12px] font-semibold items-center justify-between cursor-pointer transition"
            >
              <span>Explore all nearby parties</span>
              <span>→</span>
            </button>

            {/* Promo Cards Bento Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 mt-2 sm:mt-3 lg:mt-0">
              <div
                onClick={handleSurpriseMe}
                className="bg-gradient-to-br from-[#221c38] to-[#171426] border border-purple-400/20 rounded-2xl p-4 cursor-pointer hover:border-purple-400/40 transition"
              >
                <span className="inline-block bg-white/[0.08] text-purple-300 text-[9px] font-bold px-2.5 py-0.5 rounded-full mb-2">
                  A LITTLE MAIN CHARACTER ENERGY
                </span>
                <h3 className="text-[18px] font-bold mb-1">No plans? Perfect.</h3>
                <p className="text-[11px] text-purple-200/75 leading-relaxed">
                  The best nights usually start that way. Let a little luck pick where you end up.
                </p>
              </div>

              <div className="lg:hidden bg-gradient-to-br from-[#1b2116] to-[#141812] border border-[#d2ff38]/20 rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <h4 className="text-[15px] font-bold mb-1">Make it a night.</h4>
                  <p className="text-[11px] text-[#8b909a] leading-relaxed mb-3">
                    Bring your people together. We'll bring the good vibes.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/host')}
                  className="w-full flex items-center justify-between text-[#d2ff38] text-[12px] font-bold cursor-pointer"
                >
                  <span>Host a party</span>
                  <span>→</span>
                </button>
              </div>
            </div>

            <p className="text-[11px] text-[#8b909a] mt-3">
              Real events. Local energy. Always a good story.
            </p>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="mt-8 pt-3.5 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-[#8b909a]">
          <span>GOOD PEOPLE. GREAT NIGHTS.</span>
          <span>Discover spontaneously. Party responsibly. 21+</span>
        </footer>
      </div>

      {/* ================= SURPRISE ME POPUP MODAL ================= */}
      {surpriseModalOpen && surpriseEvent && (
        <div
          onClick={() => setSurpriseModalOpen(false)}
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[440px] bg-[#12141a] border border-[#d2ff38]/30 rounded-[24px] p-5 shadow-2xl"
          >
            <button
              onClick={() => setSurpriseModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-xs text-white flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>

            <span className="inline-block bg-white/10 text-purple-300 text-[9px] font-bold px-2.5 py-0.5 rounded-full mb-1.5">
              TONIGHT'S FATE PICKER
            </span>
            <h2 className="text-xl font-extrabold">
              {isRolling ? 'Scanning 60 live plots...' : 'We found your spot.'}
            </h2>
            <p className="text-[11px] text-[#d2ff38] mt-0.5 mb-3.5">
              {isRolling ? 'Matching your vibe & budget...' : matchReason}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mb-3.5">
              {[
                { key: 'fit', label: 'Best Fit' },
                { key: 'closest', label: 'Closest' },
                { key: 'budget', label: 'Under KSh 1K' },
                { key: 'free', label: 'Free Entry' }
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => pickRandomSuitableEvent(item.key)}
                  className={`py-1.5 px-2 rounded-full text-[11px] font-semibold border transition cursor-pointer ${
                    surpriseCriteria === item.key
                      ? 'bg-[#1e2418] text-[#d2ff38] border-[#d2ff38]/50'
                      : 'bg-[#181b22] text-[#8b909a] border-white/10 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div
              style={{
                backgroundImage: `linear-gradient(180deg, rgba(11,12,14,0.15) 0%, rgba(11,12,14,0.96) 80%), url(${surpriseEvent.image})`
              }}
              className={`h-64 rounded-2xl bg-cover bg-center p-4 flex flex-col justify-between border border-white/15 mb-4 transition-all duration-200 ${
                isRolling ? 'blur-[2px] scale-95 brightness-125' : 'scale-100'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="bg-[#d2ff38] text-[#0b0c0e] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                  PLOT #{surpriseEvent.id} • VIBE MATCH
                </span>
                <span className="bg-black/75 text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-white/15">
                  {surpriseEvent.price === 0
                    ? 'Free Entry'
                    : `${formatKsh(surpriseEvent.price)} cover`}
                </span>
              </div>

              <div>
                <div className="flex flex-wrap gap-1.5 mb-1.5">
                  {surpriseEvent.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-white/15 text-white text-[10px] px-2 py-0.5 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                  <span className="bg-[#d2ff38]/20 text-[#d2ff38] text-[10px] px-2 py-0.5 rounded-full font-semibold">
                    {surpriseEvent.spotsLeft} spots left
                  </span>
                </div>

                <h3 className="text-xl font-extrabold text-white mb-0.5">
                  {surpriseEvent.title}
                </h3>
                <p className="text-[11px] text-gray-300 mb-2 line-clamp-2">
                  {surpriseEvent.subtitle}
                </p>

                <div className="flex justify-between text-[11px] text-gray-300">
                  <span>
                    {surpriseEvent.venue} ({surpriseEvent.distance})
                  </span>
                  <span>{surpriseEvent.time}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => pickRandomSuitableEvent(surpriseCriteria)}
                disabled={isRolling}
                className="sm:flex-1 py-2.5 rounded-full bg-[#1a1d24] hover:bg-[#232730] border border-white/10 text-xs font-semibold text-white cursor-pointer transition"
              >
                Spin Another Match
              </button>
              <button
                onClick={handleAcceptSurprise}
                disabled={isRolling}
                className="sm:flex-1 py-2.5 rounded-full bg-emerald-400 text-[#0b0c0e] text-xs font-extrabold cursor-pointer shadow-[0_6px_20px_rgba(34,197,94,0.35)] hover:brightness-110 transition"
              >
                I'm In — View Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}