export const LANGS = ['en', 'es', 'de', 'da', 'el', 'fr', 'pt', 'ja', 'ko', 'zh'] as const;

export type Lang = (typeof LANGS)[number];

export interface LanguageInfo {
  code: Lang;
  name: string;
  native: string;
  flag: string;
}

export const LANGUAGES: LanguageInfo[] = [
  { code: 'en', name: 'English', native: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Spanish', native: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'German', native: 'Deutsch', flag: '🇩🇪' },
  { code: 'da', name: 'Danish', native: 'Dansk', flag: '🇩🇰' },
  { code: 'el', name: 'Greek', native: 'Ελληνικά', flag: '🇬🇷' },
  { code: 'fr', name: 'French', native: 'Français', flag: '🇫🇷' },
  { code: 'pt', name: 'Portuguese', native: 'Português', flag: '🇧🇷' },
  { code: 'ja', name: 'Japanese', native: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', native: '한국어', flag: '🇰🇷' },
  { code: 'zh', name: 'Chinese', native: '中文', flag: '🇨🇳' },
];

export const isLang = (value: string | null | undefined): value is Lang =>
  !!value && (LANGS as readonly string[]).includes(value);

export function detectLanguage(preferred?: string | null): Lang {
  if (preferred && isLang(preferred)) return preferred;
  if (typeof navigator !== 'undefined') {
    for (const nav of navigator.languages) {
      const code = nav.toLowerCase().replace('_', '-').split('-')[0];
      if (isLang(code)) return code;
    }
  }
  return 'en';
}
