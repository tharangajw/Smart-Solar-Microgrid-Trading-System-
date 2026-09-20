package com.smartsolar.data.local

/*
 * AppDatabase.kt
 * SQLite database helper for local persistence on the Android device.
 * Implements SQLiteOpenHelper to create and manage the local database schema.
 * Tables: users (session cache), reservations (offline booking cache).
 * Author: Member 4 – Operator Product
 */

import android.content.Context
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteOpenHelper

class AppDatabase(context: Context) :
    SQLiteOpenHelper(context, DATABASE_NAME, null, DATABASE_VERSION) {

    companion object {
        // Database version and name constants
        const val DATABASE_NAME = "smart_solar.db"
        const val DATABASE_VERSION = 1

        // Users table – stores the logged-in user locally
        const val TABLE_USERS = "users"
        const val COL_ID = "id"
        const val COL_NIC = "nic"
        const val COL_NAME = "name"
        const val COL_EMAIL = "email"
        const val COL_ROLE = "role"
        const val COL_TOKEN = "token"

        // Reservations table – local cache of bookings
        const val TABLE_RESERVATIONS = "reservations"
        const val COL_RES_ID = "id"
        const val COL_SLOT_ID = "slot_id"
        const val COL_NODE_ID = "node_id"
        const val COL_STATUS = "status"
        const val COL_SCHEDULED_DATE = "scheduled_date"
    }

    /** Called when the database is first created */
    override fun onCreate(db: SQLiteDatabase) {
        // Create users table
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

        // Create reservations table
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

    /** Called when the database version changes – drop and recreate */
    override fun onUpgrade(db: SQLiteDatabase, oldVersion: Int, newVersion: Int) {
        db.execSQL("DROP TABLE IF EXISTS $TABLE_USERS")
        db.execSQL("DROP TABLE IF EXISTS $TABLE_RESERVATIONS")
        onCreate(db)
    }
}