import { useState, useMemo } from 'react';
import { Search, Heart, Share2, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { getCommandMoodAt, cmdId } from '../data/commands';
import type { CommandId } from '../data/commands';
import type { Category } from '../types';
import { CATEGORIES, CATEGORY_MAP, MOODS } from '../types';
import { shareCommand, triggerHaptic } from '../utils';
import { useToast } from '../components/Toast';
import { useI18n } from '../i18n';
import { COMMAND_TRANSLATIONS } from '../i18n/commands';
import { getCachedCommands } from '../i18n/commands/loader';

export default function SearchPage() {
  const favorites = useStore(s => s.favorites);
  const addFavorite = useStore(s => s.addFavorite);
  const removeFavorite = useStore(s => s.removeFavorite);
  const completedCommands = useStore(s => s.completedCommands);
  const soundEnabled = useStore(s => s.soundEnabled);
  const { showToast } = useToast();
  const { t, resolveCommand, lang } = useI18n();

  const [query, setQuery] = useState('');
  const [filterCat, setFilterCat] = useState<Category | 'All'>('All');

  const allCommands = useMemo(() => {
    const table = getCachedCommands(lang) ?? COMMAND_TRANSLATIONS[lang];
    const cmds: { id: CommandId; text: string; category: Category; mood: string }[] = [];
    (Object.keys(table) as Category[]).forEach(cat => {
      table[cat].forEach((text, index) => {
        cmds.push({ id: cmdId(cat, index), text, category: cat, mood: getCommandMoodAt(cat, index) });
      });
    });
    return cmds;
  }, [lang]);

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
    <div className="flex-1 flex flex-col px-6 pt-6 pb-28 md:pb-12 overflow-auto">
      <h1 className="text-2xl font-extrabold text-[var(--text)] mb-6">{t('search.title')}</h1>
      <div className="flex items-center gap-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3.5 mb-4 lg:max-w-2xl">
        <Search size={18} className="text-[var(--text-sec)] shrink-0" />
        <input type="text" placeholder={t('search.placeholder')} value={query} onChange={e => setQuery(e.target.value)}
          aria-label={t('search.placeholder')}
          className="flex-1 bg-transparent text-[var(--text)] text-base outline-none placeholder:text-[var(--text-sec)]" />
        {query && (
          <button onClick={() => setQuery('')} aria-label={t('a11y.clearSearch')} className="p-1.5 touch-target flex items-center justify-center">
            <X size={18} className="text-[var(--text-sec)]" />
          </button>
        )}
      </div>
      <p className="text-xs text-[var(--text-sec)] mb-4">
        {query || filterCat !== 'All'
          ? t('search.of', { count: filtered.length, total })
          : t('search.total', { total })}
      </p>

      <div className="flex gap-3 overflow-x-auto py-3 mb-4 scrollbar-none md:flex-wrap md:overflow-visible">
        {['All', ...CATEGORIES.map(c => c.id)].map(cat => (
          <button key={cat} onClick={() => setFilterCat(cat as any)}
            className={`shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold border transition-all active:scale-95 touch-target ${
              filterCat === cat
                ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                : 'bg-[var(--surface)] text-[var(--text)] border-[var(--border)]'
            }`}>
            {cat === 'All' ? `🎲 ${t('search.all')}` : `${CATEGORY_MAP[cat as Category]?.emoji} ${t(`cat.${cat}`)}`}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto pb-6 scrollbar-thin">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Search size={48} className="text-[var(--text-sec)] mb-4 opacity-40" />
            <p className="text-lg font-semibold text-[var(--text)]">{t('search.none')}</p>
            <p className="text-sm text-[var(--text-sec)] mt-2">{t('search.adjust')}</p>
          </div>
        ) : (
          <div className="space-y-4 pt-1 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4 md:space-y-0">
            {filtered.map(cmd => {
              const cat = CATEGORY_MAP[cmd.category];
              const isFav = favorites.includes(cmd.id);
              const isDone = completedCommands.includes(cmd.id);
              return (
                <div key={cmd.id} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden flex">
                  {cat && <div className="w-1.5 shrink-0" style={{ background: cat.color }} />}
                  <div className="flex-1 p-5">
                    <div className="flex items-center gap-2.5 mb-3 flex-wrap">
                      {cat && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold text-white"
                          style={{ background: cat.color }}>
                          {cat.emoji} {t(`cat.${cat.id}`)}
                        </span>
                      )}
                      <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--bg)] text-[var(--text-sec)] font-medium">
                        {MOODS.find(m => m.id === cmd.mood)?.emoji} {t(`mood.${cmd.mood}`)}
                      </span>
                      {isDone && (
                        <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--success)]/10 text-[var(--success)] font-semibold">{t('search.done')}</span>
                      )}
                    </div>
                    <p className="text-[var(--text)] font-medium leading-relaxed mb-4">{cmd.text}</p>
                    <div className="flex justify-end gap-3">
                      <button onClick={() => shareCommand(cmd.text, t(`cat.${cmd.category}`))}
                        aria-label={t('a11y.share')}
                        className="p-3 rounded-xl bg-[var(--bg)] hover:bg-[var(--border)] transition active:scale-90">
                        <Share2 size={16} className="text-[var(--text)]" />
                      </button>
                      <button onClick={() => {
                        isFav ? removeFavorite(cmd.id) : addFavorite(cmd.id);
                        if (soundEnabled) triggerHaptic('light');
                        showToast(isFav ? t('cards.toastFavRemoved') : t('cards.toastFavAdded'), 'success');
                      }}
                        aria-label={isFav ? t('a11y.removeFavorite') : t('a11y.addFavorite')}
                        className="p-3 rounded-xl bg-[var(--bg)] hover:bg-[var(--border)] transition active:scale-90">
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