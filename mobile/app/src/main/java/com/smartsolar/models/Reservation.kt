package com.smartsolar.models

data class Reservation(
    val id: String,
    val prosumerId: String,
    val stationId: String,
    val stationName: String,
    val scheduledDate: String,
    val status: String, // Pending, Approved, Completed, Cancelled
    val qrCodeId: String? = null
)
