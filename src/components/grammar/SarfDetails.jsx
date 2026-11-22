import React, { useState } from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import {
  RADICALS,
  getRadicalOrder,
  getCategoryMeta,
  getCategoryTextClass,
  getRadicalTextClass,
  isDarkSurface,
  parseQuranRef,
  resolveSurah100Shade
} from './sarfStyles';
import VerbConjugationModal from './VerbConjugationModal';

const { FiArrowUpRight, FiLink, FiMaximize2 } = FiIcons;

/* ------------------------------------------------------------------------ */
/* Small building blocks                                                     */
/* ------------------------------------------------------------------------ */

const SectionTitle = ({ ar, en, theme }) => {
  const dark = isDarkSurface(theme);
  return (
    <h4 className="flex items-baseline justify-between gap-2 mb-2.5">
      <span className="text-[11px] font-bold uppercase tracking-wider opacity-75">{en}</span>
      <span dir="rtl" className={`font-arabic text-base font-bold ${dark ? 'text-islamic-gold' : 'text-amber-800'}`}>
        {ar}
      </span>
    </h4>
  );
};

const Fact = ({ labelAr, labelEn, valueAr, valueEn, cardBg }) => {
  if (!valueAr && !valueEn) return null;
  return (
    <div className={`p-3 rounded-xl border ${cardBg}`}>
      <div className="flex items-baseline justify-between gap-2 mb-1">
        <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">{labelEn}</span>
        <span dir="rtl" className="font-arabic text-xs opacity-70">{labelAr}</span>
      </div>
      {valueAr && (
        <p dir="rtl" className="font-arabic text-base font-bold leading-snug">{valueAr}</p>
      )}
      {valueEn && <p className="text-xs opacity-80 leading-snug mt-0.5">{valueEn}</p>}
    </div>
  );
};

/** Renders letter clusters coloured by radical slot, joined as one word. */
const RadicalWord = ({ letters, theme, className = '' }) => (
  <span dir="rtl" className={className}>
    {letters.map((l, i) => (
      <span key={i} className={`${getRadicalTextClass(l.r, theme)} ${l.r ? 'font-bold' : ''}`}>{l.t}</span>
    ))}
  </span>
);

/* ------------------------------------------------------------------------ */
/* Iḍāfa Construct Chain Card: Muḍāf & Muḍāf Ilayhi                         */
/* ------------------------------------------------------------------------ */

