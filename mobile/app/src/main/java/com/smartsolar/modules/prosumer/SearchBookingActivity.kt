package com.smartsolar.modules.prosumer

import android.app.DatePickerDialog
import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.smartsolar.R
import com.smartsolar.data.remote.ApiClient
import com.smartsolar.utils.SessionManager
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.*

class SearchBookingActivity : AppCompatActivity() {

    private lateinit var spinnerStatus: Spinner
    private lateinit var textFromDate: TextView
    private lateinit var textToDate: TextView
    private lateinit var recycler: RecyclerView
    private lateinit var progressSearch: ProgressBar
    private lateinit var textEmpty: TextView

    private var fromDateIso: String? = null
    private var toDateIso: String? = null
    private val resultsList = mutableListOf<Booking>()
    
    private val displayFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
    private val isoFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.getDefault()).apply {
        timeZone = TimeZone.getTimeZone("UTC")
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_search_booking)

        findViewById<View>(R.id.buttonBack).setOnClickListener { finish() }

        spinnerStatus = findViewById(R.id.spinnerStatus)
        textFromDate = findViewById(R.id.textFromDate)
        textToDate = findViewById(R.id.textToDate)
        recycler = findViewById(R.id.recyclerSearch)
        progressSearch = findViewById(R.id.progressSearch)
        textEmpty = findViewById(R.id.textEmpty)

        recycler.layoutManager = LinearLayoutManager(this)

        val statuses = arrayOf("All", "Pending", "Approved", "Cancelled", "Completed")
        spinnerStatus.adapter = ArrayAdapter(this, android.R.layout.simple_spinner_dropdown_item, statuses)

        textFromDate.setOnClickListener { pickDate { display, iso -> 
            textFromDate.text = display
            fromDateIso = iso 
        }}
        
        textToDate.setOnClickListener { pickDate { display, iso -> 
            textToDate.text = display
            toDateIso = iso 
        }}

        findViewById<Button>(R.id.buttonSearch).setOnClickListener {
            performSearch()
        }
    }

    private fun pickDate(onSelected: (String, String) -> Unit) {
        val cal = Calendar.getInstance()
        DatePickerDialog(this, { _, y, m, d ->
            cal.set(y, m, d)
            onSelected(displayFormat.format(cal.time), isoFormat.format(cal.time))
        }, cal.get(Calendar.YEAR), cal.get(Calendar.MONTH), cal.get(Calendar.DAY_OF_MONTH)).show()
    }

    private fun performSearch() {
        val nic = SessionManager(this).getNic() ?: ""
        val status = if (spinnerStatus.selectedItemPosition == 0) "" else spinnerStatus.selectedItem.toString()
        
        var query = "Reservations/search?nic=$nic"
        if (status.isNotEmpty()) query += "&status=$status"
        if (fromDateIso != null) query += "&from=$fromDateIso"
        if (toDateIso != null) query += "&to=$toDateIso"

        progressSearch.visibility = View.VISIBLE
        recycler.visibility = View.GONE
        textEmpty.visibility = View.GONE

        lifecycleScope.launch(Dispatchers.IO) {
            val response = ApiClient.get(this@SearchBookingActivity, query)
            withContext(Dispatchers.Main) {
                progressSearch.visibility = View.GONE
                resultsList.clear()
                if (response != null) {
                    try {
                        val array = if (response.trim().startsWith("[")) JSONArray(response) else JSONObject(response).optJSONArray("data") ?: JSONArray()
                        for (i in 0 until array.length()) {
                            val item = array.getJSONObject(i)
                            resultsList.add(
                                Booking(
                                    id = item.optString("id", item.optString("_id", "")),
                                    nodeId = item.optString("nodeId", ""),
                                    slotId = item.optString("slotId", ""),
                                    status = item.optString("status", ""),
                                    reservationDate = item.optString("reservationDate", "")
                                )
                            )
                        }
                    } catch (e: Exception) {}
                }
                
                if (resultsList.isEmpty()) {
                    textEmpty.visibility = View.VISIBLE
                } else {
                    recycler.visibility = View.VISIBLE
                    recycler.adapter = BookingAdapter(this@SearchBookingActivity, resultsList, false) { booking ->
                        val intent = Intent(this@SearchBookingActivity, ReservationDetailActivity::class.java)
                        intent.putExtra("BOOKING_ID", booking.id)
                        startActivity(intent)
                    }
                }
            }
        }
    }
}
