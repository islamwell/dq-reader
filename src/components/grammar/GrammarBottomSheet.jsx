import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, useDragControls, useReducedMotion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import GrammarVisualIcon from './GrammarVisualIcons';
import {
  getCategoryMeta,
  getCategoryBadgeClass,
  getCategoryTextClass,
  isDarkSurface
} from './sarfStyles';
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
      ? 'scale-110 -translate-y-0.5 [text-shadow:0_0_22px_currentColor]'
      : hasActive
        ? 'opacity-40 hover:opacity-80'
        : 'hover:opacity-80'
  ].join(' ');

/* ---------------------------- Theme & Color Maps ---------------------------- */
const THEME_SURFACE_STYLES = {
  green: 'bg-emerald-950/96 text-emerald-50',
  red: 'bg-rose-950/96 text-rose-50',
  blue: 'bg-slate-900/96 text-blue-50',
  light: 'bg-white text-slate-900',
  dark: 'bg-slate-900 text-slate-100',
  sepia: 'bg-amber-50 text-amber-950'
};

const THEME_CARD_BG = {
  green: 'bg-emerald-900/55 border-emerald-700/80',
  red: 'bg-rose-900/55 border-rose-700/80',
  blue: 'bg-slate-800/70 border-blue-800/70',
  light: 'bg-slate-50/90 border-slate-200/90',
  dark: 'bg-slate-800/75 border-slate-700/80',
  sepia: 'bg-amber-100/60 border-amber-300/80'
};

const FRAME_GRADIENT_COLORS = {
  surah_103: ['#10b981', '#ef4444', '#eab308', '#0d9488'],
  surah_100: ['#dc2626', '#059669', '#2563eb', '#f59e0b'],
  default: ['#4f46e5', '#0d9488', '#f59e0b', '#db2777']
};

const LEGEND = [
  { label: 'Name', dot: 'bg-blue-500', dot100: 'bg-red-600', dot103: 'bg-red-600' },
  { label: 'Action', dot: 'bg-amber-500', dot100: 'bg-emerald-600', dot103: 'bg-emerald-600' },
  { label: 'Small word', dot: 'bg-emerald-500', dot100: 'bg-blue-600', dot103: 'bg-yellow-500' }
];

// High-contrast accessible hex colors [lightSurface, darkSurface]
const TONE_HEX = {
  verb: ['#047857', '#34d399'],
  ism: ['#dc2626', '#f87171'],
  harf103: ['#a16207', '#facc15'],
  harf100: ['#1d4ed8', '#60a5fa'],
  harfDefault: ['#059669', '#34d399'],
  past: ['#d97706', '#fbbf24'],
  present: ['#059669', '#34d399'],
  future: ['#0891b2', '#22d3ee'],
  link: ['#db2777', '#f472b6'],
  act: ['#16a34a', '#4ade80'],
  passive: ['#7c3aed', '#c084fc'],
  third: ['#9333ea', '#c084fc'],
  masc: ['#2563eb', '#60a5fa'],
  fem: ['#db2777', '#f472b6'],
  plur: ['#ea580c', '#fb923c'],
  sing: ['#0284c7', '#38bdf8'],
  def: ['#0d9488', '#2dd4bf'],
  role: ['#4f46e5', '#818cf8'],
  emphasis: ['#dc2626', '#f87171'],
  habit: ['#0891b2', '#22d3ee'],
  root: ['#b45309', '#fbbf24']
};

const getToneColor = (tone, dark, palette = 'surah_103') => {
  if (tone === 'harf') {
    const key = palette === 'surah_100' ? 'harf100' : palette === 'surah_103' ? 'harf103' : 'harfDefault';
    return TONE_HEX[key][dark ? 1 : 0];
  }
  if (tone === 'fil') return TONE_HEX.verb[dark ? 1 : 0];
  const pair = TONE_HEX[tone] || TONE_HEX.habit;
  return pair[dark ? 1 : 0];
};

const TABS = [
  { id: 'morphology', label: 'Facts', srSuffix: 'Ṣarf', icon: Fi('FiGrid') },
  { id: 'syntax', label: 'In this verse', srSuffix: 'Iʿrāb', icon: Fi('FiCompass') },
  { id: 'insight', label: 'Insight', srSuffix: '', icon: Fi('FiSun') }
];

/* ------------------------------------------------------------------
   TRAITS — preserved export for plain-English trait extraction
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

/* ------------------------------------------------------------------
   SUBJECT LABEL HELPER — Never calls verb endings "Pronoun"!
   Returns concise plain-English subject like "They", "She", "We", "He".
------------------------------------------------------------------- */
const getVerbSubjectLabel = (word) => {
  const person = s(word?.sarf?.verb?.person_en || '');
  const is1st = /1st|first|\bi\b|\bwe\b/.test(person);
  const is2nd = /2nd|second|\byou\b/.test(person);
  const isPlur = /\bplur|\bthey\b|\bwe\b/.test(person);
  const isFem = /\bfem|\bshe\b/.test(person);

  if (is1st) return isPlur ? 'We' : 'I';
  if (is2nd) return isPlur ? 'You all' : 'You';
  if (isPlur) return 'They';
  return isFem ? 'She' : 'He';
};

/* ------------------------------------------------------------------
   HERO BRACKET CHIP BUILDER — maps each Arabic morpheme segment
   to a clean visual chip with icon, title, short meaning & color.
------------------------------------------------------------------- */
const cleanShortMeaning = (text, fallback) => {
  if (!text) return fallback;
  const cleaned = text
    .replace(/^\s*(and|by|to|in|the)\s+/i, '')
    .replace(/\s*\([^)]*\)\s*/g, ' ')
    .replace(/\[[^\]]*\]/g, '')
    .trim();
  const short = cleaned || text.trim();
  return short.length > 18 ? `${short.slice(0, 16).trim()}…` : short;
};

