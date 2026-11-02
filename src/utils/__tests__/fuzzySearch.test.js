import { describe, it, expect, beforeAll } from 'vitest';
import { buildFuseIndex, fuzzySearchSurahs, expandAliases, highlightMatches } from '../fuzzySearch';
import { getAllSurahsInfo } from '../../data/quran-data';

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
