import { useState, useCallback } from 'react';
import { Moon, Sun, Smartphone, Volume2, Download, Upload, Trash2, Plus, X, ChevronRight } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { Category, ThemeMode } from '../types';
import { CATEGORIES } from '../types';
import { useDarkMode } from '../hooks/useTheme';
import { triggerHaptic } from '../utils';

export default function SettingsPage() {
  const isDark = useDarkMode();
  const customCommands = useStore(s => s.customCommands);
  const addCustomCommand = useStore(s => s.addCustomCommand);
  const removeCustomCommand = useStore(s => s.removeCustomCommand);
  const disabledCategories = useStore(s => s.disabledCategories);
  const toggleCategory = useStore(s => s.toggleCategory);
  const themeMode = useStore(s => s.themeMode);
  const setThemeMode = useStore(s => s.setThemeMode);
  const soundEnabled = useStore(s => s.soundEnabled);
  const setSoundEnabled = useStore(s => s.setSoundEnabled);
  const exportData = useStore(s => s.exportData);
  const importData = useStore(s => s.importData);
  const clearAllData = useStore(s => s.clearAllData);

  const [showModal, setShowModal] = useState(false);
  const [modalCat, setModalCat] = useState<Category>('Romantic');
  const [newCmd, setNewCmd] = useState('');

  const handleExport = useCallback(() => {
    const json = JSON.stringify(exportData(), null, 2);
    navigator.clipboard.writeText(json).then(() => alert('Data copied to clipboard!'));
  }, [exportData]);

  const handleImport = useCallback(() => {
    const text = prompt('Paste your exported data here:');
    if (!text) return;
    try {
      if (importData(JSON.parse(text))) alert('Data imported successfully!');
      else alert('Invalid data format');
    } catch { alert('Invalid JSON'); }
  }, [importData]);

  const themes: { mode: ThemeMode; icon: typeof Sun; label: string }[] = [
    { mode: 'system', icon: Smartphone, label: 'System' },
    { mode: 'light', icon: Sun, label: 'Light' },
    { mode: 'dark', icon: Moon, label: 'Dark' },
  ];

  return (
    <div className="flex-1 overflow-auto p-5 pb-24">
      {/* Theme */}
      <Section title="APPEARANCE">
        <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] overflow-hidden">
          {themes.map(t => (
            <button key={t.mode} onClick={() => { setThemeMode(t.mode); triggerHaptic('light'); }}
              className={`w-full flex items-center justify-between px-4 py-3.5 transition ${
                themeMode === t.mode ? 'bg-[var(--primary)]/10' : ''
              }`}>
              <div className="flex items-center gap-3">
                <t.icon size={18} className={themeMode === t.mode ? 'text-[var(--primary)]' : 'text-[var(--text)]'} />
                <span className="text-[var(--text)] font-medium">{t.label}</span>
              </div>
              {themeMode === t.mode && <span className="text-[var(--primary)] font-bold">✓</span>}
            </button>
          ))}
        </div>
      </Section>

      {/* Sound */}
      <Section title="SOUND & HAPTICS">
        <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Volume2 size={18} className="text-[var(--text)]" />
            <span className="text-[var(--text)] font-medium">Sound Effects</span>
          </div>
          <button onClick={() => { setSoundEnabled(!soundEnabled); if (!soundEnabled) triggerHaptic('light'); }}
            className={`w-12 h-7 rounded-full transition-colors relative ${soundEnabled ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'}`}>
            <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${soundEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>
      </Section>

      {/* Categories */}
      <Section title="CATEGORIES">
        <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] overflow-hidden">
          {CATEGORIES.map(cat => {
            const enabled = !disabledCategories.includes(cat.id);
            return (
              <button key={cat.id} onClick={() => { toggleCategory(cat.id); triggerHaptic('light'); }}
                className={`w-full flex items-center justify-between px-4 py-3.5 transition border-b border-[var(--border)] last:border-0 ${!enabled ? 'opacity-50' : ''}`}>
                <div className="flex items-center gap-3">
                  <span className="text-lg">{cat.emoji}</span>
                  <span className="text-[var(--text)] font-medium">{cat.name}</span>
                </div>
                <button onClick={(e) => { e.stopPropagation(); toggleCategory(cat.id); triggerHaptic('light'); }}
                  className={`w-12 h-7 rounded-full transition-colors relative ${enabled ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'}`}>
                  <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </button>
            );
          })}
        </div>
      </Section>

      {/* Data */}
      <Section title="DATA MANAGEMENT">
        <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] overflow-hidden">
          <DataRow icon={Download} label="Export Data" onClick={handleExport} />
          <DataRow icon={Upload} label="Import Data" onClick={handleImport} />
          <DataRow icon={Trash2} label="Clear All Data" onClick={() => {
            if (confirm('This will delete all your data. This cannot be undone!')) { clearAllData(); triggerHaptic('warning'); }
          }} danger />
        </div>
      </Section>

      {/* Custom commands */}
      <Section title="CUSTOM COMMANDS">
        {CATEGORIES.map(cat => (
          <div key={cat.id} className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{cat.emoji}</span>
                <span className="text-sm font-medium text-[var(--text)]">{cat.name}</span>
              </div>
              <button onClick={() => { setModalCat(cat.id); setShowModal(true); }}
                className="w-7 h-7 rounded-full flex items-center justify-center text-white" style={{ background: cat.color }}>
                <Plus size={14} />
              </button>
            </div>
            {customCommands[cat.id]?.length > 0 ? (
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
                {customCommands[cat.id].map((cmd, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2.5 border-b border-[var(--border)] last:border-0">
                    <span className="text-sm text-[var(--text)] flex-1 mr-2 line-clamp-2">{cmd}</span>
                    <button onClick={() => removeCustomCommand(cat.id, cmd)} className="p-1 shrink-0">
                      <X size={16} className="text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[var(--text-sec)] italic ml-9">No custom commands</p>
            )}
          </div>
        ))}
      </Section>

      {/* Add command modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-6" onClick={() => setShowModal(false)}>
          <div className="bg-[var(--surface)] rounded-2xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-[var(--text)] text-center mb-1">Add Custom Command</h3>
            <p className="text-sm text-[var(--text-sec)] text-center mb-4">
              {CATEGORIES.find(c => c.id === modalCat)?.emoji} {modalCat}
            </p>
            <textarea placeholder="Enter your command..." value={newCmd} onChange={e => setNewCmd(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[var(--bg)] text-[var(--text)] border border-[var(--border)] text-base min-h-[80px] resize-none outline-none mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setShowModal(false)}
                className="flex-1 py-3 rounded-xl border border-[var(--border)] text-[var(--text)] font-semibold">
                Cancel
              </button>
              <button onClick={() => {
                if (newCmd.trim()) { addCustomCommand(modalCat, newCmd.trim()); setNewCmd(''); setShowModal(false); triggerHaptic('success'); }
              }} className="flex-1 py-3 rounded-xl bg-[var(--primary)] text-white font-semibold">
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="text-xs font-semibold text-[var(--text-sec)] uppercase tracking-wider mb-3 px-1">{title}</h3>
      {children}
    </div>
  );
}

function DataRow({ icon: Icon, label, onClick, danger }: { icon: typeof Download; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button onClick={onClick}
      className={`w-full flex items-center justify-between px-4 py-3.5 transition border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg)]`}>
      <div className="flex items-center gap-3">
        <Icon size={18} className={danger ? 'text-red-500' : 'text-[var(--text)]'} />
        <span className={`font-medium ${danger ? 'text-red-500' : 'text-[var(--text)]'}`}>{label}</span>
      </div>
      <ChevronRight size={18} className="text-[var(--text-sec)]" />
    </button>
  );
}
