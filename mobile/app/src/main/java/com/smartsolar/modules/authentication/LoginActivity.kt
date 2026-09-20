package com.smartsolar.modules.authentication

/*
 * LoginActivity.kt
 * Handles user login for both Prosumer and Grid Operator roles.
 * Supports login via either NIC or Email.
 * Author: Member 4 – Operator Product
 */

import android.content.Intent
import android.os.Bundle
import android.os.StrictMode
import android.util.Log
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.smartsolar.R
import com.smartsolar.data.local.UserDao
import com.smartsolar.data.remote.ApiClient
import com.smartsolar.models.User
import com.smartsolar.modules.operator.OperatorDashboardActivity
import com.smartsolar.modules.prosumer.ProsumerDashboardActivity
import com.smartsolar.utils.SessionManager
import org.json.JSONObject

class LoginActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login)

        val policy = StrictMode.ThreadPolicy.Builder().permitAll().build()
        StrictMode.setThreadPolicy(policy)

        val editIdentifier = findViewById<EditText>(R.id.editTextNic) 
        val editPassword = findViewById<EditText>(R.id.editTextPassword)
        val buttonLogin = findViewById<Button>(R.id.buttonLogin)
        val textViewRegister = findViewById<TextView>(R.id.textViewRegisterPrompt)

        buttonLogin.setOnClickListener {
            val identifier = editIdentifier.text.toString().trim()
            val password = editPassword.text.toString().trim()

            if (identifier.isEmpty() || password.isEmpty()) {
                Toast.makeText(this, "Please enter NIC/Email and password", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            // Backend accepts 'Email' field as either Email or NIC
            val body = JSONObject().apply {
                put("email", identifier) 
                put("nic", identifier)
                put("password", password)
            }

            Log.d("Login", "Attempting login for: $identifier")
            val result = ApiClient.post(this, "Auth/login", body)

            if (result.isSuccess && result.body != null) {
                try {
                    val json = JSONObject(result.body)
                    val token = json.getString("token")
                    val role = json.getString("role")
                    val name = json.optString("fullName", "User")
                    val nic = json.optString("nic", identifier)
                    val userId = json.optString("userId", "0")

                    // 1. Save to SharedPreferences
                    SessionManager(this).saveSession(token, role, nic)
                    
                    // 2. Save to SQLite
                    val user = User(userId, nic, name, json.optString("email", ""), role, token)
                    UserDao(this).insertUser(user)

                    Log.d("Login", "Login successful, role: $role")
                    
                    // 3. Route based on role
                    val destination = if (role.equals("GridOperator", ignoreCase = true)) {
                        OperatorDashboardActivity::class.java
                    } else {
                        ProsumerDashboardActivity::class.java
                    }
                    
                    startActivity(Intent(this, destination))
                    finish()

                } catch (e: Exception) {
                    Log.e("Login", "Parsing error: ${e.message}")
                    Toast.makeText(this, "Login error: Invalid response from server", Toast.LENGTH_SHORT).show()
                }
            } else {
                val errorMsg = result.message ?: "Invalid credentials or account inactive"
                Log.e("Login", "Login failed: $errorMsg")
                Toast.makeText(this, errorMsg, Toast.LENGTH_LONG).show()
            }
        }

        textViewRegister.setOnClickListener {
            startActivity(Intent(this, RegisterActivity::class.java))
        }
    }
}
