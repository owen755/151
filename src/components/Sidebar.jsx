import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const LocationFilterContext = createContext({
  selectedLocation: 'All Nairobi Zones',
  setSelectedLocation: () => {},
  locations: ['All Nairobi Zones']
});

export function useLocationFilter() {
  return useContext(LocationFilterContext);
}

export const DEFAULT_LOCATIONS = [
  'All Nairobi Zones',
  'Uhuru Gardens',
  'KICC Nairobi',
  'Kimathi Street',
  'Ngong Racecourse',
  'Argwings Kodhek Rd',
  'Brookside Dr',
  'Laikipia Rd',
  'Jakaya Kikwete Road',
  'Haile Selassie Ave'
];

export default function Sidebar({
  children,
  selectedLocation: propLocation,
  onSelectLocation,
  locations = DEFAULT_LOCATIONS
}) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [internalLocation, setInternalLocation] = useState('All Nairobi Zones');
  const [locationMenuOpen, setLocationMenuOpen] = useState(false);
  const locationDropdownRef = useRef(null);

  const activeLocation = propLocation !== undefined ? propLocation : internalLocation;

  const handleLocationChange = (loc) => {
    setInternalLocation(loc);
    if (onSelectLocation) {
      onSelectLocation(loc);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(e.target)) {
        setLocationMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { label: 'Discover', path: '/' },
    { label: 'Saved nights', path: '/saved-nights' },
    { label: 'My tickets', path: '/my-tickets' },
    { label: 'Explore map', path: '/explore' }
  ];

  const isHostPage = pathname === '/host';

  return (
    <LocationFilterContext.Provider
      value={{
        selectedLocation: activeLocation,
        setSelectedLocation: handleLocationChange,
        locations
      }}
    >
      <div className="min-h-screen w-full bg-[#0b0c0e] text-[#f5f6f8] flex overflow-x-hidden">
        {/* ================= LEFT SIDEBAR (Desktop lg+) ================= */}
        <aside className="hidden lg:flex w-[240px] xl:w-[260px] bg-[#0e1013] border-r border-white/[0.08] px-5 py-6 flex-col shrink-0 sticky top-0 h-screen select-none">
          <div onClick={() => navigate('/')} className="px-1 cursor-pointer">
            <div className="text-[28px] font-extrabold tracking-tight leading-none text-[#f5f6f8]">
              aftr<span className="text-[#d2ff38]">.</span>
            </div>
            <p className="text-[9px] tracking-[1.4px] text-[#8b909a] mt-1.5">
              GO OUT. FIND YOUR PEOPLE.
            </p>
          </div>

          <nav className="mt-8 flex flex-col gap-1.5">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => navigate(item.path)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] transition cursor-pointer ${
                    isActive
                      ? 'font-semibold bg-[#1e2418] text-[#d2ff38]'
                      : 'font-medium text-[#8b909a] hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {isHostPage ? (
            <div className="mt-auto mb-5 bg-[#1e2418] border border-[#d2ff38]/40 rounded-2xl p-4">
              <span className="inline-block text-[9px] font-extrabold tracking-wider text-[#d2ff38] mb-1">
                ACTIVE MODE
              </span>
              <h4 className="text-[14px] font-bold mb-1 text-white">Host Creator Portal</h4>
              <p className="text-[11px] text-[#8b909a] leading-snug">
                Launch your event into tonight's live swipe deck across Nairobi.
              </p>
            </div>
          ) : (
            <div className="mt-auto mb-5 bg-gradient-to-br from-[#1b2116] to-[#141812] border border-[#d2ff38]/20 rounded-2xl p-4">
              <h4 className="text-[14px] font-bold mb-1 text-[#f5f6f8]">Make it a night.</h4>
              <p className="text-[11px] text-[#8b909a] leading-snug mb-3">
                Bring your people together. We'll bring the good vibes.
              </p>
              <button
                type="button"
                onClick={() => navigate('/host')}
                className="w-full flex items-center justify-between text-[#d2ff38] text-[12px] font-semibold cursor-pointer hover:underline"
              >
                <span>Host a party</span>
                <span>→</span>
              </button>
            </div>
          )}

          <div className="border-t border-white/[0.08] pt-4 flex flex-col gap-3">
            <button
              type="button"
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
                <strong className="block text-[12px] font-semibold leading-tight text-[#f5f6f8]">
                  Jamie Miller
                </strong>
                <span className="text-[10px] text-[#8b909a]">Your next story awaits</span>
              </div>
            </div>
          </div>
        </aside>

        {/* ================= MAIN COLUMN (Shared Topbar + Page Content + Shared Footer) ================= */}
        <div className="flex-1 flex flex-col px-4 py-4 sm:px-7 sm:py-5 lg:px-10 lg:py-6 min-w-0 min-h-screen">
          {/* SHARED TOP HEADER BAR */}
          <header className="flex items-center justify-between pb-3.5 border-b border-white/[0.08]">
            <div className="flex items-center gap-3" ref={locationDropdownRef}>
              <span
                onClick={() => navigate('/')}
                className="lg:hidden text-[22px] font-extrabold tracking-tight cursor-pointer"
              >
                aftr<span className="text-[#d2ff38]">.</span>
              </span>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setLocationMenuOpen((prev) => !prev)}
                  className="flex items-center gap-1.5 text-[12px] sm:text-[13px] font-medium text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] px-3.5 py-1.5 rounded-full cursor-pointer transition"
                >
                  <span>{activeLocation}</span>
                  <span
                    className={`inline-block text-[11px] transition-transform ${
                      locationMenuOpen ? 'rotate-180 text-[#d2ff38]' : ''
                    }`}
                  >
                    ▾
                  </span>
                </button>

                {locationMenuOpen && (
                  <div className="absolute top-full left-0 mt-2 w-60 bg-[#14171d] border border-[#d2ff38]/30 rounded-2xl p-2 shadow-2xl z-50 flex flex-col gap-0.5 max-h-72 overflow-y-auto">
                    <span className="text-[10px] font-bold tracking-wider text-[#8b909a] px-2.5 py-1">
                      SWITCH NAIROBI LOCATION
                    </span>
                    {locations.map((loc) => (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => {
                          handleLocationChange(loc);
                          setLocationMenuOpen(false);
                        }}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-[12px] text-left cursor-pointer transition ${
                          activeLocation === loc
                            ? 'bg-[#1e2418] text-[#d2ff38] font-semibold'
                            : 'text-white hover:bg-white/5'
                        }`}
                      >
                        <span className="truncate pr-2">{loc}</span>
                        {activeLocation === loc && (
                          <span className="text-[#d2ff38] text-[10px]">●</span>
                        )}
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
                type="button"
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

          {/* SHARED TABLET & MOBILE HORIZONTAL NAV BAR */}
          <nav className="lg:hidden grid grid-cols-4 gap-1.5 py-2.5 border-b border-white/[0.08]">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => navigate(item.path)}
                  className={`flex flex-col items-center justify-center py-2 px-2 rounded-xl text-[11px] sm:text-[12px] cursor-pointer transition ${
                    isActive
                      ? 'bg-[#1e2418] text-[#d2ff38] font-semibold'
                      : 'text-[#8b909a] hover:bg-white/5'
                  }`}
                >
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* PAGE CONTENT */}
          <div className="flex-1 flex flex-col">{children}</div>

          {/* SHARED FOOTER */}
          <footer className="mt-8 pt-3.5 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-[#8b909a]">
            <span>GOOD PEOPLE. GREAT NIGHTS.</span>
            <span>Discover spontaneously. Party responsibly. 21+</span>
          </footer>
        </div>
      </div>
    </LocationFilterContext.Provider>
  );
}