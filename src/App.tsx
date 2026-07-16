import { useState, useEffect } from 'react';
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

const MAIN_TABS = [
  { id: 'cards', icon: Gamepad2, label: 'Cards' },
  { id: 'wheel', icon: RotateCw, label: 'Wheel' },
  { id: 'daily', icon: Sun, label: 'Today' },
  { id: 'search', icon: Search, label: 'Search' },
] as const;

const MORE_ITEMS = [
  { id: 'favorites', icon: Heart, label: 'Favorites' },
  { id: 'history', icon: Clock, label: 'History' },
  { id: 'stats', icon: BarChart3, label: 'Stats' },
  { id: 'achievements', icon: Award, label: 'Achievements' },
  { id: 'settings', icon: Settings, label: 'Settings' },
] as const;

type TabId = (typeof MAIN_TABS)[number]['id'] | (typeof MORE_ITEMS)[number]['id'];

const pages: Record<TabId, React.ComponentType> = {
  cards: CardsPage, wheel: WheelPage, daily: DailyPage, search: SearchPage,
  favorites: FavoritesPage, history: HistoryPage, stats: StatsPage,
  achievements: AchievementsPage, settings: SettingsPage,
};

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('cards');
  const [showMore, setShowMore] = useState(false);
  const isDark = useDarkMode();
  const hasSeenOnboarding = useStore(s => s.hasSeenOnboarding);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const navigateTo = (tab: TabId) => {
    setActiveTab(tab);
    setShowMore(false);
  };

  const isMainTab = MAIN_TABS.some(t => t.id === activeTab);
  const moreActive = !isMainTab;

  const Page = pages[activeTab];

  return (
    <div className="min-h-dvh flex flex-col bg-[var(--bg)] text-[var(--text)]">
      {!hasSeenOnboarding && <Onboarding />}

      {/* Page */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="flex-1 flex flex-col overflow-auto scrollbar-thin"
          >
            <Page />
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
                  const active = activeTab === item.id;
                  return (
                    <button key={item.id} onClick={() => navigateTo(item.id)}
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
            const active = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => navigateTo(tab.id)}
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
