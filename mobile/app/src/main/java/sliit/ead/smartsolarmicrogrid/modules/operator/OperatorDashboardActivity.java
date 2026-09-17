package sliit.ead.smartsolarmicrogrid.modules.operator;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;
import androidx.appcompat.app.AppCompatActivity;

import sliit.ead.smartsolarmicrogrid.R;
import sliit.ead.smartsolarmicrogrid.modules.map.MapActivity;

public class OperatorDashboardActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_operator_dashboard);

        Button buttonScanQr = findViewById(R.id.buttonScanQr);
        Button buttonViewMap = findViewById(R.id.buttonViewMap);

        buttonScanQr.setOnClickListener(v -> {
            startActivity(new Intent(this, QrScannerActivity.class));
        });

        buttonViewMap.setOnClickListener(v -> {
            startActivity(new Intent(this, MapActivity.class));
        });
    }
}
