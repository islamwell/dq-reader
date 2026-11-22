import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import AyahCard from '../components/AyahCard';
import AudioPlayer from '../components/AudioPlayer';
import RevelationPlaceIcon from '../components/RevelationPlaceIcon';
import GrammarToggle from '../components/grammar/GrammarToggle';
import SurahQuiz from '../components/quiz/SurahQuiz';
import { useQuranAudio, useQuranData } from '../contexts/QuranContext';
import { AyahCardSkeleton } from '../components/Skeleton';

const { FiArrowLeft } = FiIcons;

const THEME_CARD_STYLES = {
  green: 'bg-emerald-50/50 border border-emerald-200',
  red: 'bg-rose-50/50 border border-rose-200',
  blue: 'bg-blue-50/50 border border-blue-200',
  light: 'bg-white border border-slate-200',
  dark: 'bg-slate-800/50 border border-slate-700',
  sepia: 'bg-amber-50/50 border border-amber-300'
};

const THEME_TEXT_STYLES = {
  green: 'text-emerald-950',
  red: 'text-rose-950',
  blue: 'text-blue-950',
  light: 'text-slate-900',
  dark: 'text-slate-50',
  sepia: 'text-amber-950'
};

const THEME_SECONDARY_TEXT_STYLES = {
  green: 'text-emerald-700',
  red: 'text-rose-700',
  blue: 'text-blue-700',
  light: 'text-slate-600',
  dark: 'text-slate-300',
  sepia: 'text-amber-800'
};

const THEME_LINK_STYLES = {
  green: 'text-emerald-600 hover:text-emerald-800',
  red: 'text-rose-600 hover:text-rose-800',
  blue: 'text-blue-600 hover:text-blue-800',
  light: 'text-slate-600 hover:text-slate-800',
  dark: 'text-slate-300 hover:text-slate-100',
  sepia: 'text-amber-700 hover:text-amber-900'
};

