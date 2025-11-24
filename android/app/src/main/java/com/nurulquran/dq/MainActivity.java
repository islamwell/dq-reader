package com.nurulquran.dq;

import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

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
    }
}
