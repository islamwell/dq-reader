/**
 * Shared colour helpers for the enhanced sarf (morphology) UI.
 *
 * Note: Tailwind's `dark:` variant follows the OS preference, not the app theme,
 * so every helper here takes the app theme explicitly.
 *
 * Supports two palettes:
 *  - 'default' (v1/v2, used by Surah 32 & Surah 103): Ism=Blue, Fi'l=Amber, Harf=Emerald
 *  - 'surah_100' (v3, used by Surah 100):
 *      * Ism = RED (shades by subclass: singular, plural, pronoun, derived)
 *      * Fi'l = GREEN (shades by tense: past, present, future/imperative)
 *      * Harf = ROYAL BLUE (with slow pulsing effect for emphasis harfs)
 */

// Themes whose bottom-sheet / modal surfaces are dark (green, red, blue are light pastel themes)
const DARK_SURFACE_THEMES = ['dark'];

export const isDarkSurface = (theme) => DARK_SURFACE_THEMES.includes(theme);

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

export const SURAH_100_CATEGORY_LABELS = {
  ism: {
    ar: 'اسم',
    en: 'Noun',
    dot: 'bg-red-600',
    bar: 'bg-red-600',
    lightBadge: 'bg-red-100 text-red-900 border-red-300',
    darkBadge: 'bg-red-950/70 text-red-200 border-red-700'
  },
  fil: {
    ar: 'فعل',
    en: 'Verb',
    dot: 'bg-emerald-600',
    bar: 'bg-emerald-600',
    lightBadge: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    darkBadge: 'bg-emerald-950/70 text-emerald-200 border-emerald-700'
  },
  harf: {
    ar: 'حرف',
    en: 'Particle',
    dot: 'bg-blue-600',
    bar: 'bg-blue-600',
    lightBadge: 'bg-blue-100 text-blue-900 border-blue-300',
    darkBadge: 'bg-blue-950/70 text-blue-200 border-blue-700'
  }
};

export const SURAH_103_CATEGORY_LABELS = {
  ism: {
    ar: 'اسم',
    en: 'Noun',
    dot: 'bg-red-600',
    bar: 'bg-red-600',
    lightBadge: 'bg-red-100 text-red-900 border-red-300',
    darkBadge: 'bg-red-950/75 text-red-200 border-red-700'
  },
  fil: {
    ar: 'فعل',
    en: 'Verb',
    dot: 'bg-emerald-600',
    bar: 'bg-emerald-600',
    lightBadge: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    darkBadge: 'bg-emerald-950/75 text-emerald-200 border-emerald-700'
  },
  harf: {
    ar: 'حرف',
    en: 'Particle',
    dot: 'bg-yellow-500',
    bar: 'bg-yellow-500',
    lightBadge: 'bg-yellow-100 text-yellow-900 border-yellow-400',
    darkBadge: 'bg-yellow-950/75 text-yellow-200 border-yellow-600'
  }
};

export const getCategoryMeta = (category, palette = 'default') => {
  const table =
    palette === 'surah_100'
      ? SURAH_100_CATEGORY_LABELS
      : palette === 'surah_103'
        ? SURAH_103_CATEGORY_LABELS
        : CATEGORY_LABELS;
  return table[category] || table.ism;
};

/**
 * Shaded subclass / tense / emphasis metadata for Surah 100 (v3).
 */
