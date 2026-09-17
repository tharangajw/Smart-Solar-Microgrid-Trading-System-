package sliit.ead.smartsolarmicrogrid.modules.reservations;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;

import sliit.ead.smartsolarmicrogrid.R;
import sliit.ead.smartsolarmicrogrid.modules.qr.QrDisplayActivity;

public class ReservationFormActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_reservation_form);

        Button buttonSubmit = findViewById(R.id.buttonSubmit);
        
        buttonSubmit.setOnClickListener(v -> {
            Toast.makeText(this, "Booking Successful", Toast.LENGTH_SHORT).show();
            startActivity(new Intent(this, QrDisplayActivity.class));
            finish();
        });
    }
}
