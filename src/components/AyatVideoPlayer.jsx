import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useQuranData } from '../contexts/QuranContext';

const {
    FiPlay,
    FiPause,
    FiRepeat,
    FiRotateCcw,
    FiRotateCw,
    FiMaximize2,
    FiMinimize2,
    FiExternalLink,
    FiX
} = FiIcons;

const THEME_PLAYER_STYLES = {
    green: {
        container: 'bg-emerald-50/80 border-emerald-200',
        controls: 'bg-emerald-100/90 border-emerald-200',
        button: 'bg-emerald-200 hover:bg-emerald-300 text-emerald-800',
        buttonActive: 'bg-emerald-500 hover:bg-emerald-600 text-white',
        progress: 'bg-emerald-200',
        progressFill: 'bg-emerald-500',
        text: 'text-emerald-800',
        badge: 'bg-emerald-100 text-emerald-700 border-emerald-300'
    },
    red: {
        container: 'bg-rose-50/80 border-rose-200',
        controls: 'bg-rose-100/90 border-rose-200',
        button: 'bg-rose-200 hover:bg-rose-300 text-rose-800',
        buttonActive: 'bg-rose-500 hover:bg-rose-600 text-white',
        progress: 'bg-rose-200',
        progressFill: 'bg-rose-500',
        text: 'text-rose-800',
        badge: 'bg-rose-100 text-rose-700 border-rose-300'
    },
    blue: {
        container: 'bg-blue-50/80 border-blue-200',
        controls: 'bg-blue-100/90 border-blue-200',
        button: 'bg-blue-200 hover:bg-blue-300 text-blue-800',
        buttonActive: 'bg-blue-500 hover:bg-blue-600 text-white',
        progress: 'bg-blue-200',
        progressFill: 'bg-blue-500',
        text: 'text-blue-800',
        badge: 'bg-blue-100 text-blue-700 border-blue-300'
    },
    light: {
        container: 'bg-slate-50/80 border-slate-200',
        controls: 'bg-white/90 border-slate-200',
        button: 'bg-slate-200 hover:bg-slate-300 text-slate-700',
        buttonActive: 'bg-islamic-gold hover:bg-yellow-600 text-white',
        progress: 'bg-slate-200',
        progressFill: 'bg-islamic-gold',
        text: 'text-slate-700',
        badge: 'bg-slate-100 text-slate-600 border-slate-300'
    },
    dark: {
        container: 'bg-slate-800/80 border-slate-700',
        controls: 'bg-slate-900/90 border-slate-700',
        button: 'bg-slate-700 hover:bg-slate-600 text-slate-200',
        buttonActive: 'bg-blue-500 hover:bg-blue-600 text-white',
        progress: 'bg-slate-700',
        progressFill: 'bg-blue-500',
        text: 'text-slate-200',
        badge: 'bg-slate-700 text-slate-300 border-slate-600'
    },
    sepia: {
        container: 'bg-amber-50/80 border-amber-300',
        controls: 'bg-amber-100/90 border-amber-300',
        button: 'bg-amber-200 hover:bg-amber-300 text-amber-900',
        buttonActive: 'bg-orange-500 hover:bg-orange-600 text-white',
        progress: 'bg-amber-200',
        progressFill: 'bg-orange-500',
        text: 'text-amber-900',
        badge: 'bg-amber-100 text-amber-800 border-amber-400'
    }
};

