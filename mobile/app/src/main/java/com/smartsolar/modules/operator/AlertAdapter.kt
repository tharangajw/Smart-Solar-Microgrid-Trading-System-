package com.smartsolar.modules.operator

import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.smartsolar.R
import com.smartsolar.modules.prosumer.ReservationDetailActivity

data class AlertItem(
    val id: String,
    val title: String,
    val message: String,
    val timestamp: String,
    val status: String,
    val icon: String = "⚡"
)

class AlertAdapter(
    private val context: Context,
    private val alerts: List<AlertItem>
) : RecyclerView.Adapter<AlertAdapter.ViewHolder>() {

    inner class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val textIcon: TextView = view.findViewById(R.id.textAlertIcon)
        val textTitle: TextView = view.findViewById(R.id.textAlertTitle)
        val textMessage: TextView = view.findViewById(R.id.textAlertMessage)
        val textTime: TextView = view.findViewById(R.id.textAlertTime)
        val textBadge: TextView = view.findViewById(R.id.textAlertBadge)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(context).inflate(R.layout.item_alert, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val item = alerts[position]
        holder.textIcon.text = item.icon
        holder.textTitle.text = item.title
        holder.textMessage.text = item.message
        holder.textTime.text = item.timestamp
        holder.textBadge.text = item.status.uppercase()

        val (bgColor, textColor) = when (item.status.lowercase()) {
            "pending"   -> "#FEF3C7" to "#92400E"
            "approved"  -> "#DBEAFE" to "#1E40AF"
            "completed" -> "#DCFCE7" to "#166534"
            "cancelled" -> "#FEE2E2" to "#991B1B"
            else        -> "#F3F4F6" to "#4B5563"
        }
        try {
            holder.textBadge.background.mutate().setTint(Color.parseColor(bgColor))
            holder.textBadge.setTextColor(Color.parseColor(textColor))
        } catch (_: Exception) {}

        holder.itemView.setOnClickListener {
            if (item.id.isNotEmpty()) {
                val intent = Intent(context, ReservationDetailActivity::class.java)
                intent.putExtra("BOOKING_ID", item.id)
                context.startActivity(intent)
            }
        }
    }

    override fun getItemCount() = alerts.size
}
