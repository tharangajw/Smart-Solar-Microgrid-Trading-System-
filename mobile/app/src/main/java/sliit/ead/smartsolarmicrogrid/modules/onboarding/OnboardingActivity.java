package sliit.ead.smartsolarmicrogrid.modules.onboarding;


import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.ContextCompat;
import androidx.viewpager2.widget.ViewPager2;
import com.google.android.material.button.MaterialButton;
import sliit.ead.smartsolarmicrogrid.modules.authentication.LoginActivity;
import sliit.ead.smartsolarmicrogrid.R;
import java.util.ArrayList;
import java.util.List;

public class OnboardingActivity extends AppCompatActivity {

    private OnboardingAdapter onboardingAdapter;
    private LinearLayout layoutIndicators;
    private MaterialButton buttonNext;
    private TextView textSkip;
    private View layoutBrandHeader;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Check if onboarding was already shown (temporarily disabled for testing)
        SharedPreferences prefs = getSharedPreferences("SmartSolarPrefs", MODE_PRIVATE);
        // if (prefs.getBoolean("isOnboardingComplete", false)) {
        //     navigateToMain();
        //     return;
        // }

        setContentView(R.layout.activity_onboarding);

        layoutIndicators = findViewById(R.id.layoutIndicators);
        buttonNext = findViewById(R.id.buttonNext);
        textSkip = findViewById(R.id.textSkip);
        layoutBrandHeader = findViewById(R.id.layoutBrandHeader);

        setupOnboardingItems();
        ViewPager2 viewPager = findViewById(R.id.viewPager);
        viewPager.setAdapter(onboardingAdapter);
        setupIndicators();
        setCurrentIndicator(0);

        viewPager.registerOnPageChangeCallback(new ViewPager2.OnPageChangeCallback() {
            @Override
            public void onPageSelected(int position) {
                super.onPageSelected(position);
                setCurrentIndicator(position);

                // Show brand header only on the first page
                if (layoutBrandHeader != null) {
                    layoutBrandHeader.setVisibility(position == 0 ? View.VISIBLE : View.GONE);
                }

                if (position == onboardingAdapter.getItemCount() - 1) {
                    buttonNext.setText("Get Started →");
                    textSkip.setVisibility(android.view.View.INVISIBLE);
                } else {
                    buttonNext.setText("Next →");
                    textSkip.setVisibility(android.view.View.VISIBLE);
                }
            }
        });

        buttonNext.setOnClickListener(v -> {
            if (viewPager.getCurrentItem() + 1 < onboardingAdapter.getItemCount()) {
                viewPager.setCurrentItem(viewPager.getCurrentItem() + 1);
            } else {
                completeOnboarding();
            }
        });

        textSkip.setOnClickListener(v -> completeOnboarding());
    }

    private void setupOnboardingItems() {
        List<OnboardingItem> items = new ArrayList<>();
        items.add(new OnboardingItem(
                R.drawable.slide_welcome,
                "Solar Energy Trading",
                "Join the microgrid and trade excess solar energy with your community."
        ));
        items.add(new OnboardingItem(
                R.drawable.slide_booking,
                "Energy Booking",
                "Reserve energy slots effortlessly and manage your power consumption."
        ));
        items.add(new OnboardingItem(
                R.drawable.slide_qr_grid,
                "QR & Grid Access",
                "Complete transfers securely with QR codes at nearby grid nodes."
        ));
        onboardingAdapter = new OnboardingAdapter(items);
    }

    private void setupIndicators() {
        ImageView[] indicators = new ImageView[onboardingAdapter.getItemCount()];
        LinearLayout.LayoutParams layoutParams = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT
        );
        layoutParams.setMargins(8, 0, 8, 0);
        for (int i = 0; i < indicators.length; i++) {
            indicators[i] = new ImageView(getApplicationContext());
            indicators[i].setImageDrawable(ContextCompat.getDrawable(
                    getApplicationContext(),
                    R.drawable.indicator_inactive
            ));
            indicators[i].setLayoutParams(layoutParams);
            layoutIndicators.addView(indicators[i]);
        }
    }

    private void setCurrentIndicator(int index) {
        int childCount = layoutIndicators.getChildCount();
        for (int i = 0; i < childCount; i++) {
            ImageView imageView = (ImageView) layoutIndicators.getChildAt(i);
            if (i == index) {
                imageView.setImageDrawable(ContextCompat.getDrawable(
                        getApplicationContext(),
                        R.drawable.indicator_active
                ));
            } else {
                imageView.setImageDrawable(ContextCompat.getDrawable(
                        getApplicationContext(),
                        R.drawable.indicator_inactive
                ));
            }
        }
    }

    private void completeOnboarding() {
        SharedPreferences.Editor editor = getSharedPreferences("SmartSolarPrefs", MODE_PRIVATE).edit();
        editor.putBoolean("isOnboardingComplete", true);
        editor.commit();
        navigateToMain();
    }

    private void navigateToMain() {
        startActivity(new Intent(getApplicationContext(), LoginActivity.class));
        finish();
    }
}
