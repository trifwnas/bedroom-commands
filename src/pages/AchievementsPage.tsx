import { useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { useStore } from '../store/useStore';
import { ACHIEVEMENTS, getAchievementProgress } from '../data/achievements';
import { triggerHaptic } from '../utils';
import { useI18n } from '../i18n';

const ACH_TITLE_KEY: Record<string, string> = {
  first_draw: 'ach.gettingStarted', draw_10: 'ach.warmUp', draw_50: 'ach.gettingIntoIt',
  draw_100: 'ach.dedicated', draw_500: 'ach.commandMaster', first_favorite: 'ach.saver',
  favorites_10: 'ach.collector', favorites_50: 'ach.treasury', first_challenge: 'ach.dailyPlayer',
  challenges_7: 'ach.weekWarrior', challenges_30: 'ach.monthlyChampion', streak_3: 'ach.hatTrick',
  streak_7: 'ach.weekLong', streak_30: 'ach.monthlyMagic', all_categories: 'ach.explorer',
};

const ACH_DESC_KEY: Record<string, string> = {
  first_draw: 'ach.drawFirst', draw_10: 'ach.draw10', draw_50: 'ach.draw50',
  draw_100: 'ach.draw100', draw_500: 'ach.draw500', first_favorite: 'ach.saveFirst',
  favorites_10: 'ach.save10', favorites_50: 'ach.save50', first_challenge: 'ach.completeFirst',
  challenges_7: 'ach.complete7', challenges_30: 'ach.complete30', streak_3: 'ach.streak3',
  streak_7: 'ach.streak7', streak_30: 'ach.streak30', all_categories: 'ach.drawAll5',
};

export default function AchievementsPage() {
  const statistics = useStore(s => s.statistics);
  const unlockedAchievements = useStore(s => s.unlockedAchievements);
  const newAchievements = useStore(s => s.newAchievements);
  const clearNewAchievements = useStore(s => s.clearNewAchievements);
  const soundEnabled = useStore(s => s.soundEnabled);
  const { t } = useI18n();

  const unlockedIds = useMemo(
    () => unlockedAchievements.map(a => a.achievementId),
    [unlockedAchievements]
  );

  useEffect(() => {
    if (newAchievements.length > 0 && soundEnabled) {
      triggerHaptic('success');
    }
  }, [newAchievements, soundEnabled]);

  const total = unlockedIds.length;
  const currentAchievement = newAchievements.length > 0
    ? ACHIEVEMENTS.find(x => x.id === newAchievements[0]?.achievementId)
    : null;

  return (
    <div className="flex-1 overflow-auto px-6 pt-6 pb-28 md:pb-12 scrollbar-thin">
      <h1 className="text-2xl font-extrabold text-[var(--text)] mb-6">{t('achievements.title')}</h1>
      <div className="bg-[var(--surface)] rounded-2xl p-6 text-center mb-8 border border-[var(--border)] lg:max-w-2xl">
        <p className="text-sm text-[var(--text-sec)] mb-4">{t('achievements.unlocked', { done: total, total: ACHIEVEMENTS.length })}</p>
        <div className="w-full h-3 bg-[var(--border)] rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-[var(--primary)] transition-all duration-500"
            style={{ width: `${(total / ACHIEVEMENTS.length) * 100}%` }} />
        </div>
      </div>

      <div className="space-y-4 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4 md:space-y-0">
        {ACHIEVEMENTS.map(a => {
          const unlocked = unlockedIds.includes(a.id);
          const progress = getAchievementProgress(a, statistics);
          const pct = Math.min((progress / a.requirement) * 100, 100);

          return (
            <div key={a.id}
              className={`flex items-center gap-4 p-5 rounded-2xl border transition-all ${
                unlocked
                  ? 'bg-[var(--surface)] border-green-400 shadow-sm'
                  : 'bg-[var(--surface)] border-[var(--border)]'
              }`}>
              <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl shrink-0 ${
                unlocked ? 'bg-yellow-100' : 'bg-[var(--bg)] opacity-50'
              }`}>
                {a.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-semibold ${unlocked ? 'text-[var(--text)]' : 'text-[var(--text-sec)]'}`}>
                  {t(ACH_TITLE_KEY[a.id] || a.title)}
                </p>
                <p className="text-xs text-[var(--text-sec)] mt-1">{t(ACH_DESC_KEY[a.id] || a.description)}</p>
                {!unlocked && (
                  <>
                    <div className="w-full h-2.5 bg-[var(--border)] rounded-full overflow-hidden mt-3">
                      <div className="h-full rounded-full bg-[var(--primary)] transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-[10px] text-[var(--text-sec)] mt-1.5">{progress} / {a.requirement}</p>
                  </>
                )}
              </div>
              {unlocked && <CheckCircle size={22} className="text-green-500 shrink-0" />}
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {currentAchievement && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-6"
            onClick={clearNewAchievements}>
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}
              className="bg-[var(--surface)] rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
              onClick={e => e.stopPropagation()}>
              <p className="text-2xl font-bold mb-5">{t('achievements.unlockedModal')}</p>
              <div className="bg-[var(--primary)]/10 rounded-2xl p-6 mb-6">
                <span className="text-4xl">{currentAchievement.icon}</span>
                <p className="text-lg font-bold text-[var(--text)] mt-3">{t(ACH_TITLE_KEY[currentAchievement.id] || currentAchievement.title)}</p>
                <p className="text-sm text-[var(--text-sec)] mt-1.5">{t(ACH_DESC_KEY[currentAchievement.id] || currentAchievement.description)}</p>
              </div>
              {newAchievements.length > 1 && (
                <p className="text-xs text-[var(--text-sec)] mb-4">{t('achievements.more', { count: newAchievements.length - 1 })}</p>
              )}
              <button onClick={clearNewAchievements}
                className="w-full py-4 rounded-xl bg-[var(--primary)] text-white font-bold active:scale-95 transition">
                {t('achievements.awesome')}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
