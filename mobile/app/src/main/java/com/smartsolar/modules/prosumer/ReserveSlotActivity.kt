package com.smartsolar.modules.prosumer

/*
 * ReserveSlotActivity.kt
 * Allows a prosumer to book a solar energy slot at a grid station.
 * Steps:
 *   1. Fetches all stations from GET /api/Stations and populates a Spinner
 *   2. User picks a date via DatePickerDialog
 *   3. On confirm → POST /api/reservations with { prosumerNic, slotId, nodeId, reservationDate }
 */

import android.app.DatePickerDialog
import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
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

class ReserveSlotActivity : AppCompatActivity() {

    // Holds fetched station data — name shown in spinner, id used in API call
    private data class Station(val id: String, val name: String, val slotId: String)

    private val stations = mutableListOf<Station>()
    private var selectedDateIso: String? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_reserve_slot)

        val session = SessionManager(this)
        val nic = session.getNic() ?: ""

        // Pre-fill NIC
        findViewById<TextView>(R.id.textNicValue).text = nic

        // Back button
        findViewById<View>(R.id.buttonBack).setOnClickListener { finish() }

        // ── Load stations ────────────────────────────────────────────
        val spinner = findViewById<Spinner>(R.id.spinnerStation)
        val textLoading = findViewById<TextView>(R.id.textStationLoading)

        lifecycleScope.launch(Dispatchers.IO) {
            val response = ApiClient.get(this@ReserveSlotActivity, "Stations")

            withContext(Dispatchers.Main) {
                textLoading.visibility = View.GONE
                if (response != null) {
                    try {
                        // Handle both plain array and wrapped object
                        val array: JSONArray = if (response.trim().startsWith("[")) {
                            JSONArray(response)
                        } else {
                            val obj = JSONObject(response)
                            when {
                                obj.has("data")     -> obj.getJSONArray("data")
                                obj.has("stations") -> obj.getJSONArray("stations")
                                obj.has("value")    -> obj.getJSONArray("value")
                                else                -> JSONArray()
                            }
                        }

                        for (i in 0 until array.length()) {
                            val s = array.getJSONObject(i)
                            val id = if (s.has("id")) s.getString("id") else s.optString("_id", "")
                            val name = s.optString("name", s.optString("stationName", "Station $i"))
                            // Use station id as slotId placeholder — update when slot API is available
                            val slotId = s.optString("slotId", id)
                            stations.add(Station(id, name, slotId))
                        }

                        if (stations.isEmpty()) {
                            Toast.makeText(this@ReserveSlotActivity,
                                "No stations available right now.", Toast.LENGTH_SHORT).show()
                            return@withContext
                        }

                        val adapter = ArrayAdapter(
                            this@ReserveSlotActivity,
                            android.R.layout.simple_spinner_item,
                            stations.map { it.name }
                        )
                        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
                        spinner.adapter = adapter

                    } catch (e: Exception) {
                        Toast.makeText(this@ReserveSlotActivity,
                            "Error loading stations: ${e.message}", Toast.LENGTH_LONG).show()
                    }
                } else {
                    Toast.makeText(this@ReserveSlotActivity,
                        "Cannot reach server. Check WiFi & backend.", Toast.LENGTH_LONG).show()
                }
            }
        }

        // ── Date Picker ─────────────────────────────────────────────
        val layoutDate = findViewById<View>(R.id.layoutDatePicker)
        val textDate = findViewById<TextView>(R.id.textSelectedDate)
        val displayFormat = SimpleDateFormat("dd MMM yyyy", Locale.getDefault())
        val isoFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.getDefault())
        isoFormat.timeZone = TimeZone.getTimeZone("UTC")

        layoutDate.setOnClickListener {
            val cal = Calendar.getInstance()
            DatePickerDialog(
                this,
                { _, year, month, day ->
                    cal.set(year, month, day)
                    textDate.text = displayFormat.format(cal.time)
                    textDate.setTextColor(getColor(R.color.textColorPrimary))
                    selectedDateIso = isoFormat.format(cal.time)
                },
                cal.get(Calendar.YEAR),
                cal.get(Calendar.MONTH),
                cal.get(Calendar.DAY_OF_MONTH)
            ).also { dialog ->
                // Only allow future dates
                dialog.datePicker.minDate = System.currentTimeMillis()
            }.show()
        }

        // ── Confirm Reservation ──────────────────────────────────────
        val buttonConfirm = findViewById<Button>(R.id.buttonConfirmReservation)
        val progressBar = findViewById<ProgressBar>(R.id.progressReserve)

        buttonConfirm.setOnClickListener {
            val date = selectedDateIso
            if (stations.isEmpty()) {
                Toast.makeText(this, "Please wait for stations to load.", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            if (date == null) {
                Toast.makeText(this, "Please select a reservation date.", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            val selectedStation = stations.getOrNull(spinner.selectedItemPosition)
                ?: return@setOnClickListener

            val body = JSONObject().apply {
                put("prosumerNic", nic)
                put("slotId", selectedStation.slotId)
                put("nodeId", selectedStation.id)
                put("reservationDate", date)
            }

            // Disable button + show loading
            buttonConfirm.isEnabled = false
            progressBar.visibility = View.VISIBLE

            lifecycleScope.launch(Dispatchers.IO) {
                val result = ApiClient.post(this@ReserveSlotActivity, "Reservations", body)

                withContext(Dispatchers.Main) {
                    buttonConfirm.isEnabled = true
                    progressBar.visibility = View.GONE

                    if (result.isSuccess) {
                        Toast.makeText(
                            this@ReserveSlotActivity,
                            "✅ Reservation confirmed at ${selectedStation.name}!",
                            Toast.LENGTH_LONG
                        ).show()
                        // Navigate to My Bookings after success
                        startActivity(Intent(this@ReserveSlotActivity, MyBookingsActivity::class.java))
                        finish()
                    } else {
                        Toast.makeText(
                            this@ReserveSlotActivity,
                            "❌ ${result.message ?: "Reservation failed. Try again."}",
                            Toast.LENGTH_LONG
                        ).show()
                    }
                }
            }
        }
    }
}
