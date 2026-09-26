package com.smartsolar.modules.prosumer

/*
 * MyBookingsActivity.kt
 * Displays reservations in two tabs (Upcoming vs History).
 * Supports both Prosumer (NIC-filtered) and Grid Operator (system-wide) monitoring.
 * Syncs local status overrides from SessionManager to ensure completed transfers show immediately.
 * Author: Member 4 – Operator Product
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
import com.smartsolar.modules.common.BaseNavActivity
import com.smartsolar.utils.SessionManager
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
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
        val tabLayout = findViewById<TabLayout>(R.id.tabLayout)

        if (recycler == null || layoutEmpty == null || progressBar == null || tabLayout == null) {
            android.util.Log.e("MyBookings", "UI components not found")
            return
        }

        recycler.layoutManager = LinearLayoutManager(this)

        // Back button
        findViewById<View>(R.id.btnNavBack)?.setOnClickListener { finish() }

        // Tabs
        tabLayout.setTabTextColors(
            androidx.core.content.ContextCompat.getColor(this, R.color.textColorSecondary),
            androidx.core.content.ContextCompat.getColor(this, R.color.colorPrimary)
        )
        tabLayout.addTab(tabLayout.newTab().setText("Upcoming"))
        tabLayout.addTab(tabLayout.newTab().setText("History"))

        tabLayout.addOnTabSelectedListener(object : TabLayout.OnTabSelectedListener {
            override fun onTabSelected(tab: TabLayout.Tab) {
                currentTab = tab.position
                renderList()
            }
            override fun onTabUnselected(tab: TabLayout.Tab) {}
            override fun onTabReselected(tab: TabLayout.Tab) {}
        })

        // Load lists
        loadBookings()
    }

    override fun onResume() {
        super.onResume()
        loadBookings()
    }

    private fun loadBookings() {
        val session = SessionManager(this)
        val nic = session.getNic()?.trim() ?: ""
        val role = session.getRole()?.lowercase() ?: ""
        val isOperator = role.contains("operator") || role.contains("grid") || role.contains("admin")

        progressBar.visibility = View.VISIBLE
        recycler.visibility = View.GONE
        layoutEmpty.visibility = View.GONE

        lifecycleScope.launch(Dispatchers.IO) {
            val pendingUrl = if (isOperator) "operator/reservations?status=Pending" else "Reservations/search?nic=$nic"
            val historyUrl = if (isOperator) "operator/reservations" else "Reservations/history?nic=$nic"

            var pendingResponse = ApiClient.get(this@MyBookingsActivity, pendingUrl)
            if (isOperator && (pendingResponse == null || pendingResponse.trim() == "[]" || pendingResponse.trim() == "{}")) {
                pendingResponse = ApiClient.get(this@MyBookingsActivity, "Reservations/pending")
            }

            var historyResponse = ApiClient.get(this@MyBookingsActivity, historyUrl)
            if (isOperator && (historyResponse == null || historyResponse.trim() == "[]" || historyResponse.trim() == "{}")) {
                historyResponse = ApiClient.get(this@MyBookingsActivity, "Reservations")
            }

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

                // SQLite Caching Logic
                val dao = com.smartsolar.data.local.ReservationDao(this@MyBookingsActivity)
                val isNetworkFailure = (pendingResponse == null && historyResponse == null)

                if (!isNetworkFailure) {
                    // We got data from API, so cache it locally
                    val allFetched = (upcomingList + historyList).distinctBy { it.id }
                    if (allFetched.isNotEmpty()) {
                        dao.clearAllReservations()
                        val cacheList = allFetched.map { b ->
                            com.smartsolar.models.Reservation(b.id, b.slotId, b.nodeId, b.status, b.reservationDate)
                        }
                        dao.insertReservations(cacheList)
                    }
                } else {
                    // Network failed, load from SQLite local cache
                    val localData = dao.getAllReservations()
                    if (localData.isNotEmpty()) {
                        upcomingList.clear()
                        historyList.clear()
                        localData.forEach { r ->
                            val b = Booking(
                                id = r.id, 
                                nodeId = r.nodeId ?: "–", 
                                slotId = r.slotId ?: "–", 
                                status = r.status ?: "Pending", 
                                reservationDate = r.scheduledDate ?: "–"
                            )
                            if (b.status.equals("Completed", ignoreCase = true) || b.status.equals("Cancelled", ignoreCase = true) || b.status.equals("Done", ignoreCase = true)) {
                                historyList.add(b)
                            } else {
                                upcomingList.add(b)
                            }
                        }
                    }
                }

                // Split all system/prosumer reservations into Upcoming vs History tabs by status
                val allItems = (upcomingList + historyList).distinctBy { it.id }
                upcomingList.clear()
                historyList.clear()

                for (item in allItems) {
                    if (item.status.equals("Completed", ignoreCase = true) ||
                        item.status.equals("Cancelled", ignoreCase = true) ||
                        item.status.equals("Done", ignoreCase = true)) {
                        historyList.add(item)
                    } else {
                        upcomingList.add(item)
                    }
                }

                renderList()

                if (isNetworkFailure && upcomingList.isEmpty() && historyList.isEmpty()) {
                    Toast.makeText(this@MyBookingsActivity,
                        "Cannot reach server and no local offline data.", Toast.LENGTH_LONG).show()
                } else if (isNetworkFailure) {
                    Toast.makeText(this@MyBookingsActivity,
                        "Offline Mode: Showing cached reservations.", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    /** Populate a Booking list from a JSON array string with local status overrides */
    private fun parseBookingList(json: String, target: MutableList<Booking>) {
        val sessionManager = SessionManager(this)
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
                val id = item.optString("id", item.optString("_id", "–"))
                val rawStatus = item.optString("status", "Pending")

                // Check local status override
                val localStatus = sessionManager.getReservationStatus(id)
                val status = if (!localStatus.isNullOrEmpty()) localStatus else rawStatus

                target.add(
                    Booking(
                        id              = id,
                        nodeId          = item.optString("nodeId", "–"),
                        slotId          = item.optString("slotId", "–"),
                        status          = status,
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

            val title = findViewById<android.widget.TextView>(R.id.textEmptyTitle)
            val subtitle = findViewById<android.widget.TextView>(R.id.textEmptySubtitle)

            if (currentTab == 0) {
                title?.text = "No upcoming bookings"
                subtitle?.text = "Reserve an energy slot to get started!"
            } else {
                title?.text = "No booking history"
                subtitle?.text = "Completed and cancelled bookings will appear here."
            }
        } else {
            layoutEmpty.visibility = View.GONE
            recycler.visibility = View.VISIBLE
            recycler.adapter = BookingAdapter(this, list, showCancel) { booking ->
                viewBookingDetails(booking)
            }
        }
    }

    private fun viewBookingDetails(booking: Booking) {
        val intent = android.content.Intent(this, ReservationDetailActivity::class.java)
        intent.putExtra("BOOKING_ID", booking.id)
        startActivity(intent)
    }
}
