import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Heart, Share2, Undo2, RotateCcw, Clock, Check, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { CategorySelector } from '../components/CategorySelector';
import { Timer } from '../components/Timer';
import { useStore } from '../store/useStore';
import { useToast } from '../components/Toast';
import { useI18n } from '../i18n';
import type { Category, Mood } from '../types';
import { CATEGORIES, MOODS } from '../types';
import { COMMANDS, cmdId, getCommandMoodAt, getCommandMoodById } from '../data/commands';
import type { CommandId } from '../data/commands';
import { getCachedCommands } from '../i18n/commands/loader';
import { triggerHaptic, shareCommand } from '../utils';

export default function CardsPage() {
  const favorites = useStore(s => s.favorites);
  const addFavorite = useStore(s => s.addFavorite);
  const removeFavorite = useStore(s => s.removeFavorite);
  const addToHistory = useStore(s => s.addToHistory);
  const disabledCategories = useStore(s => s.disabledCategories);
  const disabledMoods = useStore(s => s.disabledMoods);
  const soundEnabled = useStore(s => s.soundEnabled);
  const history = useStore(s => s.history);
  const language = useStore(s => s.language);
  const drawFromDeck = useStore(s => s.drawFromDeck);
  const seenIds = useStore(s => s.seenIds);
  const undoDeck = useStore(s => s.undoDeck);
  const undoLastDraw = useStore(s => s.undoLastDraw);
  const checkAndUnlockAchievements = useStore(s => s.checkAndUnlockAchievements);
  const completedCommands = useStore(s => s.completedCommands);
  const markCompleted = useStore(s => s.markCompleted);
  const { showToast } = useToast();
  const { t, resolveCommand } = useI18n();

  const [selectedCategory, setSelectedCategory] = useState<Category | 'Random'>('Random');
  const [selectedMood, setSelectedMood] = useState<Mood | 'all'>('all');
  const [currentCommand, setCurrentCommand] = useState<CommandId>('');
  const [currentCatInfo, setCurrentCatInfo] = useState(CATEGORIES[0]);
  const [currentMood, setCurrentMood] = useState<Mood>('sweet');
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawnCommands, setDrawnCommands] = useState<string[]>([]);
  const [isFilterEmpty, setIsFilterEmpty] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState(5);
  const [flash, setFlash] = useState(false);
  const [showMoodFilter, setShowMoodFilter] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }, []);

  const currentText = currentCommand ? resolveCommand(currentCommand) : '';
  const isFavorite = currentCommand ? favorites.includes(currentCommand) : false;
  const isCompleted = currentCommand ? completedCommands.includes(currentCommand) : false;
  const canUndo = history.length > 0 && history[0] !== undefined;

  const drawCard = useCallback(() => {
    if (isDrawing) return;
    setIsDrawing(true);
    setFlash(true);
    setIsFlipped(false);
    if (soundEnabled) triggerHaptic('medium');

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      const buildPool = () => {
        const cats = disabledCategories.length > 0
          ? CATEGORIES.filter(c => !disabledCategories.includes(c.id))
          : CATEGORIES;
        const cached = getCachedCommands(language);
        const pool: { id: CommandId; cat: typeof CATEGORIES[0] }[] = [];
        for (const cat of cats) {
          const list = cached?.[cat.id] ?? COMMANDS[cat.id] ?? [];
          list.forEach((_cmd, index) => {
            const id = cmdId(cat.id, index);
            const mood = getCommandMoodAt(cat.id, index);
            if (selectedMood !== 'all' && mood !== selectedMood) return;
            if (disabledMoods.includes(mood)) return;
            if (selectedCategory !== 'Random' && cat.id !== selectedCategory) return;
            pool.push({ id, cat });
          });
        }
        return pool;
      };

      const pool = buildPool();
      if (pool.length === 0) {
        setIsFilterEmpty(true);
        setCurrentCommand('');
        setCurrentCatInfo(CATEGORIES[0]);
        setCurrentMood('sweet');
      } else {
        const wasSeenFull = seenIds.length > 0 && pool.every(p => seenIds.includes(p.id));
        const poolIds = pool.map(p => p.id);
        const pickId = drawFromDeck(poolIds);
        const pick = pool.find(p => p.id === pickId) ?? pool[0];
        const isReshuffle = wasSeenFull;
        setIsFilterEmpty(false);
        setCurrentCommand(pick.id);
        setCurrentCatInfo(pick.cat);
        setCurrentMood(getCommandMoodById(pick.id));
        setDrawnCommands(prev => [...prev, pick.id].slice(-5000));
        if (isReshuffle) showToast(t('cards.toastReshuffle'), 'success');
        addToHistory(pick.id);
        checkAndUnlockAchievements();
      }

      if (soundEnabled) triggerHaptic('success');
      setIsDrawing(false);
      setTimeout(() => setIsFlipped(true), 100);
      setTimeout(() => setFlash(false), 200);
    }, 300);
  }, [selectedCategory, selectedMood, isDrawing, disabledCategories, disabledMoods, soundEnabled, addToHistory, checkAndUnlockAchievements, showToast, t, language, seenIds, drawFromDeck]);

  const handleFavorite = () => {
    if (!currentCommand) return;
    isFavorite ? removeFavorite(currentCommand) : addFavorite(currentCommand);
    if (soundEnabled) triggerHaptic('light');
    showToast(isFavorite ? t('cards.toastFavRemoved') : t('cards.toastFavAdded'), 'success');
  };

  const handleShare = () => {
    if (currentCommand) shareCommand(currentText, t(`cat.${currentCatInfo.id}`));
  };

  const handleUndo = () => {
    if (canUndo) {
      const last = history[0];
      setDrawnCommands(prev => prev.filter(c => c !== last));
      if (last) undoDeck(last);
      undoLastDraw();
      setCurrentCommand('');
      setIsFlipped(false);
      if (soundEnabled) triggerHaptic('light');
    }
  };

  const handleComplete = () => {
    if (!currentCommand || isCompleted) return;
    markCompleted(currentCommand);
    setShowConfetti(true);
    if (soundEnabled) triggerHaptic('success');
    showToast(t('cards.toastCompleted'), 'success');
    setTimeout(() => setShowConfetti(false), 1500);
  };

  const handleReset = () => {
    setDrawnCommands([]);
    setCurrentCommand('');
    setIsFlipped(false);
    if (soundEnabled) triggerHaptic('light');
  };

  const gradientStyle = !isFilterEmpty && currentCommand
    ? { background: `linear-gradient(135deg, ${currentCatInfo.gradient[0]}, ${currentCatInfo.gradient[1]})` }
    : { background: 'linear-gradient(135deg, #6b6b6b, #4a4a4a)' };

  const moodInfo = MOODS.find(m => m.id === currentMood);

  return (
    <div className="flex-1 flex flex-col px-6 pt-6 pb-28 md:pb-12 overflow-auto">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl font-extrabold text-[var(--text)]">{t('app.name')}</h1>
        <p className="hidden md:block text-sm text-[var(--text-sec)] mt-1.5">
          {t('app.tagline')}
        </p>
      </div>

      <div className="md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,360px)] md:gap-10 lg:gap-14 md:items-start">
      {/* Filters */}
      <div className="md:order-2">
      <CategorySelector selected={selectedCategory} onSelect={setSelectedCategory} />

      <div className="pt-2 pb-2">
        <button onClick={() => setShowMoodFilter(!showMoodFilter)}
          className="flex items-center gap-2 text-sm font-medium text-[var(--text-sec)] hover:text-[var(--text)] transition">
          <Sparkles size={14} />
          <span>{t('cards.mood')}: {selectedMood === 'all' ? t('cards.allMoods') : t(`mood.${selectedMood}`)}</span>
          {showMoodFilter ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      <AnimatePresence>
        {showMoodFilter && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="flex gap-2.5 overflow-x-auto py-3 -mx-6 px-6 scrollbar-none md:flex-wrap md:overflow-visible md:mx-0 md:px-0">
              <button onClick={() => setSelectedMood('all')}
                className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold border transition-all active:scale-95 ${
                  selectedMood === 'all'
                    ? 'bg-[var(--text)] text-[var(--bg)] border-[var(--text)]'
                    : 'bg-[var(--surface)] text-[var(--text)] border-[var(--border)]'
                }`}>
                {t('cards.allMoods')}
              </button>
              {MOODS.map(mood => (
                <button key={mood.id} onClick={() => setSelectedMood(mood.id)}
                  className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold border transition-all active:scale-95 ${
                    selectedMood === mood.id
                      ? 'text-white border-transparent'
                      : 'bg-[var(--surface)] text-[var(--text)] border-[var(--border)]'
                  }`}
                  style={selectedMood === mood.id ? { background: mood.color } : {}}>
                  {mood.emoji} {t(`mood.${mood.id}`)}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>

      {/* Card + actions column */}
      <div className="md:order-1">
      <div className="flex-1 flex justify-center items-center py-4 perspective-[1000px] min-h-0">
        <div className="relative w-full max-w-sm md:max-w-md">
          <AnimatePresence>
            {showConfetti && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center"
              >
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ x: 0, y: 0, scale: 0 }}
                    animate={{
                      x: (Math.random() - 0.5) * 200,
                      y: (Math.random() - 0.5) * 200,
                      scale: [0, 1.2, 0],
                      rotate: Math.random() * 360,
                    }}
                    transition={{ duration: 1, delay: i * 0.05 }}
                    className="absolute w-3 h-3 rounded-full"
                    style={{ background: CATEGORIES[i % 5].color }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div
            className="w-full cursor-pointer"
            style={{ perspective: 1000 }}
            onClick={() => !currentCommand && drawCard()}
            role="button"
            tabIndex={0}
            aria-label={t('a11y.drawCard')}
            onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && !currentCommand) { e.preventDefault(); drawCard(); } }}
          >
            <div
              className="w-full relative"
              style={{
                transformStyle: 'preserve-3d',
                transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              }}
            >
            <div className="w-full min-h-[420px] rounded-3xl p-8 text-center text-white shadow-2xl flex flex-col items-center justify-center"
              style={{
                ...gradientStyle,
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
              }}>
              <span className="text-6xl mb-4">🎲</span>
              <span className="text-sm font-semibold uppercase tracking-widest text-white/80">{t('cards.tapToDraw')}</span>
              <p className="text-xs text-white/60 mt-2">{t('cards.orButton')}</p>
            </div>

            <div className="w-full min-h-[420px] rounded-3xl p-8 text-center text-white shadow-2xl flex flex-col items-center justify-center absolute inset-0"
              style={{
                ...gradientStyle,
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
              }}>
              <span className="text-4xl mb-3">{isFilterEmpty ? '🎴' : currentCatInfo.emoji}</span>
              {!isFilterEmpty && (
                <div className="flex items-center gap-2.5 mb-4">
                  <span className="text-xs font-semibold uppercase tracking-widest opacity-80">{t(`cat.${currentCatInfo.id}`)}</span>
                  {moodInfo && (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-white/20 font-medium">
                      {moodInfo.emoji} {t(`mood.${moodInfo.id}`)}
                    </span>
                  )}
                </div>
              )}

              <p className="text-lg font-bold leading-relaxed mb-6 px-2">
                {isFilterEmpty ? t('cards.emptyFilter') : currentText}
              </p>

              {!isFilterEmpty && (
                <div className="flex gap-4">
                  <button onClick={(e) => { e.stopPropagation(); handleFavorite(); }}
                    aria-label={isFavorite ? t('a11y.removeFavorite') : t('a11y.addFavorite')}
                    className="p-3.5 rounded-full bg-white/20 hover:bg-white/30 transition active:scale-90">
                    <Heart size={22} fill={isFavorite ? 'white' : 'none'} className="text-white" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleShare(); }}
                    aria-label={t('a11y.share')}
                    className="p-3.5 rounded-full bg-white/20 hover:bg-white/30 transition active:scale-90">
                    <Share2 size={22} className="text-white" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleComplete(); }}
                    aria-label={t('a11y.complete')}
                    className={`p-3.5 rounded-full transition active:scale-90 ${
                      isCompleted ? 'bg-white/40' : 'bg-white/20 hover:bg-white/30'
                    }`}>
                    <Check size={22} className="text-white" fill={isCompleted ? 'white' : 'none'} />
                  </button>
                </div>
              )}
            </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <button onClick={drawCard} disabled={isDrawing}
          className="w-full py-4 rounded-2xl bg-[var(--primary)] text-white text-lg font-bold flex items-center justify-center gap-3 shadow-lg shadow-[var(--primary)]/30 active:scale-[0.98] transition disabled:opacity-40 touch-target">
          <Zap size={22} /> {isDrawing ? t('cards.drawing') : t('cards.draw')}
        </button>
        <div className="mt-4 flex gap-3">
          <button onClick={handleUndo} disabled={!canUndo || !currentCommand}
            className="flex-1 py-4 rounded-xl bg-[var(--surface)] text-[var(--text-sec)] border border-[var(--border)] font-semibold flex items-center justify-center gap-2 text-sm active:scale-95 transition disabled:opacity-30 touch-target">
            <Undo2 size={16} /> {t('cards.undo')}
          </button>
          <button onClick={() => setShowTimer(true)}
            className="flex-1 py-4 rounded-xl bg-[var(--surface)] text-[var(--text-sec)] border border-[var(--border)] font-semibold flex items-center justify-center gap-2 text-sm active:scale-95 transition touch-target">
            <Clock size={16} /> {t('cards.timer')}
          </button>
          <button onClick={handleReset}
            className="flex-1 py-4 rounded-xl bg-[var(--surface)] text-[var(--text-sec)] border border-[var(--border)] font-semibold flex items-center justify-center gap-2 text-sm active:scale-95 transition touch-target">
            <RotateCcw size={16} /> {t('cards.reset')}
          </button>
        </div>
      </div>
      </div>
      </div>

      <Timer open={showTimer} onClose={() => setShowTimer(false)} initialMinutes={timerMinutes} />

      <p className="text-center text-xs mt-6 md:hidden" style={{ color: 'color-mix(in srgb, var(--text-sec) 60%, transparent)' }}>
        <a href="https://tafhub.com/" target="_blank" rel="noopener noreferrer" className="underline hover:opacity-100 transition opacity-90">{t('app.tafhub')}</a>
      </p>
    </div>
  );
}