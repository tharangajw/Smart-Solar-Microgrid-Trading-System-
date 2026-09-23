package com.smartsolar.utils

/*
 * SessionManager.kt
 * Manages the user's login session using SharedPreferences.
 * Stores JWT token, user role, name, NIC, and local reservation status overrides
 * so the app can persist login state and status updates between app restarts.
 * Author: Member 4 – Operator Product
 */

import android.content.Context
import android.content.SharedPreferences

class SessionManager(context: Context) {

    // SharedPreferences file name and keys
    private val prefs: SharedPreferences =
        context.getSharedPreferences("smart_solar_session", Context.MODE_PRIVATE)

    companion object {
        const val KEY_TOKEN = "jwt_token"
        const val KEY_ROLE = "user_role"
        const val KEY_NAME = "user_name"
        const val KEY_NIC = "user_nic"
        const val KEY_EMAIL = "user_email"
        const val KEY_SERVER_IP = "server_ip"
        const val DEFAULT_IP = "192.168.8.191" // Updated to user's new IP address
    }

    /** Save server IP address */
    fun saveServerIp(ip: String) {
        prefs.edit().putString(KEY_SERVER_IP, ip).apply()
    }

    /** Get stored server IP or default */
    fun getServerIp(): String = prefs.getString(KEY_SERVER_IP, DEFAULT_IP) ?: DEFAULT_IP

    /** Save user session after successful login */
    fun saveSession(token: String, role: String, nic: String, name: String, email: String) {
        prefs.edit()
            .putString(KEY_TOKEN, token)
            .putString(KEY_ROLE, role)
            .putString(KEY_NIC, nic)
            .putString(KEY_NAME, name)
            .putString(KEY_EMAIL, email)
            .apply()
    }

    /** Save/Override local reservation status across ID key variations */
    fun saveReservationStatus(reservationId: String, status: String) {
        if (reservationId.isEmpty() || reservationId == "null") return
        val editor = prefs.edit()
        editor.putString("res_status_$reservationId", status)
        val clean = reservationId.replace("RES-", "").replace("QR_", "").replace("qr_", "").trim()
        if (clean.isNotEmpty()) {
            editor.putString("res_status_$clean", status)
            if (clean.length >= 8) {
                editor.putString("res_status_${clean.takeLast(8)}", status)
                editor.putString("res_status_RES-${clean.takeLast(8).uppercase()}", status)
            }
        }
        editor.apply()
    }

    /** Get locally overridden reservation status if present (multi-key lookup) */
    fun getReservationStatus(reservationId: String): String? {
        if (reservationId.isEmpty() || reservationId == "null") return null
        var status = prefs.getString("res_status_$reservationId", null)
        if (status != null) return status
        val clean = reservationId.replace("RES-", "").replace("QR_", "").replace("qr_", "").trim()
        if (clean.isNotEmpty()) {
            status = prefs.getString("res_status_$clean", null)
            if (status != null) return status
            if (clean.length >= 8) {
                status = prefs.getString("res_status_${clean.takeLast(8)}", null)
                if (status != null) return status
                status = prefs.getString("res_status_RES-${clean.takeLast(8).uppercase()}", null)
                if (status != null) return status
            }
        }
        return null
    }

    /** Get stored JWT token */
    fun getToken(): String? = prefs.getString(KEY_TOKEN, null)

    /** Get stored user role (e.g. "GridOperator", "Prosumer") */
    fun getRole(): String? = prefs.getString(KEY_ROLE, null)

    /** Get stored user name */
    fun getName(): String? = prefs.getString(KEY_NAME, null)

    /** Get stored NIC */
    fun getNic(): String? = prefs.getString(KEY_NIC, null)

    /** Get stored email */
    fun getEmail(): String? = prefs.getString(KEY_EMAIL, null)

    /** Returns true if a token exists (user is logged in) */
    fun isLoggedIn(): Boolean = getToken() != null

    /** Clear session on logout */
    fun logout() {
        val currentIp = getServerIp()
        prefs.edit().clear().apply()
        saveServerIp(currentIp)
    }
}
