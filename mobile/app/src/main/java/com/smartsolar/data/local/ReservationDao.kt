package com.smartsolar.data.local

import android.content.ContentValues
import android.content.Context
import com.smartsolar.models.Reservation

class ReservationDao(context: Context) {
    private val db = AppDatabase(context).writableDatabase

    fun insertReservation(reservation: Reservation) {
        val values = ContentValues().apply {
            put(AppDatabase.COL_RES_ID, reservation.id)
            put(AppDatabase.COL_SLOT_ID, reservation.slotId)
            put(AppDatabase.COL_NODE_ID, reservation.nodeId)
            put(AppDatabase.COL_STATUS, reservation.status)
            put(AppDatabase.COL_SCHEDULED_DATE, reservation.scheduledDate)
        }
        // Use replace to act as an upsert (insert or update)
        db.replace(AppDatabase.TABLE_RESERVATIONS, null, values)
    }

    fun insertReservations(reservations: List<Reservation>) {
        db.beginTransaction()
        try {
            reservations.forEach { insertReservation(it) }
            db.setTransactionSuccessful()
        } finally {
            db.endTransaction()
        }
    }

    fun getAllReservations(): List<Reservation> {
        val reservations = mutableListOf<Reservation>()
        val cursor = db.query(AppDatabase.TABLE_RESERVATIONS, null, null, null, null, null, null)
        
        while (cursor.moveToNext()) {
            val res = Reservation(
                id = cursor.getString(cursor.getColumnIndexOrThrow(AppDatabase.COL_RES_ID)),
                slotId = cursor.getString(cursor.getColumnIndexOrThrow(AppDatabase.COL_SLOT_ID)),
                nodeId = cursor.getString(cursor.getColumnIndexOrThrow(AppDatabase.COL_NODE_ID)),
                status = cursor.getString(cursor.getColumnIndexOrThrow(AppDatabase.COL_STATUS)),
                scheduledDate = cursor.getString(cursor.getColumnIndexOrThrow(AppDatabase.COL_SCHEDULED_DATE))
            )
            reservations.add(res)
        }
        cursor.close()
        return reservations
    }

    fun clearAllReservations() {
        db.delete(AppDatabase.TABLE_RESERVATIONS, null, null)
    }
}