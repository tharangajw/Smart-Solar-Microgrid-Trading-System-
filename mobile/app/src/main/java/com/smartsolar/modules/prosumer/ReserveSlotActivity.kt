package com.smartsolar.modules.prosumer

import android.app.DatePickerDialog
import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.*
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

    private data class Station(val id: String, val name: String)
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
        val nic = session.getNic() ?: ""
        findViewById<TextView>(R.id.textNicValue).text = nic
        
        findViewById<View>(R.id.btnNavBack).setOnClickListener { finish() }
        findViewById<TextView>(R.id.textNavTitle).text = "Reserve a Slot"
        findViewById<TextView>(R.id.textNavSubtitle).text = "Book your solar energy slot"

        val spinnerStation = findViewById<Spinner>(R.id.spinnerStation)
        val spinnerSlot = findViewById<Spinner>(R.id.spinnerSlot)
        val textLoading = findViewById<TextView>(R.id.textStationLoading)
        val layoutDate = findViewById<View>(R.id.layoutDatePicker)
        val textDate = findViewById<TextView>(R.id.textSelectedDate)
        
        layoutDate.visibility = View.GONE
        spinnerSlot.visibility = View.GONE

        // 1. Fetch Nodes (Stations)
        lifecycleScope.launch(Dispatchers.IO) {
            val response = ApiClient.get(this@ReserveSlotActivity, "nodes?status=ACTIVE")
            withContext(Dispatchers.Main) {
                textLoading.visibility = View.GONE
                if (response != null) {
                    try {
                        val array: JSONArray = if (response.trim().startsWith("[")) {
                            JSONArray(response)
                        } else {
                            JSONObject(response).optJSONArray("data") ?: JSONArray()
                        }

                        for (i in 0 until array.length()) {
                            val s = array.getJSONObject(i)
                            val id = s.optString("id", s.optString("_id", ""))
                            val name = s.optString("name", "Station $i")
                            stations.add(Station(id, name))
                        }

                        if (stations.isEmpty()) {
                            Toast.makeText(this@ReserveSlotActivity, "No active stations available.", Toast.LENGTH_SHORT).show()
                            return@withContext
                        }

                        val adapter = ArrayAdapter(
                            this@ReserveSlotActivity,
                            android.R.layout.simple_spinner_item,
                            stations.map { it.name }
                        )
                        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
                        spinnerStation.adapter = adapter
                        layoutDate.visibility = View.VISIBLE
                        spinnerSlot.visibility = View.VISIBLE
                        
                    } catch (e: Exception) {
                        Toast.makeText(this@ReserveSlotActivity, "Error loading stations", Toast.LENGTH_LONG).show()
                    }
                }
            }
        }

        // 2. Fetch slots when a station is selected
        spinnerStation.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: AdapterView<*>?, view: View?, position: Int, id: Long) {
                selectedStationId = stations[position].id
                fetchSlotsForStation(selectedStationId!!, spinnerSlot)
            }
            override fun onNothingSelected(parent: AdapterView<*>?) {}
        }
        
        spinnerSlot.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: AdapterView<*>?, view: View?, position: Int, id: Long) {
                if (availableSlots.isNotEmpty()) {
                    selectedSlot = availableSlots[position]
                }
            }
            override fun onNothingSelected(parent: AdapterView<*>?) {}
        }

        // 3. Show Date Picker (Restricted to Today ~ +7 Days)
        layoutDate.setOnClickListener {
            val calendar = Calendar.getInstance()
            val datePicker = DatePickerDialog(this, { _, year, month, dayOfMonth ->
                val selectedCal = Calendar.getInstance()
                selectedCal.set(year, month, dayOfMonth)
                val format = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
                selectedDateStr = format.format(selectedCal.time)
                textDate.text = selectedDateStr
                textDate.setTextColor(getColor(R.color.textColorPrimary))
            }, calendar.get(Calendar.YEAR), calendar.get(Calendar.MONTH), calendar.get(Calendar.DAY_OF_MONTH))
            
            datePicker.datePicker.minDate = calendar.timeInMillis
            calendar.add(Calendar.DAY_OF_MONTH, 7)
            datePicker.datePicker.maxDate = calendar.timeInMillis
            datePicker.show()
        }

        // 4. Confirm Reservation
        val buttonConfirm = findViewById<Button>(R.id.buttonConfirmReservation)
        val progressBar = findViewById<ProgressBar>(R.id.progressReserve)

        buttonConfirm.setOnClickListener {
            if (selectedStationId == null || selectedSlot == null || selectedDateStr == null) {
                Toast.makeText(this, "Please select Station, Slot, and Date.", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            val body = JSONObject().apply {
                put("prosumerNic", nic)
                put("slotId", selectedSlot!!.id)
                put("nodeId", selectedStationId)
                // Use the selected date combined with slot's time if needed, but API just takes a date string
                put("reservationDate", "${selectedDateStr}T00:00:00Z")
            }

            buttonConfirm.isEnabled = false
            progressBar.visibility = View.VISIBLE

            lifecycleScope.launch(Dispatchers.IO) {
                val result = ApiClient.post(this@ReserveSlotActivity, "Reservations", body)
                withContext(Dispatchers.Main) {
                    buttonConfirm.isEnabled = true
                    progressBar.visibility = View.GONE
                    if (result.isSuccess) {
                        val intent = Intent(this@ReserveSlotActivity, BookingSummaryActivity::class.java)
                        intent.putExtra("MESSAGE", "Booking Confirmed!")
                        startActivity(intent)
                        finish()
                    } else {
                        Toast.makeText(this@ReserveSlotActivity, "Failed: ${result.message}", Toast.LENGTH_LONG).show()
                    }
                }
            }
        }
    }

    private fun fetchSlotsForStation(nodeId: String, spinnerSlot: Spinner) {
        lifecycleScope.launch(Dispatchers.IO) {
            val response = ApiClient.get(this@ReserveSlotActivity, "slots?nodeId=$nodeId&available=true")
            withContext(Dispatchers.Main) {
                availableSlots.clear()
                if (response != null) {
                    try {
                        val array = JSONArray(response)
                        val inputFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.getDefault())
                        val outputFormat = SimpleDateFormat("dd MMM, hh:mm a", Locale.getDefault())
                        for (i in 0 until array.length()) {
                            val slot = array.getJSONObject(i)
                            val id = slot.optString("id")
                            val startTimeStr = slot.optString("startTime")
                            val endTimeStr = slot.optString("endTime")
                            
                            val startParsed = inputFormat.parse(startTimeStr.replace("Z", ""))
                            val endParsed = inputFormat.parse(endTimeStr.replace("Z", ""))
                            
                            val display = if (startParsed != null && endParsed != null) {
                                "${outputFormat.format(startParsed)} - ${SimpleDateFormat("hh:mm a", Locale.getDefault()).format(endParsed)}"
                            } else {
                                "Slot ${slot.optInt("slotNumber", i + 1)}"
                            }
                            availableSlots.add(Slot(id, display, startTimeStr))
                        }
                    } catch (e: Exception) {}
                }
                if (availableSlots.isEmpty()) {
                    val adapter = ArrayAdapter(this@ReserveSlotActivity, android.R.layout.simple_spinner_item, listOf("No slots available"))
                    spinnerSlot.adapter = adapter
                    selectedSlot = null
                } else {
                    val adapter = ArrayAdapter(
                        this@ReserveSlotActivity,
                        android.R.layout.simple_spinner_item,
                        availableSlots.map { it.display }
                    )
                    adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
                    spinnerSlot.adapter = adapter
                }
            }
        }
    }
}
