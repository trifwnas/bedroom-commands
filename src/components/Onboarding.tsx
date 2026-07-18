import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Sparkles } from 'lucide-react';
import { useStore } from '../store/useStore';

const STEPS = [
  { emoji: '💕', title: 'Welcome to Bedroom Commands', desc: 'A fun couples card game with hundreds of commands across 5 categories', color: '#ff6b6b' },
  { emoji: '🎲', title: 'Draw Cards', desc: 'Tap to draw random commands from Romantic, Playful, Spicy, Adventure, and Relaxing categories', color: '#ffd93d' },
  { emoji: '🎡', title: 'Spin the Wheel', desc: 'Use the wheel to randomly select a category, then get a command from it', color: '#ff595e' },
  { emoji: '🏆', title: 'Daily Challenges', desc: 'Complete daily challenges to build streaks and earn achievements', color: '#6bcb77' },
  { emoji: '⚙️', title: 'Customize', desc: 'Filter by mood, add your own commands, toggle categories, and personalize your experience', color: '#4d96ff' },
];

export function Onboarding() {
  const [step, setStep] = useState(0);
  const setHasSeenOnboarding = useStore(s => s.setHasSeenOnboarding);

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: -20 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="bg-[var(--surface)] rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
        >
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 rounded-full blur-2xl opacity-30"
              style={{ background: STEPS[step].color }} />
            <div className="relative w-24 h-24 rounded-full flex items-center justify-center mx-auto animate-popIn"
              style={{ background: `${STEPS[step].color}20` }}>
              <span className="text-5xl">{STEPS[step].emoji}</span>
            </div>
          </div>

          <h2 className="text-xl font-bold text-[var(--text)] mb-3">{STEPS[step].title}</h2>
          <p className="text-sm text-[var(--text-sec)] leading-relaxed mb-6">{STEPS[step].desc}</p>

          <div className="flex justify-center gap-2.5 mb-8">
            {STEPS.map((s, i) => (
              <div key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-6' : 'w-1.5'}`}
                style={{ background: i === step ? STEPS[step].color : 'var(--border)' }}
              />
            ))}
          </div>

          <button
            onClick={() => {
              if (step < STEPS.length - 1) setStep(step + 1);
              else setHasSeenOnboarding(true);
            }}
            className="w-full py-4 rounded-2xl text-white font-bold flex items-center justify-center gap-3 transition active:scale-95"
            style={{ background: STEPS[step].color }}
          >
            {step < STEPS.length - 1 ? (
              <>Next <ChevronRight size={18} /></>
            ) : (
              <>Get Started <Sparkles size={18} /></>
            )}
          </button>

          <button onClick={() => setHasSeenOnboarding(true)}
            className="w-full mt-4 py-3 text-sm text-[var(--text-sec)] hover:text-[var(--text)] transition">
            Skip
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
