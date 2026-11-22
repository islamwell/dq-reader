import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import GrammarWord, { getGrammarSegmentClass } from '../grammar/GrammarWord';
import GrammarBottomSheet from '../grammar/GrammarBottomSheet';
import { MizanCard, IdafaCard } from '../grammar/SarfDetails';
import AyahGrammarText from '../grammar/AyahGrammarText';
import GrammarToggle from '../grammar/GrammarToggle';

const mockContextState = {
  grammarMode: 'colored',
  theme: 'light',
  selectedGrammarWord: null,
  setSelectedGrammarWord: vi.fn(),
  grammarData: {},
  showInterlinear: true,
  setShowInterlinear: vi.fn(),
  emphasisPulsePaused: false,
  setEmphasisPulsePaused: vi.fn(),
  toggleGrammarMode: vi.fn(),
  setGrammarMode: vi.fn()
};

vi.mock('../../contexts/QuranContext', () => ({
  useQuranData: () => mockContextState
}));

const surah100 = JSON.parse(
  fs.readFileSync(path.resolve(process.cwd(), 'public/data/grammar/surah_100.json'), 'utf-8')
);
const versesJson = JSON.parse(
  fs.readFileSync(path.resolve(process.cwd(), 'public/data/quran-verses.json'), 'utf-8')
);

const allWords100 = Object.values(surah100.ayahs)
  .sort((a, b) => a.verse_number - b.verse_number)
  .flatMap((ayah) =>
    ayah.words.map((w) => ({
      ...w,
      ayahNumber: ayah.verse_number,
      ayahStructure: { ar: ayah.structure_ar, en: ayah.structure_en }
    }))
  );

