import React from 'react';
import InlineAyahVideo from './InlineAyahVideo';
import { useQuranData } from '../contexts/QuranContext';

const FloatingVideoViewport = () => {
  const {
    floatingVideo,
    hideFloatingVideo,
    updateFloatingVideoPosition,
    updateFloatingVideoSize
  } = useQuranData();

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
      onPositionChange={updateFloatingVideoPosition}
      onSizeChange={updateFloatingVideoSize}
      onClose={hideFloatingVideo}
    />
  );
};

export default FloatingVideoViewport;
