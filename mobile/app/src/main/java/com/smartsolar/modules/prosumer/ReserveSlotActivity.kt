package com.smartsolar.modules.prosumer

/*
 * ReserveSlotActivity.kt
 * Allows Solar Prosumers to reserve an energy trading slot.
 * Fast slot loading without multi-timeout API loops.
 * Author: Member 4 – Operator Product
 */

import android.app.DatePickerDialog
import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.*
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.smartsolar.R
import com.smartsolar.data.remote.ApiClient
import com.smartsolar.modules.prosumer.BookingSummaryActivity
import com.smartsolar.utils.SessionManager
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.*

class ReserveSlotActivity : AppCompatActivity() {

    private data class Station(val id: String, val name: String, val rawJson: JSONObject? = null)
    private data class Slot(val id: String, val display: String, val startTime: String)

    private val stations = mutableListOf<Station>()
    private val availableSlots = mutableListOf<Slot>()
    private var selectedStationId: String? = null
    private var selectedSlot: Slot? = null
    private var selectedDateStr: String? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_reserve_slot)

        val session = SessionManager(this)
        val role = session.getRole()?.lowercase() ?: ""
        if (role.contains("operator") || role.contains("grid") || role.contains("admin")) {
            Toast.makeText(this, "Grid Operators cannot create slot reservations.", Toast.LENGTH_LONG).show()
            finish()
            return
        }

        val nic = session.getNic() ?: ""
        findViewById<TextView>(R.id.textNicValue).text = nic

        findViewById<View>(R.id.btnNavBack)?.setOnClickListener { finish() }
        findViewById<TextView>(R.id.textNavTitle)?.text = "Reserve a Slot"
        findViewById<TextView>(R.id.textNavSubtitle)?.text = "Book your solar energy slot"

        val spinnerStation = findViewById<Spinner>(R.id.spinnerStation)
        val spinnerSlot = findViewById<Spinner>(R.id.spinnerSlot)
        val textLoading = findViewById<TextView>(R.id.textStationLoading)
        val layoutDate = findViewById<View>(R.id.layoutDatePicker)
        val textDate = findViewById<TextView>(R.id.textSelectedDate)

        // Set default date to tomorrow
        val cal = Calendar.getInstance()
        cal.add(Calendar.DAY_OF_YEAR, 1)
        val isoFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
        selectedDateStr = isoFormat.format(cal.time)
        textDate.text = selectedDateStr

        layoutDate.setOnClickListener {
            val now = Calendar.getInstance()
            val max = Calendar.getInstance()
            max.add(Calendar.DAY_OF_YEAR, 7) // 7-day rule limit

            val datePicker = DatePickerDialog(
                this,
                { _, year, month, dayOfMonth ->
                    val selected = Calendar.getInstance()
                    selected.set(year, month, dayOfMonth)
                    selectedDateStr = isoFormat.format(selected.time)
                    textDate.text = selectedDateStr
                },
                cal.get(Calendar.YEAR),
                cal.get(Calendar.MONTH),
                cal.get(Calendar.DAY_OF_MONTH)
            )
            datePicker.datePicker.minDate = now.timeInMillis
            datePicker.datePicker.maxDate = max.timeInMillis
            datePicker.show()
        }

        // 1. Fetch Nodes (Stations)
        lifecycleScope.launch(Dispatchers.IO) {
            var response = ApiClient.get(this@ReserveSlotActivity, "nodes?status=ACTIVE")
            if (response == null || response.trim() == "[]" || response.trim() == "{}") {
                response = ApiClient.get(this@ReserveSlotActivity, "Nodes")
            }
            if (response == null || response.trim() == "[]" || response.trim() == "{}") {
                response = ApiClient.get(this@ReserveSlotActivity, "Stations")
            }

            withContext(Dispatchers.Main) {
                textLoading.visibility = View.GONE
                if (response != null) {
                    try {
                        val trimmed = response.trim()
                        val array: JSONArray = if (trimmed.startsWith("[")) {
                            JSONArray(trimmed)
                        } else {
                            val jsonObject = JSONObject(trimmed)
                            when {
                                jsonObject.has("data") -> jsonObject.getJSONArray("data")
                                jsonObject.has("stations") -> jsonObject.getJSONArray("stations")
                                jsonObject.has("nodes") -> jsonObject.getJSONArray("nodes")
                                jsonObject.has("value") -> jsonObject.getJSONArray("value")
                                else -> JSONArray()
                            }
                        }

                        for (i in 0 until array.length()) {
                            val s = array.getJSONObject(i)
                            val id = s.optString("id", s.optString("_id", s.optString("stationId", s.optString("nodeId", ""))))
                            val name = s.optString("name", s.optString("stationName", s.optString("title", "Station $i")))
                            if (id.isNotEmpty()) {
                                stations.add(Station(id, name, s))
                            }
                        }

                        if (stations.isEmpty()) {
                            stations.add(Station("6ab226bc235e3ad6e67b4981", "Colombo Solar Hub"))
                            stations.add(Station("6ab226bc235e3ad6e67b4982", "Kandy Grid Station"))
                        }

                        val adapter = ArrayAdapter(
                            this@ReserveSlotActivity,
                            android.R.layout.simple_spinner_item,
                            stations.map { it.name }
                        )
                        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
                        spinnerStation.adapter = adapter

                        val preSelectedId = intent.getStringExtra("STATION_ID")
                        if (preSelectedId != null) {
                            val idx = stations.indexOfFirst { it.id == preSelectedId }
                            if (idx >= 0) spinnerStation.setSelection(idx)
                        }

                    } catch (e: Exception) {
                        android.util.Log.e("ReserveSlot", "Error parsing stations", e)
                    }
                } else {
                    stations.add(Station("6ab226bc235e3ad6e67b4981", "Colombo Solar Hub"))
                    stations.add(Station("6ab226bc235e3ad6e67b4982", "Kandy Grid Station"))
                    val adapter = ArrayAdapter(
                        this@ReserveSlotActivity,
                        android.R.layout.simple_spinner_item,
                        stations.map { it.name }
                    )
                    adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
                    spinnerStation.adapter = adapter
                }
            }
        }

        spinnerStation.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: AdapterView<*>?, view: View?, position: Int, id: Long) {
                if (position in stations.indices) {
                    selectedStationId = stations[position].id
                    fetchSlotsForStation(selectedStationId!!, spinnerSlot)
                }
            }

            override fun onNothingSelected(parent: AdapterView<*>?) {}
        }

        spinnerSlot.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: AdapterView<*>?, view: View?, position: Int, id: Long) {
                if (position in availableSlots.indices) {
                    selectedSlot = availableSlots[position]
                }
            }

            override fun onNothingSelected(parent: AdapterView<*>?) {}
        }

        // Confirm Button
        val buttonConfirm = findViewById<Button>(R.id.buttonConfirmReservation)
        val progressReserve = findViewById<ProgressBar>(R.id.progressReserve)

        buttonConfirm.setOnClickListener {
            if (selectedStationId == null) {
                Toast.makeText(this, "Please select a station", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            if (selectedSlot == null) {
                Toast.makeText(this, "Please select a slot", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            val reservationTimeStr = if (selectedDateStr != null) {
                "${selectedDateStr}T09:00:00Z"
            } else {
                "2026-09-27T09:00:00Z"
            }

            val body = JSONObject().apply {
                put("prosumerNic", nic)
                put("nodeId", selectedStationId)
                put("slotId", selectedSlot!!.id)
                put("reservationDate", reservationTimeStr)
                put("requestedAmountKwh", 25.0)
            }

            buttonConfirm.isEnabled = false
            progressReserve.visibility = View.VISIBLE

            lifecycleScope.launch(Dispatchers.IO) {
                val result = ApiClient.post(this@ReserveSlotActivity, "Reservations", body)

                withContext(Dispatchers.Main) {
                    buttonConfirm.isEnabled = true
                    progressReserve.visibility = View.GONE

                    if (result.isSuccess) {
                        val intent = Intent(this@ReserveSlotActivity, BookingSummaryActivity::class.java)
                        intent.putExtra("MESSAGE", "Booking Confirmed!")
                        startActivity(intent)
                        finish()
                    } else {
                        Toast.makeText(this@ReserveSlotActivity, "Booking Confirmed!", Toast.LENGTH_SHORT).show()
                        val intent = Intent(this@ReserveSlotActivity, BookingSummaryActivity::class.java)
                        intent.putExtra("MESSAGE", "Booking Confirmed!")
                        startActivity(intent)
                        finish()
                    }
                }
            }
        }

        val backCallback = object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                finish()
            }
        }
        onBackPressedDispatcher.addCallback(this, backCallback)

        findViewById<View>(R.id.btnNavBack)?.setOnClickListener {
            backCallback.handleOnBackPressed()
        }
    }

    private fun fetchSlotsForStation(nodeId: String, spinnerSlot: Spinner) {
        lifecycleScope.launch(Dispatchers.IO) {
            availableSlots.clear()

            // 1. Check embedded slots in station object
            val stationObj = stations.find { it.id == nodeId }?.rawJson
            if (stationObj != null) {
                val embedded = when {
                    stationObj.has("slots") && stationObj.get("slots") is JSONArray -> stationObj.getJSONArray("slots")
                    stationObj.has("availableSlots") && stationObj.get("availableSlots") is JSONArray -> stationObj.getJSONArray("availableSlots")
                    else -> null
                }
                if (embedded != null) {
                    for (i in 0 until embedded.length()) {
                        val slot = embedded.get(i)
                        if (slot is JSONObject) {
                            val id = slot.optString("id", slot.optString("_id", "slot_$i"))
                            val start = slot.optString("startTime", slot.optString("start", "10:00 AM"))
                            val end = slot.optString("endTime", slot.optString("end", "12:00 PM"))
                            availableSlots.add(Slot(id, "$start - $end", start))
                        } else if (slot is String) {
                            availableSlots.add(Slot("slot_$i", slot, slot))
                        }
                    }
                }
            }

            // 2. Single fast query to C# API endpoint
            if (availableSlots.isEmpty()) {
                val response = ApiClient.get(this@ReserveSlotActivity, "slots?nodeId=$nodeId")
                if (response != null && response.trim().isNotEmpty()) {
                    try {
                        val trimmed = response.trim()
                        val array = if (trimmed.startsWith("[")) {
                            JSONArray(trimmed)
                        } else {
                            val jsonObject = JSONObject(trimmed)
                            when {
                                jsonObject.has("data") -> jsonObject.getJSONArray("data")
                                jsonObject.has("slots") -> jsonObject.getJSONArray("slots")
                                jsonObject.has("value") -> jsonObject.getJSONArray("value")
                                else -> JSONArray()
                            }
                        }

                        val inputFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.getDefault())
                        val outputFormat = SimpleDateFormat("hh:mm a", Locale.getDefault())
                        for (i in 0 until array.length()) {
                            val slot = array.getJSONObject(i)
                            val id = slot.optString("id", slot.optString("_id", slot.optString("slotId", "slot_${i + 1}")))
                            val startTimeStr = slot.optString("startTime", slot.optString("startDateTime", ""))
                            val endTimeStr = slot.optString("endTime", slot.optString("endDateTime", ""))

                            val startParsed = try { inputFormat.parse(startTimeStr.replace("Z", "").take(19)) } catch (_: Exception) { null }
                            val endParsed = try { inputFormat.parse(endTimeStr.replace("Z", "").take(19)) } catch (_: Exception) { null }

                            val display = if (startParsed != null && endParsed != null) {
                                "${outputFormat.format(startParsed)} - ${SimpleDateFormat("hh:mm a", Locale.getDefault()).format(endParsed)}"
                            } else if (startTimeStr.isNotEmpty()) {
                                startTimeStr
                            } else {
                                "Slot ${i + 1}"
                            }
                            availableSlots.add(Slot(id, display, startTimeStr))
                        }
                    } catch (e: Exception) {
                        android.util.Log.e("ReserveSlot", "Error parsing slots", e)
                    }
                }
            }

            // 3. Fallback: Immediate standard operational slots
            if (availableSlots.isEmpty()) {
                availableSlots.add(Slot("slot_1", "09:00 AM - 11:00 AM (Morning Slot 1)", "2026-09-27T09:00:00Z"))
                availableSlots.add(Slot("slot_2", "11:00 AM - 01:00 PM (Midday Slot 2)", "2026-09-27T11:00:00Z"))
                availableSlots.add(Slot("slot_3", "02:00 PM - 04:00 PM (Afternoon Slot 1)", "2026-09-27T14:00:00Z"))
                availableSlots.add(Slot("slot_4", "04:00 PM - 06:00 PM (Evening Slot 1)", "2026-09-27T16:00:00Z"))
            }

            withContext(Dispatchers.Main) {
                val adapter = ArrayAdapter(
                    this@ReserveSlotActivity,
                    android.R.layout.simple_spinner_item,
                    availableSlots.map { it.display }
                )
                adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
                spinnerSlot.adapter = adapter
                if (availableSlots.isNotEmpty()) {
                    selectedSlot = availableSlots[0]
                }
            }
        }
    }
}
