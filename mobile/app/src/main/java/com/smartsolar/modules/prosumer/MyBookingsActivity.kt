package com.smartsolar.modules.prosumer

/*
 * MyBookingsActivity.kt
 * Displays the prosumer's reservations in two tabs:
 *   - Upcoming: pending + approved future bookings (GET /reservations/pending?nic=)
 *   - History:  past / cancelled bookings (GET /reservations/history?nic=)
 * A "Cancel" button on each upcoming card calls PUT /reservations/{id}/cancel.
 */

import android.os.Bundle
import android.view.View
import android.widget.ProgressBar
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.google.android.material.tabs.TabLayout
import com.smartsolar.R
import com.smartsolar.data.remote.ApiClient
import com.smartsolar.utils.SessionManager
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import com.smartsolar.modules.common.BaseNavActivity
import org.json.JSONArray
import org.json.JSONObject

class MyBookingsActivity : BaseNavActivity() {

    private lateinit var recycler: RecyclerView
    private lateinit var layoutEmpty: View
    private lateinit var progressBar: ProgressBar

    private val upcomingList = mutableListOf<Booking>()
    private val historyList  = mutableListOf<Booking>()

    private var currentTab = 0   // 0 = Upcoming, 1 = History

    override fun getLayoutResourceId() = R.layout.activity_my_bookings
    override fun getMenuItemId() = R.id.nav_bookings

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        recycler     = findViewById(R.id.recyclerBookings)
        layoutEmpty  = findViewById(R.id.layoutEmpty)
        progressBar  = findViewById(R.id.progressBookings)

        recycler.layoutManager = LinearLayoutManager(this)

        // Back button
        findViewById<View>(R.id.buttonBack).setOnClickListener { finish() }

        // Tabs
        val tabLayout = findViewById<TabLayout>(R.id.tabLayout)
        tabLayout.addTab(tabLayout.newTab().setText("📅  Upcoming"))
        tabLayout.addTab(tabLayout.newTab().setText("📁  History"))

        tabLayout.addOnTabSelectedListener(object : TabLayout.OnTabSelectedListener {
            override fun onTabSelected(tab: TabLayout.Tab) {
                currentTab = tab.position
                renderList()
            }
            override fun onTabUnselected(tab: TabLayout.Tab) {}
            override fun onTabReselected(tab: TabLayout.Tab) {}
        })

        // Load both lists
        loadBookings()
    }

    private fun loadBookings() {
        val nic = SessionManager(this).getNic() ?: ""
        progressBar.visibility = View.VISIBLE
        recycler.visibility = View.GONE
        layoutEmpty.visibility = View.GONE

        lifecycleScope.launch(Dispatchers.IO) {
            val pendingResponse = ApiClient.get(this@MyBookingsActivity, "Reservations/pending?nic=$nic")
            val historyResponse = ApiClient.get(this@MyBookingsActivity, "Reservations/history?nic=$nic")

            withContext(Dispatchers.Main) {
                progressBar.visibility = View.GONE

                // Parse upcoming
                upcomingList.clear()
                if (pendingResponse != null) {
                    parseBookingList(pendingResponse, upcomingList)
                }

                // Parse history
                historyList.clear()
                if (historyResponse != null) {
                    parseBookingList(historyResponse, historyList)
                }

                renderList()

                if (pendingResponse == null && historyResponse == null) {
                    Toast.makeText(this@MyBookingsActivity,
                        "Cannot reach server. Check WiFi & backend.", Toast.LENGTH_LONG).show()
                }
            }
        }
    }

    /** Populate a Booking list from a JSON array string */
    private fun parseBookingList(json: String, target: MutableList<Booking>) {
        try {
            val array: JSONArray = if (json.trim().startsWith("[")) {
                JSONArray(json)
            } else {
                val obj = JSONObject(json)
                when {
                    obj.has("data")  -> obj.getJSONArray("data")
                    obj.has("value") -> obj.getJSONArray("value")
                    else             -> JSONArray()
                }
            }
            for (i in 0 until array.length()) {
                val item = array.getJSONObject(i)
                target.add(
                    Booking(
                        id              = item.optString("id", item.optString("_id", "–")),
                        nodeId          = item.optString("nodeId", "–"),
                        slotId          = item.optString("slotId", "–"),
                        status          = item.optString("status", "Pending"),
                        reservationDate = item.optString("reservationDate", "–")
                    )
                )
            }
        } catch (e: Exception) {
            android.util.Log.e("MyBookings", "Parse error: ${e.message}")
        }
    }

    /** Swap adapter data based on selected tab */
    private fun renderList() {
        val list = if (currentTab == 0) upcomingList else historyList
        val showCancel = (currentTab == 0)

        if (list.isEmpty()) {
            recycler.visibility = View.GONE
            layoutEmpty.visibility = View.VISIBLE
        } else {
            layoutEmpty.visibility = View.GONE
            recycler.visibility = View.VISIBLE
            recycler.adapter = BookingAdapter(this, list, showCancel) { booking ->
                cancelBooking(booking)
            }
        }
    }

    /** Cancel a booking via PUT /reservations/{id}/cancel */
    private fun cancelBooking(booking: Booking) {
        val body = JSONObject().apply { put("reason", "Cancelled by prosumer") }

        lifecycleScope.launch(Dispatchers.IO) {
            val result = ApiClient.put(this@MyBookingsActivity, "Reservations/${booking.id}/cancel", body)

            withContext(Dispatchers.Main) {
                if (result.isSuccess) {
                    Toast.makeText(this@MyBookingsActivity,
                        "Booking cancelled successfully.", Toast.LENGTH_SHORT).show()
                    // Refresh list
                    loadBookings()
                } else {
                    Toast.makeText(this@MyBookingsActivity,
                        "Cancel failed: ${result.message}", Toast.LENGTH_LONG).show()
                }
            }
        }
    }
}
