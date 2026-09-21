package com.smartsolar.modules.operator

/*
 * OperatorDashboardActivity.kt
 * Operational dashboard for Grid Operators.
 * Monitors station status and launches QR verification tools.
 * Author: Member 4 – Operator Product
 */

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import com.smartsolar.modules.common.BaseNavActivity
import com.smartsolar.R
import com.smartsolar.data.remote.ApiClient
import com.smartsolar.modules.qr.QRScannerActivity
import com.smartsolar.utils.SessionManager
import org.json.JSONObject

class OperatorDashboardActivity : BaseNavActivity() {

    override fun getLayoutResourceId() = R.layout.activity_operator_dashboard
    override fun getMenuItemId() = R.id.nav_home

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val buttonScanQr = findViewById<View>(R.id.buttonScanQr)
        val buttonViewMap = findViewById<View>(R.id.buttonViewMap)
        val textBattery = findViewById<TextView>(R.id.textViewAvailableBattery)
        val textJobs = findViewById<TextView>(R.id.textViewPendingJobs)
        val buttonLogout = findViewById<View>(R.id.buttonLogout)

        // Load statistics from Web Service
        loadOperatorStats(textBattery, textJobs)

        buttonScanQr.setOnClickListener {
            startActivity(Intent(this, QRScannerActivity::class.java))
        }

        buttonViewMap.setOnClickListener {
            startActivity(Intent(this, com.smartsolar.modules.map.StationMapActivity::class.java))
        }

        // Current Bookings and History removed per user request
        
        buttonLogout.setOnClickListener {
            logout()
        }
    }

    /** Fetches station status and pending counts from API */
    private fun loadOperatorStats(textBattery: TextView, textJobs: TextView) {
        Thread {
            val response = ApiClient.get(this, "operator/dashboard")
            runOnUiThread {
                if (response != null) {
                    try {
                        val json = JSONObject(response)
                        // Backend might return availableSlots as a count, UI expects status
                        val slots = json.optString("availableSlots", "0")
                        val pending = json.optString("pendingCount", "0")
                        
                        textBattery.text = if (slots.toIntOrNull() != null) "$slots kWh" else slots
                        textJobs.text = if (pending.toInt() < 10) "0$pending" else pending
                    } catch (e: Exception) {
                        e.printStackTrace()
                    }
                }
            }
        }.start()
    }

    /** Logout logic – clears local persistence */
    private fun logout() {
        SessionManager(this).logout()
        val intent = Intent(this, com.smartsolar.modules.authentication.LoginActivity::class.java)
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        startActivity(intent)
        finish()
    }
}
