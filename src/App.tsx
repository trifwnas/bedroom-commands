import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import { Gamepad2, RotateCw, Sun, Search, Menu, Heart, Clock, BarChart3, Award, Settings, X } from 'lucide-react';
import { useStore } from './store/useStore';
import { useDarkMode } from './hooks/useTheme';
import { Onboarding } from './components/Onboarding';
import { useI18n } from './i18n';

import CardsPage from './pages/CardsPage';
import WheelPage from './pages/WheelPage';
import DailyPage from './pages/DailyPage';
import SearchPage from './pages/SearchPage';
import FavoritesPage from './pages/FavoritesPage';
import HistoryPage from './pages/HistoryPage';
import StatsPage from './pages/StatsPage';
import AchievementsPage from './pages/AchievementsPage';
import SettingsPage from './pages/SettingsPage';

const SEO_PAGES: Record<string, string> = {
  '/': 'home',
  '/wheel': 'wheel',
  '/daily': 'daily',
  '/search': 'search',
  '/favorites': 'favorites',
  '/history': 'history',
  '/stats': 'stats',
  '/achievements': 'achievements',
  '/settings': 'settings',
};

function usePageSEO(path: string, t: (k: string) => string) {
  useEffect(() => {
    const key = SEO_PAGES[path] || 'home';
    const title = t(`seo.${key}.title`);
    const description = t(`seo.${key}.desc`);
    document.title = title;
    const setMeta = (attr: string, name: string, content: string) => {
      const el = document.querySelector(`${attr}[name="${name}"]`);
      if (el) el.setAttribute('content', content);
    };
    const setMetaProp = (attr: string, prop: string, content: string) => {
      const el = document.querySelector(`${attr}[property="${prop}"]`);
      if (el) el.setAttribute('content', content);
    };
    setMeta('meta', 'description', description);
    setMetaProp('meta', 'og:title', title);
    setMetaProp('meta', 'og:description', description);
    setMeta('meta', 'twitter:title', title);
    setMeta('meta', 'twitter:description', description);
  }, [path, t]);
}

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showMore, setShowMore] = useState(false);
  const hasSeenOnboarding = useStore(s => s.hasSeenOnboarding);
  const { t } = useI18n();

  const currentPath = location.pathname;
  const isMainTab = SEO_PAGES[currentPath] ? ['home', 'wheel', 'daily', 'search'].includes(SEO_PAGES[currentPath]) : false;
  const moreActive = !isMainTab;

  usePageSEO(currentPath, t);

  const navigateTo = (path: string) => {
    navigate(path);
    setShowMore(false);
  };

  const MAIN_TABS = [
    { path: '/', icon: Gamepad2, label: t('nav.cards') },
    { path: '/wheel', icon: RotateCw, label: t('nav.wheel') },
    { path: '/daily', icon: Sun, label: t('nav.today') },
    { path: '/search', icon: Search, label: t('nav.search') },
  ];

  const MORE_ITEMS = [
    { path: '/favorites', icon: Heart, label: t('nav.favorites') },
    { path: '/history', icon: Clock, label: t('nav.history') },
    { path: '/stats', icon: BarChart3, label: t('nav.stats') },
    { path: '/achievements', icon: Award, label: t('nav.achievements') },
    { path: '/settings', icon: Settings, label: t('nav.settings') },
  ];

  return (
    <div className="min-h-dvh flex text-[var(--text)]">
      {!hasSeenOnboarding && <Onboarding />}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col w-64 shrink-0 bg-[var(--surface)] border-r border-[var(--border)] sticky top-0 h-dvh z-30">
        <div className="px-6 pt-7 pb-6">
          <div className="text-xl font-extrabold text-[var(--primary)] leading-tight">{t('app.name')}</div>
          <p className="text-xs text-[var(--text-sec)] mt-1.5">{t('app.subtitle')}</p>
        </div>
        <nav className="flex-1 overflow-auto px-3 pb-6 space-y-1 scrollbar-thin">
          {[...MAIN_TABS, ...MORE_ITEMS].map(item => {
            const active = currentPath === item.path;
            return (
              <button key={item.path} onClick={() => navigateTo(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors active:scale-[0.98] ${
                  active ? 'bg-[var(--primary)]/10 text-[var(--primary)]' : 'text-[var(--text)] hover:bg-[var(--bg)]'
                }`}>
                <item.icon size={20} className={active ? 'text-[var(--primary)]' : 'text-[var(--text-sec)]'} />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="px-6 py-6 text-xs text-[var(--text-sec)]">
          {t('app.tafhub')} <a href="https://tafhub.com/" target="_blank" rel="noopener noreferrer" className="underline">TafHub</a>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Page */}
        <main className="flex-1 flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div key={currentPath}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="flex-1 flex flex-col overflow-auto scrollbar-thin w-full max-w-5xl mx-auto"
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
              className="absolute bottom-0 left-0 right-0 mx-auto max-w-md bg-[var(--surface)] rounded-t-3xl p-6 pb-10"
              onClick={e => e.stopPropagation()}
              style={{ paddingBottom: 'calc(1.5rem + var(--safe-bottom))' }}
            >
              <div className="flex justify-center mb-3">
                <div className="w-10 h-1 rounded-full bg-[var(--border)]" />
              </div>
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-lg font-bold text-[var(--text)]">{t('nav.more')}</h2>
                <button onClick={() => setShowMore(false)} aria-label={t('a11y.close')} className="p-2 rounded-full hover:bg-[var(--border)]">
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
      <nav className="md:hidden sticky bottom-0 z-40 bg-[var(--surface)]/95 backdrop-blur-xl border-t border-[var(--border)]"
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
          <button onClick={() => setShowMore(!showMore)} aria-label={t('nav.more')}
            className={`relative flex-1 flex flex-col items-center justify-center py-2.5 transition-colors touch-target ${
              moreActive ? 'text-[var(--primary)]' : 'text-[var(--text-sec)]'
            }`}>
            {moreActive && (
              <motion.div layoutId="tab-indicator"
                className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[3px] rounded-full bg-[var(--primary)]"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
            )}
            <Menu size={24} strokeWidth={moreActive ? 2.5 : 1.5} />
            <span className={`text-[11px] mt-1 ${moreActive ? 'font-bold' : 'font-medium'}`}>{t('nav.more')}</span>
          </button>
        </div>
      </nav>
      </div>
    </div>
  );
}

export default function App() {
  const isDark = useDarkMode();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  return (
    <BrowserRouter>
      <MotionConfig reducedMotion="user">
        <AppContent />
      </MotionConfig>
    </BrowserRouter>
  );
}
