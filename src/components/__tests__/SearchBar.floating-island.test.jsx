import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import SearchBar from '../SearchBar';

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

      // 3. The top line must display the Arabic words of the ayah
      const arabicWordsEl = screen.getByTestId('scrub-arabic-words');
      expect(arabicWordsEl).toBeInTheDocument();
      expect(arabicWordsEl.textContent).toContain('وَقَالُوا كُونُوا هُودًا أَوْ نَصَارَىٰ تَهْتَدُوا');

      // 4. Translation snippet is rendered in the HUD (in addition to the source ayah node)
      expect(screen.getAllByText(/Be Jews or Christians/i)).toHaveLength(2);

      fireEvent.pointerUp(button, { clientY: 338, pointerId: 1 });
    } finally {
      mockAyahEl.remove();
    }
  });
});
