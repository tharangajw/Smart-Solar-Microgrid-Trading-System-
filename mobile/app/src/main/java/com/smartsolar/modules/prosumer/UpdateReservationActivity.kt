package com.smartsolar.modules.prosumer

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.*
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.smartsolar.R
import com.smartsolar.data.remote.ApiClient
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.*

class UpdateReservationActivity : AppCompatActivity() {

    private data class Slot(val id: String, val display: String, val startTime: String)

    private var bookingId: String? = null
    private var nodeId: String? = null
    private val availableSlots = mutableListOf<Slot>()
    private var selectedSlot: Slot? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_update_reservation)

        bookingId = intent.getStringExtra("BOOKING_ID")
        nodeId = intent.getStringExtra("NODE_ID")

        // Nav back listener moved to bottom with confirmation dialog
        findViewById<TextView>(R.id.textNavTitle)?.text = "Update Reservation"
        findViewById<TextView>(R.id.textNavSubtitle)?.text = "Modify booking details"

        if (bookingId == null || nodeId == null) {
            Toast.makeText(this, "Invalid booking data", Toast.LENGTH_SHORT).show()
            finish()
            return
        }

        findViewById<TextView>(R.id.textNodeId).text = nodeId
        
        val textSlotPicker = findViewById<TextView>(R.id.textSlotPicker)
        val textDatePicker = findViewById<TextView>(R.id.textDatePicker)
        var selectedDateStr: String? = null

        textDatePicker.setOnClickListener {
            val calendar = Calendar.getInstance()
            val datePicker = android.app.DatePickerDialog(this, { _, year, month, dayOfMonth ->
                val selectedCal = Calendar.getInstance()
                selectedCal.set(year, month, dayOfMonth)
                val format = java.text.SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
                selectedDateStr = format.format(selectedCal.time)
                textDatePicker.text = selectedDateStr
            }, calendar.get(Calendar.YEAR), calendar.get(Calendar.MONTH), calendar.get(Calendar.DAY_OF_MONTH))
            
            datePicker.datePicker.minDate = calendar.timeInMillis
            calendar.add(Calendar.DAY_OF_MONTH, 7)
            datePicker.datePicker.maxDate = calendar.timeInMillis
            datePicker.show()
        }

        textSlotPicker.setOnClickListener {
            if (availableSlots.isEmpty()) {
                Toast.makeText(this, "No slots available", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            val slotDisplays = availableSlots.map { it.display }.toTypedArray()
            AlertDialog.Builder(this)
                .setTitle("Select a Slot")
                .setItems(slotDisplays) { _, which ->
                    selectedSlot = availableSlots[which]
                    textSlotPicker.text = selectedSlot!!.display
                }
                .show()
        }

        val buttonUpdate = findViewById<Button>(R.id.buttonUpdate)
        val progressUpdate = findViewById<ProgressBar>(R.id.progressUpdate)

        buttonUpdate.setOnClickListener {
            if (selectedSlot == null || selectedDateStr == null) {
                Toast.makeText(this, "Please select both a new Date and Slot", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            // check12HourRule usually expects a full ISO string. We can combine date and a dummy time or use slot time.
            // Using selectedDateStr + slot time (if we had it), or just bypass if not enough info.
            val mergedIso = "${selectedDateStr}T12:00:00Z" 
            if (!check12HourRule(mergedIso)) {
                return@setOnClickListener
            }
            
            val body = JSONObject().apply {
                put("slotId", selectedSlot!!.id)
                put("reservationDate", "${selectedDateStr}T00:00:00Z")
            }
            
            buttonUpdate.isEnabled = false
            progressUpdate.visibility = View.VISIBLE

            lifecycleScope.launch(Dispatchers.IO) {
                val result = ApiClient.put(this@UpdateReservationActivity, "Reservations/$bookingId", body)
                withContext(Dispatchers.Main) {
                    buttonUpdate.isEnabled = true
                    progressUpdate.visibility = View.GONE
                    if (result.isSuccess) {
                        val intent = Intent(this@UpdateReservationActivity, BookingSummaryActivity::class.java)
                        intent.putExtra("MESSAGE", "Booking Updated!")
                        startActivity(intent)
                        finish()
                    } else {
                        androidx.appcompat.app.AlertDialog.Builder(this@UpdateReservationActivity)
                            .setTitle("Update Failed")
                            .setMessage(result.message ?: "An unknown error occurred.")
                            .setPositiveButton("OK", null)
                            .show()
                    }
                }
            }
        }

        val backCallback = object : androidx.activity.OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (selectedSlot != null) {
                    androidx.appcompat.app.AlertDialog.Builder(this@UpdateReservationActivity)
                        .setTitle("Discard Changes?")
                        .setMessage("You have unsaved changes. Are you sure you want to go back?")
                        .setPositiveButton("Yes, Discard") { _, _ -> finish() }
                        .setNegativeButton("Cancel", null)
                        .show()
                } else {
                    finish()
                }
            }
        }
        onBackPressedDispatcher.addCallback(this, backCallback)
        
        findViewById<View>(R.id.btnNavBack)?.setOnClickListener { 
            backCallback.handleOnBackPressed()
        }

        fetchSlots()
    }

    private fun check12HourRule(reservationDateStr: String?): Boolean {
        if (reservationDateStr.isNullOrEmpty()) return true
        try {
            val format = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.getDefault())
            val date = format.parse(reservationDateStr.replace("Z", "").take(19))
            if (date != null) {
                val diffMillis = date.time - System.currentTimeMillis()
                val diffHours = diffMillis / (1000 * 60 * 60)
                if (diffHours < 12) {
                    androidx.appcompat.app.AlertDialog.Builder(this)
                        .setTitle("Invalid Time")
                        .setMessage("Updates and cancellations require at least 12 hours' notice.")
                        .setPositiveButton("OK", null)
                        .show()
                    return false
                }
            }
        } catch (_: Exception) {}
        return true
    }

    private fun fetchSlots() {
        val textSlotPicker = findViewById<TextView>(R.id.textSlotPicker)
        lifecycleScope.launch(Dispatchers.IO) {
            val response = ApiClient.get(this@UpdateReservationActivity, "slots?nodeId=$nodeId&available=true")
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
                                "Slot $i"
                            }
                            availableSlots.add(Slot(id, display, startTimeStr))
                        }
                    } catch (e: Exception) {}
                }
                if (availableSlots.isEmpty()) {
                    textSlotPicker.text = "No slots available"
                } else {
                    textSlotPicker.text = "Tap to pick a slot (${availableSlots.size} available)"
                }
            }
        }
    }
}
