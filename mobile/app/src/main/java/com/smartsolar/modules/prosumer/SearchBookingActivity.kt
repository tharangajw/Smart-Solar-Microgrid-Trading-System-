package com.smartsolar.modules.prosumer

/*
 * SearchBookingActivity.kt
 * Allows users to search and filter slot reservations by Status and Date Range.
 * Supports both Prosumer (NIC-filtered) and Grid Operator (system-wide) searches.
 * Author: Member 4 – Operator Product
 */

import android.app.DatePickerDialog
import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.smartsolar.R
import com.smartsolar.data.remote.ApiClient
import com.smartsolar.utils.SessionManager
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.*

class SearchBookingActivity : AppCompatActivity() {

    private lateinit var spinnerStatus: Spinner
    private lateinit var textFromDate: TextView
    private lateinit var textToDate: TextView
    private lateinit var recycler: RecyclerView
    private lateinit var progressSearch: ProgressBar
    private lateinit var textEmpty: TextView

    private var fromDateIso: String? = null
    private var toDateIso: String? = null
    private val resultsList = mutableListOf<Booking>()

    private val displayFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
    private val isoFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.getDefault()).apply {
        timeZone = TimeZone.getTimeZone("UTC")
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_search_booking)

        findViewById<View>(R.id.btnNavBack)?.setOnClickListener { finish() }
        findViewById<TextView>(R.id.textNavTitle)?.text = "Search Bookings"
        findViewById<TextView>(R.id.textNavSubtitle)?.text = "Filter slot reservations"

        spinnerStatus = findViewById(R.id.spinnerStatus)
        textFromDate = findViewById(R.id.textFromDate)
        textToDate = findViewById(R.id.textToDate)
        recycler = findViewById(R.id.recyclerSearch)
        progressSearch = findViewById(R.id.progressSearch)
        textEmpty = findViewById(R.id.textEmpty)

        recycler.layoutManager = LinearLayoutManager(this)

        val statuses = arrayOf("All", "Pending", "Approved", "Cancelled", "Completed")
        spinnerStatus.adapter = ArrayAdapter(this, android.R.layout.simple_spinner_dropdown_item, statuses)

        textFromDate.setOnClickListener {
            pickDate { display, iso ->
                textFromDate.text = display
                fromDateIso = iso
            }
        }

        textToDate.setOnClickListener {
            pickDate { display, iso ->
                textToDate.text = display
                toDateIso = iso
            }
        }

        findViewById<Button>(R.id.buttonSearch).setOnClickListener {
            performSearch()
        }

        // Perform initial search to populate all bookings
        performSearch()
    }

    private fun pickDate(onSelected: (String, String) -> Unit) {
        val cal = Calendar.getInstance()
        DatePickerDialog(
            this, { _, y, m, d ->
                cal.set(y, m, d)
                onSelected(displayFormat.format(cal.time), isoFormat.format(cal.time))
            },
            cal.get(Calendar.YEAR),
            cal.get(Calendar.MONTH),
            cal.get(Calendar.DAY_OF_MONTH)
        ).show()
    }

    private fun performSearch() {
        val session = SessionManager(this)
        val nic = session.getNic() ?: ""
        val role = session.getRole()?.lowercase() ?: ""
        val isOperator = role.contains("operator") || role.contains("grid") || role.contains("admin")
        val filterStatus = if (spinnerStatus.selectedItemPosition == 0) "" else spinnerStatus.selectedItem.toString()

        var query = if (isOperator) "operator/reservations" else "Reservations/search?nic=$nic"
        if (filterStatus.isNotEmpty()) query += if (isOperator) "?status=$filterStatus" else "&status=$filterStatus"
        if (fromDateIso != null) query += "&from=$fromDateIso"
        if (toDateIso != null) query += "&to=$toDateIso"

        progressSearch.visibility = View.VISIBLE
        recycler.visibility = View.GONE
        textEmpty.visibility = View.GONE

        lifecycleScope.launch(Dispatchers.IO) {
            var response = ApiClient.get(this@SearchBookingActivity, query)

            // Fallback: If search endpoint returns empty, fetch pending + history and filter locally
            if (response == null || response.trim() == "[]" || response.trim() == "{}") {
                val pendingResp = ApiClient.get(this@SearchBookingActivity, if (isOperator) "operator/reservations?status=Pending" else "Reservations/pending?nic=$nic")
                val historyResp = ApiClient.get(this@SearchBookingActivity, if (isOperator) "operator/reservations" else "Reservations/history?nic=$nic")
                val allResp = ApiClient.get(this@SearchBookingActivity, "Reservations")
                response = combineJsonArrays(pendingResp, historyResp, allResp)
            }

            withContext(Dispatchers.Main) {
                progressSearch.visibility = View.GONE
                resultsList.clear()

                if (response != null && response.trim().isNotEmpty()) {
                    try {
                        val array = parseJsonArray(response)
                        for (i in 0 until array.length()) {
                            val item = array.getJSONObject(i)
                            val id = item.optString("id", item.optString("_id", ""))
                            val nodeId = item.optString("nodeId", "Hub")
                            val slotId = item.optString("slotId", "Slot")
                            
                            val localStatus = session.getReservationStatus(id)
                            val rawStatus = item.optString("status", "Pending")
                            val status = if (!localStatus.isNullOrEmpty()) localStatus else rawStatus

                            // Apply local status filter if specified
                            if (filterStatus.isNotEmpty() && !status.equals(filterStatus, ignoreCase = true)) {
                                continue
                            }

                            resultsList.add(Booking(id, nodeId, slotId, status, item.optString("reservationDate", "")))
                        }
                    } catch (_: Exception) {}
                }

                if (resultsList.isEmpty()) {
                    textEmpty.visibility = View.VISIBLE
                } else {
                    recycler.visibility = View.VISIBLE
                    recycler.adapter = BookingAdapter(this@SearchBookingActivity, resultsList, false) { booking ->
                        val intent = Intent(this@SearchBookingActivity, ReservationDetailActivity::class.java)
                        intent.putExtra("BOOKING_ID", booking.id)
                        startActivity(intent)
                    }
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

    private fun combineJsonArrays(vararg jsonStrings: String?): String {
        val resultMap = mutableMapOf<String, JSONObject>()
        for (json in jsonStrings) {
            if (json.isNullOrEmpty()) continue
            try {
                val array = parseJsonArray(json)
                for (i in 0 until array.length()) {
                    val item = array.getJSONObject(i)
                    val id = item.optString("id", item.optString("_id", "$i"))
                    if (id.isNotEmpty()) {
                        resultMap[id] = item
                    }
                }
            } catch (_: Exception) {}
        }
        val resultArray = JSONArray()
        resultMap.values.forEach { resultArray.put(it) }
        return resultArray.toString()
    }
}
