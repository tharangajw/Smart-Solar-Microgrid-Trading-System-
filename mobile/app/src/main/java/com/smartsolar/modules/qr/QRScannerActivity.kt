package com.smartsolar.modules.qr

/*
 * QRScannerActivity.kt
 * Allows the Grid Operator to scan a Prosumer's transaction QR code.
 * Executes C# Backend 2-step verification:
 *   1. POST /api/operator/approve/{id} (Pending -> Approved)
 *   2. POST /api/operator/scan-qr (Approved -> Completed / Done)
 * Author: Member 4 – Operator Product
 */

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.google.zxing.integration.android.IntentIntegrator
import com.google.zxing.integration.android.IntentResult
import com.smartsolar.R
import com.smartsolar.data.remote.ApiClient
import com.smartsolar.utils.SessionManager
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject

class QRScannerActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_qr_scanner)

        // Setup Dev/Simulation Button
        findViewById<Button>(R.id.buttonSimulateScan)?.setOnClickListener {
            showSimulateScanDialog()
        }

        // Launch ZXing QR camera scanner
        startCameraScan()
    }

    private fun startCameraScan() {
        val integrator = IntentIntegrator(this)
        integrator.setDesiredBarcodeFormats(IntentIntegrator.QR_CODE)
        integrator.setPrompt("Align Prosumer's QR Code in frame")
        integrator.setCameraId(0)
        integrator.setBeepEnabled(true)
        integrator.setBarcodeImageEnabled(false)
        integrator.initiateScan()
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        val result: IntentResult = IntentIntegrator.parseActivityResult(requestCode, resultCode, data)

        if (result.contents == null) {
            Toast.makeText(this, "Scan cancelled", Toast.LENGTH_SHORT).show()
        } else {
            val scannedQrCode = result.contents
            processAndVerifyQrCode(scannedQrCode)
        }

        super.onActivityResult(requestCode, resultCode, data)
    }

    /**
     * Extracts clean ID / QR code payload from any QR format (JSON or string).
     */
    private fun extractCleanId(raw: String): String {
        var cleaned = raw.trim()
        if (cleaned.startsWith("{")) {
            try {
                val json = JSONObject(cleaned)
                cleaned = json.optString("qrCodeId", json.optString("qrCode", json.optString("id", json.optString("_id", cleaned))))
            } catch (_: Exception) {}
        }
        cleaned = cleaned.replace("QR_", "").replace("qr_", "").trim()
        return if (cleaned.equalsIgnoreCase("null") || cleaned == "null") "" else cleaned
    }

    /**
     * Dev helper dialog to select a pending reservation directly from server
     * or manually enter a QR/Reservation ID for simulation.
     */
    private fun showSimulateScanDialog() {
        Toast.makeText(this, "Fetching active reservations...", Toast.LENGTH_SHORT).show()

        lifecycleScope.launch(Dispatchers.IO) {
            var response = ApiClient.get(this@QRScannerActivity, "Reservations/pending")
            if (response == null || response.trim() == "[]" || response.trim() == "{}") {
                response = ApiClient.get(this@QRScannerActivity, "Reservations")
            }

            withContext(Dispatchers.Main) {
                val pendingList = mutableListOf<Pair<String, String>>()

                if (response != null && response.trim().isNotEmpty()) {
                    try {
                        val array = if (response.trim().startsWith("[")) {
                            JSONArray(response)
                        } else {
                            val obj = JSONObject(response)
                            when {
                                obj.has("data") -> obj.getJSONArray("data")
                                obj.has("value") -> obj.getJSONArray("value")
                                else -> JSONArray()
                            }
                        }

                        for (i in 0 until array.length()) {
                            val item = array.getJSONObject(i)
                            val id = item.optString("id", item.optString("_id", ""))
                            val nodeId = item.optString("nodeId", "Hub")
                            val status = item.optString("status", "Pending")
                            if (id.isNotEmpty() && !id.equalsIgnoreCase("null")) {
                                val shortId = if (id.length > 8) "RES-${id.takeLast(8).uppercase()}" else id
                                pendingList.add(id to "[$status] $shortId @ Node: ${nodeId.take(8)}")
                            }
                        }
                    } catch (_: Exception) {}
                }

                if (pendingList.isEmpty()) {
                    showManualInputDialog()
                } else {
                    val displayItems = (pendingList.map { it.second } + "⌨️ Enter ID Manually").toTypedArray()
                    AlertDialog.Builder(this@QRScannerActivity)
                        .setTitle("Select Reservation to Verify")
                        .setItems(displayItems) { _, which ->
                            if (which == pendingList.size) {
                                showManualInputDialog()
                            } else {
                                val selectedId = pendingList[which].first
                                processAndVerifyQrCode(selectedId)
                            }
                        }
                        .setNegativeButton("Cancel", null)
                        .show()
                }
            }
        }
    }

    private fun showManualInputDialog() {
        val input = EditText(this)
        input.hint = "Paste Reservation ID or QR Code"
        AlertDialog.Builder(this)
            .setTitle("Simulate QR Scan")
            .setMessage("Enter the Prosumer's Reservation or QR Code ID:")
            .setView(input)
            .setPositiveButton("Verify & Finalize") { _, _ ->
                val code = input.text.toString().trim()
                if (code.isNotEmpty()) {
                    processAndVerifyQrCode(code)
                }
            }
            .setNegativeButton("Cancel", null)
            .show()
    }

    /**
     * Core Business Logic:
     * 1. Extract clean ID / QR code payload from scanned content
     * 2. Call C# Backend API: GET /api/operator/verify-qr/{qrCodeId} to verify server data
     * 3. Display reservation details to Operator
     * 4. Upon physical confirmation, call POST /api/operator/scan-qr to finalize transaction & mark job as DONE
     */
    private fun processAndVerifyQrCode(scannedContent: String) {
        if (scannedContent.trim().isEmpty()) {
            Toast.makeText(this, "Empty QR Code scanned", Toast.LENGTH_SHORT).show()
            return
        }

        val cleanId = extractCleanId(scannedContent)
        if (cleanId.isEmpty()) {
            Toast.makeText(this, "Invalid QR Code scanned", Toast.LENGTH_SHORT).show()
            return
        }

        Toast.makeText(this, "Verifying transfer with server...", Toast.LENGTH_SHORT).show()
        verifyTransactionBeforeConfirmation(cleanId)
    }

    private fun verifyTransactionBeforeConfirmation(transactionId: String) {
        if (transactionId.isBlank()) {
            showVerificationError("QR code does not contain a transaction ID.")
            return
        }
        lifecycleScope.launch(Dispatchers.IO) {
            val encoded = java.net.URLEncoder.encode(transactionId, "UTF-8")
            val response = ApiClient.get(this@QRScannerActivity, "operator/verify-qr/$encoded")
            withContext(Dispatchers.Main) {
                if (response == null) {
                    showVerificationError("Server could not verify this transaction.")
                    return@withContext
                }
                try {
                    val verified = JSONObject(response)
                    if (!verified.optString("status").equals("Approved", ignoreCase = true)) {
                        showVerificationError("This transaction is not approved.")
                        return@withContext
                    }
                    val reservation = verified.optJSONObject("reservation")
                    val message = "Transaction: $transactionId\nNode: ${verified.optString("nodeId", "Unknown")}\nScheduled: ${verified.optString("scheduledTime", "Not specified")}\nStatus: APPROVED\n\nConfirm the physical transfer to mark this job as DONE."
                    AlertDialog.Builder(this@QRScannerActivity)
                        .setTitle("Reservation verified")
                        .setMessage(message)
                        .setNegativeButton("Cancel", null)
                        .setPositiveButton("Confirm transfer") { _, _ ->
                            finalizeTransaction(transactionId, reservation)
                        }.show()
                } catch (_: Exception) {
                    showVerificationError("Invalid verification response from server.")
                }
            }
        }
    }

    private fun finalizeTransaction(transactionId: String, reservation: JSONObject?) {
        lifecycleScope.launch(Dispatchers.IO) {
            val result = ApiClient.post(this@QRScannerActivity, "operator/scan-qr", JSONObject().apply {
                put("qrCodeId", transactionId)
            })
            withContext(Dispatchers.Main) {
                if (result.isSuccess) {
                    reservation?.optString("id")?.takeIf { it.isNotBlank() }?.let {
                        SessionManager(this@QRScannerActivity).saveReservationStatus(it, "Completed")
                    }
                    AlertDialog.Builder(this@QRScannerActivity)
                        .setTitle("Transfer complete")
                        .setMessage("Energy transfer completed and job marked as DONE by the server.")
                        .setPositiveButton("Done") { _, _ -> finish() }.show()
                } else {
                    showVerificationError(result.message ?: "Transaction could not be completed.")
                }
            }
        }
    }

    private fun showVerificationError(message: String) {
        AlertDialog.Builder(this)
            .setTitle("Verification failed")
            .setMessage(message)
            .setPositiveButton("Retry") { _, _ -> startCameraScan() }
            .setNegativeButton("Cancel", null)
            .show()
    }

    private fun resolveStationName(nodeId: String, rawNodeName: String): String {
        if (rawNodeName.isNotEmpty() && !rawNodeName.equalsIgnoreCase("Station Hub") && !rawNodeName.equalsIgnoreCase("ON HUB") && !rawNodeName.equalsIgnoreCase("Grid Station Hub")) {
            return rawNodeName
        }

        if (nodeId.isNotEmpty() && !nodeId.equalsIgnoreCase("Station Hub") && !nodeId.equalsIgnoreCase("ON HUB")) {
            try {
                var stationsResp = ApiClient.get(this, "Stations")
                if (stationsResp == null || stationsResp.trim() == "[]") {
                    stationsResp = ApiClient.get(this, "Nodes")
                }
                if (stationsResp != null && stationsResp.trim().isNotEmpty()) {
                    val array = parseJsonArray(stationsResp)
                    for (i in 0 until array.length()) {
                        val station = array.getJSONObject(i)
                        val id = station.optString("id", station.optString("_id", station.optString("stationId", "")))
                        val name = station.optString("name", station.optString("stationName", station.optString("title", "")))
                        if (id.equals(nodeId, ignoreCase = true) || nodeId.contains(id, ignoreCase = true) || id.contains(nodeId, ignoreCase = true)) {
                            if (name.isNotEmpty()) return name
                        }
                    }
                }
            } catch (_: Exception) {}
        }

        return if (nodeId.length >= 12) "Solar Grid Station (#${nodeId.takeLast(6).uppercase()})" else "Solar Grid Station Hub"
    }

    private fun parseMessage(body: String?, defaultMsg: String): String {
        if (body.isNullOrEmpty()) return defaultMsg
        return try {
            JSONObject(body).optString("message", defaultMsg)
        } catch (_: Exception) {
            defaultMsg
        }
    }

    private fun parseJsonArray(jsonStr: String): JSONArray {
        val trimmed = jsonStr.trim()
        return if (trimmed.startsWith("[")) {
            JSONArray(trimmed)
        } else {
            val obj = JSONObject(trimmed)
            when {
                obj.has("data") -> obj.getJSONArray("data")
                obj.has("value") -> obj.getJSONArray("value")
                else -> JSONArray()
            }
        }
    }

    private fun fetchReservationDataFromServer(cleanId: String): JSONObject? {
        if (cleanId.isEmpty() || cleanId.equalsIgnoreCase("null")) return null

        // 1. Try GET Reservations/$cleanId
        var resp = ApiClient.get(this, "Reservations/$cleanId")
        if (resp != null && resp.trim().startsWith("{")) {
            try { return JSONObject(resp) } catch (_: Exception) {}
        }

        // 2. Try GET Reservations/pending
        resp = ApiClient.get(this, "Reservations/pending")
        if (resp != null && resp.trim().isNotEmpty()) {
            val match = findInArray(resp, cleanId)
            if (match != null) return match
        }

        // 3. Try GET Reservations
        resp = ApiClient.get(this, "Reservations")
        if (resp != null && resp.trim().isNotEmpty()) {
            val match = findInArray(resp, cleanId)
            if (match != null) return match
        }

        return null
    }

    private fun findInArray(jsonStr: String, targetId: String): JSONObject? {
        try {
            val array = parseJsonArray(jsonStr)
            for (i in 0 until array.length()) {
                val item = array.getJSONObject(i)
                val id = item.optString("id", item.optString("_id", ""))
                if (id.isNotEmpty() && !id.equalsIgnoreCase("null")) {
                    if (id.equals(targetId, ignoreCase = true) ||
                        id.contains(targetId, ignoreCase = true) ||
                        targetId.contains(id, ignoreCase = true)) {
                        return item
                    }
                }
            }
        } catch (_: Exception) {}
        return null
    }

    private fun String.equalsIgnoreCase(other: String): Boolean = this.equals(other, ignoreCase = true)
}
