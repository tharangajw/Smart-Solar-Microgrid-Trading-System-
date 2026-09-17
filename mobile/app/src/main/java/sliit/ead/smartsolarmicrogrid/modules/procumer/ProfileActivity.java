package sliit.ead.smartsolarmicrogrid.modules.procumer;

import android.os.Bundle;
import android.widget.Button;
import android.widget.Toast;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;

import sliit.ead.smartsolarmicrogrid.R;

public class ProfileActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_profile);

        Button buttonUpdateProfile = findViewById(R.id.buttonUpdateProfile);
        Button buttonDeactivate = findViewById(R.id.buttonDeactivate);

        buttonUpdateProfile.setOnClickListener(v -> {
            Toast.makeText(this, "Profile updated successfully.", Toast.LENGTH_SHORT).show();
        });

        buttonDeactivate.setOnClickListener(v -> {
            new AlertDialog.Builder(this)
                .setTitle("Deactivate Account")
                .setMessage("Are you sure you want to request account deactivation? This action will require backoffice approval to reverse.")
                .setPositiveButton("Yes", (dialog, which) -> {
                    Toast.makeText(this, "Deactivation requested.", Toast.LENGTH_SHORT).show();
                    finish();
                })
                .setNegativeButton("No", null)
                .show();
        });
    }
}
