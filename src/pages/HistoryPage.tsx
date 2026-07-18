import { Clock, Trash2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { COMMAND_TO_CATEGORY } from '../data/commands';
import { useConfirm } from '../components/Toast';
import { useToast } from '../components/Toast';

export default function HistoryPage() {
  const history = useStore(s => s.history);
  const clearHistory = useStore(s => s.clearHistory);
  const { confirm } = useConfirm();
  const { showToast } = useToast();

  const handleClear = async () => {
    const ok = await confirm({ title: 'Clear History', message: 'This will remove all your draw history. This cannot be undone.', danger: true, confirmLabel: 'Clear' });
    if (ok) {
      clearHistory();
      showToast('History cleared', 'info');
    }
  };

  if (history.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-10 text-center pb-28">
        <div className="w-20 h-20 rounded-full bg-[var(--primary)]/10 flex items-center justify-center mb-5">
          <Clock size={32} className="text-[var(--primary)]" />
        </div>
        <p className="text-lg font-semibold text-[var(--text)]">No history yet</p>
        <p className="text-sm text-[var(--text-sec)] mt-2">Draw some cards to see your activity here</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto px-6 pt-6 pb-28 scrollbar-thin">
      <h1 className="text-2xl font-extrabold text-[var(--text)] mb-6">Draw History</h1>
      <div className="flex justify-between items-center mb-5">
        <p className="text-sm text-[var(--text-sec)]">{history.length} items</p>
        <button onClick={handleClear}
          className="flex items-center gap-2 text-sm text-red-500 font-medium hover:text-red-600 transition active:scale-95 touch-target">
          <Trash2 size={14} /> Clear
        </button>
      </div>
      <div className="space-y-4">
        {history.map((cmd, i) => {
          const cat = COMMAND_TO_CATEGORY.get(cmd);
          return (
            <div key={`${cmd}-${i}`} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 shadow-sm flex gap-4">
              {cat && (
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0"
                  style={{ background: cat.color }}>
                  {cat.emoji}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[var(--text)] font-medium leading-relaxed">{cmd}</p>
                {cat && <p className="text-xs text-[var(--text-sec)] mt-1">{cat.name}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
