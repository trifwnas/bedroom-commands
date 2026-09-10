import { useState, useCallback } from 'react';
import { Moon, Sun, Smartphone, Volume2, Download, Upload, Trash2, Plus, X, ChevronRight, Check } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { Category, ThemeMode } from '../types';
import { CATEGORIES } from '../types';
import { triggerHaptic } from '../utils';
import { useToast } from '../components/Toast';
import { useConfirm } from '../components/Toast';
import { useI18n } from '../i18n';
import { LANGUAGES } from '../i18n/languages';

export default function SettingsPage() {
  const customCommands = useStore(s => s.customCommands);
  const addCustomCommand = useStore(s => s.addCustomCommand);
  const removeCustomCommand = useStore(s => s.removeCustomCommand);
  const disabledCategories = useStore(s => s.disabledCategories);
  const toggleCategory = useStore(s => s.toggleCategory);
  const themeMode = useStore(s => s.themeMode);
  const setThemeMode = useStore(s => s.setThemeMode);
  const soundEnabled = useStore(s => s.soundEnabled);
  const setSoundEnabled = useStore(s => s.setSoundEnabled);
  const language = useStore(s => s.language);
  const setLanguage = useStore(s => s.setLanguage);
  const exportData = useStore(s => s.exportData);
  const importData = useStore(s => s.importData);
  const clearAllData = useStore(s => s.clearAllData);
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const { t } = useI18n();

  const [showModal, setShowModal] = useState(false);
  const [modalCat, setModalCat] = useState<Category>('Romantic');
  const [newCmd, setNewCmd] = useState('');

  const handleExport = useCallback(() => {
    const json = JSON.stringify(exportData(), null, 2);
    navigator.clipboard.writeText(json).then(() => {
      showToast(t('settings.toastExported'), 'success');
    }).catch(() => {
      showToast(t('settings.toastExportFail'), 'error');
    });
  }, [exportData, showToast, t]);

  const handleImport = useCallback(async () => {
    const text = prompt(t('settings.import'));
    if (!text) return;
    try {
      if (importData(JSON.parse(text))) {
        showToast(t('settings.toastImported'), 'success');
      } else {
        showToast(t('settings.toastImportInvalid'), 'error');
      }
    } catch {
      showToast(t('settings.toastJsonInvalid'), 'error');
    }
  }, [importData, showToast, t]);

  const handleClearAll = useCallback(async () => {
    const ok = await confirm({
      title: t('settings.confirmClearTitle'),
      message: t('settings.confirmClearMsg'),
      danger: true,
      confirmLabel: t('settings.confirmClearLabel'),
    });
    if (ok) {
      clearAllData();
      triggerHaptic('warning');
      showToast(t('settings.toastCleared'), 'info');
    }
  }, [clearAllData, showToast, confirm, t]);

  const themes: { mode: ThemeMode; icon: typeof Sun; label: string }[] = [
    { mode: 'system', icon: Smartphone, label: t('settings.themeSystem') },
    { mode: 'light', icon: Sun, label: t('settings.themeLight') },
    { mode: 'dark', icon: Moon, label: t('settings.themeDark') },
  ];

  return (
    <div className="flex-1 overflow-auto px-6 pt-6 pb-28 md:pb-12 scrollbar-thin w-full max-w-2xl mx-auto">
      <h1 className="text-2xl font-extrabold text-[var(--text)] mb-6">{t('settings.title')}</h1>

      <Section title={t('lang.section')}>
        <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] overflow-hidden">
          {LANGUAGES.map(lang => {
            const active = language === lang.code;
            return (
              <button key={lang.code} onClick={() => { setLanguage(lang.code); triggerHaptic('light'); }}
                aria-label={`${lang.native}`}
                className={`w-full flex items-center justify-between px-5 py-4 transition border-b border-[var(--border)] last:border-0 active:scale-99 ${active ? 'bg-[var(--primary)]/10' : ''}`}>
                <div className="flex items-center gap-3">
                  <span className="text-lg">{lang.flag}</span>
                  <span className="text-[var(--text)] font-medium">{lang.native}</span>
                  <span className="text-xs text-[var(--text-sec)]">{lang.name}</span>
                </div>
                {active && <Check size={18} className="text-[var(--primary)]" />}
              </button>
            );
          })}
        </div>
      </Section>

      <Section title={t('settings.appearance')}>
        <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] overflow-hidden">
          {themes.map(theme => (
            <button key={theme.mode} onClick={() => { setThemeMode(theme.mode); triggerHaptic('light'); }}
              className={`w-full flex items-center justify-between px-5 py-4 transition active:scale-99 ${
                themeMode === theme.mode ? 'bg-[var(--primary)]/10' : ''
              }`}>
              <div className="flex items-center gap-3">
                <theme.icon size={18} className={themeMode === theme.mode ? 'text-[var(--primary)]' : 'text-[var(--text)]'} />
                <span className="text-[var(--text)] font-medium">{theme.label}</span>
              </div>
              {themeMode === theme.mode && <span className="text-[var(--primary)] font-bold">✓</span>}
            </button>
          ))}
        </div>
      </Section>

      <Section title={t('settings.sound')}>
        <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Volume2 size={18} className="text-[var(--text)]" />
            <span className="text-[var(--text)] font-medium">{t('settings.soundEffects')}</span>
          </div>
          <ToggleSwitch enabled={soundEnabled} label={t('settings.soundEffects')} onToggle={() => { setSoundEnabled(!soundEnabled); if (!soundEnabled) triggerHaptic('light'); }} />
        </div>
      </Section>

      <Section title={t('settings.categories')}>
        <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] overflow-hidden">
          {CATEGORIES.map(cat => {
            const enabled = !disabledCategories.includes(cat.id);
            return (
              <div key={cat.id} className="flex items-center justify-between px-5 py-4 transition border-b border-[var(--border)] last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{cat.emoji}</span>
                  <span className="text-[var(--text)] font-medium">{t(`cat.${cat.id}`)}</span>
                </div>
                <ToggleSwitch enabled={enabled} label={t(`cat.${cat.id}`)} onToggle={() => { toggleCategory(cat.id); triggerHaptic('light'); }} />
              </div>
            );
          })}
        </div>
      </Section>

      <Section title={t('settings.data')}>
        <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] overflow-hidden">
          <DataRow icon={Download} label={t('settings.export')} onClick={handleExport} />
          <DataRow icon={Upload} label={t('settings.import')} onClick={handleImport} />
          <DataRow icon={Trash2} label={t('settings.clearAll')} onClick={handleClearAll} danger />
        </div>
      </Section>

      <Section title={t('settings.custom')}>
        <div className="md:grid md:grid-cols-2 md:gap-x-8">
        {CATEGORIES.map(cat => (
          <div key={cat.id} className="mb-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-lg">{cat.emoji}</span>
                <span className="text-sm font-medium text-[var(--text)]">{t(`cat.${cat.id}`)}</span>
              </div>
              <button onClick={() => { setModalCat(cat.id); setShowModal(true); }}
                aria-label={`${t('settings.add')} ${t(`cat.${cat.id}`)}`}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white transition active:scale-90"
                style={{ background: cat.color }}>
                <Plus size={14} />
              </button>
            </div>
            {customCommands[cat.id]?.length > 0 ? (
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
                {customCommands[cat.id].map((cmd, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] last:border-0">
                    <span className="text-sm text-[var(--text)] flex-1 mr-2 line-clamp-2">{cmd}</span>
                    <button onClick={() => removeCustomCommand(cat.id, cmd)} aria-label={t('a11y.remove')} className="p-1.5 shrink-0 touch-target flex items-center justify-center">
                      <X size={16} className="text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[var(--text-sec)] italic ml-9">{t('settings.noCustom')}</p>
            )}
          </div>
        ))}
        </div>
      </Section>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-6" onClick={() => setShowModal(false)}
          role="dialog" aria-modal="true">
          <div className="bg-[var(--surface)] rounded-2xl p-6 max-w-sm w-full animate-popIn" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-[var(--text)] text-center mb-1">{t('settings.addCustomTitle')}</h3>
            <p className="text-sm text-[var(--text-sec)] text-center mb-5">
              {CATEGORIES.find(c => c.id === modalCat)?.emoji} {t(`cat.${modalCat}`)}
            </p>
            <textarea placeholder={t('settings.enterCommand')} value={newCmd} onChange={e => setNewCmd(e.target.value)}
              aria-label={t('settings.enterCommand')}
              className="w-full px-4 py-3.5 rounded-xl bg-[var(--bg)] text-[var(--text)] border border-[var(--border)] text-base min-h-[80px] resize-none outline-none mb-5" />
            <div className="flex gap-3">
              <button onClick={() => setShowModal(false)}
                className="flex-1 py-4 rounded-xl border border-[var(--border)] text-[var(--text)] font-semibold active:scale-95 transition">
                {t('settings.cancel')}
              </button>
              <button onClick={() => {
                if (newCmd.trim()) {
                  addCustomCommand(modalCat, newCmd.trim());
                  setNewCmd('');
                  setShowModal(false);
                  triggerHaptic('success');
                  showToast(t('settings.toastAdded'), 'success');
                }
              }} className="flex-1 py-4 rounded-xl bg-[var(--primary)] text-white font-semibold active:scale-95 transition">
                {t('settings.add')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ToggleSwitch({ enabled, label, onToggle }: { enabled: boolean; label: string; onToggle: () => void }) {
  return (
    <button onClick={onToggle} role="switch" aria-checked={enabled} aria-label={label}
      className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${enabled ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'}`}>
      <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-200 ${enabled ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
    </button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h3 className="text-xs font-semibold text-[var(--text-sec)] uppercase tracking-wider mb-3 px-1">{title}</h3>
      {children}
    </div>
  );
}

function DataRow({ icon: Icon, label, onClick, danger }: { icon: typeof Download; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button onClick={onClick}
      className={`w-full flex items-center justify-between px-5 py-4 transition border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg)] active:scale-99`}>
      <div className="flex items-center gap-3">
        <Icon size={18} className={danger ? 'text-red-500' : 'text-[var(--text)]'} />
        <span className={`font-medium ${danger ? 'text-red-500' : 'text-[var(--text)]'}`}>{label}</span>
      </div>
      <ChevronRight size={18} className="text-[var(--text-sec)]" />
    </button>
  );
}