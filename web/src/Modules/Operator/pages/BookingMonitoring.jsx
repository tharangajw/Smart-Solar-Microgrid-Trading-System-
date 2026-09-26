import React, { useState, useEffect } from 'react';
import BookingTable from '../Components/BookingTable';
import { Search, Filter, XCircle, AlertCircle, Loader, X, RotateCcw } from 'lucide-react';
import { approveReservation, getAllReservations, cancelReservation, getAllStations } from '../../../Services/operatorApi';

const BookingMonitoring = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [filters, setFilters] = useState({
    nic: '',
    status: '',
    from: '',
    to: ''
  });

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [approvingId, setApprovingId] = useState(null);

  // Cancel state
  const [showCancel, setShowCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState('');

  const loadData = async (overrideFilters) => {
    setLoading(true);
    try {
      const activeFilters = overrideFilters || filters;
      const params = {};
      if (activeFilters.nic) params.nic = activeFilters.nic;
      if (activeFilters.status) params.status = activeFilters.status;
      if (activeFilters.from) params.from = activeFilters.from;
      if (activeFilters.to) params.to = activeFilters.to;

      const [reservRes, statRes] = await Promise.all([
        getAllReservations(params),
        getAllStations()
      ]);
      const stations = statRes.data || [];
      const getStationName = (id) => stations.find(s => s.id === id)?.name;

      setBookings((reservRes.data || []).map(b => ({
        ...b,
        nodeName: getStationName(b.nodeId)
      })));
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load reservations.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    const empty = { nic: '', status: '', from: '', to: '' };
    setFilters(empty);
    loadData(empty);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filtering is now strictly handled by the Backend API

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

  const handleCancel = async (e) => {
    e.preventDefault();
    setCancelError('');
    setCancelLoading(true);
    try {
      await cancelReservation(showCancel.id, { cancelledReason: cancelReason });
      setMessage('Reservation cancelled successfully.');
      setShowCancel(null);
      setCancelReason('');
      loadData();
    } catch (err) {
      setCancelError(err.response?.data?.message || 'Failed to cancel reservation.');
    } finally {
      setCancelLoading(false);
    }
  };

  const fmt = (d) => d ? new Date(d).toLocaleString('en-LK', {
    dateStyle: 'medium', timeStyle: 'short'
  }) : '—';

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-forest">Booking Monitoring</h1>
        <p className="text-sm text-charcoal-light mt-1">Monitor and approve energy transfer bookings in real-time.</p>
      </div>
      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {message && <div className="rounded-xl border border-leaf/30 bg-leaf/10 px-4 py-3 text-sm text-forest">{message}</div>}

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-forest/5 flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="block text-xs font-medium text-charcoal-light mb-1">Prosumer NIC</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-sage" />
            </div>
            <input
              type="text"
              className="block w-full pl-9 pr-3 py-2 border border-forest/10 rounded-xl text-sm font-medium text-charcoal placeholder-charcoal-light bg-ivory focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest/30 transition-all"
              placeholder="e.g. 1990..."
              value={filters.nic}
              onChange={(e) => setFilters({ ...filters, nic: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && loadData()}
            />
          </div>
        </div>
        <div className="w-full md:w-40">
          <label className="block text-xs font-medium text-charcoal-light mb-1">Status</label>
          <select
            className="block w-full px-3 py-2 border border-forest/10 rounded-xl text-sm font-medium text-charcoal bg-ivory focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest/30 transition-all cursor-pointer"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
        <div className="w-full md:w-40">
          <label className="block text-xs font-medium text-charcoal-light mb-1">Date From</label>
          <input
            type="date"
            className="block w-full px-3 py-2 border border-forest/10 rounded-xl text-sm font-medium text-charcoal bg-ivory focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest/30 transition-all"
            value={filters.from}
            onChange={(e) => setFilters({ ...filters, from: e.target.value })}
          />
        </div>
        <div className="w-full md:w-40">
          <label className="block text-xs font-medium text-charcoal-light mb-1">Date To</label>
          <input
            type="date"
            className="block w-full px-3 py-2 border border-forest/10 rounded-xl text-sm font-medium text-charcoal bg-ivory focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest/30 transition-all"
            value={filters.to}
            onChange={(e) => setFilters({ ...filters, to: e.target.value })}
          />
        </div>
        <div className="w-full md:w-auto flex gap-2">
          <button 
            onClick={() => loadData()}
            className="w-full md:w-auto px-6 py-2 bg-forest text-ivory rounded-xl text-sm font-medium hover:bg-forest/90 transition-colors h-[38px]"
          >
            Search
          </button>
          <button 
            onClick={handleClear}
            className="w-full md:w-auto px-4 py-2 border border-forest/20 text-charcoal hover:bg-forest/5 rounded-xl text-sm font-medium transition-colors h-[38px] inline-flex items-center justify-center gap-1.5"
            title="Clear all filters"
          >
            <RotateCcw className="h-4 w-4 text-charcoal-light" />
            Clear
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-forest/5">
        <BookingTable bookings={bookings} loading={loading} onApprove={handleApprove} approvingId={approvingId} onCancel={(r) => { setShowCancel(r); setCancelError(''); setCancelReason(''); }} />
      </div>

      {/* ── Cancel Modal ── */}
      {showCancel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl font-semibold text-forest">Cancel Reservation</h2>
              <button onClick={() => setShowCancel(null)} className="text-charcoal-light hover:text-charcoal"><X size={20} /></button>
            </div>
            
            <div className="mb-4 text-sm text-charcoal-light bg-red-50 rounded-xl px-4 py-3">
              <p><span className="font-medium text-charcoal">Reservation:</span> {fmt(showCancel.reservationDate || showCancel.date)}</p>
            </div>
            
            {cancelError && (
              <div className="mb-4 bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                <XCircle size={16} /> {cancelError}
              </div>
            )}
            
            <form onSubmit={handleCancel} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">Cancellation Reason (optional)</label>
                <textarea
                  rows={3}
                  value={cancelReason}
                  onChange={e => setCancelReason(e.target.value)}
                  placeholder="Reason for cancellation…"
                  className="w-full px-4 py-2.5 border border-forest/20 rounded-xl text-sm focus:ring-2 focus:ring-forest outline-none resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCancel(null)}
                  className="flex-1 px-4 py-2.5 border border-forest/20 rounded-xl text-forest hover:bg-forest/5 text-sm font-medium">
                  Back
                </button>
                <button type="submit" disabled={cancelLoading}
                  className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:opacity-60 text-sm font-medium flex items-center justify-center gap-2">
                  {cancelLoading && <Loader size={15} className="animate-spin" />}
                  Confirm Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingMonitoring;
