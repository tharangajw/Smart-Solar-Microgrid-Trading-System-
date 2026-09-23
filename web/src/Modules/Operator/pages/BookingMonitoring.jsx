import React, { useState, useEffect } from 'react';
import BookingTable from '../Components/BookingTable';
import { Search, Filter } from 'lucide-react';
import { approveReservation, getAllReservations } from '../../../Services/operatorApi';

const BookingMonitoring = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [approvingId, setApprovingId] = useState(null);

  useEffect(() => {
    getAllReservations()
      .then((response) => setBookings(response.data))
      .catch((err) => setError(err.response?.data?.message || 'Unable to load reservations.'))
      .finally(() => setLoading(false));
  }, []);

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.id?.includes(searchTerm) || booking.nodeId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || booking.status?.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleApprove = async (id) => {
    setApprovingId(id); setError(''); setMessage('');
    try {
      const response = await approveReservation(id);
      setBookings((current) => current.map((booking) => booking.id === id ? { ...booking, status: 'Approved' } : booking));
      setMessage(`Reservation approved. QR code ID: ${response.data.qrCodeId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to approve reservation.');
    } finally { setApprovingId(null); }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-forest">Booking Monitoring</h1>
        <p className="text-sm text-charcoal-light mt-1">Monitor and approve energy transfer bookings in real-time.</p>
      </div>
      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {message && <div className="rounded-xl border border-leaf/30 bg-leaf/10 px-4 py-3 text-sm text-forest">{message}</div>}

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-forest/5 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-sage" />
          </div>
          <input
            type="text"
            className="block w-full pl-12 pr-4 py-2.5 border border-forest/10 rounded-xl text-sm font-medium text-charcoal placeholder-charcoal-light bg-ivory focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest/30 transition-all"
            placeholder="Search by Booking ID or Node..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative w-full md:w-52">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Filter className="h-5 w-5 text-sage" />
          </div>
          <select
            className="block w-full pl-12 pr-4 py-2.5 border border-forest/10 rounded-xl text-sm font-medium text-charcoal bg-ivory focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest/30 transition-all appearance-none cursor-pointer"
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
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-forest/5">
        <BookingTable bookings={filteredBookings} loading={loading} onApprove={handleApprove} approvingId={approvingId} />
      </div>
    </div>
  );
};

export default BookingMonitoring;
