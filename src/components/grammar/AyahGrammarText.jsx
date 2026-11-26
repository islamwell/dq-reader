import React, { memo, useMemo, useState } from 'react';
import GrammarWord from './GrammarWord';
import { useQuranData } from '../../contexts/QuranContext';

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
    showInterlinear,
    emphasisPulsePaused = false
  } = useQuranData();

  const [hoveredIdafaPair, setHoveredIdafaPair] = useState(null);

  const surahGrammar = grammarData?.[surahNumber];
  const isEnhanced = Boolean(surahGrammar?.enhanced);
  const colorPalette = surahGrammar?.color_palette || 'default';
  const ayahGrammar = surahGrammar?.ayahs?.[String(ayahNumber)];
  const interlinear = isEnhanced && showInterlinear;

  // Enhanced surahs navigate word-by-word across the whole surah
  const surahWordList = useMemo(() => {
    if (!isEnhanced || !surahGrammar?.ayahs) return null;
    return Object.values(surahGrammar.ayahs)
      .sort((a, b) => a.verse_number - b.verse_number)
      .flatMap((ayah) =>
        ayah.words.map((w) => ({
          ...w,
          ayahNumber: ayah.verse_number,
          color_palette: w.color_palette || colorPalette
        }))
      );
  }, [isEnhanced, surahGrammar, colorPalette]);

  if (!words || words.length === 0) {
    return null;
  }

  const handleSelectWord = (word) => {
    setSelectedGrammarWord({
      ...word,
      color_palette: word.color_palette || colorPalette,
      surahNumber,
      ayahNumber,
      wordsInAyah: surahWordList || words,
      ayahStructure: ayahGrammar?.structure_en
        ? { en: ayahGrammar.structure_en }
        : null
    });
  };

  const activeIdafaPair =
    hoveredIdafaPair || selectedGrammarWord?.idafa?.pair_id || null;
  const hasSelectedWordInAyah = Boolean(
    selectedGrammarWord &&
      selectedGrammarWord.surahNumber === surahNumber &&
      selectedGrammarWord.ayahNumber === ayahNumber
  );

  return (
    <div
      dir="rtl"
      className={`quran-text-pak text-right leading-loose flex flex-wrap items-center justify-start ${
        interlinear ? 'gap-x-1.5 gap-y-3 items-start' : 'gap-y-2'
      } ${className}`}
    >
      {words.map((word) => {
        const isSelected =
          hasSelectedWordInAyah &&
          selectedGrammarWord.position === word.position;

        const isIdafaActive = Boolean(
          word.idafa?.pair_id && activeIdafaPair === word.idafa.pair_id
        );

        return (
          <GrammarWord
            key={`word-${surahNumber}-${ayahNumber}-${word.position}`}
            word={word}
            grammarMode={grammarMode}
            theme={theme}
            isSelected={Boolean(isSelected)}
            hasActiveWord={hasSelectedWordInAyah}
            onSelectWord={handleSelectWord}
            interlinear={interlinear}
            colorPalette={colorPalette}
            pulsePaused={Boolean(emphasisPulsePaused)}
            isIdafaActive={isIdafaActive}
            onHoverIdafaPair={setHoveredIdafaPair}
          />
        );
      })}
    </div>
  );
};

export default memo(AyahGrammarText);