const Surah = () => {
  const { surahNumber } = useParams();
  const location = useLocation();
  const {
    surahs,
    fetchSurahVerses,
    fetchSurahGrammar,
    setCurrentSurah,
    theme,
    addVisitedAyah,
    grammarData,
    grammarMode,
    showInterlinear,
    emphasisPulsePaused = false,
    setEmphasisPulsePaused
  } = useQuranData();
  const { playingAyah } = useQuranAudio();
  const [verses, setVerses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [surah, setSurah] = useState(null);
  const lastScrolledAyahRef = useRef(null);
  const hasAppliedInitialScrollRef = useRef(false);

  const initialAyahFromQuery = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const ayahParam = Number(params.get('ayah'));
    if (Number.isInteger(ayahParam) && ayahParam > 0) {
      return ayahParam;
    }
    return null;
  }, [location.search]);

  const scrollToAyah = useCallback((ayahNumber) => {
    const ayahElement = document.querySelector(`[data-ayah="${ayahNumber}"]`);
    if (ayahElement) {
      ayahElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      ayahElement.classList.add('ring-2', 'ring-emerald-400', 'ring-offset-2', 'transition-all');
      setTimeout(() => {
        ayahElement.classList.remove('ring-2', 'ring-emerald-400', 'ring-offset-2');
      }, 2200);
    }
  }, []);

  useEffect(() => {
    lastScrolledAyahRef.current = null;
    hasAppliedInitialScrollRef.current = false;
  }, [surahNumber]);

  useEffect(() => {
    if (initialAyahFromQuery) {
      hasAppliedInitialScrollRef.current = false;
    }
  }, [initialAyahFromQuery, location.key]);

  useEffect(() => {
    if (initialAyahFromQuery && surahNumber) {
      addVisitedAyah?.(Number(surahNumber), initialAyahFromQuery);
    }
  }, [initialAyahFromQuery, surahNumber, addVisitedAyah]);

  useEffect(() => {
    if (!playingAyah) {
      return;
    }

    const [playingSurahId, playingAyahNumber] = playingAyah.split(':').map(Number);

    if (Number(surahNumber) !== playingSurahId || !playingAyahNumber) {
      return;
    }

    addVisitedAyah?.(playingSurahId, playingAyahNumber);

    if (lastScrolledAyahRef.current === playingAyahNumber) {
      return;
    }

    lastScrolledAyahRef.current = playingAyahNumber;
    scrollToAyah(playingAyahNumber);
  }, [playingAyah, scrollToAyah, surahNumber, addVisitedAyah]);

  useEffect(() => {
    if (!initialAyahFromQuery || loading || verses.length === 0 || hasAppliedInitialScrollRef.current) {
      return;
    }

    const ayahNumber = initialAyahFromQuery;
    const timer = setTimeout(() => {
      scrollToAyah(ayahNumber);
      lastScrolledAyahRef.current = ayahNumber;
      hasAppliedInitialScrollRef.current = true;
    }, 150);

    return () => clearTimeout(timer);
  }, [initialAyahFromQuery, loading, location.key, scrollToAyah, verses.length]);

  useEffect(() => {
    const loadSurah = async () => {
      setLoading(true);
      const surahInfo = surahs.find((item) => item.id === parseInt(surahNumber, 10)) || null;
      setSurah(surahInfo);
      setCurrentSurah(surahInfo);

      const versesData = surahInfo ? await fetchSurahVerses(surahNumber) : [];
      setVerses(versesData);
      setLoading(false);

      if (surahNumber) {
        fetchSurahGrammar?.(surahNumber);
      }

      if (!initialAyahFromQuery && surahNumber) {
        addVisitedAyah?.(Number(surahNumber), 1);
      }
    };

    if (surahs.length > 0) {
      loadSurah();
    }
  }, [fetchSurahVerses, fetchSurahGrammar, setCurrentSurah, surahNumber, surahs, initialAyahFromQuery, addVisitedAyah]);

  // Track ayats as the user reads and scrolls through them
  useEffect(() => {
    if (loading || verses.length === 0 || typeof IntersectionObserver === 'undefined') {
      return;
    }

    let debounceTimer = null;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            const ayahNum = Number(entry.target.getAttribute('data-ayah'));
            if (ayahNum) {
              clearTimeout(debounceTimer);
              debounceTimer = setTimeout(() => {
                addVisitedAyah?.(Number(surahNumber), ayahNum);
              }, 1200);
            }
          }
        }
      },
      { threshold: 0.5 }
    );

    const ayahElements = document.querySelectorAll('[data-ayah]');
    ayahElements.forEach((el) => observer.observe(el));

    return () => {
      clearTimeout(debounceTimer);
      observer.disconnect();
    };
  }, [loading, surahNumber, verses.length, addVisitedAyah]);

  const cardStyle = THEME_CARD_STYLES[theme] || THEME_CARD_STYLES.green;
  const textStyle = THEME_TEXT_STYLES[theme] || THEME_TEXT_STYLES.green;
  const secondaryTextStyle = THEME_SECONDARY_TEXT_STYLES[theme] || THEME_SECONDARY_TEXT_STYLES.green;
  const linkStyle = THEME_LINK_STYLES[theme] || THEME_LINK_STYLES.green;

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-8 w-24 bg-slate-200 rounded animate-pulse" />
        </div>

        {/* Surah info skeleton */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`rounded-2xl p-8 shadow-xl ${cardStyle}`}
        >
          <div className="text-center space-y-4">
            <div className="h-8 w-48 bg-slate-200 rounded animate-pulse mx-auto" />
            <div className="h-6 w-64 bg-slate-200 rounded animate-pulse mx-auto" />
            <div className="h-10 w-32 bg-slate-200 rounded-lg animate-pulse mx-auto mt-4" />
          </div>
        </motion.div>

        {/* Bismillah skeleton */}
        <div className="h-12 w-full bg-slate-200 rounded animate-pulse" />

        {/* Ayah cards skeleton */}
        <div className="space-y-4">
          {[...Array(10)].map((_, index) => (
            <AyahCardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (!surah) {
    return (
      <div className="text-center py-12">
        <p className={secondaryTextStyle}>Surah not found</p>
        <Link to="/" className={`hover:underline mt-4 inline-block ${linkStyle}`}>
          Return to Home
        </Link>
      </div>
    );
  }

  const showBismillah = surah.id !== 1 && surah.id !== 9;
  const surahGrammar = grammarData?.[surah.id];
  const isEnhancedGrammar = Boolean(surahGrammar?.enhanced);
  const isSurah100Palette = surahGrammar?.color_palette === 'surah_100';
  const isDarkTheme = theme === 'dark';

  return (
    <div className="space-y-8">
      {/* Separate Audio Player Component - Prevents Re-renders */}
      <AudioPlayer 
        verses={verses}
        surah={surah}
        surahNumber={surahNumber}
        onScrollToAyah={scrollToAyah}
      />

      {/* Add bottom padding for audio player */}
      <div className="pb-20">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-xl p-6 shadow-lg ${cardStyle}`}
        >
          <div className="flex items-center justify-between mb-6">
            <Link
              to="/"
              className={`inline-flex items-center space-x-2 transition-colors ${linkStyle}`}
            >
              <SafeIcon icon={FiArrowLeft} />
              <span>Back to Surahs</span>
            </Link>

            <div className="flex items-center space-x-2">
              {Number(surahNumber) === 32 && (
                <button
                  type="button"
                  onClick={() => {
                    const quizEl = document.getElementById('surah-quiz-section');
                    if (quizEl) quizEl.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-3 py-1.5 rounded-xl border border-islamic-gold/50 bg-islamic-gold/10 text-islamic-gold hover:bg-islamic-gold/20 text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-xs"
                  title="Jump to Contemplative Quiz at the end of Surah 32"
                >
                  <span>💡 Tadabbur Quiz</span>
                </button>
              )}
              <GrammarToggle surahNumber={surah.id} />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-islamic-gold to-yellow-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">{surah.id}</span>
              </div>
              <div>
                <div className="flex items-center space-x-3">
                  <h1 className={`text-3xl font-bold ${textStyle}`}>{surah.name_simple}</h1>
                  <RevelationPlaceIcon place={surah.revelation_place} className={`w-6 h-6 ${secondaryTextStyle}`} />
                </div>
                <p className={`text-lg mt-1 ${textStyle}`}>{surah.translated_name.name}</p>
              </div>
            </div>

            <div className="text-right">
              <div className={`quran-text-pak !text-inherit [text-shadow:none] text-4xl ${textStyle}`}>
                {surah.name_arabic}
              </div>
            </div>
          </div>

          {isEnhancedGrammar && grammarMode !== 'off' && (
            <div
              data-testid="enhanced-sarf-legend"
              className={`mt-5 pt-4 border-t text-xs space-y-2.5 ${
                isDarkTheme
                  ? 'border-slate-700 text-slate-300'
                  : 'border-slate-200/80 text-slate-600'
              }`}
            >
              {isSurah100Palette ? (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                      {/* Ism Red Shades */}
                      <span className="inline-flex flex-wrap items-center gap-1.5 font-semibold">
                        <span className={`font-bold ${isDarkTheme ? 'text-red-300' : 'text-red-800'}`}>
                          اسم Noun (Red):
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block" aria-hidden="true" />
                          <span>مفرد Singular</span>
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-800 inline-block" aria-hidden="true" />
                          <span>جمع Plural</span>
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block" aria-hidden="true" />
                          <span>ضمير Pronoun</span>
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" aria-hidden="true" />
                          <span>مشتق/مصدر Derived</span>
                        </span>
                      </span>
                    </div>

                    <p className="opacity-85">
                      Tap any word for <span className="font-semibold">Ṣarf, Conjugation Modal, Iḍāfa &amp; Iʿrāb</span>
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1.5 border-t border-current/10">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                      {/* Verb Green Shades */}
                      <span className="inline-flex flex-wrap items-center gap-1.5 font-semibold">
                        <span className={`font-bold ${isDarkTheme ? 'text-emerald-300' : 'text-emerald-800'}`}>
                          فعل Verb (Green):
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-700 inline-block" aria-hidden="true" />
                          <span>ماضٍ Past</span>
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" aria-hidden="true" />
                          <span>مضارع Present</span>
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded-full bg-teal-500 inline-block" aria-hidden="true" />
                          <span>مستقبل/أمر Future &amp; Amr</span>
                        </span>
                      </span>

                      {/* Harf Royal Blue & Pulsing Emphasis */}
                      <span className="inline-flex flex-wrap items-center gap-1.5 font-semibold">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" aria-hidden="true" />
                        <span className={`font-bold ${isDarkTheme ? 'text-blue-300' : 'text-blue-800'}`}>
                          حرف Harf (Royal Blue)
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full border text-[11px] harf-emphasis-pulse ${
                            emphasisPulsePaused ? 'harf-emphasis-paused' : ''
                          } ${
                            isDarkTheme
                              ? 'bg-indigo-950/80 text-blue-200 border-indigo-500'
                              : 'bg-indigo-100 text-indigo-900 border-indigo-300'
                          }`}
                        >
                          <span>✦ توكيد Emphasis Pulse</span>
                        </span>
                      </span>

                      {/* Iḍāfa Construct Chain */}
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border font-semibold ${
                          isDarkTheme
                            ? 'bg-amber-950/70 text-amber-200 border-amber-500/70'
                            : 'bg-amber-100 text-amber-900 border-amber-400'
                        }`}
                      >
                        <span>🔗 مضاف ومضاف إليه (Iḍāfa)</span>
                      </span>
                    </div>

                    {/* Accessible Pause/Play control for continuous emphasis pulse (WCAG 2.2.2) */}
                    <button
                      type="button"
                      data-testid="toggle-emphasis-pulse"
                      onClick={() => setEmphasisPulsePaused?.((prev) => !prev)}
                      className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 ${
                        isDarkTheme
                          ? 'bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700'
                          : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {emphasisPulsePaused ? 'Play Emphasis Pulse' : 'Pause Emphasis Pulse'}
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                    <span className="flex items-center gap-1.5 font-medium">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" aria-hidden="true" />
                      <span>اسم Noun</span>
                    </span>
                    <span className="flex items-center gap-1.5 font-medium">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" aria-hidden="true" />
                      <span>فعل Verb</span>
                    </span>
                    <span className="flex items-center gap-1.5 font-medium">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" aria-hidden="true" />
                      <span>حرف Particle</span>
                    </span>
                    {showInterlinear && (
                      <span className={`font-medium ${isDarkTheme ? 'text-amber-300' : 'text-amber-800'}`}>
                        • <span className="font-arabic">الوزن (ف–ع–ل)</span> shown under words
                      </span>
                    )}
                  </div>

                  <p className="opacity-85">
                    Tap any word for <span className="font-semibold">Ṣarf, Iʿrāb &amp; Reflection</span>
                  </p>
                </div>
              )}
            </div>
          )}
        </motion.div>

      {showBismillah && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bismillah text-center py-1"
        >
          <div className="text-sm opacity-75">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </div>
        </motion.div>
      )}

        <div className="space-y-6" id="verses-container">
          {verses.map((verse) => (
            <div key={`ayah-${surahNumber}-${verse.verse_number}`} data-ayah={verse.verse_number}>
              <AyahCard
                verse={verse}
                surahNumber={parseInt(surahNumber, 10)}
              />
            </div>
          ))}
        </div>

        {/* Contemplative Tadabbur Quiz for Surah 32 */}
        {Number(surahNumber) === 32 && (
          <div id="surah-quiz-section">
            <SurahQuiz surahNumber={32} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Surah;