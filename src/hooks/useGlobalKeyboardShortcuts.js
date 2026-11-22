import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useQuranAudio, useQuranData } from '../contexts/QuranContext';

const THEME_SEQUENCE = ['green', 'red', 'blue', 'light', 'dark', 'sepia'];
const LANGUAGE_SEQUENCE = ['English', 'French', 'Urdu', 'Norsk'];
const TOTAL_SURAHS = 114;

const isTextInputTarget = (target) => {
  if (!target) return false;
  const tagName = target.tagName;
  return (
    tagName === 'INPUT' ||
    tagName === 'TEXTAREA' ||
    tagName === 'SELECT' ||
    Boolean(target.isContentEditable) ||
    target.getAttribute?.('role') === 'textbox'
  );
};

const getVisibleAyahNodesInfo = () => {
  const nodes = Array.from(document.querySelectorAll('[data-ayah]'));
  if (!nodes.length) {
    return { nodes: [], activeIndex: -1, ayahNumber: 1 };
  }

  const readingLineY = (window.innerHeight || 800) * 0.35;
  let activeIndex = 0;
  let smallestDistance = Infinity;

  nodes.forEach((node, index) => {
    const rect = node.getBoundingClientRect();
    if (rect.top <= readingLineY && rect.bottom >= readingLineY) {
      activeIndex = index;
      smallestDistance = 0;
      return;
    }
    const distance = Math.abs(rect.top - readingLineY);
    if (distance < smallestDistance) {
      smallestDistance = distance;
      activeIndex = index;
    }
  });

  const parsedAyah = Number(nodes[activeIndex]?.getAttribute('data-ayah'));
  return {
    nodes,
    activeIndex,
    ayahNumber: Number.isInteger(parsedAyah) && parsedAyah > 0 ? parsedAyah : 1
  };
};

