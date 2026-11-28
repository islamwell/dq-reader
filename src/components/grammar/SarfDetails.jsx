import React, { useState } from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import {
  isDarkSurface,
  parseQuranRef
} from './sarfStyles';
import VerbConjugationModal from './VerbConjugationModal';

const {
  FiArrowUpRight,
  FiLink,
  FiMaximize2,
  FiGitBranch,
  FiClock,
  FiUsers,
  FiShield,
  FiHash,
  FiCheckCircle,
  FiUser,
  FiVolume2,
  FiInfo,
  FiBookOpen,
  FiTarget,
  FiNavigation,
  FiSun,
  FiAnchor,
  FiSliders
} = FiIcons;

/* ------------------------------------------------------------------------ */
/* Reusable Icon-Led Quick Building Blocks                                  */
/* ------------------------------------------------------------------------ */

const SectionHeading = ({ icon, title, subtitle, theme, accentClass = '' }) => {
  const dark = isDarkSurface(theme);
  const iconTone = accentClass || (dark ? 'text-amber-300' : 'text-amber-700');
  return (
    <div className="flex items-center justify-between gap-2 mb-2.5">
      <h4 className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider opacity-85">
        <SafeIcon icon={icon} className={`text-sm shrink-0 ${iconTone}`} aria-hidden="true" />
        <span>{title}</span>
      </h4>
      {subtitle && <span className="text-[11px] opacity-65">{subtitle}</span>}
    </div>
  );
};

