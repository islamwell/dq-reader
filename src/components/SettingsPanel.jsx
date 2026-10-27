import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';
import { FaPalette } from 'react-icons/fa';
import toast from 'react-hot-toast';
import SafeIcon from '../common/SafeIcon';
import { useQuranData } from '../contexts/QuranContext';
import { RECITERS } from '../data/reciters';
import { OfflineCache } from '../utils/offlineCache';

const {
  FiGlobe,
  FiBookmark,
  FiArrowRight,
  FiHome,
  FiVideo,
  FiExternalLink,
  FiVolume2,
  FiHeadphones,
  FiSearch,
  FiDownloadCloud,
  FiInfo,
  FiTrash2,
  FiHardDrive
} = FiIcons;

const themeOptions = ['green', 'red', 'blue', 'light', 'dark', 'sepia'];
const languageOptions = ['English', 'Urdu', 'French', 'Norsk'];

const LANGUAGE_FLAG_GRADIENTS = {
  English: 'bg-gradient-to-b from-[#012169] via-[#C8102E] to-[#012169]',
  Urdu: 'bg-gradient-to-b from-[#01411C] via-[#01411C] to-slate-100',
  French: 'bg-gradient-to-b from-[#002654] via-white to-[#CE1126]',
  Norsk: 'bg-gradient-to-b from-[#BA0C2F] via-[#00205B] to-[#BA0C2F]'
};

