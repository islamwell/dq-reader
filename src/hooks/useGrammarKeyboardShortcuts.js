import { useEffect } from 'react';
import toast from 'react-hot-toast';

/**
 * Hook to register global keyboard shortcuts for Arabic grammar color-coding.
 * Pressing 'G' or 'g' toggles between colored text and off.
 */
export const useGrammarKeyboardShortcuts = ({
  grammarMode,
  setGrammarMode,
  toggleGrammarMode
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if typing inside form inputs, textareas, or contentEditable elements
      const target = e.target;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable ||
          target.getAttribute?.('role') === 'textbox')
      ) {
        return;
      }

      // Shortcut: 'g' or 'G' (without modifier keys)
      if ((e.key === 'g' || e.key === 'G') && !e.ctrlKey && !e.metaKey && !e.altKey) {
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
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [grammarMode, setGrammarMode, toggleGrammarMode]);
};

export default useGrammarKeyboardShortcuts;
