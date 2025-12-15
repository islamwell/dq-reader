import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as FiIcons from 'react-icons/fi';
import MuxPlayer from '@mux/mux-player-react';
import SafeIcon from '../common/SafeIcon';
import { useQuranData } from '../contexts/QuranContext';

const { FiLoader, FiRefreshCcw, FiMove } = FiIcons;

const DEFAULT_WIDTH = Math.round(260 * 1.7);
const MIN_WIDTH = 220;
const MAX_WIDTH = 820;

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
  onClose
}) => {
  const { showFloatingVideo, hideFloatingVideo, getNextVideoById } = useQuranData();
  const videoRef = useRef(null);
  const dragState = useRef({ startX: 0, startY: 0, originX: 0, originY: 0 });
  const resizeState = useRef({ startX: 0, startWidth: DEFAULT_WIDTH });
  const [cachedSrc, setCachedSrc] = useState(video.videoUrl);
  const [loopEnabled, setLoopEnabled] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [aspectRatio, setAspectRatio] = useState(16 / 9);
  const [frameSize, setFrameSize] = useState({ width: size?.width || DEFAULT_WIDTH });
  const [dragPosition, setDragPosition] = useState(() =>
    clampPosition(position || { x: 16, y: 16 }, size?.width || DEFAULT_WIDTH, aspectRatio)
  );
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

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

    setIsBuffering(true);
    setHasError(false);
    setLoopEnabled(false);
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
    element.loop = loopEnabled;
    const playPromise = element.play();

    if (playPromise?.catch) {
      playPromise.catch(() => setHasError(true));
    }
  }, [cachedSrc, loopEnabled]);

  useEffect(() => {
    const element = videoRef.current;
    if (!element) return undefined;

    const handleWaiting = () => setIsBuffering(true);
    const handlePlaying = () => setIsBuffering(false);
    const handleError = () => setHasError(true);
    const handleLoadedMetadata = () => {
      if (element.videoWidth && element.videoHeight) {
        const ratio = element.videoWidth / element.videoHeight;
        setAspectRatio(ratio);
        setDragPosition((prev) => clampPosition(prev, frameSize.width, ratio));
      }
    };

    element.addEventListener('waiting', handleWaiting);
    element.addEventListener('playing', handlePlaying);
    element.addEventListener('error', handleError);
    element.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      element.removeEventListener('waiting', handleWaiting);
      element.removeEventListener('playing', handlePlaying);
      element.removeEventListener('error', handleError);
      element.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [frameSize.width]);

  useEffect(() => {
    const widthFromProps = size?.width;
    if (widthFromProps && widthFromProps !== frameSize.width) {
      const normalized = Math.max(MIN_WIDTH, Math.min(widthFromProps, MAX_WIDTH));
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

      const deltaX = event.clientX - dragState.current.startX;
      const deltaY = event.clientY - dragState.current.startY;
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
      dragState.current = {
        startX: event.clientX,
        startY: event.clientY,
        originX: dragPosition.x,
        originY: dragPosition.y
      };
    },
    [dragPosition.x, dragPosition.y]
  );

  const handleResizeMove = useCallback(
    (event) => {
      if (!isResizing) return;

      const deltaX = event.clientX - resizeState.current.startX;
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
  }, [dragPosition, frameSize, getNextVideoById, hideFloatingVideo, showFloatingVideo, video?.id]);

  const handleResizeStart = (event) => {
    event.preventDefault();
    event.stopPropagation();
    resizeState.current = { startX: event.clientX, startWidth: frameSize.width };
    setIsResizing(true);
  };

  const computedHeight = frameSize.width / (aspectRatio || 1.7778);

  return (
    <div
      className="fixed rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden z-30"
      style={{ width: frameSize.width, height: computedHeight, left: dragPosition.x, top: dragPosition.y }}
    >
      <div className="relative h-full bg-slate-900 select-none">
        <div
          className="absolute inset-x-0 top-0 z-10 flex items-center gap-2 p-2 bg-gradient-to-b from-black/50 to-transparent text-white text-xs"
          onPointerDown={handleDragStart}
          role="presentation"
        >
          <span className="inline-flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 font-semibold">
            <SafeIcon icon={FiMove} className="text-[12px]" />
            {label}
          </span>
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={toggleLoop}
              className={`h-8 w-8 rounded-full border border-white/20 bg-white/15 hover:bg-white/25 flex items-center justify-center transition ${
                loopEnabled ? 'ring-2 ring-emerald-300/70' : ''
              }`}
              aria-pressed={loopEnabled}
              aria-label="Toggle repeat"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <SafeIcon icon={FiRefreshCcw} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-lg"
              aria-label="Close video"
              onPointerDown={(e) => e.stopPropagation()}
            >
              ×
            </button>
          </div>
        </div>
        {isBuffering && <SafeIcon icon={FiLoader} className="absolute left-2 top-12 z-10 animate-spin text-white" />}
        <MuxPlayer
          ref={videoRef}
          src={cachedSrc}
          streamType="on-demand"
          autoPlay
          playsInline
          preload="auto"
          className="w-full h-full pip-player"
          onLoadedData={() => setIsBuffering(false)}
          onEnded={handleAdvance}
          onError={handleAdvance}
          poster=""
        />
        <div className="absolute inset-x-0 bottom-0 p-2 flex items-center justify-end bg-gradient-to-t from-black/70 via-black/30 to-transparent text-white text-xs">
          {label && (
            <span className="rounded-full bg-black/55 px-2 py-1 font-semibold tracking-wide border border-white/10">{label}</span>
          )}
        </div>
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
      </div>
      {hasError && <div className="px-3 py-2 text-xs text-rose-700 bg-rose-50">Unable to play this ayah video right now.</div>}
    </div>
  );
};

export default InlineAyahVideo;
