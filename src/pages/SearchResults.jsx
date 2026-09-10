import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useQuranData, useQuranAudio } from '../contexts/QuranContext';
import { SearchResultSkeleton } from '../components/Skeleton';
import { highlightMatches } from '../utils/fuzzySearch';

const { FiArrowLeft, FiSettings, FiArrowRight, FiHome, FiPlay, FiPause, FiBookmark } = FiIcons;

const THEME_STYLES = {
  green: {
    shell: 'bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 text-emerald-950',
    navBg: 'bg-emerald-50/95 backdrop-blur-sm border-emerald-200 text-emerald-950',
    card: 'bg-white border border-emerald-200/80',
    cardBorder: 'border-emerald-100',
    text: 'text-emerald-950',
    secondaryText: 'text-emerald-700',
    highlight: 'bg-emerald-200 text-emerald-950',
    backBtn: 'text-emerald-700 bg-emerald-100/70 hover:bg-emerald-200',
    navBtn: 'text-emerald-700 hover:bg-emerald-100/70',
    ayahNum: 'text-emerald-700 font-semibold',
    playActive: 'bg-emerald-600 text-white shadow-emerald-500/30 hover:bg-emerald-700',
    playInactive: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200',
    bookmarkActive: 'bg-emerald-100 text-emerald-700'
  },
  red: {
    shell: 'bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100 text-rose-950',
    navBg: 'bg-rose-50/95 backdrop-blur-sm border-rose-200 text-rose-950',
    card: 'bg-white border border-rose-200/80',
    cardBorder: 'border-rose-100',
    text: 'text-rose-950',
    secondaryText: 'text-rose-700',
    highlight: 'bg-rose-200 text-rose-950',
    backBtn: 'text-rose-700 bg-rose-100/70 hover:bg-rose-200',
    navBtn: 'text-rose-700 hover:bg-rose-100/70',
    ayahNum: 'text-rose-700 font-semibold',
    playActive: 'bg-rose-600 text-white shadow-rose-500/30 hover:bg-rose-700',
    playInactive: 'bg-rose-100 text-rose-800 hover:bg-rose-200',
    bookmarkActive: 'bg-rose-100 text-rose-700'
  },
  blue: {
    shell: 'bg-gradient-to-br from-blue-50 via-sky-50 to-blue-100 text-blue-950',
    navBg: 'bg-blue-50/95 backdrop-blur-sm border-blue-200 text-blue-950',
    card: 'bg-white border border-blue-200/80',
    cardBorder: 'border-blue-100',
    text: 'text-blue-950',
    secondaryText: 'text-blue-700',
    highlight: 'bg-blue-200 text-blue-950',
    backBtn: 'text-blue-700 bg-blue-100/70 hover:bg-blue-200',
    navBtn: 'text-blue-700 hover:bg-blue-100/70',
    ayahNum: 'text-blue-700 font-semibold',
    playActive: 'bg-blue-600 text-white shadow-blue-500/30 hover:bg-blue-700',
    playInactive: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
    bookmarkActive: 'bg-blue-100 text-blue-700'
  },
  light: {
    shell: 'bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 text-slate-900',
    navBg: 'bg-white/95 backdrop-blur-sm border-slate-200 text-slate-800',
    card: 'bg-white border border-slate-200',
    cardBorder: 'border-slate-100',
    text: 'text-slate-900',
    secondaryText: 'text-slate-600',
    highlight: 'bg-amber-200 text-amber-950',
    backBtn: 'text-slate-700 bg-slate-100 hover:bg-slate-200',
    navBtn: 'text-slate-600 hover:bg-slate-100',
    ayahNum: 'text-amber-600 font-semibold',
    playActive: 'bg-amber-500 text-white shadow-amber-500/30 hover:bg-amber-600',
    playInactive: 'bg-amber-50 text-amber-800 hover:bg-amber-100',
    bookmarkActive: 'bg-amber-100 text-amber-700'
  },
  dark: {
    shell: 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50',
    navBg: 'bg-slate-900/95 backdrop-blur-sm border-slate-700/50 text-slate-50',
    card: 'bg-slate-800/80 border border-slate-700',
    cardBorder: 'border-slate-700/60',
    text: 'text-slate-50',
    secondaryText: 'text-slate-400',
    highlight: 'bg-amber-500/30 text-amber-200',
    backBtn: 'text-slate-200 bg-slate-800 hover:bg-slate-700',
    navBtn: 'text-slate-300 hover:bg-slate-800',
    ayahNum: 'text-amber-400 font-semibold',
    playActive: 'bg-amber-500 text-white shadow-amber-500/30 hover:bg-amber-600',
    playInactive: 'bg-slate-700 text-slate-200 hover:bg-slate-600',
    bookmarkActive: 'bg-amber-950/60 text-amber-300 border border-amber-800/60'
  },
  sepia: {
    shell: 'bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 text-amber-950',
    navBg: 'bg-amber-50/95 backdrop-blur-sm border-amber-300 text-amber-900',
    card: 'bg-amber-50/70 border border-amber-300',
    cardBorder: 'border-amber-200',
    text: 'text-amber-950',
    secondaryText: 'text-amber-800',
    highlight: 'bg-amber-200 text-amber-950',
    backBtn: 'text-amber-800 bg-amber-100 hover:bg-amber-200',
    navBtn: 'text-amber-800 hover:bg-amber-100',
    ayahNum: 'text-amber-800 font-semibold',
    playActive: 'bg-amber-600 text-white shadow-amber-600/30 hover:bg-amber-700',
    playInactive: 'bg-amber-200/70 text-amber-900 hover:bg-amber-200',
    bookmarkActive: 'bg-amber-200 text-amber-900'
  }
};

