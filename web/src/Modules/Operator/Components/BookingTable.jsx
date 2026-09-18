import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { Eye } from 'lucide-react';

const BookingTable = ({ bookings, loading }) => {
  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center space-y-4">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium animate-pulse">Loading latest bookings...</p>
      </div>
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Eye size={24} className="text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-800">No bookings yet</h3>
        <p className="text-slate-500 mt-1">When new bookings arrive, they'll show up here.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden bg-white rounded-2xl shadow-sm border border-slate-100">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50/80 backdrop-blur-sm">
            <tr>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">
                Booking ID
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">
                Date & Time
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">
                Node
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">
                Energy
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">
                Status
              </th>
              <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-widest">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-50">
            {bookings.map((booking) => (
              <tr key={booking.id} className="hover:bg-teal-50/50 transition-colors group cursor-default">
                <td className="px-6 py-5 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                    #{booking.id}
                  </span>
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-sm text-slate-500 font-medium">
                  {new Date(booking.date).toLocaleString(undefined, {
                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-sm text-slate-700 font-medium">
                  {booking.nodeName}
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-sm text-slate-900 font-bold">
                  {booking.energyAmount} <span className="text-slate-400 font-medium">kWh</span>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <StatusBadge status={booking.status} />
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                  <Link 
                    to={`/operator/bookings/${booking.id}`} 
                    className="inline-flex items-center justify-center space-x-2 bg-white text-teal-600 border border-teal-100 hover:border-teal-200 hover:bg-teal-50 px-3 py-1.5 rounded-lg transition-all shadow-sm group-hover:shadow"
                  >
                    <Eye size={16} />
                    <span>View</span>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookingTable;
