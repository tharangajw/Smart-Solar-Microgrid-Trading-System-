package com.smartsolar.modules.onboarding

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.LinearLayout
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.viewpager2.widget.ViewPager2
import com.google.android.material.button.MaterialButton
import com.smartsolar.R
import com.smartsolar.modules.authentication.LoginActivity
import java.util.ArrayList

class OnboardingActivity : AppCompatActivity() {

    private lateinit var onboardingAdapter: OnboardingAdapter
    private lateinit var layoutIndicators: LinearLayout
    private lateinit var buttonNext: MaterialButton
    private lateinit var textSkip: View

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_onboarding)

        layoutIndicators = findViewById(R.id.layoutIndicators)
        buttonNext = findViewById(R.id.buttonNext)
        textSkip = findViewById(R.id.textSkip)

        setupOnboardingItems()
        val viewPager = findViewById<ViewPager2>(R.id.viewPager)
        viewPager.adapter = onboardingAdapter
        setupIndicators()
        setCurrentIndicator(0)

        viewPager.registerOnPageChangeCallback(object : ViewPager2.OnPageChangeCallback() {
            override fun onPageSelected(position: Int) {
                super.onPageSelected(position)
                setCurrentIndicator(position)
                if (position == (onboardingAdapter.itemCount - 1)) {
                    buttonNext.text = getString(R.string.get_started)
                    textSkip.visibility = View.INVISIBLE
                } else {
                    buttonNext.text = getString(R.string.next)
                    textSkip.visibility = View.VISIBLE
                }
            }
        })

        buttonNext.setOnClickListener {
            if (viewPager.currentItem + 1 < onboardingAdapter.itemCount) {
                viewPager.currentItem += 1
            } else {
                completeOnboarding()
            }
        }

        textSkip.setOnClickListener { completeOnboarding() }
    }

    private fun setupOnboardingItems() {
        val items = ArrayList<OnboardingItem>()
        items.add(OnboardingItem(
            R.drawable.slide_welcome,
            "Solar Energy Trading",
            "Join the microgrid and trade excess solar energy with your community."
        ))
        items.add(OnboardingItem(
            R.drawable.slide_booking,
            "Energy Booking",
            "Reserve energy slots effortlessly and manage your power consumption."
        ))
        items.add(OnboardingItem(
            R.drawable.slide_qr_grid,
            "QR & Grid Access",
            "Complete transfers securely with QR codes at nearby grid nodes."
        ))
        onboardingAdapter = OnboardingAdapter(items)
    }

    private fun setupIndicators() {
        layoutIndicators.removeAllViews()
        val indicators = arrayOfNulls<ImageView>(onboardingAdapter.itemCount)
        val layoutParams = LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.WRAP_CONTENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        )
        layoutParams.setMargins(12, 0, 12, 0)
        for (i in indicators.indices) {
            indicators[i] = ImageView(this)
            indicators[i]?.let {
                it.setImageDrawable(
                    ContextCompat.getDrawable(
                        this,
                        R.drawable.indicator_inactive
                    )
                )
                it.layoutParams = layoutParams
                layoutIndicators.addView(it)
            }
        }
    }

    private fun setCurrentIndicator(index: Int) {
        val childCount = layoutIndicators.childCount
        for (i in 0 until childCount) {
            val imageView = layoutIndicators.getChildAt(i) as ImageView
            if (i == index) {
                imageView.setImageDrawable(
                    ContextCompat.getDrawable(
                        this,
                        R.drawable.indicator_active
                    )
                )
            } else {
                imageView.setImageDrawable(
                    ContextCompat.getDrawable(
                        this,
                        R.drawable.indicator_inactive
                    )
                )
            }
        }
    }

    private fun completeOnboarding() {
        val editor = getSharedPreferences("SmartSolarPrefs", MODE_PRIVATE).edit()
        editor.putBoolean("isOnboardingComplete", true)
        editor.apply()
        navigateToLogin()
    }

    private fun navigateToLogin() {
        val intent = Intent(this, LoginActivity::class.java)
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        startActivity(intent)
        finish()
    }
}