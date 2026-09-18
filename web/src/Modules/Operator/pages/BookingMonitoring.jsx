import React, { useState, useEffect } from 'react';
import BookingTable from '../Components/BookingTable';
import { Search, Filter } from 'lucide-react';

const BookingMonitoring = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    // Mock fetching data
    setTimeout(() => {
      setBookings([
        { id: '1001', date: '2026-09-17T10:00:00Z', nodeName: 'Node A - Colombo', energyAmount: 50, status: 'approved' },
        { id: '1002', date: '2026-09-17T11:30:00Z', nodeName: 'Node B - Kandy', energyAmount: 120, status: 'pending' },
        { id: '1003', date: '2026-09-16T14:15:00Z', nodeName: 'Node A - Colombo', energyAmount: 75, status: 'completed' },
        { id: '1004', date: '2026-09-18T09:00:00Z', nodeName: 'Node C - Galle', energyAmount: 200, status: 'pending' },
        { id: '1005', date: '2026-09-15T16:45:00Z', nodeName: 'Node B - Kandy', energyAmount: 30, status: 'cancelled' },
      ]);
      setLoading(false);
    }, 800);
  }, []);

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.id.includes(searchTerm) || booking.nodeName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-2 sm:p-6 rounded-3xl">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 animate-fade-in-down">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-700 tracking-tight">
            Booking Monitoring
          </h1>
          <p className="text-sm sm:text-base font-medium text-slate-500 mt-2">
            Monitor and track energy transfer bookings in real-time
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white/70 backdrop-blur-xl p-5 rounded-2xl shadow-sm border border-slate-200/60 flex flex-col md:flex-row gap-5 items-center relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-32 h-32 bg-teal-100/30 rounded-full blur-3xl -z-10 group-hover:scale-125 transition-transform duration-700"></div>
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-teal-500" />
          </div>
          <input
            type="text"
            className="block w-full pl-12 pr-4 py-3 border border-slate-200/80 rounded-xl leading-5 bg-white/50 backdrop-blur-sm placeholder-slate-400 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all duration-300 shadow-inner"
            placeholder="Search by Booking ID or Node..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Filter className="h-5 w-5 text-blue-500" />
          </div>
          <select
            className="block w-full pl-12 pr-4 py-3 border border-slate-200/80 rounded-xl font-medium text-slate-700 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 shadow-inner appearance-none cursor-pointer"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/40 border border-white p-2 sm:p-6 relative z-10">
        <BookingTable bookings={filteredBookings} loading={loading} />
      </div>
    </div>
  );
};

export default BookingMonitoring;
