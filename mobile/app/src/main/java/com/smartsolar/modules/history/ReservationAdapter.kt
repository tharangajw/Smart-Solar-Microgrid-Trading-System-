package com.smartsolar.modules.history

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.smartsolar.R
import com.smartsolar.models.Reservation

class ReservationAdapter(
    private var reservations: List<Reservation>,
    private val onCancelClick: (Reservation) -> Unit,
    private val onViewQrClick: (Reservation) -> Unit
) : RecyclerView.Adapter<ReservationAdapter.ViewHolder>() {

    class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val textStation: TextView = view.findViewById(R.id.textViewStationName)
        val textDate: TextView = view.findViewById(R.id.textViewDate)
        val textStatus: TextView = view.findViewById(R.id.textViewStatus)
        val btnCancel: TextView = view.findViewById(R.id.textViewCancel)
        val btnViewQr: TextView = view.findViewById(R.id.textViewViewQr)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_reservation, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val res = reservations[position]
        holder.textStation.text = res.stationName
        holder.textDate.text = res.scheduledDate.substringBefore("T")
        holder.textStatus.text = res.status
        
        // Rules: Cancel allowed for Pending/Approved. QR only once Approved.
        if (res.status == "Pending" || res.status == "Approved") {
            holder.btnCancel.visibility = View.VISIBLE
            holder.btnCancel.setOnClickListener { onCancelClick(res) }
        } else {
            holder.btnCancel.visibility = View.GONE
        }

        if (res.status == "Approved" && !res.qrCodeId.isNullOrBlank()) {
            holder.btnViewQr.visibility = View.VISIBLE
            holder.btnViewQr.setOnClickListener { onViewQrClick(res) }
        } else {
            holder.btnViewQr.visibility = View.GONE
        }
    }

    override fun getItemCount() = reservations.size

    fun updateData(newList: List<Reservation>) {
        this.reservations = newList
        notifyDataSetChanged()
    }
}
