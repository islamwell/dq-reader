import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import GrammarWord, { getGrammarSegmentClass } from '../grammar/GrammarWord';
import GrammarBottomSheet from '../grammar/GrammarBottomSheet';

describe('Arabic Grammar Color-Coding and Morphology', () => {
  describe('getGrammarSegmentClass', () => {
    it('returns empty string when grammar mode is off', () => {
      expect(getGrammarSegmentClass('fil', 'off', 'light')).toBe('');
      expect(getGrammarSegmentClass('ism', 'off', 'light')).toBe('');
      expect(getGrammarSegmentClass('harf', 'off', 'light')).toBe('');
    });

    it('returns colored text classes for fil, ism, and harf in colored mode', () => {
      const filClass = getGrammarSegmentClass('fil', 'colored', 'light');
      expect(filClass).toContain('text-amber-700');

      const ismClass = getGrammarSegmentClass('ism', 'colored', 'light');
      expect(ismClass).toContain('text-blue-700');

      const harfClass = getGrammarSegmentClass('harf', 'colored', 'light');
      expect(harfClass).toContain('text-emerald-700');
    });

    it('returns underline border classes when mode is underline', () => {
      const filUnderline = getGrammarSegmentClass('fil', 'underline', 'light');
      expect(filUnderline).toContain('border-b-2 border-amber-500');

      const ismUnderline = getGrammarSegmentClass('ism', 'underline', 'light');
      expect(ismUnderline).toContain('border-b-2 border-blue-500');

      const harfUnderline = getGrammarSegmentClass('harf', 'underline', 'light');
      expect(harfUnderline).toContain('border-b-2 border-emerald-500');
    });
  });

  describe('GrammarWord Component', () => {
    const mockWord = {
      position: 2,
      text_uthmani: 'ٱلْكِتَـٰبِ',
      translation: '(of) the Book',
      primary_category: 'ism',
      segments: [
        { text: 'ٱلْ', category: 'harf', pos_name_en: 'Definite Article' },
        { text: 'كِتَـٰبِ', category: 'ism', pos_name_en: 'Noun' }
      ]
    };

    it('renders sub-word segments separately with proper categories', () => {
      render(
        <GrammarWord
          word={mockWord}
          grammarMode="colored"
          theme="light"
          isSelected={false}
          onSelectWord={vi.fn()}
        />
      );

      expect(screen.getByText('ٱلْ')).toBeInTheDocument();
      expect(screen.getByText('كِتَـٰبِ')).toBeInTheDocument();
    });

    it('triggers onSelectWord callback when clicked', () => {
      const handleSelect = vi.fn();
      render(
        <GrammarWord
          word={mockWord}
          grammarMode="colored"
          theme="light"
          isSelected={false}
          onSelectWord={handleSelect}
        />
      );

      fireEvent.click(screen.getByRole('button'));
      expect(handleSelect).toHaveBeenCalledWith(mockWord);
    });
  });

  describe('GrammarBottomSheet Component', () => {
    const mockSelectedWord = {
      position: 1,
      ayahNumber: 2,
      text_uthmani: 'تَنزِيلُ',
      translation: '(The) revelation',
      transliteration: 'tanzeelu',
      primary_category: 'ism',
      root: 'ن ز ل',
      root_meaning: 'to send down, reveal, descend',
      wazn: 'Form II',
      irab: 'مرفوع (Nominative)',
      segments: [
        {
          text: 'تَنزِيلُ',
          category: 'ism',
          pos_name_ar: 'اسم',
          pos_name_en: 'Noun'
        }
      ]
    };

    it('renders grammar details including root, wazn, irab, and translation', () => {
      render(
        <GrammarBottomSheet
          word={mockSelectedWord}
          theme="light"
          onClose={vi.fn()}
          onNavigateWord={vi.fn()}
          hasPreviousWord={false}
          hasNextWord={true}
        />
      );

      expect(screen.getByText(/revelation/i)).toBeInTheDocument();
      expect(screen.getByText('ن ز ل')).toBeInTheDocument();
      expect(screen.getByText('to send down, reveal, descend')).toBeInTheDocument();
      expect(screen.getByText('Form II')).toBeInTheDocument();
      expect(screen.getByText('مرفوع (Nominative)')).toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', () => {
      const handleClose = vi.fn();
      render(
        <GrammarBottomSheet
          word={mockSelectedWord}
          theme="light"
          onClose={handleClose}
          onNavigateWord={vi.fn()}
          hasPreviousWord={false}
          hasNextWord={true}
        />
      );

      fireEvent.click(screen.getByLabelText('Close grammar panel'));
      expect(handleClose).toHaveBeenCalled();
    });
  });
});
