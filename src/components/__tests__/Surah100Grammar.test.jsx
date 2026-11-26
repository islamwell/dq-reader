import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import GrammarWord, { getGrammarSegmentClass } from '../grammar/GrammarWord';
import GrammarBottomSheet, { buildTraits, getAyahWordClass } from '../grammar/GrammarBottomSheet';
import { RootSummaryCard, IdafaCard } from '../grammar/SarfDetails';
import AyahGrammarText from '../grammar/AyahGrammarText';
import GrammarToggle from '../grammar/GrammarToggle';
import KeyboardShortcutsModal from '../KeyboardShortcutsModal';

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
      ayahStructure: { en: ayah.structure_en }
    }))
  );

describe('Surah 100 (Al-ʿĀdiyāt) Clean Grammar UX, Color Guide in ? Modal, Conjugation & Singulars', () => {
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
    it('matches all 11 Uthmani verses and 40 words with singulars for all plurals, verbs, and idafa chains', () => {
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
        expect(ayahData.structure_ar).toBeUndefined();
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

      const plurals = allWords100.filter((w) => w.subclass === 'plural');
      expect(plurals).toHaveLength(5);
      for (const p of plurals) {
        expect(p.sarf?.noun?.singular_ar).toBeTruthy();
        expect(p.sarf?.noun?.singular_en).toBeTruthy();
      }

      const idafaWords = allWords100.filter((w) => w.idafa);
      expect(idafaWords).toHaveLength(5);
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

  describe('Clean Detail Modal: Part of Speech replacing transliteration, no cluttered top pill, Singular for plurals', () => {
    it('replaces ḍabḥan with Part of Speech (Ism) and removes cluttered top pills', () => {
      const dabhan = { ...surah100.ayahs['1'].words[1], ayahNumber: 1, surahNumber: 100 };

      render(
        <GrammarBottomSheet
          word={dabhan}
          theme="light"
          onClose={vi.fn()}
          onNavigateWord={vi.fn()}
          hasPreviousWord={true}
          hasNextWord={true}
        />
      );

      // Transliteration ḍabḥan is replaced by Part of Speech (Ism)
      expect(screen.queryByText('ḍabḥan')).not.toBeInTheDocument();
      expect(screen.getByTestId('word-pos-label')).toHaveTextContent('Ism');
      expect(screen.getByText('“panting”')).toBeInTheDocument();

      // Cluttered top line and Arabic grammar explanations are absent
      expect(screen.queryByText(/Cognate accusative/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/مفعول مطلق/)).not.toBeInTheDocument();
    });

    it('shows the singular form prominently when inspecting a plural word like ٱلْقُبُورِ', () => {
      const qubur = { ...surah100.ayahs['9'].words[6], ayahNumber: 9, surahNumber: 100 };

      render(
        <GrammarBottomSheet
          word={qubur}
          theme="light"
          onClose={vi.fn()}
          onNavigateWord={vi.fn()}
          hasPreviousWord={true}
          hasNextWord={true}
        />
      );

      expect(screen.getByTestId('word-pos-label')).toHaveTextContent('Ism · Plural');
      const singularBadge = screen.getByTestId('plural-singular-badge');
      expect(singularBadge).toHaveTextContent('One of them:');
      expect(singularBadge).toHaveTextContent('قَبْر');
      expect(singularBadge).toHaveTextContent('a grave');

      // Plain-English facts derived from surah_100.json fields
      expect(buildTraits(qubur).map((t) => `${t.label}:${t.value}`)).toEqual([
        'Gender:Male',
        'How many:Many',
        'Kind:Specific',
        'Role:Linked'
      ]);
      expect(buildTraits(surah100.ayahs['4'].words[0]).map((t) => `${t.label}:${t.value}`)).toEqual([
        'Time:Past',
        'Doing:Does it',
        'Who:Someone else',
        'Gender:Female',
        'How many:Many'
      ]);
      expect(buildTraits(surah100.ayahs['9'].words[3]).map((t) => `${t.label}:${t.value}`)).toEqual([
        'Time:Certain future',
        'Doing:Is done to',
        'Who:Someone else',
        'How many:One'
      ]);
    });
  });

  describe('Second Help Screen inside ? Shortcut Modal (Grammar Color Guide + Pause Pulse)', () => {
    it('switches to screen 2 (Grammar Color Guide) and toggles Emphasis Pulse', () => {
      const onTogglePulse = vi.fn();

      render(
        <KeyboardShortcutsModal
          isOpen={true}
          onClose={vi.fn()}
          emphasisPulsePaused={false}
          onToggleEmphasisPulse={onTogglePulse}
        />
      );

      // Screen 1 active by default
      expect(screen.getByRole('heading', { name: 'Keyboard Shortcuts' })).toBeInTheDocument();

      // Switch to Screen 2 (Grammar Color Guide)
      fireEvent.click(screen.getByRole('tab', { name: /Grammar Guide/i }));
      expect(screen.getByRole('heading', { name: 'Grammar Color Guide' })).toBeInTheDocument();

      const helpScreen = screen.getByTestId('grammar-help-screen');
      expect(helpScreen).toHaveTextContent('Ism · Noun (Red Shades)');
      expect(helpScreen).toHaveTextContent('Verb · Fiʿl (Green Shades)');
      expect(helpScreen).toHaveTextContent('Harf · Particle (Royal Blue)');
      expect(helpScreen).toHaveTextContent('Muḍāf & Muḍāf Ilayhi (Iḍāfa)');

      const pauseBtn = screen.getByTestId('toggle-emphasis-pulse');
      expect(pauseBtn).toHaveTextContent('Pause Emphasis Pulse');
      fireEvent.click(pauseBtn);
      expect(onTogglePulse).toHaveBeenCalledTimes(1);
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

      fireEvent.click(screen.getByTestId('open-conjugation-modal'));

      const modal = screen.getByTestId('verb-conjugation-modal');
      expect(modal).toBeInTheDocument();

      expect(screen.getByText('she stirred up')).toBeInTheDocument();
      expect(screen.getByText('we stirred up')).toBeInTheDocument();
      expect(screen.getByTestId('conjugation-ayah-row')).toHaveTextContent('they (f.) stirred up');
      expect(screen.getByTestId('conjugation-passive-section')).toHaveTextContent('it was stirred up');
      expect(screen.getByTestId('conjugation-imperative-section')).toHaveTextContent('Stir up!');

      fireEvent.click(screen.getByLabelText('Close verb conjugation sub-modal'));
      expect(screen.queryByTestId('verb-conjugation-modal')).not.toBeInTheDocument();
    });
  });

  describe('4-Letter Root Summary Card (ب ع ث ر)', () => {
    it('renders all 4 root letters cleanly for بُعْثِرَ in Ayah 9 without فَعْلِ pattern jargon', () => {
      const buthira = surah100.ayahs['9'].words[3];
      render(<RootSummaryCard sarf={buthira.sarf} theme="light" cardBg="bg-slate-50 border-slate-200" />);

      expect(screen.getByTestId('root-summary-card')).toBeInTheDocument();
      expect(screen.getByText('4-Letter Root & Core Meaning')).toBeInTheDocument();
      expect(screen.getByText('ب')).toBeInTheDocument();
      expect(screen.getByText('ر')).toBeInTheDocument();
      expect(screen.queryByText('فُعْلِلَ')).not.toBeInTheDocument();
    });
  });

  describe('Clean Reading Page & Muḍāf / Muḍāf Ilayhi (Iḍāfa)', () => {
    it('removes Arabic التركيب explanation banner under ayahs while keeping Iḍāfa word badges', () => {
      render(
        <AyahGrammarText
          words={surah100.ayahs['8'].words}
          surahNumber={100}
          ayahNumber={8}
        />
      );

      expect(screen.queryByTestId('ayah-structure-banner')).not.toBeInTheDocument();
      expect(screen.queryByText(/التركيب/)).not.toBeInTheDocument();

      const idafaBadges = screen.getAllByTestId('idafa-word-badge');
      expect(idafaBadges).toHaveLength(2);
      expect(idafaBadges[0]).toHaveTextContent('Muḍāf (of…)');
      expect(idafaBadges[1]).toHaveTextContent('Muḍāf Ilayhi');
    });

    it('renders clean English IdafaCard with Muḍāf and Muḍāf Ilayhi words', () => {
      const lihubbi = surah100.ayahs['8'].words[1];
      render(<IdafaCard idafa={lihubbi.idafa} theme="light" />);

      const card = screen.getByTestId('idafa-card');
      expect(card).toHaveTextContent('1. Muḍāf');
      expect(card).toHaveTextContent('2. Muḍāf Ilayhi');
      expect(card).toHaveTextContent(lihubbi.idafa.mudaf_ar);
      expect(card).toHaveTextContent(lihubbi.idafa.mudaf_ilayhi_ar);
    });

    it('renders Red, Green, Royal Blue dots on GrammarToggle for Surah 100', () => {
      const { container } = render(<GrammarToggle surahNumber={100} />);
      expect(container.querySelector('.bg-red-600')).toBeTruthy();
      expect(container.querySelector('.bg-emerald-600')).toBeTruthy();
      expect(container.querySelector('.bg-blue-600')).toBeTruthy();
    });

    it('glows the active tapped word and dims inactive words in the same ayah', () => {
      mockContextState.selectedGrammarWord = {
        ...surah100.ayahs['4'].words[0],
        surahNumber: 100,
        ayahNumber: 4
      };

      render(
        <AyahGrammarText
          words={surah100.ayahs['4'].words}
          surahNumber={100}
          ayahNumber={4}
        />
      );

      const cards = screen.getAllByTestId('interlinear-word');
      expect(cards[0]).toHaveAttribute('data-active-word', 'true');
      expect(cards[0].className).toContain('scale-105');
      expect(cards[1]).not.toHaveAttribute('data-active-word');
      expect(cards[1].className).toContain('opacity-40');

      expect(getAyahWordClass({ isActive: true, hasActive: true })).toContain('[text-shadow:0_0_22px_currentColor]');
      expect(getAyahWordClass({ isActive: false, hasActive: true })).toContain('opacity-40');
    });
  });
});
