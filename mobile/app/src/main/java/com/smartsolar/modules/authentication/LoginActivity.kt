package com.smartsolar.modules.authentication

/*
 * LoginActivity.kt
 * Handles user login for both Prosumer and Grid Operator roles.
 * Supports login via either NIC or Email.
 * Author: Member 4 – Operator Product
 */

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.ImageView
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.smartsolar.R
import com.smartsolar.data.local.UserDao
import com.smartsolar.data.remote.ApiClient
import com.smartsolar.models.User
import com.smartsolar.modules.operator.OperatorDashboardActivity
import com.smartsolar.modules.prosumer.ProsumerDashboardActivity
import com.smartsolar.utils.SessionManager
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONObject

class LoginActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login)

        val sessionManager = SessionManager(this)

        val editIdentifier = findViewById<EditText>(R.id.editTextNic)
        val editPassword = findViewById<EditText>(R.id.editTextPassword)
        val buttonLogin = findViewById<Button>(R.id.buttonLogin)
        val textViewRegister = findViewById<TextView>(R.id.textViewRegisterPrompt)
        val headerImage = findViewById<ImageView>(R.id.headerImage)

        // Secret Setup: Long-press the header image to change Server IP
        headerImage.setOnLongClickListener {
            showServerIpDialog(sessionManager)
            true
        }

        buttonLogin.setOnClickListener {
            val identifier = editIdentifier.text.toString().trim()
            val password = editPassword.text.toString().trim()

            if (identifier.isEmpty() || password.isEmpty()) {
                Toast.makeText(this, "Please enter NIC/Email and password", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            // Disable button to prevent double-tap during request
            buttonLogin.isEnabled = false

            // Backend accepts 'Email' field as either Email or NIC
            val body = JSONObject().apply {
                put("email", identifier)
                put("nic", identifier)
                put("password", password)
            }

            Log.d("Login", "Attempting login at: ${sessionManager.getServerIp()}")

            // Launch network call on IO thread — keeps UI thread free (prevents ANR)
            lifecycleScope.launch(Dispatchers.IO) {
                val result = ApiClient.post(this@LoginActivity, "Auth/login", body)

                // Switch back to Main thread to update UI
                withContext(Dispatchers.Main) {
                    buttonLogin.isEnabled = true

                    if (result.isSuccess && result.body != null) {
                        try {
                            val json = JSONObject(result.body)
                            val token = json.getString("token")
                            val role = json.getString("role")
                            val name = json.optString("fullName", "User")
                            val nic = json.optString("nic", identifier)
                            val userId = json.optString("userId", "0")
                            val email = json.optString("email", "")

                            // 1. Save to SharedPreferences
                            sessionManager.saveSession(token, role, nic, name, email)

                            // 2. Save to SQLite
                            val user = User(userId, nic, name, email, role, token)
                            UserDao(this@LoginActivity).insertUser(user)

                            Log.d("Login", "Login successful, role: $role")

                            try {
                                // 3. Route based on role
                                val destination = if (role.equals("GridOperator", ignoreCase = true)) {
                                    OperatorDashboardActivity::class.java
                                } else {
                                    ProsumerDashboardActivity::class.java
                                }

                                startActivity(Intent(this@LoginActivity, destination))
                                finish()
                            } catch (e: Exception) {
                                Log.e("Login", "Navigation error: ${e.message}")
                                Toast.makeText(this@LoginActivity, "App error during navigation.", Toast.LENGTH_SHORT).show()
                            }

                        } catch (e: Exception) {
                            Log.e("Login", "Parsing error: ${e.message}")
                            Toast.makeText(this@LoginActivity, "Login error: Invalid response from server", Toast.LENGTH_SHORT).show()
                        }
                    } else {
                        val errorMsg = result.message ?: "Invalid credentials or account inactive"
                        Log.e("Login", "Login failed: $errorMsg")
                        Toast.makeText(this@LoginActivity, errorMsg, Toast.LENGTH_LONG).show()
                    }
                }
            }
        }

        textViewRegister.setOnClickListener {
            startActivity(Intent(this, RegisterActivity::class.java))
        }
    }

    private fun showServerIpDialog(sessionManager: SessionManager) {
        val input = EditText(this)
        input.hint = "e.g. 192.168.1.15"
        input.setText(sessionManager.getServerIp())
        input.setPadding(64, 32, 64, 32)

        AlertDialog.Builder(this)
            .setTitle("Server Configuration")
            .setMessage("Enter your Computer's IP address (IPv4) to connect to the backend:")
            .setView(input)
            .setPositiveButton("Save") { _, _ ->
                val newIp = input.text.toString().trim()
                if (newIp.isNotEmpty()) {
                    sessionManager.saveServerIp(newIp)
                    Toast.makeText(this, "Server IP updated to: $newIp", Toast.LENGTH_SHORT).show()
                }
            }
            .setNegativeButton("Cancel", null)
            .show()
    }
}
