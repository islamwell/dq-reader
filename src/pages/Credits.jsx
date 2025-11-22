import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useQuranData } from '../contexts/QuranContext';

const { FiArrowLeft, FiExternalLink } = FiIcons;

const THEME_BG_STYLES = {
  green: 'bg-gradient-to-br from-emerald-50 to-emerald-100',
  red: 'bg-gradient-to-br from-rose-50 to-rose-100',
  blue: 'bg-gradient-to-br from-blue-50 to-blue-100',
  light: 'bg-gradient-to-br from-slate-50 to-slate-100',
  dark: 'bg-gradient-to-br from-slate-900 to-slate-800',
  sepia: 'bg-gradient-to-br from-amber-50 to-amber-100'
};

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
  green: 'bg-white border-emerald-200',
  red: 'bg-white border-rose-200',
  blue: 'bg-white border-blue-200',
  light: 'bg-white border-slate-200',
  dark: 'bg-slate-800 border-slate-700',
  sepia: 'bg-white border-amber-300'
};

const Credits = () => {
  const { theme } = useQuranData();
  const bgStyle = THEME_BG_STYLES[theme] || THEME_BG_STYLES.green;
  const textStyle = THEME_TEXT_STYLES[theme] || THEME_TEXT_STYLES.green;
  const secondaryTextStyle = THEME_SECONDARY_TEXT_STYLES[theme] || THEME_SECONDARY_TEXT_STYLES.green;
  const cardStyle = THEME_CARD_STYLES[theme] || THEME_CARD_STYLES.green;

  return (
    <div className={`min-h-screen ${bgStyle}`}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            to="/"
            className={`inline-flex items-center gap-2 ${secondaryTextStyle} hover:text-islamic-gold transition-colors`}
          >
            <SafeIcon icon={FiArrowLeft} />
            <span>Back to Home</span>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          <div className="text-center mb-8">
            <h1 className={`text-4xl font-bold mb-4 ${textStyle}`}>Credits & Acknowledgments</h1>
            <p className={secondaryTextStyle}>
              This application is made possible by the following resources
            </p>
          </div>

          <div className={`border-2 rounded-xl p-6 shadow-lg ${cardStyle}`}>
            <h2 className={`text-2xl font-bold mb-4 ${textStyle}`}>Quranic Text & Translations</h2>
            <div className="space-y-3">
              <p className={secondaryTextStyle}>
                The Quranic text and translations used in this application are provided by:
              </p>
              <a
                href="https://tanzil.net"
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 ${textStyle} hover:text-islamic-gold transition-colors font-semibold`}
              >
                <SafeIcon icon={FiExternalLink} />
                Tanzil.net
              </a>
              <p className={secondaryTextStyle}>
                Tanzil is a Quranic project aimed at providing a highly verified precise Quran text in the Uthmani script.
              </p>
            </div>
          </div>

          <div className={`border-2 rounded-xl p-6 shadow-lg ${cardStyle}`}>
            <h2 className={`text-2xl font-bold mb-4 ${textStyle}`}>Audio Recitations</h2>
            <div className="space-y-3">
              <p className={secondaryTextStyle}>
                The audio recitations used in this application are provided by:
              </p>
              <a
                href="https://everyayah.com"
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 ${textStyle} hover:text-islamic-gold transition-colors font-semibold`}
              >
                <SafeIcon icon={FiExternalLink} />
                Everyayah.com
              </a>
              <p className={secondaryTextStyle}>
                EveryAyah provides verse-by-verse audio recitations by various renowned reciters from around the world.
              </p>
            </div>
          </div>

          <div className={`border-2 rounded-xl p-6 shadow-lg ${cardStyle}`}>
            <h2 className={`text-2xl font-bold mb-4 ${textStyle}`}>Contact & Support</h2>
            <p className={secondaryTextStyle}>
              For any questions, feedback, or technical support, please contact:
            </p>
            <a
              href="mailto:it@nrq.no"
              className={`inline-flex items-center gap-2 ${textStyle} hover:text-islamic-gold transition-colors font-semibold mt-3`}
            >
              it@nrq.no
            </a>
          </div>

          <div className={`border-2 rounded-xl p-6 shadow-lg ${cardStyle}`}>
            <h2 className={`text-2xl font-bold mb-4 ${textStyle}`}>Corrections</h2>
            <p className={secondaryTextStyle}>
              If you notice any errors or would like to suggest corrections to the content:
            </p>
            <Link
              to="/admin/login"
              className={`inline-flex items-center gap-2 ${textStyle} hover:text-islamic-gold transition-colors font-semibold mt-3`}
            >
              <SafeIcon icon={FiExternalLink} />
              Submit Corrections
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Credits;
