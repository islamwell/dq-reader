import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import { getGrammarSegmentClass } from './GrammarWord';

const { FiX, FiChevronLeft, FiChevronRight, FiBookOpen } = FiIcons;

const CATEGORY_META = {
  fil: {
    labelAr: 'فعل',
    labelEn: 'Verb',
    bgLight: 'bg-amber-100 text-amber-900 border-amber-300',
    bgDark: 'dark:bg-amber-950/70 dark:text-amber-200 dark:border-amber-700',
    dot: 'bg-amber-500'
  },
  ism: {
    labelAr: 'اسم',
    labelEn: 'Noun',
    bgLight: 'bg-blue-100 text-blue-900 border-blue-300',
    bgDark: 'dark:bg-blue-950/70 dark:text-blue-200 dark:border-blue-700',
    dot: 'bg-blue-500'
  },
  harf: {
    labelAr: 'حرف',
    labelEn: 'Particle',
    bgLight: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    bgDark: 'dark:bg-emerald-950/70 dark:text-emerald-200 dark:border-emerald-700',
    dot: 'bg-emerald-500'
  }
};

const THEME_DRAWER_STYLES = {
  green: 'bg-emerald-950/98 text-emerald-50 border-emerald-800 shadow-2xl shadow-emerald-950/80',
  red: 'bg-rose-950/98 text-rose-50 border-rose-800 shadow-2xl shadow-rose-950/80',
  blue: 'bg-slate-900/98 text-blue-50 border-blue-900 shadow-2xl shadow-blue-950/80',
  light: 'bg-white text-slate-900 border-slate-200 shadow-2xl shadow-slate-900/20',
  dark: 'bg-slate-900 text-slate-100 border-slate-800 shadow-2xl shadow-black/60',
  sepia: 'bg-amber-50 text-amber-950 border-amber-300 shadow-2xl shadow-amber-950/20'
};

const THEME_CARD_BG = {
  green: 'bg-emerald-900/60 border-emerald-800',
  red: 'bg-rose-900/60 border-rose-800',
  blue: 'bg-slate-800/70 border-blue-900/70',
  light: 'bg-slate-50 border-slate-200',
  dark: 'bg-slate-800/80 border-slate-700',
  sepia: 'bg-amber-100/60 border-amber-200'
};

