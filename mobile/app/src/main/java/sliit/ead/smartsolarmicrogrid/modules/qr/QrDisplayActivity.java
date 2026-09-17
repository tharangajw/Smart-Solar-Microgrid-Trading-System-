package sliit.ead.smartsolarmicrogrid.modules.qr;

import android.os.Bundle;
import android.widget.Button;
import android.widget.ImageView;
import androidx.appcompat.app.AppCompatActivity;

import sliit.ead.smartsolarmicrogrid.R;

public class QrDisplayActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_qr_display);

        ImageView imageViewQrCode = findViewById(R.id.imageViewQrCode);
        Button buttonDone = findViewById(R.id.buttonDone);

        buttonDone.setOnClickListener(v -> {
            finish();
        });
    }
}
