import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useDragControls, useReducedMotion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import {
  getCategoryMeta,
  getCategoryBadgeClass,
  getCategoryTextClass,
  isDarkSurface
} from './sarfStyles';
import { getSimplePartOfSpeech } from './GrammarWord';
import { MorphologyTab, SyntaxTab, InsightTab } from './SarfDetails';
import VerbConjugationModal from './VerbConjugationModal';

const Fi = (name) => FiIcons[name] || FiIcons.FiCircle;

/* ------------------------------------------------------------------
   AYAH WORD GLOW — used in GrammarWord / AyahGrammarText.
   The tapped word scales up and glows in its category color while
   surrounding words gently fade back so the verse stays readable.
------------------------------------------------------------------- */
export const getAyahWordClass = ({ isActive, hasActive }) =>
  [
    'inline-block cursor-pointer transition-all duration-300 ease-out',
    isActive
      ? 'scale-110 -translate-y-0.5 [text-shadow:0_0_22px_currentColor] underline decoration-2 underline-offset-[10px] decoration-current'
      : hasActive
        ? 'opacity-40 hover:opacity-80'
        : 'hover:opacity-80'
  ].join(' ');

/* ---------------------------- Theme maps ---------------------------- */
const THEME_DRAWER_STYLES = {
  green: 'bg-emerald-950/95 text-emerald-50 border-emerald-800 shadow-2xl shadow-emerald-950/80',
  red: 'bg-rose-950/95 text-rose-50 border-rose-800 shadow-2xl shadow-rose-950/80',
  blue: 'bg-slate-900/95 text-blue-50 border-blue-900 shadow-2xl shadow-blue-950/80',
  light: 'bg-white/95 text-slate-900 border-slate-200 shadow-2xl shadow-slate-900/20',
  dark: 'bg-slate-900/95 text-slate-100 border-slate-800 shadow-2xl shadow-black/60',
  sepia: 'bg-amber-50/95 text-amber-950 border-amber-300 shadow-2xl shadow-amber-950/20'
};

const THEME_CARD_BG = {
  green: 'bg-emerald-900/60 border-emerald-800',
  red: 'bg-rose-900/60 border-rose-800',
  blue: 'bg-slate-800/70 border-blue-900/70',
  light: 'bg-slate-50 border-slate-200',
  dark: 'bg-slate-800/80 border-slate-700',
  sepia: 'bg-amber-100/60 border-amber-200'
};

// Soft glow behind the word, matched to the word colours in the verse.
const AURA = {
  default: { ism: 'bg-blue-500/30', fil: 'bg-amber-500/30', harf: 'bg-emerald-500/30' },
  surah_100: { ism: 'bg-red-500/30', fil: 'bg-emerald-500/30', harf: 'bg-blue-500/30' }
};

const LEGEND = [
  { label: 'Name', dot: 'bg-blue-500', dot100: 'bg-red-600' },
  { label: 'Action', dot: 'bg-amber-500', dot100: 'bg-emerald-600' },
  { label: 'Small word', dot: 'bg-emerald-500', dot100: 'bg-blue-600' }
];

// [light surface, dark surface]
const TONES = {
  time: ['bg-amber-100 text-amber-700', 'bg-amber-400/15 text-amber-300'],
  doing: ['bg-rose-100 text-rose-700', 'bg-rose-400/15 text-rose-300'],
  who: ['bg-sky-100 text-sky-700', 'bg-sky-400/15 text-sky-300'],
  gender: ['bg-pink-100 text-pink-700', 'bg-pink-400/15 text-pink-300'],
  amount: ['bg-violet-100 text-violet-700', 'bg-violet-400/15 text-violet-300'],
  kind: ['bg-teal-100 text-teal-700', 'bg-teal-400/15 text-teal-300'],
  role: ['bg-emerald-100 text-emerald-700', 'bg-emerald-400/15 text-emerald-300'],
  emphasis: ['bg-indigo-100 text-indigo-700', 'bg-indigo-400/20 text-blue-200']
};

