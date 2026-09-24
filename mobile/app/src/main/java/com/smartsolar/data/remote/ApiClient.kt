package com.smartsolar.data.remote

import android.content.Context
import com.smartsolar.utils.SessionManager
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL

// Holds API response status, body payload, and error message
data class ApiResult(val isSuccess: Boolean, val body: String?, val message: String?)

// Handles HTTP requests, dynamic IP resolution, and JWT auth headers
object ApiClient {

    // Builds API base URL from user's configured server IP
    private fun getBaseUrl(context: Context): String {
        val ip = SessionManager(context).getServerIp().trim()
        return if (ip.startsWith("http")) "$ip/api" else "http://$ip:5281/api"
    }

    // Sends GET request and returns raw response string or null on failure
    fun get(context: Context, endpoint: String): String? {
        val baseUrl = getBaseUrl(context)
        return try {
            val url = URL("$baseUrl/$endpoint")
            val connection = url.openConnection() as HttpURLConnection
            connection.requestMethod = "GET"
            connection.setRequestProperty("Content-Type", "application/json")

            val token = SessionManager(context).getToken()
            if (token != null) {
                connection.setRequestProperty("Authorization", "Bearer $token")
            }

            connection.connectTimeout = 8000
            connection.readTimeout = 8000

            val responseCode = connection.responseCode
            android.util.Log.d("ApiClient", "GET $endpoint - URL: $url - Response: $responseCode")
            if (responseCode == HttpURLConnection.HTTP_OK) {
                val reader = BufferedReader(InputStreamReader(connection.inputStream))
                val response = reader.readText()
                reader.close()
                response
            } else {
                null
            }
        } catch (e: Exception) {
            android.util.Log.e("ApiClient", "Error in get request: ${e.message}")
            null
        }
    }

    // Sends POST request with JSON payload
    fun post(context: Context, endpoint: String, body: JSONObject): ApiResult {
        return request(context, "POST", endpoint, body)
    }

    // Sends PUT request with JSON payload
    fun put(context: Context, endpoint: String, body: JSONObject): ApiResult {
        return request(context, "PUT", endpoint, body)
    }

    // Executes network request, sends JSON body, and parses response status
    private fun request(context: Context, method: String, endpoint: String, body: JSONObject?): ApiResult {
        val baseUrl = getBaseUrl(context)
        val fullUrl = "$baseUrl/$endpoint"
        return try {
            val url = URL(fullUrl)
            val connection = url.openConnection() as HttpURLConnection
            connection.requestMethod = method
            connection.setRequestProperty("Content-Type", "application/json")
            
            val token = SessionManager(context).getToken()
            if (token != null) {
                connection.setRequestProperty("Authorization", "Bearer $token")
            }

            connection.connectTimeout = 10000
            connection.readTimeout = 10000

            if (body != null) {
                connection.doOutput = true
                val writer = OutputStreamWriter(connection.outputStream)
                writer.write(body.toString())
                writer.flush()
                writer.close()
            }

            val responseCode = connection.responseCode
            android.util.Log.d("ApiClient", "$method $endpoint - URL: $url - Response: $responseCode")

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
                    JSONObject(responseBody).getString("message")
                } catch (ex: Exception) {
                    "Server error: $responseCode"
                }
                ApiResult(false, responseBody, errorMsg)
            }
        } catch (e: Exception) {
            android.util.Log.e("ApiClient", "Network Error at $fullUrl: ${e.message}")
            ApiResult(false, null, "Connection failed: ${e.message}\nCheck IP: $fullUrl")
        }
    }
}