export const buildDiagramChips = (word, palette, dark) => {
  const segments = word?.segments || [];
  if (!segments.length) return [];

  return segments.map((seg, idx) => {
    const isSubjectEnding = Boolean(
      seg.is_subject_ending || (seg.role === 'suffix' && seg.category === 'fil')
    );

    if (isSubjectEnding) {
      const subjectLabel = getVerbSubjectLabel(word);
      return {
        segIndex: idx,
        id: `seg-${idx}`,
        icon: 'person',
        title: subjectLabel,
        value: 'who did it',
        color: getToneColor('verb', dark, palette)
      };
    }

    if (seg.category === 'fil') {
      return {
        segIndex: idx,
        id: `seg-${idx}`,
        icon: 'verb',
        title: 'Verb',
        value: cleanShortMeaning(word.translation, 'action'),
        color: getToneColor('verb', dark, palette)
      };
    }

    if (seg.category === 'harf') {
      const posLow = s(seg.pos_name_en);
      if (seg.emphasis || seg.tag === 'EMPH' || posLow.includes('oath')) {
        const isOath = posLow.includes('oath');
        return {
          segIndex: idx,
          id: `seg-${idx}`,
          icon: 'emphasis',
          title: isOath ? 'Oath' : 'Emphasis',
          value: isOath ? 'By…' : seg.text === 'إِنَّ' ? 'indeed' : 'surely',
          color: getToneColor('harf', dark, palette)
        };
      }
      if (seg.tag === 'DET' || posLow.includes('definite')) {
        return {
          segIndex: idx,
          id: `seg-${idx}`,
          icon: 'def',
          title: 'The',
          value: 'al-',
          color: getToneColor('harf', dark, palette)
        };
      }
      if (seg.tag === 'CONJ' || posLow.includes('conjunction')) {
        return {
          segIndex: idx,
          id: `seg-${idx}`,
          icon: 'link',
          title: 'And',
          value: 'connects',
          color: getToneColor('harf', dark, palette)
        };
      }
      if (seg.tag === 'EXP' || posLow.includes('except')) {
        return {
          segIndex: idx,
          id: `seg-${idx}`,
          icon: 'particle',
          title: 'Except',
          value: 'lifts out',
          color: getToneColor('harf', dark, palette)
        };
      }
      if (seg.tag === 'P' || posLow.includes('preposition')) {
        const gloss = seg.text.startsWith('ب') ? 'to / with' : seg.text.startsWith('ف') ? 'inside' : 'link';
        return {
          segIndex: idx,
          id: `seg-${idx}`,
          icon: 'link',
          title: 'Link',
          value: gloss,
          color: getToneColor('harf', dark, palette)
        };
      }
      return {
        segIndex: idx,
        id: `seg-${idx}`,
        icon: 'particle',
        title: 'Particle',
        value: cleanShortMeaning(word.translation, 'small word'),
        color: getToneColor('harf', dark, palette)
      };
    }

    // ism (noun, relative pronoun, or attached object/possessive pronoun like كُمْ / هُمْ)
    if (seg.role === 'suffix') {
      const label = cleanShortMeaning(seg.pos_name_en, 'object');
      return {
        segIndex: idx,
        id: `seg-${idx}`,
        icon: 'person',
        title: 'Attached',
        value: label,
        color: getToneColor('ism', dark, palette)
      };
    }

    if (seg.tag === 'REL' || s(seg.pos_name_en).includes('relative')) {
      return {
        segIndex: idx,
        id: `seg-${idx}`,
        icon: 'plur',
        title: 'Who',
        value: 'those who',
        color: getToneColor('ism', dark, palette)
      };
    }

    return {
      segIndex: idx,
      id: `seg-${idx}`,
      icon: 'noun',
      title: 'Noun',
      value: cleanShortMeaning(word.translation, 'name'),
      color: getToneColor('ism', dark, palette)
    };
  });
};

/* Helper: measure element's box relative to ancestor using offset* (immune to CSS transforms) */
const getOffsetRelativeTo = (el, ancestor) => {
  let left = 0;
  let top = 0;
  let cur = el;
  let guard = 0;
  while (cur && cur !== ancestor && guard < 12) {
    left += cur.offsetLeft || 0;
    top += cur.offsetTop || 0;
    cur = cur.offsetParent;
    guard += 1;
  }
  return {
    left,
    top,
    width: el.offsetWidth || 0,
    height: el.offsetHeight || 0
  };
};

