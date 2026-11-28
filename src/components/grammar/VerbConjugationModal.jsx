import React, { useEffect, useId, useRef } from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import { isDarkSurface } from './sarfStyles';

const { FiX, FiLayers, FiCommand, FiShield } = FiIcons;

/**
 * Fallback conjugation table builder for verbs that only define the 5-item
 * `sarf.verb.conjugation` summary strip (e.g. Surah 103).
 */
const buildFallbackConjugationTable = (word) => {
  const verb = word?.sarf?.verb;
  if (!verb) return null;
  if (verb.conjugation_table) return verb.conjugation_table;

  const findForm = (labelEn) =>
    verb.conjugation?.find((c) => c.label_en?.toLowerCase().includes(labelEn))?.ar || word.text_uthmani;

  const pastBase = findForm('perfect');
  const presentBase = findForm('imperfect');
  const amrBase = findForm('imperative');

  return {
    verb_lemma_ar: pastBase,
    verb_lemma_en: word.translation || '',
    root: word.sarf?.root || [],
    form: verb.form ? `Form ${verb.form}` : '',
    active_occurrence_pronoun: '',
    active_occurrence_tense: 'past',
    rows: [
      {
        pronoun_ar: 'هُوَ',
        pronoun_en: 'He',
        past_ar: pastBase,
        past_en: 'he (past)',
        present_ar: presentBase,
        present_en: 'he (present)',
        future_ar: `سَـ${presentBase}`,
        future_en: 'he will'
      },
      {
        pronoun_ar: '',
        pronoun_en: 'In this Ayah',
        past_ar: word.text_uthmani,
        past_en: word.translation,
        present_ar: presentBase,
        present_en: 'present stem',
        future_ar: `سَـ${presentBase}`,
        future_en: 'future stem',
        in_ayah: true
      }
    ],
    passive: Array.isArray(verb.passive) ? verb.passive : [],
    imperative: amrBase
      ? [{ pronoun_ar: 'أَنتَ', pronoun_en: 'You (Command)', ar: amrBase, en: 'Command (Amr)!' }]
      : []
  };
};

const THEME_CONJ_SURFACES = {
  green: {
    surface: 'bg-emerald-50 text-emerald-950 border-emerald-300 shadow-2xl shadow-emerald-950/20',
    card: 'bg-white/85 border-emerald-200',
    header: 'bg-emerald-100/95 text-emerald-950 border-b border-emerald-200',
    rowHeader: 'bg-emerald-50/95 text-emerald-950 border-r border-emerald-200',
    wrapperBorder: 'border-emerald-200',
    pill: 'bg-emerald-100 text-emerald-900 border-emerald-300'
  },
  red: {
    surface: 'bg-rose-50 text-rose-950 border-rose-300 shadow-2xl shadow-rose-950/20',
    card: 'bg-white/85 border-rose-200',
    header: 'bg-rose-100/95 text-rose-950 border-b border-rose-200',
    rowHeader: 'bg-rose-50/95 text-rose-950 border-r border-rose-200',
    wrapperBorder: 'border-rose-200',
    pill: 'bg-rose-100 text-rose-900 border-rose-300'
  },
  blue: {
    surface: 'bg-blue-50 text-blue-950 border-blue-300 shadow-2xl shadow-blue-950/20',
    card: 'bg-white/85 border-blue-200',
    header: 'bg-blue-100/95 text-blue-950 border-b border-blue-200',
    rowHeader: 'bg-blue-50/95 text-blue-950 border-r border-blue-200',
    wrapperBorder: 'border-blue-200',
    pill: 'bg-blue-100 text-blue-900 border-blue-300'
  },
  sepia: {
    surface: 'bg-amber-50 text-amber-950 border-amber-300 shadow-2xl shadow-amber-950/20',
    card: 'bg-white/80 border-amber-200',
    header: 'bg-amber-100/95 text-amber-950 border-b border-amber-200',
    rowHeader: 'bg-amber-50/95 text-amber-950 border-r border-amber-200',
    wrapperBorder: 'border-amber-200',
    pill: 'bg-amber-100 text-amber-900 border-amber-300'
  },
  light: {
    surface: 'bg-white text-slate-900 border-emerald-300 shadow-2xl shadow-slate-900/25',
    card: 'bg-slate-50 border-slate-200',
    header: 'bg-slate-100 text-slate-900 border-b border-slate-200',
    rowHeader: 'bg-white/95 text-slate-800 border-r border-slate-200',
    wrapperBorder: 'border-slate-200',
    pill: 'bg-emerald-100 text-emerald-900 border-emerald-300'
  },
  dark: {
    surface: 'bg-slate-900 text-slate-100 border-emerald-700/70 shadow-2xl shadow-black/80',
    card: 'bg-slate-800/90 border-slate-700',
    header: 'bg-slate-800 text-slate-100 border-b border-slate-700',
    rowHeader: 'bg-slate-900/95 text-slate-200 border-r border-slate-800',
    wrapperBorder: 'border-slate-700',
    pill: 'bg-emerald-950/80 text-emerald-200 border-emerald-700'
  }
};

