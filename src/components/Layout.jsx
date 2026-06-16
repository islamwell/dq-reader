import { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useQuranData } from '../contexts/QuranContext';
import SettingsPanel from './SettingsPanel';
import SearchBar from './SearchBar';
import FloatingVideoViewport from './FloatingVideoViewport';

const { FiSettings, FiCornerDownRight } = FiIcons;

const THEME_STYLES = {
  green: {
    shell: 'bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 text-emerald-950',
    navBg: 'bg-emerald-50/95 backdrop-blur-sm',
    navBorder: 'border-emerald-200',
    navText: 'text-emerald-950',
    brandBadge: 'bg-gradient-to-br from-emerald-600 to-emerald-700 shadow-lg shadow-emerald-900/30',
    brandText: 'text-emerald-950',
    navButton: 'text-emerald-700 hover:bg-emerald-100 hover:text-emerald-900',
    settingsButton: 'text-emerald-700 hover:bg-emerald-100 hover:text-emerald-900',
    navIcon: 'text-emerald-600'
  },
  red: {
    shell: 'bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100 text-rose-950',
    navBg: 'bg-rose-50/95 backdrop-blur-sm',
    navBorder: 'border-rose-200',
    navText: 'text-rose-950',
    brandBadge: 'bg-gradient-to-br from-rose-600 to-rose-700 shadow-lg shadow-rose-900/30',
    brandText: 'text-rose-950',
    navButton: 'text-rose-700 hover:bg-rose-100 hover:text-rose-900',
    settingsButton: 'text-rose-700 hover:bg-rose-100 hover:text-rose-900',
    navIcon: 'text-rose-600'
  },
  blue: {
    shell: 'bg-gradient-to-br from-blue-50 via-sky-50 to-blue-100 text-blue-950',
    navBg: 'bg-blue-50/95 backdrop-blur-sm',
    navBorder: 'border-blue-200',
    navText: 'text-blue-950',
    brandBadge: 'bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg shadow-blue-900/30',
    brandText: 'text-blue-950',
    navButton: 'text-blue-700 hover:bg-blue-100 hover:text-blue-900',
    settingsButton: 'text-blue-700 hover:bg-blue-100 hover:text-blue-900',
    navIcon: 'text-blue-600'
  },
  light: {
    shell: 'bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 text-slate-900',
    navBg: 'bg-white/95 backdrop-blur-sm',
    navBorder: 'border-slate-200',
    navText: 'text-slate-800',
    brandBadge: 'bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-lg shadow-yellow-900/20',
    brandText: 'text-slate-900',
    navButton: 'text-slate-700 hover:bg-slate-100 hover:text-slate-900',
    settingsButton: 'text-slate-700 hover:bg-slate-100 hover:text-slate-900',
    navIcon: 'text-slate-600'
  },
  dark: {
    shell: 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50',
    navBg: 'bg-slate-900/95 backdrop-blur-sm',
    navBorder: 'border-slate-700/50',
    navText: 'text-slate-50',
    brandBadge: 'bg-gradient-to-br from-slate-700 to-slate-800 shadow-lg shadow-slate-900/50',
    brandText: 'text-slate-50',
    navButton: 'text-slate-100 hover:bg-slate-800/80 hover:text-white',
    settingsButton: 'text-slate-100 hover:bg-slate-800/80 hover:text-white',
    navIcon: 'text-slate-300'
  },
  sepia: {
    shell: 'bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 text-amber-950',
    navBg: 'bg-amber-50/95 backdrop-blur-sm',
    navBorder: 'border-amber-300',
    navText: 'text-amber-900',
    brandBadge: 'bg-gradient-to-br from-amber-700 to-amber-800 shadow-lg shadow-amber-900/30',
    brandText: 'text-amber-950',
    navButton: 'text-amber-800 hover:bg-amber-200 hover:text-amber-950',
    settingsButton: 'text-amber-800 hover:bg-amber-200 hover:text-amber-950',
    navIcon: 'text-amber-700'
  }
};

const DEFAULT_THEME_STYLE = THEME_STYLES.green;

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { lastPlayedPosition, theme } = useQuranData();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const themeStyles = THEME_STYLES[theme] ?? DEFAULT_THEME_STYLE;
  const shellClasses = `min-h-screen transition-colors duration-300 ${themeStyles.shell}`;
  const navClasses = `shadow-lg border-b ${themeStyles.navBg} ${themeStyles.navBorder} ${themeStyles.navText}`;
  const brandTextClass = `text-2xl font-bold ${themeStyles.brandText}`;
  const baseNavButtonClasses =
    'flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed';
  const lastAyahButtonClass = `${baseNavButtonClasses} ${themeStyles.navButton}`;
  const settingsButtonClass = `${baseNavButtonClasses} ${themeStyles.settingsButton}`;
  const navIconClass = `text-lg ${themeStyles.navIcon}`;

  const handleResumeLastAyah = () => {
    if (!lastPlayedPosition?.surahNumber || !lastPlayedPosition?.ayahNumber) {
      return;
    }

    navigate(`/surah/${lastPlayedPosition.surahNumber}?ayah=${lastPlayedPosition.ayahNumber}`);
  };

  useEffect(() => {
    setIsSettingsOpen(false);
  }, [location.pathname, location.search]);

  return (
    <div className={shellClasses}>
      <nav className={navClasses}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6 h-16">
            <Link to="/" className="flex items-center space-x-3">
              <img 
                src="/rose-svgrepo-com.svg" 
                alt="NurulQuran" 
                className="w-10 h-10 object-contain" 
              />
              <span className={brandTextClass}>NurulQuran</span>
            </Link>

            <div className="flex-1" />

            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={handleResumeLastAyah}
                disabled={!lastPlayedPosition}
                className={lastAyahButtonClass}
                title={lastPlayedPosition ? `Resume ${lastPlayedPosition.surahNumber}:${lastPlayedPosition.ayahNumber}` : 'Last ayah not available yet'}
              >
                <SafeIcon icon={FiCornerDownRight} className={navIconClass} />
                <span className="hidden sm:inline text-sm font-medium">Last Ayah</span>
              </button>

              <button
                type="button"
                onClick={() => setIsSettingsOpen(true)}
                className={settingsButtonClass}
                aria-expanded={isSettingsOpen}
                aria-controls="settings-panel"
              >
                <SafeIcon icon={FiSettings} className={navIconClass} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Floating Island Search Bar */}
      <SearchBar variant="global" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Outlet />
        </motion.div>
      </main>

      <SettingsPanel isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <FloatingVideoViewport />
    </div>
  );
};

export default Layout;