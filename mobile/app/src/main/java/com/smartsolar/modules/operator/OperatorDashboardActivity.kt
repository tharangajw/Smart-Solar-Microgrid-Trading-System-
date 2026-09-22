package com.smartsolar.modules.operator

/*
 * OperatorDashboardActivity.kt
 * Operational dashboard for Grid Operators.
 * Sections: Grid Analytics, Operational Tools, and Booking Management.
 * Author: Member 4 – Operator Product
 */

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.TextView
import androidx.lifecycle.lifecycleScope
import com.smartsolar.R
import com.smartsolar.data.remote.ApiClient
import com.smartsolar.modules.common.BaseNavActivity
import com.smartsolar.modules.map.StationMapActivity
import com.smartsolar.modules.prosumer.MyBookingsActivity
import com.smartsolar.modules.prosumer.SearchBookingActivity
import com.smartsolar.modules.qr.QRScannerActivity
import com.smartsolar.utils.SessionManager
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject

class OperatorDashboardActivity : BaseNavActivity() {

    override fun getLayoutResourceId() = R.layout.activity_operator_dashboard
    override fun getMenuItemId() = R.id.nav_home

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val session = SessionManager(this)
        val name = session.getName() ?: session.getNic() ?: "Operator"

        val greetingText = findViewById<TextView>(R.id.textViewGreeting) ?: findViewById<TextView>(R.id.textWelcomeName)
        greetingText?.text = "Hello, $name!"
        findViewById<TextView>(R.id.textNic)?.text = "NIC: ${session.getNic() ?: "Operator"}"

        // Operational Tools
        findViewById<View>(R.id.buttonScanQr)?.setOnClickListener {
            startActivity(Intent(this, QRScannerActivity::class.java))
        }

        findViewById<View>(R.id.buttonViewMap)?.setOnClickListener {
            startActivity(Intent(this, StationMapActivity::class.java))
        }

        // Booking Management Cards
        findViewById<View>(R.id.cardCurrentBookings)?.setOnClickListener {
            startActivity(Intent(this, MyBookingsActivity::class.java))
        }

        findViewById<View>(R.id.cardPendingBookings)?.setOnClickListener {
            startActivity(Intent(this, SearchBookingActivity::class.java))
        }

        findViewById<View>(R.id.cardBookingHistory)?.setOnClickListener {
            startActivity(Intent(this, MyBookingsActivity::class.java))
        }

        loadOperatorStats()
    }

    override fun onResume() {
        super.onResume()
        loadOperatorStats()
    }

    /** Fetches station status, counts, and analytics from API */
    private fun loadOperatorStats() {
        val textBattery = findViewById<TextView>(R.id.textViewAvailableBattery)
        val textPending = findViewById<TextView>(R.id.textViewPendingJobs)
        val textApproved = findViewById<TextView>(R.id.textViewApprovedCount)
        val textCountCurrent = findViewById<TextView>(R.id.textCountCurrent)
        val textCountPending = findViewById<TextView>(R.id.textCountPending)
        val textCountHistory = findViewById<TextView>(R.id.textCountHistory)

        lifecycleScope.launch(Dispatchers.IO) {
            var batteryVal = ""
            var pendingCount = 0
            var approvedCount = 0
            var historyCount = 0

            // 1. Fetch operator/dashboard
            val dashResponse = ApiClient.get(this@OperatorDashboardActivity, "operator/dashboard")
            if (dashResponse != null && dashResponse.trim().startsWith("{")) {
                try {
                    val json = JSONObject(dashResponse)
                    val slots = json.optString("availableSlots", json.optString("batteryStatus", ""))
                    if (slots.isNotEmpty() && slots != "0") batteryVal = slots
                } catch (_: Exception) {}
            }

            // 2. Fetch Reservations for analytics & booking management counts
            var resResponse = ApiClient.get(this@OperatorDashboardActivity, "Reservations/pending")
            if (resResponse == null || resResponse.trim() == "[]" || resResponse.trim() == "{}") {
                resResponse = ApiClient.get(this@OperatorDashboardActivity, "Reservations")
            }

            if (resResponse != null && resResponse.trim().isNotEmpty()) {
                try {
                    val array = parseJsonArray(resResponse)
                    for (i in 0 until array.length()) {
                        val item = array.getJSONObject(i)
                        val status = item.optString("status", "Pending")
                        when {
                            status.equals("Pending", ignoreCase = true) -> pendingCount++
                            status.equals("Approved", ignoreCase = true) -> approvedCount++
                            status.equals("Completed", ignoreCase = true) || status.equals("Cancelled", ignoreCase = true) -> historyCount++
                        }
                    }
                } catch (_: Exception) {}
            }

            // 3. Battery Capacity fallback from Nodes if needed
            if (batteryVal.isEmpty()) {
                var nodeResp = ApiClient.get(this@OperatorDashboardActivity, "nodes?status=ACTIVE")
                if (nodeResp == null || nodeResp.trim() == "[]") {
                    nodeResp = ApiClient.get(this@OperatorDashboardActivity, "Nodes")
                }
                if (nodeResp != null && nodeResp.trim().isNotEmpty()) {
                    try {
                        val array = parseJsonArray(nodeResp)
                        var totalCap = 0.0
                        for (i in 0 until array.length()) {
                            val s = array.getJSONObject(i)
                            val cap = s.optDouble("batteryCapacity", s.optDouble("capacityKw", s.optDouble("solarCapacityKw", 25.0)))
                            totalCap += cap
                        }
                        if (totalCap > 0) batteryVal = "${totalCap.toInt()} kWh"
                    } catch (_: Exception) {}
                }
            }

            if (batteryVal.isEmpty()) batteryVal = "100 kWh"

            val fmtPending = if (pendingCount < 10) "0$pendingCount" else pendingCount.toString()
            val fmtApproved = if (approvedCount < 10) "0$approvedCount" else approvedCount.toString()
            val fmtHistory = if (historyCount < 10) "0$historyCount" else historyCount.toString()
            val fmtCurrent = if ((approvedCount + pendingCount) < 10) "0${approvedCount + pendingCount}" else (approvedCount + pendingCount).toString()
            val batteryDisplay = if (batteryVal.contains("kWh", ignoreCase = true)) batteryVal else "$batteryVal kWh"

            withContext(Dispatchers.Main) {
                textBattery?.text = batteryDisplay
                textPending?.text = fmtPending
                textApproved?.text = fmtApproved
                textCountCurrent?.text = fmtCurrent
                textCountPending?.text = fmtPending
                textCountHistory?.text = fmtHistory
            }
        }
    }

    private fun parseJsonArray(json: String): JSONArray {
        val trimmed = json.trim()
        return if (trimmed.startsWith("[")) {
            JSONArray(trimmed)
        } else {
            val obj = JSONObject(trimmed)
            when {
                obj.has("data") -> obj.getJSONArray("data")
                obj.has("value") -> obj.getJSONArray("value")
                else -> JSONArray()
            }
        }
    }
}
