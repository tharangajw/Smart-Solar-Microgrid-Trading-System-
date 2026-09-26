import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { Eye, Clock, CalendarDays, Loader, XCircle } from 'lucide-react';

const BookingTable = ({ bookings, loading, onApprove, approvingId, onCancel }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 gap-2 text-sage text-sm">
        <Loader size={18} className="animate-spin" /> Loading bookings...
      </div>
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
      <div className="text-center py-20">
        <CalendarDays className="mx-auto text-sage mb-3" size={32} />
        <p className="text-charcoal font-medium">No bookings yet</p>
        <p className="text-sm text-charcoal-light mt-1">When new bookings arrive, they'll show up here.</p>
      </div>
    );
  }

  const fmt = (d) => d ? new Date(d).toLocaleString('en-LK', {
    dateStyle: 'medium', timeStyle: 'short'
  }) : '—';

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-charcoal-light uppercase bg-forest/5 border-b border-forest/10">
          <tr>
            <th className="px-4 py-3 font-medium">Prosumer NIC</th>
            <th className="px-4 py-3 font-medium">Node / Station</th>
            <th className="px-4 py-3 font-medium">Slot ID</th>
            <th className="px-4 py-3 font-medium">Date</th>
            <th className="px-4 py-3 font-medium">Time</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Created</th>
            <th className="px-4 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => {
            const canModify = booking.status !== 'Cancelled' && booking.status !== 'Completed';
            return (
              <tr key={booking.id} className="border-b border-forest/5 hover:bg-forest/[0.03]">
                <td className="px-4 py-3 font-mono text-xs">{booking.prosumerNic || '—'}</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-charcoal text-xs">{booking.nodeName || booking.nodeId || '—'}</p>
                  <p className="text-charcoal-light font-mono text-[10px] mt-0.5">{booking.nodeId || '—'}</p>
                </td>
                <td className="px-4 py-3 text-charcoal-light font-mono text-xs">{booking.slotId || booking.energyAmount || '—'}</td>
                <td className="px-4 py-3 text-charcoal-light">
                  {booking.reservationDate || booking.date
                    ? new Date(booking.reservationDate || booking.date).toLocaleDateString('en-LK', { dateStyle: 'medium' })
                    : '—'}
                </td>
                <td className="px-4 py-3 text-charcoal-light">
                  <div className="flex items-center gap-1.5">
                    <Clock size={13} className="text-charcoal-light shrink-0" />
                    <span>
                      {booking.reservationDate || booking.date
                        ? new Date(booking.reservationDate || booking.date).toLocaleTimeString('en-LK', { timeStyle: 'short' })
                        : '—'}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={booking.status} />
                </td>
                <td className="px-4 py-3 text-charcoal-light text-xs">
                  {fmt(booking.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 justify-end">
                    {booking.status?.toLowerCase() === 'pending' && onApprove && (
                      <button
                        type="button"
                        onClick={() => onApprove(booking.id)}
                        disabled={approvingId === booking.id}
                        className="mr-2 inline-flex items-center rounded-lg bg-forest text-ivory px-3 py-1.5 text-xs font-medium transition hover:bg-forest/90 disabled:opacity-60"
                      >
                        {approvingId === booking.id ? 'Approving…' : 'Approve'}
                      </button>
                    )}
                    {canModify && onCancel && (
                      <button
                        onClick={() => onCancel(booking)}
                        title="Cancel"
                        className="p-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <XCircle size={14} />
                      </button>
                    )}
                    <Link 
                      to={`/operator/bookings/${booking.id}`} 
                      title="View Details"
                      className="p-1.5 rounded-lg border border-forest/20 text-forest hover:bg-forest/5 transition-colors"
                    >
                      <Eye size={14} />
                    </Link>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default BookingTable;
