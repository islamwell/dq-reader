import React, { memo } from 'react';
import {
  getSegmentBarClass,
  resolveSurah100Shade
} from './sarfStyles';

/**
 * Returns the CSS styling classes for a sub-word segment based on its
 * grammatical category (fil, ism, harf), display mode, theme, and optional
 * v3 shaded palette ('surah_100').
 */
export const getGrammarSegmentClass = (
  category,
  mode,
  theme = 'light',
  segment = null,
  palette = 'default',
  pulsePaused = false
) => {
  if (mode === 'off') {
    return '';
  }

  const isDark = theme === 'dark';
  const isGreen = theme === 'green';
  const resolvedPalette = segment?.color_palette || palette;

  if (resolvedPalette === 'surah_100') {
    const shade = resolveSurah100Shade(category, segment || {});
    const isEmphasisHarf =
      category === 'harf' && Boolean(segment?.emphasis || segment?.subclass === 'emphasis');
    const pulseClass = isEmphasisHarf
      ? ` harf-emphasis-pulse${pulsePaused ? ' harf-emphasis-paused' : ''}`
      : '';

    if (mode === 'underline') {
      const darkText = isDark ? ' text-slate-100' : '';
      return `${shade.underline}${darkText}${pulseClass}`;
    }

    return `${isDark ? shade.darkText : shade.lightText}${pulseClass}`;
  }

  if (resolvedPalette === 'surah_103') {
    const isEmphasisHarf =
      category === 'harf' && Boolean(segment?.emphasis || segment?.subclass === 'emphasis');
    const emphasisClass = isEmphasisHarf
      ? ` harf-emphasis-red-glow${pulsePaused ? ' harf-emphasis-paused' : ''}`
      : '';

    if (mode === 'underline') {
      const darkText = isDark ? ' text-slate-100' : '';
      switch (category) {
        case 'fil':
          return `border-b-2 border-emerald-500 pb-0.5${darkText}`;
        case 'ism':
          return `border-b-2 border-red-500 pb-0.5${darkText}`;
        case 'harf':
          return `border-b-2 border-yellow-500 pb-0.5${darkText}${emphasisClass}`;
        default:
          return '';
      }
    }

    switch (category) {
      case 'fil':
        return isDark ? 'text-emerald-400 font-semibold' : 'text-emerald-700 font-semibold';
      case 'ism':
        return isDark ? 'text-red-400 font-semibold' : 'text-red-600 font-semibold';
      case 'harf':
        return `${isDark ? 'text-yellow-300 font-semibold' : 'text-yellow-600 font-semibold'}${emphasisClass}`;
      default:
        return '';
    }
  }

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

  // mode === 'colored' (Classic v1/v2 default)
  switch (category) {
    case 'fil':
      return isDark
        ? 'text-amber-300 font-semibold'
        : 'text-amber-700 font-semibold';
    case 'ism':
      return isDark
        ? 'text-sky-300 font-semibold'
        : 'text-blue-700 font-semibold';
    case 'harf':
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
 * Simple, easy-to-read part-of-speech label for cards & detail modals.
 */
export const getSimplePartOfSpeech = (word) => {
  if (!word) return '';
  if (word.primary_category === 'ism') {
    if (word.subclass === 'plural' || word.sarf?.noun?.singular_ar) return 'Ism · Plural';
    if (word.subclass === 'pronoun') return 'Ism · Pronoun';
    return 'Ism';
  }
  if (word.primary_category === 'fil') {
    if (word.tense === 'present') return 'Verb · Present';
    if (word.tense === 'future') return 'Verb · Future';
    if (word.voice === 'passive') return 'Verb · Past Passive';
    return 'Verb · Past';
  }
  if (word.has_emphasis || word.subclass === 'emphasis') {
    return 'Harf · Emphasis';
  }
  return 'Harf';
};

/**
 * Renders the colour-coded segments of a word.
 * Notice: no whitespace between spans so Arabic letters join cursively.
 */
const SegmentedText = ({ segments, grammarMode, theme, palette, pulsePaused }) => (
  <>
    {segments.map((seg, idx) => (
      <span
        key={idx}
        data-emphasis={seg.emphasis ? 'true' : undefined}
        className={`grammar-seg transition-colors duration-200 ${getGrammarSegmentClass(
          seg.category,
          grammarMode,
          theme,
          seg,
          palette,
          pulsePaused
        )}`}
      >{seg.text}</span>
    ))}
  </>
);

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
  hasActiveWord = false,
  onSelectWord,
  interlinear = false,
  colorPalette = 'default',
  pulsePaused = false,
  isIdafaActive = false,
  onHoverIdafaPair
}) => {
  if (!word) return null;

  const palette = word.color_palette || colorPalette;
  const idafa = word.idafa || null;

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

  const handleMouseEnter = () => {
    if (idafa?.pair_id && onHoverIdafaPair) {
      onHoverIdafaPair(idafa.pair_id);
    }
  };

  const handleMouseLeave = () => {
    if (idafa?.pair_id && onHoverIdafaPair) {
      onHoverIdafaPair(null);
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
    const isSurah100 = palette === 'surah_100';
    const partOfSpeechLabel = getSimplePartOfSpeech(word);

    const hasEmphasisSegment = Boolean(
      word.has_emphasis || segments.some((s) => s.emphasis || s.subclass === 'emphasis')
    );

    const cardBorderState = isSelected
      ? darkCard
        ? 'scale-105 -translate-y-0.5 ring-2 ring-amber-400 border-amber-500/70 bg-amber-950/60 shadow-md'
        : 'scale-105 -translate-y-0.5 ring-2 ring-amber-400 border-amber-300 bg-amber-100/70 shadow-md'
      : isIdafaActive
        ? darkCard
          ? 'ring-2 ring-amber-400/80 border-amber-500/80 bg-amber-950/40 shadow-sm'
          : 'ring-2 ring-amber-400 border-amber-400 bg-amber-50/90 shadow-sm'
        : idafa
          ? darkCard
            ? 'border-amber-500/50 bg-amber-950/20 hover:border-amber-400 hover:bg-amber-950/35'
            : 'border-amber-300/90 bg-amber-50/45 hover:border-amber-400 hover:bg-amber-50/80 hover:shadow-sm'
          : darkCard
            ? 'border-transparent hover:border-slate-600 hover:bg-slate-800/60'
            : 'border-transparent hover:border-slate-200 hover:bg-white/75 hover:shadow-sm';

    const cardDimState = !isSelected && !isIdafaActive && hasActiveWord
      ? 'opacity-40 hover:opacity-85'
      : '';

    return (
      <span
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleMouseEnter}
        onBlur={handleMouseLeave}
        aria-haspopup="dialog"
        aria-label={`${word.text_uthmani}: ${word.translation || ''}`}
        data-testid="interlinear-word"
        data-active-word={isSelected ? 'true' : undefined}
        data-idafa-pair={idafa?.pair_id || undefined}
        className={`grammar-word-card group inline-flex flex-col items-center cursor-pointer select-none rounded-2xl px-2.5 pt-1 pb-2 transition-all duration-300 ease-out border [text-shadow:none] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 ${cardBorderState} ${cardDimState}`}
        title={word.translation ? `${word.translation} • Click for grammar details` : 'Click for grammar'}
      >
        {/* Clean English badges for Iḍāfa, Passive Voice, or Emphasis */}
        {(idafa || word.voice === 'passive' || (isSurah100 && hasEmphasisSegment)) && (
          <span dir="ltr" className="flex flex-wrap items-center justify-center gap-1 mb-0.5">
            {idafa && (
              <span
                data-testid="idafa-word-badge"
                className={`english-text text-[10px] font-bold leading-none px-1.5 py-0.5 rounded-full border ${
                  darkCard
                    ? 'bg-amber-900/70 text-amber-200 border-amber-500/70'
                    : 'bg-amber-100 text-amber-900 border-amber-400'
                }`}
              >
                🔗 {idafa.label_en}
              </span>
            )}
            {word.voice === 'passive' && (
              <span
                className={`english-text text-[10px] font-bold leading-none px-1.5 py-0.5 rounded-full border ${
                  darkCard
                    ? 'bg-emerald-950/80 text-emerald-200 border-emerald-600'
                    : 'bg-emerald-100 text-emerald-900 border-emerald-400'
                }`}
              >
                Passive
              </span>
            )}
            {isSurah100 && hasEmphasisSegment && (
              <span
                data-testid="emphasis-word-badge"
                className={`english-text text-[10px] font-bold leading-none px-1.5 py-0.5 rounded-full border ${
                  darkCard
                    ? 'bg-indigo-950/85 text-blue-200 border-indigo-500'
                    : 'bg-indigo-100 text-indigo-900 border-indigo-300'
                }`}
              >
                ✦ Emphasis
              </span>
            )}
          </span>
        )}

        <span
          data-arabic-word="true"
          className={`leading-[1.9] transition-all duration-300 ${
            darkCard ? 'text-slate-100' : 'text-slate-900'
          } ${
            isSelected
              ? '[text-shadow:0_0_22px_currentColor]'
              : ''
          }`}
        >
          <SegmentedText
            segments={segments}
            grammarMode={grammarMode}
            theme={theme}
            palette={palette}
            pulsePaused={pulsePaused}
          />
        </span>

        {/* Segment category bar: one coloured pill per morpheme (RTL order) */}
        <span className="flex flex-row-reverse w-full gap-0.5 px-1 mt-0" aria-hidden="true">
          {segments.map((seg, idx) => (
            <span
              key={idx}
              className={`h-1 rounded-full ${getSegmentBarClass(seg, palette)} ${
                seg.role === 'stem' ? 'flex-[3]' : 'flex-1 opacity-75'
              }`}
            />
          ))}
        </span>

        {/* Clean Part of Speech (replaces Arabic wazn like فَعْل) */}
        {partOfSpeechLabel && (
          <span
            dir="ltr"
            className={`english-text text-[10px] font-semibold uppercase tracking-wide leading-tight mt-1.5 ${
              darkCard ? 'text-slate-300' : 'text-slate-500'
            }`}
          >
            {partOfSpeechLabel}
          </span>
        )}

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
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-haspopup="dialog"
      aria-label={`${word.text_uthmani}: ${word.translation || ''}`}
      data-arabic-word="true"
      data-active-word={isSelected ? 'true' : undefined}
      className={`grammar-word-pill inline-block cursor-pointer px-1 py-0.5 rounded-lg transition-all duration-300 ease-out mx-0.5 select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 ${
        isSelected
          ? `scale-110 -translate-y-0.5 [text-shadow:0_0_22px_currentColor] ${
              darkCard ? 'ring-2 ring-amber-400 bg-amber-950/60 shadow-sm' : 'ring-2 ring-amber-400 bg-amber-100/70 shadow-sm'
            }`
          : hasActiveWord
            ? 'opacity-40 hover:opacity-80'
            : idafa
              ? darkCard
                ? 'border-b border-dashed border-amber-400/70 hover:bg-slate-800/70'
                : 'border-b border-dashed border-amber-500/80 hover:bg-amber-50/70'
              : darkCard
                ? 'hover:bg-slate-800/70 hover:shadow-xs'
                : 'hover:bg-slate-200/60 hover:shadow-xs'
      }`}
      title={word.translation ? `${word.translation} • Click for grammar` : 'Click for grammar'}
    >
      <SegmentedText
        segments={segments}
        grammarMode={grammarMode}
        theme={theme}
        palette={palette}
        pulsePaused={pulsePaused}
      />
    </span>
  );
};

export default memo(GrammarWord);
