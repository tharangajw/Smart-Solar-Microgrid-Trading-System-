package com.smartsolar.modules.reservations

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.smartsolar.R
import com.smartsolar.modules.qr.QRDisplayActivity

class CreateReservationActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_reservation_form)

        val buttonSubmit = findViewById<Button>(R.id.buttonSubmit)

        buttonSubmit.setOnClickListener {
            Toast.makeText(this, "Booking Successful", Toast.LENGTH_SHORT).show()
            startActivity(Intent(this, QRDisplayActivity::class.java))
            finish()
        }
    }
}