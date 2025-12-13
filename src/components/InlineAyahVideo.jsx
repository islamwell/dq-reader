import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const {
  FiPlay,
  FiPause,
  FiSkipBack,
  FiSkipForward,
  FiRotateCcw,
  FiRefreshCw,
  FiRepeat,
  FiPlayCircle,
  FiMonitor,
  FiMaximize,
  FiMinimize,
  FiVolumeX,
  FiVolume2,
  FiFlag,
  FiLoader
} = FiIcons;

const formatTime = (seconds) => {
  if (Number.isNaN(seconds) || seconds === Infinity) {
    return '0:00';
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0');
  return `${minutes}:${remainingSeconds}`;
};

const InlineAyahVideo = ({ video }) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const abLoopRef = useRef({ start: null, end: null, enabled: false });

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [loopEnabled, setLoopEnabled] = useState(false);
  const [abLoop, setAbLoop] = useState({ start: null, end: null, enabled: false });
  const [isPiP, setIsPiP] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const pipSupported = useMemo(
    () => typeof document !== 'undefined' && document.pictureInPictureEnabled,
    []
  );

  useEffect(() => {
    abLoopRef.current = abLoop;
  }, [abLoop]);

  useEffect(() => {
    const element = videoRef.current;
    if (!element) return undefined;

    const handleLoadedMetadata = () => {
      setDuration(element.duration || 0);
      setIsBuffering(false);
    };

    const handleTimeUpdate = () => {
      const { enabled, start, end } = abLoopRef.current;
      if (enabled && start !== null && end !== null && element.currentTime >= end) {
        element.currentTime = start;
      }
      setCurrentTime(element.currentTime);
    };

    const handleWaiting = () => setIsBuffering(true);
    const handlePlaying = () => setIsBuffering(false);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);
    const handleError = () => setHasError(true);

    const handleEnterPiP = () => setIsPiP(true);
    const handleLeavePiP = () => setIsPiP(false);

    element.addEventListener('loadedmetadata', handleLoadedMetadata);
    element.addEventListener('timeupdate', handleTimeUpdate);
    element.addEventListener('waiting', handleWaiting);
    element.addEventListener('playing', handlePlaying);
    element.addEventListener('play', handlePlay);
    element.addEventListener('pause', handlePause);
    element.addEventListener('ended', handleEnded);
    element.addEventListener('error', handleError);
    element.addEventListener('enterpictureinpicture', handleEnterPiP);
    element.addEventListener('leavepictureinpicture', handleLeavePiP);

    return () => {
      element.removeEventListener('loadedmetadata', handleLoadedMetadata);
      element.removeEventListener('timeupdate', handleTimeUpdate);
      element.removeEventListener('waiting', handleWaiting);
      element.removeEventListener('playing', handlePlaying);
      element.removeEventListener('play', handlePlay);
      element.removeEventListener('pause', handlePause);
      element.removeEventListener('ended', handleEnded);
      element.removeEventListener('error', handleError);
      element.removeEventListener('enterpictureinpicture', handleEnterPiP);
      element.removeEventListener('leavepictureinpicture', handleLeavePiP);
    };
  }, []);

  const togglePlay = () => {
    const element = videoRef.current;
    if (!element) return;

    if (element.paused) {
      element.play().catch(() => {
        setHasError(true);
      });
    } else {
      element.pause();
    }
  };

  const toggleMute = () => {
    const element = videoRef.current;
    if (!element) return;

    element.muted = !element.muted;
    setIsMuted(element.muted);
  };

  const toggleLoop = () => {
    const element = videoRef.current;
    if (!element) return;

    const next = !loopEnabled;
    element.loop = next;
    setLoopEnabled(next);
  };

  const handleSeek = (deltaSeconds) => {
    const element = videoRef.current;
    if (!element) return;

    const nextTime = Math.max(0, Math.min((duration || element.duration || 0) - 0.1, element.currentTime + deltaSeconds));
    element.currentTime = nextTime;
  };

  const handleScrub = (event) => {
    const element = videoRef.current;
    if (!element) return;

    const value = Number(event.target.value);
    element.currentTime = value;
    setCurrentTime(value);
  };

  const handleReset = () => {
    const element = videoRef.current;
    if (!element) return;

    element.currentTime = 0;
    element.play().catch(() => setHasError(true));
  };

  const setLoopPoint = (point) => {
    const element = videoRef.current;
    if (!element) return;

    setAbLoop((prev) => {
      const next = { ...prev, [point]: element.currentTime };
      abLoopRef.current = next;
      return next;
    });
  };

  const toggleAbLoop = () => {
    const element = videoRef.current;
    if (!element) return;

    setAbLoop((prev) => {
      if (prev.start === null || prev.end === null || prev.start >= prev.end) {
        return prev;
      }

      const next = { ...prev, enabled: !prev.enabled };
      abLoopRef.current = next;

      if (next.enabled) {
        element.currentTime = next.start;
        element.play().catch(() => setHasError(true));
      }

      return next;
    });
  };

  const handleTogglePiP = async () => {
    const element = videoRef.current;
    if (!element || !pipSupported) return;

    try {
      if (!document.pictureInPictureElement) {
        await element.requestPictureInPicture();
      } else {
        await document.exitPictureInPicture();
      }
    } catch (error) {
      console.error('PiP toggle error', error);
    }
  };

  const handleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Fullscreen toggle error', error);
    }
  };

  const canLoop = abLoop.start !== null && abLoop.end !== null && abLoop.start < abLoop.end;

  return (
    <div ref={containerRef} className="mt-4 rounded-xl border border-slate-200 bg-white/80 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <div>
          <p className="text-sm font-semibold text-slate-900">{video.title || 'Ayah video'}</p>
          <p className="text-xs text-slate-500">
            Surah {video.surahNumber} · Ayahs {video.startAyah}-{video.endAyah}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          {abLoop.start !== null && (
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">A: {formatTime(abLoop.start)}</span>
          )}
          {abLoop.end !== null && (
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-indigo-700">B: {formatTime(abLoop.end)}</span>
          )}
        </div>
      </div>

      <div className="p-4">
        <div className="relative overflow-hidden rounded-lg bg-slate-900 shadow-inner">
          <div className="aspect-video">
            <video
              ref={videoRef}
              className="h-full w-full object-cover"
              playsInline
              preload="metadata"
              src={video.videoUrl}
            />
          </div>

          <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-slate-900/60 via-transparent to-slate-900/10" />

          <div className="absolute inset-x-0 bottom-0 p-4 space-y-3">
            <input
              type="range"
              min="0"
              max={duration || 0}
              step="0.1"
              value={Number.isFinite(currentTime) ? currentTime : 0}
              onChange={handleScrub}
              className="w-full accent-amber-400"
              aria-label="Seek video"
            />

            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-2 text-xs font-medium">
                <span className="rounded-full bg-black/50 px-2 py-1">{formatTime(currentTime)}</span>
                <span className="text-white/70">/</span>
                <span className="rounded-full bg-black/30 px-2 py-1">{formatTime(duration)}</span>
                {loopEnabled && (
                  <span className="ml-2 rounded-full bg-amber-400/20 px-2 py-1 text-amber-100">Repeat</span>
                )}
                {abLoop.enabled && (
                  <span className="ml-2 rounded-full bg-emerald-400/20 px-2 py-1 text-emerald-50">A-B</span>
                )}
              </div>

              {isBuffering && (
                <div className="flex items-center gap-2 rounded-full bg-black/40 px-3 py-1 text-xs">
                  <SafeIcon icon={FiLoader} className="animate-spin" />
                  <span>Buffering…</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={togglePlay}
                className="flex items-center gap-2 rounded-full bg-amber-400 px-4 py-2 text-slate-900 shadow transition hover:bg-amber-300"
                aria-label={isPlaying ? 'Pause video' : 'Play video'}
              >
                <SafeIcon icon={isPlaying ? FiPause : FiPlay} />
                <span className="text-sm font-semibold">{isPlaying ? 'Pause' : 'Play'}</span>
              </button>

              <div className="flex items-center gap-1 rounded-full bg-black/30 px-2 py-1 text-white backdrop-blur">
                <button
                  type="button"
                  onClick={() => handleSeek(-10)}
                  className="rounded-full px-3 py-2 text-sm transition hover:bg-white/10"
                  aria-label="Seek backward 10 seconds"
                >
                  <SafeIcon icon={FiSkipBack} />
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded-full px-3 py-2 text-sm transition hover:bg-white/10"
                  aria-label="Restart video"
                >
                  <SafeIcon icon={FiRotateCcw} />
                </button>
                <button
                  type="button"
                  onClick={() => handleSeek(10)}
                  className="rounded-full px-3 py-2 text-sm transition hover:bg-white/10"
                  aria-label="Seek forward 10 seconds"
                >
                  <SafeIcon icon={FiSkipForward} />
                </button>
              </div>

              <div className="flex items-center gap-1 rounded-full bg-black/30 px-2 py-1 text-white backdrop-blur">
                <button
                  type="button"
                  onClick={toggleLoop}
                  className={`rounded-full px-3 py-2 text-sm transition hover:bg-white/10 ${loopEnabled ? 'bg-amber-400/30 text-amber-100' : ''}`}
                  aria-pressed={loopEnabled}
                  aria-label="Toggle repeat"
                >
                  <SafeIcon icon={FiRepeat} />
                </button>
                <button
                  type="button"
                  onClick={() => setLoopPoint('start')}
                  className="rounded-full px-3 py-2 text-sm transition hover:bg-white/10"
                  aria-label="Set point A"
                >
                  <SafeIcon icon={FiFlag} />
                  <span className="ml-1 text-xs">A</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLoopPoint('end')}
                  className="rounded-full px-3 py-2 text-sm transition hover:bg-white/10"
                  aria-label="Set point B"
                >
                  <SafeIcon icon={FiFlag} />
                  <span className="ml-1 text-xs">B</span>
                </button>
                <button
                  type="button"
                  onClick={toggleAbLoop}
                  disabled={!canLoop}
                  className={`rounded-full px-3 py-2 text-sm transition hover:bg-white/10 ${abLoop.enabled ? 'bg-emerald-400/20 text-emerald-50' : ''} ${!canLoop ? 'cursor-not-allowed opacity-40' : ''}`}
                  aria-pressed={abLoop.enabled}
                  aria-label="Toggle A-B loop"
                >
                  <SafeIcon icon={FiRefreshCw} />
                </button>
              </div>

              <div className="flex items-center gap-1 rounded-full bg-black/30 px-2 py-1 text-white backdrop-blur">
                <button
                  type="button"
                  onClick={toggleMute}
                  className="rounded-full px-3 py-2 text-sm transition hover:bg-white/10"
                  aria-label={isMuted ? 'Unmute video' : 'Mute video'}
                >
                  <SafeIcon icon={isMuted ? FiVolumeX : FiVolume2} />
                </button>
                {pipSupported && (
                  <button
                    type="button"
                    onClick={handleTogglePiP}
                    className={`rounded-full px-3 py-2 text-sm transition hover:bg-white/10 ${isPiP ? 'bg-white/10 text-amber-100' : ''}`}
                    aria-label="Toggle Picture in Picture"
                  >
                    <SafeIcon icon={FiMonitor} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleFullscreen}
                  className={`rounded-full px-3 py-2 text-sm transition hover:bg-white/10 ${isFullscreen ? 'bg-white/10 text-amber-100' : ''}`}
                  aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                >
                  <SafeIcon icon={isFullscreen ? FiMinimize : FiMaximize} />
                </button>
              </div>

              {hasError && (
                <div className="flex items-center gap-2 rounded-full bg-rose-100 px-3 py-2 text-rose-800">
                  <SafeIcon icon={FiPlayCircle} />
                  <span className="text-sm">Playback issue. Try reloading or open in the video library.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InlineAyahVideo;
