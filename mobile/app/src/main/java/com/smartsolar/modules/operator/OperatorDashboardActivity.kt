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
import androidx.lifecycle.lifecycleScope
import com.smartsolar.modules.common.BaseNavActivity
import com.smartsolar.R
import com.smartsolar.data.remote.ApiClient
import com.smartsolar.modules.qr.QRScannerActivity
import com.smartsolar.utils.SessionManager
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONObject

class OperatorDashboardActivity : BaseNavActivity() {

    override fun getLayoutResourceId() = R.layout.activity_operator_dashboard
    override fun getMenuItemId() = R.id.nav_home

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val session = SessionManager(this)
        val name = session.getName() ?: "Operator"
        findViewById<TextView>(R.id.textViewGreeting).text = "Hello, $name!"

        val buttonScanQr = findViewById<View>(R.id.buttonScanQr)
        val buttonViewMap = findViewById<View>(R.id.buttonViewMap)
        val textBattery = findViewById<TextView>(R.id.textViewAvailableBattery)
        val textJobs = findViewById<TextView>(R.id.textViewPendingJobs)

        // Load statistics from Web Service
        loadOperatorStats(textBattery, textJobs)

        buttonScanQr.setOnClickListener {
            startActivity(Intent(this, QRScannerActivity::class.java))
        }

        buttonViewMap.setOnClickListener {
            startActivity(Intent(this, com.smartsolar.modules.map.StationMapActivity::class.java))
        }
    }

    /** Fetches station status and pending counts from API */
    private fun loadOperatorStats(textBattery: TextView, textJobs: TextView) {
        lifecycleScope.launch(Dispatchers.IO) {
            val response = ApiClient.get(this@OperatorDashboardActivity, "operator/dashboard")
            if (response != null) {
                try {
                    val json = JSONObject(response)
                    val slots = json.optString("availableSlots", "0")
                    val pending = json.optString("pendingCount", "0")
                    
                    // Parse counts safely to avoid crashes
                    val pendingInt = pending.toIntOrNull() ?: 0
                    val pendingDisplay = if (pendingInt < 10) "0$pendingInt" else pendingInt.toString()
                    val batteryDisplay = if (slots.toDoubleOrNull() != null) "$slots kWh" else slots

                    withContext(Dispatchers.Main) {
                        textBattery.text = batteryDisplay
                        textJobs.text = pendingDisplay
                    }
                } catch (e: Exception) {
                    android.util.Log.e("OperatorDashboard", "Parsing error", e)
                }
            }
        }
    }
}
