package com.smartsolar.models

data class Reservation(
    val id: String,
    val slotId: String?,
    val nodeId: String?,
    val status: String?,
    val scheduledDate: String?
)
