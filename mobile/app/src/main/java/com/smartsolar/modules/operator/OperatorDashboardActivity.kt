package com.smartsolar.modules.operator

/*
 * OperatorDashboardActivity.kt
 * Operational dashboard for Grid Operators.
 * Sections: Grid Analytics, Operational Tools, and Booking Management.
 * Parses C# OperatorDashboardStats & operator/reservations directly for live data.
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
            var approvedFutureCount = 0

            // 1. Fetch C# operator/dashboard or operator-dashboard/dashboard
            var dashResponse = ApiClient.get(this@OperatorDashboardActivity, "operator/dashboard")
            if (dashResponse == null || !dashResponse.trim().startsWith("{")) {
                dashResponse = ApiClient.get(this@OperatorDashboardActivity, "operator-dashboard/dashboard")
            }

            if (dashResponse != null && dashResponse.trim().startsWith("{")) {
                try {
                    val json = JSONObject(dashResponse)
                    pendingCount = json.optInt("pendingCount", json.optInt("PendingCount", 0))
                    approvedCount = json.optInt("approvedCount", json.optInt("ApprovedCount", 0))
                    val completed = json.optInt("completedCount", json.optInt("CompletedCount", 0))
                    val cancelled = json.optInt("cancelledCount", json.optInt("CancelledCount", 0))
                    historyCount = completed + cancelled
                    approvedFutureCount = json.optInt("approvedFutureCount", json.optInt("ApprovedFutureCount", approvedCount))

                    val slots = json.optString("availableSlots", json.optString("batteryStatus", ""))
                    if (slots.isNotEmpty() && slots != "0") batteryVal = slots
                } catch (_: Exception) {}
            }

            // 2. Fetch live system reservations via multi-endpoint fallback chain
            var resResponse = ApiClient.get(this@OperatorDashboardActivity, "operator/reservations")
            if (resResponse == null || resResponse.trim() == "[]" || resResponse.trim() == "{}") {
                resResponse = ApiClient.get(this@OperatorDashboardActivity, "operator-dashboard/bookings")
            }
            if (resResponse == null || resResponse.trim() == "[]" || resResponse.trim() == "{}") {
                resResponse = ApiClient.get(this@OperatorDashboardActivity, "Reservations/search")
            }
            if (resResponse == null || resResponse.trim() == "[]" || resResponse.trim() == "{}") {
                resResponse = ApiClient.get(this@OperatorDashboardActivity, "Reservations/pending")
            }

            if (resResponse != null && resResponse.trim().isNotEmpty()) {
                try {
                    val array = parseJsonArray(resResponse)
                    var pCount = 0
                    var aCount = 0
                    var hCount = 0

                    for (i in 0 until array.length()) {
                        val item = array.getJSONObject(i)
                        val id = item.optString("id", item.optString("_id", ""))
                        val localStatus = SessionManager(this@OperatorDashboardActivity).getReservationStatus(id)
                        val status = if (!localStatus.isNullOrEmpty()) localStatus else item.optString("status", "Pending")

                        when {
                            status.equalsIgnoreCase("Pending") -> pCount++
                            status.equalsIgnoreCase("Approved") -> aCount++
                            status.equalsIgnoreCase("Completed") || status.equalsIgnoreCase("Cancelled") || status.equalsIgnoreCase("Done") -> hCount++
                            else -> pCount++
                        }
                    }

                    pendingCount = pCount
                    approvedCount = aCount
                    historyCount = hCount
                    if (approvedFutureCount == 0) approvedFutureCount = aCount
                } catch (_: Exception) {}
            }

            // 3. Battery Capacity from Nodes if needed
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

            val currentCount = approvedCount + pendingCount
            val fmtPending = if (pendingCount < 10) "0$pendingCount" else pendingCount.toString()
            val fmtApproved = if (approvedFutureCount < 10) "0$approvedFutureCount" else approvedFutureCount.toString()
            val fmtHistory = if (historyCount < 10) "0$historyCount" else historyCount.toString()
            val fmtCurrent = if (currentCount < 10) "0$currentCount" else currentCount.toString()
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

    private fun String.equalsIgnoreCase(other: String): Boolean = this.equals(other, ignoreCase = true)
}
