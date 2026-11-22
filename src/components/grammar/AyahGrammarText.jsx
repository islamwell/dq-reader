import React, { memo, useMemo, useState } from 'react';
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

  // Collect unique Iḍāfa pairs in this ayah to summarize in the structure banner
  const ayahIdafaPairs = useMemo(() => {
    const seen = new Set();
    const pairs = [];
    for (const w of words) {
      if (w.idafa && !seen.has(w.idafa.pair_id)) {
        seen.add(w.idafa.pair_id);
        pairs.push(w.idafa);
      }
    }
    return pairs;
  }, [words]);

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
      ayahStructure: ayahGrammar
        ? { ar: ayahGrammar.structure_ar, en: ayahGrammar.structure_en }
        : null
    });
  };

  const activeIdafaPair =
    hoveredIdafaPair || selectedGrammarWord?.idafa?.pair_id || null;

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

      {/* Sentence structure (tarkīb) & Iḍāfa caption for enhanced surahs */}
      {interlinear && ayahGrammar?.structure_ar && (
        <div
          className={`rounded-xl border px-4 py-2.5 text-xs space-y-1.5 ${structureStyle}`}
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
          {ayahIdafaPairs.length > 0 && (
            <div
              dir="rtl"
              data-testid="ayah-idafa-banner"
              className="flex flex-wrap items-center gap-2 pt-1 border-t border-current/10"
            >
              <span className={`font-arabic font-bold ${isDarkCard ? 'text-amber-300' : 'text-amber-800'}`}>
                🔗 تركيب الإضافة (Muḍāf / Muḍāf Ilayhi):
              </span>
              {ayahIdafaPairs.map((pair) => (
                <span
                  key={pair.pair_id}
                  onMouseEnter={() => setHoveredIdafaPair(pair.pair_id)}
                  onMouseLeave={() => setHoveredIdafaPair(null)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-arabic text-xs font-bold border cursor-pointer transition-colors ${
                    isDarkCard
                      ? 'bg-amber-950/70 text-amber-200 border-amber-500/70 hover:bg-amber-900/80'
                      : 'bg-amber-100/90 text-amber-950 border-amber-400 hover:bg-amber-200/80'
                  }`}
                >
                  <span>المضاف: {pair.mudaf_ar}</span>
                  <span>⟵</span>
                  <span>المضاف إليه: {pair.mudaf_ilayhi_ar}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default memo(AyahGrammarText);
