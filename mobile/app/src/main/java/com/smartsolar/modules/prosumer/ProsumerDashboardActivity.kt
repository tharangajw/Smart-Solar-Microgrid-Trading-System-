package com.smartsolar.modules.prosumer

import android.content.Intent
import android.os.Bundle
import android.view.View
import androidx.appcompat.app.AppCompatActivity
import com.smartsolar.R
import com.smartsolar.modules.authentication.ProfileActivity
import com.smartsolar.modules.history.EnergyHistoryActivity
import com.smartsolar.modules.map.StationMapActivity
import com.smartsolar.modules.reservations.CreateReservationActivity

class ProsumerDashboardActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_prosumer_dashboard)

        val buttonProfile = findViewById<View>(R.id.buttonProfile)
        val buttonMap = findViewById<View>(R.id.buttonMap)
        val buttonManageReservations = findViewById<View>(R.id.buttonManageReservations)
        val buttonBookingHistory = findViewById<View>(R.id.buttonBookingHistory)

        buttonProfile.setOnClickListener {
            startActivity(Intent(this, ProfileActivity::class.java))
        }

        buttonMap.setOnClickListener {
            startActivity(Intent(this, StationMapActivity::class.java))
        }

        buttonManageReservations.setOnClickListener {
            startActivity(Intent(this, CreateReservationActivity::class.java))
        }

        buttonBookingHistory.setOnClickListener {
            startActivity(Intent(this, EnergyHistoryActivity::class.java))
        }
    }
}