const GrammarBottomSheet = ({
  word,
  theme = 'light',
  onClose,
  onNavigateWord,
  hasPreviousWord,
  hasNextWord
}) => {
  // Listen for keyboard navigation while bottom sheet is open
  useEffect(() => {
    if (!word) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose?.();
      } else if (e.key === 'ArrowLeft' || e.key === '[') {
        e.preventDefault();
        onNavigateWord?.(-1);
      } else if (e.key === 'ArrowRight' || e.key === ']') {
        e.preventDefault();
        onNavigateWord?.(1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [word, onClose, onNavigateWord]);

  if (!word) return null;

  const drawerStyle = THEME_DRAWER_STYLES[theme] || THEME_DRAWER_STYLES.light;
  const cardBg = THEME_CARD_BG[theme] || THEME_CARD_BG.light;
  const catMeta = CATEGORY_META[word.primary_category] || CATEGORY_META.ism;
  const segments = word.segments || [];

  return (
    <AnimatePresence>
      {word && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center pointer-events-none">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/45 backdrop-blur-[2px] pointer-events-auto"
            aria-hidden="true"
          />

          {/* Slide-Up Drawer */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            role="dialog"
            aria-modal="true"
            aria-label={`Grammar details for ${word.text_uthmani}`}
            className={`pointer-events-auto relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-t-3xl border-t px-5 sm:px-7 pt-3 pb-8 ${drawerStyle}`}
          >
            {/* Top pill drag handle */}
            <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-3" />

            {/* Header row: Nav & Close */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-inherit/20">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-islamic-gold/20 text-islamic-gold border border-islamic-gold/40">
                  Ayah {word.ayahNumber || '32'}:{word.position}
                </span>
                <span className="text-xs opacity-75 hidden sm:inline">
                  Arabic Morphology & I&apos;rāb
                </span>
              </div>

              <div className="flex items-center space-x-2">
                {/* Previous Word Button */}
                <button
                  type="button"
                  onClick={() => onNavigateWord?.(-1)}
                  disabled={!hasPreviousWord}
                  className="p-1.5 rounded-lg border border-inherit/30 hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Previous word (Press [ or ←)"
                  aria-label="Previous word"
                >
                  <SafeIcon icon={FiChevronLeft} className="text-base" />
                </button>

                {/* Next Word Button */}
                <button
                  type="button"
                  onClick={() => onNavigateWord?.(1)}
                  disabled={!hasNextWord}
                  className="p-1.5 rounded-lg border border-inherit/30 hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Next word (Press ] or →)"
                  aria-label="Next word"
                >
                  <SafeIcon icon={FiChevronRight} className="text-base" />
                </button>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-lg border border-inherit/30 hover:bg-black/10 dark:hover:bg-white/10 transition-colors ml-1"
                  title="Close (Esc)"
                  aria-label="Close grammar panel"
                >
                  <SafeIcon icon={FiX} className="text-base" />
                </button>
              </div>
            </div>

            {/* Hero Word Presentation */}
            <div className={`p-4 rounded-2xl border text-center mb-5 ${cardBg}`}>
              {/* Primary Category Pill */}
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold border mb-2 uppercase tracking-wider">
                <span className={`w-2 h-2 rounded-full ${catMeta.dot}`} />
                <span>{catMeta.labelAr}</span>
                <span>•</span>
                <span>{catMeta.labelEn}</span>
                {word.verb_type && (
                  <>
                    <span className="opacity-50">•</span>
                    <span className="opacity-90">{word.verb_type}</span>
                  </>
                )}
              </div>

              {/* Large Arabic Calligraphy */}
              <div className="quran-text-pak text-4xl sm:text-5xl my-2 leading-relaxed">
                {segments.map((seg, i) => (
                  <span
                    key={i}
                    className={getGrammarSegmentClass(seg.category, 'colored', theme)}
                  >{seg.text}</span>
                ))}
              </div>

              {/* Transliteration & Meaning */}
              <div className="mt-2 space-y-1">
                {word.transliteration && (
                  <p className="text-sm italic opacity-80 font-medium">
                    {word.transliteration}
                  </p>
                )}
                <p className="text-base sm:text-lg font-semibold">
                  &ldquo;{word.translation}&rdquo;
                </p>
              </div>
            </div>

            {/* Sub-word Morpheme Breakdown */}
            <div className="mb-5">
              <h4 className="text-xs font-bold uppercase tracking-wider opacity-75 mb-2.5 flex items-center space-x-2">
                <SafeIcon icon={FiBookOpen} className="text-islamic-gold" />
                <span>Sub-word Morpheme Breakdown ({segments.length} segment{segments.length > 1 ? 's' : ''})</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {segments.map((seg, idx) => {
                  const segMeta = CATEGORY_META[seg.category] || CATEGORY_META.harf;
                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${cardBg}`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${segMeta.bgLight} ${segMeta.bgDark}`}>
                            {segMeta.labelAr} ({segMeta.labelEn})
                          </span>
                        </div>
                        <p className="text-xs font-medium opacity-90 mt-1">
                          {seg.pos_name_ar} {seg.pos_name_en ? `• ${seg.pos_name_en}` : ''}
                        </p>
                        {seg.case && (
                          <p className="text-[11px] opacity-75 font-mono">
                            {seg.case}
                          </p>
                        )}
                      </div>

                      <div className="quran-text-pak text-2xl text-right shrink-0">
                        <span className={getGrammarSegmentClass(seg.category, 'colored', theme)}>
                          {seg.text}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Core Linguistic Properties: Root, Wazn, Irab */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
              {/* Root (الجذر) */}
              <div className={`p-3.5 rounded-xl border ${cardBg}`}>
                <span className="text-[11px] font-bold uppercase tracking-wider opacity-70 block mb-1">
                  الجذر (Root)
                </span>
                {word.root ? (
                  <div>
                    <span className="quran-text-pak text-2xl font-bold tracking-widest text-islamic-gold block">
                      {word.root}
                    </span>
                    {word.root_meaning && (
                      <span className="text-xs opacity-80 mt-1 block leading-snug">
                        {word.root_meaning}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-xs opacity-60 italic">Non-root / Particle</span>
                )}
              </div>

              {/* Pattern / Wazn (الوزن والصيغة) */}
              <div className={`p-3.5 rounded-xl border ${cardBg}`}>
                <span className="text-[11px] font-bold uppercase tracking-wider opacity-70 block mb-1">
                  الوزن والصيغة (Pattern)
                </span>
                {word.wazn || word.lemma ? (
                  <div>
                    {word.wazn && (
                      <span className="text-sm font-semibold block text-amber-600 dark:text-amber-400">
                        {word.wazn}
                      </span>
                    )}
                    {word.lemma && (
                      <span className="quran-text-pak text-xl block mt-0.5">
                        {word.lemma}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-xs opacity-60 italic">Base Lemma</span>
                )}
              </div>

              {/* Irab / Grammatical State (الإعراب) */}
              <div className={`p-3.5 rounded-xl border ${cardBg}`}>
                <span className="text-[11px] font-bold uppercase tracking-wider opacity-70 block mb-1">
                  الإعراب والحالة (State)
                </span>
                {word.irab ? (
                  <span className="text-sm font-bold block text-blue-600 dark:text-sky-300 mt-1">
                    {word.irab}
                  </span>
                ) : (
                  <span className="text-xs opacity-60 italic">
                    {word.primary_category === 'harf' ? 'مبني لا محل له من الإعراب' : 'مبني (Fixed)'}
                  </span>
                )}
              </div>
            </div>

            {/* Bottom Keyboard Shortcuts & Legend Hint */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-inherit/20 text-[11px] opacity-75">
              <div className="flex items-center space-x-3">
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                  <span>اسم (Noun)</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                  <span>فعل (Verb)</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                  <span>حرف (Particle)</span>
                </span>
              </div>

              <div className="space-x-2 font-mono">
                <kbd className="px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 text-[10px]">← / [</kbd>
                <kbd className="px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 text-[10px]">→ / ]</kbd>
                <span>Navigate</span>
                <span className="opacity-40">•</span>
                <kbd className="px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 text-[10px]">Esc</kbd>
                <span>Close</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default GrammarBottomSheet;
