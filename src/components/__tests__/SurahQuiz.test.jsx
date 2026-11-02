import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SurahQuiz from '../quiz/SurahQuiz';
import { SURAH_32_QUIZ } from '../../data/quizzes/surah32Quiz';

// Mock Quran Context
vi.mock('../../contexts/QuranContext', () => ({
  useQuranData: () => ({
    theme: 'light'
  })
}));

describe('Surah 32 Contemplative Quiz', () => {
  it('contains exactly 10 thought-provoking questions with deep reflections', () => {
    expect(SURAH_32_QUIZ.questions).toHaveLength(10);

    // Verify none of the questions or reflections mention any prohibited speaker names
    SURAH_32_QUIZ.questions.forEach((q) => {
      const allText = `${q.prompt} ${q.deepReflection} ${q.options.map((o) => o.text).join(' ')}`;
      expect(allText.toLowerCase()).not.toContain('nouman');
      expect(allText.toLowerCase()).not.toContain('ali khan');
    });
  });

  it('renders the quiz header, progress, and first question', () => {
    render(<SurahQuiz surahNumber={32} />);

    expect(screen.getByText(/Contemplative Study: Surah As-Sajdah/i)).toBeInTheDocument();
    expect(screen.getByText(/Question 1 of 10/i)).toBeInTheDocument();
    expect(screen.getByText(/Ayahs 7–9/i)).toBeInTheDocument();
  });

  it('reveals deep linguistic reflection when an option is selected', () => {
    render(<SurahQuiz surahNumber={32} />);

    // Before selection, reflection heading is not present
    expect(screen.queryByText(/Deep Linguistic & Psychological Insight/i)).not.toBeInTheDocument();

    // Select Option A
    const optionA = screen.getByText(/transforms the description of human creation/i);
    fireEvent.click(optionA);

    // After selection, the deep reflection accordion appears
    expect(screen.getByText(/Deep Linguistic & Psychological Insight/i)).toBeInTheDocument();
    expect(screen.getByText(/In classical Arabic rhetoric, this technique is known as Iltifāt/i)).toBeInTheDocument();
  });

  it('navigates to next question when clicking Next Question', async () => {
    render(<SurahQuiz surahNumber={32} />);

    const nextBtn = screen.getByText(/Next Question/i);
    fireEvent.click(nextBtn);

    expect(screen.getByText(/Question 2 of 10/i)).toBeInTheDocument();
    expect(await screen.findByText(/The Real Motive Behind Skepticism/i)).toBeInTheDocument();
  });

  it('does not render for a surah with no quiz data', () => {
    const { container } = render(<SurahQuiz surahNumber={1} />);
    expect(container.firstChild).toBeNull();
  });
});
