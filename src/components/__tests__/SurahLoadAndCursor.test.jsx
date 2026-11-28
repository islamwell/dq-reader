import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Surah from '../../pages/Surah';

const surah103 = JSON.parse(
  fs.readFileSync(path.resolve(process.cwd(), 'public/data/grammar/surah_103.json'), 'utf8')
);

let mockQuranData;
let mockQuranAudio;

vi.mock('../../contexts/QuranContext', () => ({
  useQuranData: () => mockQuranData,
  useQuranAudio: () => mockQuranAudio
}));

describe('Surah initial grammar loading and single data-ayah node', () => {
  beforeEach(() => {
    mockQuranAudio = {
      playingAyah: null,
      isPaused: false,
      playAudio: vi.fn(),
      pauseAudio: vi.fn(),
      resumeAudio: vi.fn(),
      stopAudio: vi.fn()
    };
  });

  it('waits for fetchSurahGrammar alongside fetchSurahVerses on Surah 103 so words are immediately interactive with cursor-pointer and single data-ayah per verse', async () => {
    let resolveGrammar;
    const grammarPromise = new Promise((resolve) => {
      resolveGrammar = resolve;
    });

    const verses = [
      {
        verse_number: 1,
        verse_key: '103:1',
        text_uthmani: 'وَٱلْعَصْرِ',
        translations: [{ text: 'By time,', language: 'English' }]
      },
      {
        verse_number: 2,
        verse_key: '103:2',
        text_uthmani: 'إِنَّ ٱلْإِنسَـٰنَ لَفِى خُسْرٍ',
        translations: [{ text: 'Indeed, mankind is in loss,', language: 'English' }]
      },
      {
        verse_number: 3,
        verse_key: '103:3',
        text_uthmani: 'إِلَّا ٱلَّذِينَ ءَامَنُوا۟ وَعَمِلُوا۟ ٱلصَّـٰلِحَـٰتِ وَتَوَاصَوْا۟ بِٱلْحَقِّ وَتَوَاصَوْا۟ بِٱلصَّبْرِ',
        translations: [{ text: 'Except for those who have believed...', language: 'English' }]
      }
    ];

    const addVisitedAyah = vi.fn();

    mockQuranData = {
      surahs: [
        {
          id: 103,
          name_simple: 'Al-Asr',
          name_arabic: 'العصر',
          translated_name: { name: 'The Declining Day' },
          revelation_place: 'makkah',
          verses_count: 3
        }
      ],
      fetchSurahVerses: vi.fn().mockResolvedValue(verses),
      fetchSurahGrammar: vi.fn().mockImplementation(() => grammarPromise),
      setCurrentSurah: vi.fn(),
      theme: 'light',
      addVisitedAyah,
      bookmarks: [],
      toggleBookmark: vi.fn(),
      getAudioUrl: vi.fn(),
      getSupplementalAudioUrl: vi.fn(),
      getTafseer: vi.fn(),
      getVideoForAyah: vi.fn(),
      floatingVideo: null,
      showFloatingVideo: vi.fn(),
      hideFloatingVideo: vi.fn(),
      grammarData: {},
      grammarMode: 'colored',
      setGrammarMode: vi.fn(),
      toggleGrammarMode: vi.fn(),
      selectedGrammarWord: null,
      setSelectedGrammarWord: vi.fn(),
      showInterlinear: true,
      setShowInterlinear: vi.fn(),
      emphasisPulsePaused: false
    };

    const { rerender } = render(
      <MemoryRouter initialEntries={['/surah/103']}>
        <Routes>
          <Route path="/surah/:surahNumber" element={<Surah />} />
        </Routes>
      </MemoryRouter>
    );

    // Verses resolved, but grammar is still in-flight: Surah should still show skeleton,
    // NOT unclickable plain Arabic words without cursor-pointer.
    await act(async () => {
      await Promise.resolve();
    });
    expect(screen.queryByRole('button', { name: /وَٱلْعَصْرِ/ })).not.toBeInTheDocument();
    expect(document.querySelectorAll('[data-ayah]')).toHaveLength(0);

    // Resolve grammar (mirroring QuranContext setting grammarData[103] before promise resolves)
    await act(async () => {
      mockQuranData = {
        ...mockQuranData,
        grammarData: { 103: surah103 }
      };
      resolveGrammar(surah103);
      await grammarPromise;
    });

    rerender(
      <MemoryRouter initialEntries={['/surah/103']}>
        <Routes>
          <Route path="/surah/:surahNumber" element={<Surah />} />
        </Routes>
      </MemoryRouter>
    );

    const firstWordButton = screen.getByRole('button', { name: /وَٱلْعَصْرِ/ });
    expect(firstWordButton).toBeInTheDocument();
    expect(firstWordButton.className).toContain('cursor-pointer');

    // Only one [data-ayah] element per verse (no duplicate wrapper attribute)
    expect(document.querySelectorAll('[data-ayah]')).toHaveLength(3);
    expect(document.querySelectorAll('[data-ayah="1"]')).toHaveLength(1);
  });
});
