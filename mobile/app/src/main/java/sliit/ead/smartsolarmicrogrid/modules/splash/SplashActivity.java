package sliit.ead.smartsolarmicrogrid.modules.splash;

import android.animation.Animator;
import android.animation.AnimatorListenerAdapter;
import android.animation.ObjectAnimator;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.view.animation.DecelerateInterpolator;
import androidx.appcompat.app.AppCompatActivity;
import com.google.android.material.progressindicator.LinearProgressIndicator;
import sliit.ead.smartsolarmicrogrid.R;
import sliit.ead.smartsolarmicrogrid.modules.onboarding.OnboardingActivity;

public class SplashActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_splash);

        LinearProgressIndicator progressIndicator = findViewById(R.id.loadingProgress);
        View statusContainer = findViewById(R.id.statusContainer);

        // Animate the progress bar from 0 to 100 over 2.5 seconds
        ObjectAnimator progressAnimator = ObjectAnimator.ofInt(progressIndicator, "progress", 0, 100);
        progressAnimator.setDuration(2500);
        progressAnimator.setInterpolator(new DecelerateInterpolator());

        progressAnimator.addListener(new AnimatorListenerAdapter() {
            @Override
            public void onAnimationEnd(Animator animation) {
                // Show "Grid Online" status with a small fade in
                statusContainer.animate()
                        .alpha(1f)
                        .setDuration(300)
                        .setListener(new AnimatorListenerAdapter() {
                            @Override
                            public void onAnimationEnd(Animator animation) {
                                // Short delay after status appears, then navigate
                                statusContainer.postDelayed(() -> {
                                    startActivity(new Intent(SplashActivity.this, OnboardingActivity.class));
                                    overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out);
                                    finish();
                                }, 500);
                            }
                        });
            }
        });

        progressAnimator.start();
    }
}