import React, { memo } from 'react';
import { CATEGORY_LABELS } from './sarfStyles';

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
    const darkText = isDark ? ' text-slate-100' : '';
    switch (category) {
      case 'fil':
        return `border-b-2 border-amber-500 pb-0.5${darkText}`;
      case 'ism':
        return `border-b-2 border-blue-500 pb-0.5${darkText}`;
      case 'harf':
        return `${isGreen ? 'border-b-2 border-teal-400 pb-0.5' : 'border-b-2 border-emerald-500 pb-0.5'}${darkText}`;
      default:
        return '';
    }
  }

  // mode === 'colored' (Default)
  switch (category) {
    case 'fil':
      // Warm Amber / Burnt Orange
      return isDark
        ? 'text-amber-300 font-semibold'
        : 'text-amber-700 font-semibold';
    case 'ism':
      // Sapphire / Royal Blue
      return isDark
        ? 'text-sky-300 font-semibold'
        : 'text-blue-700 font-semibold';
    case 'harf':
      // Forest / Emerald Green (or Teal in green theme)
      if (isGreen) {
        return 'text-teal-700 font-semibold';
      }
      return isDark
        ? 'text-emerald-300 font-semibold'
        : 'text-emerald-700 font-semibold';
    default:
      return '';
  }
};

/**
 * Renders the colour-coded segments of a word.
 * Notice: no whitespace between spans so Arabic letters join cursively.
 */
const SegmentedText = ({ segments, grammarMode, theme }) => (
  <>
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
  </>
);

/**
 * GrammarWord component
 * Renders an Arabic word with sub-word morpheme coloring.
 * Tapping or clicking the word opens the slide-up grammar breakdown sheet.
 *
 * When `interlinear` is true (enhanced sarf data, e.g. Surah 103), the word is
 * rendered as a stacked study card: Arabic word, a segmented category bar,
 * its morphological pattern (wazn) and an English gloss.
 */
const GrammarWord = ({
  word,
  grammarMode,
  theme,
  isSelected,
  onSelectWord,
  interlinear = false
}) => {
  if (!word) return null;

  const handleClick = (e) => {
    e.stopPropagation();
    onSelectWord?.(word);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      onSelectWord?.(word);
    } else if (e.key === ' ') {
      e.preventDefault();
    }
  };

  const handleKeyUp = (e) => {
    if (e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      onSelectWord?.(word);
    }
  };

  const darkCard = theme === 'dark';

  // If grammar is turned off, render the plain text smoothly
  if (grammarMode === 'off') {
    return (
      <span
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        className={`inline-block cursor-pointer px-0.5 rounded transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 ${
          darkCard ? 'hover:bg-slate-700/50' : 'hover:bg-slate-200/40'
        }`}
        title={word.translation ? `${word.translation} (Click for grammar)` : 'Click for grammar'}
      >
        {word.text_uthmani}
      </span>
    );
  }

  const segments = word.segments && word.segments.length > 0
    ? word.segments
    : [{ text: word.text_uthmani, category: word.primary_category || 'ism' }];

  if (interlinear) {
    const subLabel = word.sarf?.wazn
      ? word.sarf.wazn
      : (CATEGORY_LABELS[word.primary_category]?.ar || '');

    return (
      <span
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        aria-haspopup="dialog"
        aria-label={`${word.text_uthmani}: ${word.translation || ''}`}
        data-testid="interlinear-word"
        className={`grammar-word-card group inline-flex flex-col items-center cursor-pointer select-none rounded-2xl px-2.5 pt-1 pb-2 transition-all duration-150 border [text-shadow:none] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 ${
          isSelected
            ? darkCard
              ? 'ring-2 ring-amber-400 border-amber-500/70 bg-amber-950/60 shadow-md -translate-y-0.5'
              : 'ring-2 ring-amber-400 border-amber-300 bg-amber-100/70 shadow-md -translate-y-0.5'
            : darkCard
              ? 'border-transparent hover:border-slate-600 hover:bg-slate-800/60'
              : 'border-transparent hover:border-slate-200 hover:bg-white/75 hover:shadow-sm'
        }`}
        title={word.translation ? `${word.translation} • Click for ṣarf & iʿrāb` : 'Click for grammar'}
      >
        <span className={`leading-[1.9] ${darkCard ? 'text-slate-100' : 'text-slate-900'}`}>
          <SegmentedText segments={segments} grammarMode={grammarMode} theme={theme} />
        </span>

        {/* Segment category bar: one coloured pill per morpheme (RTL order) */}
        <span className="flex flex-row-reverse w-full gap-0.5 px-1 mt-0" aria-hidden="true">
          {segments.map((seg, idx) => (
            <span
              key={idx}
              className={`h-1 rounded-full ${CATEGORY_LABELS[seg.category]?.bar || 'bg-slate-300'} ${
                seg.role === 'stem' ? 'flex-[3]' : 'flex-1 opacity-75'
              }`}
            />
          ))}
        </span>

        {/* Wazn (pattern) or category label */}
        <span
          dir="rtl"
          className={`font-arabic text-base font-semibold leading-tight mt-1.5 ${
            word.sarf
              ? (darkCard ? 'text-amber-300' : 'text-amber-800')
              : (darkCard ? 'text-slate-400' : 'text-slate-600')
          }`}
        >
          {subLabel}
        </span>

        {/* English gloss */}
        <span
          dir="ltr"
          className={`english-text text-[11px] leading-tight max-w-[9rem] text-center mt-0.5 font-normal whitespace-normal ${
            darkCard ? 'text-slate-300' : 'text-slate-600'
          }`}
        >
          {word.translation}
        </span>
      </span>
    );
  }

  return (
    <span
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      aria-haspopup="dialog"
      aria-label={`${word.text_uthmani}: ${word.translation || ''}`}
      className={`grammar-word-pill inline-block cursor-pointer px-1 py-0.5 rounded-lg transition-all duration-150 mx-0.5 select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 ${
        isSelected
          ? darkCard
            ? 'ring-2 ring-amber-400 bg-amber-950/60 shadow-sm scale-[1.02]'
            : 'ring-2 ring-amber-400 bg-amber-100/70 shadow-sm scale-[1.02]'
          : darkCard
            ? 'hover:bg-slate-800/70 hover:shadow-xs'
            : 'hover:bg-slate-200/60 hover:shadow-xs'
      }`}
      title={word.translation ? `${word.translation} • Click for grammar` : 'Click for grammar'}
    >
      <SegmentedText segments={segments} grammarMode={grammarMode} theme={theme} />
    </span>
  );
};

export default memo(GrammarWord);
