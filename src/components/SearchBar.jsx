import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useQuranData } from '../contexts/QuranContext';
import { getJuzStart, getSurahInfo } from '../data/quran-data.js';
import { highlightMatches, parseJuzQuery } from '../utils/fuzzySearch';

const {
  FiSearch,
  FiX,
  FiArrowRight,
  FiList,
  FiBookmark,
  FiChevronsRight,
  FiArrowUpCircle
} = FiIcons;

const RECENT_SEARCHES_KEY = 'quran_recent_searches';
const MAX_RECENT_SEARCHES = 5;
const TOTAL_SURAHS = 114;
const TOTAL_JUZS = 30;
const ARTICLE_PREFIXES = new Set([
  'al',
  'an',
  'ar',
  'as',
  'ash',
  'az',
  'ad',
  'at'
]);

const truncateArabicWords = (text, maxWords = 6) => {
  if (!text) {
    return '';
  }
  const words = text.replace(/\s+/g, ' ').trim().split(' ').filter(Boolean);
  if (words.length <= maxWords) {
    return words.join(' ');
  }
  return `${words.slice(0, maxWords).join(' ')} …`;
};

const THEME_HUD_STYLES = {
  green: {
    card: 'bg-emerald-950/98 border-emerald-600/40 text-emerald-50 shadow-2xl shadow-emerald-950/90',
    arabicColor: '#a7f3d0',
    arabicText: '!text-emerald-200',
    arabicShadow: '0 2px 10px rgba(0,0,0,0.85)',
    number: 'text-amber-400',
    totalText: 'text-emerald-300/80',
    trackBg: 'bg-emerald-900/60',
    trackFill: 'bg-gradient-to-r from-emerald-400 to-amber-400',
    snippetText: 'text-emerald-100/90'
  },
  red: {
    card: 'bg-rose-950/98 border-rose-600/40 text-rose-50 shadow-2xl shadow-rose-950/90',
    arabicColor: '#fecdd3',
    arabicText: '!text-rose-200',
    arabicShadow: '0 2px 10px rgba(0,0,0,0.85)',
    number: 'text-amber-400',
    totalText: 'text-rose-300/80',
    trackBg: 'bg-rose-900/60',
    trackFill: 'bg-gradient-to-r from-rose-400 to-amber-400',
    snippetText: 'text-rose-100/90'
  },
  blue: {
    card: 'bg-slate-950/98 border-blue-600/40 text-blue-50 shadow-2xl shadow-blue-950/90',
    arabicColor: '#bae6fd',
    arabicText: '!text-sky-200',
    arabicShadow: '0 2px 10px rgba(0,0,0,0.85)',
    number: 'text-amber-400',
    totalText: 'text-blue-300/80',
    trackBg: 'bg-blue-950/60',
    trackFill: 'bg-gradient-to-r from-sky-400 to-amber-400',
    snippetText: 'text-blue-100/90'
  },
  light: {
    card: 'bg-slate-900/98 border-slate-700/80 text-white shadow-2xl shadow-slate-950/90',
    arabicColor: '#fde68a',
    arabicText: '!text-amber-300',
    arabicShadow: '0 2px 10px rgba(0,0,0,0.85)',
    number: 'text-amber-400',
    totalText: 'text-slate-300/80',
    trackBg: 'bg-white/20',
    trackFill: 'bg-gradient-to-r from-amber-400 to-emerald-400',
    snippetText: 'text-slate-200'
  },
  dark: {
    card: 'bg-slate-950/98 border-slate-700/80 text-white shadow-2xl shadow-black/95',
    arabicColor: '#fde68a',
    arabicText: '!text-amber-300',
    arabicShadow: '0 2px 12px rgba(0,0,0,0.95)',
    number: 'text-amber-400',
    totalText: 'text-slate-400',
    trackBg: 'bg-white/20',
    trackFill: 'bg-gradient-to-r from-amber-400 to-emerald-400',
    snippetText: 'text-slate-200'
  },
  sepia: {
    card: 'bg-amber-950/98 border-amber-700/50 text-amber-50 shadow-2xl shadow-amber-950/90',
    arabicColor: '#fde68a',
    arabicText: '!text-amber-200',
    arabicShadow: '0 2px 10px rgba(0,0,0,0.85)',
    number: 'text-amber-400',
    totalText: 'text-amber-300/80',
    trackBg: 'bg-amber-900/60',
    trackFill: 'bg-gradient-to-r from-amber-300 to-yellow-400',
    snippetText: 'text-amber-100/90'
  }
};

const stripLeadingArticle = (name) => {
  if (!name) {
    return '';
  }

  const parts = name.split('-');
  if (parts.length <= 1) {
    return name;
  }

  const [possiblePrefix, ...rest] = parts;
  const normalized = possiblePrefix.toLowerCase();

  if (normalized.length >= 2 && normalized.length <= 3 && ARTICLE_PREFIXES.has(normalized)) {
    const remainder = rest.join('-');
    return remainder || name;
  }

  return name;
};

const saveRecentSearch = (searchTerm) => {
  if (!searchTerm.trim()) return;

  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    const recentSearches = stored ? JSON.parse(stored) : [];

    // Remove duplicate if exists
    const filtered = recentSearches.filter(term => term !== searchTerm);

    // Add to beginning and limit to MAX_RECENT_SEARCHES
    const updated = [searchTerm, ...filtered].slice(0, MAX_RECENT_SEARCHES);

    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save recent search:', error);
  }
};

