import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Sidebar({ children }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const navItems = [
    { label: 'Discover', path: '/' },
    { label: 'Saved nights', path: '/saved-nights' },
    { label: 'My tickets', path: '/my-tickets' },
    { label: 'Explore map', path: '/explore' }
  ];

  const isHostPage = pathname === '/host';

  const sidebarElement = (
    <aside className="hidden lg:flex w-[240px] xl:w-[260px] bg-[#0e1013] border-r border-white/[0.08] px-5 py-6 flex-col shrink-0 sticky top-0 h-screen select-none">
      <div
        onClick={() => navigate('/')}
        className="px-1 cursor-pointer"
      >
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
  );

  // If a teammate wraps their page with <Sidebar>{children}</Sidebar>, render the full flex shell
  if (children) {
    return (
      <div className="min-h-screen w-full bg-[#0b0c0e] text-[#f5f6f8] flex overflow-x-hidden">
        {sidebarElement}
        <div className="flex-1 flex flex-col min-w-0">{children}</div>
      </div>
    );
  }

  // Otherwise render the <aside> directly
  return sidebarElement;
}