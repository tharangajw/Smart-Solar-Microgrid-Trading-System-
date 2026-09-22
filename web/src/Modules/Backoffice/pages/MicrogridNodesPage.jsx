import { useState, useEffect } from 'react';
import {
  Zap, MapPin, Clock, Plus, Search, Edit2, Power, PowerOff,
  Loader, RefreshCw, X, CheckCircle, AlertCircle, XCircle, Battery
} from 'lucide-react';
import backofficeApi from '../../../Services/backofficeApi';

// ── Schedule options ──────────────────────────────────────────────────────────
const START_TIMES = ['05:00','06:00','06:30','07:00','07:30','08:00'];
const END_TIMES   = ['16:00','17:00','17:30','18:00','18:30','19:00','20:00'];

const EMPTY_FORM = {
  name: '', latitude: '', longitude: '', capacityKw: '',
  availableSlots: '', startTime: '06:00', endTime: '18:00', isActive: true
};

// ── API helpers (Stations = Microgrid Nodes) ──────────────────────────────────
const fetchNodes  = ()       => backofficeApi.get('/stations');
const createNode  = (d)      => backofficeApi.post('/stations', d);
const updateNode  = (id, d)  => backofficeApi.put(`/stations/${id}`, d);
const toggleNode  = (id, isActive) => backofficeApi.patch(`/stations/${id}/toggle`, { isActive });

const StatusDot = ({ active }) => (
  <span className={`w-2.5 h-2.5 rounded-full inline-block ${active ? 'bg-emerald-500' : 'bg-red-400'}`} />
);

