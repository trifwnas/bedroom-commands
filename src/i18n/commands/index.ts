import type { Category } from '../../types';
import type { Lang } from '../languages';
import { COMMANDS as ENGLISH } from '../../data/commands';
import { COMMANDS as ES } from './es';
import { COMMANDS as DE } from './de';
import { COMMANDS as DA } from './da';
import { COMMANDS as EL } from './el';
import { COMMANDS as FR } from './fr';
import { COMMANDS as PT } from './pt';
import { COMMANDS as JA } from './ja';
import { COMMANDS as KO } from './ko';
import { COMMANDS as ZH } from './zh';

export type CommandTable = Record<Category, string[]>;

export const COMMAND_TRANSLATIONS: Record<Lang, CommandTable> = {
  en: ENGLISH,
  es: ES,
  de: DE,
  da: DA,
  el: EL,
  fr: FR,
  pt: PT,
  ja: JA,
  ko: KO,
  zh: ZH,
};