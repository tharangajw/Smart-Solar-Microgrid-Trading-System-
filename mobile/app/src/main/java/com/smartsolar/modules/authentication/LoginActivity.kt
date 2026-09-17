package com.smartsolar.modules.authentication

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import com.smartsolar.R
import com.smartsolar.modules.prosumer.ProsumerDashboardActivity

class LoginActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login)

        val buttonLogin = findViewById<Button>(R.id.buttonLogin)
        val textViewRegister = findViewById<TextView>(R.id.textViewRegisterPrompt)

        buttonLogin.setOnClickListener {
            startActivity(Intent(this, ProsumerDashboardActivity::class.java))
        }

        textViewRegister.setOnClickListener {
            startActivity(Intent(this, RegisterActivity::class.java))
        }
    }
}