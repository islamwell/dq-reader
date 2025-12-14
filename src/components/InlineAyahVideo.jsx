import React, { useEffect, useRef, useState } from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiPlay, FiPause, FiVolume2, FiVolumeX, FiLoader } = FiIcons;

const InlineAyahVideo = ({ video }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [cachedSrc, setCachedSrc] = useState(video.videoUrl);

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

    element.addEventListener('waiting', handleWaiting);
    element.addEventListener('playing', handlePlaying);
    element.addEventListener('play', handlePlay);
    element.addEventListener('pause', handlePause);
    element.addEventListener('error', handleError);

    return () => {
      element.removeEventListener('waiting', handleWaiting);
      element.removeEventListener('playing', handlePlaying);
      element.removeEventListener('play', handlePlay);
      element.removeEventListener('pause', handlePause);
      element.removeEventListener('error', handleError);
    };
  }, []);

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

  return (
    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 w-52 rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden z-20">
      <div className="bg-slate-900 text-white text-xs px-3 py-2 flex items-center justify-between">
        <span className="font-semibold truncate">Picture-in-Picture</span>
        {isBuffering && <SafeIcon icon={FiLoader} className="animate-spin" />}
      </div>
      <div className="relative aspect-video bg-slate-900">
        <video
          ref={videoRef}
          src={cachedSrc}
          className="absolute inset-0 h-full w-full object-cover"
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
          <span className="px-2 py-1 rounded-full bg-black/40 text-[10px]">Looping · 3% vol</span>
        </div>
      </div>
      {hasError && (
        <div className="px-3 py-2 text-xs text-rose-700 bg-rose-50">Unable to play this ayah video right now.</div>
      )}
    </div>
  );
};

export default InlineAyahVideo;
