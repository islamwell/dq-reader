/**
 * Fuzzy search utilities for Quran app.
 *
 * Provides:
 *  - Common spelling aliases (quran/koran/kuran, surah/sura, etc.)
 *  - Fuse.js index builder for surah names
 *  - Highlight helper to mark matched terms in result text
 *  - Transliteration normalizer for smarter fuzzy matching
 *  - Exact phrase search parser for quoted queries
 */
import Fuse from 'fuse.js';

// ──────────────────────────────────────────────
//  0.  QURAN BOOK TERMS
// ──────────────────────────────────────────────
// Terms that refer to the Quran as a book rather than a surah name.
// When the user searches these, skip surah matching and only search
// verse content / translations.
export const QURAN_BOOK_TERMS = new Set([
  'quran', 'koran', 'kuran', 'qoran', 'quoran', 'quraan', 'coran',
  "qur'an", 'quran\'s', 'the quran', 'holy quran',
]);

// ──────────────────────────────────────────────
//  1.  ALIAS MAP
// ──────────────────────────────────────────────
// Map common alternative spellings / transliterations to the canonical
// form used in surahsInfo.  Keys are lowercase.  Values are arrays of
// canonical tokens the alias should expand to.

export const ALIAS_MAP = {
  // Quran itself
  quran: ['quran'],
  koran: ['quran'],
  kuran: ['quran'],
  qoran: ['quran'],
  quoran: ['quran'],
  quraan: ['quran'],
  coran: ['quran'],

  // Generic terms
  surah: ['surah'],
  sura: ['surah'],
  surat: ['surah'],
  soorah: ['surah'],
  ayah: ['ayah'],
  ayat: ['ayah'],
  ayet: ['ayah'],
  verse: ['ayah'],

  // Surah name aliases – common misspellings / transliterations
  fatiha: ['fatihah', 'fatiha'],
  fateha: ['fatihah', 'fatiha'],
  fatihah: ['fatihah'],
  baqara: ['baqarah', 'baqara'],
  baqarah: ['baqarah'],
  baqra: ['baqarah'],
  bakara: ['baqarah', 'baqara'],
  imran: ['imran'],
  nisa: ['nisa'],
  nissa: ['nisa'],
  maidah: ['maidah'],
  maida: ['maidah'],
  anam: ['anam'],
  anaam: ['anam'],
  araf: ['araf'],
  anfal: ['anfal'],
  tawba: ['tawbah'],
  tawbah: ['tawbah', 'repentance'],
  toba: ['tawbah'],
  taubah: ['tawbah'],
  yunus: ['yunus'],
  younus: ['yunus'],
  yusuf: ['yusuf'],
  yousuf: ['yusuf'],
  joseph: ['yusuf'],
  raad: ['raad', "ra'd"],
  ibrahim: ['ibrahim'],
  abraham: ['ibrahim'],
  hijr: ['hijr'],
  nahl: ['nahl'],
  isra: ['isra'],
  israa: ['isra'],
  kahf: ['kahf'],
  kahaf: ['kahf'],
  cave: ['kahf'],
  maryam: ['maryam'],
  mariam: ['maryam'],
  mary: ['maryam'],
  taha: ['taha'],
  anbya: ['anbya'],
  anbiya: ['anbya'],
  hajj: ['hajj'],
  muminun: ['muminun', "mu'minun"],
  muminoon: ['muminun', "mu'minun"],
  nur: ['nur'],
  noor: ['nur'],
  furqan: ['furqan'],
  furqaan: ['furqan'],
  shuara: ['shuara', "shu'ara"],
  naml: ['naml'],
  qasas: ['qasas'],
  ankabut: ['ankabut', "'ankabut"],
  spider: ['ankabut'],
  rum: ['rum'],
  romans: ['rum'],
  luqman: ['luqman'],
  sajdah: ['sajdah'],
  sajda: ['sajdah'],
  ahzab: ['ahzab'],
  saba: ['saba'],
  fatir: ['fatir'],
  yasin: ['ya-sin', 'yasin'],
  yaseen: ['ya-sin', 'yasin'],
  saffat: ['saffat'],
  zumar: ['zumar'],
  ghafir: ['ghafir'],
  fussilat: ['fussilat'],
  shura: ['shuraa', 'shura'],
  shuraa: ['shuraa'],
  zukhruf: ['zukhruf'],
  dukhan: ['dukhan'],
  jathiyah: ['jathiyah'],
  ahqaf: ['ahqaf'],
  muhammad: ['muhammad'],
  fath: ['fath'],
  hujurat: ['hujurat'],
  hujrat: ['hujurat'],
  qaf: ['qaf'],
  dhariyat: ['dhariyat'],
  tur: ['tur'],
  toor: ['tur'],
  najm: ['najm'],
  qamar: ['qamar'],
  moon: ['qamar'],
  rahman: ['rahman'],
  rehman: ['rahman'],
  rahmaan: ['rahman'],
  waqiah: ['waqiah', "waqi'ah"],
  waqia: ['waqiah', "waqi'ah"],
  hadid: ['hadid'],
  iron: ['hadid'],
  mujadila: ['mujadila'],
  hashr: ['hashr'],
  mumtahanah: ['mumtahanah'],
  mumtahina: ['mumtahanah'],
  saf: ['saf'],
  jumuah: ['jumuah', "jumu'ah"],
  juma: ['jumuah', "jumu'ah"],
  jumah: ['jumuah', "jumu'ah"],
  jumma: ['jumuah', "jumu'ah"],
  munafiqun: ['munafiqun'],
  munafiqoon: ['munafiqun'],
  taghabun: ['taghabun'],
  talaq: ['talaq'],
  divorce: ['talaq'],
  tahrim: ['tahrim'],
  tahreem: ['tahrim'],
  mulk: ['mulk'],
  qalam: ['qalam'],
  pen: ['qalam'],
  haqqah: ['haqqah'],
  maarij: ['maarij', "ma'arij"],
  nuh: ['nuh'],
  nooh: ['nuh'],
  noah: ['nuh'],
  jinn: ['jinn'],
  djinn: ['jinn'],
  muzzammil: ['muzzammil'],
  muzammil: ['muzzammil'],
  muzamil: ['muzzammil'],
  muddaththir: ['muddaththir'],
  muddathir: ['muddaththir'],
  mudathir: ['muddaththir'],
  mudassir: ['muddaththir'],
  qiyamah: ['qiyamah'],
  qiyama: ['qiyamah'],
  insan: ['insan'],
  dahr: ['insan'],
  mursalat: ['mursalat'],
  naba: ['naba'],
  naziat: ['naziat', "nazi'at"],
  abasa: ['abasa'],
  takwir: ['takwir'],
  takweer: ['takwir'],
  infitar: ['infitar'],
  mutaffifin: ['mutaffifin'],
  inshiqaq: ['inshiqaq'],
  buruj: ['buruj'],
  burooj: ['buruj'],
  tariq: ['tariq'],
  ala: ['ala', "a'la"],
  aala: ['ala', "a'la"],
  ghashiyah: ['ghashiyah'],
  fajr: ['fajr'],
  dawn: ['fajr'],
  balad: ['balad'],
  shams: ['shams'],
  sun: ['shams'],
  layl: ['layl'],
  night: ['layl'],
  duhaa: ['duhaa'],
  duha: ['duhaa'],
  sharh: ['sharh'],
  inshirah: ['sharh'],
  tin: ['tin'],
  teen: ['tin'],
  fig: ['tin'],
  alaq: ['alaq', "'alaq"],
  clot: ['alaq'],
  qadr: ['qadr'],
  laylat: ['qadr'],
  bayyinah: ['bayyinah'],
  bayyina: ['bayyinah'],
  zalzalah: ['zalzalah'],
  zilzal: ['zalzalah'],
  earthquake: ['zalzalah'],
  adiyat: ['adiyat', "'adiyat"],
  qariah: ['qariah', "qari'ah"],
  takathur: ['takathur'],
  asr: ['asr', "'asr"],
  humazah: ['humazah'],
  fil: ['fil'],
  feel: ['fil'],
  elephant: ['fil'],
  quraysh: ['quraysh'],
  quraish: ['quraysh'],
  maun: ['maun', "ma'un"],
  kawthar: ['kawthar'],
  kausar: ['kawthar'],
  kauthar: ['kawthar'],
  kafirun: ['kafirun'],
  kafiroon: ['kafirun'],
  nasr: ['nasr'],
  masad: ['masad'],
  lahab: ['masad'],
  ikhlas: ['ikhlas'],
  iklas: ['ikhlas'],
  ikhlaq: ['ikhlas'],
  falaq: ['falaq'],
  daybreak: ['falaq'],
  nas: ['nas'],
  naas: ['nas'],
  mankind: ['nas'],

  // Common Islamic terms users might search for
  bismillah: ['fatihah'],
  basmala: ['fatihah'],
  ayatul: ['ayah'],
  ayat_ul: ['ayah'],
  kursi: ['baqarah'],

  // Common Islamic term transliteration variants for translation search
  ramadan: ['ramadan', 'ramadhan'],
  ramadhan: ['ramadan', 'ramadhan'],
  ramazan: ['ramadan', 'ramadhan'],
  salah: ['salah', 'salat', 'prayer'],
  salat: ['salah', 'salat', 'prayer'],
  salaah: ['salah', 'salat'],
  zakah: ['zakah', 'zakat'],
  zakat: ['zakah', 'zakat'],
  zakaat: ['zakah', 'zakat'],
  sadaqah: ['sadaqah', 'sadaqa'],
  sadaqa: ['sadaqah', 'sadaqa'],
  ummah: ['ummah', 'umma'],
  umma: ['ummah', 'umma'],
  jibreel: ['jibreel', 'jibril', 'gabriel'],
  jibril: ['jibreel', 'jibril', 'gabriel'],
  gabriel: ['jibreel', 'jibril', 'gabriel'],
  mikail: ['mikail', 'michael'],
  michael: ['mikail', 'michael'],
  isa: ['isa', 'jesus'],
  jesus: ['isa', 'jesus'],
  musa: ['musa', 'moses'],
  moses: ['musa', 'moses'],
  dawud: ['dawud', 'david'],
  david: ['dawud', 'david'],
  sulaiman: ['sulaiman', 'solomon'],
  solomon: ['sulaiman', 'solomon'],
  iblis: ['iblis', 'satan', 'shaitan'],
  satan: ['iblis', 'satan', 'shaitan'],
  shaitan: ['iblis', 'satan', 'shaitan'],
  shaytan: ['iblis', 'satan', 'shaitan'],
  jannah: ['jannah', 'paradise', 'garden'],
  paradise: ['jannah', 'paradise', 'garden'],
  jahannam: ['jahannam', 'hell', 'hellfire'],
  hell: ['jahannam', 'hell', 'hellfire'],
  repentance: ['tawbah', 'repentance'],
  dua: ['dua', 'supplication'],
  supplication: ['dua', 'supplication'],
  hidayah: ['hidayah', 'guidance'],
  hidaya: ['hidayah', 'guidance'],
  khalifah: ['khalifah', 'caliph', 'vicegerent'],
  caliph: ['khalifah', 'caliph'],
};

