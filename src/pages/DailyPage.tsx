import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Share2, Check, Clock, PlusCircle, Calendar } from 'lucide-react';
import { useStore } from '../store/useStore';
import { CATEGORIES } from '../types';
import { shareCommand, triggerHaptic } from '../utils';
import { Timer } from '../components/Timer';
import { useToast } from '../components/Toast';
import { useI18n } from '../i18n';

export default function DailyPage() {
  const dailyChallenge = useStore(s => s.dailyChallenge);
  const generateDailyChallenge = useStore(s => s.generateDailyChallenge);
  const completeDailyChallenge = useStore(s => s.completeDailyChallenge);
  const addToHistory = useStore(s => s.addToHistory);
  const favorites = useStore(s => s.favorites);
  const addFavorite = useStore(s => s.addFavorite);
  const removeFavorite = useStore(s => s.removeFavorite);
  const soundEnabled = useStore(s => s.soundEnabled);
  const completedChallenges = useStore(s => s.statistics.completedChallenges);
  const { showToast } = useToast();
  const { t, resolveCommand } = useI18n();

  const [showTimer, setShowTimer] = useState(false);

  useEffect(() => { generateDailyChallenge(); }, []);

  const category = dailyChallenge ? CATEGORIES.find(c => c.id === dailyChallenge.category) : null;
  const isFav = dailyChallenge ? favorites.includes(dailyChallenge.command) : false;

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return t('daily.greetingMorning');
    if (h < 18) return t('daily.greetingAfternoon');
    return t('daily.greetingEvening');
  })();

  if (!dailyChallenge || !category) {
    return <div className="flex-1 flex items-center justify-center text-[var(--text-sec)]">{t('daily.loading')}</div>;
  }

  const dailyText = resolveCommand(dailyChallenge.command);

  return (
    <div className="flex-1 flex flex-col px-6 pt-6 pb-28 md:pb-12 overflow-auto w-full max-w-2xl mx-auto">
      <p className="text-sm text-[var(--text-sec)] mb-1">{greeting}</p>
      <h1 className="text-2xl font-extrabold text-[var(--text)] mb-6">{t('daily.title')}</h1>

      <motion.div
        key={dailyText}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="rounded-3xl p-8 text-center text-white mb-8 shadow-lg"
        style={{ background: `linear-gradient(135deg, ${category.gradient[0]}, ${category.gradient[1]})` }}
      >
        {dailyChallenge.completed && (
          <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full text-sm font-semibold mb-4">
            <Check size={14} /> {t('daily.completed')}
          </div>
        )}
        <div className="text-4xl mb-3">{category.emoji}</div>
        <div className="text-xs font-semibold uppercase tracking-widest opacity-80 mb-5">{t(`cat.${category.id}`)}</div>
        <p className="text-xl font-bold leading-relaxed mb-6">{dailyText}</p>
        <div className="flex justify-center gap-4">
          <button onClick={() => {
            isFav ? removeFavorite(dailyChallenge.command) : addFavorite(dailyChallenge.command);
            if (soundEnabled) triggerHaptic('light');
            showToast(isFav ? t('cards.toastFavRemoved') : t('cards.toastFavAdded'), 'success');
          }}
            aria-label={isFav ? t('a11y.removeFavorite') : t('a11y.addFavorite')}
            className="p-3.5 rounded-full bg-white/20 hover:bg-white/30 transition active:scale-90">
            <Heart size={22} fill={isFav ? 'white' : 'none'} className="text-white" />
          </button>
          <button onClick={() => shareCommand(dailyText, t(`cat.${category.id}`))}
            aria-label={t('a11y.share')}
            className="p-3.5 rounded-full bg-white/20 hover:bg-white/30 transition active:scale-90">
            <Share2 size={22} className="text-white" />
          </button>
        </div>
      </motion.div>

      {!dailyChallenge.completed && (
        <button onClick={() => { completeDailyChallenge(); if (soundEnabled) triggerHaptic('success'); showToast(t('daily.toastCompleted'), 'success'); }}
          className="w-full py-4 rounded-2xl bg-[var(--success)] text-white text-lg font-bold flex items-center justify-center gap-3 mb-6 active:scale-95 transition shadow-lg shadow-[var(--success)]/30 touch-target">
          <Check size={22} /> {t('daily.complete')}
        </button>
      )}

      <div className="flex gap-3 mb-8">
        <button onClick={() => setShowTimer(true)}
          className="flex-1 py-4 rounded-xl bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] font-semibold flex items-center justify-center gap-2.5 text-sm active:scale-95 transition touch-target">
          <Clock size={16} /> {t('daily.startTimer')}
        </button>
        <button onClick={() => { addToHistory(dailyChallenge.command); if (soundEnabled) triggerHaptic('light'); showToast(t('daily.toastHistoryAdded'), 'info'); }}
          className="flex-1 py-4 rounded-xl bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] font-semibold flex items-center justify-center gap-2.5 text-sm active:scale-95 transition touch-target">
          <PlusCircle size={16} /> {t('daily.addToHistory')}
        </button>
      </div>

      <div className="bg-[var(--surface)] rounded-2xl p-6 flex items-center gap-4 border border-[var(--border)]">
        <Calendar size={24} className="text-[var(--primary)]" />
        <div>
          <p className="text-2xl font-bold text-[var(--text)]">{completedChallenges}</p>
          <p className="text-sm text-[var(--text-sec)]">{t('daily.challengesCompleted')}</p>
        </div>
      </div>

      <Timer open={showTimer} onClose={() => setShowTimer(false)} />
    </div>
  );
}