const getRecentSearches = () => {
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to get recent searches:', error);
    return [];
  }
};

const SearchBar = ({ variant = 'global' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { searchQuran, surahs, theme } = useQuranData();
  const isNavVariant = variant === 'nav';
  const hudStyles = THEME_HUD_STYLES[theme] || THEME_HUD_STYLES.green;

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(isNavVariant);
  const [recentSearches, setRecentSearches] = useState([]);
  const [visibleAyah, setVisibleAyah] = useState(1);
  const [visibleSurah, setVisibleSurah] = useState(1);
  const [homeScrubMode, setHomeScrubMode] = useState('surah');
  const [isScrolledDown, setIsScrolledDown] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [hudVisible, setHudVisible] = useState(false);
  const [scrubAyah, setScrubAyah] = useState(1);
  const [scrubOffsetY, setScrubOffsetY] = useState(0);
  const [scrubArabic, setScrubArabic] = useState('');
  const [scrubSnippet, setScrubSnippet] = useState('');
  const inputRef = useRef(null);
  const scrubStateRef = useRef({
    active: false,
    dragging: false,
    pointerId: null,
    startY: 0,
    startX: 0,
    mode: 'surah',
    lastAyah: 1,
    rafId: null,
    fadeTimer: null
  });
  const suppressClickRef = useRef(false);

  const hasQuery = query.trim().length > 0;
  const isExpanded = isNavVariant || isOpen || hasQuery || isFocused;
  const isHomePage = location.pathname === '/';

  const currentSurahNumber = useMemo(() => {
    const match = location.pathname.match(/^\/surah\/(\d+)/);
    if (!match) {
      return null;
    }

    const parsed = Number(match[1]);
    return Number.isFinite(parsed) ? parsed : null;
  }, [location.pathname]);

  const currentSurah = useMemo(() => {
    if (!Array.isArray(surahs) || !currentSurahNumber) {
      return null;
    }

    return surahs.find((item) => item.id === currentSurahNumber) || null;
  }, [currentSurahNumber, surahs]);

  const currentAyahFromQuery = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const ayahValue = Number(params.get('ayah'));
    return Number.isInteger(ayahValue) && ayahValue > 0 ? ayahValue : null;
  }, [location.search]);

  const nextSurahNumber = useMemo(() => {
    if (!currentSurahNumber) {
      return 1;
    }

    return currentSurahNumber >= TOTAL_SURAHS ? 1 : currentSurahNumber + 1;
  }, [currentSurahNumber]);

  const nextSurah = useMemo(() => {
    if (!Array.isArray(surahs)) {
      return null;
    }

    return surahs.find((item) => item.id === nextSurahNumber) || null;
  }, [nextSurahNumber, surahs]);

  const nextSurahLabel = useMemo(() => {
    if (!nextSurah) {
      return 'Next';
    }

    const stripped = stripLeadingArticle(nextSurah.name_simple);
    const safeName = stripped || nextSurah.name_simple || '';
    return `${nextSurah.id} ${safeName}`.trim();
  }, [nextSurah]);

  const currentSurahReference = useMemo(() => {
    if (!currentSurah) {
      return null;
    }

    const reference = currentAyahFromQuery
      ? `${currentSurah.id}:${currentAyahFromQuery}`
      : `${currentSurah.id}`;

    return {
      english: currentSurah.name_simple,
      arabic: currentSurah.name_arabic,
      reference
    };
  }, [currentAyahFromQuery, currentSurah]);

  useEffect(() => {
    // Load recent searches on mount
    setRecentSearches(getRecentSearches());
  }, []);

  useEffect(() => {
    setIsFocused(false);
    setVisibleAyah(currentAyahFromQuery || 1);
    setVisibleSurah(1);
    setScrubAyah(currentAyahFromQuery || 1);
    setScrubArabic('');
    setScrubSnippet('');
    setIsScrolledDown(false);
    setIsScrubbing(false);
    setHudVisible(false);
    setScrubOffsetY(0);
    if (!isNavVariant) {
      setIsOpen(false);
      setQuery('');
      setResults([]);
    }
  }, [location.pathname, location.search, isNavVariant, currentAyahFromQuery]);

  // Track currently visible ayah (Surah page) or surah (Main page) while scrolling
  useEffect(() => {
    if ((!currentSurahNumber && !isHomePage) || isNavVariant) {
      return undefined;
    }

    let ticking = false;
    const selector = currentSurahNumber ? '[data-ayah]' : '[data-surah]';
    const attrName = currentSurahNumber ? 'data-ayah' : 'data-surah';

    const updateVisibleItemFromScroll = () => {
      ticking = false;
      if (scrubStateRef.current.dragging) {
        return;
      }

      const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
      setIsScrolledDown(scrollTop > 140);

      const nodes = document.querySelectorAll(selector);
      if (!nodes.length) {
        return;
      }

      const readingLineY = window.innerHeight * 0.32;
      let closestId = 1;
      let smallestDistance = Infinity;

      for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[i];
        const rect = node.getBoundingClientRect();
        if (rect.top <= readingLineY && rect.bottom >= readingLineY) {
          const parsed = Number(node.getAttribute(attrName));
          if (Number.isInteger(parsed) && parsed > 0) {
            closestId = parsed;
            break;
          }
        }

        const distance = Math.abs(rect.top - readingLineY);
        if (distance < smallestDistance) {
          smallestDistance = distance;
          const parsed = Number(node.getAttribute(attrName));
          if (Number.isInteger(parsed) && parsed > 0) {
            closestId = parsed;
          }
        }
      }

      if (currentSurahNumber) {
        setVisibleAyah(closestId);
      } else {
        setVisibleSurah(closestId);
      }
    };

    const handleScroll = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(updateVisibleItemFromScroll);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    updateVisibleItemFromScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [currentSurahNumber, isHomePage, isNavVariant]);

  // Cleanup any pending scrub timers/frames on unmount
  useEffect(() => {
    const scrubState = scrubStateRef.current;
    return () => {
      if (scrubState.rafId) {
        window.cancelAnimationFrame(scrubState.rafId);
      }
      if (scrubState.fadeTimer) {
        window.clearTimeout(scrubState.fadeTimer);
      }
    };
  }, []);

  useEffect(() => {
    let isCancelled = false;

    if (!searchQuran) {
      return undefined;
    }

    if (!query.trim()) {
      setResults([]);
      setIsLoading(false);
      return undefined;
    }

    setIsLoading(true);

    const juzQuery = parseJuzQuery(query);
    const delay = juzQuery ? 0 : 160;

    const timeoutId = window.setTimeout(async () => {
      try {
        const matches = await searchQuran(query, currentSurahNumber);
        if (!isCancelled) {
          setResults(Array.isArray(matches) ? matches : []);
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('Search error:', error);
          setResults([]);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }, delay);

    return () => {
      isCancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [query, searchQuran]);

  const handleSelect = useCallback(
    (result) => {
      if (!result) {
        return;
      }

      // Save the search term to recent searches
      if (query.trim()) {
        saveRecentSearch(query.trim());
        setRecentSearches(getRecentSearches());
      }

      if (result.type === 'ayah' || result.type === 'juz') {
        navigate(`/surah/${result.surahNumber}?ayah=${result.ayahNumber}`);
      } else if (result.type === 'surah') {
        navigate(`/surah/${result.surahNumber}`);
      }

      setQuery('');
      setResults([]);
      setIsFocused(false);
      setIsOpen(isNavVariant);
    },
    [isNavVariant, navigate, query]
  );

  const handleClear = useCallback(() => {
    setQuery('');
    setResults([]);
    setIsFocused(false);
    setIsOpen(isNavVariant);
    window.requestAnimationFrame(() => {
      if (inputRef.current) {
        inputRef.current.blur();
      }
    });
  }, [isNavVariant]);

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === 'Escape') {
        handleClear();
        event.currentTarget.blur();
        return;
      }

      if (event.key === 'Enter') {
        const juzQuery = parseJuzQuery(query);
        if (juzQuery?.isExactJuzQuery) {
          const juzStart = getJuzStart(juzQuery.juzNumber);
          if (juzStart) {
            event.preventDefault();
            handleSelect({
              type: 'juz',
              id: `juz-${juzStart.juzNumber}`,
              juzNumber: juzStart.juzNumber,
              surahNumber: juzStart.surahNumber,
              ayahNumber: juzStart.ayahNumber
            });
            return;
          }
        }

        if (results.length) {
          event.preventDefault();
          handleSelect(results[0]);
        }
      }
    },
    [handleClear, handleSelect, query, results]
  );

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    setIsOpen(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    if (isNavVariant) {
      return;
    }

    if (query.trim()) {
      return;
    }

    window.setTimeout(() => {
      setIsOpen(false);
    }, 120);
  }, [isNavVariant, query]);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    window.requestAnimationFrame(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    });
  }, []);

  const handleRecentSearchClick = useCallback((term) => {
    setQuery(term);
    window.requestAnimationFrame(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    });
  }, []);

  const closeSearchPanel = useCallback(() => {
    setQuery('');
    setResults([]);
    setIsFocused(false);
    setIsOpen(isNavVariant);
  }, [isNavVariant]);

  // Listen for global keyboard shortcut ('/' or Ctrl/Cmd+K) to open search, and Esc to close it
  useEffect(() => {
    if (isNavVariant) {
      return undefined;
    }

    const handleOpenSearchEvent = () => {
      handleOpen();
    };

    const handleSearchEscape = (event) => {
      if (event.key === 'Escape' && isExpanded) {
        event.preventDefault();
        closeSearchPanel();
      }
    };

    window.addEventListener('nq:open-search', handleOpenSearchEvent);
    window.addEventListener('keydown', handleSearchEscape);
    return () => {
      window.removeEventListener('nq:open-search', handleOpenSearchEvent);
      window.removeEventListener('keydown', handleSearchEscape);
    };
  }, [closeSearchPanel, handleOpen, isExpanded, isNavVariant]);

  const handleNextSurah = useCallback(() => {
    navigate(`/surah/${nextSurahNumber}`);
    closeSearchPanel();
  }, [closeSearchPanel, navigate, nextSurahNumber]);

  const handleScrollToTop = useCallback(() => {
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    closeSearchPanel();
  }, [closeSearchPanel]);

  const handleViewBookmarks = useCallback(() => {
    navigate('/bookmarks');
    closeSearchPanel();
  }, [closeSearchPanel, navigate]);

  const totalAyahsInCurrentSurah = currentSurah?.verses_count || 0;
  const isSurahScrubContext = Boolean(!isNavVariant && currentSurah && totalAyahsInCurrentSurah > 1);
  const isHomeScrubContext = Boolean(!isNavVariant && isHomePage);
  const isScrubEnabled = isSurahScrubContext || isHomeScrubContext;

  const extractAyahData = useCallback((ayahNumber) => {
    const ayahNode = document.querySelector(`[data-ayah="${ayahNumber}"]`);
    if (!ayahNode) {
      return { arabic: '', translation: '' };
    }

    // Extract Arabic words from .quran-text-pak and keep only the first few words
    const arabicEl = ayahNode.querySelector('.quran-text-pak');
    let arabic = '';
    if (arabicEl) {
      arabic = truncateArabicWords(arabicEl.textContent || '', 6);
    }

    // Extract translation snippet
    const paragraphs = ayahNode.querySelectorAll('p');
    let translation = '';
    for (let i = paragraphs.length - 1; i >= 0; i -= 1) {
      const text = paragraphs[i]?.textContent?.trim();
      if (text && text.length > 3) {
        translation = text.length > 90 ? `${text.slice(0, 90)}…` : text;
        break;
      }
    }

    return { arabic, translation };
  }, []);

  const extractHomeScrubData = useCallback(
    (mode, targetNumber) => {
      if (mode === 'juz') {
        const juzEntry = getJuzStart(targetNumber);
        if (!juzEntry) {
          return { arabic: '', translation: '' };
        }
        const surahInfo =
          getSurahInfo(juzEntry.surahNumber) ||
          (Array.isArray(surahs) ? surahs.find((item) => item.id === juzEntry.surahNumber) : null);
        const arabic = truncateArabicWords(
          juzEntry.arabicPreview || surahInfo?.name_arabic || '',
          6
        );
        const surahLabel = surahInfo?.name_simple || `Surah ${juzEntry.surahNumber}`;
        const translation = juzEntry.translationPreview
          ? `Juz ${juzEntry.juzNumber} • ${surahLabel} (${juzEntry.surahNumber}:${juzEntry.ayahNumber}) — ${juzEntry.translationPreview}`
          : `Juz ${juzEntry.juzNumber} • ${surahLabel} (${juzEntry.surahNumber}:${juzEntry.ayahNumber})`;
        return { arabic, translation };
      }

      const surahInfo =
        getSurahInfo(targetNumber) ||
        (Array.isArray(surahs) ? surahs.find((item) => item.id === targetNumber) : null);
      if (!surahInfo) {
        return { arabic: '', translation: '' };
      }
      const arabic = truncateArabicWords(
        surahInfo.arabicPreview || surahInfo.name_arabic || '',
        6
      );
      const meaning = surahInfo.translated_name?.name ? ` (${surahInfo.translated_name.name})` : '';
      const translation = surahInfo.translationPreview
        ? `${surahInfo.name_simple}${meaning} — ${surahInfo.translationPreview}`
        : `${surahInfo.name_simple}${meaning}`;
      return { arabic, translation };
    },
    [surahs]
  );

  const handleCirclePointerDown = useCallback(
    (event) => {
      if (!isScrubEnabled) {
        return;
      }
      if (event.pointerType === 'mouse' && event.button !== 0) {
        return;
      }

      const scrubState = scrubStateRef.current;
      if (scrubState.fadeTimer) {
        window.clearTimeout(scrubState.fadeTimer);
        scrubState.fadeTimer = null;
      }

      scrubState.active = true;
      scrubState.dragging = false;
      scrubState.pointerId = event.pointerId;
      scrubState.startY = event.clientY;
      scrubState.startX = Number.isFinite(event.clientX) ? event.clientX : 0;
      scrubState.mode = 'surah';

      if (isHomeScrubContext) {
        setHomeScrubMode('surah');
        const initialTarget = visibleSurah || 1;
        scrubState.lastAyah = initialTarget;
        setScrubAyah(initialTarget);
        const initialData = extractHomeScrubData('surah', initialTarget);
        setScrubArabic(initialData.arabic);
        setScrubSnippet(initialData.translation);
      } else {
        const initialTarget = visibleAyah || 1;
        scrubState.lastAyah = initialTarget;
        setScrubAyah(initialTarget);
        const initialData = extractAyahData(initialTarget);
        setScrubArabic(initialData.arabic);
        setScrubSnippet(initialData.translation);
      }

      try {
        event.currentTarget.setPointerCapture?.(event.pointerId);
      } catch {
        // Ignore pointer capture errors in synthetic test environments
      }
    },
    [extractAyahData, extractHomeScrubData, homeScrubMode, isHomeScrubContext, isScrubEnabled, visibleAyah, visibleSurah]
  );

  const handleCirclePointerMove = useCallback(
    (event) => {
      const scrubState = scrubStateRef.current;
      if (!scrubState.active || !isScrubEnabled) {
        return;
      }

      const deltaY = event.clientY - scrubState.startY;
      if (!scrubState.dragging && Math.abs(deltaY) < 8) {
        return;
      }

      if (!scrubState.dragging) {
        scrubState.dragging = true;
        setIsScrubbing(true);
        setHudVisible(true);
      }

      if (isHomeScrubContext && Number.isFinite(event.clientX)) {
        const deltaX = event.clientX - scrubState.startX;
        if (deltaX > 36 && scrubState.mode !== 'juz') {
          scrubState.mode = 'juz';
          scrubState.lastAyah = -1;
          setHomeScrubMode('juz');
        } else if (deltaX < 16 && scrubState.mode !== 'surah') {
          scrubState.mode = 'surah';
          scrubState.lastAyah = -1;
          setHomeScrubMode('surah');
        }
      }

      const activeMode = scrubState.mode;
      const maxItems = isHomeScrubContext
        ? activeMode === 'juz'
          ? TOTAL_JUZS
          : TOTAL_SURAHS
        : totalAyahsInCurrentSurah;

      const trackTop = 24;
      const trackBottom = Math.max(trackTop + 140, window.innerHeight - 108);
      const clampedY = Math.min(trackBottom, Math.max(trackTop, event.clientY));
      const progress = (clampedY - trackTop) / (trackBottom - trackTop);
      const targetItem = Math.max(
        1,
        Math.min(maxItems, Math.round(1 + progress * (maxItems - 1)))
      );

      setScrubOffsetY(clampedY - trackTop);
      setScrubAyah(targetItem);

      if (targetItem !== scrubState.lastAyah) {
        scrubState.lastAyah = targetItem;

        if (isHomeScrubContext) {
          if (activeMode === 'surah') {
            setVisibleSurah(targetItem);
          }
          const homeData = extractHomeScrubData(activeMode, targetItem);
          setScrubArabic(homeData.arabic);
          setScrubSnippet(homeData.translation);
        } else {
          setVisibleAyah(targetItem);
          const ayahData = extractAyahData(targetItem);
          setScrubArabic(ayahData.arabic);
          setScrubSnippet(ayahData.translation);
        }

        if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
          try {
            navigator.vibrate(4);
          } catch {
            // Ignore vibration permission errors
          }
        }

        if (scrubState.rafId) {
          window.cancelAnimationFrame(scrubState.rafId);
        }
        scrubState.rafId = window.requestAnimationFrame(() => {
          if (isHomeScrubContext) {
            const surahToScroll =
              activeMode === 'juz'
                ? getJuzStart(targetItem)?.surahNumber
                : targetItem;
            const surahEl = surahToScroll
              ? document.querySelector(`[data-surah="${surahToScroll}"]`)
              : null;
            if (surahEl && typeof surahEl.scrollIntoView === 'function') {
              surahEl.scrollIntoView({ behavior: 'auto', block: 'center' });
            }
          } else {
            const ayahEl = document.querySelector(`[data-ayah="${targetItem}"]`);
            if (ayahEl && typeof ayahEl.scrollIntoView === 'function') {
              ayahEl.scrollIntoView({ behavior: 'auto', block: 'center' });
            }
          }
        });
      }
    },
    [extractAyahData, extractHomeScrubData, isHomeScrubContext, isScrubEnabled, totalAyahsInCurrentSurah]
  );

  const finishScrubGesture = useCallback(
    (event) => {
      const scrubState = scrubStateRef.current;
      if (!scrubState.active) {
        return;
      }

      try {
        if (scrubState.pointerId !== null) {
          event.currentTarget.releasePointerCapture?.(scrubState.pointerId);
        }
      } catch {
        // Ignore release errors
      }

      const wasDragging = scrubState.dragging;
      const finalTarget = scrubState.lastAyah;
      const finalMode = scrubState.mode;

      scrubState.active = false;
      scrubState.dragging = false;
      scrubState.pointerId = null;

      if (wasDragging) {
        suppressClickRef.current = true;
        setIsScrubbing(false);
        setScrubOffsetY(0);

        if (isHomeScrubContext) {
          if (finalMode === 'juz') {
            const juzStart = getJuzStart(finalTarget);
            if (juzStart) {
              navigate(`/surah/${juzStart.surahNumber}?ayah=${juzStart.ayahNumber}`);
            }
          } else if (finalTarget >= 1 && finalTarget <= TOTAL_SURAHS) {
            navigate(`/surah/${finalTarget}`);
          }
        } else {
          const ayahEl = document.querySelector(`[data-ayah="${finalTarget}"]`);
          if (ayahEl) {
            if (typeof ayahEl.scrollIntoView === 'function') {
              ayahEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            ayahEl.classList.add('ring-2', 'ring-emerald-400', 'ring-offset-2', 'transition-all');
            window.setTimeout(() => {
              ayahEl.classList.remove('ring-2', 'ring-emerald-400', 'ring-offset-2');
            }, 2000);
          }
        }

        scrubState.fadeTimer = window.setTimeout(() => {
          setHudVisible(false);
          if (isHomeScrubContext) {
            setHomeScrubMode('surah');
          }
        }, 420);
      }
    },
    [isHomeScrubContext, navigate]
  );

  const handleCircleClick = useCallback(
    (event) => {
      if (suppressClickRef.current) {
        suppressClickRef.current = false;
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      handleOpen();
    },
    [handleOpen]
  );

  const showResults = isExpanded && hasQuery && (isFocused || isLoading || results.length > 0);
  const showRecentSearches = isExpanded && !hasQuery && isFocused && recentSearches.length > 0;

  const placeholderText = useMemo(
    () => 'Rahman 22, 15:20, Juz 4, "our Lord", كدأب',
    []
  );

  const scrubbedSurahName = useMemo(() => {
    const info =
      getSurahInfo(scrubAyah) ||
      (Array.isArray(surahs) ? surahs.find((item) => item.id === scrubAyah) : null);
    return info?.name_simple || `Surah ${scrubAyah}`;
  }, [scrubAyah, surahs]);

  if (!searchQuran) {
    return null;
  }

  const containerClasses = isNavVariant
    ? 'relative w-full max-w-xl pointer-events-auto'
    : 'fixed top-6 left-1/2 z-50 w-full -translate-x-1/2 px-4 pointer-events-none';

  const outerWrapperClasses = isNavVariant
    ? 'pointer-events-auto w-full'
    : 'pointer-events-none flex w-full justify-center';

  const innerWidthClasses = isNavVariant
    ? 'pointer-events-auto w-full transition-all duration-300'
    : 'pointer-events-auto w-full md:w-1/2 max-w-2xl transition-all duration-300';

  const cardClasses = isNavVariant
    ? 'bg-white border border-slate-200 shadow-2xl rounded-2xl px-4 py-2'
    : 'bg-white border border-slate-200 shadow-2xl rounded-2xl px-5 py-4';

  const inputWrapperClasses = isNavVariant
    ? `flex items-center gap-3 rounded-xl bg-white border border-slate-200 px-4 py-1.5 transition-all duration-200 ${isFocused ? 'ring-2 ring-islamic-gold shadow-lg' : 'shadow-sm'
    }`
    : `flex items-center gap-3 rounded-xl bg-white border border-slate-200 px-4 py-2 transition-all duration-200 ${isFocused ? 'ring-2 ring-islamic-gold shadow-lg' : 'shadow-sm'
    }`;

  const resultsWrapperClasses = isNavVariant
    ? 'absolute left-1/2 top-full z-50 mt-3 w-[min(36rem,90vw)] -translate-x-1/2'
    : 'mt-3 w-full';

  const scrubTotalItems = isHomeScrubContext
    ? homeScrubMode === 'juz'
      ? TOTAL_JUZS
      : TOTAL_SURAHS
    : totalAyahsInCurrentSurah;

  const scrubProgressPercent =
    scrubTotalItems > 1
      ? Math.round(((scrubAyah - 1) / (scrubTotalItems - 1)) * 100)
      : 100;

  return (
    <>
      <div className={containerClasses}>
        <div className={outerWrapperClasses}>
          {!isNavVariant && !isExpanded ? (
            <div className="pointer-events-auto inline-flex items-center gap-2">
              <button
                type="button"
                onClick={handleCircleClick}
                onPointerDown={handleCirclePointerDown}
                onPointerMove={handleCirclePointerMove}
                onPointerUp={finishScrubGesture}
                onPointerCancel={finishScrubGesture}
                style={{
                  touchAction: isScrubEnabled ? 'none' : 'auto',
                  translate: `0px ${scrubOffsetY}px`,
                  scale: isScrubbing ? '1.12' : '1'
                }}
                className={`inline-flex items-center justify-center gap-1.5 rounded-full border bg-white text-blue-500 shadow-[0_18px_38px_-18px_rgba(59,130,246,0.6)] p-3 select-none hover:bg-blue-50 hover:text-blue-600 hover:shadow-[0_26px_55px_-18px_rgba(37,99,235,0.65)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 ${
                  isScrubbing
                    ? 'border-amber-400 ring-4 ring-amber-400/30 cursor-grabbing transition-transform duration-0'
                    : 'border-blue-100 transition-all duration-200'
                } ${isScrubEnabled && (isScrolledDown || isScrubbing) ? 'px-3.5 py-2.5' : 'p-3'}`}
                aria-label={
                  isHomeScrubContext
                    ? 'Open search or drag to scrub surahs and juz'
                    : isSurahScrubContext
                    ? 'Open search or drag to scrub ayahs'
                    : 'Open search'
                }
                title={
                  isHomeScrubContext
                    ? 'Tap to search • Drag down to scrub Surahs or Juz'
                    : isSurahScrubContext
                    ? 'Tap to search • Drag up/down to scrub ayahs'
                    : 'Open search'
                }
              >
                <SafeIcon icon={FiSearch} className="text-xl flex-shrink-0" />
                {isScrubEnabled && (isScrolledDown || isScrubbing) && (
                  <span
                    data-testid="live-ayah-badge"
                    className="text-xs font-bold tabular-nums tracking-tight text-slate-700"
                  >
                    {isHomeScrubContext
                      ? isScrubbing
                        ? homeScrubMode === 'juz'
                          ? `Juz ${scrubAyah}/${TOTAL_JUZS}`
                          : `${scrubAyah}/${TOTAL_SURAHS}`
                        : `S ${visibleSurah}/${TOTAL_SURAHS}`
                      : isScrubbing
                      ? `${scrubAyah}/${totalAyahsInCurrentSurah}`
                      : `${currentSurah.id}:${visibleAyah}`}
                  </span>
                )}
              </button>
            </div>
          ) : (
          <div className={innerWidthClasses}>
            <div className={cardClasses}>
              <div className={inputWrapperClasses}>
                <SafeIcon icon={FiSearch} className="text-slate-500 text-lg" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  placeholder={placeholderText}
                  className={`flex-1 bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none ${isNavVariant ? 'text-sm md:text-base py-1' : 'text-sm md:text-base'
                    }`}
                  aria-label="Search Quran"
                />
                {hasQuery && (
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={handleClear}
                    className="text-slate-400 hover:text-slate-600"
                    aria-label="Clear search"
                  >
                    <SafeIcon icon={FiX} className="text-lg" />
                  </button>
                )}
              </div>
              {!isNavVariant && (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <div className="flex flex-1 justify-start">
                    <button
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={handleNextSurah}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-islamic-gold px-3 py-1.5 text-xs font-semibold text-white shadow-[0_14px_32px_-18px_rgba(202,138,4,0.55)] hover:bg-amber-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
                      aria-label={nextSurah ? `Go to ${nextSurah.name_simple}` : 'Go to next surah'}
                    >
                      <SafeIcon icon={FiChevronsRight} className="text-sm" />
                      <span>{nextSurahLabel}</span>
                    </button>
                  </div>
                  <div className="flex flex-1 justify-center">
                    <button
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={handleScrollToTop}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white shadow-[0_18px_38px_-18px_rgba(5,150,105,0.65)] hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
                      aria-label="Scroll to top"
                    >
                      <SafeIcon icon={FiArrowUpCircle} className="text-sm" />
                      <span>Top</span>
                    </button>
                  </div>
                  <div className="flex flex-1 justify-end">
                    <button
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={handleViewBookmarks}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white shadow-[0_18px_38px_-18px_rgba(59,130,246,0.6)] hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                      aria-label="View bookmarks"
                    >
                      <SafeIcon icon={FiBookmark} className="text-sm" />
                      <span>Bookmarks</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {showRecentSearches && (
              <div className={`${resultsWrapperClasses} bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden`}>
                <div className="px-5 py-3 border-b border-slate-100">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold flex items-center gap-2">
                      <SafeIcon icon={FiList} className="text-sm" />
                      Recent Searches
                    </p>
                    {currentSurahReference && (
                      <div className="flex flex-wrap items-center justify-end gap-2 text-xs font-medium text-slate-500 text-right">
                        <span>{currentSurahReference.english}</span>
                        <span className="text-slate-400">{currentSurahReference.arabic}</span>
                        <span>{currentSurahReference.reference}</span>
                      </div>
                    )}
                  </div>
                </div>
                <ul className="divide-y divide-slate-100">
                  {recentSearches.map((term, index) => (
                    <li key={index}>
                      <button
                        type="button"
                        onMouseDown={(event) => {
                          event.preventDefault();
                          handleRecentSearchClick(term);
                        }}
                        onClick={() => handleRecentSearchClick(term)}
                        className="w-full text-left px-5 py-3 hover:bg-islamic-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-islamic-gold flex items-center justify-between gap-4"
                      >
                        <span className="text-sm text-slate-700">{term}</span>
                        <SafeIcon icon={FiSearch} className="text-slate-400 text-sm" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {showResults && (
              <div className={`${resultsWrapperClasses} bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col max-h-96 overflow-hidden`}>
                {isLoading ? (
                  <div className="px-6 py-8 text-center text-sm text-slate-500">Searching…</div>
                ) : (
                  <>
                    <ul className="divide-y divide-slate-100 overflow-y-auto flex-1">
                      {results.slice(0, 3).map((result) => (
                        <li key={result.id}>
                          <button
                            type="button"
                            onMouseDown={(event) => {
                              event.preventDefault();
                              handleSelect(result);
                            }}
                            onClick={() => handleSelect(result)}
                            className="w-full text-left px-5 py-4 hover:bg-islamic-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-islamic-gold"
                          >
                            {result.type === 'ayah' || result.type === 'juz' ? (
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <p
                                    className={`text-xs uppercase tracking-wide font-semibold mb-1 ${
                                      result.type === 'juz' ? 'text-emerald-700' : 'text-islamic-gold'
                                    }`}
                                  >
                                    {result.type === 'juz'
                                      ? `Juz ${result.juzNumber} • Starts at ${result.surahNumber}:${result.ayahNumber}`
                                      : `Ayah • ${result.surahNumber}:${result.ayahNumber}`}
                                  </p>
                                  <p className="text-sm font-semibold text-slate-900">
                                    {result.surahName}
                                    {result.surahEnglishName ? ` • ${result.surahEnglishName}` : ''}
                                  </p>
                                  {result.snippet && (
                                    <p className="mt-1 text-base text-slate-700 quran-text-pak leading-relaxed">
                                      {highlightMatches(result.snippet, query).map((seg, i) =>
                                        seg.highlighted
                                          ? <mark key={i} className="bg-amber-200 text-amber-900 rounded px-0.5">{seg.text}</mark>
                                          : <span key={i}>{seg.text}</span>
                                      )}
                                    </p>
                                  )}
                                  {result.translationSnippet && (
                                    <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                                      {highlightMatches(result.translationSnippet, query).map((seg, i) =>
                                        seg.highlighted
                                          ? <mark key={i} className="bg-amber-200 text-amber-900 rounded px-0.5">{seg.text}</mark>
                                          : <span key={i}>{seg.text}</span>
                                      )}
                                    </p>
                                  )}
                                </div>
                                <SafeIcon icon={FiArrowRight} className="text-slate-400 mt-1" />
                              </div>
                            ) : (
                              <div className="flex items-center justify-between gap-4">
                                <div>
                                  <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-1">
                                    Surah • {result.surahNumber}
                                  </p>
                                  <p className="text-sm font-semibold text-slate-900">
                                    {highlightMatches(result.name, query).map((seg, i) =>
                                      seg.highlighted
                                        ? <mark key={i} className="bg-amber-200 text-amber-900 rounded px-0.5">{seg.text}</mark>
                                        : <span key={i}>{seg.text}</span>
                                    )}
                                    {result.englishName ? ` • ${result.englishName}` : ''}
                                  </p>
                                  <p className="text-base text-slate-700 mt-1 quran-text-pak">
                                    {result.arabicName}
                                  </p>
                                </div>
                                <SafeIcon icon={FiArrowRight} className="text-slate-400" />
                              </div>
                            )}
                          </button>
                        </li>
                      ))}
                      {!results.length && !isLoading && (
                        <li className="px-6 py-8 text-center text-sm text-slate-500">
                          No matches yet. Try another phrase.
                        </li>
                      )}
                    </ul>

                    {results.length > 0 && (
                      <div className="border-t border-slate-100 p-4 flex-shrink-0 bg-white z-10">
                        <button
                          type="button"
                          onClick={() => {
                            if (query.trim()) {
                              saveRecentSearch(query.trim());
                              setRecentSearches(getRecentSearches());
                            }
                            navigate(`/search?q=${encodeURIComponent(query)}`);
                            setQuery('');
                            setResults([]);
                            setIsFocused(false);
                            setIsOpen(isNavVariant);
                          }}
                          className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                        >
                          <SafeIcon icon={FiList} className="text-lg" />
                          <span>{results.length > 3 ? `View All ${results.length} Results` : 'View All Results'}</span>
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>

      {/* Vertical Scrub Track & Large Centered Fade-In Ayah HUD Overlay */}
      {isScrubEnabled && (
        <>
          <div
            aria-hidden="true"
            className={`fixed top-6 bottom-28 left-1/2 -translate-x-1/2 z-40 w-1.5 rounded-full bg-slate-300/50 backdrop-blur-xs pointer-events-none transition-opacity duration-200 ${
              isScrubbing ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div
              className="w-full rounded-full bg-gradient-to-b from-blue-500 to-emerald-500 transition-all duration-75"
              style={{ height: `${scrubProgressPercent}%` }}
            />
          </div>

          <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className={`fixed inset-0 z-50 flex items-center justify-center pointer-events-none px-4 transition-all duration-300 ${
              hudVisible ? 'opacity-100 bg-black/40 backdrop-blur-[2px]' : 'opacity-0 bg-transparent'
            }`}
            style={{
              scale: hudVisible ? '1' : '0.92',
              translate: '0px 0px'
            }}
          >
            <div
              className={`relative rounded-3xl px-6 sm:px-8 py-5 shadow-2xl border backdrop-blur-xl w-full max-w-[340px] sm:max-w-md text-center transition-all duration-200 ${hudStyles.card}`}
            >
              {scrubArabic && (
                <div
                  dir="rtl"
                  lang="ar"
                  data-testid="scrub-arabic-words"
                  className={`quran-text-pak !text-xl sm:!text-2xl font-bold !leading-snug text-center px-1 line-clamp-2 ${hudStyles.arabicText}`}
                  style={{
                    color: hudStyles.arabicColor,
                    textShadow: hudStyles.arabicShadow
                  }}
                >
                  {scrubArabic}
                </div>
              )}

              <div className={`${scrubArabic ? 'mt-2.5' : 'mt-0'} flex items-baseline justify-center gap-2`}>
                {isHomeScrubContext && (
                  <span
                    data-testid="scrub-mode-badge"
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                      homeScrubMode === 'juz'
                        ? 'uppercase tracking-wider border-amber-400/50 bg-amber-400/15 text-amber-300'
                        : 'tracking-wide max-w-[170px] truncate border-emerald-400/50 bg-emerald-400/15 text-emerald-300'
                    }`}
                  >
                    {homeScrubMode === 'juz' ? 'Juz' : scrubbedSurahName}
                  </span>
                )}
                <span
                  data-testid="scrub-ayah-number"
                  className={`text-5xl sm:text-6xl font-black tracking-tight tabular-nums leading-none ${
                    isHomeScrubContext && homeScrubMode === 'surah'
                      ? 'text-emerald-400'
                      : hudStyles.number
                  }`}
                  style={{ textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}
                >
                  {scrubAyah}
                </span>
                <span className={`text-sm sm:text-base font-semibold tabular-nums ${hudStyles.totalText}`}>
                  / {scrubTotalItems}
                </span>
              </div>

              {isHomeScrubContext && (
                <div className={`mt-2 text-[11px] font-medium tracking-wide opacity-75 ${hudStyles.totalText}`}>
                  {homeScrubMode === 'juz' ? 'Slide ← for Surah' : 'Slide → for Juz'}
                </div>
              )}

              <div className={`mt-3 w-full h-1.5 ${hudStyles.trackBg} rounded-full overflow-hidden`}>
                <div
                  className={`h-full ${hudStyles.trackFill} rounded-full transition-all duration-75`}
                  style={{ width: `${scrubProgressPercent}%` }}
                />
              </div>

              {scrubSnippet && (
                <p
                  data-testid="scrub-translation"
                  className={`mt-3 text-xs sm:text-sm line-clamp-2 leading-relaxed px-1 ${hudStyles.snippetText}`}
                >
                  {scrubSnippet}
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default SearchBar;
