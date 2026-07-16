import { useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { useStore } from '../store/useStore';
import { ACHIEVEMENTS, getAchievementProgress } from '../data/achievements';
import { triggerHaptic } from '../utils';

export default function AchievementsPage() {
  const statistics = useStore(s => s.statistics);
  const unlockedAchievements = useStore(s => s.unlockedAchievements);
  const newAchievements = useStore(s => s.newAchievements);
  const clearNewAchievements = useStore(s => s.clearNewAchievements);
  const soundEnabled = useStore(s => s.soundEnabled);

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
    <div className="flex-1 overflow-auto px-6 pt-6 pb-28 scrollbar-thin">
      <h1 className="text-2xl font-extrabold text-[var(--text)] mb-6">Achievements</h1>
      <div className="bg-[var(--surface)] rounded-2xl p-6 text-center mb-8 border border-[var(--border)]">
        <p className="text-sm text-[var(--text-sec)] mb-3.5">{total} / {ACHIEVEMENTS.length} unlocked</p>
        <div className="w-full h-2.5 bg-[var(--border)] rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-[var(--primary)] transition-all duration-500"
            style={{ width: `${(total / ACHIEVEMENTS.length) * 100}%` }} />
        </div>
      </div>

      <div className="space-y-4">
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
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl shrink-0 ${
                unlocked ? 'bg-yellow-100' : 'bg-[var(--bg)] opacity-50'
              }`}>
                {a.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-semibold text-sm ${unlocked ? 'text-[var(--text)]' : 'text-[var(--text-sec)]'}`}>
                  {a.title}
                </p>
                <p className="text-xs text-[var(--text-sec)] mt-0.5">{a.description}</p>
                {!unlocked && (
                  <>
                    <div className="w-full h-2 bg-[var(--border)] rounded-full overflow-hidden mt-2">
                      <div className="h-full rounded-full bg-[var(--primary)] transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-[10px] text-[var(--text-sec)] mt-1">{progress} / {a.requirement}</p>
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
              <p className="text-2xl font-bold mb-4">Achievement Unlocked!</p>
              <div className="bg-[var(--primary)]/10 rounded-2xl p-5 mb-5">
                <span className="text-4xl">{currentAchievement.icon}</span>
                <p className="text-lg font-bold text-[var(--text)] mt-2">{currentAchievement.title}</p>
                <p className="text-sm text-[var(--text-sec)] mt-1">{currentAchievement.description}</p>
              </div>
              {newAchievements.length > 1 && (
                <p className="text-xs text-[var(--text-sec)] mb-3">+{newAchievements.length - 1} more achievements</p>
              )}
              <button onClick={clearNewAchievements}
                className="w-full py-3.5 rounded-xl bg-[var(--primary)] text-white font-bold active:scale-95 transition">
                Awesome!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