export const SURAH_100_SHADES = {
  ism: {
    singular: {
      labelAr: 'اسم مفرد',
      labelEn: 'Singular Noun',
      lightText: 'text-red-700 font-semibold',
      darkText: 'text-red-300 font-semibold',
      underline: 'border-b-2 border-red-600 pb-0.5',
      bar: 'bg-red-600',
      dot: 'bg-red-600',
      lightPill: 'bg-red-100 text-red-900 border-red-300',
      darkPill: 'bg-red-950/80 text-red-200 border-red-700'
    },
    plural: {
      labelAr: 'اسم جمع',
      labelEn: 'Plural Noun',
      lightText: 'text-rose-900 font-bold',
      darkText: 'text-rose-400 font-bold',
      underline: 'border-b-2 border-rose-800 pb-0.5',
      bar: 'bg-rose-800',
      dot: 'bg-rose-800',
      lightPill: 'bg-rose-100 text-rose-950 border-rose-400',
      darkPill: 'bg-rose-950/80 text-rose-200 border-rose-700'
    },
    pronoun: {
      labelAr: 'ضمير / موصول / إشارة',
      labelEn: 'Pronoun',
      lightText: 'text-rose-500 font-semibold',
      darkText: 'text-rose-200 font-semibold',
      underline: 'border-b-2 border-rose-400 pb-0.5',
      bar: 'bg-rose-400',
      dot: 'bg-rose-400',
      lightPill: 'bg-rose-50 text-rose-800 border-rose-300',
      darkPill: 'bg-rose-900/60 text-rose-200 border-rose-600'
    },
    derived: {
      labelAr: 'مصدر / مشتق / ظرف',
      labelEn: 'Derived / Maṣdar',
      lightText: 'text-red-600 font-semibold',
      darkText: 'text-red-400 font-semibold',
      underline: 'border-b-2 border-red-500 pb-0.5',
      bar: 'bg-red-500',
      dot: 'bg-red-500',
      lightPill: 'bg-red-50 text-red-800 border-red-300',
      darkPill: 'bg-red-950/70 text-red-300 border-red-700'
    }
  },
  fil: {
    past: {
      labelAr: 'فعل ماضٍ',
      labelEn: 'Past (Perfect)',
      lightText: 'text-emerald-800 font-semibold',
      darkText: 'text-emerald-300 font-semibold',
      underline: 'border-b-2 border-emerald-700 pb-0.5',
      bar: 'bg-emerald-700',
      dot: 'bg-emerald-700',
      lightPill: 'bg-emerald-100 text-emerald-950 border-emerald-400',
      darkPill: 'bg-emerald-950/80 text-emerald-200 border-emerald-700'
    },
    present: {
      labelAr: 'فعل مضارع',
      labelEn: 'Present (Imperfect)',
      lightText: 'text-green-600 font-semibold',
      darkText: 'text-green-400 font-semibold',
      underline: 'border-b-2 border-green-500 pb-0.5',
      bar: 'bg-green-500',
      dot: 'bg-green-500',
      lightPill: 'bg-green-100 text-green-900 border-green-400',
      darkPill: 'bg-green-950/80 text-green-200 border-green-700'
    },
    future: {
      labelAr: 'مستقبل / أمر',
      labelEn: 'Future / Command',
      lightText: 'text-teal-600 font-semibold',
      darkText: 'text-teal-300 font-semibold',
      underline: 'border-b-2 border-teal-500 pb-0.5',
      bar: 'bg-teal-500',
      dot: 'bg-teal-500',
      lightPill: 'bg-teal-100 text-teal-900 border-teal-400',
      darkPill: 'bg-teal-950/80 text-teal-200 border-teal-700'
    }
  },
  harf: {
    standard: {
      labelAr: 'حرف',
      labelEn: 'Particle (Harf)',
      lightText: 'text-blue-700 font-semibold',
      darkText: 'text-blue-300 font-semibold',
      underline: 'border-b-2 border-blue-600 pb-0.5',
      bar: 'bg-blue-600',
      dot: 'bg-blue-600',
      lightPill: 'bg-blue-100 text-blue-900 border-blue-300',
      darkPill: 'bg-blue-950/80 text-blue-200 border-blue-700'
    },
    emphasis: {
      labelAr: 'حرف توكيد / قسم',
      labelEn: 'Emphasis Harf',
      lightText: 'text-blue-800 font-bold',
      darkText: 'text-blue-200 font-bold',
      underline: 'border-b-2 border-indigo-600 pb-0.5',
      bar: 'bg-indigo-600',
      dot: 'bg-indigo-600',
      lightPill: 'bg-indigo-100 text-indigo-950 border-indigo-400',
      darkPill: 'bg-indigo-950/85 text-blue-200 border-indigo-500'
    }
  }
};

export const resolveSurah100Shade = (category, item = {}) => {
  if (category === 'ism') {
    const sub = item?.subclass || 'singular';
    return SURAH_100_SHADES.ism[sub] || SURAH_100_SHADES.ism.singular;
  }
  if (category === 'fil') {
    const tense = item?.tense === 'imperative' ? 'future' : (item?.tense || 'past');
    return SURAH_100_SHADES.fil[tense] || SURAH_100_SHADES.fil.past;
  }
  const isEmphasis = Boolean(item?.emphasis || item?.subclass === 'emphasis' || item?.has_emphasis);
  return isEmphasis ? SURAH_100_SHADES.harf.emphasis : SURAH_100_SHADES.harf.standard;
};