const QuickFactCard = ({ icon, label, valueArabic, valueEn, theme, cardBg, accent = 'amber' }) => {
  if (!valueArabic && !valueEn) return null;
  const dark = isDarkSurface(theme);
  const badgePalette = {
    amber: dark ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-100 text-amber-700',
    emerald: dark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-700',
    blue: dark ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700',
    rose: dark ? 'bg-rose-500/20 text-rose-300' : 'bg-rose-100 text-rose-700',
    violet: dark ? 'bg-violet-500/20 text-violet-300' : 'bg-violet-100 text-violet-700'
  }[accent] || (dark ? 'bg-white/10 text-slate-200' : 'bg-slate-200 text-slate-700');

  return (
    <div className={`p-3 rounded-xl border flex items-start gap-2.5 ${cardBg}`}>
      <span
        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${badgePalette}`}
        aria-hidden="true"
      >
        <SafeIcon icon={icon} className="text-sm" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] font-bold uppercase tracking-wider opacity-65">{label}</div>
        {valueArabic && (
          <p dir="rtl" className="font-arabic text-lg font-bold leading-snug text-right">
            {valueArabic}
          </p>
        )}
        {valueEn && <p className="text-xs font-medium opacity-90 leading-snug mt-0.5">{valueEn}</p>}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------------ */
/* Iḍāfa Possessive Pair Card: 1. Muḍāf ("of…") → 2. Muḍāf Ilayhi           */
/* ------------------------------------------------------------------------ */

export const IdafaCard = ({ idafa, theme }) => {
  if (!idafa) return null;
  const dark = isDarkSurface(theme);

  return (
    <div
      data-testid="idafa-card"
      className={`p-4 rounded-2xl border-2 ${
        dark
          ? 'bg-amber-950/35 border-amber-500/60 text-amber-50'
          : 'bg-amber-50/80 border-amber-400/90 text-slate-900'
      }`}
    >
      <div className="flex items-center gap-2 mb-3">
        <span
          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
            dark ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-200/80 text-amber-800'
          }`}
          aria-hidden="true"
        >
          <SafeIcon icon={FiLink} className="text-sm" />
        </span>
        <span className="text-xs font-bold uppercase tracking-wider">
          Possessive Pair (Iḍāfa) · {idafa.label_en}
        </span>
      </div>

      {/* Visual RTL Chain: 1. Muḍāf ("of…") → 2. Muḍāf Ilayhi */}
      <div dir="rtl" className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 items-stretch mb-3">
        <div
          className={`p-3 rounded-xl border ${
            idafa.type === 'mudaf' || idafa.type === 'compound'
              ? dark
                ? 'bg-red-950/60 border-red-500/70 ring-1 ring-amber-400/60'
                : 'bg-white border-red-300 ring-1 ring-amber-400'
              : dark
                ? 'bg-black/25 border-white/10'
                : 'bg-white/80 border-slate-200'
          }`}
        >
          <div dir="ltr" className="text-[11px] font-bold uppercase opacity-75 mb-1">
            1. Muḍāf (&ldquo;of…&rdquo;)
          </div>
          <div
            className={`quran-text-pak !text-3xl !leading-[1.6] [text-shadow:none] font-bold ${
              dark ? '!text-red-300' : '!text-red-700'
            }`}
          >
            {idafa.mudaf_ar}
          </div>
          <p dir="ltr" className="text-xs opacity-85 text-left mt-0.5 leading-snug">
            {idafa.mudaf_en}
          </p>
        </div>

        <div
          className={`p-3 rounded-xl border ${
            idafa.type === 'mudaf_ilayhi' || idafa.type === 'compound'
              ? dark
                ? 'bg-rose-950/60 border-rose-500/70 ring-1 ring-amber-400/60'
                : 'bg-white border-rose-300 ring-1 ring-amber-400'
              : dark
                ? 'bg-black/25 border-white/10'
                : 'bg-white/80 border-slate-200'
          }`}
        >
          <div dir="ltr" className="text-[11px] font-bold uppercase opacity-75 mb-1">
            2. Muḍāf Ilayhi (ends in -i)
          </div>
          <div
            className={`quran-text-pak !text-3xl !leading-[1.6] [text-shadow:none] font-bold ${
              dark ? '!text-rose-200' : '!text-rose-800'
            }`}
          >
            {idafa.mudaf_ilayhi_ar}
          </div>
          <p dir="ltr" className="text-xs opacity-85 text-left mt-0.5 leading-snug">
            {idafa.mudaf_ilayhi_en}
          </p>
        </div>
      </div>

      {idafa.explanation_en && (
        <p className="text-xs opacity-90 leading-relaxed">
          {idafa.explanation_en}
        </p>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------------ */
/* Clean Root & Core Idea Card (replaces confusing ف ع ل / فَعْلِ grid)      */
/* ------------------------------------------------------------------------ */

export const RootSummaryCard = ({ sarf, theme, cardBg }) => {
  if (!sarf?.root?.length) return null;
  const dark = isDarkSurface(theme);
  const deleted = sarf.deleted_radicals || [];
  const slotKeys = sarf.root.length === 4 ? ['f', 'a', 'l', 'l2'] : ['f', 'a', 'l'];

  return (
    <div className={`p-4 rounded-2xl border ${cardBg}`} data-testid="root-summary-card">
      <SectionHeading
        icon={FiGitBranch}
        title={`${sarf.root.length}-Letter Root & Core Meaning`}
        theme={theme}
      />

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div dir="rtl" className="flex items-center justify-center gap-2 shrink-0">
          {sarf.root.map((letter, idx) => {
            const isDropped = deleted.includes(slotKeys[idx]);
            return (
              <div
                key={`${letter}-${idx}`}
                className={`w-12 h-12 rounded-xl border-2 flex flex-col items-center justify-center ${
                  isDropped ? 'border-dashed opacity-70' : ''
                } ${
                  dark
                    ? 'border-amber-500/40 bg-amber-950/40 text-amber-200'
                    : 'border-amber-300 bg-white text-amber-900'
                }`}
                title={isDropped ? 'Dropped in this spelling for smoother pronunciation' : undefined}
              >
                <span
                  className={`quran-text-pak !text-2xl !leading-none [text-shadow:none] font-bold ${
                    dark ? '!text-amber-200' : '!text-amber-800'
                  } ${isDropped ? 'line-through' : ''}`}
                >
                  {letter}
                </span>
              </div>
            );
          })}
        </div>

        <div className="text-center sm:text-left flex-1 min-w-0">
          <p className="text-sm font-semibold leading-snug">{sarf.root_meaning}</p>
          {sarf.word_type_en && (
            <p className="text-xs opacity-75 mt-1 leading-snug">{sarf.word_type_en}</p>
          )}
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------------ */
/* Tabs                                                                       */
/* ------------------------------------------------------------------------ */

export const MorphologyTab = ({ word, theme, cardBg, onOpenAyah, hideConjugationButton = false }) => {
  const [isConjugationModalOpen, setIsConjugationModalOpen] = useState(false);
  const dark = isDarkSurface(theme);
  const sarf = word.sarf;
  const passiveForms =
    sarf?.verb?.passive?.length
      ? sarf.verb.passive
      : sarf?.verb?.conjugation_table?.passive?.length
        ? sarf.verb.conjugation_table.passive.slice(0, 2)
        : [];

  return (
    <div className="space-y-4">
      {/* 1. Possessive Pair (Iḍāfa) when present */}
      {word.idafa && <IdafaCard idafa={word.idafa} theme={theme} />}

      {/* 2. Root & Quick Icon Facts */}
      {!sarf ? (
        <div
          className={`p-4 rounded-2xl border flex items-start gap-3 ${cardBg}`}
          data-testid="sarf-note"
        >
          <span
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              dark ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700'
            }`}
            aria-hidden="true"
          >
            <SafeIcon icon={FiAnchor} className="text-base" />
          </span>
          <div>
            <p className="text-sm font-bold">Fixed Word — Never Changes Form</p>
            {word.sarf_note_en && (
              <p className="text-xs opacity-85 mt-0.5 leading-relaxed">{word.sarf_note_en}</p>
            )}
          </div>
        </div>
      ) : (
        <>
          <RootSummaryCard sarf={sarf} theme={theme} cardBg={cardBg} />

          {/* At-a-glance Icon Fact Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5" data-testid="quick-facts-grid">
            {sarf.noun?.singular_ar && (
              <QuickFactCard
                icon={FiUser}
                label="Singular Form"
                valueArabic={sarf.noun.singular_ar}
                valueEn={sarf.noun.singular_en}
                theme={theme}
                cardBg={cardBg}
                accent="rose"
              />
            )}
            {sarf.verb && (
              <>
                <QuickFactCard
                  icon={FiClock}
                  label="Tense (When)"
                  valueEn={sarf.verb.tense_en}
                  theme={theme}
                  cardBg={cardBg}
                  accent="emerald"
                />
                <QuickFactCard
                  icon={FiUsers}
                  label="Who Does the Action"
                  valueEn={sarf.verb.person_en}
                  theme={theme}
                  cardBg={cardBg}
                  accent="blue"
                />
                <QuickFactCard
                  icon={FiShield}
                  label="Voice (Active / Passive)"
                  valueEn={sarf.verb.voice_en}
                  theme={theme}
                  cardBg={cardBg}
                  accent="violet"
                />
                <QuickFactCard
                  icon={FiSliders}
                  label={`Verb Form ${sarf.verb.form}`}
                  valueArabic={sarf.verb.pattern}
                  valueEn={sarf.verb.meaning_of_form_en}
                  theme={theme}
                  cardBg={cardBg}
                  accent="emerald"
                />
              </>
            )}
            {sarf.noun && (
              <>
                <QuickFactCard
                  icon={FiHash}
                  label="Count & Gender"
                  valueEn={`${sarf.noun.number_en} · ${sarf.noun.gender_en}`}
                  theme={theme}
                  cardBg={cardBg}
                  accent="rose"
                />
                <QuickFactCard
                  icon={FiCheckCircle}
                  label="Specificity & Ending"
                  valueEn={`${sarf.noun.definiteness_en} · ${sarf.noun.case_en}`}
                  theme={theme}
                  cardBg={cardBg}
                  accent="blue"
                />
              </>
            )}
          </div>

          {/* 4. Verb Conjugation Strip + Passive Forms + Full Sub-Modal Trigger */}
          {sarf.verb?.conjugation && (
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider opacity-85">
                  <SafeIcon
                    icon={FiSliders}
                    className={`text-sm ${dark ? 'text-emerald-300' : 'text-emerald-700'}`}
                    aria-hidden="true"
                  />
                  <span>Quick Verb Forms</span>
                </h4>

                {!hideConjugationButton && (
                  <button
                    type="button"
                    data-testid="open-conjugation-modal"
                    onClick={() => setIsConjugationModalOpen(true)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 ${
                      dark
                        ? 'bg-emerald-950/90 text-emerald-200 border-emerald-600 hover:bg-emerald-900'
                        : 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
                    }`}
                  >
                    <SafeIcon icon={FiMaximize2} className="text-xs" aria-hidden="true" />
                    <span>Open Full Conjugation Table</span>
                  </button>
                )}
              </div>

              <div dir="rtl" className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {sarf.verb.conjugation.map((c) => (
                  <div key={c.label_en} className={`p-2 rounded-xl border text-center ${cardBg}`}>
                    <div className={`quran-text-pak !text-2xl !leading-[1.7] [text-shadow:none] ${dark ? '!text-slate-100' : '!text-slate-900'}`}>
                      {c.ar}
                    </div>
                    <div className="text-[10px] uppercase tracking-wider opacity-75" dir="ltr">
                      {c.label_en}
                    </div>
                  </div>
                ))}
              </div>

              {passiveForms.length > 0 && (
                <div
                  data-testid="verb-passive-strip"
                  className={`p-3 rounded-2xl border ${
                    dark
                      ? 'bg-emerald-950/35 border-emerald-700/50'
                      : 'bg-emerald-50/70 border-emerald-200/90'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider opacity-85 mb-2">
                    <SafeIcon
                      icon={FiShield}
                      className={dark ? 'text-emerald-300' : 'text-emerald-700'}
                      aria-hidden="true"
                    />
                    <span>Passive Form (&ldquo;It was…&rdquo;)</span>
                  </div>
                  <div dir="rtl" className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {passiveForms.map((p) => (
                      <div
                        key={p.label_en}
                        className={`p-2.5 rounded-xl border text-center ${cardBg}`}
                      >
                        <div className="text-[10px] font-semibold uppercase tracking-wider opacity-75" dir="ltr">
                          {p.label_en}
                        </div>
                        <div
                          className={`quran-text-pak !text-2xl !leading-[1.6] [text-shadow:none] font-bold ${
                            dark ? '!text-emerald-300' : '!text-emerald-700'
                          }`}
                        >
                          {p.ar}
                        </div>
                        {p.en && (
                          <div className="text-xs opacity-85 mt-0.5" dir="ltr">
                            {p.en}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!hideConjugationButton && (
                <VerbConjugationModal
                  isOpen={isConjugationModalOpen}
                  onClose={() => setIsConjugationModalOpen(false)}
                  word={word}
                  theme={theme}
                />
              )}
            </div>
          )}

          {/* 5. Quick Sound Tip (only when letters merged/changed/dropped) */}
          {sarf.transformation?.en && (
            <div
              data-testid="sound-tip-card"
              className={`p-3.5 rounded-2xl border-l-4 border-l-violet-500 border flex items-start gap-3 ${cardBg}`}
            >
              <span
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                  dark ? 'bg-violet-500/20 text-violet-300' : 'bg-violet-100 text-violet-700'
                }`}
                aria-hidden="true"
              >
                <SafeIcon icon={FiVolume2} className="text-sm" />
              </span>
              <div className="min-w-0 flex-1 space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider opacity-80">
                  Sound Tip · {sarf.transformation.type_en || 'Pronunciation'}
                </div>

                {/* Animated Arabic Before -> After visual letter flow */}
                {Array.isArray(sarf.transformation.steps) && sarf.transformation.steps.length > 0 && (
                  <div
                    dir="ltr"
                    data-testid="sound-tip-flow"
                    className="flex flex-wrap items-center gap-2 pt-0.5"
                  >
                    {sarf.transformation.steps.map((step, stepIdx) => {
                      const isFinal = stepIdx === sarf.transformation.steps.length - 1;
                      const hasDropped = step.parts?.some((p) => p.s === 'dropped');
                      return (
                        <React.Fragment key={`${step.label}-${stepIdx}`}>
                          {stepIdx > 0 && (
                            <span
                              aria-hidden="true"
                              className={`text-base font-bold select-none ${
                                dark ? 'text-violet-300' : 'text-violet-600'
                              }`}
                            >
                              →
                            </span>
                          )}
                          <div
                            data-testid={`sound-step-${step.label.toLowerCase()}`}
                            className={`px-3 py-1.5 rounded-xl border text-center ${
                              isFinal
                                ? dark
                                  ? 'bg-emerald-950/60 border-emerald-500/60'
                                  : 'bg-emerald-50 border-emerald-300'
                                : hasDropped
                                  ? dark
                                    ? 'bg-rose-950/45 border-rose-500/50'
                                    : 'bg-rose-50/80 border-rose-200'
                                  : dark
                                    ? 'bg-white/5 border-white/15'
                                    : 'bg-white border-slate-200'
                            }`}
                          >
                            <span className="block text-[9px] font-bold uppercase tracking-wider opacity-70">
                              {step.label}
                            </span>
                            <span
                              dir="rtl"
                              className="quran-text-pak !text-2xl !leading-[1.55] [text-shadow:none] !text-inherit block"
                            >
                              {step.parts.map((part, partIdx) => {
                                let partClass = dark ? 'text-slate-100' : 'text-slate-900';
                                if (part.s === 'dropped') {
                                  partClass = dark ? 'sound-letter-dropped-dark' : 'sound-letter-dropped';
                                } else if (part.s === 'changed') {
                                  partClass = dark ? 'text-amber-300 font-bold' : 'text-amber-700 font-bold';
                                } else if (part.s === 'result') {
                                  partClass = dark ? 'text-emerald-300 font-bold' : 'text-emerald-700 font-bold';
                                }
                                return (
                                  <span
                                    key={partIdx}
                                    data-letter-state={part.s}
                                    className={partClass}
                                  >{part.t}</span>
                                );
                              })}
                            </span>
                          </div>
                        </React.Fragment>
                      );
                    })}
                  </div>
                )}

                <p className="text-xs opacity-90 leading-relaxed">{sarf.transformation.en}</p>
              </div>
            </div>
          )}

          {sarf.scholarly_note_en && (
            <div className={`p-3.5 rounded-2xl border-l-4 border-l-amber-500 border flex items-start gap-3 ${cardBg}`}>
              <span
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                  dark ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-100 text-amber-700'
                }`}
                aria-hidden="true"
              >
                <SafeIcon icon={FiInfo} className="text-sm" />
              </span>
              <div className="min-w-0">
                <div className="text-[11px] font-bold uppercase tracking-wider opacity-80">
                  Good to Know
                </div>
                <p className="text-xs opacity-90 mt-1 leading-relaxed">{sarf.scholarly_note_en}</p>
              </div>
            </div>
          )}

          {/* 6. Same Root Across the Qur'an */}
          {sarf.family?.length > 0 && (
            <div>
              <SectionHeading
                icon={FiBookOpen}
                title={`Same Root (${sarf.root.join(' – ')}) in the Qur'an`}
                subtitle="Tap to jump"
                theme={theme}
              />
              <div dir="rtl" className="flex flex-wrap gap-2">
                {sarf.family.map((f) => {
                  const parsedRef = parseQuranRef(f.ref);
                  const canNavigate = Boolean(parsedRef && onOpenAyah);
                  const chipContent = (
                    <>
                      <span className={`quran-text-pak !text-xl !leading-[1.7] [text-shadow:none] block ${dark ? '!text-slate-100' : '!text-slate-900'}`}>
                        {f.ar}
                      </span>
                      <span dir="ltr" className="flex items-center gap-1 text-[11px] opacity-85 leading-tight mt-0.5">
                        <span>{f.en}</span>
                        <span className="font-mono font-semibold text-islamic-gold">{f.ref}</span>
                        {canNavigate && (
                          <SafeIcon
                            icon={FiArrowUpRight}
                            aria-hidden="true"
                            className="text-[11px] text-islamic-gold shrink-0"
                          />
                        )}
                      </span>
                    </>
                  );

                  if (canNavigate) {
                    return (
                      <button
                        key={`${f.ar}-${f.ref}`}
                        type="button"
                        onClick={() => onOpenAyah(parsedRef.surahNumber, parsedRef.ayahNumber)}
                        className={`px-3 py-1.5 rounded-xl border text-right transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 ${cardBg} ${
                          dark ? 'hover:border-islamic-gold/70 hover:bg-white/10' : 'hover:border-islamic-gold hover:bg-amber-50/70'
                        }`}
                        title={`Open Surah ${parsedRef.surahNumber}, Ayah ${parsedRef.ayahNumber}`}
                        aria-label={`Open ${f.en} at Surah ${parsedRef.surahNumber}, Ayah ${parsedRef.ayahNumber}`}
                      >
                        {chipContent}
                      </button>
                    );
                  }

                  return (
                    <div key={`${f.ar}-${f.ref}`} className={`px-3 py-1.5 rounded-xl border ${cardBg}`}>
                      {chipContent}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export const SyntaxTab = ({ word, theme, cardBg }) => {
  const dark = isDarkSurface(theme);
  return (
    <div className="space-y-3.5">
      {word.role_en && (
        <QuickFactCard
          icon={FiTarget}
          label="Role in This Ayah"
          valueEn={word.role_en}
          theme={theme}
          cardBg={cardBg}
          accent="amber"
        />
      )}
      {word.idafa && <IdafaCard idafa={word.idafa} theme={theme} />}
      {word.irab?.en && (
        <div className={`p-4 rounded-2xl border-l-4 border-l-blue-500 border flex items-start gap-3 ${cardBg}`}>
          <span
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
              dark ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700'
            }`}
            aria-hidden="true"
          >
            <SafeIcon icon={FiCheckCircle} className="text-sm" />
          </span>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider opacity-80">
              How It Works (Grammar)
            </div>
            <p className="text-sm opacity-90 mt-1 leading-relaxed">{word.irab.en}</p>
          </div>
        </div>
      )}
      {word.ayahStructure?.en && (
        <div className={`p-4 rounded-2xl border flex items-start gap-3 ${cardBg}`}>
          <span
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
              dark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-700'
            }`}
            aria-hidden="true"
          >
            <SafeIcon icon={FiNavigation} className="text-sm" />
          </span>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider opacity-80">
              Ayah {word.ayahNumber} Flow
            </div>
            <p className="text-xs sm:text-sm opacity-90 mt-1 leading-relaxed">
              {word.ayahStructure.en}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export const InsightTab = ({ word, theme, cardBg }) => {
  if (!word.insight) {
    return <p className="text-sm opacity-75 text-center py-6">No reflection recorded for this word.</p>;
  }
  const dark = isDarkSurface(theme);
  return (
    <div className={`p-5 rounded-2xl border flex items-start gap-3.5 ${cardBg}`}>
      <span
        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
          dark ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-100 text-amber-700'
        }`}
        aria-hidden="true"
      >
        <SafeIcon icon={FiSun} className="text-lg" />
      </span>
      <div className="min-w-0">
        <p className="text-base font-bold mb-2">{word.insight.title_en}</p>
        <p className="text-sm sm:text-base leading-relaxed opacity-95">{word.insight.en}</p>
      </div>
    </div>
  );
};
