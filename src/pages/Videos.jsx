import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import toast from 'react-hot-toast';
import SafeIcon from '../common/SafeIcon';
import { useQuranData } from '../contexts/QuranContext';

const { FiArrowLeft, FiPlay, FiVideo, FiLink2 } = FiIcons;

const THEME_CARD_STYLES = {
  green: 'bg-emerald-50/50 border border-emerald-200',
  red: 'bg-rose-50/50 border border-rose-200',
  blue: 'bg-blue-50/50 border border-blue-200',
  light: 'bg-white border border-slate-200',
  dark: 'bg-slate-800/50 border border-slate-700',
  sepia: 'bg-amber-50/50 border border-amber-300'
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
  const [searchParams] = useSearchParams();
  const { videoMappings, surahs, theme } = useQuranData();
  const [activeVideoId, setActiveVideoId] = useState(null);
  const videoRef = useRef(null);

  const videos = useMemo(() => buildVideoList(videoMappings, surahs), [videoMappings, surahs]);
  const activeVideo = useMemo(() => {
    return videos.find((video) => video.id === activeVideoId) || videos[0];
  }, [activeVideoId, videos]);

  useEffect(() => {
    const highlighted = searchParams.get('videoId');

    if (highlighted && videos.some((video) => video.id === highlighted)) {
      setActiveVideoId(highlighted);
      return;
    }

    if (!activeVideoId && videos.length > 0) {
      setActiveVideoId(videos[0].id);
    }
  }, [activeVideoId, searchParams, videos]);

  const handleVideoError = () => {
    toast.error('Unable to load the video stream. Please verify the URL.');
  };

  const handleSelectVideo = (videoId) => {
    setActiveVideoId(videoId);
    videoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const cardStyle = THEME_CARD_STYLES[theme] || THEME_CARD_STYLES.green;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-islamic-800 flex items-center gap-2">
            <SafeIcon icon={FiVideo} /> Video Library
          </h1>
          <p className="text-islamic-600">Browse and play long-form videos linked to ayah ranges.</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:border-islamic-gold hover:text-islamic-gold transition-colors"
        >
          <SafeIcon icon={FiArrowLeft} />
          <span>Back to Home</span>
        </button>
      </div>

      {videos.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-xl p-8 shadow-lg text-center ${cardStyle}`}
        >
          <p className="text-islamic-700">No videos available yet. Add a video range from the Admin Panel.</p>
        </motion.div>
      ) : (
        <>
          <motion.div
            ref={videoRef}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl shadow-xl overflow-hidden ${cardStyle}`}
          >
            <div className="p-5 border-b border-islamic-100/70 flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-gradient-to-r from-islamic-50 to-white">
              <div>
                <p className="text-sm text-islamic-500 uppercase">Now Playing</p>
                <h2 className="text-2xl font-semibold text-islamic-800">
                  {activeVideo?.title || 'Untitled Video'}
                </h2>
                {activeVideo && (
                  <p className="text-sm text-islamic-600">
                    Surah {activeVideo.surahId}: Ayahs {activeVideo.startAyah}-{activeVideo.endAyah}
                  </p>
                )}
              </div>
              {activeVideo?.videoUrl && (
                <a
                  href={activeVideo.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-islamic-gold text-white hover:bg-yellow-600 transition-colors"
                >
                  <SafeIcon icon={FiLink2} />
                  <span>Open Source</span>
                </a>
              )}
            </div>

            <div className="bg-slate-900 p-4">
              {activeVideo?.videoUrl ? (
                <video
                  key={activeVideo.id}
                  controls
                  controlsList="nodownload noremoteplayback"
                  className="w-full rounded-xl shadow-lg max-h-[480px] object-contain bg-black"
                  preload="metadata"
                  playsInline
                  onError={handleVideoError}
                >
                  <source src={activeVideo.videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="text-center text-slate-200 py-8">No video selected.</div>
              )}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((video) => (
              <motion.button
                key={video.id}
                type="button"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => handleSelectVideo(video.id)}
                className={`text-left p-4 rounded-xl border transition-all hover:-translate-y-1 hover:shadow-lg ${
                  activeVideo?.id === video.id
                    ? 'border-islamic-gold bg-islamic-50'
                    : 'border-islamic-200 bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-islamic-800 flex items-center gap-2">
                      <SafeIcon icon={FiVideo} /> Surah {video.surahId}
                    </p>
                    {video.surah && (
                      <p className="text-xs text-islamic-600">{video.surah.name_simple} • {video.surah.translated_name.name}</p>
                    )}
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs text-islamic-700 bg-islamic-50 border border-islamic-100 px-2 py-1 rounded-full">
                    <SafeIcon icon={FiPlay} /> {video.startAyah}-{video.endAyah}
                  </span>
                </div>
                {video.title && <p className="text-sm text-islamic-700 line-clamp-2">{video.title}</p>}
              </motion.button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Videos;
