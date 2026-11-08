/**
 * Shared colour helpers for the enhanced sarf (morphology) UI.
 *
 * Note: Tailwind's `dark:` variant follows the OS preference, not the app theme,
 * so every helper here takes the app theme explicitly.
 */

// Themes whose bottom-sheet / card surfaces are dark
const DARK_SURFACE_THEMES = ['green', 'red', 'blue', 'dark'];

export const isDarkSurface = (theme) => DARK_SURFACE_THEMES.includes(theme);

// Category (ism / fi'l / harf) text colours for use on the sheet surface
export const getCategoryTextClass = (category, theme) => {
  const dark = isDarkSurface(theme);
  switch (category) {
    case 'fil':
      return dark ? 'text-amber-300' : 'text-amber-700';
    case 'ism':
      return dark ? 'text-sky-300' : 'text-blue-700';
    case 'harf':
      return dark ? 'text-emerald-300' : 'text-emerald-700';
    default:
      return '';
  }
};

export const CATEGORY_LABELS = {
  fil: {
    ar: 'فعل',
    en: 'Verb',
    dot: 'bg-amber-500',
    bar: 'bg-amber-500',
    lightBadge: 'bg-amber-100 text-amber-900 border-amber-300',
    darkBadge: 'bg-amber-950/70 text-amber-200 border-amber-700'
  },
  ism: {
    ar: 'اسم',
    en: 'Noun',
    dot: 'bg-blue-500',
    bar: 'bg-blue-500',
    lightBadge: 'bg-blue-100 text-blue-900 border-blue-300',
    darkBadge: 'bg-blue-950/70 text-sky-200 border-blue-700'
  },
  harf: {
    ar: 'حرف',
    en: 'Particle',
    dot: 'bg-emerald-500',
    bar: 'bg-emerald-500',
    lightBadge: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    darkBadge: 'bg-emerald-950/70 text-emerald-200 border-emerald-700'
  }
};

export const getCategoryBadgeClass = (category, theme) => {
  const meta = CATEGORY_LABELS[category] || CATEGORY_LABELS.harf;
  return isDarkSurface(theme) ? meta.darkBadge : meta.lightBadge;
};

/**
 * Radical slots of the morphological scale (al-mīzān al-ṣarfī): ف ع ل.
 * Each slot has a distinct colour so a root letter in the word and its slot in
 * the pattern light up in the same colour.
 */
export const RADICALS = {
  f: { slot: 'ف', name_ar: 'فاء الفعل', name_en: '1st radical', light: 'text-rose-700', dark: 'text-rose-300', bg: 'bg-rose-500' },
  a: { slot: 'ع', name_ar: 'عين الفعل', name_en: '2nd radical', light: 'text-violet-700', dark: 'text-violet-300', bg: 'bg-violet-500' },
  l: { slot: 'ل', name_ar: 'لام الفعل', name_en: '3rd radical', light: 'text-cyan-700', dark: 'text-cyan-300', bg: 'bg-cyan-500' }
};

export const RADICAL_ORDER = ['f', 'a', 'l'];

/**
 * Text colour for a letter cluster given its radical label.
 * `label` may be 'f' | 'a' | 'l' | 'al' (merged by idgham) | null (augment letter).
 */
export const getRadicalTextClass = (label, theme) => {
  const dark = isDarkSurface(theme);
  if (!label) {
    return dark ? 'text-slate-400' : 'text-slate-500';
  }
  if (label.length > 1) {
    // Merged radicals (e.g. حقّ): use the first slot's colour; UI adds a hint
    const first = RADICALS[label[0]];
    return first ? (dark ? first.dark : first.light) : '';
  }
  const r = RADICALS[label];
  return r ? (dark ? r.dark : r.light) : '';
};

export const parseQuranRef = (ref) => {
  if (!ref || typeof ref !== 'string') return null;
  const match = ref.trim().match(/^(\d{1,3}):(\d{1,3})$/);
  if (!match) return null;
  const surahNumber = Number(match[1]);
  const ayahNumber = Number(match[2]);
  if (surahNumber < 1 || surahNumber > 114 || ayahNumber < 1) return null;
  return { surahNumber, ayahNumber };
};

export const formatRef = (ref) => (ref ? `(${ref})` : '');
