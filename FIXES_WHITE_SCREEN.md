# Fixes & Changes to Resolve the White‑Screen Issue

## Overview
The Android build of **DQ Quran** was failing with the following error:
```
Configuration Error
The application failed to initialize correctly. This is usually due to missing environment variables.

Missing required Firebase environment variables: VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID, VITE_FIREBASE_STORAGE_BUCKET, VITE_FIREBASE_MESSAGING_SENDER_ID, VITE_FIREBASE_APP_ID
```
The root cause was that the Vite‑based web code expects the Firebase configuration to be supplied via **environment variables** (`.env`). When the app is built for Android, those variables were not being injected, resulting in a runtime error and a white screen.

The solution was to **hard‑code the Firebase configuration** directly in the source file, rebuild the web assets, and redeploy the Android project.

---

## 1. Created `.env` (for completeness)
```text
VITE_FIREBASE_API_KEY=AIzaSyBIOoipb2-7uvYUoK2AXHithkFa1GOoqxI
VITE_FIREBASE_AUTH_DOMAIN=quranreadertanzil.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=quranreadertanzil
VITE_FIREBASE_STORAGE_BUCKET=quranreadertanzil.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=115345566711
VITE_FIREBASE_APP_ID=1:115345566711:android:94bc26daaad64996229cf2
VITE_FIREBASE_MEASUREMENT_ID=G-HPQ4YCK20J
```
*The file was added at the project root (`c:\gitprevious\dq\wscreen\dq-reader\.env`).*  It mirrors the values from `android/app/google‑services.json` and is useful for future builds that rely on environment variables.

---

## 2. **Hard‑coded Firebase configuration**
**File modified:** `src/lib/firebase.js`

### Before (environment‑variable based)
```javascript
// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};
```
### After (hard‑coded values)
```javascript
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
```
*All other logic (initialization, offline persistence, error handling) remained unchanged.*

---

## 3. Re‑built the web assets
```bash
npm run build   # runs lint then vite build
```
Output confirmed a successful production build (`vite v5.4.21 building for production...`), generating the `dist` folder with the hard‑coded config baked in.

---

## 4. Synchronized Capacitor assets
```bash
npx cap sync android   # copies the new `dist` folder into the Android project
```
This step updates `android/app/src/main/assets` with the freshly built web files.

---

## 5. Ran the Android app
```bash
npx cap run android   # builds the native Gradle project and deploys to the connected device
```
The app launched on **Google Pixel 5** without the white‑screen error.

---

## 6. Summary of the workflow
| Step | Command | Purpose |
|------|---------|---------|
| 1 | `npm run build` | Compile the web app with hard‑coded Firebase config |
| 2 | `npx cap sync android` | Copy the compiled `dist` assets into the Android project |
| 3 | `npx cap run android` | Build the native Gradle project and install on device |

---

## 7. Why this works
- **Vite** bundles the JavaScript at build time. By hard‑coding the values, they become part of the bundle, eliminating the need for runtime environment variable injection.
- The Android build process only copies the static `dist` folder; it never reads `.env`. Therefore, the previous approach (relying on `.env`) caused the runtime error.
- Keeping the original validation logic (try/catch) ensures that if anything else fails, the app still shows a graceful error screen instead of crashing.

---

## 8. Future recommendations
1. **Keep the hard‑coded block** only for Android builds. For web deployments you can revert to the `.env` approach by using a build flag or separate config file.
2. **Add a build script** (e.g., `npm run build:android`) that automatically swaps the config before building.
3. **Secure the keys** – consider moving them to a secure server or using Firebase’s App Check for production releases.

---

*Document generated on 2025‑11‑29.*