// Category (ism / fi'l / harf) text colours for use on the sheet surface
export const getCategoryTextClass = (category, theme, item = null, palette = 'default') => {
  const dark = isDarkSurface(theme);
  const resolvedPalette = item?.color_palette || palette;
  if (resolvedPalette === 'surah_100') {
    const shade = resolveSurah100Shade(category, item || {});
    const pulse =
      category === 'harf' && (item?.emphasis || item?.subclass === 'emphasis')
        ? ' harf-emphasis-pulse'
        : '';
    return `${dark ? shade.darkText : shade.lightText}${pulse}`;
  }

  if (resolvedPalette === 'surah_103') {
    const isEmphasisHarf =
      category === 'harf' && Boolean(item?.emphasis || item?.subclass === 'emphasis');
    if (isEmphasisHarf) {
      return dark ? 'text-white font-bold' : 'text-black font-bold';
    }
    switch (category) {
      case 'fil':
        return dark ? 'text-emerald-400' : 'text-emerald-700';
      case 'ism':
        return dark ? 'text-red-400' : 'text-red-600';
      case 'harf':
        return dark ? 'text-yellow-300' : 'text-yellow-600';
      default:
        return '';
    }
  }

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

export const getCategoryBadgeClass = (category, theme, item = null, palette = 'default') => {
  const resolvedPalette = item?.color_palette || palette;
  if (resolvedPalette === 'surah_100') {
    const shade = resolveSurah100Shade(category, item || {});
    return isDarkSurface(theme) ? shade.darkPill : shade.lightPill;
  }
  if (resolvedPalette === 'surah_103') {
    const meta = SURAH_103_CATEGORY_LABELS[category] || SURAH_103_CATEGORY_LABELS.harf;
    return isDarkSurface(theme) ? meta.darkBadge : meta.lightBadge;
  }
  const meta = CATEGORY_LABELS[category] || CATEGORY_LABELS.harf;
  return isDarkSurface(theme) ? meta.darkBadge : meta.lightBadge;
};

export const getSegmentBarClass = (segment, palette = 'default') => {
  if (palette === 'surah_100') {
    return resolveSurah100Shade(segment?.category, segment).bar;
  }
  if (palette === 'surah_103') {
    return SURAH_103_CATEGORY_LABELS[segment?.category]?.bar || 'bg-slate-300';
  }
  return CATEGORY_LABELS[segment?.category]?.bar || 'bg-slate-300';
};

/**
 * Radical slots of the morphological scale (al-mīzān al-ṣarfī): ف ع ل (and ل٢ for quadriliteral roots).
 * Each slot has a distinct colour so a root letter in the word and its slot in
 * the pattern light up in the same colour.
 */
export const RADICALS = {
  f: { slot: 'ف', name_ar: 'فاء الفعل', name_en: '1st radical', light: 'text-rose-700', dark: 'text-rose-300', bg: 'bg-rose-500' },
  a: { slot: 'ع', name_ar: 'عين الفعل', name_en: '2nd radical', light: 'text-violet-700', dark: 'text-violet-300', bg: 'bg-violet-500' },
  l: { slot: 'ل', name_ar: 'لام الفعل', name_en: '3rd radical', light: 'text-cyan-700', dark: 'text-cyan-300', bg: 'bg-cyan-500' },
  l2: { slot: 'ل٢', name_ar: 'اللام الثانية', name_en: '4th radical', light: 'text-amber-700', dark: 'text-amber-300', bg: 'bg-amber-500' }
};

export const RADICAL_ORDER = ['f', 'a', 'l'];

export const getRadicalOrder = (rootLength = 3) =>
  rootLength === 4 ? ['f', 'a', 'l', 'l2'] : RADICAL_ORDER;

/**
 * Text colour for a letter cluster given its radical label.
 * `label` may be 'f' | 'a' | 'l' | 'l2' | 'al' (merged by idgham) | null (augment letter).
 */
export const getRadicalTextClass = (label, theme) => {
  const dark = isDarkSurface(theme);
  if (!label) {
    return dark ? 'text-slate-400' : 'text-slate-500';
  }
  if (RADICALS[label]) {
    const r = RADICALS[label];
    return dark ? r.dark : r.light;
  }
  if (label.length > 1) {
    // Merged radicals (e.g. حقّ، ربّ، حبّ): use the first slot's colour; UI adds a hint
    const first = RADICALS[label[0]];
    return first ? (dark ? first.dark : first.light) : '';
  }
  return '';
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
