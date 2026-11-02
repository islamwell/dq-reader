import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import { useQuranData } from '../../contexts/QuranContext';
import { SURAH_32_QUIZ } from '../../data/quizzes/surah32Quiz';

const {
  FiCheckCircle,
  FiXCircle,
  FiArrowRight,
  FiArrowLeft,
  FiRotateCcw,
  FiBookOpen,
  FiAward,
  FiSparkles,
  FiHelpCircle
} = FiIcons;

const THEME_QUIZ_STYLES = {
  green: {
    container: 'bg-emerald-950/70 border-emerald-800 text-emerald-50',
    card: 'bg-emerald-900/40 border-emerald-800/80',
    optionIdle: 'bg-emerald-900/30 hover:bg-emerald-800/50 border-emerald-800 text-emerald-100',
    reflectionCard: 'bg-emerald-900/60 border-emerald-700 text-emerald-100',
    badge: 'bg-emerald-800/60 text-emerald-200 border-emerald-700',
    progressBar: 'bg-emerald-500',
    accentText: 'text-emerald-400'
  },
  red: {
    container: 'bg-rose-950/70 border-rose-800 text-rose-50',
    card: 'bg-rose-900/40 border-rose-800/80',
    optionIdle: 'bg-rose-900/30 hover:bg-rose-800/50 border-rose-800 text-rose-100',
    reflectionCard: 'bg-rose-900/60 border-rose-700 text-rose-100',
    badge: 'bg-rose-800/60 text-rose-200 border-rose-700',
    progressBar: 'bg-rose-500',
    accentText: 'text-rose-400'
  },
  blue: {
    container: 'bg-slate-900/90 border-blue-900 text-slate-100',
    card: 'bg-slate-800/70 border-blue-900/70',
    optionIdle: 'bg-slate-800/40 hover:bg-slate-800/80 border-slate-700 text-slate-100',
    reflectionCard: 'bg-blue-950/60 border-blue-800 text-blue-100',
    badge: 'bg-blue-900/50 text-blue-200 border-blue-700',
    progressBar: 'bg-blue-500',
    accentText: 'text-sky-400'
  },
  light: {
    container: 'bg-white border-slate-200 text-slate-900',
    card: 'bg-slate-50 border-slate-200',
    optionIdle: 'bg-white hover:bg-slate-100/80 border-slate-200 text-slate-800',
    reflectionCard: 'bg-amber-50/80 border-amber-200 text-amber-950',
    badge: 'bg-slate-100 text-slate-700 border-slate-200',
    progressBar: 'bg-amber-500',
    accentText: 'text-amber-700'
  },
  dark: {
    container: 'bg-slate-900/90 border-slate-800 text-slate-100',
    card: 'bg-slate-800/60 border-slate-700',
    optionIdle: 'bg-slate-800/40 hover:bg-slate-800/80 border-slate-700 text-slate-200',
    reflectionCard: 'bg-amber-950/40 border-amber-800/60 text-amber-100',
    badge: 'bg-slate-800 text-slate-300 border-slate-700',
    progressBar: 'bg-amber-400',
    accentText: 'text-amber-400'
  },
  sepia: {
    container: 'bg-amber-50 border-amber-300 text-amber-950',
    card: 'bg-amber-100/50 border-amber-200',
    optionIdle: 'bg-amber-50/80 hover:bg-amber-100 border-amber-300 text-amber-900',
    reflectionCard: 'bg-amber-100/80 border-amber-300 text-amber-950',
    badge: 'bg-amber-200/60 text-amber-900 border-amber-300',
    progressBar: 'bg-amber-600',
    accentText: 'text-amber-800'
  }
};

