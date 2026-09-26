package com.smartsolar.modules.qr

/*
 * QRDisplayActivity.kt
 * Generates and displays a secure transaction QR code for a reservation.
 * Author: Member 4 – Operator Product
 */

import android.graphics.Bitmap
import android.graphics.Color
import android.os.Bundle
import android.widget.Button
import android.widget.ImageView
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import com.google.zxing.BarcodeFormat
import com.google.zxing.MultiFormatWriter
import com.smartsolar.R
import org.json.JSONObject

class QRDisplayActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_qr_display)

        findViewById<android.view.View>(R.id.btnNavBack)?.setOnClickListener { finish() }
        findViewById<TextView>(R.id.textNavTitle)?.text = "Booking QR Code"
        findViewById<TextView>(R.id.textNavSubtitle)?.text = "Transaction Verification"

        val imageQrCode = findViewById<ImageView>(R.id.imageViewQrCode)
        val textInstructions = findViewById<TextView>(R.id.textViewInstructions)
        val buttonDone = findViewById<Button>(R.id.buttonDone)

        val reservationData = intent.getStringExtra("RESERVATION_DATA")

        if (reservationData != null) {
            try {
                val qrData = if (reservationData.trim().startsWith("{")) {
                    val json = JSONObject(reservationData)
                    json.optString("qrCodeId", json.optString("qrCode", json.optString("id", reservationData))).trim()
                } else {
                    reservationData
                }

                val finalData = if (qrData.isNotEmpty()) qrData else "SOLAR_BOOKING_QR"
                val bitmap = generateQrCode(finalData)
                imageQrCode.setImageBitmap(bitmap)
                textInstructions.text = "Show this code to the Grid Operator"
            } catch (e: Exception) {
                val bitmap = generateQrCode(reservationData)
                imageQrCode.setImageBitmap(bitmap)
                textInstructions.text = "Show this code to the Grid Operator"
            }
        } else {
            val bitmap = generateQrCode("SOLAR_BOOKING_DEFAULT")
            imageQrCode.setImageBitmap(bitmap)
            textInstructions.text = "Show this code to the Grid Operator"
        }

        buttonDone.setOnClickListener { finish() }
    }

    private fun generateQrCode(data: String): Bitmap {
        val size = 512
        val bitMatrix = MultiFormatWriter().encode(data, BarcodeFormat.QR_CODE, size, size)
        val bitmap = Bitmap.createBitmap(size, size, Bitmap.Config.RGB_565)
        for (x in 0 until size) {
            for (y in 0 until size) {
                bitmap.setPixel(x, y, if (bitMatrix.get(x, y)) Color.BLACK else Color.WHITE)
            }
        }
        return bitmap
    }
}