const formatTime = (seconds) => {
    if (!seconds || !Number.isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const AyatVideoPlayer = ({ video, surahNumber, onClose }) => {
    const navigate = useNavigate();
    const { theme } = useQuranData();
    const videoRef = useRef(null);
    const progressRef = useRef(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [isRepeat, setIsRepeat] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    const styles = THEME_PLAYER_STYLES[theme] || THEME_PLAYER_STYLES.light;

    const ayahRangeText = useMemo(() => {
        if (!video) return '';
        if (video.startAyah === video.endAyah) {
            return `${surahNumber}:${video.startAyah}`;
        }
        return `${surahNumber}:${video.startAyah}-${video.endAyah}`;
    }, [video, surahNumber]);

    // Video event handlers
    const handlePlay = useCallback(() => setIsPlaying(true), []);
    const handlePause = useCallback(() => setIsPlaying(false), []);

    const handleTimeUpdate = useCallback(() => {
        const vid = videoRef.current;
        if (!vid || !vid.duration) return;

        setCurrentTime(vid.currentTime);
        setProgress((vid.currentTime / vid.duration) * 100);
    }, []);

    const handleLoadedMetadata = useCallback(() => {
        const vid = videoRef.current;
        if (vid) {
            setDuration(vid.duration);
            setIsLoading(false);
        }
    }, []);

    const handleCanPlay = useCallback(() => {
        setIsLoading(false);
    }, []);

    const handleWaiting = useCallback(() => {
        setIsLoading(true);
    }, []);

    const handleEnded = useCallback(() => {
        setIsPlaying(false);
        if (isRepeat && videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.play().catch(() => { });
        }
    }, [isRepeat]);

    const handleError = useCallback(() => {
        setHasError(true);
        setIsLoading(false);
    }, []);

    // Control handlers
    const togglePlay = useCallback(() => {
        const vid = videoRef.current;
        if (!vid) return;

        if (vid.paused) {
            vid.play().catch(() => { });
        } else {
            vid.pause();
        }
    }, []);

    const toggleRepeat = useCallback(() => {
        setIsRepeat(prev => !prev);
    }, []);

    const skipBackward = useCallback(() => {
        const vid = videoRef.current;
        if (!vid) return;
        vid.currentTime = Math.max(0, vid.currentTime - 5);
    }, []);

    const skipForward = useCallback(() => {
        const vid = videoRef.current;
        if (!vid) return;
        vid.currentTime = Math.min(vid.duration || 0, vid.currentTime + 5);
    }, []);

    const toggleMaximize = useCallback(() => {
        setIsMaximized(prev => !prev);
    }, []);

    // Escape key exits maximized mode
    useEffect(() => {
        if (!isMaximized) return;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') setIsMaximized(false);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isMaximized]);

    const handleProgressClick = useCallback((e) => {
        const vid = videoRef.current;
        const bar = progressRef.current;
        if (!vid || !bar || !vid.duration) return;

        const rect = bar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const fraction = Math.max(0, Math.min(1, clickX / rect.width));
        vid.currentTime = fraction * vid.duration;
    }, []);

    const openInLibrary = useCallback(() => {
        if (video?.id) {
            navigate(`/videos?videoId=${video.id}`);
        }
    }, [navigate, video]);

    if (!video || !video.videoUrl) {
        return null;
    }

    if (hasError) {
        return (
            <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`mt-4 rounded-xl border overflow-hidden ${styles.container}`}
            >
                <div className="p-6 text-center">
                    <p className={`${styles.text} mb-2`}>Unable to load video</p>
                    <button
                        type="button"
                        onClick={openInLibrary}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${styles.button}`}
                    >
                        <SafeIcon icon={FiExternalLink} className="text-sm" />
                        Try in Video Library
                    </button>
                </div>
            </motion.div>
        );
    }

    return (
        <>
            {/* Backdrop when maximized */}
            {isMaximized && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                    onClick={toggleMaximize}
                />
            )}
            <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: isMaximized ? 'auto' : 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className={`rounded-xl border overflow-hidden transition-all duration-300 ${
                    isMaximized
                        ? 'fixed inset-4 z-50 shadow-2xl bg-slate-900'
                        : `mt-4 ${styles.container}`
                }`}
                style={isMaximized ? { margin: 0 } : undefined}
            >
            {/* Video Container */}
            <div className="relative aspect-video bg-slate-900">
                <video
                    ref={videoRef}
                    src={video.videoUrl}
                    className="w-full h-full object-contain"
                    preload="metadata"
                    playsInline
                    onPlay={handlePlay}
                    onPause={handlePause}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onCanPlay={handleCanPlay}
                    onWaiting={handleWaiting}
                    onEnded={handleEnded}
                    onError={handleError}
                />

                {/* Loading overlay */}
                <AnimatePresence>
                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex items-center justify-center bg-slate-900/50"
                        >
                            <div className="loading-spinner" />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Close button */}
                {onClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors z-10"
                        title="Close video"
                    >
                        <SafeIcon icon={FiX} className="text-sm" />
                    </button>
                )}

                {/* Click to play overlay */}
                {!isPlaying && !isLoading && (
                    <button
                        type="button"
                        onClick={togglePlay}
                        className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors group"
                    >
                        <div className="w-16 h-16 rounded-full bg-white/90 group-hover:bg-white flex items-center justify-center shadow-lg video-button-laser large-play">
                            <SafeIcon icon={FiPlay} className="text-slate-800 text-2xl ml-1" />
                        </div>
                    </button>
                )}
            </div>

            {/* Controls */}
            <div className={`p-3 border-t ${styles.controls}`}>
                {/* Progress bar */}
                <div
                    ref={progressRef}
                    onClick={handleProgressClick}
                    className={`h-2 rounded-full cursor-pointer mb-3 ${styles.progress}`}
                >
                    <div
                        className={`h-full rounded-full transition-all duration-100 ${styles.progressFill}`}
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Control buttons */}
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        {/* Play/Pause */}
                        <button
                            type="button"
                            onClick={togglePlay}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors video-button-laser ${isPlaying ? 'active' : ''} ${styles.buttonActive}`}
                            title={isPlaying ? 'Pause' : 'Play'}
                        >
                            <SafeIcon icon={isPlaying ? FiPause : FiPlay} className="text-lg" />
                        </button>

                        {/* Skip backward */}
                        <button
                            type="button"
                            onClick={skipBackward}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${styles.button}`}
                            title="Skip back 5 seconds"
                        >
                            <SafeIcon icon={FiRotateCcw} className="text-sm" />
                        </button>

                        {/* Skip forward */}
                        <button
                            type="button"
                            onClick={skipForward}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${styles.button}`}
                            title="Skip forward 5 seconds"
                        >
                            <SafeIcon icon={FiRotateCw} className="text-sm" />
                        </button>

                        {/* Repeat */}
                        <button
                            type="button"
                            onClick={toggleRepeat}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isRepeat ? styles.buttonActive : styles.button}`}
                            title={isRepeat ? 'Repeat on' : 'Repeat off'}
                        >
                            <SafeIcon icon={FiRepeat} className="text-sm" />
                        </button>

                        {/* Time display */}
                        <span className={`text-xs font-mono ml-2 ${styles.text}`}>
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Ayah range badge */}
                        <span className={`text-xs font-medium px-2 py-1 rounded border ${styles.badge}`}>
                            {ayahRangeText}
                        </span>

                        {/* Maximize / Restore */}
                        <button
                            type="button"
                            onClick={toggleMaximize}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isMaximized ? styles.buttonActive : styles.button}`}
                            title={isMaximized ? 'Restore size' : 'Maximize'}
                        >
                            <SafeIcon icon={isMaximized ? FiMinimize2 : FiMaximize2} className="text-sm" />
                        </button>

                        {/* Open in library */}
                        <button
                            type="button"
                            onClick={openInLibrary}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${styles.button}`}
                            title="Open in Video Library"
                        >
                            <SafeIcon icon={FiExternalLink} className="text-sm" />
                        </button>
                    </div>
                </div>

                {/* Video title */}
                {video.title && (
                    <p className={`text-xs mt-2 truncate ${styles.text}`}>
                        {video.title}
                    </p>
                )}
            </div>
        </motion.div>
        </>
    );
};

export default React.memo(AyatVideoPlayer);
