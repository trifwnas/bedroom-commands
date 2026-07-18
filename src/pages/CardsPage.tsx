import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { Zap, Heart, Share2, Undo2, RotateCcw, Clock, Check, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { CategorySelector } from '../components/CategorySelector';
import { Timer } from '../components/Timer';
import { useStore } from '../store/useStore';
import { useToast } from '../components/Toast';
import type { Category, Mood } from '../types';
import { CATEGORIES, CATEGORY_MAP, MOODS } from '../types';
import { COMMANDS, COMMAND_TO_CATEGORY, getCommandMood } from '../data/commands';
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
  const undoLastDraw = useStore(s => s.undoLastDraw);
  const checkAndUnlockAchievements = useStore(s => s.checkAndUnlockAchievements);
  const completedCommands = useStore(s => s.completedCommands);
  const markCompleted = useStore(s => s.markCompleted);
  const { showToast } = useToast();

  const [selectedCategory, setSelectedCategory] = useState<Category | 'Random'>('Random');
  const [selectedMood, setSelectedMood] = useState<Mood | 'all'>('all');
  const [currentCommand, setCurrentCommand] = useState('');
  const [currentCatInfo, setCurrentCatInfo] = useState(CATEGORIES[0]);
  const [currentMood, setCurrentMood] = useState<Mood>('sweet');
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawnCommands, setDrawnCommands] = useState<string[]>([]);
  const [showTimer, setShowTimer] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState(5);
  const [flash, setFlash] = useState(false);
  const [showMoodFilter, setShowMoodFilter] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }, []);

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
      const cats = disabledCategories.length > 0
        ? CATEGORIES.filter(c => !disabledCategories.includes(c.id))
        : CATEGORIES;

      let availableCmds: { text: string; cat: typeof CATEGORIES[0] }[] = [];

      for (const cat of cats) {
        const allCmds = COMMANDS[cat.id] || [];
        const remaining = allCmds.filter(c => !drawnCommands.includes(c));
        for (const cmd of remaining) {
          const mood = getCommandMood(cmd, cat.id);
          if (selectedMood !== 'all' && mood !== selectedMood) continue;
          if (disabledMoods.includes(mood)) continue;
          availableCmds.push({ text: cmd, cat });
        }
      }

      if (selectedCategory !== 'Random') {
        availableCmds = availableCmds.filter(c => c.cat.id === selectedCategory);
      }

      const pick = availableCmds.length > 0
        ? availableCmds[Math.floor(Math.random() * availableCmds.length)]
        : null;

      if (pick) {
        setCurrentCommand(pick.text);
        setCurrentCatInfo(pick.cat);
        setCurrentMood(getCommandMood(pick.text, pick.cat.id));
        setDrawnCommands(prev => [...prev, pick.text]);
        addToHistory(pick.text);
        checkAndUnlockAchievements();
        setTimeout(() => setIsFlipped(true), 100);
      } else {
        setCurrentCommand('All drawn! Hit Reset to start over.');
        setCurrentCatInfo(CATEGORIES[0]);
        setCurrentMood('sweet');
      }

      if (soundEnabled) triggerHaptic('success');
      setIsDrawing(false);
      setTimeout(() => setFlash(false), 200);
    }, 300);
  }, [selectedCategory, selectedMood, isDrawing, drawnCommands, disabledCategories, disabledMoods, soundEnabled, addToHistory, checkAndUnlockAchievements]);

  const handleFavorite = () => {
    if (!currentCommand) return;
    isFavorite ? removeFavorite(currentCommand) : addFavorite(currentCommand);
    if (soundEnabled) triggerHaptic('light');
    showToast(isFavorite ? 'Removed from favorites' : 'Added to favorites', 'success');
  };

  const handleShare = () => {
    if (currentCommand) shareCommand(currentCommand, currentCatInfo.name);
  };

  const handleUndo = () => {
    if (canUndo) {
      setDrawnCommands(prev => prev.filter(c => c !== history[0]));
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
    showToast('Nice! Marked as completed 🎉', 'success');
    setTimeout(() => setShowConfetti(false), 1500);
  };

  const handleReset = () => {
    setDrawnCommands([]);
    setCurrentCommand('');
    setIsFlipped(false);
    if (soundEnabled) triggerHaptic('light');
  };

  const gradientStyle = currentCommand && currentCommand !== 'All drawn! Hit Reset to start over.'
    ? { background: `linear-gradient(135deg, ${currentCatInfo.gradient[0]}, ${currentCatInfo.gradient[1]})` }
    : { background: 'linear-gradient(135deg, #e0e0e0, #c0c0c0)' };

  const moodInfo = MOODS.find(m => m.id === currentMood);

  return (
    <div className="flex-1 flex flex-col px-6 pt-6 pb-28 overflow-auto">
      {/* Header with progress */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text)]">Bedroom Commands</h1>
          <p className="text-sm text-[var(--text-sec)] mt-1">
            {completedCommands.length} of 395 completed
          </p>
        </div>
        {completedCommands.length > 0 && (
          <div className="relative w-12 h-12">
            <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--border)" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--primary)" strokeWidth="3"
                strokeDasharray={`${Math.min((completedCommands.length / 395) * 97.4, 97.4)} 97.4`}
                strokeLinecap="round" className="transition-all duration-700" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-[var(--primary)]">
              {Math.round((completedCommands.length / 395) * 100)}%
            </span>
          </div>
        )}
      </div>

      {/* Category selector */}
      <CategorySelector selected={selectedCategory} onSelect={setSelectedCategory} />

      {/* Mood filter toggle */}
      <div className="pt-1 pb-1">
        <button onClick={() => setShowMoodFilter(!showMoodFilter)}
          className="flex items-center gap-2 text-sm font-medium text-[var(--text-sec)] hover:text-[var(--text)] transition">
          <Sparkles size={14} />
          <span>Mood: {selectedMood === 'all' ? 'All' : MOODS.find(m => m.id === selectedMood)?.label || 'All'}</span>
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
            <div className="flex gap-2 overflow-x-auto py-2 -mx-6 px-6 scrollbar-none">
              <button onClick={() => setSelectedMood('all')}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all active:scale-95 ${
                  selectedMood === 'all'
                    ? 'bg-[var(--text)] text-[var(--bg)] border-[var(--text)]'
                    : 'bg-[var(--surface)] text-[var(--text)] border-[var(--border)]'
                }`}>
                All Moods
              </button>
              {MOODS.map(mood => (
                <button key={mood.id} onClick={() => setSelectedMood(mood.id)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all active:scale-95 ${
                    selectedMood === mood.id
                      ? 'text-white border-transparent'
                      : 'bg-[var(--surface)] text-[var(--text)] border-[var(--border)]'
                  }`}
                  style={selectedMood === mood.id ? { background: mood.color } : {}}>
                  {mood.emoji} {mood.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card */}
      <div className="flex-1 flex justify-center items-center py-3 perspective-[1000px] min-h-0">
        <div className="relative w-full max-w-sm">
          {/* Confetti overlay */}
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

          {/* Card flip container */}
          <div
            className="w-full cursor-pointer"
            style={{ perspective: 1000 }}
            onClick={() => !currentCommand && drawCard()}
          >
            <div
              className="w-full relative"
              style={{
                transformStyle: 'preserve-3d',
                transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              }}
            >
            {/* Back of card */}
            <div className="w-full min-h-[420px] rounded-3xl p-8 text-center text-white shadow-2xl flex flex-col items-center justify-center"
              style={{
                ...gradientStyle,
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
              }}>
              <span className="text-6xl mb-4">🎲</span>
              <span className="text-sm font-semibold uppercase tracking-widest opacity-80">Tap to Draw</span>
              <p className="text-xs opacity-50 mt-2">or use the button below</p>
            </div>

            {/* Front of card */}
            <div className="w-full min-h-[420px] rounded-3xl p-8 text-center text-white shadow-2xl flex flex-col items-center justify-center absolute inset-0"
              style={{
                ...gradientStyle,
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
              }}>
              <span className="text-4xl mb-2">{currentCatInfo.emoji}</span>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-semibold uppercase tracking-widest opacity-80">{currentCatInfo.name}</span>
                {moodInfo && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/20 font-medium">
                    {moodInfo.emoji} {moodInfo.label}
                  </span>
                )}
              </div>

              <p className="text-lg font-bold leading-relaxed mb-5 px-2">
                {currentCommand}
              </p>

              {/* Action buttons on card */}
              <div className="flex gap-3">
                <button onClick={(e) => { e.stopPropagation(); handleFavorite(); }}
                  className="p-3 rounded-full bg-white/20 hover:bg-white/30 transition active:scale-90">
                  <Heart size={22} fill={isFavorite ? 'white' : 'none'} className="text-white" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); handleShare(); }}
                  className="p-3 rounded-full bg-white/20 hover:bg-white/30 transition active:scale-90">
                  <Share2 size={22} className="text-white" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); handleComplete(); }}
                  className={`p-3 rounded-full transition active:scale-90 ${
                    isCompleted ? 'bg-white/40' : 'bg-white/20 hover:bg-white/30'
                  }`}>
                  <Check size={22} className="text-white" fill={isCompleted ? 'white' : 'none'} />
                </button>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-2">
        <button onClick={drawCard} disabled={isDrawing}
          className="w-full py-4 rounded-2xl bg-[var(--primary)] text-white text-lg font-bold flex items-center justify-center gap-3 shadow-lg shadow-[var(--primary)]/30 active:scale-[0.98] transition disabled:opacity-40 touch-target">
          <Zap size={22} /> {isDrawing ? 'Drawing...' : 'Draw Card'}
        </button>
        <div className="mt-3 flex gap-3">
          <button onClick={handleUndo} disabled={!canUndo || !currentCommand}
            className="flex-1 py-3.5 rounded-xl bg-[var(--surface)] text-[var(--text-sec)] border border-[var(--border)] font-semibold flex items-center justify-center gap-2 text-sm active:scale-95 transition disabled:opacity-30 touch-target">
            <Undo2 size={16} /> Undo
          </button>
          <button onClick={() => setShowTimer(true)}
            className="flex-1 py-3.5 rounded-xl bg-[var(--surface)] text-[var(--text-sec)] border border-[var(--border)] font-semibold flex items-center justify-center gap-2 text-sm active:scale-95 transition touch-target">
            <Clock size={16} /> Timer
          </button>
          <button onClick={handleReset}
            className="flex-1 py-3.5 rounded-xl bg-[var(--surface)] text-[var(--text-sec)] border border-[var(--border)] font-semibold flex items-center justify-center gap-2 text-sm active:scale-95 transition touch-target">
            <RotateCcw size={16} /> Reset
          </button>
        </div>
      </div>

      <Timer open={showTimer} onClose={() => setShowTimer(false)} initialMinutes={timerMinutes} />

      <p className="text-center text-xs mt-4" style={{ color: 'color-mix(in srgb, var(--text-sec) 40%, transparent)' }}>
        A <a href="https://tafhub.com/" target="_blank" rel="noopener noreferrer" className="underline hover:opacity-100 transition opacity-80">TafHub</a> project
      </p>
    </div>
  );
}
