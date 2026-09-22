package com.smartsolar.modules.common

import android.content.Intent
import android.graphics.Color
import android.os.Bundle
import android.view.MenuItem
import android.view.View
import android.widget.FrameLayout
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.google.android.material.badge.BadgeDrawable
import com.google.android.material.bottomnavigation.BottomNavigationView
import com.google.android.material.floatingactionbutton.FloatingActionButton
import com.smartsolar.R
import com.smartsolar.data.remote.ApiClient
import com.smartsolar.modules.authentication.ProfileActivity
import com.smartsolar.modules.map.StationMapActivity
import com.smartsolar.modules.operator.OperatorDashboardActivity
import com.smartsolar.modules.prosumer.MyBookingsActivity
import com.smartsolar.modules.prosumer.ProsumerDashboardActivity
import com.smartsolar.modules.prosumer.ReserveSlotActivity
import com.smartsolar.modules.qr.QRScannerActivity
import com.smartsolar.utils.SessionManager
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject

abstract class BaseNavActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_base_nav)

        val container = findViewById<FrameLayout>(R.id.contentContainer)
        if (container != null) {
            layoutInflater.inflate(getLayoutResourceId(), container, true)
        } else {
            android.util.Log.e("BaseNav", "contentContainer not found in activity_base_nav")
        }

        val bottomNav = findViewById<BottomNavigationView>(R.id.bottomNavigationView)
        val fab = findViewById<FloatingActionButton>(R.id.fabAction)

        if (bottomNav == null || fab == null) {
            android.util.Log.e("BaseNav", "Navigation components not found")
            return
        }

        val role = SessionManager(this).getRole()?.lowercase() ?: ""

        // Setup menu and FAB based on role
        if (role.contains("operator")) {
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

        // Highlight current tab
        val currentMenuItemId = getMenuItemId()
        if (currentMenuItemId != 0) {
            bottomNav.selectedItemId = currentMenuItemId
            updateTopBarTitle(currentMenuItemId)
        }

        bottomNav.setOnItemSelectedListener { item: MenuItem ->
            if (item.itemId == currentMenuItemId || item.itemId == R.id.nav_placeholder) {
                return@setOnItemSelectedListener false
            }

            when (item.itemId) {
                R.id.nav_home -> {
                    val intent = if (role.contains("operator")) {
                        Intent(this, OperatorDashboardActivity::class.java)
                    } else {
                        Intent(this, ProsumerDashboardActivity::class.java)
                    }
                    startActivity(intent)
                }
                R.id.nav_map -> startActivity(Intent(this, StationMapActivity::class.java))
                R.id.nav_bookings -> startActivity(Intent(this, MyBookingsActivity::class.java))
                R.id.nav_alerts -> startActivity(Intent(this, com.smartsolar.modules.operator.AlertsActivity::class.java))
                R.id.nav_profile -> startActivity(Intent(this, ProfileActivity::class.java))
            }
            overridePendingTransition(0, 0)
            true
        }

        // Handle Back button
        findViewById<android.widget.ImageButton>(R.id.btnNavBack)?.setOnClickListener {
            onBackPressed()
        }

        // Check for pending alerts and update notification dot badge on BottomNav
        checkAlertsForBadge()
    }

    private fun checkAlertsForBadge() {
        val role = SessionManager(this).getRole()?.lowercase() ?: ""
        if (!role.contains("operator")) return

        val currentMenuItemId = getMenuItemId()
        val bottomNav = findViewById<BottomNavigationView>(R.id.bottomNavigationView) ?: return

        // If currently viewing AlertsActivity, clear the badge
        if (currentMenuItemId == R.id.nav_alerts) {
            bottomNav.removeBadge(R.id.nav_alerts)
            return
        }

        lifecycleScope.launch(Dispatchers.IO) {
            var response = ApiClient.get(this@BaseNavActivity, "Reservations/pending")
            if (response == null || response.trim() == "[]" || response.trim() == "{}") {
                response = ApiClient.get(this@BaseNavActivity, "Reservations")
            }

            if (response != null && response.trim().isNotEmpty()) {
                try {
                    val array = parseJsonArray(response)
                    var pendingCount = 0
                    for (i in 0 until array.length()) {
                        val item = array.getJSONObject(i)
                        val status = item.optString("status", "Pending")
                        if (status.equals("Pending", ignoreCase = true)) {
                            pendingCount++
                        }
                    }

                    withContext(Dispatchers.Main) {
                        if (pendingCount > 0) {
                            val badge = bottomNav.getOrCreateBadge(R.id.nav_alerts)
                            badge.isVisible = true
                            badge.backgroundColor = Color.parseColor("#F44336") // Red dot
                            badge.badgeGravity = BadgeDrawable.TOP_END
                            badge.number = pendingCount
                        } else {
                            bottomNav.removeBadge(R.id.nav_alerts)
                        }
                    }
                } catch (_: Exception) {}
            }
        }
    }

    private fun parseJsonArray(json: String): JSONArray {
        val trimmed = json.trim()
        return if (trimmed.startsWith("[")) {
            JSONArray(trimmed)
        } else {
            val obj = JSONObject(trimmed)
            when {
                obj.has("data") -> obj.getJSONArray("data")
                obj.has("value") -> obj.getJSONArray("value")
                else -> JSONArray()
            }
        }
    }

    private fun updateTopBarTitle(menuItemId: Int) {
        val customTopBar = findViewById<View>(R.id.customTopBar)
        val titleText = findViewById<android.widget.TextView>(R.id.textNavTitle)
        val subtitleText = findViewById<android.widget.TextView>(R.id.textNavSubtitle)
        val btnBack = findViewById<android.widget.ImageButton>(R.id.btnNavBack)

        when (menuItemId) {
            R.id.nav_home -> {
                customTopBar?.visibility = View.GONE
            }
            R.id.nav_map -> {
                customTopBar?.visibility = View.VISIBLE
                titleText?.text = "Station Map"
                subtitleText?.text = "Find nearby nodes"
                btnBack?.visibility = View.VISIBLE
            }
            R.id.nav_bookings -> {
                customTopBar?.visibility = View.VISIBLE
                titleText?.text = "My Bookings"
                subtitleText?.text = "Manage your slots"
                btnBack?.visibility = View.VISIBLE
            }
            R.id.nav_alerts -> {
                customTopBar?.visibility = View.VISIBLE
                titleText?.text = "System Alerts"
                subtitleText?.text = "Grid notifications"
                btnBack?.visibility = View.VISIBLE
            }
            R.id.nav_profile -> {
                customTopBar?.visibility = View.GONE
            }
        }
    }

    override fun onResume() {
        super.onResume()
        val bottomNav = findViewById<BottomNavigationView>(R.id.bottomNavigationView)
        val currentMenuItemId = getMenuItemId()
        if (currentMenuItemId != 0) {
            bottomNav?.selectedItemId = currentMenuItemId
        }
        checkAlertsForBadge()
    }

    override fun onPause() {
        super.onPause()
        overridePendingTransition(0, 0)
    }

    abstract fun getLayoutResourceId(): Int
    abstract fun getMenuItemId(): Int
}
