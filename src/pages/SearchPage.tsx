import { useState, useMemo } from 'react';
import { Search, Heart, Share2, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { COMMANDS, getCommandMood } from '../data/commands';
import type { Category } from '../types';
import { CATEGORIES, CATEGORY_MAP, MOODS } from '../types';
import { shareCommand, triggerHaptic } from '../utils';
import { useToast } from '../components/Toast';

export default function SearchPage() {
  const favorites = useStore(s => s.favorites);
  const addFavorite = useStore(s => s.addFavorite);
  const removeFavorite = useStore(s => s.removeFavorite);
  const completedCommands = useStore(s => s.completedCommands);
  const soundEnabled = useStore(s => s.soundEnabled);
  const { showToast } = useToast();

  const [query, setQuery] = useState('');
  const [filterCat, setFilterCat] = useState<Category | 'All'>('All');

  const allCommands = useMemo(() => {
    const cmds: { text: string; category: Category; mood: string }[] = [];
    (Object.keys(COMMANDS) as Category[]).forEach(cat => {
      COMMANDS[cat].forEach(cmd => cmds.push({ text: cmd, category: cat, mood: getCommandMood(cmd, cat) }));
    });
    return cmds;
  }, []);

  const filtered = useMemo(() => {
    let result = allCommands;
    if (filterCat !== 'All') result = result.filter(c => c.category === filterCat);
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(c => c.text.toLowerCase().includes(q));
    }
    return result;
  }, [allCommands, filterCat, query]);

  const total = allCommands.length;

  return (
    <div className="flex-1 flex flex-col pb-28">
      <div className="px-6 pt-6">
        <h1 className="text-2xl font-extrabold text-[var(--text)] mb-4">Search</h1>
        <div className="flex items-center gap-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3">
          <Search size={18} className="text-[var(--text-sec)] shrink-0" />
          <input type="text" placeholder="Search commands..." value={query} onChange={e => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-[var(--text)] text-base outline-none placeholder:text-[var(--text-sec)]" />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 touch-target flex items-center justify-center">
              <X size={18} className="text-[var(--text-sec)]" />
            </button>
          )}
        </div>
        <p className="text-xs text-[var(--text-sec)] mt-2 px-1">
          {query || filterCat !== 'All'
            ? `${filtered.length} of ${total} commands`
            : `${total} commands total`}
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto px-6 py-3 scrollbar-none">
        {['All', ...CATEGORIES.map(c => c.id)].map(cat => (
          <button key={cat} onClick={() => setFilterCat(cat as any)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold border transition-all active:scale-95 touch-target ${
              filterCat === cat
                ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                : 'bg-[var(--surface)] text-[var(--text)] border-[var(--border)]'
            }`}>
            {cat === 'All' ? '🎲 All' : `${CATEGORY_MAP[cat as Category]?.emoji} ${cat}`}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto px-6 pb-6 scrollbar-thin">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Search size={48} className="text-[var(--text-sec)] mb-4 opacity-40" />
            <p className="text-lg font-semibold text-[var(--text)]">No commands found</p>
            <p className="text-sm text-[var(--text-sec)] mt-1.5">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="space-y-4 pt-1">
            {filtered.map(cmd => {
              const cat = CATEGORY_MAP[cmd.category];
              const isFav = favorites.includes(cmd.text);
              const isDone = completedCommands.includes(cmd.text);
              return (
                <div key={cmd.text} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden flex">
                  {cat && <div className="w-1.5 shrink-0" style={{ background: cat.color }} />}
                  <div className="flex-1 p-5">
                    <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                      {cat && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-white"
                          style={{ background: cat.color }}>
                          {cat.emoji} {cat.name}
                        </span>
                      )}
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--bg)] text-[var(--text-sec)] font-medium">
                        {MOODS.find(m => m.id === cmd.mood)?.emoji} {MOODS.find(m => m.id === cmd.mood)?.label}
                      </span>
                      {isDone && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 font-semibold">Done ✓</span>
                      )}
                    </div>
                    <p className="text-[var(--text)] font-medium leading-relaxed mb-3.5">{cmd.text}</p>
                    <div className="flex justify-end gap-2">
                      <button onClick={() => shareCommand(cmd.text, cmd.category)}
                        className="p-2.5 rounded-xl bg-[var(--bg)] hover:bg-[var(--border)] transition active:scale-90">
                        <Share2 size={16} className="text-[var(--text)]" />
                      </button>
                      <button onClick={() => {
                        isFav ? removeFavorite(cmd.text) : addFavorite(cmd.text);
                        if (soundEnabled) triggerHaptic('light');
                        showToast(isFav ? 'Removed from favorites' : 'Added to favorites', 'success');
                      }}
                        className="p-2.5 rounded-xl bg-[var(--bg)] hover:bg-[var(--border)] transition active:scale-90">
                        <Heart size={16} className={isFav ? 'text-[var(--primary)]' : 'text-[var(--text-sec)]'} fill={isFav ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
