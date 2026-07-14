import { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Heart, Zap } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { CategoryInfo } from '../types';
import { CATEGORIES } from '../types';
import { COMMANDS } from '../data/commands';
import { triggerHaptic } from '../utils';

export default function WheelPage() {
  const favorites = useStore(s => s.favorites);
  const addFavorite = useStore(s => s.addFavorite);
  const removeFavorite = useStore(s => s.removeFavorite);
  const addToHistory = useStore(s => s.addToHistory);
  const disabledCategories = useStore(s => s.disabledCategories);
  const soundEnabled = useStore(s => s.soundEnabled);
  const checkAndUnlockAchievements = useStore(s => s.checkAndUnlockAchievements);

  const [command, setCommand] = useState('');
  const [category, setCategory] = useState<CategoryInfo | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [rotation, setRotation] = useState(0);

  const enabled = useMemo(
    () => CATEGORIES.filter(c => !disabledCategories.includes(c.id)),
    [disabledCategories]
  );

  const spin = useCallback(() => {
    if (spinning || enabled.length === 0) return;
    setSpinning(true);
    setShowResult(false);
    if (soundEnabled) triggerHaptic('medium');

    const target = enabled[Math.floor(Math.random() * enabled.length)];
    const segAngle = 360 / 5;
    const idx = enabled.findIndex(c => c.id === target.id);
    const middle = idx * segAngle + segAngle / 2;
    const spins = 5 + Math.random() * 3;
    const targetRot = rotation + spins * 360 + (360 - middle);

    setRotation(targetRot);

    setTimeout(() => {
      const cmds = COMMANDS[target.id] || [];
      const cmd = cmds[Math.floor(Math.random() * cmds.length)];
      setCommand(cmd);
      setCategory(target);
      setShowResult(true);
      addToHistory(cmd);
      checkAndUnlockAchievements();
      if (soundEnabled) triggerHaptic('success');
      setSpinning(false);
    }, 4000);
  }, [spinning, enabled, rotation, soundEnabled, addToHistory, checkAndUnlockAchievements]);

  const isFav = command ? favorites.includes(command) : false;

  return (
    <div className="flex-1 flex flex-col pb-24 overflow-auto">
      <div className="px-5 pt-4 pb-2 text-center">
        <h1 className="text-2xl font-extrabold text-[var(--text)]">Spin the Wheel</h1>
        <p className="text-sm text-[var(--text-sec)] mt-1">Spin to discover a new adventure!</p>
      </div>

      {/* Wheel */}
      <div className="flex justify-center items-center py-6 relative">
        {/* Pointer */}
        <div className="absolute top-4 z-10">
          <div style={{ width: 0, height: 0, borderLeft: '12px solid transparent', borderRight: '12px solid transparent', borderTop: '20px solid #333' }} />
        </div>

        {/* Wheel */}
        <div className="relative" style={{ width: 280, height: 280 }}>
          <div
            className="w-full h-full rounded-full overflow-hidden shadow-2xl relative"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: spinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
            }}
          >
            {enabled.map((cat, i) => {
              const angle = (i * 360) / 5;
              return (
                <div key={cat.id}
                  className="absolute left-1/2 top-0 h-1/2 flex items-center justify-center"
                  style={{
                    width: 140,
                    background: cat.color,
                    transformOrigin: 'bottom center',
                    transform: `rotate(${angle + 36}deg)`,
                    clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                  }}>
                  <div className="flex flex-col items-center -mt-4">
                    <span className="text-xl">{cat.emoji}</span>
                    <span className="text-[9px] font-bold text-white mt-0.5">{cat.name}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-16 h-16 rounded-full bg-[var(--primary)] border-4 border-white shadow-lg flex items-center justify-center">
              <Heart size={24} className="text-white" fill="white" />
            </div>
          </div>
        </div>
      </div>

      {/* Result */}
      {showResult && command && category && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="px-5 mb-4">
          <div className="rounded-2xl p-6 text-center text-white" style={{ background: category.color }}>
            <span className="text-3xl">{category.emoji}</span>
            <p className="text-lg font-bold mt-2 leading-relaxed">{command}</p>
            <button
              onClick={() => { isFav ? removeFavorite(command) : addFavorite(command); if (soundEnabled) triggerHaptic('light'); }}
              className="mt-4 p-3 rounded-full bg-white/20 hover:bg-white/30 transition">
              <Heart size={24} fill={isFav ? 'white' : 'none'} className="text-white" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Spin button */}
      <div className="px-5">
        <button onClick={spin} disabled={spinning}
          className="w-full py-4 rounded-2xl bg-[var(--primary)] text-white text-lg font-bold flex items-center justify-center gap-2.5 shadow-lg shadow-[var(--primary)]/30 active:scale-95 transition disabled:opacity-40">
          <Zap size={22} /> {spinning ? 'Spinning...' : 'Spin!'}
        </button>
      </div>

      {!showResult && !spinning && (
        <p className="text-center text-sm text-[var(--text-sec)] italic mt-4 px-5">
          Tap Spin to pick a random category
        </p>
      )}
    </div>
  );
}
