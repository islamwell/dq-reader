import React, { useEffect, useRef } from 'react';
import { useQuranData } from '../contexts/QuranContext';

/**
 * PiPVideoManager
 *
 * Renders a persistent, hidden <video> element and registers it with the
 * QuranContext via `registerPiPVideoElement`.  AyahCard's click-handler can
 * then obtain a reference to this element, set its `src`, and call
 * `requestPictureInPicture()` synchronously — inside the user-gesture call
 * stack — which is the only way browsers allow PiP to be activated.
 *
 * This component also listens for `leavepictureinpicture` and `ended`
 * events so the floating-video state in the context is kept in sync.
 */
const PiPVideoManager = () => {
  const {
    floatingVideo,
    hideFloatingVideo,
    showFloatingVideo,
    getNextVideoById,
    registerPiPVideoElement,
    unregisterPiPVideoElement
  } = useQuranData();

  const videoRef = useRef(null);

  // Register / unregister the hidden video element with the context
  useEffect(() => {
    const el = videoRef.current;
    if (el && registerPiPVideoElement) {
      registerPiPVideoElement(el);
    }
    return () => {
      if (unregisterPiPVideoElement) {
        unregisterPiPVideoElement();
      }
    };
  }, [registerPiPVideoElement, unregisterPiPVideoElement]);

  // Handle leavepictureinpicture / ended / error events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLeavePiP = () => {
      // User closed the PiP overlay — clean up context state
      hideFloatingVideo();
    };

    const handleEnded = () => {
      const currentId = floatingVideo?.video?.id;
      if (!currentId) {
        if (document.pictureInPictureElement === video) {
          document.exitPictureInPicture().catch(() => {});
        }
        hideFloatingVideo();
        return;
      }

      const nextVideo = getNextVideoById?.(currentId);
      if (nextVideo?.videoUrl) {
        // Advance: set next source and keep PiP open
        video.src = nextVideo.videoUrl;
        video.load();
        video.play().catch(() => {});

        showFloatingVideo({
          video: nextVideo,
          surahNumber: nextVideo.surahId,
          ayahNumber: nextVideo.startAyah,
          position: floatingVideo?.position,
          size: floatingVideo?.size
        });
      } else {
        if (document.pictureInPictureElement === video) {
          document.exitPictureInPicture().catch(() => {});
        }
        hideFloatingVideo();
      }
    };

    const handleError = () => {
      console.warn('PiP video playback error — advancing');
      handleEnded();
    };

    video.addEventListener('leavepictureinpicture', handleLeavePiP);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('leavepictureinpicture', handleLeavePiP);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
    };
  }, [floatingVideo, hideFloatingVideo, showFloatingVideo, getNextVideoById]);

  // Sync source when floatingVideo changes (e.g. from context updates that
  // didn't originate from the AyahCard click, such as auto-advance)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const url = floatingVideo?.video?.videoUrl;
    if (!url) {
      // No video — clean up
      if (document.pictureInPictureElement === video) {
        document.exitPictureInPicture().catch(() => {});
      }
      video.pause();
      video.removeAttribute('src');
      video.load();
      return;
    }

    // If the source changed (e.g. auto-advance set a new URL), update it.
    // PiP stays open when you change the source of the same video element.
    if (video.src !== url && !video.src.endsWith(url)) {
      video.src = url;
      video.load();
      video.play().catch(() => {});
    }
  }, [floatingVideo?.video?.videoUrl]);

  return (
    <video
      ref={videoRef}
      playsInline
      preload="auto"
      style={{
        position: 'fixed',
        top: -9999,
        left: -9999,
        width: 1,
        height: 1,
        opacity: 0,
        pointerEvents: 'none',
        zIndex: -1
      }}
    />
  );
};

export default PiPVideoManager;
