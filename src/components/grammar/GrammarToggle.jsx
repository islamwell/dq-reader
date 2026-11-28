import React from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import { useQuranData } from '../../contexts/QuranContext';

const { FiSliders, FiLayers } = FiIcons;

const GrammarToggle = ({ className = '', surahNumber = null }) => {
  const {
    grammarMode,
    toggleGrammarMode,
    setGrammarMode,
    theme,
    grammarData,
    showInterlinear,
    setShowInterlinear
  } = useQuranData();

  const isDark = theme === 'dark';
  const resolvedSurah = surahNumber ? Number(surahNumber) : null;
  const surahGrammar = resolvedSurah ? grammarData?.[resolvedSurah] : null;
  const supportsInterlinearCards = Boolean(surahGrammar?.enhanced && resolvedSurah !== 103);
  const isSurah100Palette = surahGrammar?.color_palette === 'surah_100';
  const isSurah103Palette =
    surahGrammar?.color_palette === 'surah_103' || resolvedSurah === 103;
  const cardsActive = Boolean(supportsInterlinearCards && showInterlinear && grammarMode !== 'off');

  const getButtonStyles = () => {
    switch (grammarMode) {
      case 'colored':
        return isDark
          ? 'bg-amber-950/80 text-amber-200 border-amber-600/60 ring-2 ring-amber-500/30'
          : 'bg-amber-50 text-amber-900 border-amber-300 ring-2 ring-amber-400/40';
      case 'underline':
        return isDark
          ? 'bg-blue-950/80 text-blue-200 border-blue-600/60 ring-2 ring-blue-500/30'
          : 'bg-blue-50 text-blue-900 border-blue-300 ring-2 ring-blue-400/40';
      case 'off':
      default:
        return isDark
          ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
          : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200/80';
    }
  };

  const getBadgeText = () => {
    switch (grammarMode) {
      case 'colored':
        return 'Colors On';
      case 'underline':
        return 'Underlines';
      case 'off':
      default:
        return 'Grammar Off';
    }
  };

  const handleToggleCards = () => {
    if (grammarMode === 'off') {
      setGrammarMode?.('colored');
      setShowInterlinear?.(true);
      return;
    }
    setShowInterlinear?.((prev) => !prev);
  };

  const kbdClass = isDark ? 'bg-white/15' : 'bg-black/10';

  return (
    <div className={`inline-flex flex-wrap items-center gap-2 ${className}`}>
      <div className={`inline-flex items-center rounded-xl p-0.5 border shadow-xs ${getButtonStyles()}`}>
        <button
          type="button"
          onClick={toggleGrammarMode}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
          title="Toggle Arabic Grammar Colors (Keyboard shortcut: G)"
          aria-label="Toggle Arabic Grammar Colors"
        >
          <span className="flex items-center space-x-1" aria-hidden="true">
            <span
              className={`w-2 h-2 rounded-full inline-block ${
                isSurah100Palette || isSurah103Palette ? 'bg-red-600' : 'bg-blue-500'
              }`}
            />
            <span
              className={`w-2 h-2 rounded-full inline-block ${
                isSurah100Palette || isSurah103Palette ? 'bg-emerald-600' : 'bg-amber-500'
              }`}
            />
            <span
              className={`w-2 h-2 rounded-full inline-block ${
                isSurah100Palette
                  ? 'bg-blue-600'
                  : isSurah103Palette
                    ? 'bg-yellow-500'
                    : 'bg-emerald-500'
              }`}
            />
          </span>
          <span className="font-bold">نحو</span>
          <span className="hidden sm:inline opacity-80">• {getBadgeText()}</span>
          <kbd className={`hidden md:inline px-1.5 py-0.5 text-[10px] rounded font-mono ${kbdClass}`}>
            G
          </kbd>
        </button>

        {/* Mode Switch Dropdown / Quick Cycle */}
        <button
          type="button"
          onClick={() => {
            if (grammarMode === 'colored') setGrammarMode('underline');
            else if (grammarMode === 'underline') setGrammarMode('off');
            else setGrammarMode('colored');
          }}
          className="px-1.5 py-1.5 rounded-lg hover:opacity-75 transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
          title="Cycle grammar mode: Colored -> Underlines -> Off"
          aria-label="Cycle grammar display mode"
        >
          <SafeIcon icon={FiSliders} className="text-xs" />
        </button>
      </div>

      {supportsInterlinearCards && (
        <button
          type="button"
          onClick={handleToggleCards}
          aria-pressed={cardsActive}
          data-testid="interlinear-toggle"
          className={`inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all select-none shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 ${
            cardsActive
              ? isDark
                ? 'bg-emerald-950/80 text-emerald-200 border-emerald-600/60 ring-2 ring-emerald-500/30'
                : 'bg-emerald-50 text-emerald-900 border-emerald-300 ring-2 ring-emerald-400/40'
              : isDark
                ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200/80'
          }`}
          title="Toggle word-by-word ṣarf cards (Keyboard shortcut: I)"
        >
          <SafeIcon icon={FiLayers} className="text-xs" />
          <span className="font-arabic font-bold text-sm leading-none">الصرف</span>
          <span className="hidden sm:inline opacity-80">• Cards</span>
          <kbd className={`hidden md:inline px-1.5 py-0.5 text-[10px] rounded font-mono ${kbdClass}`}>
            I
          </kbd>
        </button>
      )}
    </div>
  );
};

export default GrammarToggle;
