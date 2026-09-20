/**
 * OperatorDashboard.jsx
 * Main dashboard for Grid Operators.
 * Uses the same SummaryCard / design tokens as the User Dashboard.
 * Fetches live data from the Web API via operatorApi service.
 * Author: Member 4 – Operator Product
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllReservations, getOperatorDashboard } from '../../../Services/operatorApi';
import SummaryCard from '../../Dashboard/components/SummaryCard';
import {
  Calendar,
  CheckCircle,
  Clock,
  BatteryCharging,
  Zap,
  ArrowRight,
} from 'lucide-react';

/* ── Status badge helper ─────────────────────────────────────────────────── */
const StatusBadge = ({ status }) => {
  const map = {
    Approved:  'bg-leaf/20 text-forest-light',
    Pending:   'bg-solar/20 text-yellow-700',
    Cancelled: 'bg-red-100 text-red-600',
    Completed: 'bg-gray-100 text-charcoal-light',
  };
  return (
    <span className={`px-2 py-1 rounded-md text-xs font-medium ${map[status] || 'bg-gray-100 text-charcoal-light'}`}>
      {status}
    </span>
  );
};

/* ── Recent bookings table ───────────────────────────────────────────────── */
const RecentBookingsTable = ({ bookings, loading }) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-10 bg-forest/5 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!bookings.length) {
    return (
      <p className="text-sm text-charcoal-light text-center py-8">No recent bookings found.</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-charcoal-light uppercase bg-forest/5 border-b border-forest/10">
          <tr>
            <th className="px-4 py-3 rounded-tl-lg font-medium">Prosumer</th>
            <th className="px-4 py-3 font-medium">Station</th>
            <th className="px-4 py-3 font-medium">Time Slot</th>
            <th className="px-4 py-3 rounded-tr-lg font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b, i) => (
            <tr key={b.id || i} className="border-b border-forest/5 hover:bg-forest/[0.03] transition-colors">
              <td className="px-4 py-3 font-medium text-charcoal">{b.prosumerName || b.userId || '—'}</td>
              <td className="px-4 py-3 text-charcoal-light">{b.stationName || b.nodeId || '—'}</td>
              <td className="px-4 py-3 text-charcoal-light">
                {b.startTime ? new Date(b.startTime).toLocaleString() : '—'}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={b.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/* ── Dashboard Page ──────────────────────────────────────────────────────── */
const OperatorDashboard = () => {
  const [data, setData] = useState({
    totalReservations: 0,
    pendingCount: 0,
    approvedCount: 0,
    activeStations: 0,
    recentBookings: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load dashboard summary and recent bookings from the Web API
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [dashRes, reservRes] = await Promise.all([
          getOperatorDashboard(),
          getAllReservations(),
        ]);
        setData({
          ...dashRes.data,
          recentBookings: (reservRes.data || []).slice(0, 5),
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  const operator = JSON.parse(localStorage.getItem('operator_user') || '{}');

  return (
    <div className="space-y-6 sm:space-y-8">

      {/* Page heading */}
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-forest">
          Good {getGreeting()}, {(operator.fullName || 'Operator').split(' ')[0]} 👋
        </h1>
        <p className="text-sm text-charcoal-light mt-1">
          Here's what's happening on the SmartSolar grid today.
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Summary Cards — same component as User Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <SummaryCard
          title="Total Bookings"
          value={loading ? '…' : data.totalReservations}
          subtitle="all time"
          icon={Calendar}
          trend="up"
          trendValue="live"
        />
        <SummaryCard
          title="Pending Approval"
          value={loading ? '…' : data.pendingCount}
          subtitle="awaiting action"
          icon={Clock}
          trend="down"
          trendValue={data.pendingCount > 0 ? `${data.pendingCount} pending` : '0'}
        />
        <SummaryCard
          title="Approved Bookings"
          value={loading ? '…' : data.approvedCount}
          subtitle="confirmed"
          icon={CheckCircle}
          trend="up"
          trendValue="confirmed"
        />
        <SummaryCard
          title="Active Stations"
          value={loading ? '…' : data.activeStations}
          subtitle="online right now"
          icon={BatteryCharging}
          trend="up"
          trendValue="live"
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

        {/* Recent Bookings — left 2 columns */}
        <div className="lg:col-span-2">
          <section className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-forest/5">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-lg font-semibold text-forest flex items-center gap-2">
                <Zap size={18} className="text-sage" />
                Recent Bookings
              </h2>
              <Link
                to="/operator/bookings"
                className="flex items-center gap-1 text-sm font-medium text-sage hover:text-forest transition-colors"
              >
                View All <ArrowRight size={14} />
              </Link>
            </div>
            <RecentBookingsTable bookings={data.recentBookings} loading={loading} />
          </section>
        </div>

        {/* Right column */}
        <div className="space-y-6">

          {/* Quick actions */}
          <section className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-forest/5">
            <h2 className="font-display text-lg font-semibold text-forest mb-4">Quick Actions</h2>
            <div className="space-y-2">
              {[
                { label: 'View All Bookings',     to: '/operator/bookings' },
                { label: 'Manage Slot Availability', to: '/operator/slots' },
                { label: 'View Stations Map',     to: '/operator/map' },
              ].map((action) => (
                <Link
                  key={action.to}
                  to={action.to}
                  className="flex items-center justify-between w-full p-3 rounded-xl text-sm font-medium text-charcoal hover:bg-forest/5 hover:text-forest border border-transparent hover:border-forest/10 transition-all"
                >
                  {action.label}
                  <ArrowRight size={16} className="text-charcoal-light" />
                </Link>
              ))}
            </div>
          </section>

          {/* System status */}
          <section className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-forest/5">
            <h2 className="font-display text-lg font-semibold text-forest mb-4">System Status</h2>
            <div className="space-y-3">
              {[
                { label: 'Web API',       status: 'Online' },
                { label: 'MongoDB',       status: 'Online' },
                { label: 'Grid Network',  status: 'Optimal' },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between">
                  <span className="text-sm text-charcoal-light">{s.label}</span>
                  <span className="flex items-center gap-1.5 text-xs font-medium text-forest">
                    <span className="w-2 h-2 rounded-full bg-leaf inline-block" />
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

/* helper */
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

export default OperatorDashboard;