const HighlightText = ({ text, query, highlightClass = 'bg-amber-200 text-amber-900' }) => {
  const segments = highlightMatches(text, query);
  return (
    <>
      {segments.map((seg, i) =>
        seg.highlighted
          ? <mark key={i} className={`rounded px-0.5 ${highlightClass}`}>{seg.text}</mark>
          : <span key={i}>{seg.text}</span>
      )}
    </>
  );
};

const SearchResults = ({ onOpenSettings }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { searchQuran, toggleBookmark, bookmarks, theme, openSettings } = useQuranData();
  const { playAudio, pauseAudio, resumeAudio, playingAyah, isPaused } = useQuranAudio();
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const themeStyles = THEME_STYLES[theme] || THEME_STYLES.green;
  const handleOpenSettings = onOpenSettings || openSettings;
  const query = useMemo(() => searchParams.get('q') || '', [searchParams]);

  useEffect(() => {
    const performSearch = async () => {
      if (!query.trim() || !searchQuran) {
        setResults([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const matches = await searchQuran(query);
        setResults(Array.isArray(matches) ? matches : []);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [query, searchQuran]);

  const handleResultClick = (result) => {
    if (result.type === 'ayah') {
      navigate(`/surah/${result.surahNumber}?ayah=${result.ayahNumber}`);
    } else if (result.type === 'surah') {
      navigate(`/surah/${result.surahNumber}`);
    }
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen ${themeStyles.shell}`}>
        <nav className={`shadow-lg border-b ${themeStyles.navBg}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors font-medium ${themeStyles.backBtn}`}
                >
                  <SafeIcon icon={FiArrowLeft} />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${themeStyles.navBtn}`}
                  title="Home"
                >
                  <SafeIcon icon={FiHome} className="text-lg" />
                </button>
              </div>
              <button
                type="button"
                onClick={handleOpenSettings}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${themeStyles.navBtn}`}
              >
                <SafeIcon icon={FiSettings} className="text-lg" />
              </button>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <div className="h-9 w-64 bg-slate-200/50 rounded-lg mb-2 animate-pulse" />
            <div className="h-6 w-48 bg-slate-200/50 rounded-lg animate-pulse" />
          </div>
          <div className="space-y-4">
            {[...Array(8)].map((_, index) => (
              <SearchResultSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${themeStyles.shell}`}>
      <nav className={`shadow-lg border-b ${themeStyles.navBg}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors font-medium ${themeStyles.backBtn}`}
              >
                <SafeIcon icon={FiArrowLeft} />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${themeStyles.navBtn}`}
                title="Home"
              >
                <SafeIcon icon={FiHome} className="text-lg" />
              </button>
            </div>
            <button
              type="button"
              onClick={handleOpenSettings}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${themeStyles.navBtn}`}
            >
              <SafeIcon icon={FiSettings} className="text-lg" />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className={`text-3xl font-bold mb-2 ${themeStyles.text}`}>Search Results</h1>
          <p className={themeStyles.secondaryText}>
            Found <span className={`font-semibold ${themeStyles.ayahNum}`}>{results.length}</span> result{results.length !== 1 ? 's' : ''} for "{query}"
          </p>
        </motion.div>

        {results.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`rounded-xl p-12 shadow-lg text-center ${themeStyles.card}`}
          >
            <p className={`text-lg ${themeStyles.text}`}>No results found for your search.</p>
            <p className={`mt-2 ${themeStyles.secondaryText}`}>Try different keywords or phrases.</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {results.map((result, index) => {
              const isAyah = result.type === 'ayah';
              const ayahKey = isAyah ? `${result.surahNumber}:${result.ayahNumber}` : '';
              const isBookmarked = isAyah && bookmarks.some(b => b.surahNumber === result.surahNumber && b.ayahNumber === result.ayahNumber);
              const isPlaying = isAyah && playingAyah === ayahKey;

              return (
              <motion.div
                key={result.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`w-full rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.01] ${themeStyles.card}`}
              >
                {isAyah ? (
                  <div className="flex flex-col">
                    <div 
                      className="flex items-start justify-between gap-4 cursor-pointer group"
                      onClick={() => handleResultClick(result)}
                    >
                      <div className="flex-1">
                        <p className={`text-xs uppercase tracking-wide mb-2 ${themeStyles.ayahNum}`}>
                          Ayah • {result.surahNumber}:{result.ayahNumber}
                        </p>
                        <p className={`text-base font-semibold mb-2 group-hover:opacity-80 transition-opacity ${themeStyles.text}`}>
                          {result.surahName}
                          {result.surahEnglishName ? ` • ${result.surahEnglishName}` : ''}
                        </p>
                        {result.snippet && (
                          <p className={`text-xl quran-text-pak leading-relaxed mb-3 ${themeStyles.text}`}>
                            <HighlightText text={result.snippet} query={query} highlightClass={themeStyles.highlight} />
                          </p>
                        )}
                        {result.translationSnippet && (
                          <p className={`text-sm leading-relaxed mt-3 ${themeStyles.secondaryText}`}>
                            <HighlightText text={result.translationSnippet} query={query} highlightClass={themeStyles.highlight} />
                          </p>
                        )}
                      </div>
                      <SafeIcon icon={FiArrowRight} className={`mt-1 flex-shrink-0 group-hover:translate-x-0.5 transition-transform ${themeStyles.secondaryText}`} />
                    </div>
                    
                    <div className={`mt-4 pt-3 border-t flex items-center justify-end space-x-3 ${themeStyles.cardBorder}`}>
                       <button
                         type="button"
                         onClick={(e) => {
                           e.stopPropagation();
                           toggleBookmark(result.surahNumber, result.ayahNumber);
                         }}
                         className={`p-2 rounded-full transition-colors ${
                           isBookmarked
                             ? themeStyles.bookmarkActive
                             : 'hover:opacity-80 opacity-60'
                         }`}
                         title={isBookmarked ? "Remove Bookmark" : "Bookmark Ayah"}
                       >
                         <SafeIcon icon={FiBookmark} className={isBookmarked ? 'fill-current' : ''} />
                       </button>
                       <button
                         type="button"
                         onClick={(e) => {
                           e.stopPropagation();
                           if (isPlaying && !isPaused) pauseAudio();
                           else if (isPlaying && isPaused) resumeAudio();
                           else playAudio(result.surahNumber, result.ayahNumber);
                         }}
                         className={`p-3 rounded-full transition-all duration-200 ${
                           isPlaying
                             ? themeStyles.playActive
                             : themeStyles.playInactive
                         }`}
                         title={isPlaying && !isPaused ? "Pause Audio" : "Play Audio"}
                       >
                         <SafeIcon icon={isPlaying && !isPaused ? FiPause : FiPlay} className={isPlaying ? "text-lg" : "text-lg ml-0.5"} />
                       </button>
                    </div>
                  </div>
                ) : (
                  <div 
                    className="flex items-center justify-between gap-4 cursor-pointer group"
                    onClick={() => handleResultClick(result)}
                  >
                    <div>
                      <p className={`text-xs uppercase tracking-wide mb-2 ${themeStyles.secondaryText}`}>
                        Surah • {result.surahNumber}
                      </p>
                      <p className={`text-base font-semibold mb-2 group-hover:opacity-80 transition-opacity ${themeStyles.text}`}>
                        <HighlightText text={result.name} query={query} highlightClass={themeStyles.highlight} />
                        {result.englishName ? ` • ${result.englishName}` : ''}
                      </p>
                      <p className={`text-lg quran-text-pak ${themeStyles.text}`}>
                        {result.arabicName}
                      </p>
                    </div>
                    <SafeIcon icon={FiArrowRight} className={`flex-shrink-0 group-hover:translate-x-0.5 transition-transform ${themeStyles.secondaryText}`} />
                  </div>
                )}
              </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
