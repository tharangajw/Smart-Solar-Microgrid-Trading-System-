package com.smartsolar.modules.operator

/*
 * AlertsActivity.kt
 * Displays grid system notifications and prosumer slot reservation alerts for Grid Operators.
 * Author: Member 4 – Operator Product
 */

import android.os.Bundle
import android.view.View
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.smartsolar.R
import com.smartsolar.data.remote.ApiClient
import com.smartsolar.modules.common.BaseNavActivity
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Locale
import java.util.TimeZone

class AlertsActivity : BaseNavActivity() {

    private lateinit var recyclerAlerts: RecyclerView
    private lateinit var layoutEmptyAlerts: View
    private val alertList = mutableListOf<AlertItem>()

    override fun getLayoutResourceId() = R.layout.activity_alerts
    override fun getMenuItemId() = R.id.nav_alerts

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        recyclerAlerts = findViewById(R.id.recyclerAlerts)
        layoutEmptyAlerts = findViewById(R.id.layoutEmptyAlerts)

        recyclerAlerts.layoutManager = LinearLayoutManager(this)

        loadAlerts()
    }

    override fun onResume() {
        super.onResume()
        loadAlerts()
    }

    private fun loadAlerts() {
        lifecycleScope.launch(Dispatchers.IO) {
            // Fetch reservations to generate real-time prosumer alerts
            var response = ApiClient.get(this@AlertsActivity, "Reservations/pending")
            if (response == null || response.trim() == "[]" || response.trim() == "{}") {
                response = ApiClient.get(this@AlertsActivity, "Reservations")
            }

            withContext(Dispatchers.Main) {
                alertList.clear()

                if (response != null && response.trim().isNotEmpty()) {
                    try {
                        val array = parseJsonArray(response)
                        for (i in 0 until array.length()) {
                            val item = array.getJSONObject(i)
                            val id = item.optString("id", item.optString("_id", ""))
                            val nodeId = item.optString("nodeId", "Station Hub")
                            val slotId = item.optString("slotId", "Slot")
                            val status = item.optString("status", "Pending")
                            val rawDate = item.optString("reservationDate", item.optString("createdAt", ""))

                            val cleanSlot = slotId.replace("_", " ").replace("-", " ")
                                .split(" ").joinToString(" ") { it.lowercase().replaceFirstChar { char -> char.uppercase() } }
                            val cleanNode = if (nodeId.length >= 12) "Grid Node (#${nodeId.takeLast(6).uppercase()})" else nodeId

                            val title = if (status.equals("Pending", ignoreCase = true)) {
                                "New Reservation Pending"
                            } else {
                                "Reservation $status"
                            }

                            val message = "Prosumer reserved $cleanSlot at $cleanNode."
                            val formattedTime = formatDateDisplay(rawDate)

                            val icon = when (status.lowercase()) {
                                "pending"   -> "🔔"
                                "approved"  -> "⚡"
                                "completed" -> "✅"
                                "cancelled" -> "❌"
                                else        -> "📢"
                            }

                            alertList.add(AlertItem(id, title, message, formattedTime, status, icon))
                        }
                    } catch (e: Exception) {
                        android.util.Log.e("AlertsActivity", "Parsing error", e)
                    }
                }

                if (alertList.isEmpty()) {
                    recyclerAlerts.visibility = View.GONE
                    layoutEmptyAlerts.visibility = View.VISIBLE
                } else {
                    layoutEmptyAlerts.visibility = View.GONE
                    recyclerAlerts.visibility = View.VISIBLE
                    recyclerAlerts.adapter = AlertAdapter(this@AlertsActivity, alertList)
                }
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

    private fun formatDateDisplay(rawDate: String?): String {
        if (rawDate.isNullOrEmpty() || rawDate == "–") return "Just now"
        return try {
            val clean = rawDate.replace("Z", "")
            val inputFormats = arrayOf(
                "yyyy-MM-dd'T'HH:mm:ss.SSS",
                "yyyy-MM-dd'T'HH:mm:ss",
                "yyyy-MM-dd"
            )
            var date: java.util.Date? = null
            for (fmt in inputFormats) {
                try {
                    val parser = SimpleDateFormat(fmt, Locale.getDefault())
                    parser.timeZone = TimeZone.getTimeZone("UTC")
                    date = parser.parse(clean.take(fmt.length))
                    if (date != null) break
                } catch (_: Exception) {}
            }
            if (date != null) {
                val outFormat = SimpleDateFormat("dd MMM, hh:mm a", Locale.getDefault())
                outFormat.format(date)
            } else {
                rawDate.take(10)
            }
        } catch (_: Exception) {
            rawDate.take(10)
        }
    }
}
