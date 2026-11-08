import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Layout from '../Layout';
import GrammarWord from '../grammar/GrammarWord';
import GrammarBottomSheet from '../grammar/GrammarBottomSheet';
import { MizanCard, MorphologyTab, SyntaxTab, InsightTab } from '../grammar/SarfDetails';
import AyahGrammarText from '../grammar/AyahGrammarText';
import GrammarToggle from '../grammar/GrammarToggle';
import { useGrammarKeyboardShortcuts } from '../../hooks/useGrammarKeyboardShortcuts';

// Mock react-hot-toast for hook tests
vi.mock('react-hot-toast', () => {
  const toastFn = vi.fn();
  toastFn.success = vi.fn();
  return { default: toastFn };
});

// Mutable mock context state for AyahGrammarText & GrammarToggle tests
const mockContextState = {
  lastPlayedPosition: null,
  isSettingsOpen: false,
  openSettings: vi.fn(),
  closeSettings: vi.fn(),
  grammarMode: 'colored',
  theme: 'light',
  selectedGrammarWord: null,
  setSelectedGrammarWord: vi.fn(),
  grammarData: {},
  showInterlinear: true,
  setShowInterlinear: vi.fn(),
  toggleGrammarMode: vi.fn(),
  setGrammarMode: vi.fn()
};

vi.mock('../../contexts/QuranContext', () => ({
  useQuranData: () => mockContextState
}));

vi.mock('../SearchBar', () => ({
  default: () => <div data-testid="mock-search-bar" />
}));

vi.mock('../FloatingVideoViewport', () => ({
  default: () => null
}));

const surah103 = JSON.parse(
  fs.readFileSync(path.resolve(process.cwd(), 'public/data/grammar/surah_103.json'), 'utf-8')
);
const surah32 = JSON.parse(
  fs.readFileSync(path.resolve(process.cwd(), 'public/data/grammar/surah_32.json'), 'utf-8')
);
const versesJson = JSON.parse(
  fs.readFileSync(path.resolve(process.cwd(), 'public/data/quran-verses.json'), 'utf-8')
);

const allWords103 = Object.values(surah103.ayahs)
  .sort((a, b) => a.verse_number - b.verse_number)
  .flatMap((ayah) =>
    ayah.words.map((w) => ({
      ...w,
      ayahNumber: ayah.verse_number,
      ayahStructure: { ar: ayah.structure_ar, en: ayah.structure_en }
    }))
  );

