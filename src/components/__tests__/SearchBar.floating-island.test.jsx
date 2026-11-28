import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import SearchBar from '../SearchBar';
import { getSurahInfo } from '../../data/quran-data.js';

const LocationDisplay = () => {
  const location = useLocation();
  return <div data-testid="current-location">{`${location.pathname}${location.search}`}</div>;
};

let searchQuranMock;
let surahsMock;

vi.mock('../../contexts/QuranContext', () => ({
  useQuranData: () => ({
    searchQuran: searchQuranMock,
    surahs: surahsMock,
  }),
}));

describe('SearchBar floating island behaviour', () => {
  beforeEach(() => {
    searchQuranMock = vi.fn().mockResolvedValue([]);
    surahsMock = [
      { id: 1, name_simple: 'Al-Fatihah', name_arabic: 'الفاتحة', verses_count: 7 },
      { id: 2, name_simple: 'Al-Baqarah', name_arabic: 'البقرة', verses_count: 286 },
    ];
  });

  it('renders a floating island trigger by default', () => {
    const { container } = render(
      <MemoryRouter>
        <SearchBar />
      </MemoryRouter>
    );

    const root = container.firstChild;
    expect(root).toHaveClass('fixed');
    expect(root).toHaveClass('pointer-events-none');

    expect(screen.getByRole('button', { name: /open search/i })).toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: /search quran/i })).not.toBeInTheDocument();
  });

  it('expands to a half-width panel when activated', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <MemoryRouter>
        <SearchBar />
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: /open search/i }));

    const input = await screen.findByRole('textbox', { name: /search quran/i });
    expect(input).toBeVisible();
    expect(screen.queryByRole('button', { name: /open search/i })).not.toBeInTheDocument();

    const innerContainer = container.querySelector('[class*="md:w-1/2"]');
    expect(innerContainer).not.toBeNull();
  });

  it('scrubs through ayahs and fades in large ayah counter when dragging on a surah page', () => {
    Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true, writable: true });

    render(
      <MemoryRouter initialEntries={['/surah/2']}>
        <SearchBar />
      </MemoryRouter>
    );

    const button = screen.getByRole('button', { name: /open search or drag to scrub ayahs/i });
    expect(button).toBeInTheDocument();

    // Start dragging from top (clientY: 24) down to middle of screen (clientY: 360)
    fireEvent.pointerDown(button, { clientY: 24, pointerId: 1, button: 0 });
    fireEvent.pointerMove(button, { clientY: 360, pointerId: 1 });

    const ayahHudNumber = screen.getByTestId('scrub-ayah-number');
    expect(Number(ayahHudNumber.textContent)).toBeGreaterThan(100);
    expect(Number(ayahHudNumber.textContent)).toBeLessThan(200);

    // Release drag and simulate browser click that follows pointerUp
    fireEvent.pointerUp(button, { clientY: 360, pointerId: 1 });
    fireEvent.click(button);

    // Search input should NOT have opened after a drag-scrub gesture
    expect(screen.queryByRole('textbox', { name: /search quran/i })).not.toBeInTheDocument();
  });

  it('displays arabic words of the ayah on top line, omits surah name and omits the word Ayah in the HUD', () => {
    Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true, writable: true });

    // Inject mock DOM node representing the ayah in the Quran reader view
    const mockAyahEl = document.createElement('div');
    mockAyahEl.setAttribute('data-ayah', '135');
    mockAyahEl.innerHTML = `
      <div class="quran-text-pak">وَقَالُوا كُونُوا هُودًا أَوْ نَصَارَىٰ تَهْتَدُوا</div>
      <p>They say, "Be Jews or Christians, and then you will be rightly guided."</p>
    `;
    document.body.appendChild(mockAyahEl);

    try {
      render(
        <MemoryRouter initialEntries={['/surah/2']}>
          <SearchBar />
        </MemoryRouter>
      );

      const button = screen.getByRole('button', { name: /open search or drag to scrub ayahs/i });

      // Start drag and calculate pointer to hit ayah 135:
      // (clientY - 24) / (800 - 108 - 24) = 134 / 285 => clientY = 24 + 668 * (134/285) ~= 338
      fireEvent.pointerDown(button, { clientY: 24, pointerId: 1, button: 0 });
      fireEvent.pointerMove(button, { clientY: 338, pointerId: 1 });

      const ayahHudNumber = screen.getByTestId('scrub-ayah-number');
      expect(ayahHudNumber.textContent).toBe('135');

      // 1. The word "Ayah" must NOT be in the HUD
      expect(screen.queryByText(/^Ayah$/i)).not.toBeInTheDocument();

      // 2. Surah name in English or Arabic must NOT be in the top first line of HUD
      expect(screen.queryByText('Al-Baqarah')).not.toBeInTheDocument();
      expect(screen.queryByText('البقرة')).not.toBeInTheDocument();

      // 3. The top line must display the first 5 Arabic words of the ayah
      const arabicWordsEl = screen.getByTestId('scrub-arabic-words');
      expect(arabicWordsEl).toBeInTheDocument();
      expect(arabicWordsEl.textContent).toBe('وَقَالُوا كُونُوا هُودًا أَوْ نَصَارَىٰ …');

      // 4. Single-line translation snippet is rendered in the HUD (in addition to the source ayah node)
      expect(screen.getAllByText(/Be Jews or Christians/i)).toHaveLength(2);
      const translationEl = screen.getByTestId('scrub-translation');
      expect(translationEl.className).toContain('truncate');
      expect(translationEl.className).not.toContain('line-clamp-2');

      fireEvent.pointerUp(button, { clientY: 338, pointerId: 1 });
    } finally {
      mockAyahEl.remove();
    }
  });

  it('navigates immediately to the beginning of Juz 4 when typing "juz 4" and pressing Enter', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/']}>
        <SearchBar />
        <LocationDisplay />
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: /open search/i }));
    const input = await screen.findByRole('textbox', { name: /search quran/i });

    await user.type(input, 'juz 4{Enter}');
    expect(screen.getByTestId('current-location').textContent).toBe('/surah/3?ayah=93');
  });

  it('renders a Juz result card and navigates to its start ayah when clicked', async () => {
    searchQuranMock.mockResolvedValue([
      {
        type: 'juz',
        id: 'juz-30',
        juzNumber: 30,
        surahNumber: 78,
        ayahNumber: 1,
        surahName: 'An-Naba',
        surahEnglishName: 'The Tidings',
        snippet: 'عَمَّ يَتَسَآءَلُونَ'
      }
    ]);

    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/']}>
        <SearchBar />
        <LocationDisplay />
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: /open search/i }));
    const input = await screen.findByRole('textbox', { name: /search quran/i });
    await user.type(input, 'juz 30');

    const juzResult = await screen.findByText(/Juz 30 • Starts at 78:1/i);
    expect(juzResult).toBeInTheDocument();

    await user.click(juzResult);
    expect(screen.getByTestId('current-location').textContent).toBe('/surah/78?ayah=1');
  });

  it('scrubs through Surahs (1-114) on the main page showing first few Arabic words and bottom translation', () => {
    Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true, writable: true });

    render(
      <MemoryRouter initialEntries={['/']}>
        <SearchBar />
        <LocationDisplay />
      </MemoryRouter>
    );

    const button = screen.getByRole('button', { name: /open search or drag to scrub surahs and juz/i });
    expect(screen.queryByRole('button', { name: /scrub by surah/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /scrub by juz/i })).not.toBeInTheDocument();

    // Drag down roughly halfway down the screen
    fireEvent.pointerDown(button, { clientY: 24, clientX: 200, pointerId: 1, button: 0 });
    fireEvent.pointerMove(button, { clientY: 358, clientX: 200, pointerId: 1 });

    const numberEl = screen.getByTestId('scrub-ayah-number');
    expect(numberEl.className).toContain('text-emerald-400');
    const scrubbedNumber = Number(numberEl.textContent);
    expect(scrubbedNumber).toBeGreaterThan(40);
    expect(scrubbedNumber).toBeLessThan(80);
    expect(screen.getByTestId('scrub-mode-badge').textContent).toBe(
      getSurahInfo(scrubbedNumber)?.name_simple
    );

    // First few Arabic words displayed on top line
    const arabicWordsEl = screen.getByTestId('scrub-arabic-words');
    expect(arabicWordsEl.textContent.trim().length).toBeGreaterThan(0);

    // Translation displayed at bottom
    const translationEl = screen.getByTestId('scrub-translation');
    expect(translationEl.textContent.trim().length).toBeGreaterThan(5);

    fireEvent.pointerUp(button, { clientY: 358, clientX: 200, pointerId: 1 });
    // Navigates directly to the scrubbed Surah
    expect(screen.getByTestId('current-location').textContent).toBe(`/surah/${scrubbedNumber}`);
  });

  it('switches to Juz mode (1-30) on main page via horizontal slide and navigates to selected Juz start ayah on release', () => {
    Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true, writable: true });

    render(
      <MemoryRouter initialEntries={['/']}>
        <SearchBar />
        <LocationDisplay />
      </MemoryRouter>
    );

    const button = screen.getByRole('button', { name: /open search or drag to scrub surahs and juz/i });

    // Calculate pointerY for Juz 4 out of 30:
    // trackBottom = 800 - 108 = 692, span = 668. progress for Juz 4: (4 - 1) / (30 - 1) = 3/29
    // clientY = 24 + 668 * (3/29) ~= 93.1 -> round(1 + ((93-24)/668)*29) = round(1 + 2.995) = 4
    // Slide right by +50px (deltaX > 36) to switch to Juz mode
    fireEvent.pointerDown(button, { clientY: 24, clientX: 200, pointerId: 1, button: 0 });
    fireEvent.pointerMove(button, { clientY: 93, clientX: 250, pointerId: 1 });

    expect(screen.getByTestId('scrub-mode-badge').textContent).toBe('Juz');
    const numberEl = screen.getByTestId('scrub-ayah-number');
    expect(numberEl.textContent).toBe('4');
    expect(numberEl.className).toContain('text-amber-400');
    expect(numberEl.className).not.toContain('text-emerald-400');
    expect(screen.getByTestId('scrub-translation').textContent).toContain("Juz 4");
    expect(screen.getByTestId('scrub-translation').textContent).toContain("3:93");

    fireEvent.pointerUp(button, { clientY: 93, clientX: 250, pointerId: 1 });
    expect(screen.getByTestId('current-location').textContent).toBe('/surah/3?ayah=93');
  });

  it('truncates long Arabic ayahs to only the first 5 words, ignores grammar text, and enforces single-line translation', () => {
    Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true, writable: true });

    const mockAyahEl = document.createElement('div');
    mockAyahEl.setAttribute('data-ayah', '135');
    mockAyahEl.setAttribute('data-ayah-translation', 'Sample translation at the bottom that stays on a single line even when long');
    mockAyahEl.innerHTML = `
      <div class="quran-text-pak">
        <span class="grammar-word-card">
          <span class="english-text" data-testid="emphasis-word-badge">✦ Emphasis</span>
          <span data-arabic-word="true">كلمة١</span>
          <span class="english-text">ISM</span>
          <span class="english-text">word1</span>
        </span>
        <span class="grammar-word-card"><span data-arabic-word="true">كلمة٢</span><span class="english-text">VERB</span></span>
        <span class="grammar-word-card"><span data-arabic-word="true">كلمة٣</span></span>
        <span class="grammar-word-card"><span data-arabic-word="true">كلمة٤</span></span>
        <span class="grammar-word-card"><span data-arabic-word="true">كلمة٥</span></span>
        <span class="grammar-word-card"><span data-arabic-word="true">كلمة٦</span></span>
        <span class="grammar-word-card"><span data-arabic-word="true">كلمة٧</span></span>
      </div>
      <p>Sample translation at the bottom that stays on a single line even when long</p>
      <p>Tafseer should never be chosen over translation</p>
    `;
    document.body.appendChild(mockAyahEl);

    try {
      render(
        <MemoryRouter initialEntries={['/surah/2']}>
          <SearchBar />
        </MemoryRouter>
      );

      const button = screen.getByRole('button', { name: /open search or drag to scrub ayahs/i });
      fireEvent.pointerDown(button, { clientY: 24, pointerId: 1, button: 0 });
      fireEvent.pointerMove(button, { clientY: 338, pointerId: 1 });

      const arabicWordsEl = screen.getByTestId('scrub-arabic-words');
      expect(arabicWordsEl.textContent).toBe('كلمة١ كلمة٢ كلمة٣ كلمة٤ كلمة٥ …');
      expect(arabicWordsEl.textContent).not.toContain('كلمة٦');
      expect(arabicWordsEl.textContent).not.toContain('ISM');
      expect(arabicWordsEl.textContent).not.toContain('Emphasis');

      const translationEl = screen.getByTestId('scrub-translation');
      expect(translationEl.textContent).toBe('Sample translation at the bottom that stays on a single line even when long');
      expect(translationEl.className).toContain('truncate');

      // Window blur / lost capture / Escape unmounts the HUD immediately so no overlay lingers
      fireEvent(window, new Event('blur'));
      expect(screen.queryByTestId('scrub-hud-overlay')).not.toBeInTheDocument();

      // Re-open scrub via Escape test and verify data-ayah-arabic canonical attribute takes precedence
      mockAyahEl.setAttribute('data-ayah-arabic', 'وَٱلْعَصْرِ إِنَّ ٱلْإِنسَـٰنَ لَفِى خُسْرٍ إِلَّا');
      fireEvent.pointerDown(button, { clientY: 24, pointerId: 2, button: 0 });
      fireEvent.pointerMove(button, { clientY: 338, pointerId: 2 });
      expect(screen.getByTestId('scrub-arabic-words').textContent).toBe(
        'وَٱلْعَصْرِ إِنَّ ٱلْإِنسَـٰنَ لَفِى خُسْرٍ …'
      );
      expect(screen.getByTestId('scrub-arabic-words').textContent).not.toContain('إِلَّا');

      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByTestId('scrub-hud-overlay')).not.toBeInTheDocument();
    } finally {
      mockAyahEl.remove();
    }
  });
});
