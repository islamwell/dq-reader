import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useQuranData, useQuranAudio } from '../contexts/QuranContext';
import { SearchResultSkeleton } from '../components/Skeleton';
import { highlightMatches } from '../utils/fuzzySearch';

const { FiArrowLeft, FiSettings, FiArrowRight, FiHome, FiPlay, FiPause, FiBookmark } = FiIcons;

const HighlightText = ({ text, query }) => {
  const segments = highlightMatches(text, query);
  return (
    <>
      {segments.map((seg, i) =>
        seg.highlighted
          ? <mark key={i} className="bg-amber-200 text-amber-900 rounded px-0.5">{seg.text}</mark>
          : <span key={i}>{seg.text}</span>
      )}
    </>
  );
};

const SearchResults = ({ onOpenSettings }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { searchQuran, toggleBookmark, bookmarks } = useQuranData();
  const { playAudio, pauseAudio, resumeAudio, playingAyah, isPaused } = useQuranAudio();
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
      <div className="min-h-screen bg-gradient-to-br from-islamic-50 to-islamic-100">
        <nav className="bg-white shadow-lg border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors text-islamic-700 bg-islamic-50 hover:bg-islamic-100 font-medium"
              >
                <SafeIcon icon={FiArrowLeft} />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors text-slate-600 hover:bg-slate-100"
                title="Home"
              >
                <SafeIcon icon={FiHome} className="text-lg" />
              </button>
            </div>
            <button
              type="button"
              onClick={onOpenSettings}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors text-slate-600 hover:bg-slate-100"
            >
              <SafeIcon icon={FiSettings} className="text-lg" />
            </button>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <div className="h-9 w-64 bg-slate-200 rounded-lg mb-2 animate-pulse"></div>
            <div className="h-6 w-48 bg-slate-200 rounded-lg animate-pulse"></div>
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
    <div className="min-h-screen bg-gradient-to-br from-islamic-50 to-islamic-100">
      <nav className="bg-white shadow-lg border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors text-islamic-700 bg-islamic-50 hover:bg-islamic-100 font-medium"
              >
                <SafeIcon icon={FiArrowLeft} />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors text-slate-600 hover:bg-slate-100"
                title="Home"
              >
                <SafeIcon icon={FiHome} className="text-lg" />
              </button>
            </div>
            <button
              type="button"
              onClick={onOpenSettings}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors text-slate-600 hover:bg-slate-100"
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
          <h1 className="text-3xl font-bold text-islamic-800 mb-2">Search Results</h1>
          <p className="text-islamic-600">
            Found <span className="font-semibold text-islamic-gold">{results.length}</span> result{results.length !== 1 ? 's' : ''} for "{query}"
          </p>
        </motion.div>

        {results.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl p-12 shadow-lg text-center"
          >
            <p className="text-islamic-600 text-lg">No results found for your search.</p>
            <p className="text-slate-500 mt-2">Try different keywords or phrases.</p>
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
                className="w-full bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.01]"
              >
                {isAyah ? (
                  <div className="flex flex-col">
                    <div 
                      className="flex items-start justify-between gap-4 cursor-pointer group"
                      onClick={() => handleResultClick(result)}
                    >
                      <div className="flex-1">
                        <p className="text-xs uppercase tracking-wide text-islamic-gold font-semibold mb-2">
                          Ayah • {result.surahNumber}:{result.ayahNumber}
                        </p>
                        <p className="text-base font-semibold text-slate-900 mb-2 group-hover:text-islamic-600 transition-colors">
                          {result.surahName}
                          {result.surahEnglishName ? ` • ${result.surahEnglishName}` : ''}
                        </p>
                        {result.snippet && (
                          <p className="text-xl text-slate-700 quran-text-pak leading-relaxed mb-3">
                            <HighlightText text={result.snippet} query={query} />
                          </p>
                        )}
                        {result.translationSnippet && (
                          <p className="text-sm text-slate-600 leading-relaxed mt-3">
                            <HighlightText text={result.translationSnippet} query={query} />
                          </p>
                        )}
                      </div>
                      <SafeIcon icon={FiArrowRight} className="text-slate-400 mt-1 flex-shrink-0 group-hover:text-islamic-500 transition-colors" />
                    </div>
                    
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
                       <button
                         type="button"
                         onClick={(e) => {
                           e.stopPropagation();
                           toggleBookmark(result.surahNumber, result.ayahNumber);
                         }}
                         className={`p-2 rounded-full transition-colors ${
                           isBookmarked
                             ? 'bg-islamic-100 text-islamic-600'
                             : 'hover:bg-slate-100 text-slate-400 hover:text-slate-600'
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
                             ? 'bg-islamic-600 text-white shadow-md shadow-islamic-500/30 hover:bg-islamic-700'
                             : 'bg-islamic-50 text-islamic-600 hover:bg-islamic-100'
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
                      <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-2">
                        Surah • {result.surahNumber}
                      </p>
                      <p className="text-base font-semibold text-slate-900 mb-2 group-hover:text-islamic-600 transition-colors">
                        <HighlightText text={result.name} query={query} />
                        {result.englishName ? ` • ${result.englishName}` : ''}
                      </p>
                      <p className="text-lg text-slate-700 quran-text-pak">
                        {result.arabicName}
                      </p>
                    </div>
                    <SafeIcon icon={FiArrowRight} className="text-slate-400 flex-shrink-0 group-hover:text-islamic-500 transition-colors" />
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
