import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2, RotateCw, Sun, Search, Heart, Clock, BarChart3, Award, Settings } from 'lucide-react';
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

const TABS = [
  { id: 'cards', icon: Gamepad2, label: 'Cards' },
  { id: 'wheel', icon: RotateCw, label: 'Wheel' },
  { id: 'daily', icon: Sun, label: 'Today' },
  { id: 'search', icon: Search, label: 'Search' },
  { id: 'favorites', icon: Heart, label: 'Favorites' },
  { id: 'history', icon: Clock, label: 'History' },
  { id: 'stats', icon: BarChart3, label: 'Stats' },
  { id: 'achievements', icon: Award, label: 'Badges' },
  { id: 'settings', icon: Settings, label: 'Settings' },
] as const;

type TabId = typeof TABS[number]['id'];

const pages: Record<TabId, React.ComponentType> = {
  cards: CardsPage, wheel: WheelPage, daily: DailyPage, search: SearchPage,
  favorites: FavoritesPage, history: HistoryPage, stats: StatsPage,
  achievements: AchievementsPage, settings: SettingsPage,
};

const headers: Record<TabId, string> = {
  cards: 'Bedroom Commands', wheel: 'Spin the Wheel', daily: 'Daily Challenge',
  search: 'Search Commands', favorites: 'My Favorites', history: 'Draw History',
  stats: 'Statistics', achievements: 'Achievements', settings: 'Settings',
};

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('cards');
  const isDark = useDarkMode();
  const hasSeenOnboarding = useStore(s => s.hasSeenOnboarding);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const Page = pages[activeTab];

  return (
    <div className="min-h-dvh flex flex-col bg-[var(--bg)] text-[var(--text)]">
      {!hasSeenOnboarding && <Onboarding />}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-[var(--bg)]/80 backdrop-blur-xl border-b border-[var(--border)]">
        <h1 className="text-lg font-bold text-[var(--text)] px-5 py-3">{headers[activeTab]}</h1>
      </header>

      {/* Page */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="flex-1 flex flex-col overflow-auto"
          >
            <Page />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Tab bar */}
      <nav className="sticky bottom-0 z-40 bg-[var(--surface)] border-t border-[var(--border)] safe-bottom">
        <div className="flex overflow-x-auto scrollbar-none">
          {TABS.map(tab => {
            const active = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center py-2 px-1 min-w-[64px] shrink-0 transition-colors ${
                  active ? 'text-[var(--primary)]' : 'text-[var(--text-sec)]'
                }`}>
                <tab.icon size={20} strokeWidth={active ? 2.5 : 1.5} />
                <span className="text-[10px] font-semibold mt-0.5">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
