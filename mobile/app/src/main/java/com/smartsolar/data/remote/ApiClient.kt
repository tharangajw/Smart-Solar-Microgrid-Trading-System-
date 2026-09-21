package com.smartsolar.data.remote

import android.content.Context
import com.smartsolar.utils.SessionManager
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL

data class ApiResult(val isSuccess: Boolean, val body: String?, val message: String?)

object ApiClient {

    private const val BASE_URL = "http://10.0.2.2:5281/api" // 10.0.2.2 = host machine localhost from emulator

    fun get(context: Context, endpoint: String): String? {
        return try {
            val url = URL("$BASE_URL/$endpoint")
            val connection = url.openConnection() as HttpURLConnection
            connection.requestMethod = "GET"
            connection.setRequestProperty("Content-Type", "application/json")

            val token = SessionManager(context).getToken()
            if (token != null) {
                connection.setRequestProperty("Authorization", "Bearer $token")
            }

            connection.connectTimeout = 10000
            connection.readTimeout = 10000

            val responseCode = connection.responseCode
            android.util.Log.d("ApiClient", "GET $endpoint - Response: $responseCode")
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

    fun post(context: Context, endpoint: String, body: JSONObject): ApiResult {
        return request(context, "POST", endpoint, body)
    }

    fun put(context: Context, endpoint: String, body: JSONObject): ApiResult {
        return request(context, "PUT", endpoint, body)
    }

    private fun request(context: Context, method: String, endpoint: String, body: JSONObject?): ApiResult {
        return try {
            val url = URL("$BASE_URL/$endpoint")
            val connection = url.openConnection() as HttpURLConnection
            connection.requestMethod = method
            connection.setRequestProperty("Content-Type", "application/json")
            
            val token = SessionManager(context).getToken()
            if (token != null) {
                connection.setRequestProperty("Authorization", "Bearer $token")
            }

            connection.connectTimeout = 15000
            connection.readTimeout = 15000

            if (body != null) {
                connection.doOutput = true
                val writer = OutputStreamWriter(connection.outputStream)
                writer.write(body.toString())
                writer.flush()
                writer.close()
            }

            val responseCode = connection.responseCode
            android.util.Log.d("ApiClient", "$method $endpoint - Response: $responseCode")

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
            android.util.Log.e("ApiClient", "Network Error: ${e.message}")
            ApiResult(false, null, "Network error. Please check WiFi/Backend.")
        }
    }
}
