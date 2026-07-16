import { useCallback } from 'react';
import { Heart, Share2, Trash2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { COMMAND_TO_CATEGORY } from '../data/commands';
import { shareCommand, triggerHaptic } from '../utils';
import { useToast } from '../components/Toast';
import { useConfirm } from '../components/Toast';

export default function FavoritesPage() {
  const favorites = useStore(s => s.favorites);
  const removeFavorite = useStore(s => s.removeFavorite);
  const completedCommands = useStore(s => s.completedCommands);
  const soundEnabled = useStore(s => s.soundEnabled);
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  const handleRemove = useCallback(async (cmd: string) => {
    const ok = await confirm({ title: 'Remove Favorite', message: 'Remove this from your favorites?', danger: true, confirmLabel: 'Remove' });
    if (ok) {
      removeFavorite(cmd);
      if (soundEnabled) triggerHaptic('light');
      showToast('Removed from favorites', 'info');
    }
  }, [removeFavorite, soundEnabled, showToast, confirm]);

  if (favorites.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-10 text-center pb-28">
        <div className="w-20 h-20 rounded-full bg-[var(--primary)]/10 flex items-center justify-center mb-5">
          <Heart size={32} className="text-[var(--primary)]" />
        </div>
        <p className="text-lg font-semibold text-[var(--text)]">No favorites yet</p>
        <p className="text-sm text-[var(--text-sec)] mt-1.5">Tap the heart on any command to save it here</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto px-6 pt-6 pb-28 scrollbar-thin">
      <h1 className="text-2xl font-extrabold text-[var(--text)] mb-1">My Favorites</h1>
      <p className="text-sm text-[var(--text-sec)] mb-5">{favorites.length} saved commands</p>
      <div className="space-y-4">
        {favorites.map(cmd => {
          const cat = COMMAND_TO_CATEGORY.get(cmd);
          const done = completedCommands.includes(cmd);
          return (
            <div key={cmd} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden flex">
              {cat && <div className="w-1.5 shrink-0" style={{ background: cat.color }} />}
              <div className="flex-1 p-5">
                {cat && (
                  <div className="flex items-center gap-2 mb-2.5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-white"
                      style={{ background: cat.color }}>
                      {cat.emoji} {cat.name}
                    </span>
                    {done && (
                      <span className="text-xs px-2 py-1 rounded-lg bg-green-500/10 text-green-600 font-semibold">Done ✓</span>
                    )}
                  </div>
                )}
                <p className="text-[var(--text)] font-medium leading-relaxed mb-3.5">{cmd}</p>
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
