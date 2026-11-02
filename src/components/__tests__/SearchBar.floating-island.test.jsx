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
});
