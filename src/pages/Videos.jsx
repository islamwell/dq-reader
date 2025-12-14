import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import toast from 'react-hot-toast';
import SafeIcon from '../common/SafeIcon';
import { useQuranData } from '../contexts/QuranContext';

const { FiArrowLeft, FiPlay, FiVideo, FiLink2, FiSearch, FiFilter, FiList, FiBook, FiExternalLink } = FiIcons;

const THEME_CARD_STYLES = {
  green: 'bg-emerald-50/50 border border-emerald-200 hover:border-emerald-300',
  red: 'bg-rose-50/50 border border-rose-200 hover:border-rose-300',
  blue: 'bg-blue-50/50 border border-blue-200 hover:border-blue-300',
  light: 'bg-white border border-slate-200 hover:border-slate-300',
  dark: 'bg-slate-800/50 border border-slate-700 hover:border-slate-600',
  sepia: 'bg-amber-50/50 border border-amber-300 hover:border-amber-400'
};

const THEME_ACTIVE_STYLES = {
  green: 'bg-emerald-100 border-emerald-400',
  red: 'bg-rose-100 border-rose-400',
  blue: 'bg-blue-100 border-blue-400',
  light: 'bg-slate-100 border-slate-400',
  dark: 'bg-slate-700 border-slate-500',
  sepia: 'bg-amber-100 border-amber-400'
};

const buildVideoList = (videoMappings, surahs) => {
  const surahLookup = surahs.reduce((acc, surah) => {
    acc[surah.id] = surah;
    return acc;
  }, {});

  return Object.entries(videoMappings)
    .flatMap(([surahId, entries]) => {
      return entries.map((entry) => ({
        ...entry,
        surahId: Number(surahId),
        surah: surahLookup[Number(surahId)]
      }));
    })
    .sort((a, b) => {
      if (a.surahId === b.surahId) {
        return a.startAyah - b.startAyah;
      }
      return a.surahId - b.surahId;
    });
};

