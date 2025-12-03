import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  persistentSingleTabManager
} from 'firebase/firestore';
import { Capacitor } from '@capacitor/core';

// Firebase configuration - hardcoded for Android compatibility
const firebaseConfig = {
  apiKey: "AIzaSyBIOoipb2-7uvYUoK2AXHithkFa1GOoqxI",
  authDomain: "quranreadertanzil.firebaseapp.com",
  projectId: "quranreadertanzil",
  storageBucket: "quranreadertanzil.firebasestorage.app",
  messagingSenderId: "115345566711",
  appId: "1:115345566711:android:94bc26daaad64996229cf2",
  measurementId: "G-HPQ4YCK20J"
};

// Initialize Firebase
let app;
let auth;
let db;
let initializationError = null;

try {
  app = initializeApp(firebaseConfig);

  // Initialize Firebase Authentication and get a reference to the service
  auth = getAuth(app);

  // Initialize Cloud Firestore with offline persistence enabled
  // This allows the app to work offline and sync when connection is restored
  // Use single tab manager for mobile platforms, multi-tab for web
  const isNativePlatform = Capacitor.isNativePlatform();
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: isNativePlatform
        ? persistentSingleTabManager()
        : persistentMultipleTabManager()
    })
  });

  console.log(`Firestore initialized with offline persistence (${isNativePlatform ? 'mobile' : 'web multi-tab'} mode)`);

} catch (error) {
  console.error('Failed to initialize Firebase:', error);
  initializationError = error;

  // Create dummy objects to prevent crashes in other files
  // This allows the app to load enough to show the error screen
  auth = { currentUser: null, onAuthStateChanged: () => () => { } };
  db = {};
}

export { auth, db, initializationError };
export default app;