package com.nurulquran.dq;

import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.view.WindowManager;
import android.webkit.WebView;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    private static final String TAG = "DQQuran";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Enable WebView debugging for better error visibility
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            WebView.setWebContentsDebuggingEnabled(true);
            Log.d(TAG, "WebView debugging enabled");
        }

        Log.d(TAG, "DQ Quran app starting...");
        Log.d(TAG, "Android SDK: " + Build.VERSION.SDK_INT);
        Log.d(TAG, "Package: " + getPackageName());

        // Ensure the app content doesn't go under the status bar
        WindowCompat.setDecorFitsSystemWindows(getWindow(), true);

        // Make status bar visible
        getWindow().clearFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN);

        // Set status bar appearance
        WindowInsetsControllerCompat windowInsetsController =
            WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        if (windowInsetsController != null) {
            windowInsetsController.setAppearanceLightStatusBars(true);
        }

        Log.d(TAG, "MainActivity onCreate completed");
    }

    @Override
    protected void onStart() {
        super.onStart();
        Log.d(TAG, "MainActivity onStart");
    }

    @Override
    protected void onResume() {
        super.onResume();
        Log.d(TAG, "MainActivity onResume");
    }
}
