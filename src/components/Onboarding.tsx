import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Sparkles } from 'lucide-react';
import { useStore } from '../store/useStore';

const STEPS = [
  { emoji: '💕', title: 'Welcome to Bedroom Commands', desc: 'A fun couples card game with 250+ commands across 5 categories' },
  { emoji: '🎲', title: 'Draw Cards', desc: 'Swipe or tap to draw random commands from Romantic, Playful, Spicy, Adventure, and Relaxing categories' },
  { emoji: '🎡', title: 'Spin the Wheel', desc: 'Use the wheel to randomly select a category, then get a command from it' },
  { emoji: '🏆', title: 'Daily Challenges', desc: 'Complete daily challenges to build streaks and earn achievements' },
  { emoji: '⚙️', title: 'Customize', desc: 'Add your own commands, toggle categories, and personalize your experience' },
];

export function Onboarding() {
  const [step, setStep] = useState(0);
  const setHasSeenOnboarding = useStore(s => s.setHasSeenOnboarding);

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-6">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-[var(--surface)] rounded-3xl p-8 max-w-sm w-full text-center"
      >
        <div className="text-6xl mb-4">{STEPS[step].emoji}</div>
        <h2 className="text-xl font-bold text-[var(--text)] mb-2">{STEPS[step].title}</h2>
        <p className="text-sm text-[var(--text-sec)] leading-relaxed mb-6">{STEPS[step].desc}</p>

        <div className="flex justify-center gap-2 mb-6">
          {STEPS.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === step ? 'bg-[var(--primary)] w-6' : 'bg-[var(--border)]'}`} />
          ))}
        </div>

        <button
          onClick={() => {
            if (step < STEPS.length - 1) setStep(step + 1);
            else setHasSeenOnboarding(true);
          }}
          className="w-full py-3.5 rounded-2xl bg-[var(--primary)] text-white font-bold flex items-center justify-center gap-2"
        >
          {step < STEPS.length - 1 ? (
            <>Next <ChevronRight size={18} /></>
          ) : (
            <>Get Started <Sparkles size={18} /></>
          )}
        </button>

        {step > 0 && (
          <button onClick={() => setHasSeenOnboarding(true)} className="w-full mt-3 py-2 text-sm text-[var(--text-sec)] hover:text-[var(--text)]">
            Skip
          </button>
        )}
      </motion.div>
    </div>
  );
}
