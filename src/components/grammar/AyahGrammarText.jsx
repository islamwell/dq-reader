import React, { memo } from 'react';
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
    setSelectedGrammarWord
  } = useQuranData();

  if (!words || words.length === 0) {
    return null;
  }

  const handleSelectWord = (word) => {
    setSelectedGrammarWord({
      ...word,
      surahNumber,
      ayahNumber,
      wordsInAyah: words
    });
  };

  return (
    <div
      dir="rtl"
      className={`quran-text-pak text-right leading-loose flex flex-wrap items-center justify-start gap-y-2 ${className}`}
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
          />
        );
      })}
    </div>
  );
};

export default memo(AyahGrammarText);