const TABS = [
  { id: 'morphology', label: 'Facts', srSuffix: 'Ṣarf', icon: Fi('FiGrid') },
  { id: 'syntax', label: 'In this verse', srSuffix: 'Iʿrāb', icon: Fi('FiCompass') },
  { id: 'insight', label: 'Insight', srSuffix: '', icon: Fi('FiSun') }
];

/* ------------------------------------------------------------------
   TRAITS — turns surah_103.json and surah_100.json fields into
   plain-English visual icon facts.
------------------------------------------------------------------- */
const s = (v) => String(v ?? '').toLowerCase();
const has = (v, ...keys) => keys.some((k) => s(v).includes(k));
const pick = (o, ...keys) => {
  for (const k of keys) if (o && o[k] != null && o[k] !== '') return o[k];
  return null;
};

export const buildTraits = (word) => {
  const sarf = word?.sarf || {};
  const v = sarf.verb || (sarf.tense || sarf.tense_en || sarf.voice || sarf.voice_en ? sarf : {});
  const n = sarf.noun || {};
  const out = [];
  const add = (group, label, value, hint, visual) =>
    out.push({ group, label, value, hint, ...visual });

  // Time (verb tense)
  const tense = pick(v, 'tense_en', 'tense', 'verb_tense') ?? (word?.primary_category === 'fil' ? word.tense : null);
  if (tense) {
    if (has(tense, 'command', 'amr', 'imperative'))
      add('time', 'Time', 'Command', 'Telling someone to do it', { icon: Fi('FiVolume2') });
    else if (has(tense, 'present', 'mudari', 'imperfect') && !has(tense, 'past', 'perfect'))
      add('time', 'Time', 'Now or later', 'Still happening, or yet to happen', { icon: Fi('FiPlay') });
    else if (has(tense, 'past', 'madi', 'perfect') && has(tense, 'future'))
      add('time', 'Time', 'Certain future', 'Past form used for a guaranteed future event', { icon: Fi('FiRewind') });
    else if (has(tense, 'past', 'madi', 'perfect'))
      add('time', 'Time', 'Past', 'It already happened', { icon: Fi('FiRewind') });
    else if (has(tense, 'future'))
      add('time', 'Time', 'Later', 'Yet to happen', { icon: Fi('FiPlay') });
  }

  // Doing (active / passive voice)
  const voice = pick(v, 'voice_en', 'voice') ?? (word?.primary_category === 'fil' ? word.voice : null);
  if (voice != null || typeof v.passive === 'boolean') {
    const passive = v.passive === true || has(voice, 'passive', 'majhul');
    add(
      'doing',
      'Doing',
      passive ? 'Is done to' : 'Does it',
      passive ? 'The doer is not named' : 'Someone does the action',
      { icon: Fi(passive ? 'FiArrowDownLeft' : 'FiArrowRight') }
    );
  }

  // Who (person)
  const person = pick(v, 'person_en', 'person');
  if (person != null) {
    const pText = s(person);
    const p = /1st|first|\bi\b|\bwe\b/.test(pText) ? 0 : /2nd|second|\byou\b/.test(pText) ? 1 : 2;
    add(
      'who',
      'Who',
      ['I or we', 'You', 'Someone else'][p],
      ['The speaker', 'The one spoken to', 'He, she or they'][p],
      { icon: Fi(p === 2 ? 'FiUsers' : 'FiUser') }
    );
  }

  // Gender (noun.gender_en, verb.gender_en, or embedded inside verb.person_en)
  const g = pick(v, 'gender_en', 'gender') ?? pick(n, 'gender_en', 'gender') ?? person;
  if (g != null) {
    const gText = s(g);
    const fem = /\bfem|\bshe\b/.test(gText);
    const masc = !fem && /\bmasc|\bhe\b/.test(gText);
    if (fem || masc)
      add('gender', 'Gender', fem ? 'Female' : 'Male', fem ? 'Female form' : 'Male form', {
        mark: fem ? '♀' : '♂'
      });
  }

  // How many (noun.number_en, verb.number_en, or embedded inside verb.person_en)
  const num = pick(v, 'number_en', 'number') ?? pick(n, 'number_en', 'number') ?? person;
  if (num != null) {
    const nText = s(num);
    if (/\bdual\b|\btwo\b|^2/.test(nText))
      add('amount', 'How many', 'Two', 'Exactly two', { dots: 2 });
    else if (/\bplur|\bmany\b|\bthey\b|\bwe\b/.test(nText))
      add('amount', 'How many', 'Many', 'Three or more', { dots: 3 });
    else if (/\bsing|\bone\b|\bhe\b|\bshe\b|\bit\b|\bi\b|^1/.test(nText))
      add('amount', 'How many', 'One', 'Just one', { dots: 1 });
  }

  // Specific or general (definiteness)
  const def = pick(n, 'definiteness_en', 'definite', 'is_definite', 'definiteness', 'state');
  if (def != null) {
    const dText = s(def);
    const no = def === false || /\bindef|\bnakira|\bfalse\b|\bno\b/.test(dText);
    add(
      'kind',
      'Kind',
      no ? 'General' : 'Specific',
      no ? 'Any one, not a particular one' : 'A particular one, like “the”',
      { icon: Fi(no ? 'FiCircle' : 'FiCheckCircle') }
    );
  }

  // Role in the sentence (case)
  const c = pick(n, 'case_en', 'case', 'irab_case');
  if (c != null) {
    const cText = s(c);
    if (/raf|marf|nom|-un\b|main statement|predicate/.test(cText))
      add('role', 'Role', 'Main part', 'The one doing it or being described', { icon: Fi('FiStar') });
    else if (/nasb|mansub|acc|-an\b|-a\b|direct object|time expression|manner/.test(cText))
      add('role', 'Role', 'Target', 'Receives the action or adds detail', { icon: Fi('FiCrosshair') });
    else if (/jar|jr|gen|-i\b|preposition|iḍāfa|oath/.test(cText))
      add('role', 'Role', 'Linked', 'Follows a word like in, of or by', { icon: Fi('FiLink') });
  }

  // Emphasis particle indicator
  if (word?.has_emphasis || word?.subclass === 'emphasis') {
    add('emphasis', 'Emphasis', 'Strong stress', 'Adds certainty or opens an oath', {
      icon: Fi('FiZap')
    });
  }

  if (word?.primary_category === 'harf')
    add('kind', 'Type', 'Small word', 'Connects or shapes other words', { icon: Fi('FiLink2') });

  if (!out.length && (word?.subclass === 'pronoun' || has(word?.role_en, 'pronoun')))
    add('who', 'Type', 'Pointer / Pronoun', 'Stands in for a person, thing, or moment', {
      icon: Fi('FiUser')
    });

  return out;
};

