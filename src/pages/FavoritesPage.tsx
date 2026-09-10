import { useCallback } from 'react';
import { Heart, Share2, Trash2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { getCommandCategory } from '../data/commands';
import { CATEGORY_MAP } from '../types';
import { shareCommand, triggerHaptic } from '../utils';
import { useToast } from '../components/Toast';
import { useConfirm } from '../components/Toast';
import { useI18n } from '../i18n';

export default function FavoritesPage() {
  const favorites = useStore(s => s.favorites);
  const removeFavorite = useStore(s => s.removeFavorite);
  const completedCommands = useStore(s => s.completedCommands);
  const soundEnabled = useStore(s => s.soundEnabled);
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const { t, resolveCommand } = useI18n();

  const handleRemove = useCallback(async (cmd: string) => {
    const ok = await confirm({ title: t('favorites.confirmTitle'), message: t('favorites.confirmMsg'), danger: true, confirmLabel: t('favorites.confirmLabel') });
    if (ok) {
      removeFavorite(cmd);
      if (soundEnabled) triggerHaptic('light');
      showToast(t('favorites.toastRemoved'), 'info');
    }
  }, [removeFavorite, soundEnabled, showToast, confirm, t]);

  if (favorites.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-10 text-center pb-28">
        <div className="w-20 h-20 rounded-full bg-[var(--primary)]/10 flex items-center justify-center mb-5">
          <Heart size={32} className="text-[var(--primary)]" />
        </div>
        <p className="text-lg font-semibold text-[var(--text)]">{t('favorites.empty')}</p>
        <p className="text-sm text-[var(--text-sec)] mt-2">{t('favorites.emptyHint')}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto px-6 pt-6 pb-28 md:pb-12 scrollbar-thin">
      <h1 className="text-2xl font-extrabold text-[var(--text)] mb-6">{t('favorites.title')}</h1>
      <p className="text-sm text-[var(--text-sec)] mb-5">{t('favorites.count', { count: favorites.length })}</p>
      <div className="space-y-4 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
        {favorites.map(cmd => {
          const catId = getCommandCategory(cmd);
          const cat = catId ? CATEGORY_MAP[catId] : null;
          const done = completedCommands.includes(cmd);
          return (
            <div key={cmd} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden flex">
              {cat && <div className="w-1.5 shrink-0" style={{ background: cat.color }} />}
              <div className="flex-1 p-5">
                {cat && (
                  <div className="flex items-center gap-2.5 mb-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold text-white"
                      style={{ background: cat.color }}>
                      {cat.emoji} {t(`cat.${cat.id}`)}
                    </span>
                    {done && (
                      <span className="text-xs px-2.5 py-1 rounded-lg bg-[var(--success)]/10 text-[var(--success)] font-semibold">{t('favorites.done')}</span>
                    )}
                  </div>
                )}
                <p className="text-[var(--text)] font-medium leading-relaxed mb-4">{resolveCommand(cmd)}</p>
                <div className="flex justify-end gap-3">
                  <button onClick={() => shareCommand(resolveCommand(cmd), cat ? t(`cat.${cat.id}`) : t('app.name'))}
                    aria-label={t('a11y.share')}
                    className="p-3 rounded-xl bg-[var(--bg)] hover:bg-[var(--border)] transition active:scale-90">
                    <Share2 size={16} className="text-[var(--text)]" />
                  </button>
                  <button onClick={() => handleRemove(cmd)}
                    aria-label={t('a11y.remove')}
                    className="p-3 rounded-xl bg-[var(--bg)] hover:bg-red-50 transition active:scale-90">
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