const SurahQuiz = ({ surahNumber = 32 }) => {
  const { theme } = useQuranData();
  const themeStyle = THEME_QUIZ_STYLES[theme] || THEME_QUIZ_STYLES.light;

  const quiz = useMemo(() => {
    return Number(surahNumber) === 32 ? SURAH_32_QUIZ : null;
  }, [surahNumber]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showSummary, setShowSummary] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);

  const score = useMemo(() => {
    if (!quiz?.questions) return 0;
    return quiz.questions.reduce((acc, q) => {
      const ansId = selectedAnswers[q.id];
      const correctOpt = q.options.find((opt) => opt.isCorrect);
      return ansId === correctOpt?.id ? acc + 1 : acc;
    }, 0);
  }, [quiz, selectedAnswers]);

  if (!quiz) return null;

  const questions = quiz.questions;
  const currentQ = questions[currentIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(selectedAnswers).length;
  const currentAnswer = selectedAnswers[currentQ?.id];
  const hasAnsweredCurrent = Boolean(currentAnswer);

  const handleSelectOption = (optionId) => {
    if (hasAnsweredCurrent && !reviewMode) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optionId
    }));
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setShowSummary(true);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleRestart = () => {
    setSelectedAnswers({});
    setCurrentIndex(0);
    setShowSummary(false);
    setReviewMode(false);
  };

  const progressPercentage = Math.round(((currentIndex + 1) / totalQuestions) * 100);

  const getEvaluationTitle = (sc) => {
    if (sc >= 9) return { title: 'Master of Deep Contemplation (متدبر)', badge: 'bg-amber-500 text-white' };
    if (sc >= 7) return { title: 'Insightful Reflective Thinker (مستبصر)', badge: 'bg-blue-500 text-white' };
    return { title: 'Sincere Seeker of Wisdom (باحث عن الحكمة)', badge: 'bg-emerald-500 text-white' };
  };

  return (
    <div className={`mt-12 rounded-3xl border shadow-xl p-6 sm:p-8 transition-all ${themeStyle.container}`}>
      {/* Quiz Banner Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-inherit/20">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${themeStyle.badge}`}>
              Surah {quiz.surahName} ({quiz.surahNumber}) • تدبر
            </span>
            <span className="text-xs font-semibold text-islamic-gold flex items-center space-x-1">
              <SafeIcon icon={FiSparkles} className="text-xs" />
              <span>Deep Thinking Quiz</span>
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {quiz.title}
          </h2>
          <p className="text-xs sm:text-sm opacity-80 max-w-2xl leading-relaxed">
            {quiz.subtitle}
          </p>
        </div>

        {!showSummary && (
          <div className="flex items-center space-x-2 self-end sm:self-center shrink-0">
            <span className="text-xs font-mono font-semibold opacity-75">
              Question {currentIndex + 1} of {totalQuestions}
            </span>
          </div>
        )}
      </div>

      {/* Main Interactive Body */}
      {!showSummary ? (
        <div className="mt-6 space-y-6">
          {/* Progress Bar & Quick Jump Navigation Dots */}
          <div className="space-y-2">
            <div className="w-full h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${themeStyle.progressBar}`}
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Quick jump dots */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                {questions.map((q, idx) => {
                  const isDone = Boolean(selectedAnswers[q.id]);
                  const isCurrent = idx === currentIndex;
                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setCurrentIndex(idx)}
                      className={`w-7 h-7 rounded-lg text-xs font-semibold flex items-center justify-center transition-all ${
                        isCurrent
                          ? 'ring-2 ring-amber-400 bg-amber-500 text-white font-bold scale-105 shadow-sm'
                          : isDone
                            ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40'
                            : 'bg-black/5 dark:bg-white/5 opacity-60 hover:opacity-100'
                      }`}
                      title={`Jump to Question ${idx + 1}: ${q.title}`}
                      aria-label={`Question ${idx + 1}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <span className="text-xs font-mono opacity-60">
                Answered: {answeredCount}/{totalQuestions}
              </span>
            </div>
          </div>

          {/* Current Question Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQ.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className={`p-5 sm:p-7 rounded-2xl border shadow-sm space-y-4 ${themeStyle.card}`}
            >
              {/* Question metadata badge */}
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-islamic-gold flex items-center space-x-1.5">
                  <SafeIcon icon={FiBookOpen} className="text-sm" />
                  <span>{currentQ.ayahRef}</span>
                </span>
                <span className="font-medium opacity-70">
                  {currentQ.title}
                </span>
              </div>

              {/* Prompt */}
              <h3 className="text-base sm:text-lg font-bold leading-relaxed">
                {currentQ.prompt}
              </h3>

              {/* Multiple Choice Options */}
              <div className="space-y-3 pt-2" role="radiogroup" aria-label="Quiz Options">
                {currentQ.options.map((option) => {
                  const isSelected = currentAnswer === option.id;
                  const isCorrect = option.isCorrect;

                  let optionStyle = themeStyle.optionIdle;
                  let icon = null;

                  if (hasAnsweredCurrent) {
                    if (isCorrect) {
                      optionStyle = 'bg-emerald-500/15 border-emerald-500 text-emerald-900 dark:text-emerald-100 ring-1 ring-emerald-500 font-semibold';
                      icon = <SafeIcon icon={FiCheckCircle} className="text-emerald-500 text-lg shrink-0" />;
                    } else if (isSelected && !isCorrect) {
                      optionStyle = 'bg-rose-500/15 border-rose-500 text-rose-900 dark:text-rose-100 ring-1 ring-rose-500';
                      icon = <SafeIcon icon={FiXCircle} className="text-rose-500 text-lg shrink-0" />;
                    } else {
                      optionStyle = 'opacity-40 border-transparent';
                    }
                  }

                  return (
                    <button
                      key={option.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => handleSelectOption(option.id)}
                      className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3.5 select-none ${optionStyle}`}
                    >
                      <span className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 border ${
                        isSelected
                          ? isCorrect
                            ? 'bg-emerald-500 text-white border-emerald-600'
                            : 'bg-rose-500 text-white border-rose-600'
                          : 'bg-black/5 dark:bg-white/10 border-inherit'
                      }`}>
                        {option.id}
                      </span>

                      <span className="text-sm sm:text-base leading-relaxed flex-1">
                        {option.text}
                      </span>

                      {icon}
                    </button>
                  );
                })}
              </div>

              {/* Deep Contemplation Explanation Card (Unfolds upon answering) */}
              <AnimatePresence>
                {hasAnsweredCurrent && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    className={`rounded-2xl border p-5 mt-4 space-y-2 overflow-hidden ${themeStyle.reflectionCard}`}
                  >
                    <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-islamic-gold">
                      <SafeIcon icon={FiSparkles} className="text-base" />
                      <span>Deep Linguistic & Psychological Insight (تدبر)</span>
                    </div>

                    <p className="text-sm sm:text-base leading-relaxed opacity-95">
                      {currentQ.deepReflection}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="px-4 py-2 rounded-xl border border-inherit/30 text-xs sm:text-sm font-semibold flex items-center space-x-2 hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <SafeIcon icon={FiArrowLeft} />
              <span>Previous</span>
            </button>

            <div className="flex items-center space-x-3">
              {currentIndex === totalQuestions - 1 && answeredCount === totalQuestions && (
                <button
                  type="button"
                  onClick={() => setShowSummary(true)}
                  className="px-5 py-2.5 rounded-xl bg-islamic-gold hover:bg-yellow-600 text-white text-xs sm:text-sm font-bold flex items-center space-x-2 shadow-lg shadow-yellow-500/20 transition-all"
                >
                  <SafeIcon icon={FiAward} className="text-base" />
                  <span>View Reflection Report</span>
                </button>
              )}

              {currentIndex < totalQuestions - 1 && (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-5 py-2.5 rounded-xl bg-islamic-gold hover:bg-yellow-600 text-white text-xs sm:text-sm font-bold flex items-center space-x-2 shadow-lg shadow-yellow-500/20 transition-all"
                >
                  <span>Next Question</span>
                  <SafeIcon icon={FiArrowRight} />
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Summary & Reflection Report */
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-6 space-y-8"
        >
          {/* Hero Evaluation */}
          <div className={`p-8 rounded-3xl border text-center space-y-4 ${themeStyle.card}`}>
            <div className="w-16 h-16 rounded-2xl bg-islamic-gold/20 text-islamic-gold flex items-center justify-center mx-auto border border-islamic-gold/40 shadow-inner">
              <SafeIcon icon={FiAward} className="text-3xl" />
            </div>

            <div>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase mb-2 ${getEvaluationTitle(score).badge}`}>
                {getEvaluationTitle(score).title}
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {score} / {totalQuestions} Contemplative Insights Mastered
              </h3>
              <p className="text-sm sm:text-base opacity-80 max-w-xl mx-auto mt-2 leading-relaxed">
                You have reflected deeply upon the psychological motives, rhetorical shifts, and linguistic secrets embedded in Surah As-Sajdah.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowSummary(false);
                  setCurrentIndex(0);
                  setReviewMode(true);
                }}
                className="px-4 py-2 rounded-xl border border-inherit/40 text-xs sm:text-sm font-semibold flex items-center space-x-2 hover:bg-black/5 dark:hover:bg-white/5 transition-all"
              >
                <SafeIcon icon={FiBookOpen} />
                <span>Review All Questions & Reflections</span>
              </button>

              <button
                type="button"
                onClick={handleRestart}
                className="px-4 py-2 rounded-xl bg-islamic-gold hover:bg-yellow-600 text-white text-xs sm:text-sm font-bold flex items-center space-x-2 shadow-md transition-all"
              >
                <SafeIcon icon={FiRotateCcw} />
                <span>Retake Quiz</span>
              </button>
            </div>
          </div>

          {/* Key Insights Overview */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider opacity-75 flex items-center space-x-2">
              <SafeIcon icon={FiHelpCircle} className="text-islamic-gold" />
              <span>Core Takeaways from Surah As-Sajdah</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className={`p-4 rounded-2xl border space-y-1.5 ${themeStyle.card}`}>
                <span className="text-xs font-bold text-islamic-gold uppercase tracking-wider">1. The Shift to "You" (Iltifāt)</span>
                <p className="text-xs sm:text-sm opacity-90 leading-relaxed">
                  Hearing, sight, and emotions are not abstract biological events; they are loaned faculties for which you are personally accountable.
                </p>
              </div>

              <div className={`p-4 rounded-2xl border space-y-1.5 ${themeStyle.card}`}>
                <span className="text-xs font-bold text-islamic-gold uppercase tracking-wider">2. Doubts as Smokescreens</span>
                <p className="text-xs sm:text-sm opacity-90 leading-relaxed">
                  Intellectual skepticism regarding the afterlife often masks an underlying reluctance to face moral reckoning before God.
                </p>
              </div>

              <div className={`p-4 rounded-2xl border space-y-1.5 ${themeStyle.card}`}>
                <span className="text-xs font-bold text-islamic-gold uppercase tracking-wider">3. The Secret Night Prayer</span>
                <p className="text-xs sm:text-sm opacity-90 leading-relaxed">
                  Because Tahajjud is prayed in quiet secrecy (tatajāfā), Allah conceals an unthinkably magnificent reward in return (ukhfiya).
                </p>
              </div>

              <div className={`p-4 rounded-2xl border space-y-1.5 ${themeStyle.card}`}>
                <span className="text-xs font-bold text-islamic-gold uppercase tracking-wider">4. Sabr & Yaqīn in Leadership</span>
                <p className="text-xs sm:text-sm opacity-90 leading-relaxed">
                  Divine leadership requires Yaqīn to protect against intellectual doubt, and Sabr to protect against emotional fatigue and desire.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SurahQuiz;
