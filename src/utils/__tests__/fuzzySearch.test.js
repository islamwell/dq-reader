import { describe, it, expect, beforeAll } from 'vitest';
import { buildFuseIndex, fuzzySearchSurahs, expandAliases, highlightMatches, parseJuzQuery } from '../fuzzySearch';
import { getAllSurahsInfo, JUZ_DATA, getJuzStart } from '../../data/quran-data';

describe('fuzzySearch surah matching', () => {
  let surahs;
  let fuseIndex;

  beforeAll(() => {
    surahs = getAllSurahsInfo();
    fuseIndex = buildFuseIndex(surahs);
  });

  it('does NOT match non-surah words like "harf" to any surah', () => {
    const results = fuzzySearchSurahs(fuseIndex, 'harf');
    expect(results).toEqual([]);
    // Specifically ensure Surah 108 (Al-Kawthar) is never matched
    expect(results.some((s) => s.id === 108)).toBe(false);
  });

  it('does NOT match random english words like "car", "apple", "test" to surahs', () => {
    expect(fuzzySearchSurahs(fuseIndex, 'car')).toEqual([]);
    expect(fuzzySearchSurahs(fuseIndex, 'apple')).toEqual([]);
    expect(fuzzySearchSurahs(fuseIndex, 'test')).toEqual([]);
  });

  it('correctly matches real surah typos via fuzzy search with tight threshold', () => {
    const fatihaResults = fuzzySearchSurahs(fuseIndex, 'fatiha');
    expect(fatihaResults.length).toBeGreaterThan(0);
    expect(fatihaResults[0].id).toBe(1);

    const kahffResults = fuzzySearchSurahs(fuseIndex, 'kahff');
    expect(kahffResults.length).toBeGreaterThan(0);
    expect(kahffResults[0].id).toBe(18);

    const maryammResults = fuzzySearchSurahs(fuseIndex, 'maryamm');
    expect(maryammResults.length).toBeGreaterThan(0);
    expect(maryammResults[0].id).toBe(19);

    const baqarhaResults = fuzzySearchSurahs(fuseIndex, 'baqarha');
    expect(baqarhaResults.length).toBeGreaterThan(0);
    expect(baqarhaResults[0].id).toBe(2);
  });

  it('correctly expands aliases for transliteration variants', () => {
    expect(expandAliases('baqra')).toContain('baqarah');
    expect(expandAliases('yaseen')).toContain('ya-sin');
    expect(expandAliases('kausar')).toContain('kawthar');
    expect(expandAliases('iklas')).toContain('ikhlas');
    expect(expandAliases('toor')).toContain('tur');
    expect(expandAliases('rehman')).toContain('rahman');
    expect(expandAliases('tahreem')).toContain('tahrim');
    expect(expandAliases('nooh')).toContain('nuh');
    expect(expandAliases('muzamil')).toContain('muzzammil');
    expect(expandAliases('mudathir')).toContain('muddaththir');
    expect(expandAliases('burooj')).toContain('buruj');
    expect(expandAliases('teen')).toContain('tin');
    expect(expandAliases('feel')).toContain('fil');
    expect(expandAliases('naas')).toContain('nas');
    expect(expandAliases('juma')).toContain('jumuah');
  });

  it('highlights matched tokens properly', () => {
    const segments = highlightMatches('Al-Baqarah', 'baqarah');
    expect(segments.some((s) => s.highlighted)).toBe(true);
  });
});

describe('Juz search query parsing & boundaries (1-30)', () => {
  it('contains all 30 Juz entries in order with valid surah/ayah start coordinates', () => {
    expect(JUZ_DATA).toHaveLength(30);
    expect(getJuzStart(1)).toEqual({ juzNumber: 1, surahNumber: 1, ayahNumber: 1 });
    expect(getJuzStart(4)).toEqual({ juzNumber: 4, surahNumber: 3, ayahNumber: 93 });
    expect(getJuzStart(30)).toEqual({ juzNumber: 30, surahNumber: 78, ayahNumber: 1 });
    expect(getJuzStart(0)).toBeNull();
    expect(getJuzStart(31)).toBeNull();

    for (let i = 1; i <= 30; i += 1) {
      const entry = getJuzStart(i);
      expect(entry).not.toBeNull();
      expect(entry.juzNumber).toBe(i);
      expect(entry.surahNumber).toBeGreaterThanOrEqual(1);
      expect(entry.surahNumber).toBeLessThanOrEqual(114);
      expect(entry.ayahNumber).toBeGreaterThanOrEqual(1);
    }
  });

  it('parses valid Juz 1-30 queries in all common formats', () => {
    expect(parseJuzQuery('juz 4')).toEqual({ juzNumber: 4, isExactJuzQuery: true });
    expect(parseJuzQuery('Juz 04')).toEqual({ juzNumber: 4, isExactJuzQuery: true });
    expect(parseJuzQuery('juz4')).toEqual({ juzNumber: 4, isExactJuzQuery: true });
    expect(parseJuzQuery('juz:4')).toEqual({ juzNumber: 4, isExactJuzQuery: true });
    expect(parseJuzQuery('juz-4')).toEqual({ juzNumber: 4, isExactJuzQuery: true });
    expect(parseJuzQuery('juz #4')).toEqual({ juzNumber: 4, isExactJuzQuery: true });
    expect(parseJuzQuery('juz no 4')).toEqual({ juzNumber: 4, isExactJuzQuery: true });
    expect(parseJuzQuery('juz number 4')).toEqual({ juzNumber: 4, isExactJuzQuery: true });
    expect(parseJuzQuery('juzz 15')).toEqual({ juzNumber: 15, isExactJuzQuery: true });
    expect(parseJuzQuery('para 30')).toEqual({ juzNumber: 30, isExactJuzQuery: true });
    expect(parseJuzQuery('4th juz')).toEqual({ juzNumber: 4, isExactJuzQuery: true });
    expect(parseJuzQuery('جزء ٤')).toEqual({ juzNumber: 4, isExactJuzQuery: true });
  });

  it('identifies bare "juz" query as browse mode and rejects out-of-range numbers', () => {
    expect(parseJuzQuery('juz')).toEqual({ juzNumber: null, isJuzBrowse: true });
    expect(parseJuzQuery('para')).toEqual({ juzNumber: null, isJuzBrowse: true });
    expect(parseJuzQuery('juz 0')).toEqual({ juzNumber: null, isOutOfRangeJuzQuery: true });
    expect(parseJuzQuery('juz 31')).toEqual({ juzNumber: null, isOutOfRangeJuzQuery: true });
    expect(parseJuzQuery('juz 100')).toEqual({ juzNumber: null, isOutOfRangeJuzQuery: true });
    expect(parseJuzQuery('al baqarah')).toBeNull();
  });
});
