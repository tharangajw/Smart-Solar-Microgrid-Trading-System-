package com.smartsolar.modules.operator

import android.os.Bundle
import android.view.View
import com.smartsolar.R
import com.smartsolar.modules.common.BaseNavActivity

class AlertsActivity : BaseNavActivity() {

    override fun getLayoutResourceId() = R.layout.activity_alerts
    override fun getMenuItemId() = R.id.nav_alerts

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Show empty state for now as it's a new feature
        findViewById<View>(R.id.layoutEmptyAlerts).visibility = View.VISIBLE
        findViewById<View>(R.id.recyclerAlerts).visibility = View.GONE
    }
}
