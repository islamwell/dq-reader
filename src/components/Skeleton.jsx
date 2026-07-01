import React from 'react';

// Base skeleton component
export const Skeleton = ({ className = '', width, height, circle = false }) => {
  const style = {};
  if (width) style.width = width;
  if (height) style.height = height;

  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 bg-[length:200%_100%] ${
        circle ? 'rounded-full' : 'rounded'
      } ${className}`}
      style={style}
    />
  );
};

// Ayah card skeleton
export const AyahCardSkeleton = () => {
  return (
    <div className="ayah-card rounded-xl p-6 shadow-md bg-white border border-slate-200">
      <div className="flex items-start justify-between mb-4">
        {/* Verse number circle */}
        <Skeleton circle width="40px" height="40px" />
        
        {/* Action buttons */}
        <div className="flex items-center space-x-2">
          <Skeleton circle width="40px" height="40px" />
          <Skeleton circle width="40px" height="40px" />
          <Skeleton circle width="40px" height="40px" />
        </div>
      </div>

      {/* Arabic text */}
      <div className="space-y-3 mb-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-5/6" />
        <Skeleton className="h-8 w-4/5" />
      </div>

      {/* Translation */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
};

// Surah list item skeleton
export const SurahListItemSkeleton = () => {
  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="flex items-center space-x-4 flex-1">
        {/* Surah number */}
        <Skeleton circle width="48px" height="48px" />
        
        <div className="flex-1 space-y-2">
          {/* Surah name */}
          <Skeleton className="h-5 w-40" />
          {/* Verse count */}
          <Skeleton className="h-4 w-24" />
        </div>
      </div>

      {/* Arabic name */}
      <Skeleton className="h-6 w-32" />
    </div>
  );
};

// Video card skeleton
export const VideoCardSkeleton = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Thumbnail */}
      <Skeleton className="w-full aspect-video" />
      
      <div className="p-4 space-y-3">
        {/* Title */}
        <Skeleton className="h-5 w-3/4" />
        
        {/* Surah info */}
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
};

// Search result skeleton
export const SearchResultSkeleton = () => {
  return (
    <div className="w-full bg-white rounded-xl p-6 shadow-md">
      <div className="space-y-3">
        {/* Label */}
        <Skeleton className="h-3 w-24" />
        
        {/* Title */}
        <Skeleton className="h-5 w-48" />
        
        {/* Content */}
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-5/6" />
        
        {/* Translation */}
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    </div>
  );
};

// Audio player skeleton
export const AudioPlayerSkeleton = () => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-4 border border-slate-200">
      <div className="flex items-center justify-between mb-3">
        {/* Surah info */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
        
        {/* Close button */}
        <Skeleton circle width="32px" height="32px" />
      </div>

      {/* Progress bar */}
      <Skeleton className="h-2 w-full mb-3 rounded-full" />

      {/* Controls */}
      <div className="flex items-center justify-center space-x-3">
        <Skeleton circle width="40px" height="40px" />
        <Skeleton circle width="56px" height="56px" />
        <Skeleton circle width="40px" height="40px" />
      </div>

      {/* Time */}
      <div className="flex justify-between mt-2">
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-3 w-12" />
      </div>
    </div>
  );
};

// Settings panel skeleton
export const SettingsSkeleton = () => {
  return (
    <div className="space-y-6">
      {[...Array(5)].map((_, index) => (
        <div key={index} className="space-y-3">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      ))}
    </div>
  );
};

// Header skeleton
export const HeaderSkeleton = () => {
  return (
    <div className="bg-white shadow-lg border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Skeleton className="h-8 w-32" />
          
          {/* Nav items */}
          <div className="flex items-center space-x-4">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
            <Skeleton circle width="40px" height="40px" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Full page skeleton for Surah page
export const SurahPageSkeleton = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-islamic-50 to-islamic-100">
      <HeaderSkeleton />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Surah header */}
        <div className="bg-white rounded-xl p-6 shadow-lg mb-6">
          <div className="text-center space-y-4">
            <Skeleton className="h-8 w-48 mx-auto" />
            <Skeleton className="h-6 w-64 mx-auto" />
            <div className="flex justify-center space-x-4 mt-4">
              <Skeleton className="h-10 w-32 rounded-lg" />
              <Skeleton className="h-10 w-32 rounded-lg" />
            </div>
          </div>
        </div>

        {/* Ayah cards */}
        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <AyahCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  );
};

// Home page skeleton
export const HomePageSkeleton = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-islamic-50 to-islamic-100">
      <HeaderSkeleton />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search bar */}
        <div className="mb-8">
          <Skeleton className="h-12 w-full max-w-2xl mx-auto rounded-xl" />
        </div>

        {/* Surah list */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(9)].map((_, index) => (
            <SurahListItemSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  );
};

// Videos page skeleton
export const VideosPageSkeleton = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-islamic-50 to-islamic-100">
      <HeaderSkeleton />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Video player */}
        <div className="mb-8">
          <Skeleton className="w-full aspect-video rounded-2xl" />
        </div>

        {/* Video info */}
        <div className="mb-6 space-y-3">
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-4 w-32" />
        </div>

        {/* Video grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, index) => (
            <VideoCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Skeleton;
