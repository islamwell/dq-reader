import React from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import { useQuranData } from '../../contexts/QuranContext';

const { FiSliders } = FiIcons;

const GrammarToggle = ({ className = '' }) => {
  const { grammarMode, toggleGrammarMode, setGrammarMode, theme } = useQuranData();

  const isDark = theme === 'dark';

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
        return 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200/80 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
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

  return (
    <div className={`inline-flex items-center rounded-xl p-0.5 border shadow-xs ${className} ${getButtonStyles()}`}>
      <button
        type="button"
        onClick={toggleGrammarMode}
        className="flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all select-none"
        title="Toggle Arabic Grammar Colors (Keyboard shortcut: G)"
        aria-label="Toggle Arabic Grammar Colors"
      >
        <span className="flex items-center space-x-1">
          <span className="w-2 h-2 rounded-full bg-blue-500 inline-block animate-pulse" />
          <span className="w-2 h-2 rounded-full bg-amber-500 inline-block animate-pulse" />
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
        </span>
        <span className="font-bold">نحو</span>
        <span className="hidden sm:inline opacity-80">• {getBadgeText()}</span>
        <kbd className="hidden md:inline px-1.5 py-0.5 text-[10px] rounded bg-black/10 dark:bg-white/10 font-mono">
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
        className="px-1.5 py-1.5 hover:opacity-75 transition-opacity"
        title="Cycle grammar mode: Colored -> Underlines -> Off"
        aria-label="Cycle grammar display mode"
      >
        <SafeIcon icon={FiSliders} className="text-xs" />
      </button>
    </div>
  );
};

export default GrammarToggle;