const VerbConjugationModal = ({ isOpen, onClose, word, theme = 'light', onOpenAyah, renderMoreDetails }) => {
  const dialogRef = useRef(null);
  const titleId = useId();
  const captionId = useId();
  const dark = isDarkSurface(theme);

  const tableData = buildFallbackConjugationTable(word);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && tableData) {
      if (typeof dialog.showModal === 'function') {
        if (!dialog.open) {
          try {
            dialog.showModal();
          } catch {
            dialog.setAttribute('open', '');
          }
        }
      } else {
        dialog.setAttribute('open', '');
      }
    } else if (dialog.open || dialog.hasAttribute('open')) {
      if (typeof dialog.close === 'function') {
        try {
          dialog.close();
        } catch {
          dialog.removeAttribute('open');
        }
      } else {
        dialog.removeAttribute('open');
      }
    }
  }, [isOpen, tableData]);

  // Progressive enhancement fallback for light-dismiss (`closedby="any"`) where unsupported
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !isOpen) return;
    if ('closedBy' in HTMLDialogElement.prototype) return;

    const isOutside = (e) => {
      const r = dialog.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) return false;
      return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
    };

    let pressedOutside = false;
    const onPointerDown = (e) => {
      pressedOutside = isOutside(e);
    };
    const onPointerUp = (e) => {
      if (pressedOutside && isOutside(e)) {
        onClose?.();
      }
    };

    dialog.addEventListener('pointerdown', onPointerDown);
    dialog.addEventListener('pointerup', onPointerUp);
    return () => {
      dialog.removeEventListener('pointerdown', onPointerDown);
      dialog.removeEventListener('pointerup', onPointerUp);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !tableData) return null;

  const themePalette = THEME_CONJ_SURFACES[theme] || THEME_CONJ_SURFACES.light;
  const surfaceClass = themePalette.surface;
  const cardBg = themePalette.card;
  const stickyHeaderBg = themePalette.header;
  const stickyRowHeaderBg = themePalette.rowHeader;

  const handleDialogClose = () => {
    const dialog = dialogRef.current;
    if (dialog) {
      dialog.returnValue = '';
    }
    onClose?.();
  };

  const handleJumpAyah = (surahNum, ayahNum) => {
    handleDialogClose();
    onOpenAyah?.(surahNum, ayahNum);
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      {...{ closedby: 'any' }}
      onClose={handleDialogClose}
      data-testid="verb-conjugation-modal"
      className={`w-[95vw] max-w-3xl rounded-3xl border p-0 m-auto overflow-hidden ${surfaceClass}`}
    >
      <div className="p-5 sm:p-6 max-h-[88vh] overflow-y-auto overscroll-contain space-y-5">
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 pb-3 border-b border-current/15">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${themePalette.pill}`}
              >
                <SafeIcon icon={FiLayers} className="text-xs" />
                <span>Full Verb Conjugation</span>
              </span>
              {tableData.form && (
                <span
                  className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                    dark ? 'bg-white/5 border-white/15 text-slate-200' : 'bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  {tableData.form}
                </span>
              )}
            </div>

            <h2 id={titleId} className="flex flex-wrap items-baseline gap-2.5 text-lg sm:text-xl font-bold">
              <span
                dir="rtl"
                className={`quran-text-pak !text-3xl !leading-[1.5] [text-shadow:none] ${
                  dark ? '!text-emerald-300' : '!text-emerald-800'
                }`}
              >
                {tableData.verb_lemma_ar}
              </span>
              <span className="text-sm sm:text-base font-medium opacity-85">
                {tableData.verb_lemma_en}
              </span>
            </h2>
          </div>

          <button
            type="button"
            autoFocus
            onClick={handleDialogClose}
            aria-label="Close verb conjugation sub-modal"
            className={`p-2 rounded-xl border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 ${
              dark ? 'border-white/20 hover:bg-white/10' : 'border-slate-300 hover:bg-slate-100'
            }`}
          >
            <SafeIcon icon={FiX} className="text-base" />
          </button>
        </div>

        {/* Green Tense Shade Key */}
        <div className={`flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 rounded-2xl border text-xs ${cardBg}`}>
          <span className="font-semibold opacity-80">Tense Colors:</span>
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-700 inline-block" aria-hidden="true" />
              <span className={dark ? 'text-emerald-300' : 'text-emerald-800'}>Past</span>
            </span>
            <span className="inline-flex items-center gap-1.5 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" aria-hidden="true" />
              <span className={dark ? 'text-green-400' : 'text-green-700'}>Present</span>
            </span>
            <span className="inline-flex items-center gap-1.5 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500 inline-block" aria-hidden="true" />
              <span className={dark ? 'text-teal-300' : 'text-teal-700'}>Future &amp; Command</span>
            </span>
          </div>
        </div>

        {/* Active Voice Responsive Data Table */}
        <div
          tabIndex={0}
          role="region"
          aria-labelledby={captionId}
          className={`conjugation-table-wrapper rounded-2xl border ${themePalette.wrapperBorder}`}
        >
          <table className="text-xs sm:text-sm">
            <caption id={captionId} className="sr-only">
              Active voice conjugation across pronouns for {tableData.verb_lemma_en}
            </caption>
            <thead className={stickyHeaderBg}>
              <tr>
                <th scope="col" className="text-left px-3 py-2.5 font-bold">
                  Pronoun
                </th>
                <th scope="col" className="text-center px-3 py-2.5 font-bold">
                  <span className={dark ? 'text-emerald-300' : 'text-emerald-800'}>
                    Past
                  </span>
                </th>
                <th scope="col" className="text-center px-3 py-2.5 font-bold">
                  <span className={dark ? 'text-green-400' : 'text-green-700'}>
                    Present
                  </span>
                </th>
                <th scope="col" className="text-center px-3 py-2.5 font-bold">
                  <span className={dark ? 'text-teal-300' : 'text-teal-700'}>
                    Future
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-current/10">
              {tableData.rows.map((row) => {
                const highlightRow = Boolean(row.in_ayah);
                return (
                  <tr
                    key={row.pronoun_en}
                    data-testid={highlightRow ? 'conjugation-ayah-row' : undefined}
                    className={
                      highlightRow
                        ? dark
                          ? 'bg-emerald-950/60 ring-1 ring-inset ring-emerald-500/60'
                          : 'bg-emerald-50/90 ring-1 ring-inset ring-emerald-400'
                        : dark
                          ? 'hover:bg-white/5'
                          : 'hover:bg-slate-50/80'
                    }
                  >
                    <th
                      scope="row"
                      className={`text-left px-3 py-2 font-semibold whitespace-nowrap ${
                        highlightRow
                          ? dark
                            ? 'bg-emerald-950 text-emerald-200 border-r border-emerald-800'
                            : 'bg-emerald-100/90 text-emerald-950 border-r border-emerald-300'
                          : stickyRowHeaderBg
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span>{row.pronoun_en}</span>
                        {row.pronoun_ar && (
                          <span dir="rtl" className="quran-text-pak !text-lg !leading-[1.5] [text-shadow:none] !text-inherit font-bold">
                            {row.pronoun_ar}
                          </span>
                        )}
                      </div>
                      {highlightRow && (
                        <span
                          className={`mt-0.5 inline-block text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                            dark ? 'bg-emerald-500/30 text-emerald-200' : 'bg-emerald-700 text-white'
                          }`}
                        >
                          In this Ayah
                        </span>
                      )}
                    </th>

                    {/* Past Cell */}
                    <td className="text-center px-3 py-2">
                      <div
                        dir="rtl"
                        className={`quran-text-pak !text-2xl !leading-[1.6] [text-shadow:none] font-bold ${
                          dark ? '!text-emerald-300' : '!text-emerald-800'
                        }`}
                      >
                        {row.past_ar}
                      </div>
                      <div className="text-[11px] opacity-85">{row.past_en}</div>
                    </td>

                    {/* Present Cell */}
                    <td className="text-center px-3 py-2">
                      <div
                        dir="rtl"
                        className={`quran-text-pak !text-2xl !leading-[1.6] [text-shadow:none] font-bold ${
                          dark ? '!text-green-400' : '!text-green-600'
                        }`}
                      >
                        {row.present_ar}
                      </div>
                      <div className="text-[11px] opacity-85">{row.present_en}</div>
                    </td>

                    {/* Future Cell */}
                    <td className="text-center px-3 py-2">
                      <div
                        dir="rtl"
                        className={`quran-text-pak !text-2xl !leading-[1.6] [text-shadow:none] font-bold ${
                          dark ? '!text-teal-300' : '!text-teal-600'
                        }`}
                      >
                        {row.future_ar}
                      </div>
                      <div className="text-[11px] opacity-85">{row.future_en}</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Passive Voice ("It was…") & Imperative ("Command / Amr!") */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tableData.passive?.length > 0 && (
            <div className={`p-4 rounded-2xl border ${cardBg}`} data-testid="conjugation-passive-section">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider mb-3">
                <SafeIcon icon={FiShield} className={dark ? 'text-emerald-300' : 'text-emerald-700'} />
                <span>Passive Voice (&ldquo;It was…&rdquo;)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {tableData.passive.map((p) => (
                  <div
                    key={p.label_en}
                    className={`p-2.5 rounded-xl border text-center ${
                      p.in_ayah
                        ? dark
                          ? 'bg-emerald-950/70 border-emerald-500 ring-1 ring-emerald-400'
                          : 'bg-emerald-50 border-emerald-400 ring-1 ring-emerald-400'
                        : dark
                          ? 'bg-black/25 border-white/10'
                          : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="text-[10px] font-semibold uppercase tracking-wide opacity-75">
                      {p.label_en}
                    </div>
                    <div
                      dir="rtl"
                      className={`quran-text-pak !text-2xl !leading-[1.6] [text-shadow:none] font-bold ${
                        dark ? '!text-emerald-300' : '!text-emerald-800'
                      }`}
                    >
                      {p.ar}
                    </div>
                    <div className="text-xs font-medium mt-0.5">{p.en}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tableData.imperative?.length > 0 && (
            <div className={`p-4 rounded-2xl border ${cardBg}`} data-testid="conjugation-imperative-section">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider mb-3">
                <SafeIcon icon={FiCommand} className={dark ? 'text-teal-300' : 'text-teal-700'} />
                <span>Command (Amr!) &amp; Do Not</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {tableData.imperative.map((cmd) => (
                  <div
                    key={cmd.pronoun_en}
                    className={`p-2.5 rounded-xl border text-center ${
                      dark ? 'bg-black/25 border-white/10' : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] opacity-75 px-1">
                      <span>{cmd.pronoun_en}</span>
                      <span dir="rtl" className="quran-text-pak !text-base !leading-[1.4] [text-shadow:none] !text-inherit font-bold">{cmd.pronoun_ar}</span>
                    </div>
                    <div
                      dir="rtl"
                      className={`quran-text-pak !text-2xl !leading-[1.6] [text-shadow:none] font-bold ${
                        dark ? '!text-teal-300' : '!text-teal-600'
                      }`}
                    >
                      {cmd.ar}
                    </div>
                    <div className="text-xs font-semibold mt-0.5">{cmd.en}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Verb Details rendered directly inside the Conjugation Table modal (no extra toggle button) */}
        {typeof renderMoreDetails === 'function' && (
          <div className="pt-4 border-t border-current/15" data-testid="conjugation-more-details-body">
            {renderMoreDetails(handleJumpAyah)}
          </div>
        )}
      </div>
    </dialog>
  );
};

export default VerbConjugationModal;
