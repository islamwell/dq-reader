import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Layout from '../Layout';
import GrammarWord, { getGrammarSegmentClass } from '../grammar/GrammarWord';
import GrammarBottomSheet, { buildTraits } from '../grammar/GrammarBottomSheet';
import { RootSummaryCard, MorphologyTab, SyntaxTab, InsightTab } from '../grammar/SarfDetails';
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
const surah100 = JSON.parse(
  fs.readFileSync(path.resolve(process.cwd(), 'public/data/grammar/surah_100.json'), 'utf-8')
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
      100: surah100,
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
      expect(surah103.color_palette).toBe('surah_103');
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
    it('renders Arabic word, clean Part of Speech, and English translation without Arabic wazn (فَعْل)', () => {
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
      expect(screen.queryByText('فَعْل')).not.toBeInTheDocument();
      expect(screen.getByText('Ism')).toBeInTheDocument();
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
      const posEl = screen.getByText('Ism');
      expect(posEl.className).toContain('text-slate-300');
    });
  });

  describe('SarfDetails & RootSummaryCard', () => {
    it('renders clean root letters and core meaning without فَعْلِ pattern tables', () => {
      const alAsr = surah103.ayahs['1'].words[0];
      render(
        <RootSummaryCard sarf={alAsr.sarf} theme="light" cardBg="bg-slate-50 border-slate-200" />
      );
      expect(screen.getByTestId('root-summary-card')).toBeInTheDocument();
      expect(screen.getByText('3-Letter Root & Core Meaning')).toBeInTheDocument();
      expect(screen.getByText(alAsr.sarf.root_meaning)).toBeInTheDocument();
      expect(screen.queryByText('فَعْلِ')).not.toBeInTheDocument();
      expect(screen.queryByText('فَعْل')).not.toBeInTheDocument();
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

    it('renders fixed-word note cleanly for particles without a sarf scale', () => {
      const inna = surah103.ayahs['2'].words[0];
      render(
        <MorphologyTab word={inna} theme="light" cardBg="bg-slate-50 border-slate-200" />
      );
      expect(screen.getByTestId('sarf-note')).toBeInTheDocument();
      expect(screen.getByText(/Fixed Word — Never Changes Form/i)).toBeInTheDocument();
    });

    it('renders SyntaxTab and InsightTab accurately', () => {
      const word = allWords103[0];
      const { rerender } = render(
        <SyntaxTab word={word} theme="light" cardBg="bg-slate-50 border-slate-200" />
      );
      expect(screen.getByText('How It Works (Grammar)')).toBeInTheDocument();
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

      expect(screen.getByText('Surah 103, ayah 1, word 1')).toBeInTheDocument();
      expect(screen.getByRole('tablist')).toBeInTheDocument();

      const sarfTab = screen.getByRole('tab', { name: /Ṣarf/i });
      const irabTab = screen.getByRole('tab', { name: /Iʿrāb/i });
      const insightTab = screen.getByRole('tab', { name: /Insight/i });

      expect(sarfTab).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByTestId('facts-panel')).toBeInTheDocument();
      expect(screen.getByText('Specific')).toBeInTheDocument();
      expect(screen.getByText('Linked')).toBeInTheDocument();

      // Detailed content renders directly without needing a "More details" toggle button
      expect(screen.queryByTestId('toggle-more-details')).not.toBeInTheDocument();
      expect(screen.getByTestId('root-summary-card')).toBeInTheDocument();
      expect(screen.getByTestId('quick-facts-grid')).toBeInTheDocument();

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

    it('uses Green for Verb, Red for Ism, Yellow for Harf, unified green for verb endings, and black bold (no glow) for emphasis harfs', () => {
      expect(getGrammarSegmentClass('fil', 'colored', 'light', null, 'surah_103')).toContain('text-emerald-700');
      expect(getGrammarSegmentClass('ism', 'colored', 'light', null, 'surah_103')).toContain('text-red-600');
      expect(getGrammarSegmentClass('harf', 'colored', 'light', null, 'surah_103')).toContain('text-yellow-600');
      expect(getGrammarSegmentClass('harf', 'colored', 'light', { emphasis: false }, 'surah_103')).not.toContain('harf-emphasis-red-glow');
      const empLight = getGrammarSegmentClass('harf', 'colored', 'light', { emphasis: true }, 'surah_103');
      expect(empLight).toContain('text-black font-bold');
      expect(empLight).not.toContain('harf-emphasis-red-glow');
      expect(getGrammarSegmentClass('harf', 'colored', 'green', { emphasis: true }, 'surah_103')).toContain('text-black font-bold');

      expect(getGrammarSegmentClass('fil', 'colored', 'dark', null, 'surah_103')).toContain('text-emerald-400');
      expect(getGrammarSegmentClass('ism', 'colored', 'dark', null, 'surah_103')).toContain('text-red-400');
      expect(getGrammarSegmentClass('harf', 'colored', 'dark', null, 'surah_103')).toContain('text-yellow-300');
      const empDark = getGrammarSegmentClass('harf', 'colored', 'dark', { emphasis: true }, 'surah_103');
      expect(empDark).toContain('text-white font-bold');
      expect(empDark).not.toContain('harf-emphasis-red-glow');

      // All 4 Surah 103 verbs keep their subject suffix (وا۟ / وْا۟) in the same green 'fil' category
      const tawasaw = surah103.ayahs['3'].words[5];
      const suffix = tawasaw.segments.find((s) => s.role === 'suffix');
      expect(suffix.text).toBe('وْا۟');
      expect(suffix.category).toBe('fil');
      expect(suffix.pos_name_en).toBe('They');
      expect(getGrammarSegmentClass(suffix.category, 'colored', 'light', suffix, 'surah_103')).toContain('text-emerald-700');

      // Emphasis harfs in Surah 103: وَ of oath (1:1), إِنَّ (2:1), and لَ (2:3)
      expect(surah103.ayahs['1'].words[0].segments[0].emphasis).toBe(true);
      expect(surah103.ayahs['2'].words[0].segments[0].emphasis).toBe(true);
      expect(surah103.ayahs['2'].words[2].segments[0].emphasis).toBe(true);
      expect(surah103.ayahs['2'].words[2].segments[1].emphasis).toBeUndefined();
    });

    it('renders visual diagram, grouped feature tiles with They (no Pronoun), duo cards, and moves More details inside VerbConjugationModal for ءَامَنُوا۟', () => {
      const amanu = { ...surah103.ayahs['3'].words[2], ayahNumber: 3, surahNumber: 103, color_palette: 'surah_103' };
      const handleClose = vi.fn();
      const traits = buildTraits(amanu);
      expect(traits.map((t) => `${t.label}:${t.value}`)).toEqual([
        'Time:Past',
        'Doing:Does it',
        'Who:Someone else',
        'Gender:Male',
        'How many:Many'
      ]);

      render(
        <div>
          <div data-testid="outside-surah-area">Outside area</div>
          <GrammarBottomSheet
            word={amanu}
            theme="light"
            onClose={handleClose}
            onNavigateWord={vi.fn()}
            hasPreviousWord={true}
            hasNextWord={true}
          />
        </div>
      );

      expect(screen.getByTestId('facts-panel')).toBeInTheDocument();
      expect(screen.getByTestId('grammar-floating-wrapper').className).toContain('bottom-6');
      expect(screen.getByRole('dialog').className).not.toContain('overscroll-contain');
      expect(screen.getByTestId('grammar-hero-stage')).toBeInTheDocument();
      expect(screen.getByTestId('word-bracket-diagram')).toBeInTheDocument();

      // Quotation marks and redundant "Verb · Past" / "Root:" hero pills are removed
      expect(screen.queryByTestId('word-pos-label')).not.toBeInTheDocument();
      expect(screen.queryByTestId('hero-root-pill')).not.toBeInTheDocument();
      expect(screen.getByText('believe', { selector: 'p' })).toBeInTheDocument();
      expect(screen.queryByText('“believe”')).not.toBeInTheDocument();

      // Grouped visual tiles: Verb + They (never "Pronoun") + animated Past timeline + bottom duo row
      expect(screen.getByTestId('visual-feature-groups')).toBeInTheDocument();
      expect(screen.getAllByTestId('visual-feature-tile')).toHaveLength(6);
      expect(screen.getByTestId('tense-timeline')).toBeInTheDocument();
      expect(screen.getByTestId('feature-group-subject-col')).toHaveTextContent('They');
      expect(screen.queryByText(/\bPronoun\b/i)).not.toBeInTheDocument();
      expect(screen.getByText('Past')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByText('3rd person')).toBeInTheDocument();
      expect(screen.getByText('Masculine')).toBeInTheDocument();
      expect(screen.getByText('Plural')).toBeInTheDocument();
      expect(screen.getByTestId('visual-duo-row')).toHaveTextContent('those who have faith');
      expect(screen.getByTestId('visual-root-card')).toHaveTextContent('safety, security, trust');

      // Pause/Play motion toggle (WCAG 2.2.2, label-swapping without aria-pressed)
      const motionBtn = screen.getByTestId('toggle-modal-motion');
      expect(motionBtn).toHaveTextContent('Pause motion');
      expect(motionBtn).not.toHaveAttribute('aria-pressed');
      fireEvent.click(motionBtn);
      expect(motionBtn).toHaveTextContent('Play motion');

      // Button reads "Conjugation Table" and opens the modal with details directly visible (no "More details" button)
      expect(screen.queryByTestId('toggle-more-details')).not.toBeInTheDocument();
      const openConjBtn = screen.getByTestId('open-conjugation-modal');
      expect(openConjBtn).toHaveTextContent('Conjugation Table');
      fireEvent.click(openConjBtn);

      const conjModal = screen.getByTestId('verb-conjugation-modal');
      expect(conjModal).toBeInTheDocument();
      expect(conjModal).toHaveTextContent('she believed');
      expect(conjModal).toHaveTextContent('we believed');
      expect(conjModal).toHaveTextContent('Believe!');

      // Verb details & animated Sound Tip render directly inside VerbConjugationModal without clicking a toggle button
      expect(screen.queryByTestId('toggle-more-details')).not.toBeInTheDocument();
      expect(screen.queryByText(/Word Pieces/i)).not.toBeInTheDocument();
      expect(screen.getByText('Quick Verb Forms')).toBeInTheDocument();
      expect(screen.getByText(/Same Root/i)).toBeInTheDocument();
      expect(screen.getByTestId('sound-tip-flow')).toBeInTheDocument();
      expect(screen.getByTestId('sound-step-before')).toHaveTextContent('أَأْمَنُوا');
      expect(screen.getByTestId('sound-step-after')).toHaveTextContent('ءَامَنُوا۟');
      const passiveStrip = screen.getByTestId('verb-passive-strip');
      expect(passiveStrip).toHaveTextContent('أُومِنَ');
      expect(passiveStrip).toHaveTextContent('يُؤْمَنُ');

      // Close conjugation sub-modal before testing click-outside dismiss on GrammarBottomSheet
      fireEvent.click(screen.getByLabelText('Close verb conjugation sub-modal'));
      expect(screen.queryByTestId('verb-conjugation-modal')).not.toBeInTheDocument();
      expect(handleClose).not.toHaveBeenCalled();

      // Clicking inside the modal does not close it
      fireEvent.click(screen.getByTestId('grammar-hero-stage'));
      expect(handleClose).not.toHaveBeenCalled();

      // Clicking outside the modal closes the box
      const outside = screen.getByTestId('outside-surah-area');
      fireEvent.pointerDown(outside);
      fireEvent.pointerUp(outside);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('renders animated Before -> Dropped -> After Arabic letter transformation in Sound Tip for وَتَوَاصَوْا۟', () => {
      const tawasaw = surah103.ayahs['3'].words[5];
      render(
        <MorphologyTab
          word={tawasaw}
          theme="light"
          cardBg="bg-slate-50 border-slate-200"
          hideConjugationButton={true}
        />
      );

      const flow = screen.getByTestId('sound-tip-flow');
      expect(flow).toBeInTheDocument();
      expect(screen.getByTestId('sound-step-before')).toHaveTextContent('تَوَاصَيُوا');
      const droppedStep = screen.getByTestId('sound-step-dropped');
      expect(droppedStep).toHaveTextContent('تَوَاصَاوْا');
      expect(droppedStep.querySelector('.sound-letter-dropped')).toHaveTextContent('ا');
      expect(screen.getByTestId('sound-step-after')).toHaveTextContent('تَوَاصَوْا۟');
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

  describe('Surah 103 clean Arabic flow (no underline or sub-word label below Surah 103 words)', () => {
    it('renders clean colored Arabic words without underline bars or sub-word text for Surah 103, while building 14-word surah list', () => {
      render(
        <AyahGrammarText
          words={surah103.ayahs['1'].words}
          surahNumber={103}
          ayahNumber={1}
        />
      );

      expect(screen.queryByTestId('interlinear-word')).not.toBeInTheDocument();
      expect(screen.queryByTestId('ayah-structure-banner')).not.toBeInTheDocument();
      expect(screen.queryByText('Ism')).not.toBeInTheDocument();
      expect(screen.queryByText('By the time')).not.toBeInTheDocument();

      const wordButton = screen.getByRole('button', { name: /وَٱلْعَصْرِ/ });
      expect(wordButton).toHaveAttribute('data-arabic-word', 'true');
      expect(wordButton.className).not.toContain('underline');

      fireEvent.click(wordButton);
      expect(mockContextState.setSelectedGrammarWord).toHaveBeenCalledTimes(1);
      const passed = mockContextState.setSelectedGrammarWord.mock.calls[0][0];
      expect(passed.wordsInAyah).toHaveLength(14);
      expect(passed.ayahStructure).toEqual({
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

    it('omits Ṣarf Cards toggle button on Surah 103 and Surah 32, showing Red/Green/Yellow dots on Surah 103', () => {
      const { rerender, container } = render(<GrammarToggle surahNumber={103} />);
      expect(screen.queryByTestId('interlinear-toggle')).not.toBeInTheDocument();
      expect(container.querySelector('.bg-red-600')).toBeTruthy();
      expect(container.querySelector('.bg-emerald-600')).toBeTruthy();
      expect(container.querySelector('.bg-yellow-500')).toBeTruthy();

      rerender(<GrammarToggle surahNumber={32} />);
      expect(screen.queryByTestId('interlinear-toggle')).not.toBeInTheDocument();

      rerender(<GrammarToggle surahNumber={100} />);
      const toggleBtn = screen.getByTestId('interlinear-toggle');
      expect(toggleBtn).toHaveAttribute('aria-pressed', 'true');

      fireEvent.click(toggleBtn);
      expect(mockContextState.setShowInterlinear).toHaveBeenCalled();
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

      expect(screen.getByText('Surah 103, ayah 1, word 1')).toBeInTheDocument();

      // Advance from Ayah 1 position 1 -> Ayah 2 position 1
      fireEvent.click(screen.getByLabelText('Next word'));
      expect(mockContextState.setSelectedGrammarWord).toHaveBeenCalledTimes(1);
      const secondCall = mockContextState.setSelectedGrammarWord.mock.calls[0][0];
      expect(secondCall.ayahNumber).toBe(2);
      expect(secondCall.position).toBe(1);
      expect(secondCall.text_uthmani).toBe('إِنَّ');
      expect(secondCall.ayahStructure.en).toBe(surah103.ayahs['2'].structure_en);

      // Re-render at Ayah 2 position 1 and verify Next advances to 2:2 (not stuck on 1:1 -> 1:2)
      mockContextState.selectedGrammarWord = secondCall;
      rerender(
        <MemoryRouter initialEntries={['/surah/103']}>
          <Layout />
        </MemoryRouter>
      );
      expect(screen.getByText('Surah 103, ayah 2, word 1')).toBeInTheDocument();

      fireEvent.click(screen.getByLabelText('Next word'));
      const thirdCall = mockContextState.setSelectedGrammarWord.mock.calls[1][0];
      expect(thirdCall.ayahNumber).toBe(2);
      expect(thirdCall.position).toBe(2);
      expect(thirdCall.text_uthmani).toBe('ٱلْإِنسَـٰنَ');
    });
  });
});