const highlightAndScrollAyahNode = (node) => {
  if (!node) return;
  if (typeof node.scrollIntoView === 'function') {
    node.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  node.classList.add('ring-2', 'ring-emerald-400', 'ring-offset-2', 'transition-all');
  window.setTimeout(() => {
    node.classList.remove('ring-2', 'ring-emerald-400', 'ring-offset-2');
  }, 1400);
};

export const useGlobalKeyboardShortcuts = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    theme,
    setThemePreference,
    language,
    setLanguagePreference,
    lastPlayedPosition,
    toggleSettings,
    closeSettings,
    toggleBookmark
  } = useQuranData();
  const {
    playingAyah,
    isPaused,
    playAudio,
    pauseAudio,
    resumeAudio,
    stopAudio
  } = useQuranAudio();

  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  const openShortcuts = useCallback(() => setIsShortcutsOpen(true), []);
  const closeShortcuts = useCallback(() => setIsShortcutsOpen(false), []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const lowerKey = event.key?.toLowerCase?.() || '';
      const isModifierOpenSearch =
        (event.ctrlKey || event.metaKey) && !event.altKey && lowerKey === 'k';

      if (isModifierOpenSearch) {
        event.preventDefault();
        setIsShortcutsOpen(false);
        closeSettings?.();
        window.dispatchEvent(new CustomEvent('nq:open-search'));
        return;
      }

      if (isTextInputTarget(event.target)) {
        return;
      }

      if (event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }

      if (event.key === '?') {
        event.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
        return;
      }

      if (event.key === '/' && !isShortcutsOpen) {
        event.preventDefault();
        closeSettings?.();
        window.dispatchEvent(new CustomEvent('nq:open-search'));
        return;
      }

      if (event.key === ',' || lowerKey === 's') {
        event.preventDefault();
        setIsShortcutsOpen(false);
        toggleSettings?.();
        return;
      }

      if (lowerKey === 'h') {
        event.preventDefault();
        setIsShortcutsOpen(false);
        navigate('/');
        return;
      }

      if (lowerKey === 'b') {
        event.preventDefault();
        setIsShortcutsOpen(false);
        navigate('/bookmarks');
        return;
      }

      if (lowerKey === 'v') {
        event.preventDefault();
        setIsShortcutsOpen(false);
        navigate('/videos');
        return;
      }

      if (lowerKey === 'r') {
        event.preventDefault();
        setIsShortcutsOpen(false);
        if (lastPlayedPosition?.surahNumber && lastPlayedPosition?.ayahNumber) {
          navigate(
            `/surah/${lastPlayedPosition.surahNumber}?ayah=${lastPlayedPosition.ayahNumber}`
          );
        } else {
          toast('No recently played ayah yet', {
            id: 'shortcut-resume-empty',
            duration: 1800
          });
        }
        return;
      }

      if (lowerKey === 't') {
        event.preventDefault();
        if (typeof window.scrollTo === 'function') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        return;
      }

      if (lowerKey === 'c') {
        event.preventDefault();
        const currentIndex = THEME_SEQUENCE.indexOf(theme);
        const nextTheme =
          THEME_SEQUENCE[(currentIndex + 1) % THEME_SEQUENCE.length];
        setThemePreference?.(nextTheme);
        toast.success(`Theme: ${nextTheme}`, {
          id: 'shortcut-theme-toast',
          duration: 1400
        });
        return;
      }

      if (lowerKey === 'l' || event.code === 'KeyL') {
        event.preventDefault();
        const currentIndex = LANGUAGE_SEQUENCE.indexOf(language);
        const nextLanguage =
          LANGUAGE_SEQUENCE[(currentIndex + 1) % LANGUAGE_SEQUENCE.length];
        setLanguagePreference?.(nextLanguage);
        toast.success(`Language: ${nextLanguage}`, {
          id: 'shortcut-language-toast',
          duration: 1400
        });
        return;
      }

      if (lowerKey === 'x') {
        event.preventDefault();
        stopAudio?.();
        return;
      }

      const surahMatch = location.pathname.match(/^\/surah\/(\d+)/);
      const currentSurahNum = surahMatch ? Number(surahMatch[1]) : null;

      if (event.key === ' ' || event.code === 'Space') {
        const tag = event.target?.tagName;
        if (tag === 'BUTTON' || tag === 'A' || tag === 'SUMMARY') {
          return;
        }
        if (playingAyah && !isPaused) {
          event.preventDefault();
          pauseAudio?.();
          return;
        }
        if (playingAyah && isPaused) {
          event.preventDefault();
          resumeAudio?.();
          return;
        }
        if (currentSurahNum) {
          event.preventDefault();
          const { ayahNumber } = getVisibleAyahNodesInfo();
          playAudio?.(currentSurahNum, ayahNumber);
        }
        return;
      }

      if (event.key === '[' && currentSurahNum) {
        event.preventDefault();
        const prevSurah = currentSurahNum > 1 ? currentSurahNum - 1 : TOTAL_SURAHS;
        navigate(`/surah/${prevSurah}`);
        return;
      }

      if (event.key === ']' && currentSurahNum) {
        event.preventDefault();
        const nextSurah = currentSurahNum < TOTAL_SURAHS ? currentSurahNum + 1 : 1;
        navigate(`/surah/${nextSurah}`);
        return;
      }

      if ((lowerKey === 'j' || lowerKey === 'k') && currentSurahNum) {
        event.preventDefault();
        const { nodes, activeIndex } = getVisibleAyahNodesInfo();
        if (!nodes.length) return;
        const delta = lowerKey === 'j' ? 1 : -1;
        const targetIndex = Math.max(0, Math.min(nodes.length - 1, activeIndex + delta));
        highlightAndScrollAyahNode(nodes[targetIndex]);
        return;
      }

      if (lowerKey === 'm' && currentSurahNum) {
        event.preventDefault();
        let targetAyah = getVisibleAyahNodesInfo().ayahNumber;
        if (playingAyah) {
          const [playingSurah, playingAyahNum] = playingAyah.split(':').map(Number);
          if (playingSurah === currentSurahNum && playingAyahNum) {
            targetAyah = playingAyahNum;
          }
        }
        toggleBookmark?.(currentSurahNum, targetAyah);
        toast.success(`Toggled bookmark for ${currentSurahNum}:${targetAyah}`, {
          id: 'shortcut-bookmark-toast',
          duration: 1400
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    closeSettings,
    isPaused,
    isShortcutsOpen,
    language,
    lastPlayedPosition,
    location.pathname,
    navigate,
    pauseAudio,
    playAudio,
    playingAyah,
    resumeAudio,
    setLanguagePreference,
    setThemePreference,
    stopAudio,
    theme,
    toggleBookmark,
    toggleSettings
  ]);

  return {
    isShortcutsOpen,
    openShortcuts,
    closeShortcuts
  };
};

export default useGlobalKeyboardShortcuts;
