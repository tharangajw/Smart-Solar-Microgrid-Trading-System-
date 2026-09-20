package com.smartsolar.modules.operator

/*
 * OperatorDashboardActivity.kt
 * Operational dashboard for Grid Operators.
 * Monitors station status and launches QR verification tools.
 * Author: Member 4 – Operator Product
 */

import android.content.Intent
import android.os.Bundle
import android.os.StrictMode
import android.view.View
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import com.smartsolar.R
import com.smartsolar.data.remote.ApiClient
import com.smartsolar.modules.qr.QRScannerActivity
import com.smartsolar.utils.SessionManager
import org.json.JSONObject

class OperatorDashboardActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_operator_dashboard)

        val policy = StrictMode.ThreadPolicy.Builder().permitAll().build()
        StrictMode.setThreadPolicy(policy)

        val buttonScanQr = findViewById<Button>(R.id.buttonScanQr)
        val buttonViewMap = findViewById<Button>(R.id.buttonViewMap)
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
        
        buttonLogout.setOnClickListener {
            logout()
        }
    }

    /** Fetches station status and pending counts from API */
    private fun loadOperatorStats(textBattery: TextView, textJobs: TextView) {
        val response = ApiClient.get(this, "operator/dashboard")
        if (response != null) {
            try {
                val json = JSONObject(response)
                textBattery.text = json.optString("availableSlots", "0")
                textJobs.text = json.optString("pendingCount", "0")
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
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
