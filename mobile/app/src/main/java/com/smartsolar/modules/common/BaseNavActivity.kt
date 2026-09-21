package com.smartsolar.modules.common

import android.content.Intent
import android.os.Bundle
import android.view.MenuItem
import android.widget.FrameLayout
import androidx.appcompat.app.AppCompatActivity
import com.google.android.material.bottomnavigation.BottomNavigationView
import com.google.android.material.floatingactionbutton.FloatingActionButton
import com.smartsolar.R
import com.smartsolar.modules.authentication.ProfileActivity
import com.smartsolar.modules.map.StationMapActivity
import com.smartsolar.modules.operator.OperatorDashboardActivity
import com.smartsolar.modules.prosumer.MyBookingsActivity
import com.smartsolar.modules.prosumer.ProsumerDashboardActivity
import com.smartsolar.modules.prosumer.ReserveSlotActivity
import com.smartsolar.modules.qr.QRScannerActivity
import com.smartsolar.utils.SessionManager

abstract class BaseNavActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // Inflate the base layout with the Bottom Nav
        setContentView(R.layout.activity_base_nav)

        // Inflate the child activity's layout into the container
        val container = findViewById<FrameLayout>(R.id.contentContainer)
        layoutInflater.inflate(getLayoutResourceId(), container, true)

        val bottomNav = findViewById<BottomNavigationView>(R.id.bottomNavigationView)
        val fab = findViewById<FloatingActionButton>(R.id.fabAction)

        val role = SessionManager(this).getRole()?.lowercase() ?: ""

        // Setup menu and FAB based on role
        if (role == "operator") {
            bottomNav.inflateMenu(R.menu.menu_operator_nav)
            fab.setImageResource(android.R.drawable.ic_menu_camera)
            fab.setOnClickListener {
                startActivity(Intent(this, QRScannerActivity::class.java))
            }
        } else {
            bottomNav.inflateMenu(R.menu.menu_prosumer_nav)
            fab.setImageResource(android.R.drawable.ic_menu_add)
            fab.setOnClickListener {
                startActivity(Intent(this, ReserveSlotActivity::class.java))
            }
        }

        // Highlight the correct tab based on current activity
        val currentMenuItemId = getMenuItemId()
        if (currentMenuItemId != 0) {
            bottomNav.selectedItemId = currentMenuItemId
        }

        bottomNav.setOnItemSelectedListener { item: MenuItem ->
            if (item.itemId == currentMenuItemId || item.itemId == R.id.nav_placeholder) {
                return@setOnItemSelectedListener false
            }

            when (item.itemId) {
                R.id.nav_home -> {
                    val intent = if (role == "operator") {
                        Intent(this, OperatorDashboardActivity::class.java)
                    } else {
                        Intent(this, ProsumerDashboardActivity::class.java)
                    }
                    startActivity(intent)
                }
                R.id.nav_map -> {
                    startActivity(Intent(this, StationMapActivity::class.java))
                }
                R.id.nav_bookings -> {
                    startActivity(Intent(this, MyBookingsActivity::class.java))
                }
                R.id.nav_profile -> {
                    startActivity(Intent(this, ProfileActivity::class.java))
                }
                // nav_alerts logic could go here when implemented
            }

            // Disable standard transition animation to make navigation look seamless
            overridePendingTransition(0, 0)
            true
        }
    }

    override fun onResume() {
        super.onResume()
        // Ensure the correct tab is highlighted when coming back
        val bottomNav = findViewById<BottomNavigationView>(R.id.bottomNavigationView)
        val currentMenuItemId = getMenuItemId()
        if (currentMenuItemId != 0) {
            bottomNav.selectedItemId = currentMenuItemId
        }
    }

    override fun onPause() {
        super.onPause()
        // Override transition when leaving
        overridePendingTransition(0, 0)
    }

    /**
     * Child activities must provide their layout resource ID.
     */
    abstract fun getLayoutResourceId(): Int

    /**
     * Child activities must provide their corresponding menu item ID
     * so the bottom navigation can highlight the correct tab.
     */
    abstract fun getMenuItemId(): Int
}