describe('Surah 103 Enhanced Sarf Data & UI', () => {
  beforeEach(() => {
    mockContextState.grammarMode = 'colored';
    mockContextState.theme = 'light';
    mockContextState.selectedGrammarWord = null;
    mockContextState.setSelectedGrammarWord = vi.fn();
    mockContextState.grammarData = {
      103: surah103,
      32: surah32
    };
    mockContextState.showInterlinear = true;
    mockContextState.setShowInterlinear = vi.fn();
    mockContextState.toggleGrammarMode = vi.fn();
    mockContextState.setGrammarMode = vi.fn();
  });

  describe('surah_103.json data validation', () => {
    it('matches exact Uthmani verses and contains valid sarf & segment mappings for all 14 words', () => {
      expect(surah103.surah_number).toBe(103);
      expect(surah103.version).toBe(2);
      expect(surah103.enhanced).toBe(true);
      expect(allWords103).toHaveLength(14);

      const expectedVerses = versesJson['103'].verses;
      expect(expectedVerses).toHaveLength(3);

      for (const expectedVerse of expectedVerses) {
        const ayahData = surah103.ayahs[String(expectedVerse.verse_number)];
        expect(ayahData).toBeDefined();
        expect(ayahData.structure_ar).toBeTruthy();
        expect(ayahData.structure_en).toBeTruthy();

        const joined = ayahData.words.map((w) => w.text_uthmani).join(' ');
        expect(joined).toBe(expectedVerse.text_uthmani);
      }

      for (const w of allWords103) {
        const joinedSegments = w.segments.map((s) => s.text).join('');
        expect(joinedSegments).toBe(w.text_uthmani);
        expect(w.irab?.ar).toBeTruthy();
        expect(w.irab?.en).toBeTruthy();
        expect(w.insight?.title_en).toBeTruthy();
        expect(w.insight?.en).toBeTruthy();

        if (w.sarf) {
          expect(w.sarf.root).toHaveLength(3);
          const stemSegment = w.segments.find((s) => s.role === 'stem');
          expect(stemSegment).toBeDefined();
          const joinedStem = w.sarf.stem_letters.map((l) => l.t).join('');
          expect(joinedStem).toBe(stemSegment.text);

          const covered = new Set();
          w.sarf.stem_letters.forEach((l) => {
            if (l.r) {
              for (const ch of l.r) covered.add(ch);
            }
          });
          const expectedSlots = new Set(['f', 'a', 'l']);
          (w.sarf.deleted_radicals || []).forEach((d) => expectedSlots.delete(d));
          expect(covered).toEqual(expectedSlots);
        } else {
          expect(w.sarf_note_ar).toBeTruthy();
          expect(w.sarf_note_en).toBeTruthy();
        }
      }
    });
  });

  describe('GrammarWord interlinear mode', () => {
    it('renders Arabic word, wazn, and English translation in interlinear card mode', () => {
      const alAsr = surah103.ayahs['1'].words[0];
      const handleSelect = vi.fn();

      render(
        <GrammarWord
          word={alAsr}
          grammarMode="colored"
          theme="light"
          isSelected={false}
          onSelectWord={handleSelect}
          interlinear={true}
        />
      );

      const card = screen.getByTestId('interlinear-word');
      expect(card).toBeInTheDocument();
      expect(screen.getByText('فَعْل')).toBeInTheDocument();
      expect(screen.getByText('By the time')).toBeInTheDocument();

      fireEvent.keyDown(card, { key: 'Enter' });
      expect(handleSelect).toHaveBeenCalledWith(alAsr);

      fireEvent.keyDown(card, { key: ' ' });
      fireEvent.keyUp(card, { key: ' ' });
      expect(handleSelect).toHaveBeenCalledTimes(2);
    });

    it('uses legible light text colors on dark theme without inheriting black Uthmani color', () => {
      const alAsr = surah103.ayahs['1'].words[0];
      render(
        <GrammarWord
          word={alAsr}
          grammarMode="colored"
          theme="dark"
          isSelected={true}
          onSelectWord={vi.fn()}
          interlinear={true}
        />
      );

      const translationEl = screen.getByText('By the time');
      expect(translationEl.className).toContain('text-slate-300');
      const waznEl = screen.getByText('فَعْل');
      expect(waznEl.className).toContain('text-amber-300');
    });
  });

  describe('SarfDetails & MizanCard', () => {
    it('explains merged radicals (idgham) for بِٱلْحَقِّ and deleted radicals for وَتَوَاصَوْا۟', () => {
      const haqq = surah103.ayahs['3'].words.find((w) => w.position === 7);
      const { rerender } = render(
        <MizanCard sarf={haqq.sarf} theme="light" cardBg="bg-slate-50 border-slate-200" />
      );
      expect(screen.getByTestId('mizan-card')).toBeInTheDocument();
      expect(screen.getByText(/two radicals/i)).toBeInTheDocument();

      const tawasaw = surah103.ayahs['3'].words.find((w) => w.position === 6);
      rerender(<MizanCard sarf={tawasaw.sarf} theme="green" cardBg="bg-emerald-900/60 border-emerald-800" />);
      expect(screen.getByText('deleted')).toBeInTheDocument();
      expect(screen.getByText('تَفَاعَلُوا')).toBeInTheDocument();
    });

    it('invokes onOpenAyah when clicking a Quran root family reference', () => {
      const alAsr = surah103.ayahs['1'].words[0];
      const onOpenAyah = vi.fn();
      render(
        <MorphologyTab
          word={alAsr}
          theme="light"
          cardBg="bg-slate-50 border-slate-200"
          onOpenAyah={onOpenAyah}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /Open I press \(grapes\) at Surah 12, Ayah 36/i }));
      expect(onOpenAyah).toHaveBeenCalledWith(12, 36);
    });

    it('renders mabni note cleanly for particles without a sarf scale', () => {
      const inna = surah103.ayahs['2'].words[0];
      render(
        <MorphologyTab word={inna} theme="light" cardBg="bg-slate-50 border-slate-200" />
      );
      expect(screen.getByTestId('sarf-note')).toBeInTheDocument();
      expect(screen.getByText(/مبنيّ — لا ميزان صرفي/)).toBeInTheDocument();
    });

    it('renders SyntaxTab and InsightTab accurately', () => {
      const word = allWords103[0];
      const { rerender } = render(
        <SyntaxTab word={word} theme="light" cardBg="bg-slate-50 border-slate-200" />
      );
      expect(screen.getByText('Full iʿrāb')).toBeInTheDocument();
      expect(screen.getByText(word.ayahStructure.en)).toBeInTheDocument();

      rerender(<InsightTab word={word} theme="light" cardBg="bg-slate-50 border-slate-200" />);
      expect(screen.getByText('Time that is being squeezed')).toBeInTheDocument();
    });
  });

  describe('GrammarBottomSheet tabbed enhanced view vs v1 compatibility', () => {
    it('renders Ṣarf, Iʿrāb, and Insight tabs with click, tablist arrows, and number shortcuts', () => {
      const alAsr = { ...allWords103[0], surahNumber: 103 };
      const handleNavigate = vi.fn();

      render(
        <GrammarBottomSheet
          word={alAsr}
          theme="green"
          onClose={vi.fn()}
          onNavigateWord={handleNavigate}
          hasPreviousWord={false}
          hasNextWord={true}
        />
      );

      expect(screen.getByText('Surah 103 · 1:1')).toBeInTheDocument();
      expect(screen.getByRole('tablist')).toBeInTheDocument();

      const sarfTab = screen.getByRole('tab', { name: /Ṣarf/i });
      const irabTab = screen.getByRole('tab', { name: /Iʿrāb/i });
      const insightTab = screen.getByRole('tab', { name: /Insight/i });

      expect(sarfTab).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByTestId('mizan-card')).toBeInTheDocument();

      // Switch to Iʿrāb via click
      fireEvent.click(irabTab);
      expect(irabTab).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByText(alAsr.irab.en)).toBeInTheDocument();

      // Switch tabs via keyboard ArrowRight inside tablist (without navigating words)
      fireEvent.keyDown(irabTab, { key: 'ArrowRight' });
      expect(insightTab).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByText('Time that is being squeezed')).toBeInTheDocument();
      expect(handleNavigate).not.toHaveBeenCalled();

      // Press 1 to jump back to Morphology tab, and ] to advance to next word
      fireEvent.keyDown(window, { key: '1' });
      expect(sarfTab).toHaveAttribute('aria-selected', 'true');

      fireEvent.keyDown(window, { key: ']' });
      expect(handleNavigate).toHaveBeenCalledWith(1);
    });

    it('preserves v1 layout when opening a Surah 32 word without enhanced fields', () => {
      const surah32Word = { ...surah32.ayahs['2'].words[0], ayahNumber: 2, surahNumber: 32 };
      render(
        <GrammarBottomSheet
          word={surah32Word}
          theme="dark"
          onClose={vi.fn()}
          onNavigateWord={vi.fn()}
          hasPreviousWord={false}
          hasNextWord={true}
        />
      );

      expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
      expect(screen.getByText(/Sub-word Morpheme Breakdown/i)).toBeInTheDocument();
      expect(screen.getByText('ن ز ل')).toBeInTheDocument();
    });
  });

  describe('Surah 103 isolation: AyahGrammarText, GrammarToggle, and I shortcut', () => {
    it('renders interlinear cards and structure banner for Surah 103, and builds 14-word surah list', () => {
      render(
        <AyahGrammarText
          words={surah103.ayahs['1'].words}
          surahNumber={103}
          ayahNumber={1}
        />
      );

      expect(screen.getByTestId('interlinear-word')).toBeInTheDocument();
      expect(screen.getByTestId('ayah-structure-banner')).toBeInTheDocument();

      fireEvent.click(screen.getByTestId('interlinear-word'));
      expect(mockContextState.setSelectedGrammarWord).toHaveBeenCalledTimes(1);
      const passed = mockContextState.setSelectedGrammarWord.mock.calls[0][0];
      expect(passed.wordsInAyah).toHaveLength(14);
      expect(passed.ayahStructure).toEqual({
        ar: surah103.ayahs['1'].structure_ar,
        en: surah103.ayahs['1'].structure_en
      });
    });

    it('does NOT render interlinear cards or structure banner for Surah 32', () => {
      render(
        <AyahGrammarText
          words={surah32.ayahs['2'].words}
          surahNumber={32}
          ayahNumber={2}
        />
      );

      expect(screen.queryByTestId('interlinear-word')).not.toBeInTheDocument();
      expect(screen.queryByTestId('ayah-structure-banner')).not.toBeInTheDocument();
    });

    it('renders Ṣarf Cards toggle button ONLY on Surah 103', () => {
      const { rerender } = render(<GrammarToggle surahNumber={103} />);
      const toggleBtn = screen.getByTestId('interlinear-toggle');
      expect(toggleBtn).toHaveAttribute('aria-pressed', 'true');

      fireEvent.click(toggleBtn);
      expect(mockContextState.setShowInterlinear).toHaveBeenCalled();

      rerender(<GrammarToggle surahNumber={32} />);
      expect(screen.queryByTestId('interlinear-toggle')).not.toBeInTheDocument();
    });

    it('handles keyboard shortcut I only when interlinearAvailable is true and skips inputs', () => {
      const setShowInterlinear = vi.fn();
      const setGrammarMode = vi.fn();

      const TestHarness = ({ available }) => {
        useGrammarKeyboardShortcuts({
          grammarMode: 'colored',
          setGrammarMode,
          toggleGrammarMode: vi.fn(),
          showInterlinear: true,
          setShowInterlinear,
          interlinearAvailable: available
        });
        return <input aria-label="Search box" />;
      };

      const { rerender } = render(<TestHarness available={false} />);
      fireEvent.keyDown(window, { key: 'i' });
      expect(setShowInterlinear).not.toHaveBeenCalled();

      rerender(<TestHarness available={true} />);
      fireEvent.keyDown(window, { key: 'i' });
      expect(setShowInterlinear).toHaveBeenCalledWith(false);

      // Should ignore while typing in input
      const input = screen.getByLabelText('Search box');
      fireEvent.keyDown(input, { key: 'I' });
      expect(setShowInterlinear).toHaveBeenCalledTimes(1);
    });
  });

  describe('Layout cross-ayah navigation across duplicate word positions', () => {
    it('advances from 103:1:1 to 103:2:1 and 103:2:2 updating ayahNumber and ayahStructure', () => {
      mockContextState.selectedGrammarWord = {
        ...surah103.ayahs['1'].words[0],
        surahNumber: 103,
        ayahNumber: 1,
        wordsInAyah: allWords103,
        ayahStructure: {
          ar: surah103.ayahs['1'].structure_ar,
          en: surah103.ayahs['1'].structure_en
        }
      };

      const { rerender } = render(
        <MemoryRouter initialEntries={['/surah/103']}>
          <Layout />
        </MemoryRouter>
      );

      expect(screen.getByText('Surah 103 · 1:1')).toBeInTheDocument();

      // Advance from Ayah 1 position 1 -> Ayah 2 position 1
      fireEvent.click(screen.getByLabelText('Next word'));
      expect(mockContextState.setSelectedGrammarWord).toHaveBeenCalledTimes(1);
      const secondCall = mockContextState.setSelectedGrammarWord.mock.calls[0][0];
      expect(secondCall.ayahNumber).toBe(2);
      expect(secondCall.position).toBe(1);
      expect(secondCall.text_uthmani).toBe('إِنَّ');
      expect(secondCall.ayahStructure.ar).toBe(surah103.ayahs['2'].structure_ar);

      // Re-render at Ayah 2 position 1 and verify Next advances to 2:2 (not stuck on 1:1 -> 1:2)
      mockContextState.selectedGrammarWord = secondCall;
      rerender(
        <MemoryRouter initialEntries={['/surah/103']}>
          <Layout />
        </MemoryRouter>
      );
      expect(screen.getByText('Surah 103 · 2:1')).toBeInTheDocument();

      fireEvent.click(screen.getByLabelText('Next word'));
      const thirdCall = mockContextState.setSelectedGrammarWord.mock.calls[1][0];
      expect(thirdCall.ayahNumber).toBe(2);
      expect(thirdCall.position).toBe(2);
      expect(thirdCall.text_uthmani).toBe('ٱلْإِنسَـٰنَ');
    });
  });
});