/* ------------------------------ Pieces ------------------------------ */
const Dots = ({ n }) => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden="true">
    {n === 1 && <circle cx="12" cy="12" r="4.5" />}
    {n === 2 && (
      <>
        <circle cx="7.5" cy="12" r="3.5" />
        <circle cx="16.5" cy="12" r="3.5" />
      </>
    )}
    {n === 3 && (
      <>
        <circle cx="12" cy="6.5" r="3" />
        <circle cx="6.5" cy="16" r="3" />
        <circle cx="17.5" cy="16" r="3" />
      </>
    )}
  </svg>
);

const TraitVisual = ({ t }) => {
  if (t.dots) return <Dots n={t.dots} />;
  if (t.mark) return <span className="text-xl leading-none font-bold" aria-hidden="true">{t.mark}</span>;
  return <SafeIcon icon={t.icon} className="text-lg" aria-hidden="true" />;
};

const Trait = ({ t, i, dark, reduce }) => (
  <li className="flex items-start gap-3 p-3.5">
    <motion.span
      initial={reduce ? false : { scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: reduce ? 0 : 0.05 * i, type: 'spring', damping: 14, stiffness: 320 }}
      className={`grid place-items-center w-10 h-10 rounded-full shrink-0 ${TONES[t.group][dark ? 1 : 0]}`}
    >
      <TraitVisual t={t} />
    </motion.span>
    <span className="min-w-0">
      <span className="block text-xs opacity-60">{t.label}</span>
      <span className="block text-[15px] font-semibold leading-tight">{t.value}</span>
      <span className="block mt-0.5 text-xs leading-snug opacity-70">{t.hint}</span>
    </span>
  </li>
);