describe('Surah 100 (Al-ʿĀdiyāt) Grammar, Shaded Colors, Conjugation Sub-Modal & Iḍāfa', () => {
  beforeEach(() => {
    mockContextState.grammarMode = 'colored';
    mockContextState.theme = 'light';
    mockContextState.selectedGrammarWord = null;
    mockContextState.setSelectedGrammarWord = vi.fn();
    mockContextState.grammarData = {
      100: surah100
    };
    mockContextState.showInterlinear = true;
    mockContextState.emphasisPulsePaused = false;
  });

  describe('surah_100.json data integrity', () => {
    it('matches all 11 Uthmani verses and 40 words with valid segments, radicals, verbs, and idafa chains', () => {
      expect(surah100.surah_number).toBe(100);
      expect(surah100.version).toBe(3);
      expect(surah100.enhanced).toBe(true);
      expect(surah100.color_palette).toBe('surah_100');
      expect(allWords100).toHaveLength(40);

      const expectedVerses = versesJson['100'].verses;
      expect(expectedVerses).toHaveLength(11);

      for (const expectedVerse of expectedVerses) {
        const ayahData = surah100.ayahs[String(expectedVerse.verse_number)];
        expect(ayahData).toBeDefined();
        const joined = ayahData.words.map((w) => w.text_uthmani).join(' ');
        expect(joined).toBe(expectedVerse.text_uthmani);
      }

      const verbs = allWords100.filter((w) => w.primary_category === 'fil');
      expect(verbs).toHaveLength(5);
      for (const v of verbs) {
        const table = v.sarf?.verb?.conjugation_table;
        expect(table).toBeDefined();
        expect(table.rows.length).toBeGreaterThanOrEqual(9);
        expect(table.passive.length).toBeGreaterThanOrEqual(2);
        expect(table.imperative.length).toBeGreaterThanOrEqual(3);
      }

      const idafaWords = allWords100.filter((w) => w.idafa);
      expect(idafaWords).toHaveLength(5); // لربه، لحب، الخير، ربهم، يومئذ
    });
  });

  describe('Surah 100 Shaded Color System (Red Ism, Green Verb, Royal Blue Harf + Emphasis Pulse)', () => {
    it('returns distinct Red shades for Ism subclasses (singular, plural, pronoun, derived)', () => {
      const singular = getGrammarSegmentClass('ism', 'colored', 'light', { subclass: 'singular' }, 'surah_100');
      const plural = getGrammarSegmentClass('ism', 'colored', 'light', { subclass: 'plural' }, 'surah_100');
      const pronoun = getGrammarSegmentClass('ism', 'colored', 'light', { subclass: 'pronoun' }, 'surah_100');
      const derived = getGrammarSegmentClass('ism', 'colored', 'light', { subclass: 'derived' }, 'surah_100');

      expect(singular).toContain('text-red-700');
      expect(plural).toContain('text-rose-900');
      expect(pronoun).toContain('text-rose-500');
      expect(derived).toContain('text-red-600');
    });

    it('returns distinct Green shades for Verb tenses (past, present, future/imperative)', () => {
      const past = getGrammarSegmentClass('fil', 'colored', 'light', { tense: 'past' }, 'surah_100');
      const present = getGrammarSegmentClass('fil', 'colored', 'light', { tense: 'present' }, 'surah_100');
      const future = getGrammarSegmentClass('fil', 'colored', 'light', { tense: 'future' }, 'surah_100');

      expect(past).toContain('text-emerald-800');
      expect(present).toContain('text-green-600');
      expect(future).toContain('text-teal-600');
    });

    it('returns Royal Blue for Harf and adds slow pulsing class for emphasis harfs', () => {
      const normalHarf = getGrammarSegmentClass('harf', 'colored', 'light', { subclass: 'preposition' }, 'surah_100');
      const emphasisHarf = getGrammarSegmentClass(
        'harf',
        'colored',
        'light',
        { subclass: 'emphasis', emphasis: true },
        'surah_100',
        false
      );
      const pausedEmphasisHarf = getGrammarSegmentClass(
        'harf',
        'colored',
        'light',
        { subclass: 'emphasis', emphasis: true },
        'surah_100',
        true
      );

      expect(normalHarf).toContain('text-blue-700');
      expect(normalHarf).not.toContain('harf-emphasis-pulse');

      expect(emphasisHarf).toContain('text-blue-800');
      expect(emphasisHarf).toContain('harf-emphasis-pulse');
      expect(emphasisHarf).not.toContain('harf-emphasis-paused');

      expect(pausedEmphasisHarf).toContain('harf-emphasis-pulse');
      expect(pausedEmphasisHarf).toContain('harf-emphasis-paused');
    });
  });

  describe('Verb Conjugation Sub-Modal', () => {
    it('opens the conjugation sub-modal from a verb detail page showing she/we/passive/command forms', () => {
      const atharna = { ...surah100.ayahs['4'].words[0], ayahNumber: 4, surahNumber: 100 };

      render(
        <GrammarBottomSheet
          word={atharna}
          theme="light"
          onClose={vi.fn()}
          onNavigateWord={vi.fn()}
          hasPreviousWord={true}
          hasNextWord={true}
        />
      );

      expect(screen.queryByTestId('verb-conjugation-modal')).not.toBeInTheDocument();

      const openModalBtn = screen.getByTestId('open-conjugation-modal');
      fireEvent.click(openModalBtn);

      const modal = screen.getByTestId('verb-conjugation-modal');
      expect(modal).toBeInTheDocument();

      // Verifies active persons (She, We, They [f.] highlighted in ayah)
      expect(screen.getByText('she stirred up')).toBeInTheDocument();
      expect(screen.getByText('we stirred up')).toBeInTheDocument();
      expect(screen.getByTestId('conjugation-ayah-row')).toHaveTextContent('they (f.) stirred up');

      // Verifies Passive voice ("it was stirred up") & Imperative ("Stir up!")
      expect(screen.getByTestId('conjugation-passive-section')).toHaveTextContent('it was stirred up');
      expect(screen.getByTestId('conjugation-imperative-section')).toHaveTextContent('Stir up!');

      // Close sub-modal
      fireEvent.click(screen.getByLabelText('Close verb conjugation sub-modal'));
      expect(screen.queryByTestId('verb-conjugation-modal')).not.toBeInTheDocument();
    });
  });

  describe('Quadriliteral MizanCard (4 radicals: ب ع ث ر)', () => {
    it('renders all 4 radical slots (ف ع ل ل٢) for بُعْثِرَ in Ayah 9', () => {
      const buthira = surah100.ayahs['9'].words[3];
      render(<MizanCard sarf={buthira.sarf} theme="light" cardBg="bg-slate-50 border-slate-200" />);

      expect(screen.getByTestId('mizan-card')).toBeInTheDocument();
      expect(screen.getByText('ل٢')).toBeInTheDocument();
      expect(screen.getByText('4th radical')).toBeInTheDocument();
    });
  });

  describe('Muḍāf / Muḍāf Ilayhi (Iḍāfa) visual badges and IdafaCard', () => {
    it('renders Iḍāfa badges and structure banner summary for لِحُبِّ ٱلْخَيْرِ in Ayah 8', () => {
      render(
        <AyahGrammarText
          words={surah100.ayahs['8'].words}
          surahNumber={100}
          ayahNumber={8}
        />
      );

      const idafaBadges = screen.getAllByTestId('idafa-word-badge');
      expect(idafaBadges).toHaveLength(2);
      expect(idafaBadges[0]).toHaveTextContent(surah100.ayahs['8'].words[1].idafa.label_ar);
      expect(idafaBadges[1]).toHaveTextContent(surah100.ayahs['8'].words[2].idafa.label_ar);

      const idafaBanner = screen.getByTestId('ayah-idafa-banner');
      expect(idafaBanner).toHaveTextContent(`المضاف: ${surah100.ayahs['8'].words[1].idafa.mudaf_ar}`);
      expect(idafaBanner).toHaveTextContent(`المضاف إليه: ${surah100.ayahs['8'].words[1].idafa.mudaf_ilayhi_ar}`);
    });

    it('renders IdafaCard with Muḍāf and Muḍāf Ilayhi breakdown', () => {
      const lihubbi = surah100.ayahs['8'].words[1];
      render(<IdafaCard idafa={lihubbi.idafa} theme="light" cardBg="bg-slate-50 border-slate-200" />);

      const card = screen.getByTestId('idafa-card');
      expect(card).toHaveTextContent('1. Muḍāf (Construct)');
      expect(card).toHaveTextContent('2. Muḍāf Ilayhi (Genitive)');
      expect(card).toHaveTextContent(lihubbi.idafa.mudaf_ar);
      expect(card).toHaveTextContent(lihubbi.idafa.mudaf_ilayhi_ar);
    });

    it('renders Red, Green, Royal Blue dots on GrammarToggle for Surah 100', () => {
      const { container } = render(<GrammarToggle surahNumber={100} />);
      expect(container.querySelector('.bg-red-600')).toBeTruthy();
      expect(container.querySelector('.bg-emerald-600')).toBeTruthy();
      expect(container.querySelector('.bg-blue-600')).toBeTruthy();
    });
  });
});
