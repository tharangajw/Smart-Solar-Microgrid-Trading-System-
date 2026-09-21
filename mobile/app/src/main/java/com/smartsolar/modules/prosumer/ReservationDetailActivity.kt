// Trigger IDE re-index
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
import com.smartsolar.modules.prosumer.UpdateReservationActivity
import com.smartsolar.modules.prosumer.BookingSummaryActivity
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONObject

class ReservationDetailActivity : AppCompatActivity() {

    private var bookingId: String? = null
    private var nodeId: String? = null
    private var slotId: String? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_reservation_detail)

        bookingId = intent.getStringExtra("BOOKING_ID")
        findViewById<View>(R.id.buttonBack).setOnClickListener { finish() }

        if (bookingId == null) {
            Toast.makeText(this, "Invalid booking ID", Toast.LENGTH_SHORT).show()
            finish()
            return
        }

        loadDetails()
    }

    override fun onResume() {
        super.onResume()
        if (bookingId != null) loadDetails()
    }

    private fun loadDetails() {
        val progress = findViewById<ProgressBar>(R.id.progressDetail)
        val content = findViewById<View>(R.id.layoutContent)
        progress.visibility = View.VISIBLE
        content.visibility = View.GONE

        lifecycleScope.launch(Dispatchers.IO) {
            val response = ApiClient.get(this@ReservationDetailActivity, "Reservations/$bookingId")
            withContext(Dispatchers.Main) {
                progress.visibility = View.GONE
                if (response != null) {
                    try {
                        val obj = JSONObject(response)
                        nodeId = obj.optString("nodeId")
                        slotId = obj.optString("slotId")
                        val status = obj.optString("status")
                        
                        findViewById<TextView>(R.id.textId).text = obj.optString("id", obj.optString("_id"))
                        findViewById<TextView>(R.id.textNode).text = nodeId
                        findViewById<TextView>(R.id.textSlot).text = slotId
                        findViewById<TextView>(R.id.textDate).text = obj.optString("reservationDate")
                        findViewById<TextView>(R.id.textStatus).text = status
                        findViewById<TextView>(R.id.textCreated).text = obj.optString("createdAt")

                        content.visibility = View.VISIBLE

                        val layoutActions = findViewById<View>(R.id.layoutActions)
                        if (status.equals("Pending", true) || status.equals("Approved", true)) {
                            layoutActions.visibility = View.VISIBLE
                            findViewById<View>(R.id.buttonEdit).setOnClickListener {
                                val intent = Intent(this@ReservationDetailActivity, UpdateReservationActivity::class.java)
                                intent.putExtra("BOOKING_ID", bookingId)
                                intent.putExtra("NODE_ID", nodeId)
                                startActivity(intent)
                            }
                            findViewById<View>(R.id.buttonCancel).setOnClickListener {
                                showCancelDialog()
                            }
                        } else {
                            layoutActions.visibility = View.GONE
                        }
                    } catch (e: Exception) {
                        Toast.makeText(this@ReservationDetailActivity, "Error parsing details", Toast.LENGTH_SHORT).show()
                    }
                } else {
                    Toast.makeText(this@ReservationDetailActivity, "Failed to load details", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    private fun showCancelDialog() {
        val input = EditText(this)
        input.hint = "Reason for cancellation"
        val dialog = AlertDialog.Builder(this)
            .setTitle("Cancel Reservation")
            .setMessage("Are you sure you want to cancel this booking? Updates require 12 hours notice.")
            .setView(input)
            .setPositiveButton("Confirm Cancel") { _, _ ->
                cancelBooking(input.text.toString())
            }
            .setNegativeButton("No", null)
            .create()
        dialog.show()
    }

    private fun cancelBooking(reason: String) {
        val body = JSONObject().apply { put("cancelledReason", reason) }
        lifecycleScope.launch(Dispatchers.IO) {
            val result = ApiClient.put(this@ReservationDetailActivity, "Reservations/$bookingId/cancel", body)
            withContext(Dispatchers.Main) {
                if (result.isSuccess) {
                    val intent = Intent(this@ReservationDetailActivity, BookingSummaryActivity::class.java)
                    intent.putExtra("MESSAGE", "Booking Cancelled!")
                    startActivity(intent)
                    finish()
                } else {
                    Toast.makeText(this@ReservationDetailActivity, "Cancel failed: ${result.message}", Toast.LENGTH_LONG).show()
                }
            }
        }
    }
}