/**
 * Expand a user query by replacing known aliases with canonical forms.
 * Returns an array of expanded query strings (one per alias expansion).
 */
export const expandAliases = (rawQuery) => {
  if (!rawQuery) return [rawQuery];

  const lower = rawQuery.toLowerCase().trim();
  const tokens = lower.split(/\s+/);
  const expandedSets = [[]]; // start with one empty expansion path

  for (const token of tokens) {
    const cleaned = token.replace(/[^a-z']/g, '');
    const expansions = ALIAS_MAP[cleaned];

    if (expansions && expansions.length) {
      // For each existing path, create copies for each expansion
      const newSets = [];
      for (const path of expandedSets) {
        for (const expansion of expansions) {
          newSets.push([...path, expansion]);
        }
      }
      // also keep original token path
      for (const path of expandedSets) {
        newSets.push([...path, token]);
      }
      expandedSets.length = 0;
      expandedSets.push(...newSets);
    } else {
      for (const path of expandedSets) {
        path.push(token);
      }
    }
  }

  // Deduplicate and return unique expanded queries
  const seen = new Set();
  const results = [];
  for (const path of expandedSets) {
    const joined = path.join(' ');
    if (!seen.has(joined)) {
      seen.add(joined);
      results.push(joined);
    }
  }

  return results;
};

// ──────────────────────────────────────────────
//  1b. TRANSLITERATION NORMALIZER
// ──────────────────────────────────────────────
// Collapses common transliteration variants so that "ramadan" matches
// "ramadhan", "Qur'an" matches "quran", etc.

const TRANSLIT_REPLACEMENTS = [
  [/[''`ʿʾ]/g, ''],        // strip apostrophes and hamza marks
  [/dh/g, 'd'],             // ramadhan → ramadan
  [/th/g, 't'],             // e.g. hadith → hadit
  [/kh/g, 'k'],             // e.g. khalifah → kalifah
  [/gh/g, 'g'],             // e.g. ghaib → gaib
  [/sh/g, 's'],             // e.g. shukr → sukr
  [/ph/g, 'f'],             // e.g. pharaoh → faraoh
  [/aa/g, 'a'],             // e.g. salaat → salat
  [/ee/g, 'i'],             // e.g. ameen → amin
  [/oo/g, 'u'],             // e.g. rasool → rasul
  [/ou/g, 'u'],             // e.g. djoumou'a → djumua
];

/**
 * Normalize transliteration to collapse common spelling variants.
 * This is intentionally lossy – it's used for matching, not display.
 *
 * @param {string} text - The text to normalize
 * @returns {string} Normalized text
 */
export const normalizeTransliteration = (text) => {
  if (!text) return '';
  let normalized = text.toLowerCase().trim();
  for (const [pattern, replacement] of TRANSLIT_REPLACEMENTS) {
    normalized = normalized.replace(pattern, replacement);
  }
  return normalized;
};

// ──────────────────────────────────────────────
//  1c. EXACT PHRASE PARSER
// ──────────────────────────────────────────────

/**
 * Parse a search query to detect exact phrase searches (quoted strings).
 * Returns { exactPhrases: string[], remainingQuery: string }.
 *
 * Examples:
 *   '"our Lord"'           → { exactPhrases: ['our Lord'], remainingQuery: '' }
 *   '"our Lord" mercy'     → { exactPhrases: ['our Lord'], remainingQuery: 'mercy' }
 *   'normal search'        → { exactPhrases: [], remainingQuery: 'normal search' }
 */
export const parseSearchMode = (rawQuery) => {
  if (!rawQuery) return { exactPhrases: [], remainingQuery: '' };

  const exactPhrases = [];
  // Match content between double quotes (straight or curly)
  const quotePattern = /["\u201C\u201D]([^"\u201C\u201D]+)["\u201C\u201D]/g;
  let match;

  while ((match = quotePattern.exec(rawQuery)) !== null) {
    const phrase = match[1].trim();
    if (phrase) {
      exactPhrases.push(phrase);
    }
  }

  // Remove quoted parts to get remaining query
  const remainingQuery = rawQuery
    .replace(quotePattern, '')
    .replace(/\s+/g, ' ')
    .trim();

  return { exactPhrases, remainingQuery };
};

// ──────────────────────────────────────────────
//  2.  FUSE INDEX FOR SURAH NAMES
// ──────────────────────────────────────────────

export function levenshteinDistance(a, b) {
  if (!a || !b) return (a || '').length + (b || '').length;
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

export function stringSimilarity(a, b) {
  if (!a || !b) return 0;
  const s1 = a.toLowerCase().trim();
  const s2 = b.toLowerCase().trim();
  if (s1 === s2) return 1;
  if (s2.startsWith(s1) && s1.length >= 3) {
    return 0.85 + (s1.length / s2.length) * 0.15;
  }
  const dist = levenshteinDistance(s1, s2);
  return 1 - dist / Math.max(s1.length, s2.length);
}

const FUSE_OPTIONS = {
  keys: [
    { name: 'clean_name', weight: 0.5 },
    { name: 'name_simple', weight: 0.3 },
    { name: 'translated_name.name', weight: 0.2 }
  ],
  threshold: 0.35,
  distance: 100,
  includeScore: true,
  includeMatches: true,
  minMatchCharLength: 3,
};

/**
 * Build a Fuse index from the surahs array.
 * Each surah gets a normalized clean_name and candidateNames list for robust matching.
 */
export const buildFuseIndex = (surahs) => {
  if (!surahs || !surahs.length) return null;

  const enrichedSurahs = surahs.map((surah) => {
    const cleanName = (surah.name_simple || '')
      .replace(/^(al|an|at|as|ash|ar|az|ad|adh)-?/i, '')
      .replace(/[^a-zA-Z]/g, '')
      .toLowerCase();

    const candidateNames = [
      cleanName,
      (surah.name_simple || '').toLowerCase(),
      (surah.translated_name?.name || '').toLowerCase()
    ].filter(Boolean);

    return {
      ...surah,
      clean_name: cleanName,
      candidateNames
    };
  });

  return new Fuse(enrichedSurahs, FUSE_OPTIONS);
};

/**
 * Search surahs using fuzzy matching.
 * Returns an array of surah objects verified by true string similarity (prevents false-positiveBitap substring matches).
 */
export const fuzzySearchSurahs = (fuseIndex, query, minSimilarity = 0.65) => {
  if (!fuseIndex || !query) return [];

  const q = query.toLowerCase().trim();
  if (q.length < 3) return [];

  const results = fuseIndex.search(q);
  return results
    .filter((result) => {
      const candidates = result.item.candidateNames || [result.item.clean_name, result.item.name_simple];
      const maxSim = Math.max(...candidates.map((name) => stringSimilarity(q, name)));
      return maxSim >= minSimilarity;
    })
    .map((result) => {
      const candidates = result.item.candidateNames || [result.item.clean_name, result.item.name_simple];
      const maxSim = Math.max(...candidates.map((name) => stringSimilarity(q, name)));
      return {
        ...result.item,
        fuseScore: result.score,
        similarity: maxSim,
        fuseMatches: result.matches
      };
    });
};

// ──────────────────────────────────────────────
//  3.  HIGHLIGHT HELPER
// ──────────────────────────────────────────────

/**
 * Highlight all occurrences of search terms in a text string.
 * Returns an array of { text, highlighted } segments for React rendering.
 *
 * @param {string} text        - The text to search within
 * @param {string} searchQuery - The user's search query
 * @returns {Array<{text: string, highlighted: boolean}>}
 */
export const highlightMatches = (text, searchQuery) => {
  if (!text || !searchQuery) {
    return [{ text: text || '', highlighted: false }];
  }

  const queryLower = searchQuery.toLowerCase().trim();
  if (!queryLower) {
    return [{ text, highlighted: false }];
  }

  // Split query into individual tokens for multi-word highlighting
  const tokens = queryLower
    .split(/\s+/)
    .filter((t) => t.length >= 2)
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

  if (!tokens.length) {
    return [{ text, highlighted: false }];
  }

  // Also add alias expansions for highlighting
  const expandedTokens = new Set(tokens);
  for (const token of tokens) {
    const expansions = ALIAS_MAP[token];
    if (expansions) {
      for (const exp of expansions) {
        expandedTokens.add(exp.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
      }
    }
  }

  const pattern = new RegExp(`(${Array.from(expandedTokens).join('|')})`, 'gi');
  const parts = text.split(pattern);

  return parts.map((part) => ({
    text: part,
    highlighted: expandedTokens.has(part.toLowerCase()) || pattern.test(part)
  }));
};
