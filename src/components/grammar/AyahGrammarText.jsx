import React, { memo, useMemo } from 'react';
import GrammarWord from './GrammarWord';
import { useQuranData } from '../../contexts/QuranContext';

const STRUCTURE_THEME_STYLES = {
  green: 'border-emerald-200 bg-emerald-50/70 text-emerald-900',
  red: 'border-rose-200 bg-rose-50/70 text-rose-900',
  blue: 'border-blue-200 bg-blue-50/70 text-blue-900',
  light: 'border-slate-200 bg-slate-50/90 text-slate-700',
  dark: 'border-slate-700 bg-slate-800/60 text-slate-200',
  sepia: 'border-amber-300 bg-amber-100/60 text-amber-950'
};

const AyahGrammarText = ({
  words = [],
  surahNumber,
  ayahNumber,
  className = ''
}) => {
  const {
    grammarMode,
    theme,
    selectedGrammarWord,
    setSelectedGrammarWord,
    grammarData,
    showInterlinear
  } = useQuranData();

  const surahGrammar = grammarData?.[surahNumber];
  const isEnhanced = Boolean(surahGrammar?.enhanced);
  const ayahGrammar = surahGrammar?.ayahs?.[String(ayahNumber)];
  const interlinear = isEnhanced && showInterlinear;

  // Enhanced surahs navigate word-by-word across the whole surah
  const surahWordList = useMemo(() => {
    if (!isEnhanced || !surahGrammar?.ayahs) return null;
    return Object.values(surahGrammar.ayahs)
      .sort((a, b) => a.verse_number - b.verse_number)
      .flatMap((ayah) => ayah.words.map((w) => ({ ...w, ayahNumber: ayah.verse_number })));
  }, [isEnhanced, surahGrammar]);

  if (!words || words.length === 0) {
    return null;
  }

  const handleSelectWord = (word) => {
    setSelectedGrammarWord({
      ...word,
      surahNumber,
      ayahNumber,
      wordsInAyah: surahWordList || words,
      ayahStructure: ayahGrammar
        ? { ar: ayahGrammar.structure_ar, en: ayahGrammar.structure_en }
        : null
    });
  };

  const isDarkCard = theme === 'dark';
  const structureStyle = STRUCTURE_THEME_STYLES[theme] || STRUCTURE_THEME_STYLES.light;

  return (
    <div className="space-y-3">
      <div
        dir="rtl"
        className={`quran-text-pak text-right leading-loose flex flex-wrap items-center justify-start ${
          interlinear ? 'gap-x-1.5 gap-y-3 items-start' : 'gap-y-2'
        } ${className}`}
      >
        {words.map((word) => {
          const isSelected =
            selectedGrammarWord &&
            selectedGrammarWord.surahNumber === surahNumber &&
            selectedGrammarWord.ayahNumber === ayahNumber &&
            selectedGrammarWord.position === word.position;

          return (
            <GrammarWord
              key={`word-${surahNumber}-${ayahNumber}-${word.position}`}
              word={word}
              grammarMode={grammarMode}
              theme={theme}
              isSelected={Boolean(isSelected)}
              onSelectWord={handleSelectWord}
              interlinear={interlinear}
            />
          );
        })}
      </div>

      {/* Sentence structure (tarkīb) caption for enhanced surahs */}
      {interlinear && ayahGrammar?.structure_ar && (
        <div
          className={`rounded-xl border px-4 py-2.5 text-xs space-y-1 ${structureStyle}`}
          data-testid="ayah-structure-banner"
        >
          <p dir="rtl" className="font-arabic text-sm leading-relaxed">
            <span className={`font-bold ml-1.5 ${isDarkCard ? 'text-islamic-gold' : 'text-amber-800'}`}>
              التركيب:
            </span>
            {ayahGrammar.structure_ar}
          </p>
          <p dir="ltr" className="leading-relaxed opacity-90">
            <span className="font-semibold">Structure: </span>
            {ayahGrammar.structure_en}
          </p>
        </div>
      )}
    </div>
  );
};

export default memo(AyahGrammarText);
