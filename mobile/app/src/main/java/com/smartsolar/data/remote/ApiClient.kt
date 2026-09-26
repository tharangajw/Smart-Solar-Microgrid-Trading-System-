package com.smartsolar.data.remote

/*
 * ApiClient.kt
 * Central REST API client for SmartSolar Microgrid Android Mobile Application.
 * Features fast URL probing, working URL caching, and auto-failover across
 * Wi-Fi IPs and Emulator gateways without hanging on closed ports.
 * Author: Member 4 – Operator Product
 */

import android.content.Context
import android.os.Build
import com.smartsolar.utils.SessionManager
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL

data class ApiResult(val isSuccess: Boolean, val body: String?, val message: String?)

object ApiClient {

    @Volatile
    private var cachedWorkingBaseUrl: String? = null

    /** Detects whether the app is currently running inside an Android Emulator */
    private fun isEmulator(): Boolean {
        return (Build.FINGERPRINT.startsWith("generic") ||
                Build.FINGERPRINT.startsWith("unknown") ||
                Build.MODEL.contains("google_sdk") ||
                Build.MODEL.contains("Emulator") ||
                Build.MODEL.contains("Android SDK built for x86") ||
                Build.MANUFACTURER.contains("Genymotion") ||
                (Build.BRAND.startsWith("generic") && Build.DEVICE.startsWith("generic")) ||
                "google_sdk" == Build.PRODUCT)
    }

    /** Calculates candidate Base URLs ordered by priority */
    private fun getCandidateBaseUrls(context: Context): List<String> {
        val candidates = mutableListOf<String>()

        // 0. High Priority: Previously verified working Base URL
        cachedWorkingBaseUrl?.let { candidates.add(it) }

        // 1. Primary C# Web API Wi-Fi IP (192.168.1.25:5281)
        candidates.add("http://192.168.1.25:5281/api")

        // 2. Saved IP from SessionManager
        val savedIp = SessionManager(context).getServerIp().trim()
        if (savedIp.isNotEmpty() && savedIp != "172.24.64.1") { // Skip virtual adapter IP
            val formatted = if (savedIp.startsWith("http://") || savedIp.startsWith("https://")) savedIp else "http://$savedIp"
            val clean = formatted.removeSuffix("/").removeSuffix("/api")
            val hostPart = clean.substringAfter("://").substringAfter("/")
            val hasPort = hostPart.contains(":")

            if (hasPort) {
                candidates.add("$clean/api")
            } else {
                candidates.add("$clean:5281/api")
            }
        }

        // 3. Emulator-specific candidate
        if (isEmulator()) {
            candidates.add("http://10.0.2.2:5281/api")
        }

        // 4. Secondary Wi-Fi fallback candidates
        candidates.add("http://192.168.8.191:5281/api")

        return candidates.distinct()
    }

    fun get(context: Context, endpoint: String): String? {
        // If a working base URL is already verified, use it directly
        cachedWorkingBaseUrl?.let { baseUrl ->
            val result = executeGetCall(context, "$baseUrl/$endpoint")
            if (result != null) return result
        }

        // Try other candidates only if cached working URL is null or failed
        val urls = getCandidateBaseUrls(context)
        for (baseUrl in urls) {
            if (baseUrl == cachedWorkingBaseUrl) continue
            val fullUrl = "$baseUrl/$endpoint"
            val result = executeGetCall(context, fullUrl)
            if (result != null) {
                cachedWorkingBaseUrl = baseUrl // Cache fast working URL
                return result
            }
        }
        return null
    }

    private fun executeGetCall(context: Context, fullUrl: String): String? {
        return try {
            val url = URL(fullUrl)
            val connection = url.openConnection() as HttpURLConnection
            connection.requestMethod = "GET"
            connection.setRequestProperty("Content-Type", "application/json")

            val token = SessionManager(context).getToken()
            if (token != null) {
                connection.setRequestProperty("Authorization", "Bearer $token")
            }

            connection.connectTimeout = 1800
            connection.readTimeout = 4000

            val responseCode = connection.responseCode
            android.util.Log.d("ApiClient", "GET URL: $fullUrl - Response: $responseCode")
            if (responseCode == HttpURLConnection.HTTP_OK) {
                val reader = BufferedReader(InputStreamReader(connection.inputStream))
                val response = reader.readText()
                reader.close()
                response
            } else {
                null
            }
        } catch (e: Exception) {
            android.util.Log.e("ApiClient", "GET Error at $fullUrl: ${e.message}")
            null
        }
    }

    fun post(context: Context, endpoint: String, body: JSONObject): ApiResult {
        return request(context, "POST", endpoint, body)
    }

    fun put(context: Context, endpoint: String, body: JSONObject): ApiResult {
        return request(context, "PUT", endpoint, body)
    }

    private fun request(context: Context, method: String, endpoint: String, body: JSONObject?): ApiResult {
        // If a working base URL is already verified, use it directly
        cachedWorkingBaseUrl?.let { baseUrl ->
            val result = executeHttpCall(context, method, "$baseUrl/$endpoint", body)
            if (result.isSuccess) return result
        }

        val urls = getCandidateBaseUrls(context)
        var lastResult = ApiResult(false, null, "No connection candidates")

        for (baseUrl in urls) {
            if (baseUrl == cachedWorkingBaseUrl) continue
            val fullUrl = "$baseUrl/$endpoint"
            val result = executeHttpCall(context, method, fullUrl, body)
            if (result.isSuccess) {
                cachedWorkingBaseUrl = baseUrl // Cache fast working URL
                return result
            }
            lastResult = result
        }

        return lastResult
    }

    private fun executeHttpCall(context: Context, method: String, fullUrl: String, body: JSONObject?): ApiResult {
        return try {
            val url = URL(fullUrl)
            val connection = url.openConnection() as HttpURLConnection
            connection.requestMethod = method
            connection.setRequestProperty("Content-Type", "application/json")

            val token = SessionManager(context).getToken()
            if (token != null) {
                connection.setRequestProperty("Authorization", "Bearer $token")
            }

            connection.connectTimeout = 2000
            connection.readTimeout = 5000

            if (body != null) {
                connection.doOutput = true
                val writer = OutputStreamWriter(connection.outputStream)
                writer.write(body.toString())
                writer.flush()
                writer.close()
            }

            val responseCode = connection.responseCode
            android.util.Log.d("ApiClient", "$method URL: $fullUrl - Response: $responseCode")

            val isSuccess = responseCode in 200..299
            val stream = if (isSuccess) connection.inputStream else connection.errorStream

            if (stream == null) {
                return ApiResult(false, null, "No response from server ($responseCode)")
            }

            val reader = BufferedReader(InputStreamReader(stream))
            val responseBody = reader.readText()
            reader.close()

            if (isSuccess) {
                ApiResult(true, responseBody, null)
            } else {
                val errorMsg = try {
                    val obj = JSONObject(responseBody)
                    when {
                        obj.has("message") -> obj.getString("message")
                        obj.has("error") -> obj.getString("error")
                        obj.has("title") -> obj.getString("title")
                        else -> "Server error: $responseCode"
                    }
                } catch (ex: Exception) {
                    "Server error: $responseCode"
                }
                ApiResult(false, responseBody, errorMsg)
            }
        } catch (e: Exception) {
            android.util.Log.e("ApiClient", "Network Error at $fullUrl: ${e.message}")
            ApiResult(false, null, "Network Error at $fullUrl. Check C# API & Firewall.")
        }
    }
}