/* ------------------------------------------------------------------
   HERO BRACKET DIAGRAM — Animated SVG curved lines connecting each
   morpheme segment directly to its floating icon chip underneath.
------------------------------------------------------------------- */
const WordBracketDiagram = ({ word, theme, palette, dark }) => {
  const boxRef = useRef(null);
  const segRefs = useRef([]);
  const chipRefs = useRef([]);
  const lastWidthRef = useRef(0);
  const [layout, setLayout] = useState(null);

  const segments = useMemo(() => word?.segments || [], [word]);
  const chips = useMemo(() => buildDiagramChips(word, palette, dark), [word, palette, dark]);

  const computeLayout = useCallback(() => {
    const box = boxRef.current;
    if (!box || !chips.length) {
      setLayout((prev) => (prev === null ? prev : null));
      return;
    }

    const W = box.clientWidth || box.offsetWidth;
    if (!W || W < 40) {
      setLayout((prev) => (prev === null ? prev : null));
      return;
    }

    const measured = chips
      .map((chip, idx) => {
        const segEl = segRefs.current[chip.segIndex];
        const chipEl = chipRefs.current[idx];
        if (!segEl || !chipEl) return null;
        const sr = getOffsetRelativeTo(segEl, box);
        const chipWidth = chipEl.offsetWidth || 0;
        const chipHeight = chipEl.offsetHeight || 44;
        if (!sr.width || !chipWidth) return null;

        const l = sr.left + 2;
        const r = sr.left + sr.width - 2;
        const y = sr.top + sr.height - 8;
        return {
          idx,
          chip,
          l,
          r,
          cx: (l + r) / 2,
          y,
          w: chipWidth,
          h: chipHeight
        };
      })
      .filter(Boolean);

    if (measured.length !== chips.length) {
      setLayout((prev) => (prev === null ? prev : null));
      return;
    }

    // Sort left-to-right on screen (in RTL Arabic: suffix -> stem -> prefix)
    const ordered = [...measured].sort((a, b) => a.cx - b.cx);
    const gap = 10;
    const xs = ordered.map((m) => m.cx);

    // Push overlapping adjacent chips apart
    for (let i = 1; i < ordered.length; i += 1) {
      const minCenterDist = (ordered[i - 1].w + ordered[i].w) / 2 + gap;
      const dist = xs[i] - xs[i - 1];
      if (dist < minCenterDist) {
        const shift = (minCenterDist - dist) / 2;
        xs[i - 1] -= shift;
        xs[i] += shift;
      }
    }

    // Clamp to container bounds and re-sweep to keep clean spacing
    const pad = 4;
    if (ordered.length > 0) {
      xs[0] = Math.max(ordered[0].w / 2 + pad, xs[0]);
      for (let i = 1; i < ordered.length; i += 1) {
        const minX = xs[i - 1] + (ordered[i - 1].w + ordered[i].w) / 2 + gap;
        if (xs[i] < minX) xs[i] = minX;
      }
      const last = ordered.length - 1;
      const maxRight = W - ordered[last].w / 2 - pad;
      if (xs[last] > maxRight) {
        xs[last] = maxRight;
        for (let i = last - 1; i >= 0; i -= 1) {
          const maxX = xs[i + 1] - (ordered[i].w + ordered[i + 1].w) / 2 - gap;
          if (xs[i] > maxX) xs[i] = maxX;
        }
      }
    }

    const top = Math.max(...ordered.map((m) => m.y)) + 40;
    const maxChipH = Math.max(...ordered.map((m) => m.h));
    const positions = {};
    const paths = [];

    ordered.forEach((m, i) => {
      const x = Math.round(Math.min(Math.max(xs[i], m.w / 2 + pad), W - m.w / 2 - pad));
      positions[m.idx] = { left: x, top: Math.round(top) };

      const span = Math.max(0, m.r - m.l);
      const rad = Math.min(7, Math.max(1.5, span / 3));
      const bracketPart =
        span > 6
          ? `M${m.l.toFixed(1)} ${(m.y - rad).toFixed(1)} Q${m.l.toFixed(1)} ${m.y.toFixed(1)} ${(m.l + rad).toFixed(1)} ${m.y.toFixed(1)} H${(m.r - rad).toFixed(1)} Q${m.r.toFixed(1)} ${m.y.toFixed(1)} ${m.r.toFixed(1)} ${(m.y - rad).toFixed(1)}`
          : `M${m.cx.toFixed(1)} ${(m.y - 4).toFixed(1)} V${m.y.toFixed(1)}`;
      const stemPart = `M${m.cx.toFixed(1)} ${m.y.toFixed(1)} C${m.cx.toFixed(1)} ${(m.y + 20).toFixed(1)} ${x} ${(top - 20).toFixed(1)} ${x} ${top.toFixed(1)}`;
      paths.push({
        id: m.chip.id,
        color: m.chip.color,
        d: `${bracketPart} ${stemPart}`
      });
    });

    const nextLayout = {
      height: Math.ceil(top + maxChipH + 8),
      positions,
      paths
    };

    // Only update state when computed geometry genuinely changed (eliminates layout loops)
    setLayout((prev) => {
      if (
        prev &&
        prev.height === nextLayout.height &&
        prev.paths.length === nextLayout.paths.length &&
        prev.paths.every((p, i) => p.d === nextLayout.paths[i].d && p.color === nextLayout.paths[i].color)
      ) {
        return prev;
      }
      return nextLayout;
    });
  }, [chips]);

  useLayoutEffect(() => {
    lastWidthRef.current = boxRef.current?.clientWidth || 0;
    computeLayout();
    let cancelled = false;
    if (typeof document !== 'undefined' && document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (!cancelled) computeLayout();
      });
    }
    let observer;
    if (typeof ResizeObserver !== 'undefined' && boxRef.current) {
      observer = new ResizeObserver((entries) => {
        const entryWidth = Math.round(entries?.[0]?.contentRect?.width || boxRef.current?.clientWidth || 0);
        // Only recompute on horizontal width changes — never on our own minHeight update!
        if (entryWidth > 0 && entryWidth !== lastWidthRef.current) {
          lastWidthRef.current = entryWidth;
          computeLayout();
        }
      });
      observer.observe(boxRef.current);
    }
    return () => {
      cancelled = true;
      observer?.disconnect();
    };
  }, [computeLayout, word?.text_uthmani]);

  return (
    <div
      ref={boxRef}
      data-testid="word-bracket-diagram"
      style={layout ? { minHeight: `${layout.height}px` } : undefined}
      className="relative text-center select-none"
    >
      {/* Large Arabic Word — no spaces between spans so cursive joining stays authentic */}
      <div
        dir="rtl"
        className="quran-text-pak !text-5xl sm:!text-6xl !leading-[1.65] [text-shadow:none] !text-inherit inline-block"
      >
        {segments.map((seg, i) => (
          <span
            key={i}
            ref={(el) => { segRefs.current[i] = el; }}
            className={getCategoryTextClass(seg.category, theme, seg, palette)}
          >{seg.text}</span>
        ))}
      </div>

      {/* Animated SVG curved bracket connectors */}
      {layout?.paths?.length > 0 && (
        <svg
          data-testid="bracket-connector-svg"
          aria-hidden="true"
          className="absolute inset-0 w-full h-full overflow-visible pointer-events-none"
        >
          {layout.paths.map((p) => (
            <path
              key={p.id}
              pathLength={1}
              d={p.d}
              stroke={p.color}
              className="grammar-bracket-path"
            />
          ))}
        </svg>
      )}

      {/* Floating pill chips (positioned beneath brackets when measured, clean flex row fallback) */}
      <div
        className={
          layout
            ? 'pointer-events-none'
            : 'mt-3 flex flex-wrap items-center justify-center gap-2'
        }
      >
        {chips.map((chip, idx) => {
          const pos = layout?.positions?.[idx];
          return (
            <div
              key={chip.id}
              ref={(el) => { chipRefs.current[idx] = el; }}
              data-testid="diagram-morpheme-chip"
              style={{
                '--c': chip.color,
                ...(pos
                  ? {
                      position: 'absolute',
                      left: `${pos.left}px`,
                      top: `${pos.top}px`,
                      transform: 'translateX(-50%)'
                    }
                  : {})
              }}
              className="grammar-chip pointer-events-auto inline-flex items-center gap-2 py-1 pl-1.5 pr-3 rounded-full whitespace-nowrap shadow-2xs"
            >
              <span className="grammar-chip-dot w-7 h-7 rounded-full grid place-items-center text-white shrink-0">
                <GrammarVisualIcon name={chip.icon} className="w-4 h-4" />
              </span>
              <span className="text-left leading-tight">
                <b
                  className="block text-[10px] font-extrabold tracking-[0.12em] uppercase"
                  style={{ color: chip.color }}
                >
                  {chip.title}
                </b>
                <span className="block text-xs font-bold">{chip.value}</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------
   TENSE TIMELINE WIDGET (then • ── | NOW)
------------------------------------------------------------------- */
const TenseTimeline = ({ kind = 'past', color }) => {
  const dotLeft = kind === 'present' ? '76%' : kind === 'future' ? '84%' : '22%';
  const nowLeft = kind === 'future' ? '34%' : '76%';

  return (
    <div
      data-testid="tense-timeline"
      className="grammar-tl ml-auto"
      style={{ '--tl-color': color }}
      aria-hidden="true"
    >
      <span className="grammar-tl-pulse" style={{ left: dotLeft }} />
      <span className="grammar-tl-dot" style={{ left: dotLeft }} />
      <span className="grammar-tl-now" style={{ left: nowLeft }} />
      <small className="grammar-tl-label" style={{ left: nowLeft }}>
        NOW
      </small>
    </div>
  );
};

/* ------------------------------------------------------------------
   VISUAL FEATURE GROUPS — replaces old Bento tiles with prototype's
   2-column grouped icon cards (with "They" instead of "Pronoun"!).
------------------------------------------------------------------- */
export const buildFeatureGroups = (word, palette, dark) => {
  const sarf = word?.sarf;
  const segments = word?.segments || [];

  // 1. VERBS (e.g. ءَامَنُوا۟, وَعَمِلُوا۟, وَتَوَاصَوْا۟, Surah 100 verbs)
  if (sarf?.verb) {
    const v = sarf.verb;
    const verbColor = getToneColor('verb', dark, palette);
    const stemSeg = segments.find((seg) => seg.role === 'stem');
    const suffixSeg = segments.find((seg) => seg.is_subject_ending || (seg.role === 'suffix' && seg.category === 'fil'));
    const lemmaAr = v.conjugation?.[0]?.ar || stemSeg?.text || word.text_uthmani;

    // Column 1: Verb (Tense + Timeline, Form Meaning, Active/Passive Voice)
    const verbTiles = [];
    const tenseRaw = s(v.tense_en || word.tense || '');
    if (has(tenseRaw, 'command', 'amr', 'imperative')) {
      verbTiles.push({
        key: 'tense',
        icon: 'command',
        title: 'Command',
        subtitle: 'telling someone to do it',
        color: getToneColor('future', dark, palette)
      });
    } else if (has(tenseRaw, 'present', 'imperfect') && !has(tenseRaw, 'past', 'perfect')) {
      verbTiles.push({
        key: 'tense',
        icon: 'present',
        title: 'Now or later',
        subtitle: 'ongoing or habitual action',
        color: getToneColor('present', dark, palette),
        timeline: 'present'
      });
    } else if (has(tenseRaw, 'past', 'perfect') && has(tenseRaw, 'future')) {
      verbTiles.push({
        key: 'tense',
        icon: 'past',
        title: 'Certain future',
        subtitle: 'spoken as already guaranteed',
        color: getToneColor('past', dark, palette),
        timeline: 'future'
      });
    } else {
      verbTiles.push({
        key: 'tense',
        icon: 'past',
        title: 'Past',
        subtitle: 'already happened',
        color: getToneColor('past', dark, palette),
        timeline: 'past'
      });
    }

    // Form meaning tile (e.g. Form VI Mutual, Form IV Causative, Form I Base action)
    const formTitle =
      v.form === 'VI'
        ? 'Mutual'
        : v.form === 'IV'
          ? 'Form IV'
          : v.form
            ? `Form ${v.form}`
            : 'Action';
    const formSub = v.meaning_of_form_en
      ? v.meaning_of_form_en.replace(/^[^—–-]+[-—–]\s*/i, '').trim()
      : 'core meaning of the root';
    verbTiles.push({
      key: 'form',
      icon: 'link',
      title: formTitle,
      subtitle: formSub,
      color: getToneColor('link', dark, palette)
    });

    const isPassive = has(v.voice_en || word.voice, 'passive', 'majhul');
    verbTiles.push({
      key: 'voice',
      icon: isPassive ? 'passive' : 'act',
      title: isPassive ? 'Passive' : 'Active',
      subtitle: isPassive ? 'the action is done to it' : 'the subject is the doer',
      color: getToneColor(isPassive ? 'passive' : 'act', dark, palette)
    });

    // Column 2: Subject ("They" — NEVER "Pronoun" — unified in verb green color!)
    const subjectTitle = getVerbSubjectLabel(word);
    const subjectTiles = [];
    const personRaw = s(v.person_en || '');
    const is1st = /1st|first|\bi\b|\bwe\b/.test(personRaw);
    const is2nd = /2nd|second|\byou\b/.test(personRaw);
    subjectTiles.push({
      key: 'person',
      icon: is1st || is2nd ? 'person' : 'third',
      title: is1st ? '1st person' : is2nd ? '2nd person' : '3rd person',
      subtitle: is1st
        ? 'the speaker (I / we)'
        : is2nd
          ? 'the one addressed (you)'
          : 'spoken about, not present',
      color: getToneColor('third', dark, palette)
    });

    const isFem = /\bfem|\bshe\b/.test(personRaw);
    const isMasc = !isFem && /\bmasc|\bhe\b/.test(personRaw);
    if (isFem || isMasc) {
      subjectTiles.push({
        key: 'gender',
        icon: isFem ? 'fem' : 'masc',
        title: isFem ? 'Feminine' : 'Masculine',
        subtitle: isFem ? 'female group or subject' : 'men, or a mixed group',
        color: getToneColor(isFem ? 'fem' : 'masc', dark, palette)
      });
    }

    const isDual = /\bdual\b/.test(personRaw);
    const isPlur = /\bplur|\bthey\b|\bwe\b/.test(personRaw);
    subjectTiles.push({
      key: 'number',
      icon: isDual ? 'dual' : isPlur ? 'plur' : 'sing',
      title: isDual ? 'Dual' : isPlur ? 'Plural' : 'Singular',
      subtitle: isDual ? 'exactly two' : isPlur ? 'three or more' : 'just one',
      color: getToneColor(isPlur ? 'plur' : 'sing', dark, palette)
    });

    return [
      { key: 'verb-col', title: 'Verb', ar: lemmaAr, color: verbColor, tiles: verbTiles },
      {
        key: 'subject-col',
        title: subjectTitle,
        ar: suffixSeg?.text || '',
        color: verbColor,
        tiles: subjectTiles
      }
    ];
  }

  // 2. NOUNS (e.g. وَٱلْعَصْرِ, ٱلْإِنسَـٰنَ, خُسْرٍ, ٱلصَّـٰلِحَـٰتِ, بِٱلْحَقِّ, بِٱلصَّبْرِ)
  if (sarf?.noun) {
    const n = sarf.noun;
    const ismColor = getToneColor('ism', dark, palette);
    const stemSeg = segments.find((seg) => seg.role === 'stem');

    const nounTiles = [];
    const isIndef = /\bindef|\bnakira/.test(s(n.definiteness_en));
    nounTiles.push({
      key: 'def',
      icon: isIndef ? 'indef' : 'def',
      title: isIndef ? 'General' : 'Specific',
      subtitle: isIndef ? 'open & vast (tanwīn)' : 'particular one (“the”)',
      color: getToneColor('def', dark, palette)
    });

    const caseLow = s(n.case_en);
    if (/gen|jar|iḍāfa|oath/.test(caseLow)) {
      nounTiles.push({
        key: 'case',
        icon: 'link',
        title: 'Linked',
        subtitle: 'follows “by”, “in”, or “to”',
        color: getToneColor('role', dark, palette)
      });
    } else if (/acc|nasb|object/.test(caseLow)) {
      nounTiles.push({
        key: 'case',
        icon: 'target',
        title: 'Target',
        subtitle: 'receives the action or focus',
        color: getToneColor('link', dark, palette)
      });
    } else {
      nounTiles.push({
        key: 'case',
        icon: 'verb',
        title: 'Main part',
        subtitle: 'subject or main statement',
        color: getToneColor('act', dark, palette)
      });
    }

    if (word.has_emphasis) {
      nounTiles.push({
        key: 'emphasis',
        icon: 'emphasis',
        title: 'Oath stress',
        subtitle: 'opens a solemn oath (“By…”)',
        color: getToneColor('emphasis', dark, palette)
      });
    } else if (n.singular_ar) {
      nounTiles.push({
        key: 'singular',
        icon: 'sing',
        title: 'One of them',
        subtitle: `${n.singular_ar} · ${n.singular_en || 'singular'}`,
        color: getToneColor('past', dark, palette)
      });
    }

    const formTiles = [];
    const isFem = /\bfem/.test(s(n.gender_en));
    formTiles.push({
      key: 'gender',
      icon: isFem ? 'fem' : 'masc',
      title: isFem ? 'Feminine' : 'Masculine',
      subtitle: isFem ? 'feminine noun form' : 'masculine noun form',
      color: getToneColor(isFem ? 'fem' : 'masc', dark, palette)
    });

    const isDual = /\bdual\b/.test(s(n.number_en));
    const isPlur = /\bplur/.test(s(n.number_en));
    formTiles.push({
      key: 'number',
      icon: isDual ? 'dual' : isPlur ? 'plur' : 'sing',
      title: isDual ? 'Dual' : isPlur ? 'Plural' : 'Singular',
      subtitle: isDual ? 'exactly two' : isPlur ? 'three or more' : 'one single noun',
      color: getToneColor(isPlur ? 'plur' : 'sing', dark, palette)
    });

    if (word.idafa) {
      formTiles.push({
        key: 'idafa',
        icon: 'link',
        title: word.idafa.label_en,
        subtitle: `${word.idafa.mudaf_ar} + ${word.idafa.mudaf_ilayhi_ar}`,
        color: getToneColor('past', dark, palette)
      });
    } else if (word.role_en) {
      formTiles.push({
        key: 'role',
        icon: 'verse',
        title: 'Verse role',
        subtitle: word.role_en,
        color: getToneColor('habit', dark, palette)
      });
    }

    return [
      { key: 'noun-col', title: 'Noun', ar: stemSeg?.text || word.text_uthmani, color: ismColor, tiles: nounTiles },
      { key: 'form-col', title: 'Form', ar: n.number_ar?.split(' ')[0] || '', color: getToneColor('role', dark, palette), tiles: formTiles }
    ];
  }

  // 3. PARTICLES & FIXED WORDS (e.g. إِنَّ, لَفِى, إِلَّا, ٱلَّذِينَ)
  const isHarf = word?.primary_category === 'harf';
  const mainColor = getToneColor(isHarf ? 'harf' : 'ism', dark, palette);

  const leftTiles = [
    {
      key: 'fixed',
      icon: 'anchor',
      title: 'Fixed word',
      subtitle: 'stays the same — never inflects',
      color: getToneColor('role', dark, palette)
    }
  ];

  if (word?.has_emphasis) {
    leftTiles.push({
      key: 'emphasis',
      icon: 'emphasis',
      title: 'Strong stress',
      subtitle: 'adds certainty & emphasis',
      color: getToneColor('emphasis', dark, palette)
    });
  } else if (word?.role_en) {
    leftTiles.push({
      key: 'role',
      icon: 'link',
      title: word.role_en,
      subtitle: isHarf ? 'shapes the clause around it' : 'points to the group that follows',
      color: getToneColor('link', dark, palette)
    });
  }

  const rightTiles = segments.map((seg, idx) => ({
    key: `seg-desc-${idx}`,
    icon: seg.emphasis ? 'emphasis' : seg.tag === 'REL' ? 'plur' : 'particle',
    title: seg.pos_name_en || (seg.category === 'harf' ? 'Particle' : 'Word'),
    subtitle: seg.desc_en || word.sarf_note_en || 'shapes meaning in this verse',
    color: getToneColor(idx === 0 ? 'habit' : 'past', dark, palette)
  }));

  return [
    {
      key: 'main-col',
      title: isHarf ? 'Particle' : 'Who',
      ar: word?.text_uthmani || '',
      color: mainColor,
      tiles: leftTiles
    },
    {
      key: 'effect-col',
      title: 'Effect',
      ar: '',
      color: getToneColor('habit', dark, palette),
      tiles: rightTiles
    }
  ];
};

/* ------------------------------------------------------------------
   BOTTOM DUO ROW — "In this verse" equation + "Root" popping tiles
------------------------------------------------------------------- */
const VisualDuoRow = ({ word, palette, dark, cardBg, reduce }) => {
  const habitColor = getToneColor('habit', dark, palette);
  const rootColor = getToneColor('root', dark, palette);

  // Build "In this verse" equation data (curated in_verse -> idafa -> generic word role)
  const verseEq = useMemo(() => {
    if (word?.in_verse) {
      return {
        a: {
          ar: word.in_verse.a.ar,
          en: word.in_verse.a.en,
          color: getToneColor(word.in_verse.a.tone || 'verb', dark, palette)
        },
        op: word.in_verse.op || '+',
        b: {
          ar: word.in_verse.b.ar,
          en: word.in_verse.b.en,
          color: getToneColor(word.in_verse.b.tone || 'ism', dark, palette)
        },
        result: word.in_verse.result,
        note: word.in_verse.note
      };
    }
    if (word?.idafa) {
      return {
        a: {
          ar: word.idafa.mudaf_ar,
          en: 'Muḍāf (of…)',
          color: getToneColor('ism', dark, palette)
        },
        op: '+',
        b: {
          ar: word.idafa.mudaf_ilayhi_ar,
          en: 'Muḍāf Ilayhi',
          color: getToneColor('link', dark, palette)
        },
        result: word.idafa.label_en,
        note: word.idafa.explanation_en || 'Linked possessive pair'
      };
    }
    return null;
  }, [word, dark, palette]);

  const rootLetters = word?.sarf?.root || [];
  const deletedRadicals = word?.sarf?.deleted_radicals || [];
  const slotKeys = rootLetters.length === 4 ? ['f', 'a', 'l', 'l2'] : ['f', 'a', 'l'];

  return (
    <div
      data-testid="visual-duo-row"
      className="grid grid-cols-1 sm:grid-cols-[1.45fr_1fr] gap-3 pt-1"
    >
      {/* Left Card: In this verse */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduce ? { duration: 0.01 } : { delay: 0.22, duration: 0.35 }}
        className={`rounded-[20px] p-3.5 border ${cardBg}`}
      >
        <h4
          className="flex items-center gap-2 text-[11px] font-bold tracking-[0.14em] uppercase mb-2.5"
          style={{ color: habitColor }}
        >
          <GrammarVisualIcon name="verse" className="w-[18px] h-[18px] shrink-0" />
          <span>In this verse</span>
        </h4>

        {verseEq ? (
          <>
            <div dir="rtl" className="flex items-center justify-center gap-2 flex-wrap">
              <div
                className="grammar-eq-blk text-center px-3 py-1 rounded-2xl"
                style={{ '--c': verseEq.a.color }}
              >
                <b
                  className="block quran-text-pak !text-2xl !leading-[1.55] [text-shadow:none]"
                  style={{ color: verseEq.a.color }}
                >
                  {verseEq.a.ar}
                </b>
                <span dir="ltr" className="block text-[11px] font-bold opacity-85">
                  {verseEq.a.en}
                </span>
              </div>

              <span className="text-lg font-light opacity-50 select-none" aria-hidden="true">
                {verseEq.op}
              </span>

              <div
                className="grammar-eq-blk text-center px-3 py-1 rounded-2xl"
                style={{ '--c': verseEq.b.color }}
              >
                <b
                  className="block quran-text-pak !text-2xl !leading-[1.55] [text-shadow:none]"
                  style={{ color: verseEq.b.color }}
                >
                  {verseEq.b.ar}
                </b>
                <span dir="ltr" className="block text-[11px] font-bold opacity-85">
                  {verseEq.b.en}
                </span>
              </div>
            </div>

            <div
              className={`mt-2.5 px-3 py-2 rounded-2xl flex items-center justify-center gap-2.5 ${
                dark
                  ? 'bg-cyan-950/50 border border-cyan-500/30'
                  : 'bg-gradient-to-r from-cyan-50 to-indigo-50 border border-cyan-200/70'
              }`}
            >
              <GrammarVisualIcon
                name="loop"
                className="w-5 h-5 shrink-0 grammar-loop-spin"
              />
              <div className="min-w-0 text-left">
                <div className="text-sm font-extrabold leading-tight">
                  {verseEq.result}
                </div>
                {verseEq.note && (
                  <small className="block text-[11px] opacity-75 leading-snug mt-0.5">
                    {verseEq.note}
                  </small>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-2">
            {word?.role_en && (
              <p className="text-sm font-bold leading-snug">{word.role_en}</p>
            )}
            <p className="text-xs opacity-80 leading-relaxed">
              {word?.irab?.en || word?.ayahStructure?.en || 'Tap the In this verse tab for full sentence flow.'}
            </p>
          </div>
        )}
      </motion.div>

      {/* Right Card: Root letter blocks (RTL popping tiles) */}
      <motion.div
        data-testid="visual-root-card"
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduce ? { duration: 0.01 } : { delay: 0.28, duration: 0.35 }}
        className={`rounded-[20px] p-3.5 border flex flex-col justify-between ${cardBg}`}
      >
        <h4
          className="flex items-center gap-2 text-[11px] font-bold tracking-[0.14em] uppercase mb-2.5"
          style={{ color: rootColor }}
        >
          <GrammarVisualIcon name="root" className="w-[18px] h-[18px] shrink-0" />
          <span>{rootLetters.length ? 'Root' : 'Fixed Word'}</span>
        </h4>

        {rootLetters.length > 0 ? (
          <div className="my-auto">
            <div dir="rtl" className="flex items-center justify-center gap-2">
              {rootLetters.map((letter, idx) => {
                const isDropped = deletedRadicals.includes(slotKeys[idx]);
                return (
                  <i
                    key={`${letter}-${idx}`}
                    style={{ '--rd': `${0.25 + idx * 0.13}s` }}
                    title={isDropped ? 'Dropped in this spelling for smoother pronunciation' : undefined}
                    className={`grammar-root-tile not-italic quran-text-pak !text-2xl !leading-none [text-shadow:none] w-11 h-12 grid place-items-center rounded-[13px] border-[1.5px] font-bold ${
                      isDropped ? 'border-dashed opacity-70 line-through' : ''
                    } ${
                      dark
                        ? 'bg-amber-950/55 border-amber-500/50 !text-amber-300'
                        : 'bg-amber-50 border-amber-300 !text-amber-800'
                    }`}
                  >
                    {letter}
                  </i>
                );
              })}
            </div>
            <p className="text-center mt-2.5 text-xs sm:text-[13px] font-bold leading-snug opacity-90">
              {word.sarf.root_meaning}
            </p>
          </div>
        ) : (
          <div className="my-auto text-center py-1">
            <span
              className={`inline-flex items-center justify-center w-11 h-11 rounded-2xl mb-2 ${
                dark ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-100 text-amber-800'
              }`}
            >
              <GrammarVisualIcon name="anchor" className="w-5 h-5" />
            </span>
            <p className="text-xs font-semibold leading-relaxed opacity-85">
              {word?.sarf_note_en || 'Particles and fixed words do not derive from a 3-letter root.'}
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

/* ------------------------------------------------------------------
   FACTS PANEL — Grouped Prototype Feature Tiles + Duo Cards.
   For verbs: "Conjugation Table" button opens VerbConjugationModal
   (which directly includes the detailed morphology & Sound Tip content).
   For non-verbs: Detailed morphology content renders directly below.
------------------------------------------------------------------- */
const FactsPanel = ({ word, theme, palette, cardBg, dark, reduce, onOpenAyah }) => {
  const [isConjugationModalOpen, setIsConjugationModalOpen] = useState(false);

  const groups = useMemo(() => buildFeatureGroups(word, palette, dark), [word, palette, dark]);
  const hasVerbConjugation = Boolean(
    word?.sarf?.verb?.conjugation_table || word?.sarf?.verb?.conjugation
  );

  return (
    <div className="space-y-3.5" data-testid="facts-panel">
      {/* Grouped Feature Tiles (2 columns on desktop, 1 on mobile) */}
      <div
        data-testid="visual-feature-groups"
        className={`grid gap-3.5 ${groups.length > 1 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}
      >
        {groups.map((group) => (
          <div key={group.key} data-testid={`feature-group-${group.key}`}>
            <div
              className="grammar-group-heading flex items-center gap-2 text-[11px] font-bold tracking-[0.14em] uppercase mb-2.5"
              style={{ '--c': group.color }}
            >
              <span>{group.title}</span>
              {group.ar && (
                <em
                  dir="rtl"
                  className="not-italic quran-text-pak !text-xl !leading-none [text-shadow:none] tracking-normal"
                  style={{ color: group.color }}
                >
                  {group.ar}
                </em>
              )}
            </div>

            <div className="space-y-2">
              {group.tiles.map((tile, k) => (
                <motion.div
                  key={tile.key}
                  data-testid="visual-feature-tile"
                  initial={reduce ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={
                    reduce
                      ? { duration: 0.01 }
                      : { delay: 0.06 * k + 0.08, duration: 0.32, ease: 'easeOut' }
                  }
                  style={{ '--c': tile.color, '--p': `${k * 0.5}s` }}
                  className="grammar-tile relative flex items-center gap-3 p-2.5 rounded-[18px]"
                >
                  <div className="grammar-ic flex-none w-11 h-11 rounded-[14px] grid place-items-center">
                    <GrammarVisualIcon name={tile.icon} className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <b
                      className="block text-[15px] font-extrabold tracking-tight leading-tight"
                      style={{ color: tile.color }}
                    >
                      {tile.title}
                    </b>
                    <span className="block text-xs opacity-75 leading-snug mt-0.5">
                      {tile.subtitle}
                    </span>
                  </div>
                  {tile.timeline && (
                    <TenseTimeline kind={tile.timeline} color={tile.color} />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Duo Cards: "In this verse" + "Root" */}
      <VisualDuoRow word={word} palette={palette} dark={dark} cardBg={cardBg} reduce={reduce} />

      {/* Verbs: Conjugation Table trigger (details live directly inside VerbConjugationModal) */}
      {hasVerbConjugation ? (
        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
          <button
            type="button"
            data-testid="open-conjugation-modal"
            onClick={() => setIsConjugationModalOpen(true)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold border transition-all duration-150 shadow-xs hover:shadow-md active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 ${
              dark
                ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/80 hover:bg-emerald-900'
                : 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
            }`}
          >
            <SafeIcon icon={Fi('FiMaximize2')} className="text-xs" aria-hidden="true" />
            <span>Conjugation Table</span>
          </button>
        </div>
      ) : (
        <div className="pt-1" data-testid="inline-more-details-body">
          <MorphologyTab
            word={word}
            theme={theme}
            cardBg={cardBg}
            onOpenAyah={onOpenAyah}
            hideConjugationButton={true}
          />
        </div>
      )}

      {hasVerbConjugation && (
        <VerbConjugationModal
          isOpen={isConjugationModalOpen}
          onClose={() => setIsConjugationModalOpen(false)}
          word={word}
          theme={theme}
          onOpenAyah={onOpenAyah}
          renderMoreDetails={(handleJumpAyah) => (
            <MorphologyTab
              word={word}
              theme={theme}
              cardBg={cardBg}
              onOpenAyah={handleJumpAyah}
              hideConjugationButton={true}
            />
          )}
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
    className={`p-2 rounded-full border transition-all duration-150 hover:shadow-md active:scale-95 disabled:opacity-30 disabled:pointer-events-none disabled:cursor-not-allowed ${className}`}
  >
    <SafeIcon icon={icon} className="text-base" aria-hidden="true" />
  </button>
);

/* ------------------------------ The Sheet ------------------------------ */
const Sheet = ({
  word, theme, activeTab, setActiveTab, navDir, dialogRef, tabRefs,
  onClose, onNavigateWord, hasPreviousWord, hasNextWord, onOpenAyah
}) => {
  const controls = useDragControls();
  const reduce = useReducedMotion();
  const [motionPaused, setMotionPaused] = useState(false);

  const isEnhanced = hasEnhancedData(word);
  const palette =
    word.color_palette === 'surah_100'
      ? 'surah_100'
      : word.color_palette === 'surah_103' || Number(word.surahNumber) === 103
        ? 'surah_103'
        : 'default';
  const dark = isDarkSurface(theme);
  const surfaceStyle = THEME_SURFACE_STYLES[theme] || THEME_SURFACE_STYLES.light;
  const cardBg = THEME_CARD_BG[theme] || THEME_CARD_BG.light;
  const segments = word.segments || [];
  const singularAr = word.sarf?.noun?.singular_ar;
  const singularEn = word.sarf?.noun?.singular_en;
  const wordKey = `${word.surahNumber ?? ''}-${word.ayahNumber ?? ''}-${word.position ?? ''}-${word.text_uthmani}`;

  const frameColors = FRAME_GRADIENT_COLORS[palette] || FRAME_GRADIENT_COLORS.default;
  const mixBase = dark ? '#0f172a' : theme === 'sepia' ? '#fffbeb' : '#ffffff';
  const tileBorderBase = dark ? '#1e293b' : mixBase;

  const totalWords = word.wordsInAyah?.length || 0;
  const currentWordIndex = totalWords > 0
    ? word.wordsInAyah.findIndex(
        (w) =>
          w.position === word.position &&
          (w.ayahNumber == null || word.ayahNumber == null || w.ayahNumber === word.ayahNumber)
      )
    : -1;
  const progressPct =
    totalWords > 1 && currentWordIndex >= 0
      ? Math.round(((currentWordIndex + 1) / totalWords) * 100)
      : null;

  const navBtn = dark
    ? 'border-white/20 bg-white/5 hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400'
    : 'border-slate-300/90 bg-slate-100/80 hover:bg-slate-200/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500';
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
    <motion.div
      data-testid="grammar-floating-wrapper"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, pointerEvents: 'none', transition: { duration: 0.14 } }}
      className="fixed inset-x-0 bottom-6 sm:bottom-10 md:bottom-12 z-[70] flex justify-center px-3 sm:px-6 pointer-events-none"
    >
      {/* Animated conic-gradient border frame */}
      <motion.div
        drag="y"
        dragControls={controls}
        dragListener={false}
        dragConstraints={{ top: -70, bottom: 0 }}
        dragElastic={{ top: 0.25, bottom: 0.5 }}
        onDragEnd={(_, info) => {
          if (info.offset.y > 85 || info.velocity.y > 480) onClose?.();
        }}
        initial={reduce ? { opacity: 0 } : { y: 40, scale: 0.95, opacity: 0 }}
        animate={reduce ? { opacity: 1 } : { y: 0, scale: 1, opacity: 1 }}
        exit={
          reduce
            ? { opacity: 0, transition: { duration: 0.01 } }
            : { y: 32, scale: 0.96, opacity: 0, transition: { duration: 0.14, ease: 'easeOut' } }
        }
        transition={reduce ? { duration: 0.01 } : { type: 'spring', damping: 24, stiffness: 320 }}
        style={{
          '--gf-c1': frameColors[0],
          '--gf-c2': frameColors[1],
          '--gf-c3': frameColors[2],
          '--gf-c4': frameColors[3],
          '--chip-base': mixBase,
          '--tile-base': mixBase,
          '--tile-border-base': tileBorderBase,
          '--eq-base': mixBase
        }}
        className={`grammar-modal-frame pointer-events-auto w-full max-w-[680px] ${
          motionPaused || reduce ? 'grammar-motion-paused' : ''
        }`}
      >
        <div
          ref={dialogRef}
          tabIndex={-1}
          role="dialog"
          aria-label={`Grammar details for ${word.text_uthmani}`}
          className={`relative w-full max-h-[64vh] sm:max-h-[70vh] overflow-y-auto rounded-[25.5px] px-4 sm:px-6 pb-4 focus:outline-none ${surfaceStyle}`}
        >
          {/* Drag handle */}
          <div
            onPointerDown={(e) => controls.start(e)}
            className="relative touch-none cursor-grab active:cursor-grabbing pt-2.5 pb-1.5"
            aria-hidden="true"
          >
            <div className={`w-11 h-1.5 rounded-full mx-auto ${dark ? 'bg-white/25' : 'bg-slate-300/90'}`} />
          </div>

          {/* Header Bar */}
          <div className="relative flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${
                  dark
                    ? 'bg-emerald-950/70 text-emerald-200 border-emerald-700/60'
                    : 'bg-slate-100 text-slate-800 border-slate-200'
                }`}
              >
                <SafeIcon icon={Fi('FiBookOpen')} className="text-xs opacity-75" aria-hidden="true" />
                {place}
              </span>

              {progressPct !== null && (
                <div
                  aria-hidden="true"
                  className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-mono ${
                    dark ? 'bg-white/5 border-white/10 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-600'
                  }`}
                >
                  <div className={`w-12 h-1.5 rounded-full overflow-hidden ${dark ? 'bg-white/15' : 'bg-slate-300/80'}`}>
                    <div
                      style={{ width: `${progressPct}%` }}
                      className="h-full rounded-full bg-emerald-500 transition-[width] duration-300"
                    />
                  </div>
                  <span>{currentWordIndex + 1}/{totalWords}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <NavBtn icon={Fi('FiChevronLeft')} label="Previous word" title="Previous word ([ or ←)" onClick={() => onNavigateWord?.(-1)} disabled={!hasPreviousWord} className={navBtn} />
              <NavBtn icon={Fi('FiChevronRight')} label="Next word" title="Next word (] or →)" onClick={() => onNavigateWord?.(1)} disabled={!hasNextWord} className={navBtn} />
              <button
                type="button"
                onClick={onClose}
                title="Close (Esc)"
                aria-label="Close grammar panel"
                className={`ml-1 w-9 h-9 rounded-full border grid place-items-center transition-all duration-200 hover:rotate-90 active:scale-95 ${navBtn}`}
              >
                <GrammarVisualIcon name="x" className="w-4 h-4" />
              </button>
            </div>
          </div>

          <motion.div
            key={wordKey}
            initial={reduce ? false : { opacity: 0, x: navDir * 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={reduce ? { duration: 0.01 } : { type: 'spring', damping: 24, stiffness: 320 }}
            className="relative"
          >
            {/* Hero Stage: Animated Bracket Diagram + Gloss + Badges */}
            <div
              data-testid="grammar-hero-stage"
              className={`relative rounded-[22px] border text-center px-3 sm:px-5 pt-2 pb-4 mb-4 ${cardBg}`}
            >
              {isEnhanced ? (
                <WordBracketDiagram
                  word={word}
                  theme={theme}
                  palette={palette}
                  dark={dark}
                />
              ) : (
                <div className="quran-text-pak !text-4xl sm:!text-5xl !leading-[1.7] [text-shadow:none] !text-inherit">
                  {segments.map((seg, i) => (
                    <span
                      key={i}
                      className={getCategoryTextClass(seg.category, theme, seg, palette)}
                    >{seg.text}</span>
                  ))}
                </div>
              )}

              <p className="mt-2 text-xl sm:text-2xl font-extrabold tracking-tight">
                {word.translation}
              </p>

              {(word.idafa || singularAr) && (
                <div className="mt-2.5 flex flex-wrap items-center justify-center gap-2">
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
              )}
            </div>

            {isEnhanced ? (
              <div className="mb-3">
                <div
                  role="tablist"
                  aria-label="Word grammar analysis"
                  onKeyDown={handleTabListKeyDown}
                  className={`grid grid-cols-3 p-1 rounded-full mb-4 border ${
                    dark ? 'bg-black/30 border-white/10' : 'bg-slate-100/90 border-slate-200/80'
                  }`}
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
                        className={`relative flex items-center justify-center gap-1.5 px-2 py-2 rounded-full text-xs font-bold transition-all duration-150 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 ${
                          selected ? (dark ? 'text-emerald-200' : 'text-slate-900') : 'opacity-65 hover:opacity-100'
                        }`}
                      >
                        {selected && (
                          <motion.span
                            layoutId="grammar-tab-pill"
                            transition={reduce ? { duration: 0.01 } : { type: 'spring', damping: 26, stiffness: 360 }}
                            className={`absolute inset-0 rounded-full border ${
                              dark
                                ? 'bg-emerald-500/20 border-emerald-400/50 shadow-sm'
                                : 'bg-white border-slate-300/90 shadow-sm'
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
                  <motion.div
                    key={activeTab}
                    initial={reduce ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={reduce ? { duration: 0.01 } : { duration: 0.22, ease: 'easeOut' }}
                  >
                    {activeTab === 'morphology' && (
                      <FactsPanel
                        word={word}
                        theme={theme}
                        palette={palette}
                        cardBg={cardBg}
                        dark={dark}
                        reduce={reduce}
                        onOpenAyah={onOpenAyah}
                      />
                    )}
                    {activeTab === 'syntax' && <SyntaxTab word={word} theme={theme} cardBg={cardBg} />}
                    {activeTab === 'insight' && <InsightTab word={word} theme={theme} cardBg={cardBg} />}
                  </motion.div>
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

          {/* Footer: Color Legend + Motion Pause Control + Shortcuts */}
          <div className="relative flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-current/15 text-[11px] opacity-85">
            <div className="flex items-center gap-3">
              {LEGEND.map((l) => (
                <span key={l.label} className="flex items-center gap-1">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      palette === 'surah_100'
                        ? l.dot100
                        : palette === 'surah_103'
                          ? l.dot103
                          : l.dot
                    }`}
                  />
                  {l.label}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {!reduce && (
                <button
                  type="button"
                  data-testid="toggle-modal-motion"
                  onClick={() => setMotionPaused((p) => !p)}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 ${
                    dark
                      ? 'border-white/15 bg-white/5 hover:bg-white/15 text-slate-200'
                      : 'border-slate-300/90 bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <SafeIcon icon={Fi(motionPaused ? 'FiPlay' : 'FiPause')} className="text-[10px]" aria-hidden="true" />
                  <span>{motionPaused ? 'Play motion' : 'Pause motion'}</span>
                </button>
              )}

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
          </div>
        </div>
      </motion.div>
    </motion.div>
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
  const [navDir, setNavDir] = useState(1);
  const dialogRef = useRef(null);
  const previousFocusRef = useRef(null);
  const tabRefs = useRef({});
  const wasOpenRef = useRef(false);
  const isEnhanced = hasEnhancedData(word);

  const handleNavigate = (dir) => {
    setNavDir(dir >= 0 ? 1 : -1);
    onNavigateWord?.(dir);
  };

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
        setNavDir(-1);
        onNavigateWord?.(-1);
      } else if (e.key === ']' || (!inTablist && e.key === 'ArrowRight')) {
        e.preventDefault();
        setNavDir(1);
        onNavigateWord?.(1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [word, isEnhanced, onClose, onNavigateWord]);

  // Light-dismiss when clicking or tapping outside the floating modal box
  // (keeps the surah scrollable & lets tapping another Arabic word switch directly).
  useEffect(() => {
    if (!word) return undefined;

    let pressedOutside = false;
    let startedInside = false;
    let closedViaPointer = false;

    const resolveElement = (target) => {
      if (!target) return null;
      return target.nodeType === 1 ? target : target.parentElement || null;
    };

    const isEventTargetIgnored = (target) => {
      const el = resolveElement(target);
      if (!el || typeof el.closest !== 'function') return false;
      if (dialogRef.current?.contains(el)) return true;
      if (document.querySelector('dialog[open]')) return true;
      if (el.closest('[data-arabic-word], .grammar-word-pill, .grammar-word-card')) {
        return true;
      }
      return false;
    };

    const handlePointerDown = (e) => {
      closedViaPointer = false;
      const el = resolveElement(e.target);
      if (el && dialogRef.current?.contains(el)) {
        startedInside = true;
        pressedOutside = false;
        return;
      }
      startedInside = false;
      pressedOutside = !isEventTargetIgnored(e.target);
    };

    const handlePointerUp = (e) => {
      if (pressedOutside && !startedInside && !isEventTargetIgnored(e.target)) {
        closedViaPointer = true;
        pressedOutside = false;
        onClose?.();
        return;
      }
      pressedOutside = false;
    };

    const handleDocumentClick = (e) => {
      if (closedViaPointer) {
        closedViaPointer = false;
        return;
      }
      if (startedInside) {
        startedInside = false;
        return;
      }
      if (!isEventTargetIgnored(e.target)) {
        onClose?.();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('pointerup', handlePointerUp);
    document.addEventListener('click', handleDocumentClick);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [word, onClose]);

  return (
    <AnimatePresence>
      {word && (
        <Sheet
          key="grammar-sheet"
          word={word}
          theme={theme}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          navDir={navDir}
          dialogRef={dialogRef}
          tabRefs={tabRefs}
          onClose={onClose}
          onNavigateWord={handleNavigate}
          hasPreviousWord={hasPreviousWord}
          hasNextWord={hasNextWord}
          onOpenAyah={onOpenAyah}
        />
      )}
    </AnimatePresence>
  );
};

export default GrammarBottomSheet;
