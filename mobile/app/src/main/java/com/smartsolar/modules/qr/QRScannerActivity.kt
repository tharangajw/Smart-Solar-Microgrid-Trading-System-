package com.smartsolar.modules.qr

/*
 * QRScannerActivity.kt
 * Allows the Grid Operator to scan a Prosumer's transaction QR code.
 * Uses ZXing for camera-based QR scanning, then verifies the scanned
 * QR code ID against the central API via POST /operator/scan-qr.
 * On success, marks the energy transfer transaction as Done.
 * Author: Member 4 – Operator Product
 */

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.google.zxing.integration.android.IntentIntegrator
import com.google.zxing.integration.android.IntentResult
import com.smartsolar.R
import com.smartsolar.data.remote.ApiClient
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONObject

class QRScannerActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_qr_scanner)

        // Launch ZXing QR scanner immediately when Activity opens
        val integrator = IntentIntegrator(this)
        integrator.setDesiredBarcodeFormats(IntentIntegrator.QR_CODE)
        integrator.setPrompt("Scan Prosumer's Transaction QR Code")
        integrator.setCameraId(0)
        integrator.setBeepEnabled(true)
        integrator.setBarcodeImageEnabled(false)
        integrator.initiateScan()
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        // Parse the ZXing scan result
        val result: IntentResult = IntentIntegrator.parseActivityResult(requestCode, resultCode, data)

        if (result.contents == null) {
            // User cancelled the scan
            Toast.makeText(this, "Scan cancelled", Toast.LENGTH_SHORT).show()
            finish()
        } else {
            val scannedQrCode = result.contents
            verifyQrCodeWithServer(scannedQrCode)
        }

        super.onActivityResult(requestCode, resultCode, data)
    }

    /**
     * Verify the scanned QR code against the server.
     * Calls POST /operator/scan-qr with the scanned QR code ID.
     * On success, shows a confirmation dialog and marks the job as Done.
     */
    private fun verifyQrCodeWithServer(qrCodeId: String) {
        val body = JSONObject().apply {
            put("qrCodeId", qrCodeId)
        }

        // Disable UI or show progress if needed
        Toast.makeText(this, "Verifying transfer...", Toast.LENGTH_SHORT).show()

        lifecycleScope.launch(Dispatchers.IO) {
            // Call the API to verify and finalise the transaction
            val result = ApiClient.post(this@QRScannerActivity, "operator/scan-qr", body)

            withContext(Dispatchers.Main) {
                if (result.isSuccess && result.body != null) {
                    // Parse success message from server
                    val json = JSONObject(result.body)
                    val message = json.optString("message", "Energy transfer finalised successfully!")

                    // Show success dialog
                    AlertDialog.Builder(this@QRScannerActivity)
                        .setTitle("✅ Transaction Complete")
                        .setMessage(message)
                        .setCancelable(false)
                        .setPositiveButton("OK") { _, _ -> finish() }
                        .show()
                } else {
                    // Show failure dialog
                    AlertDialog.Builder(this@QRScannerActivity)
                        .setTitle("❌ Verification Failed")
                        .setMessage(result.message ?: "Could not verify QR code. Please check the code and try again.")
                        .setPositiveButton("Retry") { _, _ ->
                            // Re-launch scanner
                            val integrator = IntentIntegrator(this@QRScannerActivity)
                            integrator.setDesiredBarcodeFormats(IntentIntegrator.QR_CODE)
                            integrator.setPrompt("Scan Prosumer's Transaction QR Code")
                            integrator.initiateScan()
                        }
                        .setNegativeButton("Cancel") { _, _ -> finish() }
                        .show()
                }
            }
        }
    }
}