const MicrogridNodesPage = () => {
  const [nodes, setNodes]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [actionId, setActionId]       = useState(null);
  const [globalMsg, setGlobalMsg]     = useState({ type: '', text: '' });

  const [showModal, setShowModal]     = useState(false);
  const [editTarget, setEditTarget]   = useState(null);
  const [form, setForm]               = useState(EMPTY_FORM);
  const [formError, setFormError]     = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const notify = (type, text) => {
    setGlobalMsg({ type, text });
    setTimeout(() => setGlobalMsg({ type: '', text: '' }), 4000);
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchNodes();
      setNodes(res.data || []);
    } catch (err) {
      // API not yet implemented — show empty state gracefully
      notify('error', err.response?.data?.message || 'Could not reach the stations API. The server may be unavailable.');
      setNodes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (node) => {
    const [st, et] = (node.schedule || '06:00 – 18:00').split(/\s*[–-]\s*/);
    setEditTarget(node);
    setForm({
      name:           node.name            || '',
      latitude:       node.latitude        ?? '',
      longitude:      node.longitude       ?? '',
      capacityKw:     node.capacityKw      ?? node.capacity ?? '',
      availableSlots: node.availableSlots  ?? node.batterySlots ?? '',
      startTime:      (st || '06:00').trim(),
      endTime:        (et || '18:00').trim(),
      isActive:       node.isActive        ?? true
    });
    setFormError('');
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditTarget(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);
    const payload = {
      name:           form.name,
      latitude:       parseFloat(form.latitude),
      longitude:      parseFloat(form.longitude),
      capacityKw:     parseFloat(form.capacityKw),
      availableSlots: parseInt(form.availableSlots),
      schedule:       `${form.startTime} – ${form.endTime}`,
      isActive:       form.isActive
    };
    try {
      if (editTarget) {
        await updateNode(editTarget.id, payload);
        notify('success', `"${form.name}" updated.`);
      } else {
        await createNode(payload);
        notify('success', `"${form.name}" created.`);
      }
      closeModal();
      load();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save. Check the fields or API connection.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggle = async (node) => {
    setActionId(node.id);
    try {
      await toggleNode(node.id, !node.isActive);
      notify('success', `"${node.name}" ${node.isActive ? 'deactivated' : 'activated'}.`);
      load();
    } catch (err) {
      notify('error', err.response?.data?.message || 'Action failed. Active reservations may be blocking deactivation.');
    } finally {
      setActionId(null);
    }
  };

  const filtered = nodes.filter(n =>
    n.name?.toLowerCase().includes(search.toLowerCase()) ||
    n.schedule?.toLowerCase().includes(search.toLowerCase())
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-forest">Microgrid Node Management</h1>
          <p className="text-sm text-charcoal-light mt-1">
            Manage solar grid hubs — GPS location, capacity (kW) and battery storage slots.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={load}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm border border-forest/20 rounded-xl text-forest hover:bg-forest hover:text-ivory transition-colors">
            <RefreshCw size={15} /> Refresh
          </button>
          <button onClick={openCreate}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm bg-forest text-ivory rounded-xl hover:bg-forest/90 transition-colors font-medium">
            <Plus size={15} /> Add Node
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Nodes', value: nodes.length,                                color: 'text-forest',       bg: 'bg-leaf/10',   icon: <Zap size={20} /> },
          { label: 'Active',      value: nodes.filter(n => n.isActive).length,        color: 'text-emerald-600',  bg: 'bg-emerald-50', icon: <Power size={20} /> },
          { label: 'Inactive',    value: nodes.filter(n => !n.isActive).length,       color: 'text-red-500',      bg: 'bg-red-50',     icon: <Battery size={20} /> },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4 flex items-center gap-3`}>
            <span className={s.color}>{s.icon}</span>
            <div>
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-charcoal-light">{s.label}</p>
            </div>
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

      {/* Search */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-forest/5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-light w-4 h-4" />
          <input type="text" placeholder="Search nodes by name or schedule…"
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-forest/20 rounded-xl text-sm focus:ring-2 focus:ring-forest outline-none"
          />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-24 gap-2 text-sage text-sm">
          <Loader size={18} className="animate-spin" /> Loading nodes…
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-forest/5 text-center py-24">
          <Zap className="mx-auto text-sage mb-3" size={32} />
          <p className="text-charcoal font-medium">No nodes found</p>
          <p className="text-sm text-charcoal-light mt-1">
            {search ? 'Try a different search.' : 'Click "Add Node" to create your first microgrid hub.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(node => (
            <div key={node.id} className="bg-white rounded-2xl p-5 shadow-sm border border-forest/5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${node.isActive ? 'bg-leaf/20' : 'bg-red-50'}`}>
                    <Zap className={`w-5 h-5 ${node.isActive ? 'text-leaf' : 'text-red-400'}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-charcoal text-sm">{node.name}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <StatusDot active={node.isActive} />
                      <span className="text-xs text-charcoal-light">{node.isActive ? 'Active' : 'Inactive'}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-2 text-sm mb-4">
                {node.latitude != null && (
                  <div className="flex items-center gap-2 text-charcoal-light">
                    <MapPin size={13} className="shrink-0" />
                    <span className="font-mono text-xs">{Number(node.latitude).toFixed(5)}, {Number(node.longitude).toFixed(5)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-charcoal-light">Capacity</span>
                  <span className="font-medium text-charcoal">{node.capacityKw ?? node.capacity ?? '—'} kW</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-charcoal-light">Available Slots</span>
                  <span className="font-medium text-charcoal">{node.availableSlots ?? '—'}</span>
                </div>
                {node.schedule && (
                  <div className="flex items-center gap-2 text-charcoal-light">
                    <Clock size={13} className="shrink-0" />
                    <span>{node.schedule}</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2 pt-4 border-t border-forest/10">
                <button onClick={() => openEdit(node)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs border border-forest/20 rounded-lg text-forest hover:bg-forest/5 transition-colors">
                  <Edit2 size={13} /> Edit
                </button>
                <button onClick={() => handleToggle(node)} disabled={actionId === node.id}
                  title={node.isActive ? 'Deactivate (blocked if active reservations exist)' : 'Activate'}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs border rounded-lg transition-colors ${
                    node.isActive ? 'border-red-200 text-red-500 hover:bg-red-50' : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                  }`}>
                  {actionId === node.id ? <Loader size={13} className="animate-spin" />
                    : node.isActive ? <PowerOff size={13} /> : <Power size={13} />}
                  {node.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl font-semibold text-forest">
                {editTarget ? 'Edit Node' : 'Add Microgrid Node'}
              </h2>
              <button onClick={closeModal} className="text-charcoal-light hover:text-charcoal"><X size={20} /></button>
            </div>

            {formError && (
              <div className="mb-4 bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                <XCircle size={16} /> {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">
                  Node Name <span className="text-red-500">*</span>
                </label>
                <input required value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. North Campus Solar Hub"
                  className="w-full px-4 py-2.5 border border-forest/20 rounded-xl text-sm focus:ring-2 focus:ring-forest outline-none"
                />
              </div>

              {/* GPS */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">
                    Latitude <span className="text-red-500">*</span>
                  </label>
                  <input required type="number" step="0.000001" value={form.latitude}
                    onChange={e => setForm({ ...form, latitude: e.target.value })}
                    placeholder="e.g. 6.9271"
                    className="w-full px-4 py-2.5 border border-forest/20 rounded-xl text-sm focus:ring-2 focus:ring-forest outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">
                    Longitude <span className="text-red-500">*</span>
                  </label>
                  <input required type="number" step="0.000001" value={form.longitude}
                    onChange={e => setForm({ ...form, longitude: e.target.value })}
                    placeholder="e.g. 79.8612"
                    className="w-full px-4 py-2.5 border border-forest/20 rounded-xl text-sm focus:ring-2 focus:ring-forest outline-none"
                  />
                </div>
              </div>

              {/* Capacity + Slots */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">
                    Capacity (kW) <span className="text-red-500">*</span>
                  </label>
                  <input required type="number" min="0" step="0.1" value={form.capacityKw}
                    onChange={e => setForm({ ...form, capacityKw: e.target.value })}
                    placeholder="e.g. 50"
                    className="w-full px-4 py-2.5 border border-forest/20 rounded-xl text-sm focus:ring-2 focus:ring-forest outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">
                    Battery Slots <span className="text-red-500">*</span>
                  </label>
                  <input required type="number" min="0" value={form.availableSlots}
                    onChange={e => setForm({ ...form, availableSlots: e.target.value })}
                    placeholder="e.g. 10"
                    className="w-full px-4 py-2.5 border border-forest/20 rounded-xl text-sm focus:ring-2 focus:ring-forest outline-none"
                  />
                </div>
              </div>

              {/* Schedule — dropdowns */}
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  Operational Schedule
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-charcoal-light mb-1">Start Time</label>
                    <select value={form.startTime}
                      onChange={e => setForm({ ...form, startTime: e.target.value })}
                      className="w-full px-4 py-2.5 border border-forest/20 rounded-xl text-sm focus:ring-2 focus:ring-forest outline-none">
                      {START_TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-charcoal-light mb-1">End Time</label>
                    <select value={form.endTime}
                      onChange={e => setForm({ ...form, endTime: e.target.value })}
                      className="w-full px-4 py-2.5 border border-forest/20 rounded-xl text-sm focus:ring-2 focus:ring-forest outline-none">
                      {END_TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <p className="text-xs text-charcoal-light mt-1.5">
                  Schedule: <span className="font-medium text-charcoal">{form.startTime} – {form.endTime}</span>
                </p>
              </div>

              {/* Status toggle on edit */}
              {editTarget && (
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-charcoal">Status</label>
                  <button type="button"
                    onClick={() => setForm({ ...form, isActive: !form.isActive })}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      form.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
                    }`}>
                    {form.isActive ? 'Active' : 'Inactive'}
                  </button>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal}
                  className="flex-1 px-4 py-2.5 border border-forest/20 rounded-xl text-forest hover:bg-forest/5 transition-colors text-sm font-medium">
                  Cancel
                </button>
                <button type="submit" disabled={formLoading}
                  className="flex-1 px-4 py-2.5 bg-forest text-ivory rounded-xl hover:bg-forest/90 disabled:opacity-60 transition-colors text-sm font-medium flex items-center justify-center gap-2">
                  {formLoading && <Loader size={15} className="animate-spin" />}
                  {editTarget ? 'Save Changes' : 'Create Node'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MicrogridNodesPage;
