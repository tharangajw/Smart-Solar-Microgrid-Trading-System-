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
import android.os.Handler
import android.os.Looper
import android.view.View
import android.widget.TextView
import android.widget.Toast
import com.google.android.gms.maps.CameraUpdateFactory
import com.google.android.gms.maps.GoogleMap
import com.google.android.gms.maps.OnMapReadyCallback
import com.google.android.gms.maps.SupportMapFragment
import com.google.android.gms.maps.model.LatLng
import com.google.android.gms.maps.model.MarkerOptions
import com.smartsolar.R
import com.smartsolar.data.remote.ApiClient
import org.json.JSONArray
import com.smartsolar.modules.common.BaseNavActivity

class StationMapActivity : BaseNavActivity(), OnMapReadyCallback {

    private lateinit var mMap: GoogleMap
    private val refreshHandler = Handler(Looper.getMainLooper())
    private val refreshIntervalMs = 5_000L
    private val refreshRunnable = object : Runnable {
        override fun run() {
            if (::mMap.isInitialized) {
                loadStationsFromApi()
                refreshHandler.postDelayed(this, refreshIntervalMs)
            }
        }
    }

    override fun getLayoutResourceId() = R.layout.activity_map
    override fun getMenuItemId() = R.id.nav_map

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Initialise the Google Map fragment with safe finding
        try {
            val mapFragment = supportFragmentManager
                .findFragmentById(R.id.map) as? SupportMapFragment
            
            if (mapFragment != null) {
                mapFragment.getMapAsync(this)
            } else {
                android.util.Log.e("StationMap", "Map Fragment not found in layout")
                Toast.makeText(this, "Map could not be loaded.", Toast.LENGTH_SHORT).show()
            }
        } catch (e: Exception) {
            android.util.Log.e("StationMap", "Error initializing map", e)
        }
    }

    override fun onMapReady(googleMap: GoogleMap) {
        mMap = googleMap
        
        // Basic map settings
        mMap.uiSettings.isZoomControlsEnabled = true
        mMap.uiSettings.isMapToolbarEnabled = true
        
        android.util.Log.d("StationMap", "Map Engine Ready. If screen is blank, check API Key in Cloud Console.")

        // Fetch stations from the API and plot them
        loadStationsFromApi()
        refreshHandler.postDelayed(refreshRunnable, refreshIntervalMs)
    }

    override fun onDestroy() {
        refreshHandler.removeCallbacks(refreshRunnable)
        super.onDestroy()
    }

    /**
     * Fetches all solar stations from GET /stations API endpoint,
     * then plots each as a marker on the Google Map.
     */
    private fun loadStationsFromApi() {
        // Show a "loading" toast or indicator could be better, for now just log
        android.util.Log.d("StationMap", "Starting to fetch stations...")
        
        // Run network call in a background thread to avoid blocking UI
        Thread {
            // Using "Stations" to match ReservationRepository and backend Controller name
            val response = ApiClient.get(this, "Stations")

            runOnUiThread {
                if (response != null) {
                    try {
                        android.util.Log.d("StationMap", "Response received: ${response.take(100)}...")
                        
                        // Handle both direct JSONArray and wrapped JSONObject { "data": [...] }
                        val stationsArray = if (response.trim().startsWith("{")) {
                            val jsonObject = org.json.JSONObject(response)
                            if (jsonObject.has("data")) jsonObject.getJSONArray("data")
                            else if (jsonObject.has("stations")) jsonObject.getJSONArray("stations")
                            else if (jsonObject.has("value")) jsonObject.getJSONArray("value") // Common in OData/ASP.NET
                            else throw Exception("Unexpected JSON object structure")
                        } else {
                            JSONArray(response)
                        }

                        if (stationsArray.length() == 0) {
                            Toast.makeText(this, "No solar stations found on the network.", Toast.LENGTH_SHORT).show()
                        }

                        var firstStation: LatLng? = null
                        mMap.clear() // Clear existing markers before re-adding

                        for (i in 0 until stationsArray.length()) {
                            val station = stationsArray.getJSONObject(i)

                            // Parse station fields from API response (check for various possible names)
                            val name = station.optString("name", station.optString("stationName", "Station $i"))
                            val lat = station.optDouble("latitude", station.optDouble("lat", 0.0))
                            val lng = station.optDouble("longitude", station.optDouble("lng", 0.0))
                            val location = station.optString("location", "N/A")
                            // The API exposes SolarStation.CapacityKw as JSON `capacityKw`.
                            // Keep the older kWh names as fallbacks for legacy records.
                            val capacity = station.optDouble("capacityKw",
                                station.optDouble("capacityKWh",
                                station.optDouble("capacityKwh",
                                station.optDouble("capacitykwh", 0.0))))
                            val slots = station.optInt("availableSlots", 0)
                            val stationId = if (station.has("id")) station.getString("id") else station.optString("_id", "")

                            if (lat != 0.0 && lng != 0.0) {
                                val position = LatLng(lat, lng)

                                // Add a map marker for this station
                                val marker = mMap.addMarker(
                                    MarkerOptions()
                                        .position(position)
                                        .title(name)
                                        .snippet("Location: $location|Capacity: ${capacity.formatKwh()}|Slots: $slots")
                                )
                                marker?.tag = stationId

                                if (firstStation == null) firstStation = position
                            }
                        }

                        // Move camera to first station, or default to Sri Lanka
                        val cameraTarget = firstStation ?: LatLng(7.8731, 80.7718)
                        mMap.animateCamera(CameraUpdateFactory.newLatLngZoom(cameraTarget, 10f))

                        // Show station details card on marker click
                        val cardView = findViewById<View>(R.id.cardStationDetails)
                        val textName = findViewById<TextView>(R.id.textViewStationName)
                        val textLocation = findViewById<TextView>(R.id.textViewStationLocation)
                        val textCapacity = findViewById<TextView>(R.id.textViewStationCapacity)
                        val textSlots = findViewById<TextView>(R.id.textViewAvailableSlots)
                        val buttonBookSlot = findViewById<android.widget.Button>(R.id.buttonBookSlot)

                        var selectedStationTag: String? = null

                        mMap.setOnMarkerClickListener { marker ->
                            selectedStationTag = marker.tag as? String
                            textName.text = marker.title
                            val snippetParts = marker.snippet?.split("|") ?: listOf()
                            textLocation.text = snippetParts.getOrElse(0) { "Location: N/A" }.trim()
                            textCapacity.text = snippetParts.getOrElse(1) { "Capacity: N/A" }.trim()
                            textSlots.text = snippetParts.getOrElse(2) { "Slots: N/A" }.trim()
                            cardView.visibility = View.VISIBLE
                            false
                        }

                        buttonBookSlot.setOnClickListener {
                            if (selectedStationTag != null) {
                                val intent = android.content.Intent(this, com.smartsolar.modules.prosumer.ReserveSlotActivity::class.java)
                                intent.putExtra("STATION_ID", selectedStationTag)
                                startActivity(intent)
                            } else {
                                Toast.makeText(this, "Please select a station first", Toast.LENGTH_SHORT).show()
                            }
                        }

                    } catch (e: Exception) {
                        android.util.Log.e("StationMap", "Parsing error", e)
                        Toast.makeText(this, "Error parsing stations data.", Toast.LENGTH_LONG).show()
                    }
                } else {
                    android.util.Log.e("StationMap", "Failed to fetch response from /api/Stations")
                    Toast.makeText(this, "Could not connect to grid network. Please check your connection.", Toast.LENGTH_LONG).show()
                }
            }
        }.start()
    }
}

private fun Double.formatKwh(): String {
    return if (this % 1.0 == 0.0) "${this.toInt()} kW" else "${this} kW"
}
