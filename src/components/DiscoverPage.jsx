import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { API_URL } from '../api';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1000&auto=format&fit=crop&q=80';

// Exact 10 events from server/db.json
export const DB_JSON_EVENTS = [
  {
    id: 1,
    title: 'Detty Dezemba',
    category: 'music',
    description: 'Live Afro house artists in Nairobi, with a special guest perfomance.',
    image: 'https://res.cloudinary.com/b9tb2cpo/image/upload/f_auto,q_auto/DettyDezembaFestPoster',
    startTime: '19:00',
    endTime: 'Till Dawn',
    price: '4500',
    currency: 'KES',
    location: {
      venue: 'Uhuru Gardens',
      address: 'Nairobi, Uhuru Gardens',
      lat: -1.32,
      long: 36.8
    }
  },
  {
    id: 2,
    title: 'Zawadi Band Perfomance',
    category: 'music',
    description:
      'Come enjoy great music and great vibes. Order a drink and/or some food to top up your experience.',
    image:
      'https://res.cloudinary.com/b9tb2cpo/image/upload/f_auto,q_auto/WhatsApp_Image_2026-11-15_at_12.52.00',
    startTime: '18:00',
    endTime: '22:00',
    price: 'free',
    currency: 'KES',
    location: {
      venue: 'Sarova Stanley Hotel',
      address: 'Kimathi Street',
      lat: -1.28,
      long: 36.82
    }
  },
  {
    id: 3,
    title: 'Rhythm & Identity',
    category: 'music',
    description:
      'Rhythm & Identity is a high energy cultural experience that brings together music, fashion and perfomance art in one immersive showcase.',
    image: 'https://res.cloudinary.com/b9tb2cpo/image/upload/f_auto,q_auto/rafiki_alphabet',
    startTime: '15:00',
    endTime: '22:30',
    price: '1000',
    currency: 'KES',
    location: {
      venue: 'KICC Nairobi',
      address: 'Nairobi, Uhuru Gardens',
      lat: -1.29,
      long: 36.82
    }
  },
  {
    id: 4,
    title: 'HKSAI Education Champions GALA Dinner',
    category: 'charity',
    description: 'Live Afro house artists in Nairobi, with a special guest perfomance.',
    image: 'https://res.cloudinary.com/b9tb2cpo/image/upload/f_auto,q_auto/hksai',
    startTime: '17:00',
    endTime: '22:00',
    price: 'free',
    currency: 'KES',
    location: {
      venue: 'Heron Hotel',
      address: 'Jakaya Kikwete Road, Nairobi',
      lat: -1.29,
      long: 36.81
    }
  },
  {
    id: 5,
    title: 'Research & Policy Series',
    category: 'education',
    description: 'Planetary AI - Data materiality in the Global South',
    image: 'https://res.cloudinary.com/b9tb2cpo/image/upload/f_auto,q_auto/BIEA',
    startTime: '16:00',
    endTime: '17:30',
    price: 'free',
    currency: 'KES',
    location: {
      venue: 'The British Institute in Eastern Africa',
      address: 'Laikipia Rd, Nairobi',
      lat: -1.27,
      long: 36.79
    }
  },
  {
    id: 6,
    title: 'AmapianoLand',
    category: 'music',
    description:
      'AmapianoLand heads to Nairobi for a huge outdoor Amapiano & Afrobeats day festival.',
    image: 'https://res.cloudinary.com/b9tb2cpo/image/upload/f_auto,q_auto/amapianoland',
    startTime: '16:00',
    endTime: '01:00',
    price: '2000',
    currency: 'KES',
    location: {
      venue: 'MassHouse',
      address: 'Ngong Racecourse,Nairobi',
      lat: -1.3,
      long: 36.74
    }
  },
  {
    id: 7,
    title: 'MindTech Conference',
    category: 'tech',
    description: 'Where technology meets wellbeing.',
    image: 'https://res.cloudinary.com/b9tb2cpo/image/upload/f_auto,q_auto/mindtech',
    startTime: '10:00',
    endTime: '18:00',
    price: 'free',
    currency: 'KES',
    location: {
      venue: 'KICC Nairobi',
      address: 'Nairobi',
      lat: -1.29,
      long: 36.82
    }
  },
  {
    id: 8,
    title: 'The Leadership Advantage',
    category: 'education',
    description:
      'An executive leadership experience to sharpen their presence, amplify influence, inspire engagement, and unlock team potential.',
    image: 'https://res.cloudinary.com/b9tb2cpo/image/upload/f_auto,q_auto/leadershipadvantage',
    startTime: '09:00',
    endTime: '16:30',
    price: '23000',
    currency: 'KES',
    location: {
      venue: 'The Piano',
      address: 'Brookside Dr, Nairobi',
      lat: -1.25,
      long: 36.79
    }
  },
  {
    id: 9,
    title: 'Pediatric Advanced Life Support Course',
    category: 'wellness',
    description:
      "Join our in-person Pediatric Advanced Life Support Course to boost your skills and save kids' lives.",
    image: 'https://res.cloudinary.com/b9tb2cpo/image/upload/f_auto,q_auto/pals',
    startTime: '08:00',
    endTime: '15:00',
    price: '8500',
    currency: 'KES',
    location: {
      venue: 'The QuickFix Learning Hub - Hurlingham',
      address: 'Argwings Kodhek Rd, Nairobi',
      lat: -1.29,
      long: 36.79
    }
  },
  {
    id: 10,
    title: 'Nairobi Social and Political Walk',
    category: 'wellness',
    description:
      'The interactive storytelling walk is meant to have the flow and information-heavy experience of a documemntary',
    image: 'https://res.cloudinary.com/b9tb2cpo/image/upload/f_auto,q_auto/socialwalk',
    startTime: '10:00',
    endTime: '12:30',
    price: '4000',
    currency: 'KES',
    location: {
      venue: 'City Square Post Office',
      address: 'Haile Selassie Ave, Nairobi',
      lat: -1.29,
      long: 36.82
    }
  }
];

