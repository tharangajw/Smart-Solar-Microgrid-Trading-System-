package com.smartsolar.modules.prosumer

import android.content.Intent
import android.graphics.Color
import android.os.Bundle
import android.view.View
import android.widget.ProgressBar
import android.widget.TextView
import androidx.lifecycle.lifecycleScope
import com.smartsolar.R
import com.smartsolar.data.remote.ApiClient
import com.smartsolar.modules.common.BaseNavActivity
import com.smartsolar.utils.SessionManager
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Locale
import java.util.TimeZone

class ProsumerDashboardActivity : BaseNavActivity() {

    override fun getLayoutResourceId() = R.layout.activity_prosumer_dashboard
    override fun getMenuItemId() = R.id.nav_home

    private lateinit var textPendingCount: TextView
    private lateinit var textUpcomingCount: TextView
    private lateinit var cardNextBooking: View
    private lateinit var layoutEmptyNextBooking: View
    private lateinit var progressBar: ProgressBar

    private var textNextDate: TextView? = null
    private var textNextNode: TextView? = null
    private var textNextStatus: TextView? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val session = SessionManager(this)

        // Setup Header
        val name = session.getName() ?: session.getNic() ?: "Prosumer"
        findViewById<TextView>(R.id.textWelcomeName)?.text = "Hello, $name!"
        findViewById<TextView>(R.id.textNic)?.text = "NIC: ${session.getNic()}"

        // Bind Views
        textPendingCount = findViewById(R.id.textPendingCount)
        textUpcomingCount = findViewById(R.id.textUpcomingCount)
        cardNextBooking = findViewById(R.id.cardNextBooking)
        layoutEmptyNextBooking = findViewById(R.id.layoutEmptyNextBooking)
        progressBar = findViewById(R.id.progressDashboard)

        textNextDate = findViewById(R.id.textNextDate)
        textNextNode = findViewById(R.id.textNextNode)
        textNextStatus = findViewById(R.id.textNextStatus)

        // View All click handler
        findViewById<View>(R.id.textViewAllBookings)?.setOnClickListener {
            startActivity(Intent(this, MyBookingsActivity::class.java))
            overridePendingTransition(0, 0)
        }

        // Fetch data
        loadDashboardData(session.getNic() ?: "")
    }

    private fun loadDashboardData(nic: String) {
        progressBar.visibility = View.VISIBLE
        cardNextBooking.visibility = View.GONE
        layoutEmptyNextBooking.visibility = View.GONE

        lifecycleScope.launch(Dispatchers.IO) {
            val response = ApiClient.get(this@ProsumerDashboardActivity, "Reservations/pending?nic=$nic")

            if (response != null) {
                try {
                    val array = if (response.trim().startsWith("[")) {
                        JSONArray(response)
                    } else {
                        val obj = JSONObject(response)
                        when {
                            obj.has("data") -> obj.getJSONArray("data")
                            obj.has("value") -> obj.getJSONArray("value")
                            else -> JSONArray()
                        }
                    }

                    var pendingCount = 0
                    var approvedCount = 0
                    var nextBooking: JSONObject? = null

                    for (i in 0 until array.length()) {
                        val item = array.getJSONObject(i)
                        val status = item.optString("status", "Pending")

                        if (status.equals("Pending", ignoreCase = true)) {
                            pendingCount++
                        } else if (status.equals("Approved", ignoreCase = true)) {
                            approvedCount++
                        }

                        // Keep the first item as the "Next" booking (assuming API sorts by date)
                        if (nextBooking == null) {
                            nextBooking = item
                        }
                    }

                    withContext(Dispatchers.Main) {
                        progressBar.visibility = View.GONE
                        // Update Counts
                        textPendingCount.text = pendingCount.toString()
                        textUpcomingCount.text = approvedCount.toString()

                        // Update Next Booking Card
                        if (nextBooking != null) {
                            val isoDate = nextBooking.optString("reservationDate", "–")
                            val nodeId = nextBooking.optString("nodeId", "Unknown Node")
                            val status = nextBooking.optString("status", "Pending")

                            textNextDate?.text = formatDate(isoDate)
                            textNextNode?.text = "Node: $nodeId"
                            textNextStatus?.text = status

                            // Apply web colors to status badge
                            val (bgColor, textColor) = when (status.lowercase()) {
                                "pending"   -> "#FEF3C7" to "#92400E"
                                "approved"  -> "#DBEAFE" to "#1E40AF"
                                "completed" -> "#DCFCE7" to "#166534"
                                "cancelled" -> "#FEE2E2" to "#991B1B"
                                else        -> "#F5F0E8" to "#5C5C5C"
                            }
                            textNextStatus?.background?.mutate()?.setTint(Color.parseColor(bgColor))
                            textNextStatus?.setTextColor(Color.parseColor(textColor))

                            val bookingId = nextBooking.optString("id", nextBooking.optString("_id"))
                            cardNextBooking.setOnClickListener {
                                val intent = Intent(this@ProsumerDashboardActivity, ReservationDetailActivity::class.java)
                                intent.putExtra("BOOKING_ID", bookingId)
                                startActivity(intent)
                            }

                            cardNextBooking.visibility = View.VISIBLE
                            layoutEmptyNextBooking.visibility = View.GONE
                        } else {
                            cardNextBooking.visibility = View.GONE
                            layoutEmptyNextBooking.visibility = View.VISIBLE
                        }
                    }

                } catch (e: Exception) {
                    android.util.Log.e("ProsumerDashboard", "Parsing error", e)
                    withContext(Dispatchers.Main) {
                        progressBar.visibility = View.GONE
                        textPendingCount.text = "-"
                        textUpcomingCount.text = "-"
                        layoutEmptyNextBooking.visibility = View.VISIBLE
                    }
                }
            } else {
                withContext(Dispatchers.Main) {
                    progressBar.visibility = View.GONE
                    textPendingCount.text = "-"
                    textUpcomingCount.text = "-"
                    layoutEmptyNextBooking.visibility = View.VISIBLE
                }
            }
        }
    }

    private fun formatDate(isoDate: String): String {
        return try {
            val parser = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.getDefault())
            parser.timeZone = TimeZone.getTimeZone("UTC")
            // Example format: Sep 24, 2026 - 10:00 AM
            val displayFmt = SimpleDateFormat("MMM dd, yyyy - hh:mm a", Locale.getDefault())
            val date = parser.parse(isoDate)
            if (date != null) displayFmt.format(date) else isoDate
        } catch (_: Exception) {
            isoDate.take(10)
        }
    }
}
