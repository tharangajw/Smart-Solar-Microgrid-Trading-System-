package sliit.ead.smartsolarmicrogrid.modules.operator;

import android.os.Bundle;
import android.widget.Button;
import android.widget.Toast;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;

import sliit.ead.smartsolarmicrogrid.R;

public class QrScannerActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_qr_scanner);

        Button buttonSimulateScan = findViewById(R.id.buttonSimulateScan);

        buttonSimulateScan.setOnClickListener(v -> {
            String dummyQrData = "BOOKING_ID_12345";
            processScannedData(dummyQrData);
        });
    }

    private void processScannedData(String qrData) {
        new AlertDialog.Builder(this)
            .setTitle("Booking Verified")
            .setMessage("Scanned Data: " + qrData + "\nServer verification successful. Finalize energy transfer?")
            .setPositiveButton("Finalize Transfer", (dialog, which) -> {
                Toast.makeText(this, "Transfer Finalized", Toast.LENGTH_SHORT).show();
                finish();
            })
            .setNegativeButton("Cancel", null)
            .show();
    }
}
