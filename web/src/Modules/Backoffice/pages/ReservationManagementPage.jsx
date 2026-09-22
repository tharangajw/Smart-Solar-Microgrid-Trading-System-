import React, { useState, useEffect } from 'react';
import {
  CalendarDays, Plus, Search, Edit2, XCircle, Loader,
  RefreshCw, X, CheckCircle, AlertCircle, Clock, Filter
} from 'lucide-react';
import {
  getAllReservations, createReservation,
  updateReservation, cancelReservation
} from '../../../Services/backofficeApi';
import backofficeApi from '../../../Services/backofficeApi';

// ── Business rules ────────────────────────────────────────────────────────────
const MAX_DAYS_AHEAD = 7;
const MIN_NOTICE_HOURS = 12;

const hoursUntil = (dateStr) => {
  const diff = new Date(dateStr) - new Date();
  return diff / 1000 / 3600;
};

const withinWindow = (dateStr) => {
  const daysAhead = hoursUntil(dateStr) / 24;
  return daysAhead >= 0 && daysAhead <= MAX_DAYS_AHEAD;
};

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

const toDateInput = (d) => {
  if (!d) return '';
  const dt = new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
};
const toTimeInput = (d) => {
  if (!d) return '';
  const dt = new Date(d);
  return `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;
};

const combineDateTime = (date, time) => {
  if (!date || !time) return '';
  return new Date(`${date}T${time}`).toISOString();
};

const buildSlotOptions = (station) => {
  if (!station) return [];
  const count = station.totalSlots || station.availableSlots || 0;
  return Array.from({ length: count }, (_, i) =>
    `SLOT-${String(i + 1).padStart(3, '0')}`
  );
};

const EMPTY_CREATE = {
  prosumerNic: '', slotId: '', nodeId: '', reservationDate: '', reservationTime: ''
};

// ─────────────────────────────────────────────────────────────────────────────
const ReservationManagementPage = () => {
  const [reservations, setReservations]     = useState([]);
  const [stations, setStations]           = useState([]);
  const [loading, setLoading]               = useState(true);
  const [search, setSearch]                 = useState('');
  const [statusFilter, setStatusFilter]     = useState('');
  const [globalMsg, setGlobalMsg]           = useState({ type: '', text: '' });

  // modals
  const [showCreate, setShowCreate]         = useState(false);
  const [showEdit, setShowEdit]             = useState(null);   // reservation object
  const [showCancel, setShowCancel]         = useState(null);   // reservation object

  const [createForm, setCreateForm]         = useState(EMPTY_CREATE);
  const [editDate, setEditDate]             = useState('');
  const [editTime, setEditTime]             = useState('');
  const [cancelReason, setCancelReason]     = useState('');
  const [formError, setFormError]           = useState('');
  const [formLoading, setFormLoading]       = useState(false);

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

  const selectedCreateStation = stations.find((s) => s.id === createForm.nodeId);
  const createSlotOptions = buildSlotOptions(selectedCreateStation);

  // ── Create ────────────────────────────────────────────────────────────────
  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError('');
    const reservationDateTime = combineDateTime(createForm.reservationDate, createForm.reservationTime);
    if (!reservationDateTime) {
      setFormError('Please select both a reservation date and time.');
      return;
    }
    if (!withinWindow(reservationDateTime)) {
      setFormError(`Reservation must be scheduled within the next ${MAX_DAYS_AHEAD} days.`);
      return;
    }
    setFormLoading(true);
    try {
      await createReservation({
        prosumerNic:     createForm.prosumerNic,
        slotId:          createForm.slotId,
        nodeId:          createForm.nodeId,
        reservationDate: reservationDateTime
      });
      notify('success', 'Reservation created successfully.');
      setShowCreate(false);
      setCreateForm(EMPTY_CREATE);
      load();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create reservation.');
    } finally {
      setFormLoading(false);
    }
  };

  // ── Update ────────────────────────────────────────────────────────────────
  const handleUpdate = async (e) => {
    e.preventDefault();
    setFormError('');
    if (hoursUntil(showEdit.reservationDate) < MIN_NOTICE_HOURS) {
      setFormError(`Updates require at least ${MIN_NOTICE_HOURS} hours' notice before the reservation.`);
      return;
    }
    const reservationDateTime = combineDateTime(editDate, editTime);
    if (!reservationDateTime) {
      setFormError('Please select both a new date and time.');
      return;
    }
    if (!withinWindow(reservationDateTime)) {
      setFormError(`New date must be within the next ${MAX_DAYS_AHEAD} days.`);
      return;
    }
    setFormLoading(true);
    try {
      await updateReservation(showEdit.id, {
        reservationDate: reservationDateTime
      });
      notify('success', 'Reservation updated.');
      setShowEdit(null);
      load();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to update reservation.');
    } finally {
      setFormLoading(false);
    }
  };

  // ── Cancel ────────────────────────────────────────────────────────────────
  const handleCancel = async (e) => {
    e.preventDefault();
    setFormError('');
    if (hoursUntil(showCancel.reservationDate) < MIN_NOTICE_HOURS) {
      setFormError(`Cancellations require at least ${MIN_NOTICE_HOURS} hours' notice.`);
      return;
    }
    setFormLoading(true);
    try {
      await cancelReservation(showCancel.id, { cancelledReason: cancelReason });
      notify('success', 'Reservation cancelled.');
      setShowCancel(null);
      setCancelReason('');
      load();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to cancel reservation.');
    } finally {
      setFormLoading(false);
    }
  };

  // ── Filter (client-side search by NIC) ───────────────────────────────────
  const filtered = reservations.filter(r =>
    !search || r.prosumerNic?.toLowerCase().includes(search.toLowerCase())
  );

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
          <button onClick={() => { setCreateForm(EMPTY_CREATE); setFormError(''); setShowCreate(true); }}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm bg-forest text-ivory rounded-xl hover:bg-forest/90 transition-colors font-medium">
            <Plus size={15} /> New Reservation
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
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => {
                  const canModify = r.status !== 'Cancelled' && r.status !== 'Completed';
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
                        <div className="flex items-center gap-2 justify-end">
                          {canModify && (
                            <>
                              <button
                                onClick={() => {
                                  setShowEdit(r);
                                  setEditDate(toDateInput(r.reservationDate));
                                  setEditTime(toTimeInput(r.reservationDate));
                                  setFormError('');
                                }}
                                title="Reschedule"
                                className="p-1.5 rounded-lg border border-forest/20 text-forest hover:bg-forest/5 transition-colors"
                              >
                                <Edit2 size={13} />
                              </button>
                              <button
                                onClick={() => { setShowCancel(r); setCancelReason(''); setFormError(''); }}
                                title="Cancel"
                                className="p-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                              >
                                <XCircle size={13} />
                              </button>
                            </>
                          )}
                          {!canModify && (
                            <span className="text-xs text-charcoal-light italic">—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── Create Modal ── */}
      {showCreate && (
        <Modal title="New Reservation" onClose={() => setShowCreate(false)}>
          {formError && <FormError msg={formError} />}
          <form onSubmit={handleCreate} className="space-y-4">
            <Field label="Prosumer NIC *">
              <input required value={createForm.prosumerNic}
                onChange={e => setCreateForm({ ...createForm, prosumerNic: e.target.value })}
                placeholder="e.g. 199012345678"
                className={inputCls} />
            </Field>
            <Field label="Microgrid Node *">
              <select required value={createForm.nodeId}
                onChange={e => setCreateForm({ ...createForm, nodeId: e.target.value, slotId: '' })}
                className={inputCls}>
                <option value="">Select a station…</option>
                {stations.filter((s) => s.isActive).map((station) => (
                  <option key={station.id} value={station.id}>
                    {station.name} ({station.availableSlots ?? 0} slots free)
                  </option>
                ))}
              </select>
              <p className="text-xs text-charcoal-light mt-1">
                Node ID is the station&apos;s database ID from Microgrid Node Management — not the slot count.
              </p>
            </Field>
            <Field label="Energy Slot *">
              <select required value={createForm.slotId}
                disabled={!createForm.nodeId || createSlotOptions.length === 0}
                onChange={e => setCreateForm({ ...createForm, slotId: e.target.value })}
                className={inputCls}>
                <option value="">
                  {!createForm.nodeId
                    ? 'Select a node first'
                    : createSlotOptions.length === 0
                      ? 'No slots at this station'
                      : 'Select a slot…'}
                </option>
                {createSlotOptions.map((slotId) => (
                  <option key={slotId} value={slotId}>{slotId}</option>
                ))}
              </select>
              <p className="text-xs text-charcoal-light mt-1">
                Slots are numbered per station (e.g. SLOT-001). Pick one from the selected node.
              </p>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Reservation Date *">
                <input required type="date"
                  min={new Date().toISOString().slice(0, 10)}
                  max={new Date(Date.now() + MAX_DAYS_AHEAD * 86400000).toISOString().slice(0, 10)}
                  value={createForm.reservationDate}
                  onChange={e => setCreateForm({ ...createForm, reservationDate: e.target.value })}
                  className={inputCls} />
              </Field>
              <Field label="Reservation Time *">
                <input required type="time"
                  value={createForm.reservationTime}
                  onChange={e => setCreateForm({ ...createForm, reservationTime: e.target.value })}
                  className={inputCls} />
              </Field>
            </div>
            <ModalActions onCancel={() => setShowCreate(false)} loading={formLoading} label="Create Reservation" />
          </form>
        </Modal>
      )}

      {/* ── Edit Modal ── */}
      {showEdit && (
        <Modal title="Reschedule Reservation" onClose={() => setShowEdit(null)}>
          <div className="mb-4 text-sm text-charcoal-light bg-forest/5 rounded-xl px-4 py-3">
            <p><span className="font-medium text-charcoal">Current date:</span> {fmt(showEdit.reservationDate)}</p>
            <p className="mt-1 text-xs text-yellow-600 flex items-center gap-1.5">
              <AlertCircle size={13} />
              Requires ≥ {MIN_NOTICE_HOURS} hours before the reservation time.
            </p>
          </div>
          {formError && <FormError msg={formError} />}
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label={`New Date * (within next ${MAX_DAYS_AHEAD} days)`}>
                <input required type="date"
                  min={new Date().toISOString().slice(0, 10)}
                  max={new Date(Date.now() + MAX_DAYS_AHEAD * 86400000).toISOString().slice(0, 10)}
                  value={editDate}
                  onChange={e => setEditDate(e.target.value)}
                  className={inputCls} />
              </Field>
              <Field label="New Time *">
                <input required type="time"
                  value={editTime}
                  onChange={e => setEditTime(e.target.value)}
                  className={inputCls} />
              </Field>
            </div>
            <ModalActions onCancel={() => setShowEdit(null)} loading={formLoading} label="Save Changes" />
          </form>
        </Modal>
      )}

      {/* ── Cancel Modal ── */}
      {showCancel && (
        <Modal title="Cancel Reservation" onClose={() => setShowCancel(null)}>
          <div className="mb-4 text-sm text-charcoal-light bg-red-50 rounded-xl px-4 py-3">
            <p><span className="font-medium text-charcoal">Reservation:</span> {fmt(showCancel.reservationDate)}</p>
            <p className="mt-1 text-xs text-red-600 flex items-center gap-1.5">
              <AlertCircle size={13} />
              Requires ≥ {MIN_NOTICE_HOURS} hours before the reservation time.
            </p>
          </div>
          {formError && <FormError msg={formError} />}
          <form onSubmit={handleCancel} className="space-y-4">
            <Field label="Cancellation Reason (optional)">
              <textarea
                rows={3}
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                placeholder="Reason for cancellation…"
                className={`${inputCls} resize-none`}
              />
            </Field>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowCancel(null)}
                className="flex-1 px-4 py-2.5 border border-forest/20 rounded-xl text-forest hover:bg-forest/5 text-sm font-medium">
                Back
              </button>
              <button type="submit" disabled={formLoading}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:opacity-60 text-sm font-medium flex items-center justify-center gap-2">
                {formLoading && <Loader size={15} className="animate-spin" />}
                Confirm Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

// ── Shared small components ───────────────────────────────────────────────────
const inputCls = 'w-full px-4 py-2.5 border border-forest/20 rounded-xl text-sm focus:ring-2 focus:ring-forest outline-none';

const Field = ({ label, children }) => (
  <div>
    <label className="block text-sm font-medium text-charcoal mb-1">{label}</label>
    {children}
  </div>
);

const FormError = ({ msg }) => (
  <div className="mb-4 bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
    <XCircle size={16} /> {msg}
  </div>
);

const ModalActions = ({ onCancel, loading, label }) => (
  <div className="flex gap-3 pt-2">
    <button type="button" onClick={onCancel}
      className="flex-1 px-4 py-2.5 border border-forest/20 rounded-xl text-forest hover:bg-forest/5 text-sm font-medium">
      Cancel
    </button>
    <button type="submit" disabled={loading}
      className="flex-1 px-4 py-2.5 bg-forest text-ivory rounded-xl hover:bg-forest/90 disabled:opacity-60 text-sm font-medium flex items-center justify-center gap-2">
      {loading && <Loader size={15} className="animate-spin" />}
      {label}
    </button>
  </div>
);

const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-display text-xl font-semibold text-forest">{title}</h2>
        <button onClick={onClose} className="text-charcoal-light hover:text-charcoal"><X size={20} /></button>
      </div>
      {children}
    </div>
  </div>
);

export default ReservationManagementPage;