const SettingsPanel = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const {
    theme,
    language,
    bookmarks,
    surahs,
    selectedReciter,
    setThemePreference,
    setLanguagePreference,
    setReciterPreference,
    enablePrimaryAudio,
    enableSupplementalAudio,
    enableDQ2Audio,
    setPrimaryAudioEnabled,
    setSupplementalAudioEnabled,
    setDQ2AudioEnabled,
    includeTranslationsInSearch,
    setSearchTranslationsEnabled,
    fetchSurahVerses,
    audioCacheProgress,
    cacheArabicAudio,
    cacheUrduAudio
  } = useQuranData();

  const [versesCache, setVersionsCache] = useState({});
  const [arabicCacheNote, setArabicCacheNote] = useState('');
  const [urduCacheNote, setUrduCacheNote] = useState('');

  const topBookmarks = useMemo(() => bookmarks.slice(0, 3), [bookmarks]);

  const arabicProgress = audioCacheProgress?.arabic || {};
  const urduProgress = audioCacheProgress?.urdu || {};
  const isArabicCaching = arabicProgress.status === 'in-progress';
  const isUrduCaching = urduProgress.status === 'in-progress';

  const formatCacheProgress = (progress) => {
    if (!progress?.total) return '';
    const percentage = Math.floor((progress.completed / progress.total) * 100);
    return `${progress.completed}/${progress.total} ayat cached (${percentage}%)`;
  };

  useEffect(() => {
    if (arabicProgress.status === 'complete') {
      setArabicCacheNote('Arabic audio is ready for offline playback.');
      return;
    }

    if (arabicProgress.completed > 0) {
      setArabicCacheNote(`Arabic audio: ${formatCacheProgress(arabicProgress)}`);
    }
  }, [arabicProgress]);

  useEffect(() => {
    if (urduProgress.status === 'complete') {
      setUrduCacheNote('Urdu audio is ready for offline playback.');
      return;
    }

    if (urduProgress.completed > 0) {
      setUrduCacheNote(`Urdu audio: ${formatCacheProgress(urduProgress)}`);
    }
  }, [urduProgress]);

  // Get current reciter name
  const currentReciterName = useMemo(() => {
    const reciter = RECITERS.find(r => r.folder === selectedReciter);
    return reciter?.name || 'Quran';
  }, [selectedReciter]);

  // Create surah lookup
  const surahLookup = useMemo(() => {
    return surahs.reduce((accumulator, surah) => {
      accumulator[surah.id] = surah;
      return accumulator;
    }, {});
  }, [surahs]);

  // Load verses for bookmarks
  useEffect(() => {
    const loadVerses = async () => {
      const newCache = { ...versesCache };
      for (const bookmark of topBookmarks) {
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
    };

    if (topBookmarks.length > 0) {
      loadVerses();
    }
  }, [topBookmarks, fetchSurahVerses]);

  // Get verse text for a bookmark
  const getVerseText = (surahNumber, ayahNumber) => {
    const verses = versesCache[`${surahNumber}`];
    if (!verses) return null;
    return verses.find((v) => v.verse_number === ayahNumber);
  };

  const handleNavigate = (surahNumber, ayahNumber) => {
    onClose();
    navigate(`/surah/${surahNumber}?ayah=${ayahNumber}`);
  };

  const handleViewAllBookmarks = () => {
    onClose();
    navigate('/bookmarks');
  };

  const handleGoHome = () => {
    onClose();
    navigate('/');
  };

  const handleGoToVideos = () => {
    onClose();
    navigate('/videos');
  };

  const handleGoToCredits = () => {
    onClose();
    navigate('/credits');
  };

  const handleCacheArabicAudio = async () => {
    try {
      setArabicCacheNote('Starting Arabic audio download...');
      await cacheArabicAudio((progress) => {
        setArabicCacheNote(`Arabic audio: ${formatCacheProgress(progress)}`);
      });
    } catch (error) {
      console.error('Failed to cache Arabic audio:', error);
      toast.error('Unable to cache Arabic audio. Please try again.');
      setArabicCacheNote('');
    }
  };

  const handleCacheUrduAudio = async () => {
    try {
      setUrduCacheNote('Starting Urdu audio download...');
      await cacheUrduAudio((progress) => {
        setUrduCacheNote(`Urdu audio: ${formatCacheProgress(progress)}`);
      });
    } catch (error) {
      console.error('Failed to cache Urdu audio:', error);
      toast.error('Unable to cache Urdu audio. Please try again.');
      setUrduCacheNote('');
    }
  };

  const [showCacheModal, setShowCacheModal] = useState(false);
  const [cacheStats, setCacheStats] = useState({
    totalBytes: 0,
    formattedSize: '0 B',
    quotaFormatted: '',
    arabicCount: 0,
    urduCount: 0,
    totalTracks: 0,
    isLoading: false
  });

  const loadCacheStats = useCallback(async () => {
    setCacheStats((prev) => ({ ...prev, isLoading: true }));
    try {
      let totalBytes = 0;
      let quotaBytes = 0;
      let totalTracks = 0;
      let arabicCount = 0;
      let urduCount = 0;

      // 1. Check storage estimate
      if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
        try {
          const estimate = await navigator.storage.estimate();
          totalBytes = estimate.usage || 0;
          quotaBytes = estimate.quota || 0;
        } catch (e) {
          console.warn('Storage estimate error:', e);
        }
      }

      // 2. Count cached audio files
      if (typeof window !== 'undefined' && 'caches' in window) {
        const audioCaches = ['dq-audio-v1', 'quran-audio-v1'];
        for (const cacheName of audioCaches) {
          try {
            const hasCache = await caches.has(cacheName);
            if (hasCache) {
              const cache = await caches.open(cacheName);
              const requests = await cache.keys();
              totalTracks += requests.length;
              requests.forEach((req) => {
                const url = (req.url || '').toLowerCase();
                if (url.includes('urdu') || url.includes('junagarhi') || url.includes('dq2')) {
                  urduCount += 1;
                } else {
                  arabicCount += 1;
                }
              });
            }
          } catch (e) {
            console.warn(`Error inspecting cache ${cacheName}:`, e);
          }
        }
      }

      const formatBytes = (bytes) => {
        if (!bytes || bytes <= 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
      };

      setCacheStats({
        totalBytes,
        formattedSize: formatBytes(totalBytes),
        quotaFormatted: quotaBytes > 0 ? formatBytes(quotaBytes) : '',
        arabicCount,
        urduCount,
        totalTracks,
        isLoading: false
      });
    } catch (error) {
      console.error('Failed to load cache stats:', error);
      setCacheStats((prev) => ({
        ...prev,
        formattedSize: '0 B',
        isLoading: false
      }));
    }
  }, []);

  const handleClearAudioCache = async () => {
    try {
      setCacheStats((prev) => ({ ...prev, isLoading: true }));

      if (typeof window !== 'undefined' && 'caches' in window) {
        const audioCaches = ['dq-audio-v1', 'quran-audio-v1'];
        for (const cacheName of audioCaches) {
          try {
            await caches.delete(cacheName);
          } catch (e) {
            console.warn(`Error deleting cache ${cacheName}:`, e);
          }
        }
      }

      if (OfflineCache?.isNative?.()) {
        try {
          await OfflineCache.clearAll();
        } catch (e) {
          console.warn('Error clearing native cache:', e);
        }
      }

      setArabicCacheNote('');
      setUrduCacheNote('');
      await loadCacheStats();

      toast.success('Audio cache cleared successfully');
    } catch (error) {
      console.error('Failed to clear audio cache:', error);
      toast.error('Failed to clear audio cache');
      setCacheStats((prev) => ({ ...prev, isLoading: false }));
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.aside
            id="settings-panel"
            className="fixed top-0 right-0 z-50 h-full w-full max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          >
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <SafeIcon icon={FiBookmark} className="text-islamic-gold" />
                  <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Bookmarks</h3>
                </div>
                {topBookmarks.length === 0 ? (
                  <p className="text-sm text-slate-500">No bookmarks yet. Tap a verse number to bookmark it.</p>
                ) : (
                  <div className="space-y-3">
                    {topBookmarks.map((bookmark) => {
                      const surah = surahLookup[bookmark.surahNumber];
                      const verseText = getVerseText(bookmark.surahNumber, bookmark.ayahNumber);
                      const arabicText = verseText ? verseText.text_uthmani : '';

                      return (
                        <button
                          key={bookmark.id}
                          type="button"
                          onClick={() => handleNavigate(bookmark.surahNumber, bookmark.ayahNumber)}
                          className="w-full flex flex-col gap-2 px-4 py-3 bg-islamic-50 border border-islamic-100 rounded-lg hover:border-islamic-gold transition-colors"
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="text-left">
                              <p className="text-sm font-semibold text-islamic-700">
                                {surah ? surah.name_simple : `Surah ${bookmark.surahNumber}`}:{bookmark.ayahNumber}
                              </p>
                            </div>
                            <SafeIcon icon={FiArrowRight} className="text-islamic-gold" />
                          </div>
                          {arabicText && (
                            <div className="quran-text-pak text-right text-sm text-islamic-800 truncate w-full">
                              {arabicText}
                            </div>
                          )}
                        </button>
                      );
                    })}
                    {bookmarks.length > 3 && (
                      <button
                        type="button"
                        onClick={handleViewAllBookmarks}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-green-600 bg-green-50 border border-green-200 rounded-lg transition-all shadow-[0_14px_32px_-18px_rgba(34,197,94,0.45)] hover:bg-green-100 hover:text-green-700 hover:border-green-300 hover:shadow-[0_24px_48px_-18px_rgba(22,163,74,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-300"
                      >
                        <SafeIcon icon={FiBookmark} className="text-green-500" />
                        View all bookmarks
                      </button>
                    )}
                  </div>
                )}
              </section>

              <section>
                <div className="grid grid-cols-3 gap-3 mb-4 items-center">
                  <div className="flex items-center gap-2 col-span-2">
                    <SafeIcon icon={FaPalette} className="text-islamic-gold" />
                    <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Theme</h3>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-xs font-semibold text-rose-600 hover:text-rose-700 justify-self-end"
                    aria-label="Close settings"
                  >
                    Close ✕
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {themeOptions.map((option) => {
                    const isActive = theme === option;
                    const baseClasses = 'px-2.5 py-2 rounded-md text-xs font-semibold capitalize text-white transition-transform transform hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';

                    const optionColorClasses = {
                      green: 'bg-emerald-500 hover:bg-emerald-600 focus-visible:ring-emerald-400',
                      red: 'bg-rose-500 hover:bg-rose-600 focus-visible:ring-rose-400',
                      blue: 'bg-sky-500 hover:bg-sky-600 focus-visible:ring-sky-400',
                      light: 'bg-slate-300 text-slate-800 hover:bg-slate-400 focus-visible:ring-slate-300',
                      dark: 'bg-slate-800 hover:bg-slate-700 focus-visible:ring-slate-600',
                      sepia: 'bg-amber-600 hover:bg-amber-700 focus-visible:ring-amber-500'
                    };

                    const inactiveClasses = 'opacity-80';
                    const activeClasses = 'ring-2 ring-offset-2 ring-white shadow-lg';

                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setThemePreference(option)}
                        className={`${baseClasses} ${optionColorClasses[option] || 'bg-slate-500 hover:bg-slate-600 focus-visible:ring-slate-400'} ${isActive ? activeClasses : inactiveClasses}`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-4">
                  <SafeIcon icon={FiGlobe} className="text-islamic-gold" />
                  <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Language</h3>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {languageOptions.map((option) => {
                    const isActive = language === option;
                    const flagGradient = LANGUAGE_FLAG_GRADIENTS[option] || 'bg-slate-700';

                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setLanguagePreference(option)}
                        className={`relative h-11 px-2 rounded-lg ${flagGradient} flex items-center justify-center transition-all ${
                          isActive
                            ? 'ring-2 ring-offset-2 ring-emerald-500 shadow-md scale-105 border-white/60'
                            : 'border border-black/10 opacity-90 hover:opacity-100 hover:scale-[1.02] shadow-xs'
                        }`}
                        title={`${option} language`}
                      >
                        <span className="text-white font-bold text-xs tracking-wide drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.9)]">
                          {option}
                        </span>
                        {isActive && (
                          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400 ring-1 ring-white" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-4">
                  <SafeIcon icon={FiSearch} className="text-islamic-gold" />
                  <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Search</h3>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={includeTranslationsInSearch}
                  onClick={() => setSearchTranslationsEnabled(!includeTranslationsInSearch)}
                  className={`w-full flex items-center justify-between gap-4 rounded-lg border px-4 py-3 transition-colors ${
                    includeTranslationsInSearch
                      ? 'border-islamic-gold bg-islamic-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="text-left">
                    <p className="text-sm font-semibold text-slate-700">Include translations in search</p>
                    <p className="text-xs text-slate-500">
                      Find matches in the selected translation along with Arabic text.
                    </p>
                  </div>
                  <span
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      includeTranslationsInSearch ? 'bg-islamic-gold' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                        includeTranslationsInSearch ? 'translate-x-5' : 'translate-x-1'
                      }`}
                    />
                  </span>
                </button>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-4">
                  <SafeIcon icon={FiVolume2} className="text-islamic-gold" />
                  <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Audio Options</h3>
                </div>
                <div className="space-y-3">
                  <div className="rounded-xl p-3.5 bg-emerald-50/80 border border-emerald-200 shadow-xs space-y-2">
                    <label htmlFor="reciter-select" className="block text-sm font-semibold text-emerald-950">
                      Select Reciter
                    </label>
                    <select
                      id="reciter-select"
                      value={selectedReciter}
                      onChange={(e) => setReciterPreference(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-emerald-300 text-emerald-950 bg-white font-medium hover:border-emerald-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none transition-all shadow-xs"
                    >
                      {RECITERS.map((reciter) => (
                        <option key={reciter.folder} value={reciter.folder}>
                          {reciter.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={enablePrimaryAudio}
                    onClick={() => setPrimaryAudioEnabled(!enablePrimaryAudio)}
                    className={`w-full flex items-center justify-between gap-4 rounded-lg border px-4 py-3 transition-colors ${
                      enablePrimaryAudio
                        ? 'border-islamic-gold bg-islamic-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 text-left">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-islamic-gold/10">
                        <SafeIcon icon={FiHeadphones} className="text-lg text-islamic-gold" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-700">{currentReciterName} Recitation</p>
                        <p className="text-xs text-slate-500">Toggle the primary Quran recitation audio.</p>
                      </div>
                    </div>
                    <span
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        enablePrimaryAudio ? 'bg-islamic-gold' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                          enablePrimaryAudio ? 'translate-x-5' : 'translate-x-1'
                        }`}
                      />
                    </span>
                  </button>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={enableSupplementalAudio}
                    onClick={() => setSupplementalAudioEnabled(!enableSupplementalAudio)}
                    className={`w-full flex items-center justify-between gap-4 rounded-lg border px-4 py-3 transition-colors ${
                      enableSupplementalAudio
                        ? 'border-islamic-gold bg-islamic-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 text-left">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-islamic-gold/10">
                        <SafeIcon icon={FiVolume2} className="text-lg text-islamic-gold" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-700">Custom Translation Audio</p>
                        <p className="text-xs text-slate-500">Toggle the supplemental translation playback.</p>
                      </div>
                    </div>
                    <span
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        enableSupplementalAudio ? 'bg-islamic-gold' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                          enableSupplementalAudio ? 'translate-x-5' : 'translate-x-1'
                        }`}
                      />
                    </span>
                  </button>

                  {/* DQ2 Audio Toggle */}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={enableDQ2Audio}
                    onClick={() => setDQ2AudioEnabled(!enableDQ2Audio)}
                    className={`w-full flex items-center justify-between gap-4 rounded-lg border px-4 py-3 mt-3 transition-colors ${
                      enableDQ2Audio
                        ? 'border-islamic-gold bg-islamic-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 text-left">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-islamic-gold/10">
                        <SafeIcon icon={FiVolume2} className="text-lg text-islamic-gold" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-700">DQ2 Translation Audio</p>
                        <p className="text-xs text-slate-500">Use DQ2 custom audio in addition to default.</p>
                      </div>
                    </div>
                    <span
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        enableDQ2Audio ? 'bg-islamic-gold' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                          enableDQ2Audio ? 'translate-x-5' : 'translate-x-1'
                        }`}
                      />
                    </span>
                  </button>

                  <div className="flex items-center justify-between pt-1 pb-1">
                    <div className="flex items-center gap-2">
                      <SafeIcon icon={FiDownloadCloud} className="text-islamic-gold" />
                      <span className="text-sm font-semibold text-slate-700">Offline Audio Storage</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCacheModal(true);
                        loadCacheStats();
                      }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 transition-colors shadow-xs"
                      title="View offline storage usage & clear cache"
                    >
                      <SafeIcon icon={FiInfo} className="text-sm text-emerald-600" />
                      <span>Cache Details</span>
                    </button>
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-islamic-gold/10">
                        <SafeIcon icon={FiDownloadCloud} className="text-lg text-islamic-gold" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-slate-700">Cache Arabic audio</p>
                            <p className="text-xs text-slate-500">
                              Download the selected reciter so playback works fully offline.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={handleCacheArabicAudio}
                            disabled={isArabicCaching}
                            className={`rounded-md px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors ${
                              isArabicCaching
                                ? 'bg-slate-400 cursor-not-allowed'
                                : 'bg-islamic-gold hover:bg-yellow-600'
                            }`}
                          >
                            {isArabicCaching ? 'Caching...' : 'Cache Arabic'}
                          </button>
                        </div>
                        {arabicCacheNote && <p className="text-xs text-slate-600">{arabicCacheNote}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-islamic-gold/10">
                        <SafeIcon icon={FiDownloadCloud} className="text-lg text-islamic-gold" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-slate-700">Cache Urdu audio</p>
                            <p className="text-xs text-slate-500">
                              Save Urdu translation narration for offline listening.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={handleCacheUrduAudio}
                            disabled={isUrduCaching}
                            className={`rounded-md px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors ${
                              isUrduCaching
                                ? 'bg-slate-400 cursor-not-allowed'
                                : 'bg-islamic-gold hover:bg-yellow-600'
                            }`}
                          >
                            {isUrduCaching ? 'Caching...' : 'Cache Urdu'}
                          </button>
                        </div>
                        {urduCacheNote && <p className="text-xs text-slate-600">{urduCacheNote}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <div className="px-5 py-4 border-t border-slate-200 grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={handleGoToCredits}
                className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg text-xs sm:text-sm font-semibold bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition-colors"
                title="Credits & information"
              >
                <SafeIcon icon={FiExternalLink} className="text-sm shrink-0" />
                <span>Credits</span>
              </button>
              <button
                type="button"
                onClick={handleGoToVideos}
                className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white border border-blue-700 shadow-xs transition-colors"
                title="Ayah videos"
              >
                <SafeIcon icon={FiVideo} className="text-sm shrink-0" />
                <span>Video</span>
              </button>
              <button
                type="button"
                onClick={handleGoHome}
                className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg text-xs sm:text-sm font-semibold bg-emerald-100 hover:bg-emerald-200 text-emerald-950 border border-emerald-300 shadow-xs transition-colors"
                title="Return to homepage"
              >
                <SafeIcon icon={FiHome} className="text-sm shrink-0" />
                <span>Home</span>
              </button>
            </div>
          </motion.aside>

          {/* Cache Details & Management Modal */}
          {showCacheModal && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full overflow-hidden p-6 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
                      <SafeIcon icon={FiHardDrive} className="text-lg" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-800">Audio Cache Details</h3>
                      <p className="text-xs text-slate-500">Offline storage & memory</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCacheModal(false)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors text-sm font-bold"
                    aria-label="Close modal"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Storage Used</p>
                    <p className="text-3xl font-bold text-slate-900">
                      {cacheStats.isLoading ? 'Calculating...' : cacheStats.formattedSize}
                    </p>
                    {cacheStats.quotaFormatted && (
                      <p className="text-xs text-slate-500 mt-1">Available Device Quota: {cacheStats.quotaFormatted}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100">
                      <p className="text-xs text-emerald-800 font-medium">Arabic Audio</p>
                      <p className="text-lg font-bold text-emerald-950 mt-0.5">
                        {cacheStats.isLoading ? '...' : `${cacheStats.arabicCount} tracks`}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100">
                      <p className="text-xs text-emerald-800 font-medium">Urdu Audio</p>
                      <p className="text-lg font-bold text-emerald-950 mt-0.5">
                        {cacheStats.isLoading ? '...' : `${cacheStats.urduCount} tracks`}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 text-center leading-relaxed">
                    Audio tracks are cached on your device for offline playback. You can clear the cache at any time to free up storage space.
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleClearAudioCache}
                    disabled={cacheStats.isLoading}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors disabled:opacity-50"
                  >
                    <SafeIcon icon={FiTrash2} />
                    <span>Clear Cache</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCacheModal(false)}
                    className="px-4 py-2.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </AnimatePresence>
  );
};

export default SettingsPanel;
