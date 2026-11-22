import React, { useEffect, useRef } from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiX, FiCommand } = FiIcons;

export const KEYBOARD_SHORTCUT_GROUPS = [
  {
    title: 'Navigation',
    items: [
      { keys: ['H'], description: 'Go to Home (Surah list)' },
      { keys: ['B'], description: 'Go to Bookmarks' },
      { keys: ['V'], description: 'Go to Videos' },
      { keys: ['R'], description: 'Resume last played ayah' },
      { keys: ['[', ']'], description: 'Previous / Next Surah' },
      { keys: ['J', 'K'], description: 'Next / Previous Ayah (Surah view)' },
      { keys: ['T'], description: 'Scroll to top of page' }
    ]
  },
  {
    title: 'Search & Panels',
    items: [
      { keys: ['/', 'Ctrl+K'], description: 'Open quick search' },
      { keys: [',', 'S'], description: 'Toggle Settings panel' },
      { keys: ['?'], description: 'Show / hide keyboard shortcuts' },
      { keys: ['Esc'], description: 'Close active panel or dialog' }
    ]
  },
  {
    title: 'Audio & Bookmarks',
    items: [
      { keys: ['Space'], description: 'Play / Pause ayah audio' },
      { keys: ['X'], description: 'Stop audio playback' },
      { keys: ['M'], description: 'Toggle bookmark on current ayah' }
    ]
  },
  {
    title: 'Study & Appearance',
    items: [
      { keys: ['G'], description: 'Toggle Arabic grammar colors' },
      { keys: ['I'], description: 'Toggle interlinear ṣarf cards' },
      { keys: ['C'], description: 'Cycle color theme' },
      { keys: ['L'], description: 'Cycle translation language' }
    ]
  }
];

const KeyboardShortcutsModal = ({ isOpen, onClose }) => {
  const dialogRef = useRef(null);
  const isOpenRef = useRef(isOpen);

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  // Sync React isOpen prop with native <dialog> top-layer modal API
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (isOpen) {
      if (!dialog.open) {
        if (typeof dialog.showModal === 'function') {
          try {
            dialog.showModal();
          } catch {
            dialog.setAttribute('open', '');
          }
        } else {
          // Fallback for DOM environments without HTMLDialogElement.showModal (e.g. jsdom)
          dialog.setAttribute('open', '');
        }
      }
    } else if (dialog.open || dialog.hasAttribute('open')) {
      if (typeof dialog.close === 'function') {
        try {
          dialog.close();
        } catch {
          dialog.removeAttribute('open');
        }
      } else {
        dialog.removeAttribute('open');
      }
    }
  }, [isOpen]);

  // Listen to native close event + light-dismiss fallback when closedby is unsupported (e.g. Safari)
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return undefined;
    }

    const handleNativeClose = () => {
      if (isOpenRef.current) {
        onClose?.();
      }
    };

    dialog.addEventListener('close', handleNativeClose);

    const hasClosedBySupport =
      typeof HTMLDialogElement !== 'undefined' && 'closedBy' in HTMLDialogElement.prototype;

    if (hasClosedBySupport) {
      return () => {
        dialog.removeEventListener('close', handleNativeClose);
      };
    }

    const isOutsideDialog = (event) => {
      const rect = dialog.getBoundingClientRect();
      return (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
      );
    };

    let pressedOutside = false;
    const handlePointerDown = (event) => {
      pressedOutside = isOutsideDialog(event);
    };
    const handlePointerUp = (event) => {
      if (pressedOutside && isOutsideDialog(event)) {
        if (typeof dialog.close === 'function') {
          dialog.close();
        } else {
          dialog.removeAttribute('open');
          onClose?.();
        }
      }
      pressedOutside = false;
    };

    dialog.addEventListener('pointerdown', handlePointerDown);
    dialog.addEventListener('pointerup', handlePointerUp);

    return () => {
      dialog.removeEventListener('close', handleNativeClose);
      dialog.removeEventListener('pointerdown', handlePointerDown);
      dialog.removeEventListener('pointerup', handlePointerUp);
    };
  }, [onClose]);

  return (
    <dialog
      ref={dialogRef}
      {...{ closedby: 'any' }}
      aria-labelledby="shortcuts-dialog-title"
      className="m-auto w-[calc(100%-2rem)] max-w-2xl rounded-2xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl"
    >
      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
        <div className="flex items-center gap-2.5">
          <SafeIcon icon={FiCommand} className="w-5 h-5 text-emerald-600" />
          <h2 id="shortcuts-dialog-title" className="text-lg font-bold text-slate-800">
            Keyboard Shortcuts
          </h2>
        </div>
        <button
          type="button"
          autoFocus
          onClick={onClose}
          aria-label="Close keyboard shortcuts"
          title="Close (Esc or ?)"
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
        >
          <SafeIcon icon={FiX} className="w-5 h-5" />
        </button>
      </div>

      <div className="max-h-[75vh] overflow-y-auto px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-6">
        {KEYBOARD_SHORTCUT_GROUPS.map((group) => (
          <section key={group.title}>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
              {group.title}
            </h3>
            <ul className="space-y-2.5">
              {group.items.map((item) => (
                <li
                  key={item.description}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="text-slate-700">{item.description}</span>
                  <span className="flex items-center gap-1 shrink-0">
                    {item.keys.map((keyLabel) => (
                      <kbd
                        key={keyLabel}
                        className="inline-flex items-center justify-center min-w-[1.6rem] px-1.5 py-0.5 text-xs font-mono font-semibold text-slate-700 bg-slate-100 border border-slate-300 rounded shadow-2xs"
                      >
                        {keyLabel}
                      </kbd>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="border-t border-slate-200 bg-slate-50 px-6 py-3 flex items-center justify-between text-xs text-slate-500 rounded-b-2xl">
        <span>Press <kbd className="font-mono font-semibold px-1 py-0.5 bg-white border border-slate-300 rounded">?</kbd> anytime to toggle this guide</span>
        <span>Press <kbd className="font-mono font-semibold px-1 py-0.5 bg-white border border-slate-300 rounded">Esc</kbd> or click outside to close</span>
      </div>
    </dialog>
  );
};

export default KeyboardShortcutsModal;
