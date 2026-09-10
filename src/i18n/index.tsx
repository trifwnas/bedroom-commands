import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { isLang, detectLanguage, type Lang } from './languages';
import { COMMAND_TRANSLATIONS } from './commands';
import { COMMANDS, parseCmdId, isBuiltInId } from '../data/commands';
import type { CommandId } from '../data/commands';
import { bundles } from './ui';
import { loadCommands, getCachedCommands } from './commands/loader';
import type { CommandTable } from './commands/loader';

export interface I18nContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  resolveCommand: (id: CommandId) => string;
  locale: string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, key) => (key in vars ? String(vars[key]) : `{${key}}`));
}

export function translate(lang: Lang, key: string, vars?: Record<string, string | number>): string {
  const bundle = bundles[lang];
  let text = bundle ? bundle[key] : undefined;
  if (text === undefined) text = bundles.en[key];
  if (text === undefined) text = key;
  return interpolate(text, vars);
}

export function resolveForLang(lang: Lang, id: CommandId): string {
  if (!isBuiltInId(id)) return id;
  const p = parseCmdId(id);
  if (!p) return id;
  // Prefer lazy-loaded cache (contains 5000 after fetch), fallback to eager import
  const cached = getCachedCommands(lang);
  const table: CommandTable | undefined = cached ?? COMMAND_TRANSLATIONS[lang];
  return table?.[p.category]?.[p.index] ?? COMMANDS[p.category]?.[p.index] ?? id;
}

export function I18nProvider({ lang, setLang, children }: {
  lang: Lang;
  setLang: (l: Lang) => void;
  children: ReactNode;
}) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    let cancelled = false;
    loadCommands(lang).then(() => {
      if (!cancelled) setTick(v => v + 1);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [lang]);

  const value = useMemo<I18nContextValue>(() => ({
    lang,
    setLang,
    t: (key, vars) => translate(lang, key, vars),
    resolveCommand: (id) => resolveForLang(lang, id),
    locale: lang === 'zh' ? 'zh-CN' : lang === 'pt' ? 'pt-BR' : lang,
  }), [lang, setLang, tick]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    return {
      lang: 'en',
      setLang: () => {},
      t: (k, v) => translate('en', k, v),
      resolveCommand: (id) => resolveForLang('en', id),
      locale: 'en',
    };
  }
  return ctx;
}

export function applyLanguageParam(): Lang {
  if (typeof window !== 'undefined') {
    const q = new URLSearchParams(window.location.search).get('lang');
    if (isLang(q)) return q;
  }
  return detectLanguage();
}