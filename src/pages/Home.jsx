import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SurahCard from '../components/SurahCard';
import { useQuranData } from '../contexts/QuranContext';
import { SurahListItemSkeleton } from '../components/Skeleton';

const THEME_TEXT_STYLES = {
  green: 'text-emerald-950',
  red: 'text-rose-950',
  blue: 'text-blue-950',
  light: 'text-slate-900',
  dark: 'text-slate-50',
  sepia: 'text-amber-950'
};

const THEME_SECONDARY_TEXT_STYLES = {
  green: 'text-emerald-700',
  red: 'text-rose-700',
  blue: 'text-blue-700',
  light: 'text-slate-600',
  dark: 'text-slate-300',
  sepia: 'text-amber-800'
};

const THEME_CARD_STYLES = {
  green: 'bg-emerald-50/50 border border-emerald-200',
  red: 'bg-rose-50/50 border border-rose-200',
  blue: 'bg-blue-50/50 border border-blue-200',
  light: 'bg-white border border-slate-200',
  dark: 'bg-slate-800/50 border border-slate-700',
  sepia: 'bg-amber-50/50 border border-amber-300'
};

// Rotating ayahs from Surah Ar-Rum (30:21-24)
const ROTATING_AYAHS = [
  {
    arabic: "وَمِنْ ءَایَـٰتِهِۦٓ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَ ٰ⁠جࣰا لِّتَسْكُنُوٓا۟ إِلَیْهَا وَجَعَلَ بَیْنَكُم مَّوَدَّةࣰ وَرَحْمَةً ۚ إِنَّ فِی ذَ ٰ⁠لِكَ لَـَٔایَـٰتࣲ لِّقَوْمࣲ یَتَفَكَّرُونَ",
    translation: "And one of His signs is that He created for you spouses from among yourselves so that you may find comfort in them. And He has placed between you compassion and mercy. Surely in this are signs for people who reflect."
  },
  {
    arabic: "وَمِنْ ءَایَـٰتِهِۦ خَلْقُ ٱلسَّمَـٰوَ ٰ⁠تِ وَٱلْأَرْضِ وَٱخْتِلَـٰفُ أَلْسِنَتِكُمْ وَأَلْوَ ٰ⁠نِكُمْ ۚ إِنَّ فِی ذَ ٰ⁠لِكَ لَـَٔایَـٰتࣲ لِّلْعَـٰلِمِینَ",
    translation: "And one of His signs is the creation of the heavens and the earth, and the diversity of your languages and colours. Surely in this are signs for those of ˹sound˺ knowledge."
  },
  {
    arabic: "وَمِنْ ءَایَـٰتِهِۦ مَنَامُكُم بِٱلَّیْلِ وَٱلنَّهَارِ وَٱبْتِغَاۤؤُكُم مِّن فَضْلِهِۦٓ ۚ إِنَّ فِی ذَ ٰ⁠لِكَ لَـَٔایَـٰتࣲ لِّقَوْمࣲ یَسْمَعُونَ",
    translation: "And one of His signs is your sleep by night and by day, and your seeking His bounty. Surely in this are signs for people who listen."
  },
  {
    arabic: "وَمِنْ ءَایَـٰتِهِۦ یُرِیكُمُ ٱلْبَرْقَ خَوْفࣰا وَطَمَعࣰا وَیُنَزِّلُ مِنَ ٱلسَّمَاۤءِ مَاۤءࣰ فَیُحْیِۦ بِهِ ٱلْأَرْضَ بَعْدَ مَوْتِهَاۤ ۚ إِنَّ فِی ذَ ٰ⁠لِكَ لَـَٔایَـٰتࣲ لِّقَوْمࣲ یَعْقِلُونَ",
    translation: "And one of His signs is that He shows you lightning, inspiring ˹you with˺ hope and fear. And He sends down rain from the sky, reviving the earth after its death. Surely in this are signs for people who understand."
  }
];

const Home = () => {
  const { surahs, loading, theme } = useQuranData();
  const textStyle = THEME_TEXT_STYLES[theme] || THEME_TEXT_STYLES.green;
  const secondaryTextStyle = THEME_SECONDARY_TEXT_STYLES[theme] || THEME_SECONDARY_TEXT_STYLES.green;
  const cardStyle = THEME_CARD_STYLES[theme] || THEME_CARD_STYLES.green;

  // Rotate ayah on each visit (use date-based index to change daily or use random)
  const [currentAyahIndex] = useState(() => {
    const visitCount = parseInt(localStorage.getItem('homeVisitCount') || '0', 10);
    const newCount = visitCount + 1;
    localStorage.setItem('homeVisitCount', newCount.toString());
    return (visitCount % ROTATING_AYAHS.length);
  });

  const currentAyah = ROTATING_AYAHS[currentAyahIndex];

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`rounded-2xl p-8 shadow-xl ${cardStyle}`}
        >
          <div className="space-y-4">
            <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
            <div className="h-6 w-full bg-slate-200 rounded animate-pulse" />
            <div className="h-6 w-5/6 bg-slate-200 rounded animate-pulse" />
          </div>
        </motion.div>

        {/* Surah list skeleton */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(12)].map((_, index) => (
            <SurahListItemSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className={`text-4xl font-bold mb-4 ${textStyle}`}>
          القرآن الكريم
        </h1>
        <p className={`text-xl mb-2 ${textStyle}`}>The Noble Quran</p>
        <p className={`italic mb-4 ${secondaryTextStyle}`}>
          Then do they not reflect upon the Qur'an, or are there locks upon [their] hearts?
        </p>

        {/* Rotating Ayah Display */}
        <motion.div
          key={currentAyahIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`mt-6 p-6 rounded-xl shadow-sm ${cardStyle}`}
        >
          <p className={`text-base leading-relaxed ${textStyle}`}>
            {currentAyah.translation}
          </p>
          <p className={`text-xs mt-3 opacity-75 ${secondaryTextStyle}`}>
            — Surah Ar-Rum (30:{21 + currentAyahIndex})
          </p>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {surahs.map((surah, index) => (
          <SurahCard key={surah.id} surah={surah} index={index} />
        ))}
      </div>
    </div>
  );
};

export default Home;