package com.smartsolar.data.local

/*
 * UserDao.kt
 * Data Access Object for the 'users' table in the local SQLite database.
 * Provides insert, query, and delete operations for user session persistence.
 * Author: Member 4 – Operator Product
 */

import android.content.ContentValues
import android.content.Context
import com.smartsolar.models.User

class UserDao(context: Context) {

    // Obtain a writable reference to the SQLite database
    private val db = AppDatabase(context).writableDatabase

    /** Insert or replace the logged-in user record in the local SQLite DB */
    fun insertUser(user: User) {
        val values = ContentValues().apply {
            put(AppDatabase.COL_ID, user.id)
            put(AppDatabase.COL_NIC, user.nic)
            put(AppDatabase.COL_NAME, user.name)
            put(AppDatabase.COL_EMAIL, user.email)
            put(AppDatabase.COL_ROLE, user.role)
            put(AppDatabase.COL_TOKEN, user.token)
        }
        // Replace if the record already exists (same ID)
        db.insertWithOnConflict(
            AppDatabase.TABLE_USERS,
            null,
            values,
            android.database.sqlite.SQLiteDatabase.CONFLICT_REPLACE
        )
    }

    /** Retrieve the locally saved user record as a User object */
    fun getLoggedInUser(): User? {
        val cursor = db.query(
            AppDatabase.TABLE_USERS, null, null, null, null, null, null
        )
        return if (cursor.moveToFirst()) {
            val user = User(
                id = cursor.getString(cursor.getColumnIndexOrThrow(AppDatabase.COL_ID)),
                nic = cursor.getString(cursor.getColumnIndexOrThrow(AppDatabase.COL_NIC)),
                name = cursor.getString(cursor.getColumnIndexOrThrow(AppDatabase.COL_NAME)),
                email = cursor.getString(cursor.getColumnIndexOrThrow(AppDatabase.COL_EMAIL)),
                role = cursor.getString(cursor.getColumnIndexOrThrow(AppDatabase.COL_ROLE)),
                token = cursor.getString(cursor.getColumnIndexOrThrow(AppDatabase.COL_TOKEN))
            )
            cursor.close()
            user
        } else {
            cursor.close()
            null
        }
    }

    /** Delete all user records from local DB on logout */
    fun clearUser() {
        db.delete(AppDatabase.TABLE_USERS, null, null)
    }
}
