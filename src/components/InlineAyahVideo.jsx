import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as FiIcons from 'react-icons/fi';
import MuxPlayer from '@mux/mux-player-react';
import SafeIcon from '../common/SafeIcon';
import { useQuranData } from '../contexts/QuranContext';

const { FiLoader, FiRefreshCcw, FiMove, FiMaximize2, FiMinimize2, FiRotateCw, FiX, FiPlay } = FiIcons;

const DEFAULT_WIDTH = Math.round(260 * 1.7);
const MIN_WIDTH = 220;
const MAX_WIDTH = 820;

// On mobile, clamp default width so the player doesn't overflow
const getMobileClampedWidth = (width) => {
  if (typeof window === 'undefined') return width;
  return Math.min(width, window.innerWidth - 32);
};

const clampPosition = (position = {}, width = DEFAULT_WIDTH, aspectRatio = 16 / 9) => {
  if (typeof window === 'undefined') {
    return { x: position.x ?? 16, y: position.y ?? 16 };
  }

  const height = width / (aspectRatio || 16 / 9);
  const margin = 12;
  const maxX = Math.max(margin, window.innerWidth - width - margin);
  const maxY = Math.max(margin, window.innerHeight - height - margin);

  return {
    x: Math.max(margin, Math.min(position.x ?? margin, maxX)),
    y: Math.max(margin, Math.min(position.y ?? margin, maxY))
  };
};

