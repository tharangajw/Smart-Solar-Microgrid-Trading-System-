import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StatusBadge from '../Components/StatusBadge';
import { ArrowLeft, User, MapPin, Calendar, Zap, CreditCard } from 'lucide-react';

const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock fetching booking details by ID
    setTimeout(() => {
      setBooking({
        id: id,
        transactionId: `TXN-8739-${id}`,
        prosumerName: 'Saman Perera',
        prosumerNIC: '19851234567V',
        nodeName: 'Node A - Colombo',
        nodeLocation: 'Colombo 03',
        date: '2026-09-17T10:00:00Z',
        energyAmount: 50,
        status: 'approved',
        paymentStatus: 'paid',
        qrStatus: 'generated'
      });
      setLoading(false);
    }, 600);
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading details...</div>;
  }

  if (!booking) {
    return <div className="p-8 text-center text-red-500">Booking not found.</div>;
  }

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
          <p className="text-sm text-gray-500">Transaction ID: {booking.transactionId}</p>
        </div>
        <div className="ml-auto flex gap-2">
          <StatusBadge status={booking.status} />
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
              <span className="font-medium text-gray-900">{booking.prosumerName}</span>
            </div>
            <div>
              <span className="block text-sm text-gray-500">NIC</span>
              <span className="font-medium text-gray-900">{booking.prosumerNIC}</span>
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
              <span className="font-medium text-gray-900">{booking.nodeName}</span>
            </div>
            <div>
              <span className="block text-sm text-gray-500">Location</span>
              <span className="font-medium text-gray-900">{booking.nodeLocation}</span>
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
                {new Date(booking.date).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="block text-sm text-gray-500 flex items-center gap-1 mb-1">
                <Zap size={14} /> Energy Amount
              </span>
              <span className="font-medium text-gray-900">{booking.energyAmount} kWh</span>
            </div>
            <div>
              <span className="block text-sm text-gray-500 flex items-center gap-1 mb-1">
                <CreditCard size={14} /> Payment Status
              </span>
              <span className="font-medium text-gray-900 capitalize">{booking.paymentStatus}</span>
            </div>
            <div>
              <span className="block text-sm text-gray-500 mb-1">QR Status</span>
              <span className="font-medium text-gray-900 capitalize">{booking.qrStatus}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;
