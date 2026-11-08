import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import {
  CATEGORY_LABELS,
  getCategoryBadgeClass,
  getCategoryTextClass,
  isDarkSurface
} from './sarfStyles';
import { MorphologyTab, SyntaxTab, InsightTab } from './SarfDetails';

const {
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiBookOpen,
  FiLayers,
  FiCompass,
  FiSun
} = FiIcons;

const THEME_DRAWER_STYLES = {
  green: 'bg-emerald-950/95 text-emerald-50 border-emerald-800 shadow-2xl shadow-emerald-950/80',
  red: 'bg-rose-950/95 text-rose-50 border-rose-800 shadow-2xl shadow-rose-950/80',
  blue: 'bg-slate-900/95 text-blue-50 border-blue-900 shadow-2xl shadow-blue-950/80',
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

const TABS = [
  { id: 'morphology', labelEn: 'Ṣarf', labelAr: 'الصرف', keyHint: '1', icon: FiLayers },
  { id: 'syntax', labelEn: 'Iʿrāb', labelAr: 'الإعراب', keyHint: '2', icon: FiCompass },
  { id: 'insight', labelEn: 'Insight', labelAr: 'التدبر', keyHint: '3', icon: FiSun }
];

const GrammarBottomSheet = ({
  word,
  theme = 'light',
  onClose,
  onNavigateWord,
  hasPreviousWord,
  hasNextWord,
  onOpenAyah
}) => {
  const [activeTab, setActiveTab] = useState('morphology');
  const dialogRef = useRef(null);
  const previousFocusRef = useRef(null);
  const tabRefs = useRef({});
  const wasOpenRef = useRef(false);

  const isEnhanced = Boolean(
    word && (word.sarf || word.sarf_note_en || word.irab?.ar || word.insight)
  );

  // Move focus into drawer when opened, restore focus & reset tab when closed
  useEffect(() => {
    const isOpen = Boolean(word);
    if (isOpen && !wasOpenRef.current) {
      previousFocusRef.current = document.activeElement;
      dialogRef.current?.focus?.({ preventScroll: true });
    } else if (!isOpen && wasOpenRef.current) {
      setActiveTab('morphology');
      const prev = previousFocusRef.current;
      previousFocusRef.current = null;
      if (prev && prev.isConnected && typeof prev.focus === 'function') {
        prev.focus({ preventScroll: true });
      }
    }
    wasOpenRef.current = isOpen;
  }, [word]);

  // Listen for keyboard navigation while bottom sheet is open
  useEffect(() => {
    if (!word) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose?.();
        return;
      }

      if (isEnhanced && (e.key === '1' || e.key === '2' || e.key === '3')) {
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        const idx = Number(e.key) - 1;
        if (TABS[idx]) {
          e.preventDefault();
          setActiveTab(TABS[idx].id);
        }
        return;
      }

      const inTablist = Boolean(e.target?.closest?.('[role="tablist"]'));
      if (e.key === '[' || (!inTablist && e.key === 'ArrowLeft')) {
        e.preventDefault();
        onNavigateWord?.(-1);
      } else if (e.key === ']' || (!inTablist && e.key === 'ArrowRight')) {
        e.preventDefault();
        onNavigateWord?.(1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [word, isEnhanced, onClose, onNavigateWord]);

  if (!word) return null;

  const darkSurface = isDarkSurface(theme);
  const drawerStyle = THEME_DRAWER_STYLES[theme] || THEME_DRAWER_STYLES.light;
  const cardBg = THEME_CARD_BG[theme] || THEME_CARD_BG.light;
  const catMeta = CATEGORY_LABELS[word.primary_category] || CATEGORY_LABELS.ism;
  const segments = word.segments || [];

  const navBtnStyle = darkSurface
    ? 'border-white/20 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400'
    : 'border-slate-300 hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500';
  const kbdStyle = darkSurface ? 'bg-white/10 text-slate-200' : 'bg-black/10 text-slate-700';

  const handleTabListKeyDown = (e) => {
    const currentIdx = TABS.findIndex((t) => t.id === activeTab);
    if (currentIdx === -1) return;

    let nextIdx = null;
    if (e.key === 'ArrowRight') {
      nextIdx = (currentIdx + 1) % TABS.length;
    } else if (e.key === 'ArrowLeft') {
      nextIdx = (currentIdx - 1 + TABS.length) % TABS.length;
    } else if (e.key === 'Home') {
      nextIdx = 0;
    } else if (e.key === 'End') {
      nextIdx = TABS.length - 1;
    }

    if (nextIdx !== null) {
      e.preventDefault();
      e.stopPropagation();
      const nextTab = TABS[nextIdx];
      setActiveTab(nextTab.id);
      tabRefs.current[nextTab.id]?.focus?.();
    }
  };

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
            className="fixed inset-0 bg-black/45 backdrop-blur-[2px] pointer-events-auto overflow-hidden overscroll-contain"
            aria-hidden="true"
          />

          {/* Slide-Up Drawer */}
          <motion.div
            ref={dialogRef}
            tabIndex={-1}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            role="dialog"
            aria-modal="true"
            aria-label={`Grammar details for ${word.text_uthmani}`}
            className={`pointer-events-auto relative w-full max-w-2xl max-h-[85vh] overflow-y-auto overscroll-contain rounded-t-3xl border-t px-5 sm:px-7 pt-3 pb-8 focus:outline-none ${drawerStyle}`}
          >
            {/* Top pill drag handle */}
            <div
              className={`w-12 h-1.5 rounded-full mx-auto mb-3 ${
                darkSurface ? 'bg-white/25' : 'bg-slate-300'
              }`}
              aria-hidden="true"
            />

            {/* Header row: Nav & Close */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-current/15">
              <div className="flex items-center space-x-2">
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                    darkSurface
                      ? 'bg-islamic-gold/20 text-amber-300 border-islamic-gold/40'
                      : 'bg-amber-100/80 text-amber-900 border-amber-300'
                  }`}
                >
                  {isEnhanced && word.surahNumber
                    ? `Surah ${word.surahNumber} · ${word.ayahNumber}:${word.position}`
                    : `Ayah ${word.ayahNumber || '32'}:${word.position}`}
                </span>
                <span className="text-xs opacity-75 hidden sm:inline">
                  {isEnhanced ? 'Ṣarf · Iʿrāb · Tadabbur' : 'Arabic Morphology & Iʿrāb'}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                {/* Previous Word Button */}
                <button
                  type="button"
                  onClick={() => onNavigateWord?.(-1)}
                  disabled={!hasPreviousWord}
                  className={`p-1.5 rounded-lg border disabled:opacity-30 disabled:cursor-not-allowed transition-colors ${navBtnStyle}`}
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
                  className={`p-1.5 rounded-lg border disabled:opacity-30 disabled:cursor-not-allowed transition-colors ${navBtnStyle}`}
                  title="Next word (Press ] or →)"
                  aria-label="Next word"
                >
                  <SafeIcon icon={FiChevronRight} className="text-base" />
                </button>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={onClose}
                  className={`p-1.5 rounded-lg border transition-colors ml-1 ${navBtnStyle}`}
                  title="Close (Esc)"
                  aria-label="Close grammar panel"
                >
                  <SafeIcon icon={FiX} className="text-base" />
                </button>
              </div>
            </div>

            {/* Hero Word Presentation */}
            <div className={`p-4 rounded-2xl border text-center mb-5 ${cardBg}`}>
              <div className="flex flex-wrap items-center justify-center gap-2 mb-2">
                {/* Primary Category Pill */}
                <span
                  className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold border tracking-wider ${getCategoryBadgeClass(
                    word.primary_category,
                    theme
                  )}`}
                >
                  <span className={`w-2 h-2 rounded-full ${catMeta.dot}`} />
                  <span>{catMeta.ar}</span>
                  <span>•</span>
                  <span className="uppercase">{catMeta.en}</span>
                  {word.verb_type && (
                    <>
                      <span className="opacity-50">•</span>
                      <span className="opacity-90">{word.verb_type}</span>
                    </>
                  )}
                </span>

                {/* Enhanced Grammatical Role Pill */}
                {isEnhanced && (word.role_ar || word.role_en) && (
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border ${
                      darkSurface
                        ? 'bg-white/5 border-white/15 text-slate-200'
                        : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    {word.role_ar && (
                      <span dir="rtl" className="font-arabic font-bold">
                        {word.role_ar}
                      </span>
                    )}
                    {word.role_ar && word.role_en && <span className="opacity-50">·</span>}
                    {word.role_en && <span>{word.role_en}</span>}
                  </span>
                )}
              </div>

              {/* Large Arabic Calligraphy */}
              <div className="quran-text-pak !text-4xl sm:!text-5xl !leading-[1.7] [text-shadow:none] !text-inherit my-2">
                {segments.map((seg, i) => (
                  <span
                    key={i}
                    className={getCategoryTextClass(seg.category, theme)}
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

            {/* Body: Enhanced Tabbed View (Surah 103) vs Classic View (Surah 32) */}
            {isEnhanced ? (
              <div className="mb-5">
                <div
                  role="tablist"
                  aria-label="Word grammar analysis"
                  onKeyDown={handleTabListKeyDown}
                  className={`grid grid-cols-3 gap-1.5 p-1 rounded-2xl border mb-4 ${
                    darkSurface
                      ? 'bg-black/25 border-white/15'
                      : 'bg-slate-100/80 border-slate-200'
                  }`}
                >
                  {TABS.map((tab) => {
                    const selected = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        ref={(el) => {
                          tabRefs.current[tab.id] = el;
                        }}
                        id={`tab-${tab.id}`}
                        type="button"
                        role="tab"
                        aria-selected={selected}
                        aria-controls={`panel-${tab.id}`}
                        tabIndex={selected ? 0 : -1}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl text-xs font-semibold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 ${
                          selected
                            ? darkSurface
                              ? 'bg-islamic-gold/25 text-amber-200 border border-islamic-gold/60 shadow-sm'
                              : 'bg-white text-slate-900 border border-amber-300 shadow-sm'
                            : darkSurface
                              ? 'text-slate-300 hover:bg-white/5 border border-transparent'
                              : 'text-slate-600 hover:bg-white/60 border border-transparent'
                        }`}
                      >
                        <SafeIcon
                          icon={tab.icon}
                          className={`text-sm shrink-0 ${
                            selected ? (darkSurface ? 'text-amber-300' : 'text-amber-700') : 'opacity-70'
                          }`}
                        />
                        <span>{tab.labelEn}</span>
                        <span dir="rtl" className="font-arabic text-sm hidden sm:inline">
                          {tab.labelAr}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div
                  id={`panel-${activeTab}`}
                  role="tabpanel"
                  aria-labelledby={`tab-${activeTab}`}
                >
                  {activeTab === 'morphology' && (
                    <MorphologyTab
                      word={word}
                      theme={theme}
                      cardBg={cardBg}
                      onOpenAyah={onOpenAyah}
                    />
                  )}
                  {activeTab === 'syntax' && (
                    <SyntaxTab word={word} theme={theme} cardBg={cardBg} />
                  )}
                  {activeTab === 'insight' && (
                    <InsightTab word={word} theme={theme} cardBg={cardBg} />
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* Sub-word Morpheme Breakdown */}
                <div className="mb-5">
                  <h4 className="text-xs font-bold uppercase tracking-wider opacity-75 mb-2.5 flex items-center space-x-2">
                    <SafeIcon icon={FiBookOpen} className={darkSurface ? 'text-islamic-gold' : 'text-amber-700'} />
                    <span>
                      Sub-word Morpheme Breakdown ({segments.length} segment{segments.length > 1 ? 's' : ''})
                    </span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {segments.map((seg, idx) => {
                      const segMeta = CATEGORY_LABELS[seg.category] || CATEGORY_LABELS.harf;
                      return (
                        <div
                          key={idx}
                          className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${cardBg}`}
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center space-x-2">
                              <span
                                className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${getCategoryBadgeClass(
                                  seg.category,
                                  theme
                                )}`}
                              >
                                {segMeta.ar} ({segMeta.en})
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

                          <div className="quran-text-pak !text-2xl !leading-[1.6] [text-shadow:none] !text-inherit text-right shrink-0">
                            <span className={getCategoryTextClass(seg.category, theme)}>
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
                        <span
                          className={`quran-text-pak !text-2xl !leading-[1.6] [text-shadow:none] font-bold tracking-widest block ${
                            darkSurface ? '!text-islamic-gold' : '!text-amber-700'
                          }`}
                        >
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
                          <span
                            className={`text-sm font-semibold block ${
                              darkSurface ? 'text-amber-300' : 'text-amber-700'
                            }`}
                          >
                            {word.wazn}
                          </span>
                        )}
                        {word.lemma && (
                          <span
                            className={`quran-text-pak !text-xl !leading-[1.6] [text-shadow:none] block mt-0.5 ${
                              darkSurface ? '!text-slate-100' : '!text-slate-900'
                            }`}
                          >
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
                      <span
                        className={`text-sm font-bold block mt-1 ${
                          darkSurface ? 'text-sky-300' : 'text-blue-700'
                        }`}
                      >
                        {word.irab}
                      </span>
                    ) : (
                      <span className="text-xs opacity-60 italic">
                        {word.primary_category === 'harf' ? 'مبني لا محل له من الإعراب' : 'مبني (Fixed)'}
                      </span>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Bottom Keyboard Shortcuts & Legend Hint */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-current/15 text-[11px] opacity-80">
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

              <div className="flex flex-wrap items-center gap-1.5 font-mono">
                <kbd className={`px-1.5 py-0.5 rounded text-[10px] ${kbdStyle}`}>← / [</kbd>
                <kbd className={`px-1.5 py-0.5 rounded text-[10px] ${kbdStyle}`}>→ / ]</kbd>
                <span>Navigate</span>
                {isEnhanced && (
                  <>
                    <span className="opacity-40">•</span>
                    <kbd className={`px-1.5 py-0.5 rounded text-[10px] ${kbdStyle}`}>1 2 3</kbd>
                    <span>Tabs</span>
                  </>
                )}
                <span className="opacity-40">•</span>
                <kbd className={`px-1.5 py-0.5 rounded text-[10px] ${kbdStyle}`}>Esc</kbd>
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
