import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { X, Play, Pause, Square, RotateCcw } from 'lucide-react';
import { triggerHaptic } from '../utils';
import { useToast } from './Toast';

interface Props {
  open: boolean;
  onClose: () => void;
  initialMinutes?: number;
}

const PRESETS = [1, 3, 5, 10, 15, 30];

export function Timer({ open, onClose, initialMinutes = 5 }: Props) {
  const [minutes, setMinutes] = useState(initialMinutes);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [customTime, setCustomTime] = useState('');
  const intervalRef = useRef<number | null>(null);
  const { showToast } = useToast();

  const y = useMotionValue(0);
  const sheetOpacity = useTransform(y, [0, 200], [1, 0]);

  useEffect(() => {
    if (open) {
      setMinutes(initialMinutes);
      setSeconds(0);
      setRunning(false);
      setPaused(false);
    }
  }, [open, initialMinutes]);

  useEffect(() => {
    if (running && !paused) {
      intervalRef.current = window.setInterval(() => {
        setSeconds(prev => {
          if (prev === 0) {
            setMinutes(m => {
              if (m === 0) {
                setRunning(false);
                setPaused(false);
                showToast("Time's up!", 'success');
                triggerHaptic('success');
                return 0;
              }
              return m - 1;
            });
            return 59;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    };
  }, [running, paused, showToast]);

  const start = () => { setRunning(true); setPaused(false); triggerHaptic('light'); };
  const pause = () => { setPaused(true); triggerHaptic('light'); };
  const resume = () => { setPaused(false); triggerHaptic('light'); };
  const stop = () => { setRunning(false); setPaused(false); if (intervalRef.current) clearInterval(intervalRef.current); };
  const reset = () => { stop(); setMinutes(initialMinutes); setSeconds(0); triggerHaptic('light'); };

  const progress = ((initialMinutes * 60 - (minutes * 60 + seconds)) / (initialMinutes * 60)) * 100;
  const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const circumference = 2 * Math.PI * 54;

  const handleDragEnd = useCallback((_: unknown, info: { offset: { y: number }; velocity: { y: number } }) => {
    if (info.offset.y > 100 || info.velocity.y > 500) onClose();
  }, [onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            drag="y" dragConstraints={{ top: 0 }} dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="w-full max-w-md bg-[var(--surface)] rounded-t-3xl"
            style={{ y, opacity: sheetOpacity, paddingBottom: 'calc(2.5rem + var(--safe-bottom))' }}
          >
            <div className="p-6">
              <div className="flex justify-center mb-4">
                <div className="w-10 h-1 rounded-full bg-[var(--border)]" />
              </div>

              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-[var(--text)]">Timer</h2>
                <button onClick={onClose} className="p-2.5 rounded-full hover:bg-[var(--border)] touch-target flex items-center justify-center">
                  <X size={24} className="text-[var(--text)]" />
                </button>
              </div>

              {!running ? (
                <div>
                  <p className="text-sm text-[var(--text-sec)] text-center mb-5">Select duration</p>
                  <div className="flex flex-wrap justify-center gap-3 mb-6">
                    {PRESETS.map(v => (
                      <button key={v} onClick={() => { setMinutes(v); setSeconds(0); triggerHaptic('light'); }}
                        className={`px-6 py-3 rounded-full text-sm font-semibold border transition-all active:scale-95 touch-target ${
                          minutes === v
                            ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                            : 'bg-[var(--bg)] text-[var(--text)] border-[var(--border)]'
                        }`}>
                        {v} min
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-3 justify-center">
                    <input type="number" min={1} max={180} placeholder="Custom (min)"
                      value={customTime} onChange={e => setCustomTime(e.target.value)}
                      className="w-32 px-4 py-3.5 rounded-xl bg-[var(--bg)] text-[var(--text)] border border-[var(--border)] text-center text-base" />
                    <button onClick={() => {
                      const v = parseInt(customTime);
                      if (v > 0 && v <= 180) { setMinutes(v); setSeconds(0); setCustomTime(''); triggerHaptic('light'); }
                    }} className="px-6 py-3.5 rounded-xl bg-[var(--primary)] text-white font-semibold active:scale-95 transition">
                      Set
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center py-5">
                  <div className="relative w-48 h-48 mb-8">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="54" fill="none" stroke="var(--border)" strokeWidth="5" />
                      <circle cx="60" cy="60" r="54" fill="none" stroke="var(--primary)" strokeWidth="5"
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference - (progress / 100) * circumference}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-linear" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-bold text-[var(--text)] tabular-nums">{timeStr}</span>
                      <span className="text-sm text-[var(--text-sec)] mt-1">{paused ? 'PAUSED' : 'REMAINING'}</span>
                    </div>
                  </div>
                  <div className="flex gap-5">
                    {paused ? (
                      <button onClick={resume} className="w-16 h-16 rounded-full bg-[var(--primary)] flex items-center justify-center text-white active:scale-90 transition">
                        <Play size={28} fill="currentColor" />
                      </button>
                    ) : (
                      <button onClick={pause} className="w-16 h-16 rounded-full bg-[var(--warning)] flex items-center justify-center text-white active:scale-90 transition">
                        <Pause size={28} fill="currentColor" />
                      </button>
                    )}
                    <button onClick={stop} className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center text-white active:scale-90 transition">
                      <Square size={28} fill="currentColor" />
                    </button>
                  </div>
                </div>
              )}

              {!running ? (
                <button onClick={start} className="w-full mt-6 py-4 rounded-2xl bg-[var(--primary)] text-white text-lg font-bold flex items-center justify-center gap-3 active:scale-95 transition touch-target">
                  <Play size={20} fill="currentColor" /> Start Timer
                </button>
              ) : (
                <button onClick={reset} className="w-full mt-5 py-4 rounded-xl border border-[var(--border)] text-[var(--text)] font-semibold flex items-center justify-center gap-3 active:scale-95 transition touch-target">
                  <RotateCcw size={18} /> Reset
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
