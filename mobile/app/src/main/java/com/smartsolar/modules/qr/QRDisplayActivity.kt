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
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.google.zxing.BarcodeFormat
import com.google.zxing.MultiFormatWriter
import com.smartsolar.R
import org.json.JSONObject

class QRDisplayActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_qr_display)

        val imageQrCode = findViewById<ImageView>(R.id.imageViewQrCode)
        val textInstructions = findViewById<TextView>(R.id.textViewInstructions)
        val buttonDone = findViewById<Button>(R.id.buttonDone)

        val reservationData = intent.getStringExtra("RESERVATION_DATA")

        if (reservationData != null) {
            try {
                val json = JSONObject(reservationData)
                val qrData = json.optString("qrCodeId").trim()
                require(qrData.isNotEmpty()) { "QR code ID is missing" }
                
                val bitmap = generateQrCode(qrData)
                imageQrCode.setImageBitmap(bitmap)
                textInstructions.text = "Show this code to the Grid Operator"
            } catch (e: Exception) {
                Toast.makeText(this, "QR code is unavailable for this booking", Toast.LENGTH_SHORT).show()
                finish()
            }
        } else {
            Toast.makeText(this, "No reservation data found", Toast.LENGTH_SHORT).show()
            finish()
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
