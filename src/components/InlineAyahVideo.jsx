import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiPlay, FiPause, FiVolume2, FiVolumeX, FiLoader } = FiIcons;

const InlineAyahVideo = ({
  video,
  surahNumber,
  ayahNumber,
  position,
  onPositionChange,
  size,
  onSizeChange,
  onClose
}) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [cachedSrc, setCachedSrc] = useState(video.videoUrl);
  const [aspectRatio, setAspectRatio] = useState(16 / 9);
  const [frameSize, setFrameSize] = useState({ width: size?.width || 260 });
  const [isResizing, setIsResizing] = useState(false);
  const resizeState = useRef({ startX: 0, startWidth: 220 });
  const x = useMotionValue(position?.x ?? 16);
  const y = useMotionValue(position?.y ?? 16);

  const labelSegments = [surahNumber || video?.surahId, ayahNumber || video?.startAyah].filter(Boolean);
  const label = labelSegments.length === 2 ? `${labelSegments[0]}:${labelSegments[1]}` : labelSegments[0] || '';

  useEffect(() => {
    let isMounted = true;
    let objectUrl;

    const primeVideo = async () => {
      if (!video?.videoUrl) return;

      try {
        const response = await fetch(video.videoUrl, { cache: 'force-cache' });
        const clone = response.clone();
        const blob = await response.blob();

        if (!isMounted) return;

        objectUrl = URL.createObjectURL(blob);
        setCachedSrc(objectUrl);

        if (typeof caches !== 'undefined') {
          try {
            const cache = await caches.open('ayah-video-cache');
            await cache.put(video.videoUrl, clone);
          } catch (cacheError) {
            console.warn('Skipping cache storage', cacheError);
          }
        }
      } catch (error) {
        console.warn('Prefetch skipped', error);
        if (isMounted) {
          setCachedSrc(video.videoUrl);
        }
      }
    };

    primeVideo();

    return () => {
      isMounted = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [video]);

  useEffect(() => {
    const element = videoRef.current;
    if (!element) return;

    element.volume = 0.03;
    element.loop = true;
    const playPromise = element.play();

    if (playPromise?.catch) {
      playPromise.catch(() => setHasError(true));
    }
  }, [cachedSrc]);

  useEffect(() => {
    const element = videoRef.current;
    if (!element) return undefined;

    const handleWaiting = () => setIsBuffering(true);
    const handlePlaying = () => setIsBuffering(false);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleError = () => setHasError(true);
    const handleLoadedMetadata = () => {
      if (element.videoWidth && element.videoHeight) {
        const ratio = element.videoWidth / element.videoHeight;
        setAspectRatio(ratio);
      }
    };

    element.addEventListener('waiting', handleWaiting);
    element.addEventListener('playing', handlePlaying);
    element.addEventListener('play', handlePlay);
    element.addEventListener('pause', handlePause);
    element.addEventListener('error', handleError);
    element.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      element.removeEventListener('waiting', handleWaiting);
      element.removeEventListener('playing', handlePlaying);
      element.removeEventListener('play', handlePlay);
      element.removeEventListener('pause', handlePause);
      element.removeEventListener('error', handleError);
      element.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, []);

  useEffect(() => {
    const handlePointerMove = (event) => {
      if (!isResizing) return;

      const deltaX = event.clientX - resizeState.current.startX;
      const maxWidth = Math.min(720, Math.max(260, window.innerWidth - 48));
      const nextWidth = Math.min(maxWidth, Math.max(180, resizeState.current.startWidth + deltaX));
      setFrameSize({ width: nextWidth });
    };

    const stopResizing = () => setIsResizing(false);

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', stopResizing);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', stopResizing);
    };
  }, [isResizing]);

  const togglePlay = () => {
    const element = videoRef.current;
    if (!element) return;

    if (element.paused) {
      element.play().catch(() => setHasError(true));
    } else {
      element.pause();
    }
  };

  const toggleMute = () => {
    const element = videoRef.current;
    if (!element) return;

    const nextMuted = !element.muted;
    element.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const handleResizeStart = (event) => {
    event.preventDefault();
    event.stopPropagation();
    resizeState.current = { startX: event.clientX, startWidth: frameSize.width };
    setIsResizing(true);
  };

  useEffect(() => {
    if (typeof position?.x === 'number') {
      x.set(position.x);
    }
    if (typeof position?.y === 'number') {
      y.set(position.y);
    }
  }, [position?.x, position?.y, x, y]);

  useEffect(() => {
    if (size?.width && size.width !== frameSize.width) {
      setFrameSize({ width: size.width });
    }
  }, [frameSize.width, size?.width]);

  useEffect(() => {
    onSizeChange?.(frameSize);
  }, [frameSize, onSizeChange]);

  const handleDragEnd = () => {
    const nextPosition = { x: x.get(), y: y.get() };
    onPositionChange?.(nextPosition);
  };

  const computedHeight = frameSize.width / (aspectRatio || 1.7778);

  return (
    <motion.div
      drag={!isResizing}
      dragMomentum={false}
      dragElastic={0.12}
      onDragEnd={handleDragEnd}
      className="fixed left-0 top-0 rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden z-30 cursor-move"
      style={{ width: frameSize.width, height: computedHeight, x, y }}
    >
      <div className="relative h-full bg-slate-900">
        {isBuffering && <SafeIcon icon={FiLoader} className="absolute left-2 top-2 z-10 animate-spin text-white" />}
        {label && (
          <div className="absolute right-2 top-2 z-10 rounded-full bg-black/60 px-2 py-1 text-[11px] text-white font-semibold">
            {label}
          </div>
        )}
        <button
          type="button"
          onClick={onClose}
          className="absolute left-2 top-2 z-10 h-7 w-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/70 transition"
          aria-label="Close video"
        >
          ×
        </button>
        <video
          ref={videoRef}
          src={cachedSrc}
          className="h-full w-full object-cover"
          playsInline
          preload="auto"
          controls
          controlsList="nodownload noremoteplayback"
          muted={isMuted}
          onLoadedData={() => setIsBuffering(false)}
        >
          <track kind="captions" />
        </video>
        <div className="absolute inset-x-0 bottom-0 p-2 flex items-center justify-between bg-gradient-to-t from-black/70 via-black/30 to-transparent text-white text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={togglePlay}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition"
              aria-label={isPlaying ? 'Pause video' : 'Play video'}
            >
              <SafeIcon icon={isPlaying ? FiPause : FiPlay} />
            </button>
            <button
              type="button"
              onClick={toggleMute}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition"
              aria-label={isMuted ? 'Unmute video' : 'Mute video'}
            >
              <SafeIcon icon={isMuted ? FiVolumeX : FiVolume2} />
            </button>
          </div>
          <div className="flex items-center gap-1 text-[10px] bg-black/40 px-2 py-1 rounded-full">
            <span className="sr-only">Loop enabled at low volume</span>
            <div className="h-1.5 w-5 rounded-full bg-emerald-300/80" />
            <div className="h-1.5 w-5 rounded-full bg-amber-200/80" />
          </div>
        </div>
        <button
          type="button"
          onPointerDown={handleResizeStart}
          className={`absolute bottom-1 right-1 h-4 w-4 rounded-sm border border-white/60 bg-black/40 text-white cursor-se-resize ${
            isResizing ? 'ring-2 ring-amber-400 ring-offset-1 ring-offset-black/30' : ''
          }`}
          aria-label="Resize video"
        >
          <span className="sr-only">Resize</span>
        </button>
      </div>
      {hasError && (
        <div className="px-3 py-2 text-xs text-rose-700 bg-rose-50">Unable to play this ayah video right now.</div>
      )}
    </motion.div>
  );
};

export default InlineAyahVideo;
