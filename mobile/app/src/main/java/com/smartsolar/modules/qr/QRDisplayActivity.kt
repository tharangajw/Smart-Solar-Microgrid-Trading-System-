package com.smartsolar.modules.qr

import android.os.Bundle
import android.widget.Button
import androidx.appcompat.app.AppCompatActivity
import com.smartsolar.R

class QRDisplayActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_qr_display)

        val buttonDone = findViewById<Button>(R.id.buttonDone)
        buttonDone.setOnClickListener {
            finish()
        }
    }
}