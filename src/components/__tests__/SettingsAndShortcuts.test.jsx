import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import SettingsPanel from '../SettingsPanel';
import KeyboardShortcutsModal from '../KeyboardShortcutsModal';
import AyahCard from '../AyahCard';
import { useGlobalKeyboardShortcuts } from '../../hooks/useGlobalKeyboardShortcuts';

let mockQuranData;
let mockQuranAudio;

vi.mock('../../contexts/QuranContext', () => ({
  useQuranData: () => mockQuranData,
  useQuranAudio: () => mockQuranAudio
}));

const LocationDisplay = () => {
  const location = useLocation();
  return <div data-testid="router-location">{`${location.pathname}${location.search}`}</div>;
};

const ShortcutsHarness = () => {
  const { isShortcutsOpen, closeShortcuts } = useGlobalKeyboardShortcuts();
  return (
    <>
      <LocationDisplay />
      <input aria-label="Sample input" />
      <KeyboardShortcutsModal isOpen={isShortcutsOpen} onClose={closeShortcuts} />
    </>
  );
};

describe('SettingsPanel & Global Keyboard Shortcuts', () => {
  beforeEach(() => {
    mockQuranData = {
      theme: 'green',
      language: 'English',
      bookmarks: [],
      history: [],
      addVisitedAyah: vi.fn(),
      clearHistory: vi.fn(),
      fetchSurahVerses: vi.fn().mockResolvedValue([]),
      setThemePreference: vi.fn(),
      setLanguagePreference: vi.fn(),
      selectedReciter: 'default',
      setReciterPreference: vi.fn(),
      enablePrimaryAudio: true,
      setPrimaryAudioEnabled: vi.fn(),
      enableSupplementalAudio: false,
      setSupplementalAudioEnabled: vi.fn(),
      enableDQ2Audio: false,
      setDQ2AudioEnabled: vi.fn(),
      includeTranslationsInSearch: true,
      setSearchTranslationsEnabled: vi.fn(),
      surahs: [{ id: 1, name_simple: 'Al-Fatihah', name_arabic: 'الفاتحة', verses_count: 7 }],
      audioCacheProgress: { arabic: { status: 'idle' }, urdu: { status: 'idle' } },
      cacheArabicAudio: vi.fn(),
      cacheUrduAudio: vi.fn(),
      grammarMode: 'off',
      setGrammarMode: vi.fn(),
      grammarData: {},
      getTafseer: vi.fn(),
      getVideoForAyah: vi.fn(),
      lastPlayedPosition: { surahNumber: 2, ayahNumber: 255 },
      toggleSettings: vi.fn(),
      closeSettings: vi.fn(),
      toggleBookmark: vi.fn()
    };

    mockQuranAudio = {
      playingAyah: null,
      isPaused: false,
      playAudio: vi.fn(),
      pauseAudio: vi.fn(),
      resumeAudio: vi.fn(),
      stopAudio: vi.fn()
    };
  });

  it('SettingsPanel removes country labels under flags, gives active flag pulsing glow, and places X next to Bookmarks', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <MemoryRouter initialEntries={['/']}>
        <SettingsPanel isOpen={true} onClose={onClose} />
      </MemoryRouter>
    );

    // No visible country labels rendered beneath the round flags
    expect(screen.queryByText('USA')).not.toBeInTheDocument();
    expect(screen.queryByText('France')).not.toBeInTheDocument();
    expect(screen.queryByText('Pakistan')).not.toBeInTheDocument();
    expect(screen.queryByText('Norway')).not.toBeInTheDocument();

    // Active language flag has pulsing glow class; inactive flags do not
    const usaFlagBtn = screen.getByRole('button', { name: 'USA (English)' });
    const franceFlagBtn = screen.getByRole('button', { name: 'France (French)' });
    expect(usaFlagBtn.className).toContain('flag-active-glow');
    expect(franceFlagBtn.className).not.toContain('flag-active-glow');

    // Close button with X sits on the same header row as Bookmarks heading
    const bookmarksHeading = screen.getByRole('heading', { name: 'Bookmarks' });
    const headerRow = bookmarksHeading.closest('div')?.parentElement;
    const closeButtons = screen.getAllByRole('button', { name: 'Close settings' });
    expect(closeButtons).toHaveLength(1);
    expect(headerRow).toContainElement(closeButtons[0]);

    await user.click(closeButtons[0]);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('opens keyboard shortcuts modal with ? and handles global shortcuts cleanly', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/surah/2']}>
        <ShortcutsHarness />
      </MemoryRouter>
    );

    const dialog = document.querySelector('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog?.hasAttribute('open')).toBe(false);

    // Press ? to open shortcuts modal
    fireEvent.keyDown(window, { key: '?' });
    expect(dialog?.hasAttribute('open')).toBe(true);
    expect(screen.getByRole('heading', { name: 'Keyboard Shortcuts' })).toBeVisible();

    // Press ? again to toggle closed
    fireEvent.keyDown(window, { key: '?' });
    expect(dialog?.hasAttribute('open')).toBe(false);

    // Navigation & toggle shortcuts
    fireEvent.keyDown(window, { key: 'b' });
    expect(screen.getByTestId('router-location').textContent).toBe('/bookmarks');

    fireEvent.keyDown(window, { key: 'v' });
    expect(screen.getByTestId('router-location').textContent).toBe('/videos');

    fireEvent.keyDown(window, { key: 'h' });
    expect(screen.getByTestId('router-location').textContent).toBe('/');

    fireEvent.keyDown(window, { key: 's' });
    expect(mockQuranData.toggleSettings).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(window, { key: 'c' });
    expect(mockQuranData.setThemePreference).toHaveBeenCalledWith('red');

    fireEvent.keyDown(window, { key: 'l' });
    expect(mockQuranData.setLanguagePreference).toHaveBeenCalledWith('French');

    // Typing inside an input must NOT fire single-key shortcuts or '?'
    const input = screen.getByRole('textbox', { name: 'Sample input' });
    await user.type(input, '?bvs');
    expect(dialog?.hasAttribute('open')).toBe(false);
    expect(screen.getByTestId('router-location').textContent).toBe('/');
    expect(mockQuranData.toggleSettings).toHaveBeenCalledTimes(1);
  });

  it('triggers language switch with KeyL even on non-Latin keyboard layouts and re-renders AyahCard translations', () => {
    render(
      <MemoryRouter initialEntries={['/surah/1']}>
        <ShortcutsHarness />
      </MemoryRouter>
    );

    fireEvent.keyDown(window, { key: 'م', code: 'KeyL' });
    expect(mockQuranData.setLanguagePreference).toHaveBeenCalledWith('French');

    const baseVerse = {
      verse_number: 1,
      verse_key: '1:1',
      text_uthmani: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
      translations: [{ text: 'In the name of Allah', language: 'English', label: 'Saheeh International' }]
    };

    const { rerender } = render(
      <MemoryRouter>
        <AyahCard verse={baseVerse} surahNumber={1} />
      </MemoryRouter>
    );
    expect(screen.getByText('In the name of Allah')).toBeInTheDocument();

    const frenchVerse = {
      ...baseVerse,
      translations: [{ text: "Au nom d'Allah", language: 'French', label: 'Muhammad Hamidullah' }]
    };

    rerender(
      <MemoryRouter>
        <AyahCard verse={frenchVerse} surahNumber={1} />
      </MemoryRouter>
    );
    expect(screen.getByText("Au nom d'Allah")).toBeInTheDocument();
  });

  it('does not fetch bookmark/history verses while SettingsPanel is closed, and loads them once opened', async () => {
    mockQuranData.bookmarks = [{ surahNumber: 2, ayahNumber: 255 }];
    mockQuranData.history = [{ id: '1:1', surahNumber: 1, ayahNumber: 1 }];
    mockQuranData.fetchSurahVerses = vi.fn().mockResolvedValue([
      { verse_number: 1, verse_key: '1:1', text_uthmani: 'بِسْمِ اللَّهِ' }
    ]);

    const { rerender } = render(
      <MemoryRouter initialEntries={['/surah/2']}>
        <SettingsPanel isOpen={false} onClose={vi.fn()} />
      </MemoryRouter>
    );

    expect(mockQuranData.fetchSurahVerses).not.toHaveBeenCalled();

    rerender(
      <MemoryRouter initialEntries={['/surah/2']}>
        <SettingsPanel isOpen={true} onClose={vi.fn()} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockQuranData.fetchSurahVerses).toHaveBeenCalledWith(2);
      expect(mockQuranData.fetchSurahVerses).toHaveBeenCalledWith(1);
    });
  });
});
