package com.smartsolar.modules.reservations

import android.app.DatePickerDialog
import android.content.Intent
import android.os.Bundle
import android.os.StrictMode
import android.widget.ArrayAdapter
import android.widget.AutoCompleteTextView
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.smartsolar.R
import com.smartsolar.models.Station
import com.smartsolar.modules.history.EnergyHistoryActivity
import java.util.*

class CreateReservationActivity : AppCompatActivity() {

    private lateinit var repository: ReservationRepository
    private var selectedStationId: String? = null
    private var stationsList: List<Station> = listOf()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_reservation_form)

        val policy = StrictMode.ThreadPolicy.Builder().permitAll().build()
        StrictMode.setThreadPolicy(policy)

        repository = ReservationRepository(this)

        val autoCompleteStation = findViewById<AutoCompleteTextView>(R.id.autoCompleteTextViewStation)
        val editTextDate = findViewById<EditText>(R.id.editTextDate)
        val buttonSubmit = findViewById<Button>(R.id.buttonSubmit)
        val textViewBack = findViewById<TextView>(R.id.textViewBack)

        loadStations(autoCompleteStation)

        editTextDate.setOnClickListener {
            showDatePicker(editTextDate)
        }

        buttonSubmit.setOnClickListener {
            val date = editTextDate.text.toString().trim()
            if (selectedStationId == null) {
                Toast.makeText(this, "Please select a station", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            if (date.isEmpty()) {
                Toast.makeText(this, "Please select a date", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            val result = repository.createReservation(selectedStationId!!, date)
            if (result.isSuccess) {
                Toast.makeText(this, "Booking Requested! Waiting for grid approval.", Toast.LENGTH_LONG).show()
                // Redirect to history to see pending booking
                startActivity(Intent(this, EnergyHistoryActivity::class.java))
                finish()
            } else {
                Toast.makeText(this, result.message ?: "Booking Failed", Toast.LENGTH_LONG).show()
            }
        }

        textViewBack.setOnClickListener { finish() }
    }

    private fun loadStations(autoComplete: AutoCompleteTextView) {
        stationsList = repository.getStations()
        val displayList = stationsList.map { "${it.name} (${it.availableSlots} slots)" }
        val adapter = ArrayAdapter(this, android.R.layout.simple_dropdown_item_1line, displayList)
        autoComplete.setAdapter(adapter)
        autoComplete.setOnItemClickListener { _, _, position, _ ->
            val selectedStation = stationsList[position]
            selectedStationId = selectedStation.id
            if (selectedStation.availableSlots <= 0) {
                Toast.makeText(this, "This station is full. Please select another.", Toast.LENGTH_SHORT).show()
                selectedStationId = null
                autoComplete.setText("")
            }
        }
    }

    private fun showDatePicker(editText: EditText) {
        val calendar = Calendar.getInstance()
        val year = calendar.get(Calendar.YEAR)
        val month = calendar.get(Calendar.MONTH)
        val day = calendar.get(Calendar.DAY_OF_MONTH)

        val datePicker = DatePickerDialog(this, { _, selectedYear, selectedMonth, selectedDay ->
            val formattedDate = String.format("%04d-%02d-%02d", selectedYear, selectedMonth + 1, selectedDay)
            editText.setText(formattedDate)
        }, year, month, day)
        
        datePicker.datePicker.minDate = System.currentTimeMillis()
        val maxDate = Calendar.getInstance()
        maxDate.add(Calendar.DAY_OF_MONTH, 7)
        datePicker.datePicker.maxDate = maxDate.timeInMillis
        
        datePicker.show()
    }
}
