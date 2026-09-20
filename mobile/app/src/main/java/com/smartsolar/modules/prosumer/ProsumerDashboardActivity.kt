package com.smartsolar.modules.prosumer

/*
 * ProsumerDashboardActivity.kt
 * Main dashboard for Solar Prosumers.
 * Shows energy stats, active/pending counts, and navigation to Map, Booking, and History.
 * Author: Member 4 – Operator Product
 */

import android.content.Intent
import android.os.Bundle
import android.os.StrictMode
import android.view.View
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import com.smartsolar.R
import com.smartsolar.modules.authentication.ProfileActivity
// Imports for reservations and history removed
import com.smartsolar.modules.map.StationMapActivity
import com.smartsolar.utils.SessionManager

class ProsumerDashboardActivity : AppCompatActivity() {

    private lateinit var prosumerRepository: ProsumerRepository

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_prosumer_dashboard)

        // Native Android Policy for main-thread network (Assignment scope convenience)
        val policy = StrictMode.ThreadPolicy.Builder().permitAll().build()
        StrictMode.setThreadPolicy(policy)

        prosumerRepository = ProsumerRepository(this)

        val textViewName = findViewById<TextView>(R.id.textViewName)
        val textEnergySold = findViewById<TextView>(R.id.textViewEnergySoldValue)
        val textEarnings = findViewById<TextView>(R.id.textViewEarningsValue)
        val textBookingCounts = findViewById<TextView>(R.id.textViewBookingCounts)

        // Load identity from SessionManager (Persistent store)
        val session = SessionManager(this)
        textViewName.text = "${session.getName() ?: "Prosumer"}!"

        // Fetch dashboard stats from central API
        val stats = prosumerRepository.getDashboardStats()
        textEnergySold.text = "${stats["energySold"] ?: "0"} kWh"
        textEarnings.text = "LKR ${stats["earnings"] ?: "0"}"
        
        val pending = stats["pendingBookings"] ?: "0"
        val approved = stats["approvedFutureCount"] ?: "0"
        textBookingCounts.text = "$pending / $approved"

        // Navigation actions
        findViewById<View>(R.id.buttonProfile).setOnClickListener {
            startActivity(Intent(this, ProfileActivity::class.java))
        }

        findViewById<View>(R.id.buttonMap).setOnClickListener {
            startActivity(Intent(this, StationMapActivity::class.java))
        }

        // Reservations and History navigation removed per user request

        findViewById<View>(R.id.buttonLogout).setOnClickListener {
            logout()
        }
    }

    /** Clear session and return to Login */
    private fun logout() {
        SessionManager(this).logout()
        val intent = Intent(this, com.smartsolar.modules.authentication.LoginActivity::class.java)
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        startActivity(intent)
        finish()
    }
}
