import { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2, RotateCw, Sun, Search, Menu, Heart, Clock, BarChart3, Award, Settings, X } from 'lucide-react';
import { useStore } from './store/useStore';
import { useDarkMode } from './hooks/useTheme';
import { Onboarding } from './components/Onboarding';

import CardsPage from './pages/CardsPage';
import WheelPage from './pages/WheelPage';
import DailyPage from './pages/DailyPage';
import SearchPage from './pages/SearchPage';
import FavoritesPage from './pages/FavoritesPage';
import HistoryPage from './pages/HistoryPage';
import StatsPage from './pages/StatsPage';
import AchievementsPage from './pages/AchievementsPage';
import SettingsPage from './pages/SettingsPage';

const SEO: Record<string, { title: string; description: string }> = {
  '/': { title: 'Bedroom Commands — 395+ Fun Couples Card Game | Romantic, Spicy & Playful Challenges', description: 'A free couples card game with 395+ romantic, playful, spicy, adventure, and relaxing challenges. Draw cards, spin the wheel, and discover new experiences together.' },
  '/wheel': { title: 'Spin the Wheel — Bedroom Commands', description: 'Spin the wheel to discover a random romantic, playful, or spicy couples challenge. Let fate decide your next bedroom command.' },
  '/daily': { title: "Today's Challenge — Bedroom Commands", description: 'Get a fresh daily couples challenge every day. Romantic, spicy, and playful commands to keep your relationship exciting.' },
  '/search': { title: 'Search Commands — Bedroom Commands', description: 'Browse and search through 395+ couples commands. Filter by category, mood, or keyword to find the perfect challenge.' },
  '/favorites': { title: 'Favorite Commands — Bedroom Commands', description: 'Your saved bedroom commands. Access your favorite romantic, playful, and spicy couples challenges anytime.' },
  '/history': { title: 'Command History — Bedroom Commands', description: 'Review your past drawn bedroom commands. Track which couples challenges you have explored.' },
  '/stats': { title: 'Statistics — Bedroom Commands', description: 'View your couples game statistics. Track completed commands, favorite categories, and relationship milestones.' },
  '/achievements': { title: 'Achievements — Bedroom Commands', description: 'Unlock achievements as you explore more couples challenges. Track your progress and milestones.' },
  '/settings': { title: 'Settings — Bedroom Commands', description: 'Customize your Bedroom Commands experience. Toggle sounds, dark mode, manage categories, and more.' },
};

const MAIN_TABS = [
  { path: '/', icon: Gamepad2, label: 'Cards' },
  { path: '/wheel', icon: RotateCw, label: 'Wheel' },
  { path: '/daily', icon: Sun, label: 'Today' },
  { path: '/search', icon: Search, label: 'Search' },
];

const MORE_ITEMS = [
  { path: '/favorites', icon: Heart, label: 'Favorites' },
  { path: '/history', icon: Clock, label: 'History' },
  { path: '/stats', icon: BarChart3, label: 'Stats' },
  { path: '/achievements', icon: Award, label: 'Achievements' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

function usePageSEO(path: string) {
  useEffect(() => {
    const seo = SEO[path] || SEO['/'];
    document.title = seo.title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', seo.description);
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', seo.title);
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', seo.description);
    const twTitle = document.querySelector('meta[name="twitter:title"]');
    if (twTitle) twTitle.setAttribute('content', seo.title);
    const twDesc = document.querySelector('meta[name="twitter:description"]');
    if (twDesc) twDesc.setAttribute('content', seo.description);
  }, [path]);
}

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showMore, setShowMore] = useState(false);
  const hasSeenOnboarding = useStore(s => s.hasSeenOnboarding);

  const currentPath = location.pathname;
  const isMainTab = MAIN_TABS.some(t => t.path === currentPath);
  const moreActive = !isMainTab;

  usePageSEO(currentPath);

  const navigateTo = (path: string) => {
    navigate(path);
    setShowMore(false);
  };

  return (
    <div className="min-h-dvh flex flex-col bg-[var(--bg)] text-[var(--text)]">
      {!hasSeenOnboarding && <Onboarding />}

      {/* Page */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div key={currentPath}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="flex-1 flex flex-col overflow-auto scrollbar-thin"
          >
            <Routes>
              <Route path="/" element={<CardsPage />} />
              <Route path="/wheel" element={<WheelPage />} />
              <Route path="/daily" element={<DailyPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/stats" element={<StatsPage />} />
              <Route path="/achievements" element={<AchievementsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* More overlay */}
      <AnimatePresence>
        {showMore && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50"
            onClick={() => setShowMore(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 bg-[var(--surface)] rounded-t-3xl p-6 pb-10"
              onClick={e => e.stopPropagation()}
              style={{ paddingBottom: 'calc(1.5rem + var(--safe-bottom))' }}
            >
              <div className="flex justify-center mb-3">
                <div className="w-10 h-1 rounded-full bg-[var(--border)]" />
              </div>
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-lg font-bold text-[var(--text)]">More</h2>
                <button onClick={() => setShowMore(false)} className="p-2 rounded-full hover:bg-[var(--border)]">
                  <X size={20} className="text-[var(--text)]" />
                </button>
              </div>
              <div className="space-y-1">
                {MORE_ITEMS.map(item => {
                  const active = currentPath === item.path;
                  return (
                    <button key={item.path} onClick={() => navigateTo(item.path)}
                      className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all active:scale-98 ${
                        active ? 'bg-[var(--primary)]/10 text-[var(--primary)]' : 'text-[var(--text)] hover:bg-[var(--bg)]'
                      }`}>
                      <item.icon size={22} className={active ? 'text-[var(--primary)]' : 'text-[var(--text-sec)]'} />
                      <span className="font-semibold">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab bar */}
      <nav className="sticky bottom-0 z-40 bg-[var(--surface)]/95 backdrop-blur-xl border-t border-[var(--border)]"
        style={{ paddingBottom: 'var(--safe-bottom)' }}>
        <div className="flex items-stretch">
          {MAIN_TABS.map(tab => {
            const active = currentPath === tab.path;
            return (
              <button key={tab.path} onClick={() => navigateTo(tab.path)}
                className={`relative flex-1 flex flex-col items-center justify-center py-2.5 transition-colors touch-target ${
                  active ? 'text-[var(--primary)]' : 'text-[var(--text-sec)]'
                }`}>
                {active && (
                  <motion.div layoutId="tab-indicator"
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[3px] rounded-full bg-[var(--primary)]"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
                )}
                <tab.icon size={24} strokeWidth={active ? 2.5 : 1.5} />
                <span className={`text-[11px] mt-1 ${active ? 'font-bold' : 'font-medium'}`}>{tab.label}</span>
              </button>
            );
          })}
          <button onClick={() => setShowMore(!showMore)}
            className={`relative flex-1 flex flex-col items-center justify-center py-2.5 transition-colors touch-target ${
              moreActive ? 'text-[var(--primary)]' : 'text-[var(--text-sec)]'
            }`}>
            {moreActive && (
              <motion.div layoutId="tab-indicator"
                className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[3px] rounded-full bg-[var(--primary)]"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
            )}
            <Menu size={24} strokeWidth={moreActive ? 2.5 : 1.5} />
            <span className={`text-[11px] mt-1 ${moreActive ? 'font-bold' : 'font-medium'}`}>More</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

export default function App() {
  const isDark = useDarkMode();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
}
