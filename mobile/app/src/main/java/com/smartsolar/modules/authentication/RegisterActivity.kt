package com.smartsolar.modules.authentication

/*
 * RegisterActivity.kt
 * Handles new Solar Prosumer registration.
 * Collects NIC (Primary Key), Full Name, Email, and Password.
 * Calls POST /auth/register via ApiClient and redirects to Login on success.
 * Author: Member 4 – Operator Product
 */

import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.smartsolar.R
import com.smartsolar.data.remote.ApiClient
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONObject

class RegisterActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_register)

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
                put("fullName", name) 
                put("email", email)
                put("password", password)
                put("phoneNumber", "0000000000")
                put("address", "N/A")
                put("solarCapacityKw", 0.0)
            }

            buttonRegister.isEnabled = false
            lifecycleScope.launch(Dispatchers.IO) {
                // Call API
                val result = ApiClient.post(this@RegisterActivity, "auth/register", body)

                withContext(Dispatchers.Main) {
                    buttonRegister.isEnabled = true
                    if (result.isSuccess) {
                        Toast.makeText(this@RegisterActivity, "Registration Successful! Please login after activation.", Toast.LENGTH_LONG).show()
                        finish() 
                    } else {
                        Toast.makeText(this@RegisterActivity, result.message ?: "Registration failed", Toast.LENGTH_LONG).show()
                    }
                }
            }
        }
        
        textViewBack?.setOnClickListener {
            finish()
        }
    }
}
