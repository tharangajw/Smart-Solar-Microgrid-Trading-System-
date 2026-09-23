package com.smartsolar.data.local

import android.content.Context
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteOpenHelper

class AppDatabase(context: Context) :
    SQLiteOpenHelper(context, DATABASE_NAME, null, DATABASE_VERSION) {

    companion object {
        const val DATABASE_NAME = "smart_solar.db"
        const val DATABASE_VERSION = 3 // Bumped for reliability

        const val TABLE_USERS = "users"
        const val COL_ID = "id"
        const val COL_NIC = "nic"
        const val COL_NAME = "name"
        const val COL_EMAIL = "email"
        const val COL_ROLE = "role"
        const val COL_TOKEN = "token"

        const val TABLE_RESERVATIONS = "reservations"
        const val COL_RES_ID = "id"
        const val COL_SLOT_ID = "slot_id"
        const val COL_NODE_ID = "node_id"
        const val COL_STATUS = "status"
        const val COL_SCHEDULED_DATE = "scheduled_date"
    }

    override fun onCreate(db: SQLiteDatabase) {
        val createUsersTable = """
            CREATE TABLE $TABLE_USERS (
                $COL_ID TEXT PRIMARY KEY,
                $COL_NIC TEXT,
                $COL_NAME TEXT,
                $COL_EMAIL TEXT,
                $COL_ROLE TEXT,
                $COL_TOKEN TEXT
            )
        """.trimIndent()

        val createReservationsTable = """
            CREATE TABLE $TABLE_RESERVATIONS (
                $COL_RES_ID TEXT PRIMARY KEY,
                $COL_SLOT_ID TEXT,
                $COL_NODE_ID TEXT,
                $COL_STATUS TEXT,
                $COL_SCHEDULED_DATE TEXT
            )
        """.trimIndent()

        db.execSQL(createUsersTable)
        db.execSQL(createReservationsTable)
    }

    override fun onUpgrade(db: SQLiteDatabase, oldVersion: Int, newVersion: Int) {
        db.execSQL("DROP TABLE IF EXISTS $TABLE_USERS")
        db.execSQL("DROP TABLE IF EXISTS $TABLE_RESERVATIONS")
        onCreate(db)
    }

    override fun onDowngrade(db: SQLiteDatabase?, oldVersion: Int, newVersion: Int) {
        onUpgrade(db!!, oldVersion, newVersion)
    }
}
