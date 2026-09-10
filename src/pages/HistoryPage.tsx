import { Clock, Trash2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { getCommandCategory } from '../data/commands';
import { CATEGORY_MAP } from '../types';
import { useConfirm } from '../components/Toast';
import { useToast } from '../components/Toast';
import { useI18n } from '../i18n';

export default function HistoryPage() {
  const history = useStore(s => s.history);
  const clearHistory = useStore(s => s.clearHistory);
  const { confirm } = useConfirm();
  const { showToast } = useToast();
  const { t, resolveCommand } = useI18n();

  const handleClear = async () => {
    const ok = await confirm({ title: t('history.confirmTitle'), message: t('history.confirmMsg'), danger: true, confirmLabel: t('history.confirmLabel') });
    if (ok) {
      clearHistory();
      showToast(t('history.toastCleared'), 'info');
    }
  };

  if (history.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-10 text-center pb-28">
        <div className="w-20 h-20 rounded-full bg-[var(--primary)]/10 flex items-center justify-center mb-5">
          <Clock size={32} className="text-[var(--primary)]" />
        </div>
        <p className="text-lg font-semibold text-[var(--text)]">{t('history.empty')}</p>
        <p className="text-sm text-[var(--text-sec)] mt-2">{t('history.emptyHint')}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto px-6 pt-6 pb-28 md:pb-12 scrollbar-thin">
      <h1 className="text-2xl font-extrabold text-[var(--text)] mb-6">{t('history.title')}</h1>
      <div className="flex justify-between items-center mb-5">
        <p className="text-sm text-[var(--text-sec)]">{t('history.items', { count: history.length })}</p>
        <button onClick={handleClear}
          className="flex items-center gap-2 text-sm text-red-500 font-medium hover:text-red-600 transition active:scale-95 touch-target">
          <Trash2 size={14} /> {t('history.clear')}
        </button>
      </div>
      <div className="space-y-4 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
        {history.map((cmd, i) => {
          const catId = getCommandCategory(cmd);
          const cat = catId ? CATEGORY_MAP[catId] : null;
          return (
            <div key={`${cmd}-${i}`} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 shadow-sm flex gap-4">
              {cat && (
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0"
                  style={{ background: cat.color }}>
                  {cat.emoji}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[var(--text)] font-medium leading-relaxed">{resolveCommand(cmd)}</p>
                {cat && <p className="text-xs text-[var(--text-sec)] mt-1">{t(`cat.${cat.id}`)}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}