const Videos = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { videoMappings, surahs, theme } = useQuranData();
  const [activeVideoId, setActiveVideoId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSurahFilter, setSelectedSurahFilter] = useState('all');
  const playerContainerRef = useRef(null);
  const playerRef = useRef(null);
  const [playerAspectRatio, setPlayerAspectRatio] = useState(16 / 9);

  const videos = useMemo(() => buildVideoList(videoMappings, surahs), [videoMappings, surahs]);

  // Extract unique surahs that have videos for the filter dropdown
  const availableSurahs = useMemo(() => {
    const surahIds = new Set(videos.map(v => v.surahId));
    return surahs.filter(s => surahIds.has(s.id));
  }, [videos, surahs]);

  const filteredVideos = useMemo(() => {
    let result = videos;

    if (selectedSurahFilter !== 'all') {
      result = result.filter(v => v.surahId === Number(selectedSurahFilter));
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(v => 
        v.title?.toLowerCase().includes(query) || 
        v.surah?.name_simple.toLowerCase().includes(query) ||
        v.surah?.translated_name.name.toLowerCase().includes(query)
      );
    }

    return result;
  }, [videos, selectedSurahFilter, searchQuery]);

  const activeVideo = useMemo(() => {
    if (videos.length === 0) {
      return null;
    }
    return videos.find((video) => video.id === activeVideoId) || videos[0];
  }, [activeVideoId, videos]);

  const firstPlayableVideo = useMemo(
    () => filteredVideos.find((video) => Boolean(video.videoUrl)) || filteredVideos[0] || null,
    [filteredVideos]
  );

  useEffect(() => {
    const element = playerRef.current;

    if (!element || !activeVideo) {
      return;
    }

    element.volume = 0.03;
    element.loop = false;
    element.autoplay = true;
    element.currentTime = 0;

    const playPromise = element.play();
    if (playPromise?.catch) {
      playPromise.catch(() => {});
    }
  }, [activeVideo]);

  useEffect(() => {
    const highlighted = searchParams.get('videoId');

    if (highlighted && videos.some((video) => video.id === highlighted)) {
      setActiveVideoId(highlighted);
    } else if (!activeVideoId && firstPlayableVideo) {
      setActiveVideoId(firstPlayableVideo.id);
    }
  }, [searchParams, videos, activeVideoId, firstPlayableVideo]);

  useEffect(() => {
    if (!filteredVideos.length || !firstPlayableVideo) {
      return;
    }

    const isActiveInFiltered = filteredVideos.some((video) => video.id === activeVideoId);
    if (!isActiveInFiltered) {
      setActiveVideoId(firstPlayableVideo.id);
      setSearchParams({ videoId: firstPlayableVideo.id });
    }
  }, [activeVideoId, filteredVideos, firstPlayableVideo, setSearchParams]);

  useEffect(() => {
    if (activeVideo && !activeVideo.videoUrl) {
      const nextVideo = getNextPlayableVideo(activeVideo.id) || firstPlayableVideo;
      if (nextVideo && nextVideo.id !== activeVideo.id) {
        handleSelectVideo(nextVideo.id);
      }
    }
  }, [activeVideo, firstPlayableVideo, getNextPlayableVideo, handleSelectVideo]);

  const handleVideoError = () => {
    toast.error('Unable to load the video stream. Please verify the URL.');
    if (activeVideo) {
      const nextVideo = getNextPlayableVideo(activeVideo.id) || firstPlayableVideo;
      if (nextVideo && nextVideo.id !== activeVideo.id) {
        handleSelectVideo(nextVideo.id);
      }
    }
  };

  useEffect(() => {
    setPlayerAspectRatio(16 / 9);
  }, [activeVideo?.id]);

  const handleSelectVideo = useCallback(
    (videoId) => {
      setActiveVideoId(videoId);
      setSearchParams({ videoId });
      // Scroll to top on mobile only
      if (window.innerWidth < 1024) {
        playerContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },
    [setSearchParams]
  );

  const getNextPlayableVideo = useCallback(
    (currentId) => {
      if (!filteredVideos.length) return null;

      const startIndex = filteredVideos.findIndex((video) => video.id === currentId);
      const beginIndex = startIndex === -1 ? -1 : startIndex;

      for (let i = beginIndex + 1; i < filteredVideos.length; i += 1) {
        const candidate = filteredVideos[i];
        if (candidate?.videoUrl) {
          return candidate;
        }
      }

      return null;
    },
    [filteredVideos]
  );

  const handleVideoEnded = useCallback(() => {
    if (!activeVideo) return;

    const nextVideo = getNextPlayableVideo(activeVideo.id);
    if (nextVideo) {
      handleSelectVideo(nextVideo.id);
    }
  }, [activeVideo, getNextPlayableVideo, handleSelectVideo]);

  const cardStyle = THEME_CARD_STYLES[theme] || THEME_CARD_STYLES.green;
  const activeStyle = THEME_ACTIVE_STYLES[theme] || THEME_ACTIVE_STYLES.green;

  const handleLoadedMetadata = (event) => {
    const element = event?.target;
    if (!element || !element.videoWidth || !element.videoHeight) return;

    const ratio = element.videoWidth / element.videoHeight;
    if (Number.isFinite(ratio) && ratio > 0) {
      setPlayerAspectRatio(ratio);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-islamic-800 flex items-center gap-2">
            <SafeIcon icon={FiVideo} /> Video Library
          </h1>
          <p className="text-islamic-600 text-sm mt-1">
            Curated long-form videos linked to Quranic ayah ranges.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:border-islamic-gold hover:text-islamic-gold transition-colors self-start md:self-auto"
        >
          <SafeIcon icon={FiArrowLeft} />
          <span>Back to Home</span>
        </button>
      </div>

      {videos.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-xl p-12 shadow-sm text-center border-2 border-dashed border-slate-200 ${cardStyle}`}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 text-slate-400 mb-4">
            <SafeIcon icon={FiVideo} className="text-3xl" />
          </div>
          <h3 className="text-lg font-medium text-islamic-800 mb-2">No Videos Available</h3>
          <p className="text-islamic-600">Add video ranges from the Admin Panel to see them here.</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Main Video Player Area - Takes 2 cols on lg screens */}
          <div className="lg:col-span-2 space-y-4" ref={playerContainerRef}>
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl overflow-hidden shadow-2xl bg-slate-900 relative group"
              style={{ aspectRatio: playerAspectRatio || 16 / 9 }}
            >
              {activeVideo?.videoUrl ? (
                <video
                  key={activeVideo.id}
                  ref={playerRef}
                  controls
                  controlsList="nodownload noremoteplayback"
                  autoPlay
                  className="w-full h-full object-cover"
                  preload="metadata"
                  playsInline
                  onError={handleVideoError}
                  onEnded={handleVideoEnded}
                  onLoadedMetadata={handleLoadedMetadata}
                  poster={null}
                >
                  <source src={activeVideo.videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <SafeIcon icon={FiVideo} className="text-5xl mb-4 opacity-50" />
                  <p>Select a video to play</p>
                </div>
              )}
            </motion.div>

            {activeVideo && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-6 rounded-xl shadow-sm border ${cardStyle} bg-opacity-40 backdrop-blur-sm`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-islamic-900 mb-2">
                      {activeVideo.title || 'Untitled Video'}
                    </h2>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-islamic-700">
                       <span className="flex items-center gap-1 bg-islamic-100/50 px-2 py-1 rounded">
                        <SafeIcon icon={FiBook} className="text-islamic-600" />
                        Surah {activeVideo.surah?.name_simple} ({activeVideo.surahId})
                      </span>
                      <span className="flex items-center gap-1 bg-islamic-100/50 px-2 py-1 rounded">
                        <SafeIcon icon={FiPlay} className="text-islamic-600" />
                        Ayahs {activeVideo.startAyah}-{activeVideo.endAyah}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {activeVideo && (
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/surah/${activeVideo.surahId}?ayah=${activeVideo.endAyah || activeVideo.startAyah || 1}`
                          )
                        }
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors text-sm font-medium whitespace-nowrap"
                      >
                        <SafeIcon icon={FiExternalLink} />
                        Go to ayah
                      </button>
                    )}
                    {activeVideo?.videoUrl && (
                      <a
                        href={activeVideo.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-islamic-50 text-islamic-700 hover:bg-islamic-100 transition-colors border border-islamic-200 text-sm font-medium whitespace-nowrap"
                      >
                        <SafeIcon icon={FiLink2} />
                        Open Source
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar Video List - Takes 1 col on lg screens */}
          <div className="lg:col-span-1 flex flex-col h-full gap-4">
            
            {/* Search and Filter Controls */}
            <div className="bg-white/50 p-4 rounded-xl border border-slate-200 shadow-sm backdrop-blur-sm sticky top-4 z-10">
              <div className="space-y-3">
                <div className="relative">
                  <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search videos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-islamic-gold/50 focus:border-islamic-gold text-sm"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                   <SafeIcon icon={FiFilter} className="text-slate-400" />
                   <select
                    value={selectedSurahFilter}
                    onChange={(e) => setSelectedSurahFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-islamic-gold/50 focus:border-islamic-gold text-sm bg-white"
                   >
                     <option value="all">All Surahs</option>
                     {availableSurahs.map(surah => (
                       <option key={surah.id} value={surah.id}>
                         {surah.id}. {surah.name_simple}
                       </option>
                     ))}
                   </select>
                </div>
              </div>
            </div>

            {/* Scrollable List */}
            <div className="flex-1 overflow-y-auto max-h-[600px] pr-1 space-y-3 custom-scrollbar">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <SafeIcon icon={FiList} /> Up Next
                </h3>
                <span className="text-xs text-slate-400">{filteredVideos.length} videos</span>
              </div>
              
              <AnimatePresence initial={false}>
                {filteredVideos.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-8 text-slate-500 text-sm"
                  >
                    No videos match your search.
                  </motion.div>
                ) : (
                  filteredVideos.map((video) => (
                    <motion.button
                      key={video.id}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      onClick={() => handleSelectVideo(video.id)}
                      className={`w-full text-left p-3 rounded-xl border transition-all duration-200 group ${
                        activeVideoId === video.id
                          ? activeStyle + ' shadow-md ring-1 ring-islamic-gold/30'
                          : cardStyle + ' hover:shadow-md'
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className={`flex-shrink-0 w-20 h-14 rounded-lg flex items-center justify-center bg-slate-100 text-slate-400 border border-slate-200 group-hover:bg-islamic-50 group-hover:text-islamic-500 transition-colors`}>
                           <SafeIcon icon={FiPlay} className="text-xl" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold line-clamp-2 mb-1 ${
                            activeVideoId === video.id ? 'text-islamic-900' : 'text-slate-700'
                          }`}>
                            {video.title || `Video for Surah ${video.surahId}`}
                          </p>
                          <div className="flex items-center text-xs text-slate-500 gap-2">
                            <span className="truncate">{video.surah?.name_simple}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                            <span>{video.startAyah}-{video.endAyah}</span>
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Videos;