export const IdafaCard = ({ idafa, theme, cardBg }) => {
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
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
          <SafeIcon icon={FiLink} className={dark ? 'text-amber-300' : 'text-amber-700'} />
          <span>Iḍāfa Construct · {idafa.label_en}</span>
        </span>
        <span dir="rtl" className={`font-arabic text-base font-bold ${dark ? 'text-amber-300' : 'text-amber-900'}`}>
          تركيب الإضافة ({idafa.label_ar})
        </span>
      </div>

      {/* Visual RTL Chain: Muḍāf ⟵ Muḍāf Ilayhi */}
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
          <div className="flex items-center justify-between text-[11px] font-bold mb-1">
            <span className={dark ? 'text-amber-300' : 'text-amber-800'}>١. المضاف</span>
            <span dir="ltr" className="uppercase opacity-75">1. Muḍāf (Construct)</span>
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
          <div className="flex items-center justify-between text-[11px] font-bold mb-1">
            <span className={dark ? 'text-amber-300' : 'text-amber-800'}>٢. المضاف إليه</span>
            <span dir="ltr" className="uppercase opacity-75">2. Muḍāf Ilayhi (Genitive)</span>
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

      {idafa.explanation_ar && (
        <p dir="rtl" className="font-arabic text-sm leading-relaxed">
          {idafa.explanation_ar}
        </p>
      )}
      {idafa.explanation_en && (
        <p className="text-xs opacity-90 mt-1 leading-relaxed">
          {idafa.explanation_en}
        </p>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------------ */
/* Al-Mīzān al-Ṣarfī: word ↔ pattern mapping                                 */
/* ------------------------------------------------------------------------ */

export const MizanCard = ({ sarf, theme, cardBg }) => {
  const dark = isDarkSurface(theme);
  const deleted = sarf.deleted_radicals || [];
  const merged = sarf.stem_letters.some((l) => l.r && l.r.length > 1 && l.r !== 'l2');
  const hasAugment =
    sarf.stem_letters.some((l) => !l.r) || sarf.wazn_letters.some((l) => !l.r);
  const radicalSlots = getRadicalOrder(sarf.root?.length || 3);

  return (
    <div className={`p-4 rounded-2xl border ${cardBg}`} data-testid="mizan-card">
      <SectionTitle ar="الميزان الصرفي" en="Morphological scale" theme={theme} />

      {/* Root slots ف ع ل (and ل٢ for quadriliteral roots) */}
      <div dir="rtl" className="flex flex-wrap items-stretch justify-center gap-2 mb-4">
        {radicalSlots.map((slot, idx) => {
          const r = RADICALS[slot];
          const isDeleted = deleted.includes(slot);
          return (
            <div
              key={slot}
              className={`w-20 rounded-xl border-2 text-center py-2 ${
                isDeleted ? 'border-dashed opacity-75' : ''
              } ${dark ? 'border-white/15 bg-white/5' : 'border-slate-200 bg-white'}`}
            >
              <div className={`font-arabic text-lg font-bold ${dark ? r.dark : r.light}`}>{r.slot}</div>
              <div className={`quran-text-pak !text-3xl !leading-[1.6] [text-shadow:none] ${dark ? r.dark : r.light} ${isDeleted ? 'line-through' : ''}`}>
                {sarf.root[idx]}
              </div>
              <div className="text-[10px] uppercase tracking-wider opacity-75">
                {isDeleted ? 'deleted' : r.name_en}
              </div>
            </div>
          );
        })}
      </div>

      {/* Word stem ↔ Wazn */}
      <div className="grid grid-cols-2 gap-3 items-center">
        <div className={`rounded-xl text-center py-2 px-1 ${dark ? 'bg-black/25' : 'bg-white border border-slate-200/80'}`}>
          <div className="text-[10px] uppercase tracking-wider opacity-75">Pattern · الوزن</div>
          <RadicalWord letters={sarf.wazn_letters} theme={theme} className="quran-text-pak !text-4xl !leading-[1.8] [text-shadow:none]" />
        </div>
        <div className={`rounded-xl text-center py-2 px-1 ${dark ? 'bg-black/25' : 'bg-white border border-slate-200/80'}`}>
          <div className="text-[10px] uppercase tracking-wider opacity-75">Stem · الكلمة</div>
          <RadicalWord letters={sarf.stem_letters} theme={theme} className="quran-text-pak !text-4xl !leading-[1.8] [text-shadow:none]" />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs">
        <span>
          <span className="opacity-70">Full pattern: </span>
          <span dir="rtl" className="font-arabic text-base font-bold">{sarf.wazn}</span>
        </span>
        {sarf.wazn_original && (
          <span>
            <span className="opacity-70">Underlying: </span>
            <span dir="rtl" className="font-arabic text-base">{sarf.wazn_original}</span>
          </span>
        )}
        {hasAugment && (
          <span className="flex items-center gap-1 opacity-80">
            <span className={`w-2 h-2 rounded-full ${dark ? 'bg-slate-400' : 'bg-slate-500'}`} />
            grey = added letters (زوائد)
          </span>
        )}
      </div>

      {merged && (
        <p className="mt-2 text-xs text-center opacity-85">
          The shadda carries <b>two radicals</b> (ع + ل) merged into one letter.
        </p>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------------ */
/* Tabs                                                                       */
/* ------------------------------------------------------------------------ */

export const MorphologyTab = ({ word, theme, cardBg, onOpenAyah }) => {
  const [isConjugationModalOpen, setIsConjugationModalOpen] = useState(false);
  const dark = isDarkSurface(theme);
  const sarf = word.sarf;
  const segments = word.segments || [];
  const palette = word.color_palette || 'default';

  return (
    <div className="space-y-4">
      {/* Morphemes */}
      <div>
        <SectionTitle ar="أجزاء الكلمة" en={`Morphemes (${segments.length})`} theme={theme} />
        <div dir="rtl" className="flex flex-wrap gap-2">
          {segments.map((seg, idx) => {
            const meta = getCategoryMeta(seg.category, palette);
            const shade = palette === 'surah_100' ? resolveSurah100Shade(seg.category, seg) : null;
            const dotClass = shade ? shade.dot : meta.dot;

            return (
              <div key={idx} className={`flex-1 min-w-[9rem] p-3 rounded-xl border ${cardBg}`}>
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`quran-text-pak !text-3xl !leading-[1.6] [text-shadow:none] ${getCategoryTextClass(
                      seg.category,
                      theme,
                      seg,
                      palette
                    )}`}
                  >
                    {seg.text}
                  </span>
                  <div className="flex flex-col items-end gap-1" dir="ltr">
                    <span className="text-[10px] uppercase tracking-wider opacity-70">
                      {seg.role}
                    </span>
                    {shade && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                          dark ? shade.darkPill : shade.lightPill
                        }`}
                      >
                        {shade.labelEn}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${dotClass}`} />
                  <span className="font-arabic text-sm font-bold">{seg.pos_name_ar}</span>
                </div>
                <p dir="ltr" className="text-xs opacity-85 text-left font-medium">{seg.pos_name_en}</p>
                {seg.desc_ar && (
                  <p dir="rtl" className="font-arabic text-xs opacity-75 mt-1 leading-snug">{seg.desc_ar}</p>
                )}
                {seg.desc_en && (
                  <p dir="ltr" className="text-[11px] opacity-75 text-left mt-0.5 leading-snug">{seg.desc_en}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Show Iḍāfa card right in MorphologyTab when present */}
      {word.idafa && <IdafaCard idafa={word.idafa} theme={theme} cardBg={cardBg} />}

      {!sarf ? (
        <div className={`p-4 rounded-2xl border text-center ${cardBg}`} data-testid="sarf-note">
          <p dir="rtl" className="font-arabic text-lg font-bold mb-1">مبنيّ — لا ميزان صرفي</p>
          {word.sarf_note_ar && <p dir="rtl" className="font-arabic text-sm opacity-90">{word.sarf_note_ar}</p>}
          {word.sarf_note_en && <p className="text-xs opacity-85 mt-1">{word.sarf_note_en}</p>}
        </div>
      ) : (
        <>
          <MizanCard sarf={sarf} theme={theme} cardBg={cardBg} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <Fact cardBg={cardBg} labelAr="الجذر" labelEn="Root meaning" valueAr={sarf.root.join(' – ')} valueEn={sarf.root_meaning} />
            <Fact cardBg={cardBg} labelAr="نوع الجذر" labelEn="Root type" valueAr={sarf.root_type_ar} valueEn={sarf.root_type_en} />
            <Fact cardBg={cardBg} labelAr="نوع الكلمة" labelEn="Word type" valueAr={sarf.word_type_ar} valueEn={sarf.word_type_en} />
            {sarf.verb && (
              <>
                <Fact
                  cardBg={cardBg}
                  labelAr="الباب / الصيغة"
                  labelEn={`Verb form ${sarf.verb.form}`}
                  valueAr={
                    sarf.verb.meaning_of_form_ar
                      ? `${sarf.verb.pattern} · ${sarf.verb.meaning_of_form_ar}`
                      : sarf.verb.pattern
                  }
                  valueEn={sarf.verb.meaning_of_form_en}
                />
                <Fact cardBg={cardBg} labelAr="الزمن" labelEn="Tense" valueAr={sarf.verb.tense_ar} valueEn={sarf.verb.tense_en} />
                <Fact cardBg={cardBg} labelAr="الإسناد" labelEn="Person · Gender · Number" valueAr={sarf.verb.person_ar} valueEn={sarf.verb.person_en} />
                <Fact cardBg={cardBg} labelAr="البناء" labelEn="Voice" valueAr={sarf.verb.voice_ar} valueEn={sarf.verb.voice_en} />
              </>
            )}
            {sarf.noun && (
              <>
                <Fact cardBg={cardBg} labelAr="الجنس والعدد" labelEn="Gender · Number" valueAr={`${sarf.noun.gender_ar} · ${sarf.noun.number_ar}`} valueEn={`${sarf.noun.gender_en} · ${sarf.noun.number_en}`} />
                <Fact cardBg={cardBg} labelAr="التعريف والحالة" labelEn="Definiteness · Case" valueAr={`${sarf.noun.definiteness_ar} · ${sarf.noun.case_ar}`} valueEn={`${sarf.noun.definiteness_en} · ${sarf.noun.case_en}`} />
                {sarf.noun.subclass_en && (
                  <Fact cardBg={cardBg} labelAr="القسم الفرعي للاسم" labelEn="Noun Subclass" valueAr={sarf.noun.subclass_ar} valueEn={sarf.noun.subclass_en} />
                )}
              </>
            )}
          </div>

          {/* Conjugation strip + Full Conjugation Sub-Modal Trigger */}
          {sarf.verb?.conjugation && (
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                <h4 className="flex items-baseline gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider opacity-75">Conjugation</span>
                  <span dir="rtl" className={`font-arabic text-base font-bold ${dark ? 'text-islamic-gold' : 'text-amber-800'}`}>
                    التصريف
                  </span>
                </h4>

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
                  <SafeIcon icon={FiMaximize2} className="text-xs" />
                  <span>Full Conjugation Table · جدول التصريف</span>
                </button>
              </div>

              <div dir="rtl" className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {sarf.verb.conjugation.map((c) => (
                  <div key={c.label_en} className={`p-2 rounded-xl border text-center ${cardBg}`}>
                    <div className="font-arabic text-xs opacity-75">{c.label_ar}</div>
                    <div className={`quran-text-pak !text-2xl !leading-[1.7] [text-shadow:none] ${dark ? '!text-slate-100' : '!text-slate-900'}`}>
                      {c.ar}
                    </div>
                    <div className="text-[10px] uppercase tracking-wider opacity-70" dir="ltr">{c.label_en}</div>
                  </div>
                ))}
              </div>

              <VerbConjugationModal
                isOpen={isConjugationModalOpen}
                onClose={() => setIsConjugationModalOpen(false)}
                word={word}
                theme={theme}
              />
            </div>
          )}

          {/* Phonological transformation (i'lal / ibdal / idgham) */}
          {sarf.transformation && (
            <div className={`p-4 rounded-2xl border-l-4 border-l-violet-500 border ${cardBg}`}>
              <SectionTitle ar={sarf.transformation.type_ar} en={sarf.transformation.type_en} theme={theme} />
              <p dir="rtl" className="font-arabic text-base leading-relaxed">{sarf.transformation.ar}</p>
              <p className="text-xs opacity-85 mt-1.5 leading-relaxed">{sarf.transformation.en}</p>
            </div>
          )}

          {sarf.scholarly_note_en && (
            <div className={`p-4 rounded-2xl border-l-4 border-l-amber-500 border ${cardBg}`}>
              <SectionTitle ar="خلاف العلماء" en="Scholarly note" theme={theme} />
              <p dir="rtl" className="font-arabic text-base leading-relaxed">{sarf.scholarly_note_ar}</p>
              <p className="text-xs opacity-85 mt-1.5 leading-relaxed">{sarf.scholarly_note_en}</p>
            </div>
          )}

          {/* Root family across the Qur'an */}
          {sarf.family?.length > 0 && (
            <div>
              <SectionTitle ar={`أسرة الجذر (${sarf.root.join(' ')}) في القرآن`} en="Same root in the Qur'an" theme={theme} />
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
                          <SafeIcon icon={FiArrowUpRight} className="text-[11px] text-islamic-gold shrink-0" />
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

export const SyntaxTab = ({ word, theme, cardBg }) => (
  <div className="space-y-4">
    {(word.role_ar || word.role_en) && (
      <Fact cardBg={cardBg} labelAr="الموقع الإعرابي" labelEn="Grammatical role" valueAr={word.role_ar} valueEn={word.role_en} />
    )}
    {word.idafa && <IdafaCard idafa={word.idafa} theme={theme} cardBg={cardBg} />}
    {word.irab && (
      <div className={`p-4 rounded-2xl border-l-4 border-l-blue-500 border ${cardBg}`}>
        <SectionTitle ar="الإعراب" en="Full iʿrāb" theme={theme} />
        <p dir="rtl" className="font-arabic text-lg leading-loose">{word.irab.ar}</p>
        <p className="text-sm opacity-90 mt-2 leading-relaxed">{word.irab.en}</p>
      </div>
    )}
    {word.ayahStructure?.ar && (
      <div className={`p-4 rounded-2xl border ${cardBg}`}>
        <SectionTitle ar={`تركيب الآية ${word.ayahNumber}`} en="Sentence structure" theme={theme} />
        <p dir="rtl" className="font-arabic text-base leading-relaxed">{word.ayahStructure.ar}</p>
        <p className="text-xs opacity-85 mt-1.5 leading-relaxed">{word.ayahStructure.en}</p>
      </div>
    )}
  </div>
);

export const InsightTab = ({ word, theme, cardBg }) => {
  if (!word.insight) {
    return <p className="text-sm opacity-75 text-center py-6">No reflection recorded for this word.</p>;
  }
  const dark = isDarkSurface(theme);
  return (
    <div className={`p-5 rounded-2xl border ${cardBg}`}>
      <p dir="rtl" className={`font-arabic text-2xl font-bold mb-1 ${dark ? 'text-islamic-gold' : 'text-amber-800'}`}>
        {word.insight.title_ar}
      </p>
      <p className="text-base font-bold mb-3">{word.insight.title_en}</p>
      <p className="text-sm sm:text-base leading-relaxed opacity-95">{word.insight.en}</p>
    </div>
  );
};