// Calculates distance in km from Nairobi center (-1.286, 36.817) using location.lat & location.long
function getDistanceKm(location) {
  const lat = Number(location?.lat ?? -1.29);
  const lng = Number(location?.long ?? location?.lng ?? 36.82);
  const dLat = (lat - -1.286) * 111;
  const dLng = (lng - 36.817) * 111;
  const dist = Math.sqrt(dLat * dLat + dLng * dLng);
  return Number(Math.max(0.4, dist).toFixed(1));
}

function getNumericPrice(priceVal) {
  if (priceVal === undefined || priceVal === null) return 0;
  if (String(priceVal).toLowerCase() === 'free') return 0;
  const parsed = parseFloat(String(priceVal).replace(/[^0-9.]/g, ''));
  return Number.isNaN(parsed) ? 0 : parsed;
}

function formatPriceLabel(priceVal, currency = 'KES') {
  const num = getNumericPrice(priceVal);
  if (num === 0) return 'Free';
  return `${currency} ${num.toLocaleString()}`;
}

export default function DiscoverPage() {
  const navigate = useNavigate();

  const [events, setEvents] = useState(DB_JSON_EVENTS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [history, setHistory] = useState([]);
  const [nearbyVisibleCount, setNearbyVisibleCount] = useState(10);

  const [selectedLocation, setSelectedLocation] = useState('All Nairobi Zones');

  const [searchQuery, setSearchQuery] = useState('');
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);

  // Matches exact categories in server/db.json
  const [activeCategory, setActiveCategory] = useState('All categories');
  const [freeOnly, setFreeOnly] = useState(false);
  const [within5Km, setWithin5Km] = useState(false);

  const [animState, setAnimState] = useState('');
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const searchBoxRef = useRef(null);

  const [surpriseModalOpen, setSurpriseModalOpen] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [surpriseEvent, setSurpriseEvent] = useState(null);
  const [surpriseCriteria, setSurpriseCriteria] = useState('fit');
  const [matchReason, setMatchReason] = useState('');
  const lastSurpriseIdRef = useRef(null);
  const rollIntervalRef = useRef(null);

  // Load any session-hosted events + fetch live from server/db.json if json-server is running
  useEffect(() => {
    let localHosted = [];
    try {
      const stored = JSON.parse(sessionStorage.getItem('aftr_hosted_events') || '[]');
      if (Array.isArray(stored)) {
        localHosted = stored;
      }
    } catch (err) {
      console.error(err);
    }

    if (localHosted.length > 0) {
      setEvents([...localHosted, ...DB_JSON_EVENTS]);
    }

    if (!API_URL) return undefined;

    fetch(`${API_URL}/events`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        const dbEvents = Array.isArray(data) ? data : data.events || [];
        if (Array.isArray(dbEvents) && dbEvents.length > 0) {
          const dbIds = new Set(dbEvents.map((e) => String(e.id)));
          const unsyncedLocal = localHosted.filter((e) => !dbIds.has(String(e.id)));
          setEvents([...unsyncedLocal, ...dbEvents]);
        }
      })
      .catch(() => {
        // Uses DB_JSON_EVENTS when json-server is not running
      });
  }, []);

  // Build Location Dropdown directly from the venues & addresses in db.json
  const dynamicLocations = useMemo(() => {
    const locs = new Set(['All Nairobi Zones']);
    events.forEach((ev) => {
      if (ev.location?.venue) locs.add(ev.location.venue);
      if (ev.location?.address) locs.add(ev.location.address);
    });
    return Array.from(locs);
  }, [events]);

  useEffect(() => {
    const handleClickOutside = (e) => {
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

  // Filter & Search using the exact server/db.json schema
  const filteredEvents = useMemo(() => {
    const rawQuery = searchQuery.trim().toLowerCase();
    const queryWords = rawQuery ? rawQuery.split(/\s+/) : [];

    return events.filter((ev) => {
      const venue = ev.location?.venue || '';
      const address = ev.location?.address || '';
      const category = ev.category || '';
      const priceNum = getNumericPrice(ev.price);
      const distKm = getDistanceKm(ev.location);

      const matchesLocation =
        selectedLocation === 'All Nairobi Zones' ||
        venue.toLowerCase().includes(selectedLocation.toLowerCase()) ||
        address.toLowerCase().includes(selectedLocation.toLowerCase());

      const searchableBlob = [
        ev.title,
        ev.description,
        category,
        venue,
        address,
        ev.startTime,
        ev.endTime,
        priceNum === 0 ? 'free 0' : `${ev.price} kes ksh`
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchesSearch =
        queryWords.length === 0 ||
        queryWords.every((word) => searchableBlob.includes(word));

      const matchesCategory =
        activeCategory === 'All categories' ||
        category.toLowerCase() === activeCategory.toLowerCase();

      const matchesPrice = !freeOnly || priceNum === 0;
      const matchesDistance = !within5Km || distKm <= 5;

      return (
        matchesLocation &&
        matchesSearch &&
        matchesCategory &&
        matchesPrice &&
        matchesDistance
      );
    });
  }, [events, selectedLocation, searchQuery, activeCategory, freeOnly, within5Km]);

  useEffect(() => {
    setCurrentIndex(0);
    setAnimState('');
    setDragOffset({ x: 0, y: 0 });
  }, [searchQuery, selectedLocation, activeCategory, freeOnly, within5Km]);

  const currentCard = filteredEvents[currentIndex];
  const nextCard = filteredEvents[currentIndex + 1];

  // --- SWIPE LEFT (RED -> /skipped) & SWIPE RIGHT (GREEN -> /saved) ---
  const triggerSwipe = (direction) => {
    if (!currentCard || animState) return;

    setAnimState(direction);
    setDragOffset({ x: 0, y: 0 });

    const endpoint = direction === 'right' ? 'saved' : 'skipped';
    fetch(`${API_URL}/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(currentCard)
    }).catch(() => {});

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

  // --- SURPRISE ME RANDOM MATCHER (Using db.json events) ---
  const pickRandomSuitableEvent = (criteria = surpriseCriteria) => {
    if (rollIntervalRef.current) clearInterval(rollIntervalRef.current);

    const basePool = filteredEvents.length > 1 ? filteredEvents : events;
    setIsRolling(true);
    setSurpriseCriteria(criteria);

    let candidates = [...basePool];
    let reasonText = `Curated match from ${basePool.length} Nairobi events`;

    if (criteria === 'fit') {
      candidates = basePool.filter((ev) => ev.category === 'music');
      reasonText = 'High-energy music & nightlife pick';
    } else if (criteria === 'closest') {
      candidates = [...basePool]
        .sort((a, b) => getDistanceKm(a.location) - getDistanceKm(b.location))
        .slice(0, 4);
      reasonText = 'Selected from the closest venues to central Nairobi';
    } else if (criteria === 'budget') {
      candidates = basePool.filter((e) => getNumericPrice(e.price) <= 2000);
      reasonText = 'Budget friendly • KES 2,000 or less';
    } else if (criteria === 'free') {
      candidates = basePool.filter((e) => getNumericPrice(e.price) === 0);
      reasonText = 'Free entry event';
    }

    if (candidates.length === 0) {
      candidates = [...basePool];
      reasonText = 'Wildcard pick from all Nairobi events';
    }

    const nonRepeatingPool =
      candidates.length > 1
        ? candidates.filter((c) => String(c.id) !== String(lastSurpriseIdRef.current))
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
    fetch(`${API_URL}/saved`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(surpriseEvent)
    }).catch(() => {});
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
    <Sidebar
      selectedLocation={selectedLocation}
      onSelectLocation={setSelectedLocation}
      locations={dynamicLocations}
    >
      {/* HERO TITLE + SURPRISE ME + LIVE SEARCH + FILTER PILLS */}
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
            type="button"
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
                placeholder="Search event, venue, category..."
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

            {searchDropdownOpen && searchQuery.trim() !== '' && (
              <div className="absolute top-full left-0 mt-2 w-full sm:w-80 bg-[#14171d] border border-[#d2ff38]/35 rounded-2xl p-2 shadow-2xl z-50 max-h-64 overflow-y-auto">
                <div className="flex items-center justify-between px-2.5 py-1 text-[10px] font-bold tracking-wider text-[#8b909a]">
                  <span>MATCHING EVENTS ({filteredEvents.length})</span>
                  <span>PRESS ENTER</span>
                </div>

                {filteredEvents.length === 0 ? (
                  <div className="px-3 py-3 text-xs text-[#8b909a]">
                    No events match “{searchQuery}”.
                  </div>
                ) : (
                  filteredEvents.map((ev, idx) => (
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
                          {ev.location?.venue} • {ev.category}
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-[#d2ff38] shrink-0">
                        {formatPriceLabel(ev.price, ev.currency)}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedLocation('All Nairobi Zones');
              setActiveCategory('All categories');
              setFreeOnly(false);
              setWithin5Km(false);
            }}
            className="px-3.5 py-1.5 rounded-full text-[12px] font-semibold bg-[#1e2418] text-[#d2ff38] border border-[#d2ff38]/40 cursor-pointer"
          >
            Tonight ({filteredEvents.length})
          </button>

          <button
            type="button"
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
            type="button"
            onClick={() => {
              const categories = [
                'All categories',
                'music',
                'charity',
                'education',
                'tech',
                'wellness'
              ];
              const next =
                categories[(categories.indexOf(activeCategory) + 1) % categories.length];
              setActiveCategory(next);
            }}
            className={`px-3.5 py-1.5 rounded-full text-[12px] font-medium border transition cursor-pointer capitalize ${
              activeCategory !== 'All categories'
                ? 'bg-[#1e2418] text-[#d2ff38] border-[#d2ff38]/40'
                : 'bg-[#15181d] text-[#8b909a] border-white/[0.08] hover:text-white'
            }`}
          >
            {activeCategory}
          </button>

          <button
            type="button"
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
            type="button"
            onClick={() => navigate('/explore')}
            className="px-3.5 py-1.5 rounded-full text-[12px] font-medium bg-[#15181d] text-[#8b909a] border border-white/[0.08] hover:text-white cursor-pointer"
          >
            Explore Map
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
                ? `${String(currentIndex + 1).padStart(2, '0')} / ${String(
                    filteredEvents.length
                  ).padStart(2, '0')}`
                : '00 / 00'}
            </span>
          </div>

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

                {isLikingGreen && (
                  <div
                    style={{ opacity: stampOpacity }}
                    className="absolute top-16 left-6 z-20 border-3 border-emerald-400 text-emerald-400 bg-black/80 px-4 py-1.5 rounded-xl text-2xl font-black tracking-widest -rotate-12 shadow-[0_0_25px_rgba(34,197,94,0.6)] pointer-events-none"
                  >
                    I'M IN ♡
                  </div>
                )}

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
                  <span className="bg-[#d2ff38] text-[#0b0c0e] text-[10px] font-extrabold px-3 py-1 rounded-full uppercase">
                    TONIGHT'S {currentCard.category || 'PICK'}
                  </span>
                  <span className="bg-black/75 backdrop-blur-md text-white text-[11px] font-semibold px-3 py-1 rounded-full border border-white/15">
                    {getNumericPrice(currentCard.price) === 0
                      ? 'Free Entry'
                      : `${formatPriceLabel(currentCard.price, currentCard.currency)} cover`}
                  </span>
                </div>

                {/* Bottom Card Info (Reads directly from server/db.json fields) */}
                <div className="relative z-10">
                  <div className="flex flex-wrap gap-1.5 mb-2.5">
                    <span className="bg-white/15 backdrop-blur-md text-white text-[11px] px-2.5 py-0.5 rounded-full capitalize">
                      {currentCard.category}
                    </span>
                    <span className="bg-white/15 backdrop-blur-md text-white text-[11px] px-2.5 py-0.5 rounded-full">
                      {currentCard.location?.address}
                    </span>
                    <span className="bg-[#d2ff38]/20 text-[#d2ff38] border border-[#d2ff38]/35 text-[11px] px-2.5 py-0.5 rounded-full font-semibold">
                      {getDistanceKm(currentCard.location)} km away
                    </span>
                  </div>

                  <h2 className="text-[26px] sm:text-[32px] font-extrabold tracking-tight leading-tight mb-1">
                    {currentCard.title}
                  </h2>
                  <p className="text-[12px] sm:text-[13px] text-gray-300 mb-3.5 line-clamp-2">
                    {currentCard.description}
                  </p>

                  <div className="flex items-end justify-between">
                    <div className="flex flex-col gap-0.5 text-[12px] text-gray-300">
                      <span>
                        {currentCard.location?.venue} • {currentCard.location?.address}
                      </span>
                      <span>
                        {currentCard.startTime} – {currentCard.endTime}
                      </span>
                    </div>

                    <button
                      type="button"
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
                <h3 className="text-base font-bold">No events match that filter tonight.</h3>
                <p className="text-xs text-[#8b909a]">
                  Reset your search or filters to browse all Nairobi events.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentIndex(0);
                    setSearchQuery('');
                    setActiveCategory('All categories');
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

          {/* Swipe Action Buttons */}
          <div className="flex flex-col items-center mt-4">
            <div className="flex items-start gap-6">
              <button
                type="button"
                onClick={handleUndo}
                disabled={history.length === 0}
                title="Undo last swipe"
                className="w-11 h-11 mt-2 rounded-full bg-[#15181e] border border-white/[0.12] text-white/80 hover:text-white disabled:opacity-35 flex items-center justify-center text-base cursor-pointer transition active:scale-90"
              >
                ↺
              </button>

              <div className="flex flex-col items-center gap-1">
                <button
                  type="button"
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

              <div className="flex flex-col items-center gap-1">
                <button
                  type="button"
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
              type="button"
              onClick={() => navigate('/explore')}
              className="hidden sm:inline-flex lg:hidden items-center gap-1.5 text-[12px] font-semibold border border-white/[0.08] px-3.5 py-1.5 rounded-full hover:bg-white/5 cursor-pointer"
            >
              Explore all nearby parties <span>→</span>
            </button>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="bg-[#131519] border border-white/[0.08] rounded-2xl p-5 text-center my-2">
              <p className="text-xs text-[#8b909a]">
                No nearby events match “{searchQuery}”.
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
                    <span className="block text-[9px] font-bold tracking-wider text-[#d2ff38] truncate uppercase">
                      {item.category} • {item.location?.venue}
                    </span>
                    <h4 className="text-[14px] font-bold text-white truncate leading-snug">
                      {item.title}
                    </h4>
                    <span className="block text-[11px] text-[#8b909a] truncate">
                      {item.startTime} – {item.endTime} • {item.location?.address}
                    </span>
                    <span className="block text-[11px] font-bold text-[#d2ff38]">
                      {formatPriceLabel(item.price, item.currency)}
                    </span>
                  </div>
                  <button
                    type="button"
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
              type="button"
              onClick={() =>
                setNearbyVisibleCount((prev) => Math.min(prev + 10, filteredEvents.length))
              }
              className="w-full mt-2 py-1.5 rounded-full bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] text-[11px] font-semibold text-[#d2ff38] cursor-pointer transition"
            >
              Show more places ({filteredEvents.length - nearbyVisibleCount} more)
            </button>
          )}

          <button
            type="button"
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
                type="button"
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
              type="button"
              onClick={() => setSurpriseModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-xs text-white flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>

            <span className="inline-block bg-white/10 text-purple-300 text-[9px] font-bold px-2.5 py-0.5 rounded-full mb-1.5">
              TONIGHT'S FATE PICKER
            </span>
            <h2 className="text-xl font-extrabold">
              {isRolling ? 'Scanning Nairobi events...' : 'We found your spot.'}
            </h2>
            <p className="text-[11px] text-[#d2ff38] mt-0.5 mb-3.5">
              {isRolling ? 'Matching your vibe & budget...' : matchReason}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mb-3.5">
              {[
                { key: 'fit', label: 'Music Pick' },
                { key: 'closest', label: 'Closest' },
                { key: 'budget', label: 'Under KES 2K' },
                { key: 'free', label: 'Free Entry' }
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
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
                <span className="bg-[#d2ff38] text-[#0b0c0e] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                  EVENT #{surpriseEvent.id} • {surpriseEvent.category}
                </span>
                <span className="bg-black/75 text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-white/15">
                  {getNumericPrice(surpriseEvent.price) === 0
                    ? 'Free Entry'
                    : `${formatPriceLabel(surpriseEvent.price, surpriseEvent.currency)} cover`}
                </span>
              </div>

              <div>
                <div className="flex flex-wrap gap-1.5 mb-1.5">
                  <span className="bg-white/15 text-white text-[10px] px-2 py-0.5 rounded-full capitalize">
                    {surpriseEvent.category}
                  </span>
                  <span className="bg-[#d2ff38]/20 text-[#d2ff38] text-[10px] px-2 py-0.5 rounded-full font-semibold">
                    {getDistanceKm(surpriseEvent.location)} km away
                  </span>
                </div>

                <h3 className="text-xl font-extrabold text-white mb-0.5">
                  {surpriseEvent.title}
                </h3>
                <p className="text-[11px] text-gray-300 mb-2 line-clamp-2">
                  {surpriseEvent.description}
                </p>

                <div className="flex justify-between text-[11px] text-gray-300">
                  <span>{surpriseEvent.location?.venue}</span>
                  <span>
                    {surpriseEvent.startTime} – {surpriseEvent.endTime}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => pickRandomSuitableEvent(surpriseCriteria)}
                disabled={isRolling}
                className="sm:flex-1 py-2.5 rounded-full bg-[#1a1d24] hover:bg-[#232730] border border-white/10 text-xs font-semibold text-white cursor-pointer transition"
              >
                Spin Another Match
              </button>
              <button
                type="button"
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
    </Sidebar>
  );
}