# DQ Quran App - Debugging Guide

This guide will help you diagnose and fix issues with the Android and iOS apps.

## Quick Diagnosis: White Screen Issue

If you see a white screen when opening the app, follow these steps to view error messages:

---

## Android Debugging

### Method 1: View Logs with Android Studio (Recommended)

1. **Open the Android project:**
   ```bash
   npx cap open android
   ```

2. **Connect your Android device** or start an emulator

3. **View Logcat:**
   - In Android Studio, open the **Logcat** tab (bottom of window)
   - Filter by tag: **DQQuran**
   - Look for red error messages marked with ❌

4. **Run the app:**
   - Click the green "Run" button (▶) or press `Shift + F10`
   - Watch the Logcat output

### Method 2: Command Line ADB (Alternative)

```bash
# Connect your device and enable USB debugging

# View all logs
adb logcat

# Filter for app-specific logs
adb logcat | grep "DQQuran"

# Filter for errors only
adb logcat *:E

# Save logs to a file
adb logcat > android-logs.txt
```

### Method 3: Chrome Remote Debugging (Best for JavaScript errors)

1. **Connect your Android device** via USB with USB debugging enabled

2. **Open Chrome** on your computer and navigate to:
   ```
   chrome://inspect/#devices
   ```

3. **Open the app** on your Android device

4. **Click "inspect"** next to the WebView entry

5. **View the Console tab** - this shows all JavaScript errors, logs, and Firebase initialization messages

### What to Look For in Android Logs

```
✅ Good signs:
- "DQ Quran app starting..."
- "WebView debugging enabled"
- "Mobile app initialized successfully"
- "Firestore initialized with offline persistence"

❌ Bad signs:
- "Missing required Firebase environment variables"
- JavaScript errors in red
- Network errors
- "Failed to render React app"
```

---

## iOS Debugging

### Method 1: View Logs with Xcode (Recommended)

1. **Open the iOS project:**
   ```bash
   npx cap open ios
   ```

2. **Connect your iPhone/iPad** or use simulator

3. **Open Debug Console:**
   - Run the app (⌘R)
   - Open the debug console at the bottom
   - Click the filter icon and select "All Output"

4. **Look for errors:**
   - Red error messages
   - Firebase initialization failures
   - JavaScript errors

### Method 2: Safari Web Inspector (Best for JavaScript errors)

1. **On your Mac**, enable Develop menu:
   - Safari → Settings → Advanced
   - Check "Show Develop menu in menu bar"

2. **On your iOS device**, enable Web Inspector:
   - Settings → Safari → Advanced
   - Enable "Web Inspector"

3. **Run the app** on your device

4. **In Safari**, go to:
   - Develop → [Your Device Name] → [DQ Quran]
   - Open the Console tab

---

## Common Issues and Solutions

### Issue 1: White Screen on Android/iOS

**Symptoms:** App opens but shows only a white screen

**Possible Causes:**
1. Firebase not initializing
2. JavaScript error during app startup
3. Missing environment variables in build
4. Network connectivity issues

**Solutions:**
1. **Check if Firebase config is embedded:**
   ```bash
   grep -r "quranreadertanzil" dist/assets/*.js
   ```
   Should output the Firebase project ID

2. **Rebuild with environment variables:**
   ```bash
   npm run build
   npx cap sync
   ```

3. **Check Chrome inspect (Android)** or **Safari Web Inspector (iOS)** for JavaScript errors

### Issue 2: "Missing Firebase environment variables" Error

**Solution:** Rebuild the app to embed the .env variables
```bash
npm run build
npx cap sync
npx cap open android  # or ios
```

### Issue 3: Network/Firebase Connection Issues

**Check:**
- Device has internet connection
- Firebase rules allow public read access
- `google-services.json` (Android) or `GoogleService-Info.plist` (iOS) are in correct locations

**Verify files exist:**
```bash
ls -la android/app/google-services.json
ls -la ios/App/App/GoogleService-Info.plist
```

### Issue 4: App Crashes Immediately

**Check native logs:**
- Android: Look for Java stack traces in Logcat
- iOS: Look for crash reports in Xcode console

**Common fixes:**
- Clean and rebuild the native project
- Check for Capacitor plugin compatibility issues

---

## Debugging Checklist

When reporting issues, please provide:

- [ ] Platform (Android / iOS)
- [ ] Device/Emulator details
- [ ] Error messages from console/logcat
- [ ] Screenshot of the issue
- [ ] Steps to reproduce

### Quick Debug Command

Run this to check your build:
```bash
# Verify Firebase config is in build
grep "AIzaSyBIOoipb2" dist/assets/*.js && echo "✅ Firebase API key found" || echo "❌ Firebase config missing"

# Verify build files exist
ls dist/index.html && echo "✅ Build exists" || echo "❌ No build found"

# Rebuild everything
npm run build && npx cap sync && echo "✅ Rebuilt and synced"
```

---

## Advanced Debugging

### Enable Verbose Logging

**Android:** Add to `MainActivity.java`
```java
android.webkit.WebView.setWebContentsDebuggingEnabled(true);
```
(Already added in latest version)

**iOS:** Check console output in Xcode

### Check Capacitor Configuration

```bash
npx cap doctor
```

This will verify:
- Capacitor is properly installed
- Native platforms are set up correctly
- Plugins are correctly linked

---

## Getting Help

If you're still stuck:

1. **Check logs** using methods above
2. **Copy error messages** exactly as they appear
3. **Note the exact steps** that cause the problem
4. **Share the information** for faster diagnosis

### Common Log Locations

- **Android Logcat:** Real-time in Android Studio or via `adb logcat`
- **Chrome DevTools:** `chrome://inspect` → Console tab
- **iOS Console:** Xcode → View → Debug Area → Show Debug Area
- **Safari Inspector:** Develop menu → Device → App → Console

---

## Quick Reference: Viewing JavaScript Console

| Platform | Tool | How to Access |
|----------|------|---------------|
| Android | Chrome DevTools | `chrome://inspect` → inspect WebView |
| iOS | Safari Web Inspector | Develop → Device → App |
| Web | Browser DevTools | F12 or Cmd+Opt+I |

---

**Remember:** The console will show detailed error messages with ❌ emoji markers and specific error details thanks to the enhanced error logging we've added.
