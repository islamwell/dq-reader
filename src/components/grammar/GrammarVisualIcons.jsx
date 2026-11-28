import React from 'react';

/**
 * Custom 2px-stroke geometric SVG icon set designed for the visual grammar modal
 * (verbs, subjects, past timeline, links, root sprout, verse book, gender, number, emphasis).
 */
const ICON_PATHS = {
  verb: <path d="M13 2 4 14h7l-1 8 9-12h-7z" />,
  person: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" />
    </>
  ),
  past: (
    <>
      <path d="M3 12a9 9 0 1 0 2.6-6.4" />
      <path d="M3 4v5h5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  present: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M10 8.5 16 12l-6 3.5z" />
    </>
  ),
  future: (
    <>
      <path d="M4 12h14" />
      <path d="m13 6 6 6-6 6" />
      <path d="M4 7v10" />
    </>
  ),
  command: (
    <>
      <path d="M12 4v10" />
      <circle cx="12" cy="19" r="1.2" fill="currentColor" stroke="none" />
      <path d="M5 9a7 7 0 0 1 14 0" />
    </>
  ),
  link: (
    <>
      <path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1" />
      <path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1" />
    </>
  ),
  act: (
    <>
      <circle cx="7" cy="5" r="2.3" />
      <path d="M7 8v6l-3 7M7 14l3 7M4 11h6" />
      <path d="M14 12h7M18 9l3 3-3 3" />
    </>
  ),
  passive: (
    <>
      <circle cx="17" cy="5" r="2.3" />
      <path d="M17 8v6l-3 7M17 14l3 7M14 11h6" />
      <path d="M3 12h7M7 9l3 3-3 3" />
    </>
  ),
  third: (
    <>
      <path d="M2 4h9v6H6l-4 3z" />
      <circle cx="17.5" cy="9" r="3" />
      <path d="M12.5 21c0-3 2.2-5 5-5s5 2 5 5" />
    </>
  ),
  masc: (
    <>
      <circle cx="10" cy="14" r="6" />
      <path d="M14.5 9.5 21 3M15 3h6v6" />
    </>
  ),
  fem: (
    <>
      <circle cx="12" cy="9" r="5.5" />
      <path d="M12 14.5V22M8.5 18.5h7" />
    </>
  ),
  sing: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M6.5 20.5c0-3.3 2.5-5.5 5.5-5.5s5.5 2.2 5.5 5.5" />
    </>
  ),
  dual: (
    <>
      <circle cx="8.5" cy="8.5" r="3" />
      <circle cx="16.5" cy="8.5" r="3" />
      <path d="M3.5 20c0-3 2.1-5 5-5s5 2 5 5M12.5 20c0-2.8 1.8-5 4-5 2.7 0 4.5 2 4.5 5" />
    </>
  ),
  plur: (
    <>
      <circle cx="12" cy="7" r="3" />
      <circle cx="5" cy="9" r="2.3" />
      <circle cx="19" cy="9" r="2.3" />
      <path d="M7 20c0-3 2.2-5.5 5-5.5s5 2.5 5 5.5M1.5 18c0-2.2 1.5-4 3.5-4 .9 0 1.7.3 2.3.8M22.5 18c0-2.2-1.5-4-3.5-4-.9 0-1.7.3-2.3.8" />
    </>
  ),
  loop: (
    <>
      <path d="M21 12a9 9 0 0 1-15.5 6.2M3 12A9 9 0 0 1 18.5 5.8" />
      <path d="M19 2v4h-4M5 22v-4h4" />
    </>
  ),
  root: (
    <>
      <path d="M12 22V11" />
      <path d="M12 11C12 6.5 8.5 4 4 4c0 4.5 3 7 8 7zM12 13.5c0-4 3-6.5 8-6.5 0 4-3 6.5-8 6.5z" />
    </>
  ),
  verse: (
    <>
      <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" />
      <path d="M4 21a2 2 0 0 1 2-2h13v2H6" />
    </>
  ),
  noun: (
    <>
      <path d="M20.5 13.4 13.4 20.5a2 2 0 0 1-2.8 0L3 13V4a1 1 0 0 1 1-1h9l7.5 7.6a2 2 0 0 1 0 2.8z" />
      <circle cx="8" cy="8" r="1.4" fill="currentColor" stroke="none" />
    </>
  ),
  particle: (
    <>
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="12" r="3" />
      <path d="M9 12h6" />
    </>
  ),
  emphasis: (
    <>
      <path d="m12 2 2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4z" />
    </>
  ),
  def: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12.2 2.4 2.4 4.8-5.2" />
    </>
  ),
  indef: (
    <>
      <circle cx="12" cy="12" r="8.5" strokeDasharray="3.5 3" />
      <circle cx="12" cy="12" r="2.5" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
    </>
  ),
  anchor: (
    <>
      <circle cx="12" cy="5.5" r="2.5" />
      <path d="M12 8v13M5 13H3a9 9 0 0 0 18 0h-2" />
    </>
  ),
  x: <path d="M6 6l12 12M18 6 6 18" />
};

const GrammarVisualIcon = ({ name, className = 'w-6 h-6' }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {ICON_PATHS[name] || ICON_PATHS.link}
  </svg>
);

export default GrammarVisualIcon;
