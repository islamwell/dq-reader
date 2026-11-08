import { useEffect } from 'react';
import toast from 'react-hot-toast';

/**
 * Hook to register global keyboard shortcuts for Arabic grammar color-coding.
 * - 'G' toggles between colored text and off.
 * - 'I' toggles word-by-word interlinear study cards (only on surahs with
 *   enhanced sarf data, e.g. Surah 103).
 */
export const useGrammarKeyboardShortcuts = ({
  grammarMode,
  setGrammarMode,
  toggleGrammarMode,
  showInterlinear,
  setShowInterlinear,
  interlinearAvailable = false
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if typing inside form inputs, textareas, or contentEditable elements
      const target = e.target;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable ||
          target.getAttribute?.('role') === 'textbox')
      ) {
        return;
      }

      if (e.ctrlKey || e.metaKey || e.altKey) return;

      // Shortcut: 'g' or 'G'
      if (e.key === 'g' || e.key === 'G') {
        e.preventDefault();

        const nextMode = grammarMode === 'colored' ? 'off' : 'colored';
        setGrammarMode?.(nextMode);

        if (nextMode === 'colored') {
          toast.success('Arabic Grammar: Colored text enabled', {
            id: 'grammar-toggle-toast',
            icon: '🎨',
            duration: 1800
          });
        } else {
          toast('Arabic Grammar: Display disabled', {
            id: 'grammar-toggle-toast',
            icon: '📖',
            duration: 1800
          });
        }
        return;
      }

      // Shortcut: 'i' or 'I' — interlinear word cards
      if ((e.key === 'i' || e.key === 'I') && interlinearAvailable && setShowInterlinear) {
        e.preventDefault();
        const next = !showInterlinear;
        setShowInterlinear(next);
        toast(next ? 'Word-by-word ṣarf cards: on' : 'Word-by-word ṣarf cards: off', {
          id: 'grammar-interlinear-toast',
          icon: next ? '🧩' : '📜',
          duration: 1600
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [grammarMode, setGrammarMode, toggleGrammarMode, showInterlinear, setShowInterlinear, interlinearAvailable]);
};

export default useGrammarKeyboardShortcuts;
