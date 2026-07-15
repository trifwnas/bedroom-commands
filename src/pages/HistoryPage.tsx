import { Clock, Trash2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { COMMAND_TO_CATEGORY } from '../data/commands';

export default function HistoryPage() {
  const history = useStore(s => s.history);
  const clearHistory = useStore(s => s.clearHistory);

  if (history.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-10 text-center pb-24">
        <div className="w-16 h-16 rounded-full bg-[var(--bg)] flex items-center justify-center mb-4">
          <Clock size={28} className="text-[var(--text-sec)]" />
        </div>
        <p className="text-lg font-semibold text-[var(--text)]">No history yet</p>
        <p className="text-sm text-[var(--text-sec)] mt-1">Draw some cards to see your activity here</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-5 pb-24 scrollbar-thin">
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-[var(--text-sec)]">{history.length} items</p>
        <button onClick={() => { if (confirm('Clear all history?')) clearHistory(); }}
          className="flex items-center gap-1.5 text-sm text-red-500 font-medium hover:text-red-600 transition active:scale-95 touch-target">
          <Trash2 size={14} /> Clear
        </button>
      </div>
      <div className="space-y-3">
        {history.map((cmd, i) => {
          const cat = COMMAND_TO_CATEGORY.get(cmd);
          return (
            <div key={`${cmd}-${i}`} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 shadow-sm flex gap-3">
              {cat && (
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0"
                  style={{ background: cat.color }}>
                  {cat.emoji}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[var(--text)] font-medium leading-relaxed truncate">{cmd}</p>
                {cat && <p className="text-xs text-[var(--text-sec)] mt-0.5">{cat.name}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
