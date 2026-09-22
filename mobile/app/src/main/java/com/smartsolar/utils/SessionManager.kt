package com.smartsolar.utils

/*
 * SessionManager.kt
 * Manages the user's login session using SharedPreferences.
 * Stores JWT token, user role, name, and NIC so the app can
 * persist login state between app restarts without hitting the API again.
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
        const val DEFAULT_IP = "172.28.15.169" // Updated to user's computer IP
    }

    /** Save server IP address */
    fun saveServerIp(ip: String) {
        prefs.edit().putString(KEY_SERVER_IP, ip).apply()
    }

    /** Get stored server IP or default */
    fun getServerIp(): String = prefs.getString(KEY_SERVER_IP, DEFAULT_IP) ?: DEFAULT_IP

    /** Save user session after successful login */
    fun saveSession(token: String, role: String, nic: String) {
        prefs.edit()
            .putString(KEY_TOKEN, token)
            .putString(KEY_ROLE, role)
            .putString(KEY_NIC, nic)
            .apply()
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
        prefs.edit().clear().apply()
    }
}
