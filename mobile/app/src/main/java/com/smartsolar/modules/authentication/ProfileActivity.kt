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
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.lifecycle.lifecycleScope
import com.smartsolar.modules.common.BaseNavActivity
import com.smartsolar.R
import com.smartsolar.data.local.UserDao
import com.smartsolar.data.remote.ApiClient
import com.smartsolar.models.User
import com.smartsolar.utils.SessionManager
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONObject

class ProfileActivity : BaseNavActivity() {

    override fun getLayoutResourceId() = R.layout.activity_profile
    override fun getMenuItemId() = R.id.nav_profile

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val textNic = findViewById<TextView>(R.id.textNicDisplay)
        val editName = findViewById<EditText>(R.id.editTextName)
        val editEmail = findViewById<EditText>(R.id.editTextEmail)
        val buttonUpdateProfile = findViewById<Button>(R.id.buttonUpdateProfile)
        val buttonDeactivate = findViewById<Button>(R.id.buttonDeactivate)
        
        val textProfileName = findViewById<TextView>(R.id.textProfileName)
        val textProfileRole = findViewById<TextView>(R.id.textProfileRole)
        
        findViewById<View>(R.id.btnProfileBack)?.setOnClickListener {
            onBackPressed()
        }

        findViewById<View>(R.id.buttonLogout)?.setOnClickListener {
            AlertDialog.Builder(this)
                .setTitle("Logout")
                .setMessage("Are you sure you want to logout?")
                .setPositiveButton("Logout") { _, _ -> logout() }
                .setNegativeButton("Cancel", null)
                .show()
        }

        // Load current user data from SQLite
        val userDao = UserDao(this)
        val user = userDao.getLoggedInUser()

        if (user != null) {
            textNic.text = user.nic
            editName.setText(user.name)
            editEmail.setText(user.email)
            
            textProfileName.text = user.name
            textProfileRole.text = if (user.role.lowercase().contains("operator")) "Grid Operator" else "Solar Prosumer"
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

            buttonUpdateProfile.isEnabled = false
            lifecycleScope.launch(Dispatchers.IO) {
                // Using PUT for profile update
                val result = ApiClient.put(this@ProfileActivity, "Users/me", body) 
                
                withContext(Dispatchers.Main) {
                    buttonUpdateProfile.isEnabled = true
                    if (result.isSuccess) {
                        // Sync with local SQLite
                        userDao.updateUserProfile(name, email)
                        textProfileName.text = name
                        Toast.makeText(this@ProfileActivity, "Profile updated successfully.", Toast.LENGTH_SHORT).show()
                    } else {
                        Toast.makeText(this@ProfileActivity, result.message ?: "Failed to update profile.", Toast.LENGTH_SHORT).show()
                    }
                }
            }
        }

        buttonDeactivate.setOnClickListener {
            AlertDialog.Builder(this)
                .setTitle("Deactivate Account")
                .setMessage("Are you sure you want to request account deactivation? This action will disable your access to the Smart Solar grid.")
                .setPositiveButton("Yes, Deactivate") { _, _ ->
                    buttonDeactivate.isEnabled = false
                    lifecycleScope.launch(Dispatchers.IO) {
                        val result = ApiClient.post(this@ProfileActivity, "Users/me/deactivate", JSONObject())
                        withContext(Dispatchers.Main) {
                            if (result.isSuccess) {
                                Toast.makeText(this@ProfileActivity, "Account deactivated. Logging out...", Toast.LENGTH_LONG).show()
                                logout()
                            } else {
                                buttonDeactivate.isEnabled = true
                                Toast.makeText(this@ProfileActivity, result.message ?: "Failed to request deactivation.", Toast.LENGTH_SHORT).show()
                            }
                        }
                    }
                }
                .setNegativeButton("Cancel", null)
                .show()
        }
    }

    private fun logout() {
        SessionManager(this).logout()
        UserDao(this).clearUser()
        val intent = android.content.Intent(this, LoginActivity::class.java)
        intent.flags = android.content.Intent.FLAG_ACTIVITY_NEW_TASK or android.content.Intent.FLAG_ACTIVITY_CLEAR_TASK
        startActivity(intent)
        finish()
    }
}
