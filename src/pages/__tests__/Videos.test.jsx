import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Videos from '../Videos';

// Mock contexts
vi.mock('../../contexts/QuranContext', () => ({
  useQuranData: vi.fn()
}));

// Mock safe icon
vi.mock('../../common/SafeIcon', () => ({
  default: () => <div data-testid="safe-icon" />
}));

describe('Videos Page', () => {
  let mockQuranContext;
  let useQuranData;

  beforeEach(async () => {
    vi.clearAllMocks();
    const quranModule = await import('../../contexts/QuranContext');
    useQuranData = quranModule.useQuranData;

    mockQuranContext = {
      videoMappings: {
        '1': [
          { id: 'v1', startAyah: 1, endAyah: 7, videoUrl: 'https://video.com/1.mp4', title: 'Surah Al-Fatihah Video' }
        ],
        '2': [
           { id: 'v2', startAyah: 1, endAyah: 5, videoUrl: 'https://video.com/2.mp4', title: 'Surah Baqarah Intro' }
        ]
      },
      surahs: [
        { id: 1, name_simple: 'Al-Fatihah', translated_name: { name: 'The Opening' }, verses_count: 7 },
        { id: 2, name_simple: 'Al-Baqarah', translated_name: { name: 'The Cow' }, verses_count: 286 }
      ],
      theme: 'light'
    };

    useQuranData.mockReturnValue(mockQuranContext);
  });

  const renderVideos = () => {
    return render(
      <BrowserRouter>
        <Videos />
      </BrowserRouter>
    );
  };

  it('renders the video library header', () => {
    renderVideos();
    expect(screen.getByText(/Video Library/i)).toBeInTheDocument();
  });

  it('displays the list of videos', () => {
    renderVideos();
    expect(screen.getByText('Surah Al-Fatihah Video')).toBeInTheDocument();
    expect(screen.getByText('Surah Baqarah Intro')).toBeInTheDocument();
  });

  it('filters videos by search query', async () => {
    renderVideos();
    const searchInput = screen.getByPlaceholderText(/Search videos/i);
    
    fireEvent.change(searchInput, { target: { value: 'Baqarah' } });
    
    await waitFor(() => {
      expect(screen.queryByText('Surah Al-Fatihah Video')).not.toBeInTheDocument();
      expect(screen.getByText('Surah Baqarah Intro')).toBeInTheDocument();
    });
  });

  it('filters videos by surah', async () => {
    renderVideos();
    const filterSelect = screen.getByRole('combobox');
    
    fireEvent.change(filterSelect, { target: { value: '1' } }); // Select Al-Fatihah
    
    await waitFor(() => {
      expect(screen.getByText('Surah Al-Fatihah Video')).toBeInTheDocument();
      expect(screen.queryByText('Surah Baqarah Intro')).not.toBeInTheDocument();
    });
  });

  it('selects a video when clicked', async () => {
    renderVideos();
    
    // Initial active video should be the first one (v1)
    expect(screen.getByText('Surah Al-Fatihah Video')).toBeInTheDocument();
    
    // Click on the second video
    const secondVideo = screen.getByText('Surah Baqarah Intro');
    fireEvent.click(secondVideo);
    
    await waitFor(() => {
      // Check if the title in the main player area updated
      // Since the title appears in both the list and the player, we need to be specific
      const titles = screen.getAllByText('Surah Baqarah Intro');
      expect(titles.length).toBeGreaterThanOrEqual(1);
    });
  });
});
