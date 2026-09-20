package com.smartsolar.models

data class User(
    val id: String,
    val nic: String,
    val name: String,
    val email: String,
    val role: String,
    val token: String
)
