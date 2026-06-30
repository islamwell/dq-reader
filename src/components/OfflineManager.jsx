import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import toast from 'react-hot-toast';

const { FiDownload, FiCheck, FiX, FiWifi, FiWifiOff } = FiIcons;

const OfflineManager = ({ surahNumber, surahName }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Back online');
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error('You are offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check if surah is already downloaded
    checkIfDownloaded();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [surahNumber]);

  const checkIfDownloaded = async () => {
    if (!('caches' in window)) return;

    try {
      const cache = await caches.open('dq-reader-v1-dynamic');
      const keys = await cache.keys();
      
      // Check if surah data is cached
      const hasSurah = keys.some(request => 
        request.url.includes(`/surah/${surahNumber}`) ||
        request.url.includes(`surah_${surahNumber}`)
      );
      
      setIsDownloaded(hasSurah);
    } catch (error) {
      console.error('Failed to check download status:', error);
    }
  };

  const downloadForOffline = async () => {
    if (!('caches' in window)) {
      toast.error('Offline download not supported in this browser');
      return;
    }

    setIsDownloading(true);
    setDownloadProgress(0);

    try {
      const cache = await caches.open('dq-reader-v1-dynamic');
      
      // Resources to download
      const resources = [
        `/api/surah/${surahNumber}`,
        `/api/surah/${surahNumber}/translation`,
        `/api/surah/${surahNumber}/audio`
      ];

      let completed = 0;

      for (const url of resources) {
        try {
          const response = await fetch(url);
          if (response.ok) {
            await cache.put(url, response);
          }
          completed++;
          setDownloadProgress((completed / resources.length) * 100);
        } catch (err) {
          console.warn(`Failed to cache ${url}:`, err);
        }
      }

      setIsDownloaded(true);
      setIsDownloading(false);
      toast.success(`${surahName} downloaded for offline use`);
    } catch (error) {
      console.error('Download failed:', error);
      setIsDownloading(false);
      toast.error('Failed to download for offline use');
    }
  };

  const removeOfflineData = async () => {
    if (!('caches' in window)) return;

    try {
      const cache = await caches.open('dq-reader-v1-dynamic');
      const keys = await cache.keys();
      
      // Remove surah-related requests
      const toDelete = keys.filter(request => 
        request.url.includes(`/surah/${surahNumber}`) ||
        request.url.includes(`surah_${surahNumber}`)
      );

      await Promise.all(toDelete.map(request => cache.delete(request)));
      
      setIsDownloaded(false);
      toast.success(`${surahName} removed from offline storage`);
    } catch (error) {
      console.error('Failed to remove offline data:', error);
      toast.error('Failed to remove offline data');
    }
  };

  return (
    <div className="flex items-center gap-3">
      {/* Online/Offline indicator */}
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
        isOnline 
          ? 'bg-green-100 text-green-700' 
          : 'bg-red-100 text-red-700'
      }`}>
        <SafeIcon icon={isOnline ? FiWifi : FiWifiOff} className="text-base" />
        <span className="hidden sm:inline">{isOnline ? 'Online' : 'Offline'}</span>
      </div>

      {/* Download button */}
      <AnimatePresence mode="wait">
        {isDownloading ? (
          <motion.div
            key="downloading"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg"
          >
            <div className="w-4 h-4 border-2 border-blue-700 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium">{Math.round(downloadProgress)}%</span>
          </motion.div>
        ) : isDownloaded ? (
          <motion.button
            key="downloaded"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            type="button"
            onClick={removeOfflineData}
            className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition-colors"
            title="Remove from offline storage"
          >
            <SafeIcon icon={FiCheck} className="text-base" />
            <span className="text-sm font-medium hidden sm:inline">Downloaded</span>
            <SafeIcon icon={FiX} className="text-xs" />
          </motion.button>
        ) : (
          <motion.button
            key="download"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            type="button"
            onClick={downloadForOffline}
            disabled={!isOnline}
            className="flex items-center gap-2 px-4 py-2 bg-islamic-gold hover:bg-yellow-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Download for offline use"
          >
            <SafeIcon icon={FiDownload} className="text-base" />
            <span className="text-sm font-medium hidden sm:inline">Download</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OfflineManager;
