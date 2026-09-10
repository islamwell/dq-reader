import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useQuranData, useQuranAudio } from '../contexts/QuranContext';
import { AyahCardSkeleton } from '../components/Skeleton';

const {
  FiArrowLeft,
  FiBookmark,
  FiChevronRight,
  FiExternalLink,
  FiTrash2,
  FiEdit2,
  FiCheck,
  FiX,
  FiPlay,
  FiPause
} = FiIcons;

const THEME_CARD_STYLES = {
  green: 'bg-white border border-emerald-200',
  red: 'bg-white border border-rose-200',
  blue: 'bg-white border border-blue-200',
  light: 'bg-white border border-slate-200',
  dark: 'bg-slate-800/80 border border-slate-700',
  sepia: 'bg-amber-50/70 border border-amber-300'
};

const THEME_TEXT_STYLES = {
  green: 'text-emerald-950',
  red: 'text-rose-950',
  blue: 'text-blue-950',
  light: 'text-slate-900',
  dark: 'text-slate-100',
  sepia: 'text-amber-950'
};

const THEME_SECONDARY_TEXT_STYLES = {
  green: 'text-emerald-700',
  red: 'text-rose-700',
  blue: 'text-blue-700',
  light: 'text-slate-600',
  dark: 'text-slate-400',
  sepia: 'text-amber-800'
};

const THEME_ACCENT_BOX_STYLES = {
  green: 'bg-emerald-50/70 border border-emerald-100 text-emerald-900',
  red: 'bg-rose-50/70 border border-rose-100 text-rose-900',
  blue: 'bg-blue-50/70 border border-blue-100 text-blue-900',
  light: 'bg-slate-50 border border-slate-200 text-slate-800',
  dark: 'bg-slate-900/70 border border-slate-700 text-slate-200',
  sepia: 'bg-amber-100/60 border border-amber-300 text-amber-950'
};

