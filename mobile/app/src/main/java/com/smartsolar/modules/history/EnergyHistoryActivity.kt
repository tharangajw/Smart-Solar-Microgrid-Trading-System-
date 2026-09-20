package com.smartsolar.modules.history

import android.content.Intent
import android.os.Bundle
import android.os.StrictMode
import android.text.Editable
import android.text.TextWatcher
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.smartsolar.R
import com.smartsolar.models.Reservation
import com.smartsolar.modules.qr.QRDisplayActivity
import com.smartsolar.modules.reservations.ReservationRepository
import org.json.JSONObject

class EnergyHistoryActivity : AppCompatActivity() {

    private lateinit var repository: ReservationRepository
    private lateinit var recyclerView: RecyclerView
    private lateinit var adapter: ReservationAdapter
    private var fullList: List<Reservation> = listOf()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_booking_history)

        val policy = StrictMode.ThreadPolicy.Builder().permitAll().build()
        StrictMode.setThreadPolicy(policy)

        repository = ReservationRepository(this)
        recyclerView = findViewById(R.id.recyclerViewBookings)
        recyclerView.layoutManager = LinearLayoutManager(this)

        val editSearch = findViewById<EditText>(R.id.editTextSearch)
        editSearch.addTextChangedListener(object : TextWatcher {
            override fun afterTextChanged(s: Editable?) { filter(s.toString()) }
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
        })

        loadHistory()
    }

    private fun loadHistory() {
        fullList = repository.getProsumerReservations()
        adapter = ReservationAdapter(fullList, 
            { reservation -> showCancelConfirmation(reservation) },
            { reservation -> viewQr(reservation) }
        )
        recyclerView.adapter = adapter
    }

    private fun filter(text: String) {
        val filtered = fullList.filter {
            it.stationName.contains(text, ignoreCase = true) || it.status.contains(text, ignoreCase = true)
        }
        adapter.updateData(filtered)
    }

    private fun viewQr(reservation: Reservation) {
        val qrCodeId = reservation.qrCodeId
        if (qrCodeId.isNullOrBlank()) {
            Toast.makeText(this, "QR code is not available for this booking yet", Toast.LENGTH_LONG).show()
            return
        }

        val intent = Intent(this, QRDisplayActivity::class.java)
        // Pass essential data for QR generation (JSON string)
        val data = JSONObject().apply {
            put("id", reservation.id)
            put("qrCodeId", qrCodeId)
            put("stationName", reservation.stationName)
        }.toString()
        intent.putExtra("RESERVATION_DATA", data)
        startActivity(intent)
    }

    private fun showCancelConfirmation(reservation: Reservation) {
        AlertDialog.Builder(this)
            .setTitle("Cancel Reservation")
            .setMessage("Are you sure you want to cancel this booking at ${reservation.stationName}?")
            .setPositiveButton("Yes, Cancel") { _, _ ->
                val result = repository.cancelReservation(reservation.id)
                if (result.isSuccess) {
                    Toast.makeText(this, "Reservation Cancelled", Toast.LENGTH_SHORT).show()
                    loadHistory()
                } else {
                    Toast.makeText(this, result.message ?: "Cancellation Failed", Toast.LENGTH_LONG).show()
                }
            }
            .setNegativeButton("No", null)
            .show()
    }
}
