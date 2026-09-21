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
import com.smartsolar.modules.prosumer.BookingSummaryActivity
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

        findViewById<View>(R.id.buttonBack).setOnClickListener { finish() }

        if (bookingId == null || nodeId == null) {
            Toast.makeText(this, "Invalid booking data", Toast.LENGTH_SHORT).show()
            finish()
            return
        }

        findViewById<TextView>(R.id.textNodeId).text = nodeId
        
        val textSlotPicker = findViewById<TextView>(R.id.textSlotPicker)
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
            if (selectedSlot == null) {
                Toast.makeText(this, "Please select a new slot", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            
            val body = JSONObject().apply {
                put("slotId", selectedSlot!!.id)
                put("reservationDate", selectedSlot!!.startTime)
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
                        Toast.makeText(this@UpdateReservationActivity, "Update failed: ${result.message}", Toast.LENGTH_LONG).show()
                    }
                }
            }
        }

        fetchSlots()
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