const Bookmarks = () => {
  const navigate = useNavigate();
  const { bookmarks, surahs, removeBookmark, updateBookmarkNote, fetchSurahVerses, theme } = useQuranData();
  const { playAudio, pauseAudio, resumeAudio, playingAyah, isPaused } = useQuranAudio();
  const [editingId, setEditingId] = useState(null);
  const [noteValue, setNoteValue] = useState('');
  const [versesCache, setVersionsCache] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const cardStyle = THEME_CARD_STYLES[theme] || THEME_CARD_STYLES.green;
  const textStyle = THEME_TEXT_STYLES[theme] || THEME_TEXT_STYLES.green;
  const secondaryTextStyle = THEME_SECONDARY_TEXT_STYLES[theme] || THEME_SECONDARY_TEXT_STYLES.green;
  const accentBoxStyle = THEME_ACCENT_BOX_STYLES[theme] || THEME_ACCENT_BOX_STYLES.green;

  const surahLookup = useMemo(() => {
    return surahs.reduce((accumulator, surah) => {
      accumulator[surah.id] = surah;
      return accumulator;
    }, {});
  }, [surahs]);

  const sortedBookmarks = useMemo(() => {
    return [...bookmarks].sort((a, b) => {
      const timeA = a.updatedAt || a.createdAt || 0;
      const timeB = b.updatedAt || b.createdAt || 0;
      return timeB - timeA;
    });
  }, [bookmarks]);

  // Load verses for bookmarks
  useEffect(() => {
    const loadVerses = async () => {
      setIsLoading(true);
      const newCache = { ...versesCache };
      for (const bookmark of bookmarks) {
        const cacheKey = `${bookmark.surahNumber}`;
        if (!newCache[cacheKey]) {
          try {
            const verses = await fetchSurahVerses(bookmark.surahNumber);
            newCache[cacheKey] = verses;
          } catch (error) {
            console.error(`Error loading verses for surah ${bookmark.surahNumber}:`, error);
          }
        }
      }
      setVersionsCache(newCache);
      setIsLoading(false);
    };

    if (bookmarks.length > 0) {
      loadVerses();
    } else {
      setIsLoading(false);
    }
  }, [bookmarks, fetchSurahVerses]);

  // Get first 5 words of Arabic text
  const getArabicPreview = (arabicText) => {
    if (!arabicText) return '';
    const words = arabicText.split(/\s+/).slice(0, 5);
    return words.join(' ');
  };

  // Get verse text for a bookmark
  const getVerseText = (surahNumber, ayahNumber) => {
    const verses = versesCache[`${surahNumber}`];
    if (!verses) return null;
    return verses.find((v) => v.verse_number === ayahNumber);
  };

  // Handle play audio
  const handlePlayAudio = (surahNumber, ayahNumber) => {
    const ayahKey = `${surahNumber}:${ayahNumber}`;
    if (playingAyah === ayahKey && !isPaused) {
      pauseAudio();
      return;
    }
    if (playingAyah === ayahKey && isPaused) {
      resumeAudio();
      return;
    }
    playAudio(surahNumber, ayahNumber);
  };

  const handleNavigateBack = () => {
    navigate('/');
  };

  const handleOpenBookmark = (bookmark) => {
    navigate(`/surah/${bookmark.surahNumber}?ayah=${bookmark.ayahNumber}`);
  };

  const handleEditNote = (bookmark) => {
    setEditingId(bookmark.id);
    setNoteValue(bookmark.note || '');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNoteValue('');
  };

  const handleSaveNote = (bookmarkId) => {
    const trimmedNote = noteValue.trim();
    updateBookmarkNote(bookmarkId, trimmedNote);
    setEditingId(null);
    setNoteValue('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold mb-1 ${textStyle}`}>Bookmarks</h1>
          <p className={secondaryTextStyle}>Manage and revisit your saved ayahs.</p>
        </div>
        <button
          type="button"
          onClick={handleNavigateBack}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
            theme === 'dark'
              ? 'border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white'
              : 'border-slate-200 text-slate-600 hover:border-amber-500 hover:text-slate-900'
          }`}
        >
          <SafeIcon icon={FiArrowLeft} />
          <span>Back to Home</span>
        </button>
      </div>

      {sortedBookmarks.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className={`border border-dashed rounded-xl p-10 text-center ${cardStyle}`}
        >
          <div className={`mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center ${accentBoxStyle}`}>
            <SafeIcon icon={FiBookmark} className="text-2xl text-amber-500" />
          </div>
          <h2 className={`text-xl font-semibold mb-2 ${textStyle}`}>No bookmarks yet</h2>
          <p className={`text-sm mb-4 ${secondaryTextStyle}`}>
            Tap the verse number inside any surah to create your first bookmark.
          </p>
          <button
            type="button"
            onClick={handleNavigateBack}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors shadow-sm font-medium"
          >
            <SafeIcon icon={FiExternalLink} />
            <span>Explore Surahs</span>
          </button>
        </motion.div>
      ) : isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <AyahCardSkeleton key={index} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {sortedBookmarks.map((bookmark) => {
            const surah = surahLookup[bookmark.surahNumber];
            const isEditing = editingId === bookmark.id;
            const verseText = getVerseText(bookmark.surahNumber, bookmark.ayahNumber);
            const arabicPreview = verseText ? getArabicPreview(verseText.text_uthmani) : '';
            const ayahKey = `${bookmark.surahNumber}:${bookmark.ayahNumber}`;
            const isPlaying = playingAyah === ayahKey;

            return (
              <motion.div
                key={bookmark.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-xl p-5 shadow-sm ${cardStyle}`}
              >
                <div className="flex flex-col gap-4">
                  {/* Header with Surah name and reference */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className={`text-lg font-semibold ${textStyle}`}>
                        {surah ? surah.name_simple : `Surah ${bookmark.surahNumber}`}
                      </p>
                      <p className={`text-sm ${secondaryTextStyle}`}>
                        {bookmark.surahNumber}:{bookmark.ayahNumber}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handlePlayAudio(bookmark.surahNumber, bookmark.ayahNumber)}
                        className={`inline-flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
                          isPlaying && !isPaused
                            ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm'
                            : theme === 'dark'
                              ? 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                              : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                        }`}
                        title={isPlaying ? (isPaused ? 'Resume audio' : 'Pause audio') : 'Play audio'}
                      >
                        <SafeIcon icon={isPlaying && !isPaused ? FiPause : FiPlay} className="text-lg" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenBookmark(bookmark)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors text-sm font-medium shadow-sm"
                      >
                        <span>Open</span>
                        <SafeIcon icon={FiChevronRight} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEditNote(bookmark)}
                        className={`inline-flex items-center justify-center w-10 h-10 rounded-full border transition-colors ${
                          theme === 'dark'
                            ? 'border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white'
                            : 'border-slate-200 text-slate-600 hover:border-amber-500 hover:text-amber-700'
                        }`}
                        title="Edit note"
                      >
                        <SafeIcon icon={FiEdit2} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeBookmark(bookmark.id)}
                        className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900/60 dark:text-rose-400 dark:hover:bg-rose-950/40 transition-colors"
                        title="Remove bookmark"
                      >
                        <SafeIcon icon={FiTrash2} />
                      </button>
                    </div>
                  </div>

                  {/* Arabic preview */}
                  {arabicPreview && (
                    <div className={`quran-text-pak text-right p-3 rounded-lg leading-relaxed ${accentBoxStyle}`}>
                      {arabicPreview}
                    </div>
                  )}

                  {/* Note section */}
                  {isEditing ? (
                    <div className="space-y-3">
                      <textarea
                        value={noteValue}
                        onChange={(event) => setNoteValue(event.target.value)}
                        rows={3}
                        className={`w-full rounded-lg border transition-colors p-3 text-sm focus:ring-2 focus:ring-amber-500/40 ${
                          theme === 'dark'
                            ? 'bg-slate-900 text-slate-100 border-slate-700 placeholder-slate-500'
                            : theme === 'sepia'
                              ? 'bg-amber-50 text-amber-950 border-amber-300 placeholder-amber-700'
                              : 'bg-white text-slate-900 border-slate-300 placeholder-slate-400'
                        }`}
                        placeholder="Add a personal reflection or reminder"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors text-sm ${
                            theme === 'dark'
                              ? 'border-slate-700 text-slate-400 hover:text-slate-200'
                              : 'border-slate-200 text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          <SafeIcon icon={FiX} />
                          <span>Cancel</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveNote(bookmark.id)}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-sm font-medium shadow-sm"
                        >
                          <SafeIcon icon={FiCheck} />
                          <span>Save Note</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className={`rounded-lg p-4 ${accentBoxStyle}`}>
                      <p className="text-xs uppercase tracking-wide opacity-75 mb-1 font-medium">Note</p>
                      <p className="text-sm">
                        {bookmark.note ? bookmark.note : 'No note added yet.'}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Bookmarks;
