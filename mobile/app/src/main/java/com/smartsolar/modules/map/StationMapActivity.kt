package com.smartsolar.modules.map

/*
 * StationMapActivity.kt
 * Displays all solar grid stations on a Google Maps interface.
 * Fetches station data from the central API via GET /stations,
 * then plots each station as a map marker with name and capacity.
 * Tapping a marker shows a bottom card with full station details.
 * Author: Member 4 – Operator Product
 */

import android.os.Bundle
import android.os.StrictMode
import android.view.View
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.google.android.gms.maps.CameraUpdateFactory
import com.google.android.gms.maps.GoogleMap
import com.google.android.gms.maps.OnMapReadyCallback
import com.google.android.gms.maps.SupportMapFragment
import com.google.android.gms.maps.model.LatLng
import com.google.android.gms.maps.model.MarkerOptions
import com.smartsolar.R
import com.smartsolar.data.remote.ApiClient
import org.json.JSONArray

class StationMapActivity : AppCompatActivity(), OnMapReadyCallback {

    private lateinit var mMap: GoogleMap

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_map)

        // Allow network on main thread for simplicity (assignment scope)
        val policy = StrictMode.ThreadPolicy.Builder().permitAll().build()
        StrictMode.setThreadPolicy(policy)

        // Initialise the Google Map fragment
        val mapFragment = supportFragmentManager
            .findFragmentById(R.id.map) as SupportMapFragment
        mapFragment.getMapAsync(this)
    }

    override fun onMapReady(googleMap: GoogleMap) {
        mMap = googleMap

        // Fetch stations from the API and plot them
        loadStationsFromApi()
    }

    /**
     * Fetches all solar stations from GET /stations API endpoint,
     * then plots each as a marker on the Google Map.
     */
    private fun loadStationsFromApi() {
        val response = ApiClient.get(this, "stations")

        if (response != null) {
            try {
                val stationsArray = JSONArray(response)
                var firstStation: LatLng? = null

                for (i in 0 until stationsArray.length()) {
                    val station = stationsArray.getJSONObject(i)

                    // Parse station fields from API response (check for 'id' and '_id')
                    val name = station.optString("name", "Station $i")
                    val lat = station.optDouble("latitude", 0.0)
                    val lng = station.optDouble("longitude", 0.0)
                    val capacity = station.optDouble("capacityKwh", 0.0)
                    val slots = station.optInt("availableSlots", 0)
                    val stationId = if (station.has("id")) station.getString("id") else station.optString("_id", "")

                    if (lat != 0.0 && lng != 0.0) {
                        val position = LatLng(lat, lng)

                        // Add a map marker for this station
                        val marker = mMap.addMarker(
                            MarkerOptions()
                                .position(position)
                                .title(name)
                                .snippet("Capacity: $capacity kWh | Slots: $slots")
                        )
                        marker?.tag = stationId

                        if (firstStation == null) firstStation = position
                    }
                }

                // Move camera to first station, or default to Sri Lanka
                val cameraTarget = firstStation ?: LatLng(7.8731, 80.7718)
                mMap.moveCamera(CameraUpdateFactory.newLatLngZoom(cameraTarget, 10f))

                // Show station details card on marker click
                mMap.setOnMarkerClickListener { marker ->
                    val cardView = findViewById<View>(R.id.cardStationDetails)
                    val textName = findViewById<TextView>(R.id.textViewStationName)
                    val textCapacity = findViewById<TextView>(R.id.textViewStationCapacity)
                    val textSlots = findViewById<TextView>(R.id.textViewAvailableSlots)

                    textName.text = marker.title
                    val snippetParts = marker.snippet?.split("|") ?: listOf()
                    textCapacity.text = snippetParts.getOrElse(0) { "Capacity: N/A" }.trim()
                    textSlots.text = snippetParts.getOrElse(1) { "Slots: N/A" }.trim()
                    cardView.visibility = View.VISIBLE
                    false
                }

            } catch (e: Exception) {
                Toast.makeText(this, "Error loading stations: ${e.message}", Toast.LENGTH_LONG).show()
                e.printStackTrace()
            }
        } else {
            Toast.makeText(this, "Failed to load stations from server", Toast.LENGTH_LONG).show()
        }
    }
}
