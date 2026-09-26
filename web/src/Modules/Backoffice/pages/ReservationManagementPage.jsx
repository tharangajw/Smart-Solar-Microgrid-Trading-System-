import React, { useState, useEffect } from 'react';
import {
  CalendarDays, Search, Loader,
  RefreshCw, CheckCircle, AlertCircle, Clock, Filter
} from 'lucide-react';
import { getAllReservations, approveReservation } from '../../../Services/backofficeApi';
import backofficeApi from '../../../Services/backofficeApi';

// ── Helpers ───────────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    Pending:   'bg-yellow-100 text-yellow-700',
    Approved:  'bg-emerald-100 text-emerald-700',
    Completed: 'bg-blue-100 text-blue-700',
    Cancelled: 'bg-red-100 text-red-600',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[status] ?? 'bg-slate-100 text-slate-500'}`}>
      {status}
    </span>
  );
};

const fmt = (d) => d ? new Date(d).toLocaleString('en-LK', {
  dateStyle: 'medium', timeStyle: 'short'
}) : '—';


// ─────────────────────────────────────────────────────────────────────────────
const ReservationManagementPage = () => {
  const [reservations, setReservations]     = useState([]);
  const [stations, setStations]           = useState([]);
  const [loading, setLoading]               = useState(true);
  const [search, setSearch]                 = useState('');
  const [statusFilter, setStatusFilter]     = useState('');
  const [globalMsg, setGlobalMsg]           = useState({ type: '', text: '' });
  const [approvingId, setApprovingId]       = useState(null);

  const notify = (type, text) => {
    setGlobalMsg({ type, text });
    setTimeout(() => setGlobalMsg({ type: '', text: '' }), 4500);
  };

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (search)       params.nic    = search;
      const res = await getAllReservations(params);
      setReservations(res.data || []);
    } catch {
      notify('error', 'Failed to load reservations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [statusFilter]);

  useEffect(() => {
    backofficeApi.get('/stations')
      .then((res) => setStations(res.data || []))
      .catch(() => setStations([]));
  }, []);

  const getStationName = (nodeId) =>
    stations.find((s) => s.id === nodeId)?.name || nodeId || '—';

  // ── Filter (client-side search by NIC) ───────────────────────────────────
  const filtered = reservations.filter(r =>
    !search || r.prosumerNic?.toLowerCase().includes(search.toLowerCase())
  );

  const handleApprove = async (reservation) => {
    setApprovingId(reservation.id);
    try {
      const response = await approveReservation(reservation.id);
      setReservations(current => current.map(item => item.id === reservation.id
        ? { ...item, status: 'Approved', qrCodeId: response.data?.qrCodeId }
        : item
      ));
      notify('success', 'Reservation approved successfully.');
    } catch (err) {
      notify('error', err.response?.data?.message || 'Failed to approve reservation.');
    } finally {
      setApprovingId(null);
    }
  };

  const stats = {
    total:     reservations.length,
    pending:   reservations.filter(r => r.status === 'Pending').length,
    approved:  reservations.filter(r => r.status === 'Approved').length,
    cancelled: reservations.filter(r => r.status === 'Cancelled').length,
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-forest">Energy Slot Reservations</h1>
          <p className="text-sm text-charcoal-light mt-1">
            Manage power trading reservations.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={load}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm border border-forest/20 rounded-xl text-forest hover:bg-forest hover:text-ivory transition-colors">
            <RefreshCw size={15} /> Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total',     value: stats.total,     color: 'text-forest',        bg: 'bg-leaf/10'    },
          { label: 'Pending',   value: stats.pending,   color: 'text-yellow-600',    bg: 'bg-yellow-50'  },
          { label: 'Approved',  value: stats.approved,  color: 'text-emerald-600',   bg: 'bg-emerald-50' },
          { label: 'Cancelled', value: stats.cancelled, color: 'text-red-500',       bg: 'bg-red-50'     },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-charcoal-light mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Global feedback */}
      {globalMsg.text && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${
          globalMsg.type === 'success' ? 'bg-leaf/20 text-forest' : 'bg-red-50 text-red-700'
        }`}>
          {globalMsg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {globalMsg.text}
        </div>
      )}

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-light w-4 h-4" />
          <input
            type="text"
            placeholder="Search by Prosumer NIC…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && load()}
            className="w-full pl-10 pr-4 py-2.5 border border-forest/20 rounded-xl text-sm focus:ring-2 focus:ring-forest outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={15} className="text-charcoal-light shrink-0" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border border-forest/20 rounded-xl text-sm focus:ring-2 focus:ring-forest outline-none"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <section className="bg-white rounded-2xl shadow-sm border border-forest/5 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-2 text-sage text-sm">
            <Loader size={18} className="animate-spin" /> Loading reservations…
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <CalendarDays className="mx-auto text-sage mb-3" size={32} />
            <p className="text-charcoal font-medium">No reservations found</p>
          </div>
        ) : (
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
                  <th className="px-4 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => {
                  return (
                    <tr key={r.id} className="border-b border-forest/5 hover:bg-forest/[0.03]">
                      <td className="px-4 py-3 font-mono text-xs">{r.prosumerNic}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-charcoal text-xs">{getStationName(r.nodeId)}</p>
                        <p className="text-charcoal-light font-mono text-[10px] mt-0.5">{r.nodeId || '—'}</p>
                      </td>
                      <td className="px-4 py-3 text-charcoal-light font-mono text-xs">{r.slotId || '—'}</td>
                      <td className="px-4 py-3 text-charcoal-light">
                        {r.reservationDate
                          ? new Date(r.reservationDate).toLocaleDateString('en-LK', { dateStyle: 'medium' })
                          : '—'}
                      </td>
                      <td className="px-4 py-3 text-charcoal-light">
                        <div className="flex items-center gap-1.5">
                          <Clock size={13} className="text-charcoal-light shrink-0" />
                          <span>
                            {r.reservationDate
                              ? new Date(r.reservationDate).toLocaleTimeString('en-LK', { timeStyle: 'short' })
                              : '—'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                      <td className="px-4 py-3 text-charcoal-light text-xs">{fmt(r.createdAt)}</td>
                      <td className="px-4 py-3">
                        {r.status === 'Pending' && (
                          <button
                            onClick={() => handleApprove(r)}
                            disabled={approvingId === r.id}
                            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                          >
                            {approvingId === r.id ? 'Approving...' : 'Approve'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default ReservationManagementPage;
