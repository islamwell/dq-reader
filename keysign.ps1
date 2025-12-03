<# --------------------------------------------------------------
   Build‑PlayStoreRelease.ps1
   Generates a signed Android release (APK & AAB) for the DQ Quran app.
   Run from the project root: C:\gitprevious\dq\wscreen\dq-reader
   -------------------------------------------------------------- #>

# --------------------------------------------------------------
# 1️⃣  USER‑CONFIGURABLE SETTINGS
# --------------------------------------------------------------
$KeystorePassword = "readquran"   # <-- CHANGE ME
$KeyPassword     = "readquran"       # <-- CHANGE ME
$KeyAlias        = "dq"
$KeystorePath    = Join-Path -Path $PSScriptRoot -ChildPath "android\app\keystore\release.keystore"

# --------------------------------------------------------------
# 2️⃣  CREATE keystore folder (if missing) & generate keystore
# --------------------------------------------------------------
$KeystoreFolder = Split-Path $KeystorePath -Parent
if (-not (Test-Path $KeystoreFolder)) {
    Write-Host "Creating keystore folder: $KeystoreFolder"
    New-Item -ItemType Directory -Path $KeystoreFolder | Out-Null
}

if (-not (Test-Path $KeystorePath)) {
    Write-Host "Generating new keystore at $KeystorePath ..."
    $keytoolArgs = @(
        "-genkeypair"
        "-v"
        "-keystore `"$KeystorePath`""
        "-storetype PKCS12"
        "-alias $KeyAlias"
        "-keyalg RSA"
        "-keysize 2048"
        "-validity 10000"
        "-storepass $KeystorePassword"
        "-keypass $KeyPassword"
        "-dname `"`"CN=Your Name, OU=Your Org Unit, O=Your Organization, L=Your City, S=Your State, C=US`"`""
    )
    & keytool $keytoolArgs
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Keystore generation failed. Abort."
        exit 1
    }
} else {
    Write-Host "Keystore already exists – skipping generation."
}

# --------------------------------------------------------------
# 3️⃣  INSERT signing config into android/app/build.gradle (if missing)
# --------------------------------------------------------------
$GradleFile = Join-Path -Path $PSScriptRoot -ChildPath "android\app\build.gradle"
if (-not (Test-Path $GradleFile)) {
    Write-Error "Cannot find $GradleFile – abort."
    exit 1
}

$gradleContent = Get-Content $GradleFile -Raw

# Helper to detect if the signing block already exists
$signingBlockPattern = [regex]::Escape("signingConfigs {") + ".*?" + [regex]::Escape("release {")
if ($gradleContent -match $signingBlockPattern) {
    Write-Host "Signing configuration already present – skipping edit."
} else {
    Write-Host "Injecting signing configuration into build.gradle ..."
    # Find the first occurrence of the opening "android {" block
    $androidBlockIdx = $gradleContent.IndexOf("android {")
    if ($androidBlockIdx -lt 0) {
        Write-Error "Could not locate 'android {' block – abort."
        exit 1
    }

    # Build the snippet to insert (proper indentation)
    $signingSnippet = @"
    signingConfigs {
        release {
            storeFile file('keystore/release.keystore')
            storePassword "$KeystorePassword"
            keyAlias "$KeyAlias"
            keyPassword "$KeyPassword"
        }
    }

    buildTypes {
        release {
            signingConfig signingConfigs.release
            // Uncomment the next two lines if you want code shrinking/obfuscation
            // minifyEnabled true
            // proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
        debug {
            // keep default debug signing
        }
    }
"@

    # Insert the snippet right after the opening "android {" line
    $before = $gradleContent.Substring(0, $androidBlockIdx + "android {".Length)
    $after  = $gradleContent.Substring($androidBlockIdx + "android {".Length)
    $newGradle = $before + "`n$signingSnippet`n" + $after

    # Write back
    Set-Content -Path $GradleFile -Value $newGradle -Encoding UTF8
    Write-Host "build.gradle updated successfully."
}

# --------------------------------------------------------------
# 4️⃣  BUILD the web assets (Vite) and sync Capacitor
# --------------------------------------------------------------
Write-Host "`n=== Building web assets (npm run build) ==="
Push-Location $PSScriptRoot
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Error "npm run build failed – abort."
    Pop-Location
    exit 1
}
Write-Host "`n=== Syncing Capacitor Android project ==="
npx cap sync android
if ($LASTEXITCODE -ne 0) {
    Write-Error "npx cap sync android failed – abort."
    Pop-Location
    exit 1
}
Pop-Location

# --------------------------------------------------------------
# 5️⃣  RUN Gradle release build (AAB & APK)
# --------------------------------------------------------------
$AndroidDir = Join-Path -Path $PSScriptRoot -ChildPath "android"
Push-Location $AndroidDir

Write-Host "`n=== Building signed AAB (bundleRelease) ==="
.\gradlew.bat bundleRelease
if ($LASTEXITCODE -ne 0) {
    Write-Error "Gradle bundleRelease failed – abort."
    Pop-Location
    exit 1
}

Write-Host "`n=== Building signed APK (assembleRelease) ==="
.\gradlew.bat assembleRelease
if ($LASTEXITCODE -ne 0) {
    Write-Error "Gradle assembleRelease failed – abort."
    Pop-Location
    exit 1
}
Pop-Location

# --------------------------------------------------------------
# 6️⃣  REPORT output locations
# --------------------------------------------------------------
$aabPath = Join-Path -Path $AndroidDir -ChildPath "app\build\outputs\bundle\release\app-release.aab"
$apkPath = Join-Path -Path $AndroidDir -ChildPath "app\build\outputs\apk\release\app-release.apk"

Write-Host "`n=== Build finished! ==="
Write-Host "AAB (for Play Store): $aabPath"
Write-Host "APK (debug install):   $apkPath"
Write-Host "`nYou can now upload the AAB to the Google Play Console."