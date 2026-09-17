package sliit.ead.smartsolarmicrogrid.modules.procumer;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import androidx.appcompat.app.AppCompatActivity;

import sliit.ead.smartsolarmicrogrid.R;
import sliit.ead.smartsolarmicrogrid.modules.history.BookingHistoryActivity;
import sliit.ead.smartsolarmicrogrid.modules.map.MapActivity;
import sliit.ead.smartsolarmicrogrid.modules.reservations.ReservationFormActivity;

public class ProsumerDashboardActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_prosumer_dashboard);

        View buttonProfile = findViewById(R.id.buttonProfile);
        View buttonMap = findViewById(R.id.buttonMap);
        View buttonManageReservations = findViewById(R.id.buttonManageReservations);
        View buttonBookingHistory = findViewById(R.id.buttonBookingHistory);

        buttonProfile.setOnClickListener(v -> {
            startActivity(new Intent(this, ProfileActivity.class));
        });

        buttonMap.setOnClickListener(v -> {
            startActivity(new Intent(this, MapActivity.class));
        });

        buttonManageReservations.setOnClickListener(v -> {
            startActivity(new Intent(this, ReservationFormActivity.class));
        });

        buttonBookingHistory.setOnClickListener(v -> {
            startActivity(new Intent(this, BookingHistoryActivity.class));
        });
    }
}
