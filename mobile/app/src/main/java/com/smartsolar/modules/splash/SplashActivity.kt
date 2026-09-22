package com.smartsolar.modules.splash

import android.animation.Animator
import android.animation.AnimatorListenerAdapter
import android.animation.ObjectAnimator
import android.content.Intent
import android.os.Bundle
import android.view.View
import android.view.animation.DecelerateInterpolator
import androidx.appcompat.app.AppCompatActivity
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import com.google.android.material.progressindicator.LinearProgressIndicator
import com.smartsolar.R
import com.smartsolar.modules.authentication.LoginActivity
import com.smartsolar.modules.onboarding.OnboardingActivity
import com.smartsolar.modules.operator.OperatorDashboardActivity
import com.smartsolar.modules.prosumer.ProsumerDashboardActivity
import com.smartsolar.utils.SessionManager

class SplashActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        // Install the SplashScreen API for Android 12+
        installSplashScreen()

        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_splash)

        val progressIndicator = findViewById<LinearProgressIndicator>(R.id.loadingProgress)
        val statusContainer = findViewById<View>(R.id.statusContainer)

        val progressAnimator = ObjectAnimator.ofInt(progressIndicator, "progress", 0, 100)
        progressAnimator.duration = 1200
        progressAnimator.interpolator = DecelerateInterpolator()

        progressAnimator.addListener(object : AnimatorListenerAdapter() {
            override fun onAnimationEnd(animation: Animator) {
                statusContainer.animate()
                    .alpha(1f)
                    .setDuration(300)
                    .setListener(object : AnimatorListenerAdapter() {
                        override fun onAnimationEnd(animation: Animator) {
                            statusContainer.postDelayed({
                                navigateNextScreen()
                            }, 300)
                        }
                    })
            }
        })

        progressAnimator.start()
    }

    private fun navigateNextScreen() {
        val sessionManager = SessionManager(this)

        if (sessionManager.isLoggedIn()) {
            // Account is logged in -> Route directly to Dashboard (No Onboarding, No Login)
            val role = sessionManager.getRole() ?: ""
            val isOperator = role.contains("operator", ignoreCase = true) ||
                             role.contains("grid", ignoreCase = true) ||
                             role.contains("station", ignoreCase = true) ||
                             role.contains("admin", ignoreCase = true)

            val destination = if (isOperator) {
                OperatorDashboardActivity::class.java
            } else {
                ProsumerDashboardActivity::class.java
            }

            val intent = Intent(this@SplashActivity, destination)
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            startActivity(intent)
            overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out)
            finish()
        } else {
            // Not logged in -> Check onboarding state
            val prefs = getSharedPreferences("SmartSolarPrefs", MODE_PRIVATE)
            val isOnboardingComplete = prefs.getBoolean("isOnboardingComplete", false)

            val destination = if (isOnboardingComplete) {
                LoginActivity::class.java
            } else {
                OnboardingActivity::class.java
            }

            val intent = Intent(this@SplashActivity, destination)
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            startActivity(intent)
            overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out)
            finish()
        }
    }
}