const FactsPanel = ({ word, theme, cardBg, dark, reduce, onOpenAyah }) => {
  const [more, setMore] = useState(false);
  const [isConjugationModalOpen, setIsConjugationModalOpen] = useState(false);
  const traits = buildTraits(word);
  const hasVerbConjugation = Boolean(
    word?.sarf?.verb?.conjugation_table || word?.sarf?.verb?.conjugation
  );

  if (!traits.length) {
    return <MorphologyTab word={word} theme={theme} cardBg={cardBg} onOpenAyah={onOpenAyah} />;
  }

  return (
    <div className="space-y-3" data-testid="facts-panel">
      <ul
        className={`grid ${
          traits.length === 1 ? 'grid-cols-1' : 'grid-cols-2 sm:grid-cols-3'
        } rounded-2xl border ${cardBg}`}
      >
        {traits.map((t, i) => (
          <Trait key={t.label} t={t} i={i} dark={dark} reduce={reduce} />
        ))}
      </ul>

      {word.sarf_note_en && (
        <p className={`flex gap-2.5 rounded-2xl border p-3.5 text-sm leading-relaxed ${cardBg}`}>
          <SafeIcon icon={Fi('FiInfo')} className="mt-0.5 shrink-0 opacity-70" aria-hidden="true" />
          <span>{word.sarf_note_en}</span>
        </p>
      )}

      <div className="flex flex-wrap items-center justify-center gap-2">
        {hasVerbConjugation && (
          <button
            type="button"
            data-testid="open-conjugation-modal"
            onClick={() => setIsConjugationModalOpen(true)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 ${
              dark
                ? 'bg-emerald-950/90 text-emerald-200 border-emerald-600 hover:bg-emerald-900'
                : 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
            }`}
          >
            <SafeIcon icon={Fi('FiMaximize2')} className="text-xs" aria-hidden="true" />
            <span>Open Full Conjugation Table</span>
          </button>
        )}

        <button
          type="button"
          data-testid="toggle-more-details"
          onClick={() => setMore((m) => !m)}
          aria-expanded={more}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold opacity-80 hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
        >
          {more ? 'Hide details' : 'More details'}
          <SafeIcon
            icon={Fi('FiChevronDown')}
            className={`transition-transform ${more ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </button>
      </div>

      <AnimatePresence initial={false}>
        {more && (
          <motion.div
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <MorphologyTab word={word} theme={theme} cardBg={cardBg} onOpenAyah={onOpenAyah} />
          </motion.div>
        )}
      </AnimatePresence>

      {hasVerbConjugation && (
        <VerbConjugationModal
          isOpen={isConjugationModalOpen}
          onClose={() => setIsConjugationModalOpen(false)}
          word={word}
          theme={theme}
        />
      )}
    </div>
  );
};

const NavBtn = ({ icon, label, title, onClick, disabled, className }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    aria-label={label}
    className={`p-2 rounded-full border transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${className}`}
  >
    <SafeIcon icon={icon} className="text-base" aria-hidden="true" />
  </button>
);

/* ------------------------------ The sheet ------------------------------ */
const Sheet = ({
  word, theme, activeTab, setActiveTab, dialogRef, tabRefs,
  onClose, onNavigateWord, hasPreviousWord, hasNextWord, onOpenAyah
}) => {
  const controls = useDragControls();
  const reduce = useReducedMotion();

  const isEnhanced = hasEnhancedData(word);
  const palette = word.color_palette === 'surah_100' ? 'surah_100' : 'default';
  const dark = isDarkSurface(theme);
  const drawerStyle = THEME_DRAWER_STYLES[theme] || THEME_DRAWER_STYLES.light;
  const cardBg = THEME_CARD_BG[theme] || THEME_CARD_BG.light;
  const segments = word.segments || [];
  const cat = word.primary_category === 'fil' ? 'fil' : word.primary_category === 'harf' ? 'harf' : 'ism';
  const posIcon = Fi(cat === 'fil' ? 'FiZap' : cat === 'harf' ? 'FiLink2' : 'FiTag');
  const singularAr = word.sarf?.noun?.singular_ar;
  const singularEn = word.sarf?.noun?.singular_en;
  const wordKey = `${word.surahNumber ?? ''}-${word.ayahNumber ?? ''}-${word.position ?? ''}-${word.text_uthmani}`;

  const navBtn = dark
    ? 'border-white/20 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400'
    : 'border-slate-300 hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500';
  const kbd = dark ? 'bg-white/10 text-slate-200' : 'bg-black/10 text-slate-700';

  const handleTabListKeyDown = (e) => {
    const cur = TABS.findIndex((t) => t.id === activeTab);
    let next = null;
    if (e.key === 'ArrowRight') next = (cur + 1) % TABS.length;
    else if (e.key === 'ArrowLeft') next = (cur - 1 + TABS.length) % TABS.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = TABS.length - 1;
    if (next !== null) {
      e.preventDefault();
      e.stopPropagation();
      setActiveTab(TABS[next].id);
      tabRefs.current[TABS[next].id]?.focus?.();
    }
  };

  const place = [
    isEnhanced && word.surahNumber ? `Surah ${word.surahNumber}` : null,
    word.ayahNumber ? `ayah ${word.ayahNumber}` : null,
    word.position ? `word ${word.position}` : null
  ].filter(Boolean).join(', ');

  return (
    <div className="fixed inset-x-0 bottom-0 z-[70] flex justify-center pointer-events-none">
      {/* Non-blocking inspector panel: no dark backdrop so the verse stays
          visible above, the tapped word glows, and other words stay tappable. */}
      <motion.div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-label={`Grammar details for ${word.text_uthmani}`}
        drag="y"
        dragControls={controls}
        dragListener={false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.5 }}
        onDragEnd={(_, info) => {
          if (info.offset.y > 90 || info.velocity.y > 500) onClose?.();
        }}
        initial={reduce ? { opacity: 0 } : { y: '100%' }}
        animate={reduce ? { opacity: 1 } : { y: 0 }}
        exit={reduce ? { opacity: 0 } : { y: '100%' }}
        transition={reduce ? { duration: 0.01 } : { type: 'spring', damping: 30, stiffness: 300 }}
        className={`pointer-events-auto relative w-full max-w-2xl max-h-[62vh] sm:max-h-[72vh] overflow-y-auto overscroll-contain rounded-t-3xl border-t px-4 sm:px-7 pb-[max(1.5rem,env(safe-area-inset-bottom))] backdrop-blur-xl focus:outline-none ${drawerStyle}`}
      >
        <div
          onPointerDown={(e) => controls.start(e)}
          className="touch-none cursor-grab py-3"
          aria-hidden="true"
        >
          <div className={`w-10 h-1 rounded-full mx-auto ${dark ? 'bg-white/25' : 'bg-slate-300'}`} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${
              dark
                ? 'bg-islamic-gold/20 text-amber-300 border-islamic-gold/40'
                : 'bg-amber-100/80 text-amber-900 border-amber-300'
            }`}
          >
            <SafeIcon icon={Fi('FiBookOpen')} className="text-xs" aria-hidden="true" />
            {place}
          </span>
          <div className="flex items-center gap-1.5">
            <NavBtn icon={Fi('FiChevronLeft')} label="Previous word" title="Previous word ([ or ←)" onClick={() => onNavigateWord?.(-1)} disabled={!hasPreviousWord} className={navBtn} />
            <NavBtn icon={Fi('FiChevronRight')} label="Next word" title="Next word (] or →)" onClick={() => onNavigateWord?.(1)} disabled={!hasNextWord} className={navBtn} />
            <NavBtn icon={Fi('FiX')} label="Close grammar panel" title="Close (Esc)" onClick={onClose} className={`ml-1 ${navBtn}`} />
          </div>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={wordKey}
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: reduce ? 0.01 : 0.18 }}
          >
            {/* Hero */}
            <div className={`relative overflow-hidden rounded-3xl border text-center px-4 py-5 mb-4 ${cardBg}`}>
              <motion.div
                aria-hidden="true"
                initial={reduce ? false : { opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: reduce ? 0.01 : 0.9, ease: 'easeOut' }}
                className={`absolute left-1/2 top-2 -translate-x-1/2 w-56 h-28 rounded-full blur-3xl ${AURA[palette][cat]}`}
              />
              <div className="relative">
                <div className="quran-text-pak !text-4xl sm:!text-5xl !leading-[1.7] [text-shadow:none] !text-inherit">
                  {segments.map((seg, i) => (
                    <span key={i} className={getCategoryTextClass(seg.category, theme, seg, palette)}>
                      {seg.text}
                    </span>
                  ))}
                </div>

                <p className="mt-1 text-lg sm:text-xl font-semibold">&ldquo;{word.translation}&rdquo;</p>

                <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                  <span
                    data-testid="word-pos-label"
                    className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold border ${getCategoryBadgeClass(word.primary_category, theme, word, palette)}`}
                  >
                    <SafeIcon icon={posIcon} className="text-xs shrink-0" aria-hidden="true" />
                    <span>{getSimplePartOfSpeech(word)}</span>
                  </span>

                  {word.idafa && (
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        dark
                          ? 'bg-amber-950/70 border-amber-500/60 text-amber-200'
                          : 'bg-amber-100/80 border-amber-300 text-amber-950'
                      }`}
                    >
                      <SafeIcon icon={Fi('FiLink')} className="text-xs shrink-0" aria-hidden="true" />
                      <span>{word.idafa.label_en}:</span>
                      <span dir="rtl" className="font-arabic text-sm font-bold">
                        {word.idafa.mudaf_ar} + {word.idafa.mudaf_ilayhi_ar}
                      </span>
                    </span>
                  )}

                  {singularAr && (
                    <span
                      data-testid="plural-singular-badge"
                      className={`inline-flex items-center gap-2 px-3 py-0.5 rounded-full border text-xs ${
                        dark
                          ? 'bg-rose-950/60 border-rose-700/70 text-rose-100'
                          : 'bg-rose-50 border-rose-200 text-rose-950'
                      }`}
                    >
                      <SafeIcon icon={Fi('FiUser')} className="shrink-0" aria-hidden="true" />
                      <span className="font-semibold">One of them:</span>
                      <span dir="rtl" className={`quran-text-pak !text-xl !leading-[1.5] [text-shadow:none] font-bold ${dark ? '!text-rose-200' : '!text-rose-800'}`}>
                        {singularAr}
                      </span>
                      {singularEn && <span className="opacity-80">({singularEn})</span>}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {isEnhanced ? (
              <div className="mb-4">
                <div
                  role="tablist"
                  aria-label="Word grammar analysis"
                  onKeyDown={handleTabListKeyDown}
                  className={`grid grid-cols-3 p-1 rounded-full mb-4 ${dark ? 'bg-black/25' : 'bg-slate-100'}`}
                >
                  {TABS.map((tab) => {
                    const selected = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        ref={(el) => { tabRefs.current[tab.id] = el; }}
                        id={`tab-${tab.id}`}
                        type="button"
                        role="tab"
                        aria-selected={selected}
                        tabIndex={selected ? 0 : -1}
                        onClick={() => setActiveTab(tab.id)}
                        className={`relative flex items-center justify-center gap-1.5 px-2 py-2 rounded-full text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 ${
                          selected ? (dark ? 'text-amber-200' : 'text-slate-900') : 'opacity-65 hover:opacity-100'
                        }`}
                      >
                        {selected && (
                          <motion.span
                            layoutId="grammar-tab-pill"
                            transition={reduce ? { duration: 0.01 } : { type: 'spring', damping: 28, stiffness: 380 }}
                            className={`absolute inset-0 rounded-full border ${
                              dark
                                ? 'bg-islamic-gold/25 border-islamic-gold/50'
                                : 'bg-white border-amber-300/80 shadow-sm'
                            }`}
                          />
                        )}
                        <SafeIcon icon={tab.icon} className="relative text-sm shrink-0" aria-hidden="true" />
                        <span className="relative">{tab.label}</span>
                        {tab.srSuffix && <span className="sr-only"> ({tab.srSuffix})</span>}
                      </button>
                    );
                  })}
                </div>

                <div id={`panel-${activeTab}`} role="tabpanel" aria-labelledby={`tab-${activeTab}`}>
                  {activeTab === 'morphology' && (
                    <FactsPanel word={word} theme={theme} cardBg={cardBg} dark={dark} reduce={reduce} onOpenAyah={onOpenAyah} />
                  )}
                  {activeTab === 'syntax' && <SyntaxTab word={word} theme={theme} cardBg={cardBg} />}
                  {activeTab === 'insight' && <InsightTab word={word} theme={theme} cardBg={cardBg} />}
                </div>
              </div>
            ) : (
              <>
                {/* Classic v1 view (Surah 32) */}
                <div className="mb-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider opacity-75 mb-2.5 flex items-center space-x-2">
                    <SafeIcon
                      icon={Fi('FiBookOpen')}
                      aria-hidden="true"
                      className={dark ? 'text-islamic-gold' : 'text-amber-700'}
                    />
                    <span>
                      Sub-word Morpheme Breakdown ({segments.length} segment{segments.length > 1 ? 's' : ''})
                    </span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {segments.map((seg, idx) => {
                      const segMeta = getCategoryMeta(seg.category, palette);
                      return (
                        <div
                          key={idx}
                          className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${cardBg}`}
                        >
                          <div className="space-y-0.5">
                            <span
                              className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${getCategoryBadgeClass(
                                seg.category,
                                theme,
                                seg,
                                palette
                              )}`}
                            >
                              {segMeta.en}
                            </span>
                            <p className="text-xs font-medium opacity-90 mt-1">
                              {seg.pos_name_en || seg.pos_name_ar}
                            </p>
                            {seg.case && (
                              <p className="text-[11px] opacity-75 font-mono">{seg.case}</p>
                            )}
                          </div>

                          <div className="quran-text-pak !text-2xl !leading-[1.6] [text-shadow:none] !text-inherit text-right shrink-0">
                            <span className={getCategoryTextClass(seg.category, theme, seg, palette)}>
                              {seg.text}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                  <div className={`p-3.5 rounded-xl border ${cardBg}`}>
                    <span className="text-[11px] font-bold uppercase tracking-wider opacity-70 block mb-1">
                      Root
                    </span>
                    {word.root ? (
                      <div>
                        <span
                          className={`quran-text-pak !text-2xl !leading-[1.6] [text-shadow:none] font-bold tracking-widest block ${
                            dark ? '!text-islamic-gold' : '!text-amber-700'
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
                      <span className="text-xs opacity-60 italic">Fixed Word / Particle</span>
                    )}
                  </div>

                  <div className={`p-3.5 rounded-xl border ${cardBg}`}>
                    <span className="text-[11px] font-bold uppercase tracking-wider opacity-70 block mb-1">
                      Pattern
                    </span>
                    {word.wazn || word.lemma ? (
                      <div>
                        {word.wazn && (
                          <span className={`text-sm font-semibold block ${dark ? 'text-amber-300' : 'text-amber-700'}`}>
                            {word.wazn}
                          </span>
                        )}
                        {word.lemma && (
                          <span className={`quran-text-pak !text-xl !leading-[1.6] [text-shadow:none] block mt-0.5 ${dark ? '!text-slate-100' : '!text-slate-900'}`}>
                            {word.lemma}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs opacity-60 italic">Base Word</span>
                    )}
                  </div>

                  <div className={`p-3.5 rounded-xl border ${cardBg}`}>
                    <span className="text-[11px] font-bold uppercase tracking-wider opacity-70 block mb-1">
                      Grammar State
                    </span>
                    {word.irab ? (
                      <span className={`text-sm font-bold block mt-1 ${dark ? 'text-sky-300' : 'text-blue-700'}`}>
                        {word.irab}
                      </span>
                    ) : (
                      <span className="text-xs opacity-60 italic">Fixed (unchanging)</span>
                    )}
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-current/15 text-[11px] opacity-80">
          <div className="flex items-center gap-3">
            {LEGEND.map((l) => (
              <span key={l.label} className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${palette === 'surah_100' ? l.dot100 : l.dot}`} />
                {l.label}
              </span>
            ))}
          </div>
          <div className="hidden sm:flex flex-wrap items-center gap-1.5 font-mono">
            <kbd className={`px-1.5 py-0.5 rounded text-[10px] ${kbd}`}>← →</kbd>
            <span>Words</span>
            {isEnhanced && (
              <>
                <kbd className={`px-1.5 py-0.5 rounded text-[10px] ${kbd}`}>1 2 3</kbd>
                <span>Tabs</span>
              </>
            )}
            <kbd className={`px-1.5 py-0.5 rounded text-[10px] ${kbd}`}>?</kbd>
            <span>Color guide</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const hasEnhancedData = (word) =>
  Boolean(word && (word.sarf || word.sarf_note_en || word.irab?.en || word.insight));

/* ------------------------------ Public component ------------------------------ */
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
  const isEnhanced = hasEnhancedData(word);

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

  // Start at the top whenever the word changes.
  useEffect(() => {
    dialogRef.current?.scrollTo?.({ top: 0 });
  }, [word]);

  useEffect(() => {
    if (!word) return;

    const handleKeyDown = (e) => {
      if (typeof document !== 'undefined' && document.querySelector('dialog[open]')) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose?.();
        return;
      }

      if (isEnhanced && (e.key === '1' || e.key === '2' || e.key === '3')) {
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        const tab = TABS[Number(e.key) - 1];
        if (tab) {
          e.preventDefault();
          setActiveTab(tab.id);
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

  // AnimatePresence stays mounted so the sheet slides out cleanly.
  return (
    <AnimatePresence>
      {word && (
        <Sheet
          key="grammar-sheet"
          word={word}
          theme={theme}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          dialogRef={dialogRef}
          tabRefs={tabRefs}
          onClose={onClose}
          onNavigateWord={onNavigateWord}
          hasPreviousWord={hasPreviousWord}
          hasNextWord={hasNextWord}
          onOpenAyah={onOpenAyah}
        />
      )}
    </AnimatePresence>
  );
};

export default GrammarBottomSheet;
