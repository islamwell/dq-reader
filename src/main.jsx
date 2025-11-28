import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { initializeMobileApp } from './mobile-init.js';
import { Capacitor } from '@capacitor/core';

// Global error handlers for debugging
window.addEventListener('error', (event) => {
  console.error('❌ Global error:', event.error);
  console.error('Error message:', event.message);
  console.error('Error filename:', event.filename);
  console.error('Error line:', event.lineno);
  console.error('Error column:', event.colno);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('❌ Unhandled promise rejection:', event.reason);
  console.error('Promise:', event.promise);
});

console.log('🚀 DQ Quran App Starting...');
console.log('Platform:', Capacitor.getPlatform());
console.log('Is Native:', Capacitor.isNativePlatform());
console.log('Firebase Config Check:', {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ? '✓ Set' : '✗ Missing',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ? '✓ Set' : '✗ Missing',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ? '✓ Set' : '✗ Missing'
});

// Initialize mobile-specific features
initializeMobileApp()
  .then(() => {
    console.log('✅ Mobile app initialized successfully');
  })
  .catch((error) => {
    console.error('❌ Mobile app initialization failed:', error);
  });

// Register service worker only for web platform (not native)
if ('serviceWorker' in navigator && !Capacitor.isNativePlatform()) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('✅ Service Worker registered:', registration);
      })
      .catch((registrationError) => {
        console.log('❌ Service Worker registration failed:', registrationError);
      });
  });
}

try {
  console.log('📱 Rendering React app...');
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element not found! Check index.html');
  }

  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
  console.log('✅ React app rendered successfully');
} catch (error) {
  console.error('❌ Failed to render React app:', error);
  // Show error on screen for mobile debugging
  document.body.innerHTML = `
    <div style="padding: 20px; font-family: monospace; color: red;">
      <h2>App Failed to Load</h2>
      <p><strong>Error:</strong> ${error.message}</p>
      <pre>${error.stack}</pre>
    </div>
  `;
}