import React, { useEffect, Suspense, lazy } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { QuranProvider, useQuranData } from './contexts/QuranContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Surah from './pages/Surah';
import ProtectedRoute from './components/ProtectedRoute';
import SettingsPanel from './components/SettingsPanel';
import { register as registerServiceWorker } from './utils/serviceWorkerRegistration';
import './App.css';

const SearchResults = lazy(() => import('./pages/SearchResults'));
const Bookmarks = lazy(() => import('./pages/Bookmarks'));
const Videos = lazy(() => import('./pages/Videos'));
const Credits = lazy(() => import('./pages/Credits'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));

const RouteLoading = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

function AppContent() {
  const { isSettingsOpen, closeSettings, openSettings } = useQuranData();

  return (
    <Router>
      <div className="min-h-screen">
        <Suspense fallback={<RouteLoading />}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="/surah/:surahNumber" element={<Surah />} />
              <Route path="/bookmarks" element={<Bookmarks />} />
              <Route path="/videos" element={<Videos />} />
            </Route>
            <Route
              path="/search"
              element={<SearchResults onOpenSettings={openSettings} />}
            />
            <Route path="/credits" element={<Credits />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <AdminPanel />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </Suspense>
        <SettingsPanel isOpen={isSettingsOpen} onClose={closeSettings} />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1e293b',
              color: '#f8fafc',
            },
          }}
        />
      </div>
    </Router>
  );
}

function App() {
  useEffect(() => {
    // Register service worker for offline support
    registerServiceWorker();
  }, []);

  return (
    <AuthProvider>
      <QuranProvider>
        <AppContent />
      </QuranProvider>
    </AuthProvider>
  );
}

export default App;