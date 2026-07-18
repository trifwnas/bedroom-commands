import { Zap, Heart, Award, Calendar, BarChart3, Target } from 'lucide-react';
import { useStore } from '../store/useStore';
import { CATEGORIES, MOODS } from '../types';

export default function StatsPage() {
  const statistics = useStore(s => s.statistics);
  const favorites = useStore(s => s.favorites);
  const history = useStore(s => s.history);
  const completedCommands = useStore(s => s.completedCommands);

  const total = Object.values(statistics.categoryDraws).reduce((a, b) => a + b, 0);

  const mostDrawn = (() => {
    let max = 0, cat = 'Romantic';
    Object.entries(statistics.categoryDraws).forEach(([c, n]) => { if (n > max) { max = n; cat = c; } });
    return { category: cat, count: max };
  })();

  const stats = [
    { icon: Zap, color: '#cc3a40', value: statistics.totalDraws, label: 'Cards Drawn' },
    { icon: Heart, color: '#d94059', value: favorites.length, label: 'Favorites' },
    { icon: Award, color: '#2d8a4e', value: statistics.completedChallenges, label: 'Challenges' },
    { icon: Calendar, color: '#c49000', value: statistics.streak, label: 'Day Streak' },
    { icon: Target, color: '#2563c0', value: completedCommands.length, label: 'Completed' },
  ];

  const moodTotal = Object.values(statistics.moodDraws).reduce((a, b) => a + b, 0);

  return (
    <div className="flex-1 overflow-auto px-6 pt-6 pb-28 scrollbar-thin">
      <h1 className="text-2xl font-extrabold text-[var(--text)] mb-6">Your Statistics</h1>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {stats.slice(0, 3).map(s => (
          <div key={s.label} className="bg-[var(--surface)] rounded-2xl p-5 text-center border border-[var(--border)]">
            <div className="w-11 h-11 rounded-full flex items-center justify-center mx-auto mb-3"
              style={{ background: `${s.color}20` }}>
              <s.icon size={20} style={{ color: s.color }} />
            </div>
            <p className="text-xl font-bold text-[var(--text)]">{s.value}</p>
            <p className="text-[10px] text-[var(--text-sec)] mt-1 leading-tight">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 mb-6">
        {stats.slice(3).map(s => (
          <div key={s.label} className="bg-[var(--surface)] rounded-2xl p-5 text-center border border-[var(--border)]">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
              style={{ background: `${s.color}20` }}>
              <s.icon size={22} style={{ color: s.color }} />
            </div>
            <p className="text-2xl font-bold text-[var(--text)]">{s.value}</p>
            <p className="text-xs text-[var(--text-sec)] mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Completion progress */}

      {/* Category breakdown */}
      <div className="bg-[var(--surface)] rounded-2xl p-6 mb-6 border border-[var(--border)]">
        <h2 className="text-base font-semibold text-[var(--text)] mb-4">Category Breakdown</h2>
        {CATEGORIES.map(cat => {
          const pct = total === 0 ? 0 : Math.round(((statistics.categoryDraws[cat.id] || 0) / total) * 100);
          return (
            <div key={cat.id} className="flex items-center gap-3 mb-4 last:mb-0">
              <span className="text-base w-6">{cat.emoji}</span>
              <span className="text-sm text-[var(--text)] w-20 font-medium">{cat.name}</span>
              <span className="text-xs text-[var(--text-sec)] w-6 text-right">{statistics.categoryDraws[cat.id] || 0}</span>
              <div className="flex-1 h-2.5 bg-[var(--border)] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: cat.color }} />
              </div>
              <span className="text-xs text-[var(--text-sec)] w-9 text-right">{pct}%</span>
            </div>
          );
        })}
      </div>

      {/* Mood breakdown */}
      {moodTotal > 0 && (
        <div className="bg-[var(--surface)] rounded-2xl p-6 mb-6 border border-[var(--border)]">
          <h2 className="text-base font-semibold text-[var(--text)] mb-4">Mood Breakdown</h2>
          {MOODS.map(mood => {
            const count = statistics.moodDraws[mood.id] || 0;
            const pct = Math.round((count / moodTotal) * 100);
            return (
              <div key={mood.id} className="flex items-center gap-3 mb-4 last:mb-0">
                <span className="text-base w-6">{mood.emoji}</span>
                <span className="text-sm text-[var(--text)] w-16 font-medium">{mood.label}</span>
                <span className="text-xs text-[var(--text-sec)] w-6 text-right">{count}</span>
                <div className="flex-1 h-2.5 bg-[var(--border)] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: mood.color }} />
                </div>
                <span className="text-xs text-[var(--text-sec)] w-9 text-right">{pct}%</span>
              </div>
            );
          })}
        </div>
      )}

      {mostDrawn.count > 0 && (
        <div className="bg-[var(--surface)] rounded-2xl p-6 text-center mb-6 border border-[var(--border)]">
          <p className="text-xs uppercase tracking-wider text-[var(--text-sec)] mb-3">Most Played Category</p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-2xl">{CATEGORIES.find(c => c.id === mostDrawn.category)?.emoji}</span>
            <span className="text-xl font-bold text-[var(--text)]">{mostDrawn.category}</span>
          </div>
          <p className="text-sm text-[var(--text-sec)] mt-2">{mostDrawn.count} cards drawn</p>
        </div>
      )}

      <div className="bg-[var(--primary)]/10 rounded-2xl p-6 text-center border border-[var(--primary)]/20">
        <BarChart3 size={20} className="text-[var(--primary)] mx-auto mb-3" />
        <p className="text-sm italic text-[var(--text)]">
          "{history[0] || 'Start drawing cards to see your activity!'}"
        </p>
        {history.length > 0 && <p className="text-xs text-[var(--text-sec)] mt-3">Latest card</p>}
      </div>
    </div>
  );
}
