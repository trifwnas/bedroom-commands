import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Sparkles } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useI18n } from '../i18n';

const STEP_COLORS = ['#d94059', '#c49000', '#cc3a40', '#2d8a4e', '#2563c0'];
const STEP_EMOJIS = ['💕', '🎲', '🎡', '🏆', '⚙️'];

export function Onboarding() {
  const [step, setStep] = useState(0);
  const setHasSeenOnboarding = useStore(s => s.setHasSeenOnboarding);
  const { t } = useI18n();

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-6"
      role="dialog" aria-modal="true" aria-label={t(`onboarding.${step + 1}.title`)}>
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
              style={{ background: STEP_COLORS[step] }} />
            <div className="relative w-24 h-24 rounded-full flex items-center justify-center mx-auto animate-popIn"
              style={{ background: `${STEP_COLORS[step]}20` }}>
              <span className="text-5xl">{STEP_EMOJIS[step]}</span>
            </div>
          </div>

          <h2 className="text-xl font-bold text-[var(--text)] mb-3">{t(`onboarding.${step + 1}.title`)}</h2>
          <p className="text-sm text-[var(--text-sec)] leading-relaxed mb-6">{t(`onboarding.${step + 1}.desc`)}</p>

          <div className="flex justify-center gap-2.5 mb-8">
            {STEP_COLORS.map((c, i) => (
              <div key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-6' : 'w-1.5'}`}
                style={{ background: i === step ? STEP_COLORS[step] : 'var(--border)' }}
              />
            ))}
          </div>

          <button
            onClick={() => {
              if (step < STEP_COLORS.length - 1) setStep(step + 1);
              else setHasSeenOnboarding(true);
            }}
            className="w-full py-4 rounded-2xl text-white font-bold flex items-center justify-center gap-3 transition active:scale-95"
            style={{ background: STEP_COLORS[step] }}
          >
            {step < STEP_COLORS.length - 1 ? (
              <>{t('onboarding.next')} <ChevronRight size={18} /></>
            ) : (
              <>{t('onboarding.getStarted')} <Sparkles size={18} /></>
            )}
          </button>

          <button onClick={() => setHasSeenOnboarding(true)}
            className="w-full mt-4 py-3 text-sm text-[var(--text-sec)] hover:text-[var(--text)] transition">
            {t('onboarding.skip')}
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}