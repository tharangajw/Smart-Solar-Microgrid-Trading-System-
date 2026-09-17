package sliit.ead.smartsolarmicrogrid.modules.map;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import androidx.appcompat.app.AppCompatActivity;

import sliit.ead.smartsolarmicrogrid.R;
import sliit.ead.smartsolarmicrogrid.modules.reservations.ReservationFormActivity;

public class MapActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_map);
        
        Button buttonBookSlot = findViewById(R.id.buttonBookSlot);
        
        buttonBookSlot.setOnClickListener(v -> {
            Intent intent = new Intent(this, ReservationFormActivity.class);
            startActivity(intent);
        });
    }
}
