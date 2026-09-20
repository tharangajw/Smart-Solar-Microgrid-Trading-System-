package com.smartsolar.modules.reservations

import android.content.Context
import com.smartsolar.data.remote.ApiResult
import com.smartsolar.models.Reservation
import com.smartsolar.models.Station

class ReservationRepository(private val context: Context) {

    fun getStations(): List<Station> {
        // Feature disabled for Grid Operator testing
        return emptyList()
    }

    /**
     * Creates a reservation.
     * Matches CreateREservationDto in backend.
     */
    fun createReservation(stationId: String, scheduledDate: String): ApiResult {
        // Feature disabled for Grid Operator testing
        return ApiResult(isSuccess = true, message = "Reservations are currently disabled.")
    }

    fun getProsumerReservations(): List<Reservation> {
        // Feature disabled for Grid Operator testing
        return emptyList()
    }

    fun cancelReservation(reservationId: String): ApiResult {
        // Feature disabled for Grid Operator testing
        return ApiResult(isSuccess = true, message = "Reservations are currently disabled.")
    }
}
