```powershell

# Windows Setup Script for DQ Reader

 

Write-Host "=== DQ Reader Windows Setup ===" -ForegroundColor Green

 

# Check Android SDK

$sdkPath = "C:\Users\$env:USERNAME\AppData\Local\Android\Sdk"

if (Test-Path $sdkPath) {

    Write-Host "✓ Android SDK found at: $sdkPath" -ForegroundColor Green

 

    # Create local.properties

    $propContent = "sdk.dir=$sdkPath"

    $propContent | Out-File -FilePath "android\local.properties" -Encoding ASCII

    Write-Host "✓ Created android\local.properties" -ForegroundColor Green

} else {

    Write-Host "✗ Android SDK not found at default location" -ForegroundColor Red

    Write-Host "  Please find SDK location in Android Studio settings" -ForegroundColor Yellow

    exit 1

}

 

# Check .env file

if (Test-Path ".env") {

    Write-Host "✓ .env file exists" -ForegroundColor Green

} else {

    if (Test-Path ".env.example") {

        Copy-Item ".env.example" ".env"

        Write-Host "✓ Created .env from template" -ForegroundColor Green

        Write-Host "  Please edit .env with your Firebase credentials" -ForegroundColor Yellow

        notepad .env

    } else {

        Write-Host "✗ .env file missing" -ForegroundColor Red

        Write-Host "  Please create .env with Firebase credentials" -ForegroundColor Yellow

    }

}

 

Write-Host "`n=== Setup Complete ===" -ForegroundColor Green

Write-Host "Next steps:" -ForegroundColor Cyan

Write-Host "1. Verify .env has your Firebase credentials"

Write-Host "2. Run: npm install"

Write-Host "3. Run: npm run build"

Write-Host "4. Run: npx cap sync android"

Write-Host "5. Run: cd android && .\gradlew.bat assembleDebug"

```