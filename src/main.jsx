import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { initializeMobileApp } from './mobile-init.js';
import { Capacitor } from '@capacitor/core';
import { initializationError } from './lib/firebase';

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

// Check for initialization errors before rendering
if (initializationError) {
  console.error('❌ App initialization failed:', initializationError);
  document.body.innerHTML = `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      padding: 20px;
      font-family: system-ui, -apple-system, sans-serif;
      background-color: #f8fafc;
      color: #1e293b;
      text-align: center;
    ">
      <div style="
        background: white;
        padding: 30px;
        border-radius: 12px;
        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        max-width: 500px;
        width: 100%;
      ">
        <h1 style="color: #ef4444; margin-bottom: 16px; font-size: 24px;">Configuration Error</h1>
        <p style="margin-bottom: 20px; line-height: 1.5;">
          The application failed to initialize correctly. This is usually due to missing environment variables.
        </p>
        <div style="
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 6px;
          padding: 12px;
          margin-bottom: 20px;
          text-align: left;
          font-family: monospace;
          font-size: 12px;
          color: #b91c1c;
          overflow-x: auto;
        ">
          ${initializationError.message}
        </div>
        <p style="font-size: 14px; color: #64748b;">
          Please check your <code>.env</code> file or build configuration.
        </p>
      </div>
    </div>
  `;
} else {
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
}