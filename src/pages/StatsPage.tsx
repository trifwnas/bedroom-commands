import { Zap, Heart, Award, Calendar, BarChart3 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { CATEGORIES } from '../types';

export default function StatsPage() {
  const statistics = useStore(s => s.statistics);
  const favorites = useStore(s => s.favorites);
  const history = useStore(s => s.history);

  const total = Object.values(statistics.categoryDraws).reduce((a, b) => a + b, 0);

  const mostDrawn = (() => {
    let max = 0, cat = 'Romantic';
    Object.entries(statistics.categoryDraws).forEach(([c, n]) => { if (n > max) { max = n; cat = c; } });
    return { category: cat, count: max };
  })();

  const stats = [
    { icon: Zap, color: '#ff595e', value: statistics.totalDraws, label: 'Cards Drawn' },
    { icon: Heart, color: '#ff6b6b', value: favorites.length, label: 'Favorites' },
    { icon: Award, color: '#6bcb77', value: statistics.completedChallenges, label: 'Challenges' },
    { icon: Calendar, color: '#ffd93d', value: statistics.streak, label: 'Day Streak' },
  ];

  return (
    <div className="flex-1 overflow-auto p-5 pb-24">
      <h1 className="text-2xl font-extrabold text-[var(--text)] mb-5">Your Statistics</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {stats.map(s => (
          <div key={s.label} className="bg-[var(--surface)] rounded-2xl p-4 text-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
              style={{ background: `${s.color}20` }}>
              <s.icon size={22} style={{ color: s.color }} />
            </div>
            <p className="text-2xl font-bold text-[var(--text)]">{s.value}</p>
            <p className="text-xs text-[var(--text-sec)] mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Category breakdown */}
      <div className="bg-[var(--surface)] rounded-2xl p-5 mb-5">
        <h2 className="text-base font-semibold text-[var(--text)] mb-4">Category Breakdown</h2>
        {CATEGORIES.map(cat => {
          const pct = total === 0 ? 0 : Math.round(((statistics.categoryDraws[cat.id] || 0) / total) * 100);
          return (
            <div key={cat.id} className="flex items-center gap-3 mb-3 last:mb-0">
              <span className="text-base w-6">{cat.emoji}</span>
              <span className="text-sm text-[var(--text)] w-20 font-medium">{cat.name}</span>
              <span className="text-xs text-[var(--text-sec)] w-6 text-right">{statistics.categoryDraws[cat.id] || 0}</span>
              <div className="flex-1 h-2 bg-[var(--border)] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: cat.color }} />
              </div>
              <span className="text-xs text-[var(--text-sec)] w-9 text-right">{pct}%</span>
            </div>
          );
        })}
      </div>

      {mostDrawn.count > 0 && (
        <div className="bg-[var(--surface)] rounded-2xl p-5 text-center mb-5">
          <p className="text-xs uppercase tracking-wider text-[var(--text-sec)] mb-2">Most Played Category</p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl">{CATEGORIES.find(c => c.id === mostDrawn.category)?.emoji}</span>
            <span className="text-xl font-bold text-[var(--text)]">{mostDrawn.category}</span>
          </div>
          <p className="text-sm text-[var(--text-sec)] mt-1">{mostDrawn.count} cards drawn</p>
        </div>
      )}

      <div className="bg-[var(--primary)]/10 rounded-2xl p-5 text-center">
        <BarChart3 size={20} className="text-[var(--primary)] mx-auto mb-2" />
        <p className="text-sm italic text-[var(--text)]">
          "{history[0] || 'Start drawing cards to see your activity!'}"
        </p>
        {history.length > 0 && <p className="text-xs text-[var(--text-sec)] mt-2">Latest card</p>}
      </div>
    </div>
  );
}
