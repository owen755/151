import { HashRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import DiscoverPage from './components/DiscoverPage';
import HostPage from './components/HostPage';
import SavedNightsPage from './components/SavedNightsPage';
import ExploreMap from './pages/ExploreMap/ExploreMap';
import MyTicketsPage from './features/my-tickets/MyTicketsPage';

function Custom404() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0b0c0e] text-[#f5f6f8] flex flex-col items-center justify-center p-6 font-sans select-none">
      <div className="w-full max-w-md bg-[#131519] border border-white/10 rounded-3xl p-8 text-center shadow-2xl">
        <span className="inline-block bg-[#1e2418] text-[#d2ff38] text-[11px] font-extrabold tracking-widest px-3.5 py-1.5 rounded-full border border-[#d2ff38]/30 mb-5">
          ERROR 404 • PAGE NOT LINKED YET
        </span>

        <h1 className="text-5xl font-black tracking-tight text-white mb-2">
          404<span className="text-[#d2ff38]">.</span>
        </h1>
        <h2 className="text-xl font-bold text-white mb-3">
          Route ready for teammate.
        </h2>

        <p className="text-xs text-[#8b909a] leading-relaxed mb-6">
          The path <span className="text-[#d2ff38] font-mono bg-white/5 px-2 py-0.5 rounded">{location.pathname}</span> BOIZ HAKUNA KITU HAPA
        </p>

        <button
          onClick={() => navigate('/')}
          className="w-full bg-[#d2ff38] text-[#0b0c0e] font-extrabold text-sm py-3.5 px-6 rounded-full hover:brightness-110 active:scale-95 transition-all cursor-pointer shadow-[0_8px_25px_rgba(210,255,56,0.25)]"
        >
          ← Back to Discover
        </button>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Your Main Discover Page */}
        <Route path="/" element={<DiscoverPage />} />

        {/* Teammate Paths Created & Waiting to be Linked */}
        <Route path="/saved-nights" element={<SavedNightsPage />} />
        <Route path="/my-tickets" element={<MyTicketsPage />} />
        <Route path="/explore" element={<ExploreMap />} />
        <Route path="/host" element={<HostPage />} />
        <Route path="/events/:id" element={<Custom404 />} />
        <Route path="/gate-scanner" element={<Custom404 />} />
        <Route path="*" element={<Custom404 />} />
      </Routes>
    </Router>
  );
}