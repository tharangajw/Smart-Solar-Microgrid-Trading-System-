package com.smartsolar.modules.splash

import android.animation.Animator
import android.animation.AnimatorListenerAdapter
import android.animation.ObjectAnimator
import android.content.Intent
import android.os.Bundle
import android.view.View
import android.view.animation.DecelerateInterpolator
import androidx.appcompat.app.AppCompatActivity
import com.google.android.material.progressindicator.LinearProgressIndicator
import com.smartsolar.R
import com.smartsolar.modules.onboarding.OnboardingActivity

class SplashActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_splash)

        val progressIndicator = findViewById<LinearProgressIndicator>(R.id.loadingProgress)
        val statusContainer = findViewById<View>(R.id.statusContainer)

        val progressAnimator = ObjectAnimator.ofInt(progressIndicator, "progress", 0, 100)
        progressAnimator.duration = 2500
        progressAnimator.interpolator = DecelerateInterpolator()

        progressAnimator.addListener(object : AnimatorListenerAdapter() {
            override fun onAnimationEnd(animation: Animator) {
                statusContainer.animate()
                    .alpha(1f)
                    .setDuration(300)
                    .setListener(object : AnimatorListenerAdapter() {
                        override fun onAnimationEnd(animation: Animator) {
                            statusContainer.postDelayed({
                                startActivity(Intent(this@SplashActivity, OnboardingActivity::class.java))
                                overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out)
                                finish()
                            }, 500)
                        }
                    })
            }
        })

        progressAnimator.start()
    }
}