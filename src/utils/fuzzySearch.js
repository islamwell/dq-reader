/**
 * Fuzzy search utilities for Quran app.
 *
 * Provides:
 *  - Common spelling aliases (quran/koran/kuran, surah/sura, etc.)
 *  - Fuse.js index builder for surah names
 *  - Highlight helper to mark matched terms in result text
 */
import Fuse from 'fuse.js';

// ──────────────────────────────────────────────
//  1.  ALIAS MAP
// ──────────────────────────────────────────────
// Map common alternative spellings / transliterations to the canonical
// form used in surahsInfo.  Keys are lowercase.  Values are arrays of
// canonical tokens the alias should expand to.

const ALIAS_MAP = {
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
  tawbah: ['tawbah'],
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
  cave: ['kahf'],
  maryam: ['maryam'],
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
  jumma: ['jumuah', "jumu'ah"],
  munafiqun: ['munafiqun'],
  munafiqoon: ['munafiqun'],
  taghabun: ['taghabun'],
  talaq: ['talaq'],
  divorce: ['talaq'],
  tahrim: ['tahrim'],
  mulk: ['mulk'],
  qalam: ['qalam'],
  pen: ['qalam'],
  haqqah: ['haqqah'],
  maarij: ['maarij', "ma'arij"],
  nuh: ['nuh'],
  noah: ['nuh'],
  jinn: ['jinn'],
  djinn: ['jinn'],
  muzzammil: ['muzzammil'],
  muddaththir: ['muddaththir'],
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
  infitar: ['infitar'],
  mutaffifin: ['mutaffifin'],
  inshiqaq: ['inshiqaq'],
  buruj: ['buruj'],
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
  ikhlaq: ['ikhlas'],
  falaq: ['falaq'],
  daybreak: ['falaq'],
  nas: ['nas'],
  mankind: ['nas'],

  // Common Islamic terms users might search for
  bismillah: ['fatihah'],
  basmala: ['fatihah'],
  ayatul: ['ayah'],
  ayat_ul: ['ayah'],
  kursi: ['baqarah'],
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
//  2.  FUSE INDEX FOR SURAH NAMES
// ──────────────────────────────────────────────

const FUSE_OPTIONS = {
  keys: [
    { name: 'name_simple', weight: 0.4 },
    { name: 'translated_name.name', weight: 0.3 },
    { name: 'name_arabic', weight: 0.15 },
    { name: 'aliases', weight: 0.15 }
  ],
  threshold: 0.4,       // 0 = exact, 1 = anything matches
  distance: 100,
  includeScore: true,
  includeMatches: true,
  minMatchCharLength: 2,
  ignoreLocation: true,
};

/**
 * Build a Fuse index from the surahs array.
 * Each surah gets an extra `aliases` field for common alternative names.
 */
export const buildFuseIndex = (surahs) => {
  if (!surahs || !surahs.length) return null;

  // Build reverse lookup: canonical → surah id
  const aliasToSurah = {};
  for (const [alias, canonicals] of Object.entries(ALIAS_MAP)) {
    for (const canonical of canonicals) {
      if (!aliasToSurah[canonical]) aliasToSurah[canonical] = new Set();
      aliasToSurah[canonical].add(alias);
    }
  }

  const enrichedSurahs = surahs.map((surah) => {
    // Collect all alias strings that map to this surah's name
    const nameTokens = (surah.name_simple || '')
      .toLowerCase()
      .replace(/[^a-z'-]/g, ' ')
      .split(/\s+/)
      .filter(Boolean);
    const translatedTokens = (surah.translated_name?.name || '')
      .toLowerCase()
      .replace(/[^a-z'-]/g, ' ')
      .split(/\s+/)
      .filter(Boolean);

    const allTokens = [...nameTokens, ...translatedTokens];
    const aliasSet = new Set();

    for (const token of allTokens) {
      // Find all aliases whose canonical forms match this token
      for (const [canonical, aliasNames] of Object.entries(aliasToSurah)) {
        const cleanCanonical = canonical.replace(/[^a-z]/g, '');
        const cleanToken = token.replace(/[^a-z]/g, '');
        if (cleanCanonical === cleanToken || cleanToken.includes(cleanCanonical)) {
          for (const aliasName of aliasNames) {
            aliasSet.add(aliasName);
          }
        }
      }
    }

    return {
      ...surah,
      aliases: Array.from(aliasSet).join(' ')
    };
  });

  return new Fuse(enrichedSurahs, FUSE_OPTIONS);
};

/**
 * Search surahs using fuzzy matching.
 * Returns an array of surah objects sorted by relevance.
 */
export const fuzzySearchSurahs = (fuseIndex, query) => {
  if (!fuseIndex || !query) return [];

  const results = fuseIndex.search(query);
  return results.map((result) => ({
    ...result.item,
    fuseScore: result.score,
    fuseMatches: result.matches
  }));
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
