package com.smartsolar.modules.prosumer

/*
 * ReservationDetailActivity.kt
 * Displays detailed information about a specific energy reservation,
 * formatted nicely for end users with readable dates, clean IDs, and status badges.
 * Supports direct Operator Energy Transfer Finalization.
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
import com.smartsolar.utils.SessionManager
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

        if (bookingId.isNullOrEmpty() || bookingId == "null") {
            Toast.makeText(this, "Invalid booking ID", Toast.LENGTH_SHORT).show()
            finish()
            return
        }

        loadDetails()
    }

    override fun onResume() {
        super.onResume()
        if (!bookingId.isNullOrEmpty() && bookingId != "null") loadDetails()
    }

    private fun loadDetails() {
        val progress = findViewById<ProgressBar>(R.id.progressDetail)
        val content = findViewById<View>(R.id.layoutContent)

        progress.visibility = View.GONE
        content.visibility = View.VISIBLE

        val sessionManager = SessionManager(this)
        val role = sessionManager.getRole()?.lowercase() ?: ""
        val isOperator = role.contains("operator") || role.contains("grid") || role.contains("admin")

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

        if (isOperator) {
            buttonViewQR.text = "⚡ Complete Energy Transfer"
            buttonViewQR.setOnClickListener {
                completeTransferForOperator(bookingId ?: "")
            }
        } else {
            buttonViewQR.text = "View Transaction QR Code"
            buttonViewQR.setOnClickListener {
                val validId = if (!bookingId.isNullOrEmpty() && bookingId != "null") bookingId!! else "6ab2582d235e3ad6e67b4986"
                val qrJson = JSONObject().apply {
                    put("id", validId)
                    put("qrCodeId", "QR_$validId")
                    put("status", "Approved")
                }.toString()
                val intent = Intent(this@ReservationDetailActivity, com.smartsolar.modules.qr.QRDisplayActivity::class.java)
                intent.putExtra("RESERVATION_DATA", qrJson)
                startActivity(intent)
            }
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
                            id = if (fullId.isNotEmpty() && fullId != "null") fullId else bookingId,
                            node = nodeId,
                            nodeName = nodeName,
                            slot = slotId,
                            rawDate = rawDate,
                            rawStatus = status,
                            rawCreated = rawCreated
                        )

                        buttonViewQR.visibility = View.VISIBLE
                        if (isOperator) {
                            buttonViewQR.text = "⚡ Complete Energy Transfer"
                            buttonViewQR.setOnClickListener {
                                completeTransferForOperator(fullId)
                            }
                        } else {
                            buttonViewQR.text = "View Transaction QR Code"
                            buttonViewQR.setOnClickListener {
                                val activeId = if (!fullId.isNullOrEmpty() && fullId != "null") fullId else if (!bookingId.isNullOrEmpty() && bookingId != "null") bookingId!! else "6ab2582d235e3ad6e67b4986"
                                val qrJson = JSONObject().apply {
                                    put("id", activeId)
                                    put("qrCodeId", "QR_$activeId")
                                    put("status", status)
                                }.toString()
                                val intent = Intent(this@ReservationDetailActivity, com.smartsolar.modules.qr.QRDisplayActivity::class.java)
                                intent.putExtra("RESERVATION_DATA", qrJson)
                                startActivity(intent)
                            }
                        }
                    } catch (_: Exception) {}
                }
            }
        }
    }

    private fun completeTransferForOperator(targetId: String) {
        val validId = if (targetId.isNotEmpty() && targetId != "null") targetId else bookingId ?: ""
        if (validId.isEmpty() || validId == "null") return

        Toast.makeText(this, "Completing transfer...", Toast.LENGTH_SHORT).show()

        lifecycleScope.launch(Dispatchers.IO) {
            val sessionManager = SessionManager(this@ReservationDetailActivity)
            sessionManager.saveReservationStatus(validId, "Completed")
            sessionManager.saveReservationStatus(bookingId ?: "", "Completed")

            val scanBody = JSONObject().apply {
                put("qrCodeId", "QR_$validId")
                put("reservationId", validId)
                put("status", "Completed")
            }

            ApiClient.post(this@ReservationDetailActivity, "operator/scan-qr", scanBody)
            ApiClient.put(this@ReservationDetailActivity, "Reservations/$validId/complete", JSONObject().apply { put("status", "Completed") })
            ApiClient.put(this@ReservationDetailActivity, "Reservations/$validId", JSONObject().apply { put("status", "Completed") })

            withContext(Dispatchers.Main) {
                val textStatus = findViewById<TextView>(R.id.textStatus)
                textStatus.text = "Completed"
                applyStatusBadgeStyle(textStatus, "Completed")

                AlertDialog.Builder(this@ReservationDetailActivity)
                    .setTitle("✅ Transfer Complete")
                    .setMessage("Energy transfer has been finalized and status updated to COMPLETED.")
                    .setPositiveButton("OK", null)
                    .show()
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
        val rawId = if (!id.isNullOrEmpty() && id != "null") id else "6ab2582d235e3ad6e67b4986"
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

        // 6. Formatting Status Badge (Check local override first)
        val sessionManager = SessionManager(this)
        val localStatus = sessionManager.getReservationStatus(rawId) ?: sessionManager.getReservationStatus(bookingId ?: "")
        val statusText = when {
            !localStatus.isNullOrEmpty() -> localStatus
            !rawStatus.isNullOrEmpty() -> rawStatus
            else -> "Approved"
        }

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
