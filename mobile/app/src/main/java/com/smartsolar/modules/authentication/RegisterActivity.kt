package com.smartsolar.modules.authentication

import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.smartsolar.R

class RegisterActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_register)

        val buttonRegister = findViewById<Button>(R.id.buttonRegister)
        val textViewBack = findViewById<TextView>(R.id.textViewBack)

        buttonRegister.setOnClickListener {
            Toast.makeText(this, "Registration request sent.", Toast.LENGTH_SHORT).show()
            finish()
        }
        
        textViewBack?.setOnClickListener {
            finish()
        }
    }
}