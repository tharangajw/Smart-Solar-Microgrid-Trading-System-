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

    /** Insert the logged-in user record. Clears previous records to ensure single session. */
    fun insertUser(user: User) {
        // Requirement: Single user session management. Clear existing records first.
        db.delete(AppDatabase.TABLE_USERS, null, null)

        val values = ContentValues().apply {
            put(AppDatabase.COL_ID, user.id)
            put(AppDatabase.COL_NIC, user.nic)
            put(AppDatabase.COL_NAME, user.name)
            put(AppDatabase.COL_EMAIL, user.email)
            put(AppDatabase.COL_ROLE, user.role)
            put(AppDatabase.COL_TOKEN, user.token)
        }
        db.insert(AppDatabase.TABLE_USERS, null, values)
    }

    /** Retrieve the locally saved user record as a User object */
    fun getLoggedInUser(): User? {
        return try {
            val cursor = db.query(
                AppDatabase.TABLE_USERS, null, null, null, null, null, null
            )
            if (cursor.moveToFirst()) {
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
        } catch (e: Exception) {
            android.util.Log.e("UserDao", "Error retrieving user: ${e.message}")
            null
        }
    }

    /** Delete all user records from local DB on logout */
    fun clearUser() {
        db.delete(AppDatabase.TABLE_USERS, null, null)
    }

    /** Surgical update of user profile data locally */
    fun updateUserProfile(name: String, email: String) {
        val values = ContentValues().apply {
            put(AppDatabase.COL_NAME, name)
            put(AppDatabase.COL_EMAIL, email)
        }
        // Update all rows (there should only ever be one logged-in user)
        db.update(AppDatabase.TABLE_USERS, values, null, null)
    }
}
