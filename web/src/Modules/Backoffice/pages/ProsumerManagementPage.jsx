import React, { useState, useEffect } from 'react';
import {
  Users, Plus, Search, Edit2, Power, PowerOff,
  Loader, RefreshCw, X, CheckCircle, XCircle, AlertCircle
} from 'lucide-react';
import {
  getAllUsers, activateUser, deactivateUser,
  createUser, updateUser
} from '../../../Services/backofficeApi';

const EMPTY_FORM = {
  nic: '', fullName: '', email: '', password: '',
  phoneNumber: '', address: '', solarCapacityKw: ''
};

const StatusBadge = ({ status }) => {
  const map = {
    Active:      'bg-emerald-100 text-emerald-700',
    Pending:     'bg-yellow-100 text-yellow-700',
    Deactivated: 'bg-red-100 text-red-600',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[status] ?? 'bg-slate-100 text-slate-500'}`}>
      {status}
    </span>
  );
};

const ProsumerManagementPage = () => {
  const [prosumers, setProsumers]       = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [actionId, setActionId]         = useState(null);
  const [globalMsg, setGlobalMsg]       = useState({ type: '', text: '' });

  // ── Create / Edit modal ────────────────────────────────────────────────
  const [showModal, setShowModal]       = useState(false);
  const [editTarget, setEditTarget]     = useState(null); // null = create
  const [form, setForm]                 = useState(EMPTY_FORM);
  const [formError, setFormError]       = useState('');
  const [formLoading, setFormLoading]   = useState(false);

  // ── Helpers ────────────────────────────────────────────────────────────
  const notify = (type, text) => {
    setGlobalMsg({ type, text });
    setTimeout(() => setGlobalMsg({ type: '', text: '' }), 4000);
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await getAllUsers();
      const all = res.data || [];
      setProsumers(all.filter(u => u.role === 'Prosumer'));
    } catch {
      notify('error', 'Failed to load prosumers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // ── Activate / Deactivate ──────────────────────────────────────────────
  const handleToggle = async (user) => {
    setActionId(user.id);
    try {
      if (user.status === 'Active') {
        await deactivateUser(user.id);
        notify('success', `${user.fullName} deactivated.`);
      } else {
        await activateUser(user.id);
        notify('success', `${user.fullName} activated.`);
      }
      await load();
    } catch (err) {
      notify('error', err.response?.data?.message || 'Action failed.');
    } finally {
      setActionId(null);
    }
  };

  // ── Open modals ────────────────────────────────────────────────────────
  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (user) => {
    setEditTarget(user);
    setForm({
      nic:             user.nic         || '',
      fullName:        user.fullName    || '',
      email:           user.email       || '',
      password:        '',
      phoneNumber:     user.phoneNumber || '',
      address:         user.address     || '',
      solarCapacityKw: user.solarCapacityKw ?? ''
    });
    setFormError('');
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditTarget(null); };

  // ── Submit form ────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);
    try {
      if (editTarget) {
        // Update — password is optional on edit
        const payload = {
          fullName:        form.fullName,
          email:           form.email,
          phoneNumber:     form.phoneNumber,
          address:         form.address,
          solarCapacityKw: form.solarCapacityKw !== '' ? parseFloat(form.solarCapacityKw) : null
        };
        if (form.password) payload.password = form.password;
        await updateUser(editTarget.id, payload);
        notify('success', `${form.fullName} updated.`);
      } else {
        // Create new prosumer
        await createUser({
          ...form,
          role: 'Prosumer',
          solarCapacityKw: form.solarCapacityKw !== '' ? parseFloat(form.solarCapacityKw) : null
        });
        notify('success', `Prosumer ${form.fullName} created.`);
      }
      closeModal();
      load();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save. Please check the fields.');
    } finally {
      setFormLoading(false);
    }
  };

  // ── Filter ─────────────────────────────────────────────────────────────
  const filtered = prosumers.filter(p =>
    p.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    p.nic?.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase())
  );

  const active      = prosumers.filter(p => p.status === 'Active').length;
  const deactivated = prosumers.filter(p => p.status === 'Deactivated').length;
  const pending     = prosumers.filter(p => p.status === 'Pending').length;

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-forest">Prosumer Management</h1>
          <p className="text-sm text-charcoal-light mt-1">
            Manage and monitor prosumer accounts.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={load}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm border border-forest/20 rounded-xl text-forest hover:bg-forest hover:text-ivory transition-colors"
          >
            <RefreshCw size={15} />
            Refresh
          </button>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm bg-forest text-ivory rounded-xl hover:bg-forest/90 transition-colors font-medium"
          >
            <Plus size={15} />
            Add Prosumer
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Active',      count: active,      color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Pending',     count: pending,     color: 'text-yellow-600',  bg: 'bg-yellow-50'  },
          { label: 'Deactivated', count: deactivated, color: 'text-red-500',     bg: 'bg-red-50'     },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4 flex items-center gap-3`}>
            <Users className={`${s.color} w-6 h-6 shrink-0`} />
            <div>
              <p className={`text-xl font-bold ${s.color}`}>{s.count}</p>
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
          <input
            type="text"
            placeholder="Search by name, NIC or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-forest/20 rounded-xl text-sm focus:ring-2 focus:ring-forest focus:border-transparent outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <section className="bg-white rounded-2xl shadow-sm border border-forest/5 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-2 text-sage text-sm">
            <Loader size={18} className="animate-spin" /> Loading prosumers…
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Users className="mx-auto text-sage mb-3" size={32} />
            <p className="text-charcoal font-medium">No prosumers found</p>
            <p className="text-sm text-charcoal-light mt-1">
              {search ? 'Try a different search.' : 'Add a prosumer to get started.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-charcoal-light uppercase bg-forest/5 border-b border-forest/10">
                <tr>
                  <th className="px-4 py-3 font-medium">NIC</th>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 font-medium">Solar kW</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(user => (
                  <tr key={user.id} className="border-b border-forest/5 hover:bg-forest/[0.03]">
                    <td className="px-4 py-3 font-mono text-xs text-charcoal">{user.nic}</td>
                    <td className="px-4 py-3 font-medium text-charcoal">{user.fullName}</td>
                    <td className="px-4 py-3 text-charcoal-light">{user.email}</td>
                    <td className="px-4 py-3 text-charcoal-light">{user.phoneNumber || '—'}</td>
                    <td className="px-4 py-3 text-charcoal-light">
                      {user.solarCapacityKw != null ? `${user.solarCapacityKw} kW` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={user.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        {/* Edit */}
                        <button
                          onClick={() => openEdit(user)}
                          title="Edit"
                          className="p-1.5 rounded-lg border border-forest/20 text-forest hover:bg-forest/5 transition-colors"
                        >
                          <Edit2 size={14} />
                        </button>

                        {/* Activate / Deactivate */}
                        <button
                          onClick={() => handleToggle(user)}
                          disabled={actionId === user.id}
                          title={user.status === 'Active' ? 'Deactivate' : 'Activate'}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            user.status === 'Active'
                              ? 'border-red-200 text-red-500 hover:bg-red-50'
                              : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          {actionId === user.id
                            ? <Loader size={14} className="animate-spin" />
                            : user.status === 'Active'
                              ? <PowerOff size={14} />
                              : <Power size={14} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── Create / Edit Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl font-semibold text-forest">
                {editTarget ? 'Edit Prosumer' : 'Add Prosumer'}
              </h2>
              <button onClick={closeModal} className="text-charcoal-light hover:text-charcoal">
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div className="mb-4 bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                <XCircle size={16} /> {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* NIC — only on create */}
              {!editTarget && (
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">
                    NIC <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    value={form.nic}
                    onChange={e => setForm({ ...form, nic: e.target.value })}
                    placeholder="e.g. 199012345678"
                    className="w-full px-4 py-2.5 border border-forest/20 rounded-xl text-sm focus:ring-2 focus:ring-forest outline-none"
                  />
                </div>
              )}

              {editTarget && (
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">NIC (read-only)</label>
                  <input
                    readOnly
                    value={form.nic}
                    className="w-full px-4 py-2.5 border border-forest/10 rounded-xl text-sm bg-forest/5 text-charcoal-light"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    value={form.fullName}
                    onChange={e => setForm({ ...form, fullName: e.target.value })}
                    className="w-full px-4 py-2.5 border border-forest/20 rounded-xl text-sm focus:ring-2 focus:ring-forest outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-2.5 border border-forest/20 rounded-xl text-sm focus:ring-2 focus:ring-forest outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">
                    Password {!editTarget && <span className="text-red-500">*</span>}
                    {editTarget && <span className="text-charcoal-light text-xs ml-1">(leave blank to keep)</span>}
                  </label>
                  <input
                    required={!editTarget}
                    type="password"
                    minLength={6}
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    className="w-full px-4 py-2.5 border border-forest/20 rounded-xl text-sm focus:ring-2 focus:ring-forest outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">Phone</label>
                  <input
                    value={form.phoneNumber}
                    onChange={e => setForm({ ...form, phoneNumber: e.target.value })}
                    className="w-full px-4 py-2.5 border border-forest/20 rounded-xl text-sm focus:ring-2 focus:ring-forest outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">Address</label>
                <input
                  value={form.address}
                  onChange={e => setForm({ ...form, address: e.target.value })}
                  className="w-full px-4 py-2.5 border border-forest/20 rounded-xl text-sm focus:ring-2 focus:ring-forest outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">Solar Capacity (kW)</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={form.solarCapacityKw}
                  onChange={e => setForm({ ...form, solarCapacityKw: e.target.value })}
                  placeholder="e.g. 5.5"
                  className="w-full px-4 py-2.5 border border-forest/20 rounded-xl text-sm focus:ring-2 focus:ring-forest outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2.5 border border-forest/20 rounded-xl text-forest hover:bg-forest/5 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 px-4 py-2.5 bg-forest text-ivory rounded-xl hover:bg-forest/90 disabled:opacity-60 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  {formLoading && <Loader size={15} className="animate-spin" />}
                  {editTarget ? 'Save Changes' : 'Create Prosumer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProsumerManagementPage;
