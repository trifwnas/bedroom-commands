import { useCallback } from 'react';
import { Heart, Share2, Trash2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { COMMAND_TO_CATEGORY } from '../data/commands';
import { shareCommand, triggerHaptic } from '../utils';

export default function FavoritesPage() {
  const favorites = useStore(s => s.favorites);
  const removeFavorite = useStore(s => s.removeFavorite);
  const soundEnabled = useStore(s => s.soundEnabled);

  const handleRemove = useCallback((cmd: string) => {
    if (confirm('Remove from favorites?')) {
      removeFavorite(cmd);
      if (soundEnabled) triggerHaptic('light');
    }
  }, [removeFavorite, soundEnabled]);

  if (favorites.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-10 text-center pb-24">
        <div className="w-16 h-16 rounded-full bg-[var(--bg)] flex items-center justify-center mb-4">
          <Heart size={28} className="text-[var(--text-sec)]" />
        </div>
        <p className="text-lg font-semibold text-[var(--text)]">No favorites yet</p>
        <p className="text-sm text-[var(--text-sec)] mt-1">Tap the heart icon on any command to save it here</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-5 pb-24 scrollbar-thin">
      <p className="text-sm text-[var(--text-sec)] mb-3">{favorites.length} saved commands</p>
      <div className="space-y-3">
        {favorites.map(cmd => {
          const cat = COMMAND_TO_CATEGORY.get(cmd);
          return (
            <div key={cmd} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden flex">
              {cat && (
                <div className="w-1.5 shrink-0" style={{ background: cat.color }} />
              )}
              <div className="flex-1 p-4">
                {cat && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-white mb-2.5"
                    style={{ background: cat.color }}>
                    {cat.emoji} {cat.name}
                  </span>
                )}
                <p className="text-[var(--text)] font-medium leading-relaxed mb-3">{cmd}</p>
                <div className="flex justify-end gap-2">
                  <button onClick={() => shareCommand(cmd, cat?.name || 'Unknown')}
                    className="p-2.5 rounded-xl bg-[var(--bg)] hover:bg-[var(--border)] transition active:scale-90">
                    <Share2 size={16} className="text-[var(--text)]" />
                  </button>
                  <button onClick={() => handleRemove(cmd)}
                    className="p-2.5 rounded-xl bg-[var(--bg)] hover:bg-red-50 transition active:scale-90">
                    <Trash2 size={16} className="text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
