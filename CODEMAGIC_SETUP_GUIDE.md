# CodeMagic Setup Guide for DQ Reader

This guide will walk you through setting up CodeMagic CI/CD for Android, iOS, and Web builds.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [CodeMagic Account Setup](#codemagic-account-setup)
3. [Repository Connection](#repository-connection)
4. [Environment Variables Configuration](#environment-variables-configuration)
5. [Android Build Setup](#android-build-setup)
6. [iOS Build Setup](#ios-build-setup)
7. [Web Build Setup](#web-build-setup)
8. [First Build](#first-build)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, ensure you have:

- [ ] GitHub repository with the DQ Reader code
- [ ] Firebase project with credentials
- [ ] Google Play Console account (for Android)
- [ ] Apple Developer account (for iOS)
- [ ] CodeMagic account (sign up at https://codemagic.io)

---

## CodeMagic Account Setup

### Step 1: Create CodeMagic Account

1. Go to https://codemagic.io
2. Click **"Sign up for free"**
3. Sign up using your GitHub account
4. Complete the verification process

### Step 2: Choose Plan

- **Free Plan**: Good for testing (500 build minutes/month)
- **Professional Plan**: Recommended for production ($99/month, unlimited builds)
- Start with Free plan and upgrade as needed

---

## Repository Connection

### Step 1: Add Application

1. In CodeMagic dashboard, click **"Add application"**
2. Select **GitHub** as the source
3. Authorize CodeMagic to access your repositories
4. Select the **dq-reader** repository
5. Click **"Finish: Add application"**

### Step 2: Select Project Type

1. CodeMagic will detect it's a **Capacitor** project
2. Confirm the detection
3. The `codemagic.yaml` file in the repository will be automatically detected

---

## Environment Variables Configuration

You need to configure environment variables for Firebase and signing credentials.

### Step 1: Create Environment Variable Groups

1. In CodeMagic, go to **Teams** → **Your Team** → **Integrations**
2. Scroll to **Environment variables**
3. Click **"Add variable group"**

### Step 2: Firebase Credentials Group

Create a group named **`firebase_credentials`** with these variables:

| Variable Name | Value | Secure |
|---------------|-------|--------|
| `FIREBASE_API_KEY` | Your Firebase API Key | ✓ |
| `FIREBASE_AUTH_DOMAIN` | `your-project.firebaseapp.com` | ✗ |
| `FIREBASE_PROJECT_ID` | Your Firebase Project ID | ✗ |
| `FIREBASE_STORAGE_BUCKET` | `your-project.appspot.com` | ✗ |
| `FIREBASE_MESSAGING_SENDER_ID` | Your Sender ID | ✓ |
| `FIREBASE_APP_ID` | Your App ID | ✓ |
| `FIREBASE_MEASUREMENT_ID` | Your Measurement ID | ✓ |

**How to get Firebase values:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click the gear icon → **Project settings**
4. Scroll to **Your apps** → Select Web app
5. Copy the config values

---

## Android Build Setup

### Step 1: Generate Android Signing Key

On your local machine, run:

```bash
keytool -genkey -v -keystore dq-reader-release.keystore \
  -alias dq-reader -keyalg RSA -keysize 2048 -validity 10000
```

**Important:** Save the keystore password and key alias password!

### Step 2: Upload Keystore to CodeMagic

1. In CodeMagic, go to **Teams** → **Code signing identities**
2. Click **"Android"** tab
3. Click **"Upload keystore"**
4. Upload the `dq-reader-release.keystore` file
5. Enter:
   - **Keystore password**
   - **Key alias**: `dq-reader`
   - **Key password**
6. Name it: `dq_reader_keystore`

### Step 3: Google Play Service Account (Optional, for auto-publishing)

If you want to auto-publish to Google Play:

1. Create a service account in Google Cloud Console
2. Download the JSON key
3. In CodeMagic, go to **Teams** → **Integrations**
4. Click **"Google Play"** → **"Add key"**
5. Upload the JSON file
6. Save as `GCLOUD_SERVICE_ACCOUNT_CREDENTIALS`

### Step 4: Add google-services.json

1. Download `google-services.json` from Firebase Console:
   - Go to Project settings → Your apps → Android app
   - Click **"Download google-services.json"**
2. Add it to your repository at: `android/app/google-services.json`
3. Commit and push:
   ```bash
   git add android/app/google-services.json
   git commit -m "Add google-services.json for Android"
   git push
   ```

---

## iOS Build Setup

### Step 1: App Store Connect API Key

1. Go to [App Store Connect](https://appstoreconnect.apple.com/)
2. Click **Users and Access** → **Keys**
3. Click **"+"** to generate a new key
4. Name it: `DQ Reader CodeMagic`
5. Select **Access**: **App Manager**
6. Download the `.p8` file (only available once!)
7. Note the **Issuer ID** and **Key ID**

### Step 2: Add API Key to CodeMagic

1. In CodeMagic, go to **Teams** → **Integrations**
2. Click **"App Store Connect"**
3. Click **"Add key"**
4. Enter:
   - **Issuer ID**
   - **Key ID**
   - Upload the `.p8` file
5. Name it: `dq_reader_api_key`

### Step 3: iOS Certificate and Provisioning Profile

CodeMagic can auto-manage these, but you need to:

1. In CodeMagic, under **iOS code signing**, select:
   - **Distribution type**: `App Store`
   - **Bundle identifier**: `com.nurulquran.dq`
2. CodeMagic will automatically generate/fetch certificates

**OR manually upload:**

1. Generate certificates in Apple Developer Portal
2. Export from Xcode
3. Upload to CodeMagic under **Code signing identities** → **iOS**

### Step 4: Add GoogleService-Info.plist

1. Download `GoogleService-Info.plist` from Firebase Console:
   - Go to Project settings → Your apps → iOS app
   - Click **"Download GoogleService-Info.plist"**
2. Add it to your repository at: `ios/App/App/GoogleService-Info.plist`
3. Commit and push:
   ```bash
   git add ios/App/App/GoogleService-Info.plist
   git commit -m "Add GoogleService-Info.plist for iOS"
   git push
   ```

### Step 5: Update App Store ID in codemagic.yaml

1. Open `codemagic.yaml`
2. Find the line: `APP_STORE_APPLE_ID: 1234567890`
3. Replace `1234567890` with your actual App Store ID from App Store Connect
4. Commit and push

---

## Web Build Setup

The web build is the simplest - it just needs Firebase credentials which are already configured.

### Optional: Deploy to Vercel/Netlify

If you want to auto-deploy:

#### For Vercel:

1. Get Vercel token from https://vercel.com/account/tokens
2. Add to CodeMagic environment variables:
   - `VERCEL_TOKEN`: Your token
   - `VERCEL_ORG_ID`: Your org ID
   - `VERCEL_PROJECT_ID`: Your project ID

#### For Netlify:

1. Get Netlify token from https://app.netlify.com/user/applications
2. Add to CodeMagic environment variables:
   - `NETLIFY_AUTH_TOKEN`: Your token
   - `NETLIFY_SITE_ID`: Your site ID

---

## First Build

### Step 1: Trigger Builds

1. Go to your app in CodeMagic
2. You'll see 3 workflows:
   - **android-workflow**
   - **ios-workflow**
   - **web-workflow**

3. Click **"Start new build"** for each workflow
4. Select **main** branch
5. Click **"Start build"**

### Step 2: Monitor Build

1. Watch the build logs in real-time
2. Check each step for errors
3. First build may take 15-30 minutes

### Step 3: Download Artifacts

Once builds complete successfully:

**Android:**
- Download APK from **Artifacts** section
- Or auto-published to Google Play Internal Testing

**iOS:**
- Download IPA from **Artifacts** section
- Or auto-published to TestFlight

**Web:**
- Download `dist` folder from **Artifacts**
- Deploy to your hosting provider

---

## Build Triggers

Builds are automatically triggered on:

- **Push to `main` branch** - Production builds
- **Push to `develop` branch** - Development builds
- **Pull requests** - Preview builds
- **Git tags** - Release builds

You can modify triggers in `codemagic.yaml` under `triggering` section.

---

## Troubleshooting

### Common Issues

#### Issue 1: "Environment variable not found"

**Solution:**
1. Go to Teams → Integrations → Environment variables
2. Ensure `firebase_credentials` group exists
3. Verify all variables are added
4. Re-run the build

#### Issue 2: Android build fails with "SDK not found"

**Solution:**
- CodeMagic should auto-install Android SDK
- Check build logs for specific error
- Verify `ANDROID_SDK_ROOT` is set in build scripts

#### Issue 3: iOS build fails with "Certificate not found"

**Solution:**
1. Verify App Store Connect API key is added
2. Check bundle ID matches: `com.nurulquran.dq`
3. Ensure certificates are not expired
4. Try CodeMagic's automatic certificate management

#### Issue 4: Build timeout

**Solution:**
- Increase `max_build_duration` in `codemagic.yaml`
- Optimize build by caching dependencies
- Use faster instance type (upgrade plan if needed)

#### Issue 5: Web build succeeds but app doesn't work

**Solution:**
1. Check browser console for errors
2. Verify all Firebase environment variables are set
3. Ensure `.env` file is created in build script
4. Check that `dist` folder contains all assets

### Build Optimization

To speed up builds:

1. **Enable caching** (add to workflows):
   ```yaml
   cache:
     cache_paths:
       - $HOME/.npm
       - $HOME/.gradle
       - $HOME/Library/Caches/CocoaPods
   ```

2. **Use faster instance types**:
   - `mac_mini_m1` for iOS/Android (fastest)
   - `linux_x2` for web builds

3. **Parallel builds**:
   - Enable in Teams → Settings → Concurrent builds

---

## Post-Build Actions

### Android

1. Test the APK on a real device
2. Submit to Google Play for review
3. Configure release rollout (10% → 50% → 100%)

### iOS

1. Test the IPA via TestFlight
2. Submit to App Store for review
3. Configure phased release

### Web

1. Deploy `dist` folder to hosting
2. Test on staging environment
3. Deploy to production

---

## Build Badges

Add build status badges to your README:

```markdown
[![Android Build](https://api.codemagic.io/apps/{app-id}/workflows/android-workflow/status_badge.svg)](https://codemagic.io/apps/{app-id}/workflows/android-workflow/latest_build)
[![iOS Build](https://api.codemagic.io/apps/{app-id}/workflows/ios-workflow/status_badge.svg)](https://codemagic.io/apps/{app-id}/workflows/ios-workflow/latest_build)
[![Web Build](https://api.codemagic.io/apps/{app-id}/workflows/web-workflow/status_badge.svg)](https://codemagic.io/apps/{app-id}/workflows/web-workflow/latest_build)
```

Replace `{app-id}` with your CodeMagic app ID.

---

## Support

- **CodeMagic Docs**: https://docs.codemagic.io/
- **CodeMagic Support**: support@codemagic.io
- **Project Support**: it@nrq.no

---

## Quick Reference

### Essential Commands

```bash
# Build locally first to test
npm install
npm run build
npx cap sync

# Android local build
cd android && ./gradlew assembleRelease

# iOS local build (Mac only)
cd ios/App && pod install
xcodebuild -workspace App.xcworkspace -scheme App -configuration Release
```

### File Locations

- **CodeMagic Config**: `codemagic.yaml`
- **Android Config**: `android/app/build.gradle`
- **iOS Config**: `ios/App/App.xcodeproj`
- **Capacitor Config**: `capacitor.config.ts`
- **Environment Template**: `.env.example`

---

## Checklist Before First Build

- [ ] CodeMagic account created
- [ ] Repository connected
- [ ] Firebase credentials added to environment variables
- [ ] Android keystore uploaded (for Android)
- [ ] App Store Connect API key added (for iOS)
- [ ] `google-services.json` added to Android project
- [ ] `GoogleService-Info.plist` added to iOS project
- [ ] App Store ID updated in `codemagic.yaml`
- [ ] Email notification recipient updated (`it@nrq.no`)
- [ ] All code committed and pushed to `main` branch

---

## Next Steps

After successful builds:

1. **Test thoroughly** on both platforms
2. **Set up automated testing** in CodeMagic
3. **Configure deployment** to stores
4. **Monitor build performance** and optimize
5. **Set up notifications** (Slack, Discord, etc.)

Good luck with your builds! 🚀
