import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StatusBadge from '../Components/StatusBadge';
import { ArrowLeft, User, MapPin, Calendar, Zap, CreditCard } from 'lucide-react';
import { approveReservation, getReservationById } from '../../../Services/operatorApi';

const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qrCodeId, setQrCodeId] = useState('');
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    getReservationById(id)
      .then((response) => setBooking(response.data))
      .catch((err) => setError(err.response?.data?.message || 'Unable to load this reservation.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading details...</div>;
  }

  if (!booking) {
    return <div className="p-8 text-center text-red-500">{error || 'Booking not found.'}</div>;
  }

  const handleApprove = async () => {
    setApproving(true); setError('');
    try {
      const response = await approveReservation(booking.id);
      setBooking({ ...booking, status: 'Approved' });
      setQrCodeId(response.data.qrCodeId);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to approve reservation.');
    } finally { setApproving(false); }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center space-x-4">
        <button 
          onClick={() => navigate('/operator/bookings')}
          className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Booking #{booking.id}</h1>
          <p className="text-sm text-gray-500">Node: {booking.nodeId}</p>
        </div>
        <div className="ml-auto flex gap-2">
          <StatusBadge status={booking.status} />
          {booking.status?.toLowerCase() === 'pending' && <button onClick={handleApprove} disabled={approving} className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{approving ? 'Approving…' : 'Approve'}</button>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Prosumer Details */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <User size={20} className="text-teal-600" />
            Prosumer Details
          </h2>
          <div className="space-y-3">
            <div>
              <span className="block text-sm text-gray-500">Name</span>
              <span className="font-medium text-gray-900">Prosumer</span>
            </div>
            <div>
              <span className="block text-sm text-gray-500">NIC</span>
              <span className="font-medium text-gray-900">{booking.prosumerNic}</span>
            </div>
          </div>
        </div>

        {/* Node Details */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <MapPin size={20} className="text-teal-600" />
            Station / Node
          </h2>
          <div className="space-y-3">
            <div>
              <span className="block text-sm text-gray-500">Node Name</span>
              <span className="font-medium text-gray-900">{booking.nodeId}</span>
            </div>
            <div>
              <span className="block text-sm text-gray-500">Location</span>
              <span className="font-medium text-gray-900">Slot: {booking.slotId}</span>
            </div>
          </div>
        </div>

        {/* Reservation Details */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 md:col-span-2">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Zap size={20} className="text-teal-600" />
            Reservation Data
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <span className="block text-sm text-gray-500 flex items-center gap-1 mb-1">
                <Calendar size={14} /> Date & Time
              </span>
              <span className="font-medium text-gray-900">
                {new Date(booking.reservationDate).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="block text-sm text-gray-500 flex items-center gap-1 mb-1">
                <Zap size={14} /> Energy Amount
              </span>
              <span className="font-medium text-gray-900">Slot {booking.slotId}</span>
            </div>
            <div>
              <span className="block text-sm text-gray-500 flex items-center gap-1 mb-1">
                <CreditCard size={14} /> Payment Status
              </span>
              <span className="font-medium text-gray-900 capitalize">Not tracked</span>
            </div>
            <div>
              <span className="block text-sm text-gray-500 mb-1">QR Status</span>
              <span className="font-medium text-gray-900">{qrCodeId || (booking.status?.toLowerCase() === 'approved' ? 'Generated' : 'Pending approval')}</span>
            </div>
          </div>
        </div>
      </div>
      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}
      {qrCodeId && <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-green-700">QR code ID: <code>{qrCodeId}</code></div>}
    </div>
  );
};

export default BookingDetails;
