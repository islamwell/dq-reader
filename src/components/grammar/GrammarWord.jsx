import React, { memo } from 'react';

/**
 * Returns the CSS styling classes for a sub-word segment based on its
 * grammatical category (fil, ism, harf), display mode, and theme.
 */
export const getGrammarSegmentClass = (category, mode, theme = 'light') => {
  if (mode === 'off') {
    return '';
  }

  const isDark = theme === 'dark';
  const isGreen = theme === 'green';

  if (mode === 'underline') {
    switch (category) {
      case 'fil':
        return 'border-b-2 border-amber-500 pb-0.5';
      case 'ism':
        return 'border-b-2 border-blue-500 pb-0.5';
      case 'harf':
        return isGreen ? 'border-b-2 border-teal-400 pb-0.5' : 'border-b-2 border-emerald-500 pb-0.5';
      default:
        return '';
    }
  }

  // mode === 'colored' (Default)
  switch (category) {
    case 'fil':
      // Warm Amber / Burnt Orange
      return isDark
        ? 'text-amber-400 font-semibold'
        : 'text-amber-700 dark:text-amber-400 font-semibold';
    case 'ism':
      // Sapphire / Royal Blue
      return isDark
        ? 'text-sky-300 font-semibold'
        : 'text-blue-700 dark:text-sky-300 font-semibold';
    case 'harf':
      // Forest / Emerald Green (or Teal in green theme)
      if (isGreen) {
        return 'text-teal-700 dark:text-teal-300 font-semibold';
      }
      return isDark
        ? 'text-emerald-400 font-semibold'
        : 'text-emerald-700 dark:text-emerald-400 font-semibold';
    default:
      return '';
  }
};

/**
 * GrammarWord component
 * Renders an Arabic word with sub-word morpheme coloring.
 * Tapping or clicking the word opens the slide-up grammar breakdown sheet.
 */
const GrammarWord = ({
  word,
  grammarMode,
  theme,
  isSelected,
  onSelectWord
}) => {
  if (!word) return null;

  const handleClick = (e) => {
    e.stopPropagation();
    onSelectWord?.(word);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      onSelectWord?.(word);
    }
  };

  // If grammar is turned off, render the plain text smoothly
  if (grammarMode === 'off') {
    return (
      <span
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className="inline-block cursor-pointer px-0.5 rounded hover:bg-slate-200/40 dark:hover:bg-slate-700/40 transition-colors"
        title={word.translation ? `${word.translation} (Click for grammar)` : 'Click for grammar'}
      >
        {word.text_uthmani}
      </span>
    );
  }

  const segments = word.segments && word.segments.length > 0
    ? word.segments
    : [{ text: word.text_uthmani, category: word.primary_category || 'ism' }];

  return (
    <span
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-haspopup="dialog"
      aria-label={`${word.text_uthmani}: ${word.translation || ''}`}
      className={`grammar-word-pill inline-block cursor-pointer px-1 py-0.5 rounded-lg transition-all duration-150 mx-0.5 select-none ${
        isSelected
          ? 'ring-2 ring-amber-400 bg-amber-100/70 dark:bg-amber-950/60 shadow-sm scale-[1.02]'
          : 'hover:bg-slate-200/60 dark:hover:bg-slate-800/70 hover:shadow-xs'
      }`}
      title={word.translation ? `${word.translation} • Click for grammar` : 'Click for grammar'}
    >
      {/* Notice: No whitespace between spans so Arabic letters join cursively */}
      {segments.map((seg, idx) => (
        <span
          key={idx}
          className={`grammar-seg transition-colors duration-200 ${getGrammarSegmentClass(
            seg.category,
            grammarMode,
            theme
          )}`}
        >{seg.text}</span>
      ))}
    </span>
  );
};

export default memo(GrammarWord);
