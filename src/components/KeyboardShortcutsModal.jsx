import React, { useEffect, useRef, useState } from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiX, FiCommand, FiBookOpen, FiArrowRight, FiArrowLeft } = FiIcons;

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
      { keys: ['?'], description: 'Show / hide help & color guide' },
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
      { keys: ['I'], description: 'Toggle interlinear word cards' },
      { keys: ['C'], description: 'Cycle color theme' },
      { keys: ['L'], description: 'Cycle translation language' }
    ]
  }
];

const HELP_SCREENS = [
  { id: 'shortcuts', label: 'Keyboard Shortcuts', shortLabel: '1. Shortcuts', icon: FiCommand },
  { id: 'grammar', label: 'Grammar Color Guide', shortLabel: '2. Grammar Guide', icon: FiBookOpen }
];

const KeyboardShortcutsModal = ({
  isOpen,
  onClose,
  emphasisPulsePaused = false,
  onToggleEmphasisPulse
}) => {
  const dialogRef = useRef(null);
  const isOpenRef = useRef(isOpen);
  const tabRefs = useRef({});
  const [activeScreen, setActiveScreen] = useState('shortcuts');
  const [localPulsePaused, setLocalPulsePaused] = useState(emphasisPulsePaused);

  const isPulsePaused = onToggleEmphasisPulse ? emphasisPulsePaused : localPulsePaused;
  const handleTogglePulse = () => {
    if (onToggleEmphasisPulse) {
      onToggleEmphasisPulse();
    } else {
      setLocalPulsePaused((prev) => !prev);
    }
  };

  useEffect(() => {
    isOpenRef.current = isOpen;
    if (!isOpen) {
      setActiveScreen('shortcuts');
    }
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

  const handleTabListKeyDown = (event) => {
    const currentIndex = HELP_SCREENS.findIndex((s) => s.id === activeScreen);
    if (currentIndex === -1) return;

    let nextIndex = null;
    if (event.key === 'ArrowRight') {
      nextIndex = (currentIndex + 1) % HELP_SCREENS.length;
    } else if (event.key === 'ArrowLeft') {
      nextIndex = (currentIndex - 1 + HELP_SCREENS.length) % HELP_SCREENS.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = HELP_SCREENS.length - 1;
    }

    if (nextIndex !== null) {
      event.preventDefault();
      event.stopPropagation();
      const nextScreen = HELP_SCREENS[nextIndex];
      setActiveScreen(nextScreen.id);
      tabRefs.current[nextScreen.id]?.focus?.();
    }
  };

  const isShortcutsScreen = activeScreen === 'shortcuts';

  return (
    <dialog
      ref={dialogRef}
      {...{ closedby: 'any' }}
      aria-labelledby="shortcuts-dialog-title"
      className="m-auto w-[calc(100%-2rem)] max-w-2xl rounded-2xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
        <div className="flex items-center gap-2.5">
          <SafeIcon
            icon={isShortcutsScreen ? FiCommand : FiBookOpen}
            className="w-5 h-5 text-emerald-600"
          />
          <h2 id="shortcuts-dialog-title" className="text-lg font-bold text-slate-800">
            {isShortcutsScreen ? 'Keyboard Shortcuts' : 'Grammar Color Guide'}
          </h2>
          <span className="text-xs font-medium text-slate-400">
            {isShortcutsScreen ? '1 / 2' : '2 / 2'}
          </span>
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

      {/* Screen Switcher Tablist (Single row, shape-backed active indicator) */}
      <div
        role="tablist"
        aria-label="Help screens"
        onKeyDown={handleTabListKeyDown}
        className="flex border-b border-slate-200 bg-slate-50/70 px-6 gap-6 overflow-x-auto"
      >
        {HELP_SCREENS.map((screen) => {
          const selected = activeScreen === screen.id;
          return (
            <button
              key={screen.id}
              ref={(el) => {
                tabRefs.current[screen.id] = el;
              }}
              id={`help-tab-${screen.id}`}
              type="button"
              role="tab"
              aria-selected={selected}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActiveScreen(screen.id)}
              className={`help-modal-tab relative flex items-center gap-2 py-3 text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 ${
                selected ? 'text-emerald-700' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <SafeIcon icon={screen.icon} className="w-4 h-4 shrink-0" />
              <span>{screen.shortLabel}</span>
            </button>
          );
        })}
      </div>

      {/* Screen 1: Keyboard Shortcuts */}
      <div
        role="tabpanel"
        aria-labelledby="help-tab-shortcuts"
        hidden={!isShortcutsScreen}
        tabIndex={isShortcutsScreen ? 0 : undefined}
      >
        <div className="max-h-[65vh] overflow-y-auto px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-6">
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
      </div>

      {/* Screen 2: Grammar Color Guide (Moved from Surah header for clean UI/UX) */}
      <div
        role="tabpanel"
        aria-labelledby="help-tab-grammar"
        hidden={isShortcutsScreen}
        tabIndex={!isShortcutsScreen ? 0 : undefined}
        data-testid="grammar-help-screen"
      >
        <div className="max-h-[65vh] overflow-y-auto px-6 py-5 space-y-5 text-sm">
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Tap any word in the ayah to view its part of speech, singular form (for plurals),
            full verb conjugation table, possessive links, and simple explanation.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Ism (Noun) — Red Shades */}
            <section className="rounded-xl border border-red-200 bg-red-50/50 p-4 space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-red-800">
                Ism · Noun (Red Shades)
              </h3>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-600 shrink-0" aria-hidden="true" />
                  <span><strong>Singular</strong> — a single person, place, or thing</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-800 shrink-0" aria-hidden="true" />
                  <span><strong>Plural</strong> — tap to see its singular form</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-400 shrink-0" aria-hidden="true" />
                  <span><strong>Pronoun</strong> — he, they, his, their, that, what</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500 shrink-0" aria-hidden="true" />
                  <span><strong>Derived / Action Noun</strong> — descriptive &amp; time nouns</span>
                </li>
              </ul>
            </section>

            {/* Verb (Fi'l) — Green Shades */}
            <section className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Verb · Fiʿl (Green Shades)
              </h3>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-700 shrink-0" aria-hidden="true" />
                  <span><strong>Past</strong> — completed action (e.g. stirred up)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-500 shrink-0" aria-hidden="true" />
                  <span><strong>Present</strong> — ongoing action (e.g. knows)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-teal-500 shrink-0" aria-hidden="true" />
                  <span><strong>Future &amp; Command (Amr)</strong> — will… / Do!</span>
                </li>
              </ul>
            </section>

            {/* Harf (Particle) — Royal Blue + Emphasis Pulse */}
            <section className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-800">
                Harf · Particle (Royal Blue)
              </h3>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-600 shrink-0" aria-hidden="true" />
                  <span><strong>Particle</strong> — connecting words (and, in, to, the, not)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] font-bold bg-indigo-100 text-indigo-900 border-indigo-300 harf-emphasis-pulse ${
                      isPulsePaused ? 'harf-emphasis-paused' : ''
                    }`}
                  >
                    ✦ Emphasis Pulse
                  </span>
                  <span>Strong emphasis &amp; oath particles</span>
                </li>
              </ul>
            </section>

            {/* Idafa (Mudaf / Mudaf Ilayhi) */}
            <section className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                🔗 Muḍāf &amp; Muḍāf Ilayhi (Iḍāfa)
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed">
                Amber link badges highlight two nouns joined in an <strong>&ldquo;of&rdquo;</strong> or
                possessive pair (like <em>love of wealth</em> or <em>his Lord</em>). Hovering one highlights its partner.
              </p>
            </section>
          </div>

          {/* Emphasis Pulse Control */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="text-xs text-slate-600">
              <strong className="text-slate-800">Emphasis Animation:</strong> Gently pulses strong emphasis particles in Surah 100.
            </div>
            <button
              type="button"
              data-testid="toggle-emphasis-pulse"
              onClick={handleTogglePulse}
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
            >
              {isPulsePaused ? 'Play Emphasis Pulse' : 'Pause Emphasis Pulse'}
            </button>
          </div>
        </div>
      </div>

      {/* Footer with easy Next / Back screen switcher */}
      <div className="border-t border-slate-200 bg-slate-50 px-6 py-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 rounded-b-2xl">
        <span>
          Press <kbd className="font-mono font-semibold px-1 py-0.5 bg-white border border-slate-300 rounded">?</kbd> anytime to toggle •{' '}
          <kbd className="font-mono font-semibold px-1 py-0.5 bg-white border border-slate-300 rounded">Esc</kbd> to close
        </span>
        <button
          type="button"
          data-testid="switch-help-screen"
          onClick={() => setActiveScreen(isShortcutsScreen ? 'grammar' : 'shortcuts')}
          className="inline-flex items-center gap-1.5 font-semibold text-emerald-700 hover:text-emerald-900 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 rounded px-1.5 py-0.5"
        >
          {isShortcutsScreen ? (
            <>
              <span>Next: Grammar Color Guide</span>
              <SafeIcon icon={FiArrowRight} className="w-3.5 h-3.5" />
            </>
          ) : (
            <>
              <SafeIcon icon={FiArrowLeft} className="w-3.5 h-3.5" />
              <span>Back: Keyboard Shortcuts</span>
            </>
          )}
        </button>
      </div>
    </dialog>
  );
};

export default KeyboardShortcutsModal;
