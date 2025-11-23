import React from 'react';

const KaabaIcon = ({ className = 'w-5 h-5' }) => (
  <img
    src="/icons/kabbah.svg"
    alt="Makkah"
    title="Makkah"
    className={className}
  />
);

const PalmTreeIcon = ({ className = 'w-5 h-5' }) => (
  <img
    src="/icons/palmtree-madinah.svg"
    alt="Madinah"
    title="Madinah"
    className={className}
  />
);

const RevelationPlaceIcon = ({ place, className = 'w-5 h-5', showLabel = false }) => {
  const isKaaba = place?.toLowerCase() === 'makkah';
  const isPalm = place?.toLowerCase() === 'madinah';

  return (
    <div className="flex items-center space-x-2">
      {isKaaba && <KaabaIcon className={className} />}
      {isPalm && <PalmTreeIcon className={className} />}
      {showLabel && <span className="text-xs">{place}</span>}
    </div>
  );
};

export { RevelationPlaceIcon, KaabaIcon, PalmTreeIcon };
export default RevelationPlaceIcon;
