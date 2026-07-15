import type { Category } from '../types';
import { CATEGORIES } from '../types';
import { useStore } from '../store/useStore';

interface Props {
  selected: Category | 'Random';
  onSelect: (cat: Category | 'Random') => void;
}

export function CategorySelector({ selected, onSelect }: Props) {
  const disabledCategories = useStore(s => s.disabledCategories);

  return (
    <div className="flex gap-2 overflow-x-auto px-5 py-2 scrollbar-none">
      <button
        onClick={() => onSelect('Random')}
        className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all active:scale-95 touch-target ${
          selected === 'Random'
            ? 'bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/30'
            : 'bg-[var(--surface)] text-[var(--text)] border border-[var(--border)]'
        }`}
      >
        🎲 Random
      </button>
      {CATEGORIES.map(cat => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          disabled={disabledCategories.includes(cat.id)}
          className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all active:scale-95 disabled:opacity-30 touch-target ${
            selected === cat.id
              ? 'text-white shadow-lg'
              : 'bg-[var(--surface)] text-[var(--text)] border border-[var(--border)]'
          }`}
          style={selected === cat.id ? { background: cat.color, boxShadow: `0 4px 14px ${cat.color}40` } : {}}
        >
          {cat.emoji} {cat.name}
        </button>
      ))}
    </div>
  );
}
