import { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Heart, Share2, Undo2, RotateCcw, Clock } from 'lucide-react';
import { CategorySelector } from '../components/CategorySelector';
import { Timer } from '../components/Timer';
import { useStore } from '../store/useStore';
import type { Category } from '../types';
import { CATEGORIES, CATEGORY_MAP } from '../types';
import { COMMANDS } from '../data/commands';
import { triggerHaptic, shareCommand } from '../utils';

export default function CardsPage() {
  const favorites = useStore(s => s.favorites);
  const addFavorite = useStore(s => s.addFavorite);
  const removeFavorite = useStore(s => s.removeFavorite);
  const addToHistory = useStore(s => s.addToHistory);
  const disabledCategories = useStore(s => s.disabledCategories);
  const soundEnabled = useStore(s => s.soundEnabled);
  const history = useStore(s => s.history);
  const undoLastDraw = useStore(s => s.undoLastDraw);
  const checkAndUnlockAchievements = useStore(s => s.checkAndUnlockAchievements);

  const [selectedCategory, setSelectedCategory] = useState<Category | 'Random'>('Random');
  const [currentCommand, setCurrentCommand] = useState('');
  const [currentCatInfo, setCurrentCatInfo] = useState(CATEGORIES[0]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawnCommands, setDrawnCommands] = useState<string[]>([]);
  const [showTimer, setShowTimer] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState(5);
  const [flash, setFlash] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }, []);

  const isFavorite = currentCommand ? favorites.includes(currentCommand) : false;
  const canUndo = history.length > 0 && drawnCommands.includes(history[0]);

  const drawCard = useCallback(() => {
    if (isDrawing) return;
    setIsDrawing(true);
    setFlash(true);
    if (soundEnabled) triggerHaptic('medium');

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      const cats = disabledCategories.length > 0
        ? CATEGORIES.filter(c => !disabledCategories.includes(c.id))
        : CATEGORIES;
      const cat = selectedCategory === 'Random'
        ? cats[Math.floor(Math.random() * cats.length)]
        : CATEGORY_MAP[selectedCategory] || cats[0];

      const allCmds = COMMANDS[cat.id] || [];
      const remaining = allCmds.filter(c => !drawnCommands.includes(c));
      const cmd = remaining.length > 0
        ? remaining[Math.floor(Math.random() * remaining.length)]
        : 'All commands drawn! Shuffle to reset.';

      setCurrentCommand(cmd);
      setCurrentCatInfo(cat);
      if (cmd !== 'All commands drawn! Shuffle to reset.') {
        setDrawnCommands(prev => [...prev, cmd]);
        addToHistory(cmd);
        checkAndUnlockAchievements();
      }
      if (soundEnabled) triggerHaptic('success');
      setIsDrawing(false);
      setTimeout(() => setFlash(false), 200);
    }, 300);
  }, [selectedCategory, isDrawing, drawnCommands, disabledCategories, soundEnabled, addToHistory, checkAndUnlockAchievements]);

  const handleFavorite = () => {
    if (!currentCommand) return;
    isFavorite ? removeFavorite(currentCommand) : addFavorite(currentCommand);
    if (soundEnabled) triggerHaptic('light');
  };

  const handleShare = () => {
    if (currentCommand) shareCommand(currentCommand, currentCatInfo.name);
  };

  const handleUndo = () => {
    if (canUndo) {
      setDrawnCommands(prev => prev.filter(c => c !== history[0]));
      undoLastDraw();
      setCurrentCommand('');
      if (soundEnabled) triggerHaptic('light');
    }
  };

  const gradientStyle = currentCommand
    ? { background: `linear-gradient(135deg, ${currentCatInfo.gradient[0]}, ${currentCatInfo.gradient[1]})` }
    : { background: 'linear-gradient(135deg, #e0e0e0, #c0c0c0)' };

  return (
    <div className="flex-1 flex flex-col pb-24 overflow-auto">
      <div className="px-5 pt-4 pb-2">
        <h1 className="text-2xl font-extrabold text-[var(--text)]">Bedroom Commands</h1>
        <p className="text-sm text-[var(--text-sec)] mt-1">{drawnCommands.length} cards drawn this session</p>
      </div>

      <CategorySelector selected={selectedCategory} onSelect={setSelectedCategory} />

      {/* Card */}
      <div className="flex justify-center py-8 px-5">
        <motion.div
          key={currentCommand || 'empty'}
          initial={flash ? { scale: 0.85 } : false}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          className="w-full max-w-sm rounded-3xl p-6 text-center text-white shadow-2xl flex flex-col items-center justify-center min-h-[280px]"
          style={gradientStyle}
        >
          <span className="text-4xl mb-1">{currentCatInfo.emoji}</span>
          <span className="text-xs font-semibold uppercase tracking-widest opacity-80 mb-4">{currentCatInfo.name}</span>

          <p className="text-xl font-bold leading-relaxed mb-4">
            {currentCommand || 'Tap to draw a card!'}
          </p>

          {/* Timer presets */}
          {currentCommand && (
            <div className="mb-3">
              <p className="text-xs opacity-60 mb-2">Quick Timer</p>
              <div className="flex gap-2">
                {[1, 3, 5, 10].map(m => (
                  <button key={m} onClick={() => { setTimerMinutes(m); setShowTimer(true); }}
                    className="px-3 py-1.5 rounded-lg bg-white/20 text-white text-sm font-semibold hover:bg-white/30 transition">
                    {m}m
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          {currentCommand && (
            <div className="flex gap-3 mt-2">
              <button onClick={handleFavorite} className="p-2.5 rounded-full bg-white/20 hover:bg-white/30 transition">
                <Heart size={22} fill={isFavorite ? 'white' : 'none'} className="text-white" />
              </button>
              <button onClick={handleShare} className="p-2.5 rounded-full bg-white/20 hover:bg-white/30 transition">
                <Share2 size={22} className="text-white" />
              </button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Buttons */}
      <div className="px-5 space-y-3">
        <button onClick={drawCard} disabled={isDrawing}
          className="w-full py-4 rounded-2xl bg-[var(--primary)] text-white text-lg font-bold flex items-center justify-center gap-2.5 shadow-lg shadow-[var(--primary)]/30 active:scale-95 transition disabled:opacity-40">
          <Zap size={22} /> Draw Card
        </button>
        <div className="flex gap-3">
          <button onClick={() => setShowTimer(true)}
            className="flex-1 py-3 rounded-xl bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] font-semibold flex items-center justify-center gap-2 text-sm active:scale-95 transition">
            <Clock size={16} /> Timer
          </button>
          <button onClick={() => { setDrawnCommands([]); if (soundEnabled) triggerHaptic('light'); }}
            className="flex-1 py-3 rounded-xl bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] font-semibold flex items-center justify-center gap-2 text-sm active:scale-95 transition">
            <RotateCcw size={16} /> Shuffle
          </button>
        </div>
        <div className="flex gap-3">
          <button onClick={handleUndo} disabled={!canUndo}
            className="flex-1 py-3 rounded-xl bg-transparent text-[var(--text-sec)] border border-[var(--border)] font-semibold flex items-center justify-center gap-2 text-sm active:scale-95 transition disabled:opacity-30">
            <Undo2 size={16} /> Undo
          </button>
          <button onClick={() => { setDrawnCommands([]); setCurrentCommand(''); }}
            className="flex-1 py-3 rounded-xl bg-transparent text-[var(--text-sec)] border border-[var(--border)] font-semibold flex items-center justify-center gap-2 text-sm active:scale-95 transition">
            <RotateCcw size={16} /> Reset
          </button>
        </div>
      </div>

      <p className="text-center text-sm text-[var(--text-sec)] italic mt-5 px-5">
        Swipe or tap the card to draw a new command
      </p>

      <Timer open={showTimer} onClose={() => setShowTimer(false)} initialMinutes={timerMinutes} />
    </div>
  );
}
