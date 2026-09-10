import type { Category } from '../../types';
import type { Lang } from '../languages';

export type CommandTable = Record<Category, string[]>;

const cache = new Map<Lang, CommandTable>();
const inflight = new Map<Lang, Promise<CommandTable>>();

// Fallback: try to load from built-in TS if fetch fails (offline)
// We keep a lazy import for fallback to avoid eager bundling
async function fetchTable(lang: Lang): Promise<CommandTable> {
  // Try fetch from public/commands/{lang}.json
  try {
    const res = await fetch(`/commands/${lang}.json`, { cache: 'force-cache' });
    if (res.ok) {
      const data = (await res.json()) as CommandTable;
      // Basic validation
      if (data && data.Romantic && data.Playful) return data;
    }
  } catch (_) {
    // ignore, fallback below
  }
  // Fallback to eager TS import (only for en or if fetch fails)
  // This keeps offline working and avoids breaking if public file missing
  try {
    const mod = await import(`./${lang}.ts`);
    return (mod.COMMANDS as CommandTable) ?? (mod.default as CommandTable);
  } catch (_) {
    // Last resort: try en
    if (lang !== 'en') return fetchTable('en');
    throw new Error(`Failed to load commands for ${lang}`);
  }
}

export async function loadCommands(lang: Lang): Promise<CommandTable> {
  const cached = cache.get(lang);
  if (cached) return cached;
  const ongoing = inflight.get(lang);
  if (ongoing) return ongoing;
  const p = fetchTable(lang).then(table => {
    cache.set(lang, table);
    inflight.delete(lang);
    return table;
  }).catch(err => {
    inflight.delete(lang);
    throw err;
  });
  inflight.set(lang, p);
  return p;
}

export function getCachedCommands(lang: Lang): CommandTable | undefined {
  return cache.get(lang);
}

export function isLoaded(lang: Lang): boolean {
  return cache.has(lang);
}

// Preload helper for current language
export function preload(lang: Lang): void {
  // fire and forget, but start loading
  loadCommands(lang).catch(() => {});
}
