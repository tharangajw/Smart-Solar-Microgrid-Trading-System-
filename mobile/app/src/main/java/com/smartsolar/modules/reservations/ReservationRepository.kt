package com.smartsolar.modules.reservations

import android.content.Context
import android.util.Log
import com.smartsolar.data.remote.ApiClient
import com.smartsolar.data.remote.ApiResult
import com.smartsolar.models.Reservation
import com.smartsolar.models.Station
import com.smartsolar.utils.SessionManager
import org.json.JSONArray
import org.json.JSONObject

class ReservationRepository(private val context: Context) {

    fun getStations(): List<Station> {
        val stations = mutableListOf<Station>()
        val response = ApiClient.get(context, "Stations")
        if (response != null) {
            try {
                val array = JSONArray(response)
                for (i in 0 until array.length()) {
                    val obj = array.getJSONObject(i)
                    // Check for both 'id' and '_id' (MongoDB default)
                    val id = if (obj.has("id")) obj.getString("id") else obj.optString("_id", "")
                    
                    stations.add(Station(
                        id = id,
                        name = obj.optString("name", "Station $i"),
                        latitude = obj.optDouble("latitude", 0.0),
                        longitude = obj.optDouble("longitude", 0.0),
                        capacityKwh = obj.optDouble("capacityKwh", 0.0),
                        availableSlots = obj.optInt("availableSlots", 0)
                    ))
                }
            } catch (e: Exception) {
                Log.e("ReservationRepo", "Error parsing stations: ${e.message}")
            }
        }
        return stations
    }

    /**
     * Creates a reservation.
     * Matches CreateREservationDto in backend.
     */
    fun createReservation(stationId: String, scheduledDate: String): ApiResult {
        val nic = SessionManager(context).getNic() ?: ""
        
        // Ensure date is in the future for the server (UTC)
        // Using late evening to avoid "date in the past" errors for same-day bookings
        val isoDate = "${scheduledDate}T23:59:00Z"
        
        val body = JSONObject().apply {
            put("prosumerNic", nic)
            put("nodeId", stationId)
            put("reservationDate", isoDate)
            put("slotId", "SLOT-AUTO-01") // Backend expects a slot ID string
        }
        
        Log.d("ReservationRepo", "Creating reservation: $body")
        return ApiClient.post(context, "reservations", body)
    }

    fun getProsumerReservations(): List<Reservation> {
        val list = mutableListOf<Reservation>()
        val nic = SessionManager(context).getNic() ?: ""
        // Use api/reservations/search?nic={nic} to get ALL states (Pending, Approved, etc.)
        val response = ApiClient.get(context, "reservations/search?nic=$nic")
        if (response != null) {
            try {
                val array = JSONArray(response)
                for (i in 0 until array.length()) {
                    val obj = array.getJSONObject(i)
                    list.add(Reservation(
                        id = obj.optString("id", obj.optString("_id", "0")),
                        prosumerId = obj.optString("prosumerId", ""),
                        stationId = obj.optString("nodeId", ""),
                        stationName = obj.optString("stationName", "Station"),
                        scheduledDate = obj.optString("reservationDate", ""),
                        status = obj.optString("status", "Pending"),
                        qrCodeId = obj.optString("qrCodeId").trim().takeIf { it.isNotEmpty() }
                    ))
                }
            } catch (e: Exception) {
                Log.e("ReservationRepo", "Error parsing search results: ${e.message}")
            }
        }
        return list
    }

    fun cancelReservation(reservationId: String): ApiResult {
        val body = JSONObject().apply {
            put("cancelledReason", "Cancelled by Prosumer")
        }
        // Backend: PUT /api/reservations/{id}/cancel
        return ApiClient.put(context, "reservations/$reservationId/cancel", body)
    }
}
