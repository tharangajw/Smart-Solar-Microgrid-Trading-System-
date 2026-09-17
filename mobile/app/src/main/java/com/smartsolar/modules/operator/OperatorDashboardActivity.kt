package com.smartsolar.modules.operator

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import androidx.appcompat.app.AppCompatActivity
import com.smartsolar.R
import com.smartsolar.modules.qr.QRScannerActivity

class OperatorDashboardActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_operator_dashboard)

        val buttonScanQr = findViewById<Button>(R.id.buttonScanQr)
        buttonScanQr.setOnClickListener {
            startActivity(Intent(this, QRScannerActivity::class.java))
        }
    }
}