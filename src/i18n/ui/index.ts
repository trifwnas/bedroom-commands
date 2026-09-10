import type { Lang } from '../languages';
import { ui as en } from './en';
import { ui as es } from './es';
import { ui as de } from './de';
import { ui as da } from './da';
import { ui as el } from './el';
import { ui as fr } from './fr';
import { ui as pt } from './pt';
import { ui as ja } from './ja';
import { ui as ko } from './ko';
import { ui as zh } from './zh';

export const bundles: Record<Lang, Record<string, string>> = {
  en,
  es,
  de,
  da,
  el,
  fr,
  pt,
  ja,
  ko,
  zh,
};

export type UI = typeof en;
