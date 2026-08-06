import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Zap } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useToast } from '../components/Toast';
import type { CategoryInfo } from '../types';
import { CATEGORIES } from '../types';
import { COMMANDS } from '../data/commands';
import { triggerHaptic } from '../utils';

const WHEEL_SIZE = 300;
const CENTER = WHEEL_SIZE / 2;
const RADIUS = CENTER - 2;

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y} Z`;
}

export default function WheelPage() {
  const favorites = useStore(s => s.favorites);
  const addFavorite = useStore(s => s.addFavorite);
  const removeFavorite = useStore(s => s.removeFavorite);
  const addToHistory = useStore(s => s.addToHistory);
  const disabledCategories = useStore(s => s.disabledCategories);
  const soundEnabled = useStore(s => s.soundEnabled);
  const checkAndUnlockAchievements = useStore(s => s.checkAndUnlockAchievements);
  const { showToast } = useToast();

  const [command, setCommand] = useState('');
  const [category, setCategory] = useState<CategoryInfo | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [rotation, setRotation] = useState(0);
  const spinTimerRef = useRef<number | null>(null);

  useEffect(() => () => { if (spinTimerRef.current) clearTimeout(spinTimerRef.current); }, []);

  const enabled = useMemo(
    () => CATEGORIES.filter(c => !disabledCategories.includes(c.id)),
    [disabledCategories]
  );

  const segments = useMemo(() => {
    const count = enabled.length;
    const segAngle = 360 / count;
    return enabled.map((cat, i) => ({
      cat,
      startAngle: i * segAngle,
      endAngle: (i + 1) * segAngle,
      midAngle: i * segAngle + segAngle / 2,
    }));
  }, [enabled]);

  const spin = useCallback(() => {
    if (spinning || enabled.length === 0) return;
    setSpinning(true);
    setShowResult(false);
    if (soundEnabled) triggerHaptic('medium');

    const target = enabled[Math.floor(Math.random() * enabled.length)];
    const seg = segments.find(s => s.cat.id === target.id)!;
    const spins = 5 + Math.floor(Math.random() * 4);
    const targetRot = rotation + spins * 360 + (360 - seg.midAngle);

    setRotation(targetRot);

    if (spinTimerRef.current) clearTimeout(spinTimerRef.current);
    spinTimerRef.current = window.setTimeout(() => {
      const cmds = COMMANDS[target.id] || [];
      const cmd = cmds[Math.floor(Math.random() * cmds.length)];
      setCommand(cmd);
      setCategory(target);
      setShowResult(true);
      addToHistory(cmd);
      checkAndUnlockAchievements();
      if (soundEnabled) triggerHaptic('success');
      setSpinning(false);
      spinTimerRef.current = null;
    }, 4000);
  }, [spinning, enabled, segments, rotation, soundEnabled, addToHistory, checkAndUnlockAchievements]);

  const isFav = command ? favorites.includes(command) : false;

  return (
    <div className="flex-1 flex flex-col px-6 pt-6 pb-28 overflow-auto">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-extrabold text-[var(--text)]">Spin the Wheel</h1>
        <p className="text-sm text-[var(--text-sec)] mt-1">Spin to discover a new adventure!</p>
      </div>

      <div className="flex justify-center items-center py-6 relative">
        <div className="relative" style={{ width: WHEEL_SIZE, height: WHEEL_SIZE }}>
          {/* Fixed pointer at top */}
          <div className="absolute left-1/2 -top-5 z-20 -translate-x-1/2 drop-shadow-md">
            <svg width="28" height="24" viewBox="0 0 28 24">
              <polygon points="14,24 0,0 28,0" fill="var(--text)" />
            </svg>
          </div>

          {/* Rotating wheel */}
          <div
            className="w-full h-full"
            style={{
              transform: `rotate(${rotation}deg)`,
              transformOrigin: 'center',
              transition: spinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
            }}
          >
            <svg
              width={WHEEL_SIZE} height={WHEEL_SIZE}
              viewBox={`0 0 ${WHEEL_SIZE} ${WHEEL_SIZE}`}
              className="rounded-full shadow-2xl"
            >
              {segments.map(({ cat, startAngle, endAngle }) => (
                <g key={cat.id}>
                  <path d={describeArc(CENTER, CENTER, RADIUS, startAngle, endAngle)}
                    fill={cat.color} stroke="white" strokeWidth="2" />
                </g>
              ))}
              <circle cx={CENTER} cy={CENTER} r="30" fill="var(--primary)" stroke="white" strokeWidth="4" />
              <text x={CENTER} y={CENTER + 1} textAnchor="middle" dominantBaseline="central" fontSize="20" fill="white">💕</text>
            </svg>
          </div>

          {/* Labels orbit with the wheel, staying upright */}
          {segments.map(({ cat, midAngle }) => {
            const a = rotation + midAngle;
            const labelR = RADIUS * 0.62;
            return (
              <div key={cat.id} className="absolute pointer-events-none"
                style={{
                  left: CENTER,
                  top: CENTER,
                  transform: `translate(-50%, -50%) rotate(${a}deg) translateY(-${labelR}px)`,
                  transition: spinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
                }}>
                <div className="flex flex-col items-center" style={{ transform: `rotate(-${a}deg)` }}>
                  <span className="text-lg drop-shadow-sm">{cat.emoji}</span>
                  <span className="text-[8px] font-bold text-white drop-shadow-sm leading-tight">{cat.name}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showResult && command && category && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
          <div className="rounded-3xl p-6 text-center text-white shadow-lg" style={{ background: category.color }}>
            <span className="text-3xl">{category.emoji}</span>
            <p className="text-xs font-semibold uppercase tracking-widest opacity-80 mt-2">{category.name}</p>
            <p className="text-lg font-bold mt-3 leading-relaxed">{command}</p>
            <div className="flex justify-center gap-4 mt-5">
              <button
                onClick={() => {
                  isFav ? removeFavorite(command) : addFavorite(command);
                  if (soundEnabled) triggerHaptic('light');
                  showToast(isFav ? 'Removed from favorites' : 'Added to favorites', 'success');
                }}
                className="p-3.5 rounded-full bg-white/20 hover:bg-white/30 transition active:scale-90">
                <Heart size={22} fill={isFav ? 'white' : 'none'} className="text-white" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      <div className="mt-2">
        <button onClick={spin} disabled={spinning}
          className="w-full py-4 rounded-2xl bg-[var(--primary)] text-white text-lg font-bold flex items-center justify-center gap-3 shadow-lg shadow-[var(--primary)]/30 active:scale-95 transition disabled:opacity-40 touch-target">
          <Zap size={22} /> {spinning ? 'Spinning...' : 'Spin!'}
        </button>
      </div>

      {!showResult && !spinning && (
        <p className="text-center text-sm text-[var(--text-sec)] italic mt-6">
          Pick a random category from the wheel
        </p>
      )}
    </div>
  );
}
