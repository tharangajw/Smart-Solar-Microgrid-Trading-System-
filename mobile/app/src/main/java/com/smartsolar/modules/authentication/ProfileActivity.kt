package com.smartsolar.modules.authentication

/*
 * ProfileActivity.kt
 * Allows Solar Prosumers to view and edit their profile data.
 * Loads user data from local SQLite (UserDao).
 * Updates are sent to PUT /Users/me.
 * Deactivation requests are sent to POST /Users/me/deactivate.
 * Author: Member 4 – Operator Product
 */

import android.os.Bundle
import android.os.StrictMode
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import com.smartsolar.modules.common.BaseNavActivity
import com.smartsolar.R
import com.smartsolar.data.local.UserDao
import com.smartsolar.data.remote.ApiClient
import com.smartsolar.models.User
import org.json.JSONObject

class ProfileActivity : BaseNavActivity() {

    override fun getLayoutResourceId() = R.layout.activity_profile
    override fun getMenuItemId() = R.id.nav_profile

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Allow network on main thread for simplicity (assignment scope)
        val policy = StrictMode.ThreadPolicy.Builder().permitAll().build()
        StrictMode.setThreadPolicy(policy)

        val editNic = findViewById<EditText>(R.id.editTextNic)
        val editName = findViewById<EditText>(R.id.editTextName)
        val editEmail = findViewById<EditText>(R.id.editTextEmail)
        val buttonUpdateProfile = findViewById<Button>(R.id.buttonUpdateProfile)
        val buttonDeactivate = findViewById<Button>(R.id.buttonDeactivate)

        // Load current user data
        val userDao = UserDao(this)
        val user = userDao.getLoggedInUser()

        if (user != null) {
            editNic.setText(user.nic)
            editName.setText(user.name)
            editEmail.setText(user.email)
        }

        buttonUpdateProfile.setOnClickListener {
            val name = editName.text.toString().trim()
            val email = editEmail.text.toString().trim()

            if (name.isEmpty() || email.isEmpty()) {
                Toast.makeText(this, "Name and Email are required", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            val body = JSONObject().apply {
                put("fullName", name)
                put("email", email)
            }

            // Using PUT for profile update
            val result = ApiClient.put(this, "Users/me", body) 
            if (result.isSuccess) {
                if (user != null) {
                    val updatedUser = User(user.id, user.nic, name, email, user.role, user.token)
                    userDao.insertUser(updatedUser)
                }
                Toast.makeText(this, "Profile updated successfully.", Toast.LENGTH_SHORT).show()
            } else {
                Toast.makeText(this, result.message ?: "Failed to update profile.", Toast.LENGTH_SHORT).show()
            }
        }

        buttonDeactivate.setOnClickListener {
            AlertDialog.Builder(this)
                .setTitle("Deactivate Account")
                .setMessage("Are you sure you want to request account deactivation?")
                .setPositiveButton("Yes") { _, _ ->
                    val result = ApiClient.post(this, "Users/me/deactivate", JSONObject())
                    if (result.isSuccess) {
                        Toast.makeText(this, "Deactivation requested.", Toast.LENGTH_SHORT).show()
                        finish()
                    } else {
                        Toast.makeText(this, result.message ?: "Failed to request deactivation.", Toast.LENGTH_SHORT).show()
                    }
                }
                .setNegativeButton("No", null)
                .show()
        }
    }
}
