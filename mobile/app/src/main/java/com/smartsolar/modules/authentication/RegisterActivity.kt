package com.smartsolar.modules.authentication

/*
 * RegisterActivity.kt
 * Handles new Solar Prosumer registration.
 * Collects NIC (Primary Key), Full Name, Email, and Password.
 * Calls POST /auth/register via ApiClient and redirects to Login on success.
 * Author: Member 4 – Operator Product
 */

import android.os.Bundle
import android.os.StrictMode
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.smartsolar.R
import com.smartsolar.data.remote.ApiClient
import org.json.JSONObject

class RegisterActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_register)

        // Allow network on main thread for simplicity (assignment scope)
        val policy = StrictMode.ThreadPolicy.Builder().permitAll().build()
        StrictMode.setThreadPolicy(policy)

        val editNic = findViewById<EditText>(R.id.editTextNic)
        val editName = findViewById<EditText>(R.id.editTextName)
        val editEmail = findViewById<EditText>(R.id.editTextEmail)
        val editPassword = findViewById<EditText>(R.id.editTextPassword)
        val buttonRegister = findViewById<Button>(R.id.buttonRegister)
        val textViewBack = findViewById<TextView>(R.id.textViewBack)

        buttonRegister.setOnClickListener {
            val nic = editNic.text.toString().trim()
            val name = editName.text.toString().trim()
            val email = editEmail.text.toString().trim()
            val password = editPassword.text.toString().trim()

            // Validation
            if (nic.isEmpty() || name.isEmpty() || email.isEmpty() || password.isEmpty()) {
                Toast.makeText(this, "All fields are required", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            // Build JSON body
            val body = JSONObject().apply {
                put("nic", nic)
                put("fullName", name) // Backend expects fullName
                put("email", email)
                put("password", password)
                put("phoneNumber", "0000000000") // Required fields for backend
                put("address", "N/A")
                put("solarCapacityKw", 0.0)
            }

            // Call API
            val result = ApiClient.post(this, "auth/register", body)

            if (result.isSuccess) {
                Toast.makeText(this, "Registration Successful! Please login after activation.", Toast.LENGTH_LONG).show()
                finish() // Go back to Login screen
            } else {
                Toast.makeText(this, result.message ?: "Registration failed", Toast.LENGTH_LONG).show()
            }
        }
        
        textViewBack?.setOnClickListener {
            finish()
        }
    }
}
