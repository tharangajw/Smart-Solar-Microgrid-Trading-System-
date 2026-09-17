package com.smartsolar.modules.authentication

import android.os.Bundle
import android.widget.Button
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import com.smartsolar.R

class ProfileActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_profile)

        val buttonUpdateProfile = findViewById<Button>(R.id.buttonUpdateProfile)
        val buttonDeactivate = findViewById<Button>(R.id.buttonDeactivate)

        buttonUpdateProfile.setOnClickListener {
            Toast.makeText(this, "Profile updated successfully.", Toast.LENGTH_SHORT).show()
        }

        buttonDeactivate.setOnClickListener {
            AlertDialog.Builder(this)
                .setTitle("Deactivate Account")
                .setMessage("Are you sure you want to request account deactivation? This action will require backoffice approval to reverse.")
                .setPositiveButton("Yes") { _, _ ->
                    Toast.makeText(this, "Deactivation requested.", Toast.LENGTH_SHORT).show()
                    finish()
                }
                .setNegativeButton("No", null)
                .show()
        }
    }
}