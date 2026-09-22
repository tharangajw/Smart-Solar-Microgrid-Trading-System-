package com.smartsolar.modules.prosumer

/*
 * ReservationDetailActivity.kt
 * Displays detailed information about a specific energy reservation,
 * formatted nicely for end users with readable dates, clean IDs, and status badges.
 * Author: Member 4 – Operator Product
 */

import android.content.Intent
import android.graphics.Color
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
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Locale
import java.util.TimeZone

class ReservationDetailActivity : AppCompatActivity() {

    private var bookingId: String? = null
    private var nodeId: String? = null
    private var slotId: String? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_reservation_detail)

        bookingId = intent.getStringExtra("BOOKING_ID")
        findViewById<View>(R.id.btnNavBack)?.setOnClickListener { finish() }
        findViewById<TextView>(R.id.textNavTitle)?.text = "Reservation Details"
        findViewById<TextView>(R.id.textNavSubtitle)?.text = "Booking Reference Info"

        if (bookingId.isNullOrEmpty()) {
            Toast.makeText(this, "Invalid booking ID", Toast.LENGTH_SHORT).show()
            finish()
            return
        }

        loadDetails()
    }

    override fun onResume() {
        super.onResume()
        if (!bookingId.isNullOrEmpty()) loadDetails()
    }

    private fun loadDetails() {
        val progress = findViewById<ProgressBar>(R.id.progressDetail)
        val content = findViewById<View>(R.id.layoutContent)

        progress.visibility = View.GONE
        content.visibility = View.VISIBLE

        // Populate initial view
        populateView(
            id = bookingId,
            node = nodeId,
            slot = slotId,
            rawDate = null,
            rawStatus = "Approved",
            rawCreated = null
        )

        val buttonViewQR = findViewById<Button>(R.id.buttonViewQR)
        buttonViewQR.visibility = View.VISIBLE
        buttonViewQR.setOnClickListener {
            val qrJson = JSONObject().apply {
                put("id", bookingId)
                put("qrCodeId", "QR_$bookingId")
                put("status", "Approved")
            }.toString()
            val intent = Intent(this@ReservationDetailActivity, com.smartsolar.modules.qr.QRDisplayActivity::class.java)
            intent.putExtra("RESERVATION_DATA", qrJson)
            startActivity(intent)
        }

        val layoutActions = findViewById<View>(R.id.layoutActions)
        layoutActions.visibility = View.VISIBLE

        findViewById<View>(R.id.buttonEdit).setOnClickListener {
            val intent = Intent(this@ReservationDetailActivity, UpdateReservationActivity::class.java)
            intent.putExtra("BOOKING_ID", bookingId)
            intent.putExtra("NODE_ID", nodeId ?: "Station Hub")
            startActivity(intent)
        }

        findViewById<View>(R.id.buttonCancel).setOnClickListener {
            showCancelDialog()
        }

        // Fetch latest details from API in background
        lifecycleScope.launch(Dispatchers.IO) {
            val response = ApiClient.get(this@ReservationDetailActivity, "Reservations/$bookingId")
            withContext(Dispatchers.Main) {
                if (response != null && response.trim().startsWith("{")) {
                    try {
                        val obj = JSONObject(response)
                        val fullId = obj.optString("id", obj.optString("_id", bookingId ?: ""))
                        nodeId = obj.optString("nodeId", "Station Hub")
                        val nodeName = obj.optString("nodeName", obj.optString("stationName", ""))
                        slotId = obj.optString("slotId", "Energy Slot")
                        val status = obj.optString("status", "Approved")
                        val rawDate = obj.optString("reservationDate", "")
                        val rawCreated = obj.optString("createdAt", "")

                        populateView(
                            id = if (fullId.isNotEmpty()) fullId else bookingId,
                            node = nodeId,
                            nodeName = nodeName,
                            slot = slotId,
                            rawDate = rawDate,
                            rawStatus = status,
                            rawCreated = rawCreated
                        )

                        buttonViewQR.visibility = View.VISIBLE
                        buttonViewQR.setOnClickListener {
                            val intent = Intent(this@ReservationDetailActivity, com.smartsolar.modules.qr.QRDisplayActivity::class.java)
                            intent.putExtra("RESERVATION_DATA", obj.toString())
                            startActivity(intent)
                        }
                    } catch (_: Exception) {}
                }
            }
        }
    }

    private fun populateView(
        id: String?,
        node: String?,
        nodeName: String? = null,
        slot: String?,
        rawDate: String?,
        rawStatus: String?,
        rawCreated: String?
    ) {
        val textId = findViewById<TextView>(R.id.textId)
        val textFullId = findViewById<TextView>(R.id.textFullId)
        val textNode = findViewById<TextView>(R.id.textNode)
        val textSlot = findViewById<TextView>(R.id.textSlot)
        val textDate = findViewById<TextView>(R.id.textDate)
        val textStatus = findViewById<TextView>(R.id.textStatus)
        val textCreated = findViewById<TextView>(R.id.textCreated)

        // 1. Formatting ID
        val rawId = id ?: "–"
        if (rawId.length > 8) {
            textId.text = "RES-${rawId.takeLast(8).uppercase()}"
            textFullId.visibility = View.VISIBLE
            textFullId.text = "Full ID: $rawId"
        } else {
            textId.text = rawId
            textFullId.visibility = View.GONE
        }

        // 2. Formatting Node
        textNode.text = when {
            !nodeName.isNullOrEmpty() -> nodeName
            node != null && node.length >= 12 -> "Grid Station (#${node.takeLast(6).uppercase()})"
            !node.isNullOrEmpty() -> node
            else -> "Grid Station Hub"
        }

        // 3. Formatting Slot
        textSlot.text = formatSlotDisplay(slot)

        // 4. Formatting Date
        textDate.text = formatDateDisplay(rawDate)

        // 5. Formatting Created Timestamp
        textCreated.text = formatCreatedDisplay(rawCreated)

        // 6. Formatting Status Badge
        val statusText = if (!rawStatus.isNullOrEmpty()) rawStatus else "Approved"
        textStatus.text = statusText
        applyStatusBadgeStyle(textStatus, statusText)
    }

    private fun formatSlotDisplay(slot: String?): String {
        if (slot.isNullOrEmpty() || slot == "–") return "Energy Slot 1"
        val cleaned = slot.replace("_", " ").replace("-", " ")
        return cleaned.split(" ")
            .filter { it.isNotEmpty() }
            .joinToString(" ") { word ->
                word.lowercase().replaceFirstChar { if (it.isLowerCase()) it.titlecase(Locale.getDefault()) else it.toString() }
            }
    }

    private fun formatDateDisplay(rawDate: String?): String {
        if (rawDate.isNullOrEmpty() || rawDate == "–") return "Scheduled"
        return try {
            val clean = rawDate.replace("Z", "")
            val inputFormats = arrayOf(
                "yyyy-MM-dd'T'HH:mm:ss.SSS",
                "yyyy-MM-dd'T'HH:mm:ss",
                "yyyy-MM-dd"
            )
            var date: java.util.Date? = null
            for (fmt in inputFormats) {
                try {
                    val parser = SimpleDateFormat(fmt, Locale.getDefault())
                    parser.timeZone = TimeZone.getTimeZone("UTC")
                    date = parser.parse(clean.take(fmt.length))
                    if (date != null) break
                } catch (_: Exception) {}
            }
            if (date != null) {
                val outFormat = SimpleDateFormat("EEE, dd MMM yyyy", Locale.getDefault())
                outFormat.format(date)
            } else {
                rawDate.take(10)
            }
        } catch (_: Exception) {
            rawDate.take(10)
        }
    }

    private fun formatCreatedDisplay(rawCreated: String?): String {
        if (rawCreated.isNullOrEmpty() || rawCreated == "–") return "Active"
        return try {
            val clean = rawCreated.replace("Z", "")
            val inputFormats = arrayOf(
                "yyyy-MM-dd'T'HH:mm:ss.SSS",
                "yyyy-MM-dd'T'HH:mm:ss",
                "yyyy-MM-dd"
            )
            var date: java.util.Date? = null
            for (fmt in inputFormats) {
                try {
                    val parser = SimpleDateFormat(fmt, Locale.getDefault())
                    parser.timeZone = TimeZone.getTimeZone("UTC")
                    date = parser.parse(clean.take(fmt.length))
                    if (date != null) break
                } catch (_: Exception) {}
            }
            if (date != null) {
                val outFormat = SimpleDateFormat("dd MMM yyyy 'at' hh:mm a", Locale.getDefault())
                outFormat.format(date)
            } else {
                rawCreated
            }
        } catch (_: Exception) {
            rawCreated
        }
    }

    private fun applyStatusBadgeStyle(textView: TextView, status: String) {
        val (bgColor, textColor) = when (status.lowercase()) {
            "pending"   -> "#FEF3C7" to "#92400E"   // yellow-100 / yellow-800
            "approved"  -> "#DBEAFE" to "#1E40AF"   // blue-100   / blue-800
            "completed" -> "#DCFCE7" to "#166534"   // green-100  / green-800
            "cancelled" -> "#FEE2E2" to "#991B1B"   // red-100    / red-800
            else        -> "#F3F4F6" to "#4B5563"   // gray
        }
        try {
            textView.background.mutate().setTint(Color.parseColor(bgColor))
            textView.setTextColor(Color.parseColor(textColor))
        } catch (_: Exception) {}
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
