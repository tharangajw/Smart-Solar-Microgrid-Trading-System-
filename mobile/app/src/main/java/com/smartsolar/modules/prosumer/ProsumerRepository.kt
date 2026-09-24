package com.smartsolar.modules.prosumer

import android.content.Context
import com.smartsolar.data.remote.ApiClient
import com.smartsolar.utils.SessionManager
import org.json.JSONObject

/**
 * Repository layer for Prosumer operations.
 * Handles communications with the backend to retrieve prosumer statistics and reservation summaries.
 */
class ProsumerRepository(private val context: Context) {

    /**
     * Aggregates dashboard statistics for the currently logged-in prosumer.
     * Fetches future approved reservation counts from backend API.
     *
     * @return Map containing statistics keys (approvedFutureCount, energySold, earnings).
     */
    fun getDashboardStats(): Map<String, String> {
        val stats = mutableMapOf<String, String>()
        val nic = SessionManager(context).getNic() ?: ""
        
        // Query server endpoint api/reservations/summary with user NIC filter
        val response = ApiClient.get(context, "Reservations/summary?nic=$nic")
        if (response != null) {
            try {
                val json = JSONObject(response)
                stats["approvedFutureCount"] = json.optString("approvedFutureCount", "0")
                stats["energySold"] = "124" 
                stats["earnings"] = "4,500"
            } catch (e: Exception) {
                e.printStackTrace()
            }
        } else {
            stats["energySold"] = "0"
            stats["earnings"] = "0"
        }
        return stats
    }
}
