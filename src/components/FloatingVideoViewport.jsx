import React from 'react';
import InlineAyahVideo from './InlineAyahVideo';
import { useQuranData } from '../contexts/QuranContext';

const FloatingVideoViewport = () => {
  const {
    floatingVideo,
    hideFloatingVideo,
    updateFloatingVideoPosition,
    updateFloatingVideoSize,
    isDocPipActive
  } = useQuranData();

  // Don't show the in-page player when Document PiP window is open
  if (isDocPipActive) {
    return null;
  }

  if (!floatingVideo?.video) {
    return null;
  }

  return (
    <InlineAyahVideo
      video={floatingVideo.video}
      surahNumber={floatingVideo.surahNumber}
      ayahNumber={floatingVideo.ayahNumber}
      position={floatingVideo.position}
      size={floatingVideo.size}
      autoMaximize={floatingVideo.autoMaximize}
      onPositionChange={updateFloatingVideoPosition}
      onSizeChange={updateFloatingVideoSize}
      onClose={hideFloatingVideo}
    />
  );
};

export default FloatingVideoViewport;
