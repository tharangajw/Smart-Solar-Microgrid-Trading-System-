package com.smartsolar.modules.prosumer

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import com.smartsolar.R

class BookingSummaryActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_booking_summary)

        val message = intent.getStringExtra("MESSAGE") ?: "Booking Confirmed!"
        findViewById<TextView>(R.id.textSummaryMessage).text = message

        findViewById<Button>(R.id.buttonViewBookings).setOnClickListener {
            val intent = Intent(this, MyBookingsActivity::class.java)
            intent.flags = Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_NEW_TASK
            startActivity(intent)
            finish()
        }

        findViewById<Button>(R.id.buttonHome).setOnClickListener {
            val intent = Intent(this, ProsumerDashboardActivity::class.java)
            intent.flags = Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_NEW_TASK
            startActivity(intent)
            finish()
        }
    }
}
