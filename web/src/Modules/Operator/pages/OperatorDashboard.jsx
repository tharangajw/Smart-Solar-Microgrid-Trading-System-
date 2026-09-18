import React, { useState, useEffect } from 'react';
import { getOperatorDashboard } from '../../../Services/operatorApi';
import StatCard from '../Components/StatCard';
import BookingTable from '../Components/BookingTable';
import { Calendar, CheckCircle, Clock, BatteryCharging, Zap } from 'lucide-react';

const OperatorDashboard = () => {
  const [data, setData] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    approvedBookings: 0,
    availableSlots: 0,
    activeNodes: 0,
    recentBookings: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, we'd fetch this from the API
    // getOperatorDashboard().then(res => setData(res.data));
    
    // Mock data for now
    setTimeout(() => {
      setData({
        totalBookings: 125,
        pendingBookings: 12,
        approvedBookings: 45,
        availableSlots: 8,
        activeNodes: 5,
        recentBookings: [
          { id: '1001', date: '2026-09-17T10:00:00Z', nodeName: 'Node A - Colombo', energyAmount: 50, status: 'approved' },
          { id: '1002', date: '2026-09-17T11:30:00Z', nodeName: 'Node B - Kandy', energyAmount: 120, status: 'pending' },
          { id: '1003', date: '2026-09-16T14:15:00Z', nodeName: 'Node A - Colombo', energyAmount: 75, status: 'completed' },
        ]
      });
      setLoading(false);
    }, 800);
  }, []);

  return (
    <div className="space-y-8 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-2 sm:p-6 rounded-3xl">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 animate-fade-in-down">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-700 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-sm sm:text-base font-medium text-slate-500 mt-2">
            Welcome back, <span className="text-teal-600 font-semibold">Grid Operator</span>
          </p>
        </div>
        <div className="bg-white/60 backdrop-blur-md px-4 py-2 rounded-xl shadow-sm border border-slate-200/60 flex items-center gap-3 transform hover:scale-105 transition-transform duration-300">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </div>
          <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">System Online</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        <StatCard 
          title="Total Bookings" 
          value={loading ? '...' : data.totalBookings} 
          icon={<Calendar size={28} />} 
        />
        <StatCard 
          title="Pending Bookings" 
          value={loading ? '...' : data.pendingBookings} 
          icon={<Clock size={28} />} 
          textColor="text-amber-500"
        />
        <StatCard 
          title="Approved Bookings" 
          value={loading ? '...' : data.approvedBookings} 
          icon={<CheckCircle size={28} />} 
          textColor="text-blue-500"
        />
        <StatCard 
          title="Available Slots" 
          value={loading ? '...' : data.availableSlots} 
          icon={<BatteryCharging size={28} />} 
          textColor="text-emerald-500"
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/40 border border-white p-6 sm:p-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-teal-100/40 to-blue-100/40 rounded-full blur-3xl -z-10 group-hover:scale-110 transition-transform duration-700"></div>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
            <div className="p-2 bg-teal-50 rounded-lg text-teal-600">
              <Zap size={24} />
            </div>
            Recent Bookings
          </h2>
          <button className="text-sm font-semibold text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 px-4 py-2 rounded-lg transition-colors">
            View All
          </button>
        </div>
        <BookingTable bookings={data.recentBookings} loading={loading} />
      </div>
    </div>
  );
};

export default OperatorDashboard;