const InlineAyahVideo = ({
  video,
  surahNumber,
  ayahNumber,
  position,
  onPositionChange,
  size,
  onSizeChange,
  onClose,
  autoMaximize
}) => {
  const {
    showFloatingVideo,
    hideFloatingVideo,
    getNextVideoById,
    saveVideoTimestamp,
    getVideoTimestamp,
    clearVideoTimestamp
  } = useQuranData();
  const videoRef = useRef(null);
  const dragState = useRef({ startX: 0, startY: 0, originX: 0, originY: 0 });
  const resizeState = useRef({ startX: 0, startWidth: DEFAULT_WIDTH });
  const [loopEnabled, setLoopEnabled] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [aspectRatio, setAspectRatio] = useState(16 / 9);
  const [frameSize, setFrameSize] = useState({
    width: getMobileClampedWidth(size?.width || DEFAULT_WIDTH)
  });
  const [dragPosition, setDragPosition] = useState(() =>
    clampPosition(position || { x: 16, y: 16 }, getMobileClampedWidth(size?.width || DEFAULT_WIDTH), aspectRatio)
  );
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isMaximized, setIsMaximized] = useState(!!autoMaximize);
  const [isLandscape, setIsLandscape] = useState(false);
  // Store the pre-maximize size/position so we can restore them
  const preMaxStateRef = useRef({ position: null, size: null });
  const timestampSaveInterval = useRef(null);

  const isPlayingRef = useRef(false);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  const labelSegments = [surahNumber || video?.surahId, ayahNumber || video?.startAyah].filter(Boolean);
  const label = labelSegments.length === 2 ? `${labelSegments[0]}:${labelSegments[1]}` : labelSegments[0] || '';

  // --- Resume: restore timestamp when video loads ---
  useEffect(() => {
    setIsBuffering(true);
    setIsPlaying(false);
    setHasError(false);
    setLoopEnabled(false);
    isPlayingRef.current = false;
    setIsMaximized(!!autoMaximize);
    setIsLandscape(false);
  }, [video, autoMaximize]);

  // --- Resume: save timestamp periodically ---
  useEffect(() => {
    timestampSaveInterval.current = setInterval(() => {
      const el = videoRef.current;
      if (el && video?.id && isPlayingRef.current) {
        saveVideoTimestamp(video.id, el.currentTime);
      }
    }, 2000);

    return () => clearInterval(timestampSaveInterval.current);
  }, [video?.id, saveVideoTimestamp]);

  // --- Resume: seek to saved position on load ---
  const handleLoadedData = useCallback(() => {
    setIsBuffering(false);
    if (video?.id) {
      const savedTime = getVideoTimestamp(video.id);
      const el = videoRef.current;
      if (savedTime > 0 && el) {
        el.currentTime = savedTime;
      }
    }
  }, [video?.id, getVideoTimestamp]);

  // --- Media Session API for background audio (Android/desktop) ---
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: video?.title || `Ayah ${label}`,
      artist: 'NurulQuran',
      album: `Surah ${surahNumber || video?.surahId || ''}`
    });

    navigator.mediaSession.setActionHandler('play', () => {
      videoRef.current?.play().catch(() => {});
    });
    navigator.mediaSession.setActionHandler('pause', () => {
      videoRef.current?.pause();
    });
    navigator.mediaSession.setActionHandler('stop', () => {
      if (typeof onClose === 'function') onClose();
    });

    return () => {
      try {
        navigator.mediaSession.setActionHandler('play', null);
        navigator.mediaSession.setActionHandler('pause', null);
        navigator.mediaSession.setActionHandler('stop', null);
      } catch (_) { /* ignore */ }
    };
  }, [video, label, surahNumber, onClose]);

  // --- PiP when browser minimized (Video PiP API) ---
  useEffect(() => {
    const handleVisibilityChange = () => {
      const el = videoRef.current;
      if (!el || !document.pictureInPictureEnabled) return;

      if (document.hidden && isPlayingRef.current) {
        // Browser minimized/tab switched — enter PiP
        el.requestPictureInPicture?.().catch(() => {});
      } else if (!document.hidden && document.pictureInPictureElement === el) {
        // Returned to tab — exit PiP
        document.exitPictureInPicture?.().catch(() => {});
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useEffect(() => {
    const element = videoRef.current;
    if (!element) return;

    element.volume = 0.03;
    element.loop = loopEnabled;
  }, [loopEnabled]);

  useEffect(() => {
    const element = videoRef.current;
    if (!element) return undefined;

    const handleLoadedMetadata = () => {
      if (element.videoWidth && element.videoHeight) {
        const ratio = element.videoWidth / element.videoHeight;
        setAspectRatio(ratio);
        setDragPosition((prev) => clampPosition(prev, frameSize.width, ratio));
      }
    };

    element.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      element.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [frameSize.width]);

  useEffect(() => {
    const widthFromProps = size?.width;
    if (widthFromProps && widthFromProps !== frameSize.width) {
      const normalized = Math.max(MIN_WIDTH, Math.min(getMobileClampedWidth(widthFromProps), MAX_WIDTH));
      setFrameSize({ width: normalized });
      setDragPosition((prev) => clampPosition(prev, normalized, aspectRatio));
    }
  }, [size?.width, aspectRatio]);

  useEffect(() => {
    if (typeof position?.x === 'number' || typeof position?.y === 'number') {
      setDragPosition((prev) =>
        clampPosition(
          {
            x: typeof position.x === 'number' ? position.x : prev.x,
            y: typeof position.y === 'number' ? position.y : prev.y
          },
          frameSize.width,
          aspectRatio
        )
      );
    }
  }, [position?.x, position?.y, frameSize.width, aspectRatio]);

  const handleDragMove = useCallback(
    (event) => {
      if (!isDragging) return;

      const clientX = event.touches ? event.touches[0].clientX : event.clientX;
      const clientY = event.touches ? event.touches[0].clientY : event.clientY;
      const deltaX = clientX - dragState.current.startX;
      const deltaY = clientY - dragState.current.startY;
      const nextPosition = clampPosition(
        {
          x: dragState.current.originX + deltaX,
          y: dragState.current.originY + deltaY
        },
        frameSize.width,
        aspectRatio
      );
      setDragPosition(nextPosition);
    },
    [aspectRatio, frameSize.width, isDragging]
  );

  const handleDragStart = useCallback(
    (event) => {
      if (event.button === 2) return;
      event.preventDefault();
      setIsDragging(true);
      const clientX = event.touches ? event.touches[0].clientX : event.clientX;
      const clientY = event.touches ? event.touches[0].clientY : event.clientY;
      dragState.current = {
        startX: clientX,
        startY: clientY,
        originX: dragPosition.x,
        originY: dragPosition.y
      };
    },
    [dragPosition.x, dragPosition.y]
  );

  const handleResizeMove = useCallback(
    (event) => {
      if (!isResizing) return;

      const clientX = event.touches ? event.touches[0].clientX : event.clientX;
      const deltaX = clientX - resizeState.current.startX;
      const unclampedWidth = resizeState.current.startWidth + deltaX;
      const maxAllowed = Math.min(MAX_WIDTH, window.innerWidth - 32);
      const nextWidth = Math.max(MIN_WIDTH, Math.min(unclampedWidth, maxAllowed));

      setFrameSize({ width: nextWidth });
      setDragPosition((prev) => clampPosition(prev, nextWidth, aspectRatio));
    },
    [aspectRatio, isResizing]
  );

  const stopInteractions = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      onPositionChange?.(dragPosition);
    }
    if (isResizing) {
      setIsResizing(false);
      onSizeChange?.(frameSize);
      onPositionChange?.(dragPosition);
    }
  }, [dragPosition, frameSize, isDragging, isResizing, onPositionChange, onSizeChange]);

  useEffect(() => {
    if (!isDragging && !isResizing) return undefined;

    window.addEventListener('pointermove', handleDragMove);
    window.addEventListener('pointermove', handleResizeMove);
    window.addEventListener('pointerup', stopInteractions);

    return () => {
      window.removeEventListener('pointermove', handleDragMove);
      window.removeEventListener('pointermove', handleResizeMove);
      window.removeEventListener('pointerup', stopInteractions);
    };
  }, [handleDragMove, handleResizeMove, isDragging, isResizing, stopInteractions]);

  useEffect(() => {
    setDragPosition((prev) => clampPosition(prev, frameSize.width, aspectRatio));
  }, [aspectRatio, frameSize.width]);

  useEffect(() => {
    const handleWindowResize = () => {
      setDragPosition((prev) => clampPosition(prev, frameSize.width, aspectRatio));
    };

    window.addEventListener('resize', handleWindowResize);
    return () => window.removeEventListener('resize', handleWindowResize);
  }, [aspectRatio, frameSize.width]);

  const toggleLoop = useCallback(() => {
    setLoopEnabled((prev) => {
      const next = !prev;
      if (videoRef.current) {
        videoRef.current.loop = next;
      }
      return next;
    });
  }, []);

  const handleAdvance = useCallback(() => {
    if (!video?.id) return;

    // Clear timestamp for finished video
    clearVideoTimestamp(video.id);

    const nextVideo = getNextVideoById?.(video.id);
    if (nextVideo?.videoUrl) {
      showFloatingVideo({
        video: nextVideo,
        surahNumber: nextVideo.surahId,
        ayahNumber: nextVideo.startAyah,
        position: dragPosition,
        size: frameSize
      });
    } else {
      hideFloatingVideo();
    }
  }, [clearVideoTimestamp, dragPosition, frameSize, getNextVideoById, hideFloatingVideo, showFloatingVideo, video?.id]);

  const handleResizeStart = (event) => {
    if (isMaximized) return; // no manual resize when maximized
    event.preventDefault();
    event.stopPropagation();
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    resizeState.current = { startX: clientX, startWidth: frameSize.width };
    setIsResizing(true);
  };

  const toggleMaximize = useCallback(() => {
    setIsLandscape(false); // exit landscape when toggling maximize
    setIsMaximized((prev) => {
      if (!prev) {
        // Save current state before maximizing
        preMaxStateRef.current = {
          position: { ...dragPosition },
          size: { ...frameSize }
        };
      } else {
        // Restore previous state
        const saved = preMaxStateRef.current;
        if (saved.position) setDragPosition(saved.position);
        if (saved.size) setFrameSize(saved.size);
      }
      return !prev;
    });
  }, [dragPosition, frameSize]);

  const toggleLandscape = useCallback(() => {
    setIsLandscape((prev) => !prev);
  }, []);

  const handleClose = useCallback(() => {
    // Save current position before closing
    const el = videoRef.current;
    if (el && video?.id) {
      saveVideoTimestamp(video.id, el.currentTime);
    }
    if (typeof onClose === 'function') onClose();
  }, [onClose, saveVideoTimestamp, video?.id]);

  // Escape key exits maximized/landscape mode
  useEffect(() => {
    if (!isMaximized && !isLandscape) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isLandscape) {
          setIsLandscape(false);
        } else {
          toggleMaximize();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMaximized, isLandscape, toggleMaximize]);

  const computedHeight = isMaximized
    ? undefined
    : frameSize.width / (aspectRatio || 1.7778);

  const containerStyle = isMaximized
    ? { inset: 16 }
    : { width: frameSize.width, height: computedHeight, left: dragPosition.x, top: dragPosition.y };

  // Landscape rotation: swap width/height and rotate 90deg
  const landscapeStyle = isLandscape
    ? {
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        width: '100vh',
        height: '100vw',
        transform: 'rotate(90deg)',
        transformOrigin: 'top left',
        left: '100vw',
        top: 0
      }
    : {};

  const btnClass =
    'h-10 w-10 rounded-full border border-white/20 bg-white/15 hover:bg-white/25 flex items-center justify-center transition text-sm';

  return (
    <>
      {/* Backdrop when maximized or landscape */}
      {(isMaximized || isLandscape) && (
        <div
          className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm"
          onClick={isLandscape ? toggleLandscape : toggleMaximize}
        />
      )}
      <div
        className={`fixed rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden ${
          isMaximized ? 'z-30 inset-4' : isLandscape ? 'z-50' : 'z-30'
        }`}
        style={isLandscape ? landscapeStyle : containerStyle}
      >
        <div className="relative h-full bg-slate-900 select-none">
          {/* Top control bar */}
          <div
            className="absolute inset-x-0 top-0 z-10 flex items-center gap-2 p-2 bg-gradient-to-b from-black/60 to-transparent text-white text-xs"
            onPointerDown={isMaximized || isLandscape ? undefined : handleDragStart}
            role="presentation"
          >
            <span className="inline-flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 font-semibold">
              {!isMaximized && !isLandscape && <SafeIcon icon={FiMove} className="text-[12px]" />}
              {label}
            </span>
            <div className="ml-auto flex items-center gap-3">
              {/* Loop */}
              <button
                type="button"
                onClick={toggleLoop}
                className={`${btnClass} ${loopEnabled ? 'ring-2 ring-emerald-300/70 bg-emerald-500/40' : ''}`}
                aria-pressed={loopEnabled}
                aria-label="Toggle repeat"
                onPointerDown={(e) => e.stopPropagation()}
              >
                <SafeIcon icon={FiRefreshCcw} />
              </button>
              {/* Landscape toggle (mobile only) */}
              {isMobile && (
                <button
                  type="button"
                  onClick={toggleLandscape}
                  className={`${btnClass} ${isLandscape ? 'ring-2 ring-blue-300/70 bg-blue-500/40' : ''}`}
                  aria-label={isLandscape ? 'Portrait mode' : 'Landscape mode'}
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <SafeIcon icon={FiRotateCw} />
                </button>
              )}
              {/* Maximize / Restore */}
              <button
                type="button"
                onClick={toggleMaximize}
                className={`${btnClass} ${
                  isMaximized
                    ? 'bg-amber-500/80 hover:bg-amber-400/90 ring-2 ring-amber-300/50'
                    : ''
                }`}
                aria-label={isMaximized ? 'Restore size' : 'Maximize'}
                onPointerDown={(e) => e.stopPropagation()}
              >
                <SafeIcon icon={isMaximized ? FiMinimize2 : FiMaximize2} />
              </button>
              {/* Close — prominent red button */}
              <button
                type="button"
                onClick={handleClose}
                className="h-10 w-10 rounded-full bg-red-600/80 hover:bg-red-500 border border-red-400/40 flex items-center justify-center transition text-white text-base font-bold shadow-lg"
                aria-label="Close video"
                onPointerDown={(e) => e.stopPropagation()}
              >
                <SafeIcon icon={FiX} />
              </button>
            </div>
          </div>
          {isBuffering && <SafeIcon icon={FiLoader} className="absolute left-2 top-14 z-10 animate-spin text-white" />}
          <MuxPlayer
            ref={videoRef}
            key={video.videoUrl}
            src={video.videoUrl}
            streamType="on-demand"
            autoPlay
            playsInline
            preload="auto"
            className="w-full h-full pip-player"
            onLoadedData={handleLoadedData}
            onLoadedMetadata={(e) => {
              const el = e.target;
              if (el?.videoWidth && el?.videoHeight) {
                const ratio = el.videoWidth / el.videoHeight;
                setAspectRatio(ratio);
                setDragPosition((prev) => clampPosition(prev, frameSize.width, ratio));
              }
            }}
            onWaiting={() => setIsBuffering(true)}
            onPlaying={() => { isPlayingRef.current = true; setIsPlaying(true); setIsBuffering(false); }}
            onPause={() => { isPlayingRef.current = false; setIsPlaying(false); }}
            onEnded={handleAdvance}
            onError={handleAdvance}
            poster=""
          />
          {!isPlaying && !isBuffering && (
            <button
              type="button"
              onClick={() => videoRef.current?.play().catch(() => {})}
              className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors z-20 shadow-lg border border-white/20 backdrop-blur-sm"
              aria-label="Play video"
            >
              <SafeIcon icon={FiPlay} className="text-white text-3xl ml-1" />
            </button>
          )}
          <div className="absolute inset-x-0 bottom-0 p-2 flex items-center justify-end bg-gradient-to-t from-black/70 via-black/30 to-transparent text-white text-xs pointer-events-none">
            {label && (
              <span className="rounded-full bg-black/55 px-2 py-1 font-semibold tracking-wide border border-white/10 pointer-events-auto">{label}</span>
            )}
          </div>
          {!isMaximized && !isLandscape && (
            <button
              type="button"
              onPointerDown={handleResizeStart}
              className={`absolute bottom-1 right-1 h-5 w-5 rounded-sm border border-white/60 bg-black/40 text-white cursor-se-resize ${
                isResizing ? 'ring-2 ring-amber-400 ring-offset-1 ring-offset-black/30' : ''
              }`}
              aria-label="Resize video"
            >
              <span className="sr-only">Resize</span>
            </button>
          )}
        </div>
        {hasError && <div className="px-3 py-2 text-xs text-rose-700 bg-rose-50">Unable to play this ayah video right now.</div>}
      </div>
    </>
  );
};

export default InlineAyahVideo;
