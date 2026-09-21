package com.smartsolar.modules.prosumer

/*
 * BookingAdapter.kt
 * RecyclerView adapter for booking items (both Upcoming and History tabs).
 * Shows date, node id, status badge (color-coded), booking id,
 * and a Cancel button for pending/approved upcoming bookings.
 */

import android.content.Context
import android.graphics.Color
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.smartsolar.R
import java.text.SimpleDateFormat
import java.util.Locale
import java.util.TimeZone

data class Booking(
    val id: String,
    val nodeId: String,
    val slotId: String,
    val status: String,         // "Pending" | "Approved" | "Cancelled" | "Completed"
    val reservationDate: String // ISO8601 string from API
)

class BookingAdapter(
    private val context: Context,
    private val bookings: List<Booking>,
    private val showCancel: Boolean,
    private val onCancel: (Booking) -> Unit
) : RecyclerView.Adapter<BookingAdapter.ViewHolder>() {

    inner class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val textDate: TextView = view.findViewById(R.id.textBookingDate)
        val textNode: TextView = view.findViewById(R.id.textBookingNode)
        val textStatus: TextView = view.findViewById(R.id.textBookingStatus)
        val textId: TextView = view.findViewById(R.id.textBookingId)
        val buttonCancel: Button = view.findViewById(R.id.buttonCancelBooking)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(context).inflate(R.layout.item_booking, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val booking = bookings[position]

        // Format date nicely: "2026-09-25T00:00:00Z" → "25 Sep 2026"
        holder.textDate.text = formatDate(booking.reservationDate)
        holder.textNode.text = "Node: ${booking.nodeId.take(16)}…"
        holder.textId.text = booking.id.take(16) + "…"

        // Status badge — matches web StatusBadge.jsx exactly
        val (bgColor, textColor) = when (booking.status.lowercase()) {
            "pending"   -> "#FEF3C7" to "#92400E"   // yellow-100 / yellow-800
            "approved"  -> "#DBEAFE" to "#1E40AF"   // blue-100   / blue-800
            "completed" -> "#DCFCE7" to "#166534"   // green-100  / green-800
            "cancelled" -> "#FEE2E2" to "#991B1B"   // red-100    / red-800
            else        -> "#F5F0E8" to "#5C5C5C"   // cream / charcoal-light
        }
        holder.textStatus.text = booking.status
        holder.textStatus.background.mutate().setTint(Color.parseColor(bgColor))
        holder.textStatus.setTextColor(Color.parseColor(textColor))

        // Show cancel only for pending/approved in the upcoming tab
        val canCancel = showCancel &&
                (booking.status.equals("Pending", ignoreCase = true) ||
                 booking.status.equals("Approved", ignoreCase = true))

        holder.buttonCancel.visibility = if (canCancel) View.VISIBLE else View.GONE
        holder.buttonCancel.setOnClickListener { onCancel(booking) }
    }

    override fun getItemCount() = bookings.size

    private fun formatDate(isoDate: String): String {
        return try {
            val parser = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.getDefault())
            parser.timeZone = TimeZone.getTimeZone("UTC")
            val displayFmt = SimpleDateFormat("dd MMM yyyy", Locale.getDefault())
            val date = parser.parse(isoDate)
            if (date != null) displayFmt.format(date) else isoDate
        } catch (_: Exception) {
            isoDate.take(10)
        }
    }
}
