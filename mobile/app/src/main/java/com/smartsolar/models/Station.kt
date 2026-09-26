package com.smartsolar.models

data class Station(
    val id: String,
    val name: String,
    val latitude: Double,
    val longitude: Double,
    val capacityKwh: Double,
    val availableSlots: Int
)
