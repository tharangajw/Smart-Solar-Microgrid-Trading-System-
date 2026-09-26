import { useState, useEffect } from 'react';
import {
  Users, ShieldCheck, X, Search, Power, PowerOff, Plus,
  Edit2, Loader, CheckCircle, AlertCircle, XCircle
} from 'lucide-react';
import {
  getAllUsers, activateUser, deactivateUser,
  createGridOperator, updateUser
} from '../../../Services/backofficeApi';

const EMPTY_FORM = { email: '', password: '', fullName: '', nic: '', phoneNumber: '', address: '' };

const GridOperatorsPage = () => {
  const [operators, setOperators]         = useState([]);
  const [loading, setLoading]             = useState(true);
  const [searchTerm, setSearchTerm]       = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [globalMsg, setGlobalMsg]         = useState({ type: '', text: '' });

  // ── Create modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm]           = useState(EMPTY_FORM);
  const [createError, setCreateError]         = useState('');
  const [createLoading, setCreateLoading]     = useState(false);

  // ── Edit modal
  const [editTarget, setEditTarget]   = useState(null);
  const [editForm, setEditForm]       = useState(EMPTY_FORM);
  const [editError, setEditError]     = useState('');
  const [editLoading, setEditLoading] = useState(false);

  const notify = (type, text) => {
    setGlobalMsg({ type, text });
    setTimeout(() => setGlobalMsg({ type: '', text: '' }), 4000);
  };

  const loadOperators = async () => {
    setLoading(true);
    try {
      const response = await getAllUsers();
      const gridOperators = (response.data || []).filter(
        user => user.role === 'GridOperator' || user.Role === 'GridOperator'
      );
      setOperators(gridOperators);
    } catch (err) {
      notify('error', 'Failed to load operators.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadOperators(); }, []);

  const handleActivate = async (id) => {
    setActionLoading(id);
    try {
      await activateUser(id);
      await loadOperators();
      notify('success', 'Operator activated.');
    } catch {
      notify('error', 'Failed to activate operator.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeactivate = async (id) => {
    setActionLoading(id);
    try {
      await deactivateUser(id);
      await loadOperators();
      notify('success', 'Operator deactivated.');
    } catch {
      notify('error', 'Failed to deactivate operator.');
    } finally {
      setActionLoading(null);
    }
  };

  const openEdit = (op) => {
    setEditTarget(op);
    setEditForm({
      fullName:    op.fullName    || '',
      email:       op.email       || '',
      phoneNumber: op.phoneNumber || '',
      address:     op.address     || '',
      nic:         op.nic         || '',
      password:    ''
    });
    setEditError('');
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError('');
    try {
      const payload = {
        fullName:    editForm.fullName,
        email:       editForm.email,
        phoneNumber: editForm.phoneNumber,
        address:     editForm.address
      };
      if (editForm.password) payload.password = editForm.password;
      await updateUser(editTarget.id, payload);
      notify('success', `${editForm.fullName} updated.`);
      setEditTarget(null);
      loadOperators();
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update operator.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError('');
    try {
      await createGridOperator(createForm);
      setShowCreateModal(false);
      setCreateForm(EMPTY_FORM);
      await loadOperators();
      notify('success', 'Grid Operator created successfully.');
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Failed to create Grid Operator.');
    } finally {
      setCreateLoading(false);
    }
  };

  const filteredOperators = operators.filter(op =>
    op.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    op.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    op.nic?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const inputCls = 'w-full px-4 py-3 border border-forest/20 rounded-xl focus:ring-2 focus:ring-forest focus:border-transparent outline-none transition text-sm';

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto overflow-x-hidden">
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-forest">Grid Operators</h1>
            <p className="text-sm text-charcoal-light mt-1">Manage and monitor grid operator accounts</p>
          </div>
          <button
            onClick={() => { setShowCreateModal(true); setCreateError(''); setCreateForm(EMPTY_FORM); }}
            className="px-4 py-2 bg-forest text-ivory rounded-xl hover:bg-forest/90 transition-colors font-medium text-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Create Grid Operator
          </button>
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
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-light w-5 h-5" />
            <input
              type="text"
              placeholder="Search operators by name, email, or NIC..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-forest/20 rounded-xl focus:ring-2 focus:ring-forest focus:border-transparent outline-none transition"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-forest/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-charcoal-light uppercase bg-forest/5 border-b border-forest/10">
                <tr>
                  <th className="px-6 py-4 font-medium">Operator</th>
                  <th className="px-6 py-4 font-medium">NIC</th>
                  <th className="px-6 py-4 font-medium">Email</th>
                  <th className="px-6 py-4 font-medium">Phone</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Created</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center gap-2 text-charcoal-light">
                        <Loader size={16} className="animate-spin" /> Loading operators...
                      </div>
                    </td>
                  </tr>
                ) : filteredOperators.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-charcoal-light">
                      {searchTerm ? 'No operators found.' : 'No grid operators found. Create one above.'}
                    </td>
                  </tr>
                ) : (
                  filteredOperators.map(op => (
                    <tr key={op.id} className="border-b border-forest/5 hover:bg-forest/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-forest/10 flex items-center justify-center">
                            <ShieldCheck className="w-5 h-5 text-forest" />
                          </div>
                          <div>
                            <p className="font-medium text-charcoal">{op.fullName}</p>
                            <p className="text-xs text-charcoal-light">Grid Operator</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-charcoal-light font-mono text-xs">{op.nic}</td>
                      <td className="px-6 py-4 text-charcoal-light">{op.email}</td>
                      <td className="px-6 py-4 text-charcoal-light">{op.phoneNumber || '—'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          op.status === 'Active' || op.isActive
                            ? 'bg-leaf/20 text-forest'
                            : 'bg-red-100 text-red-600'
                        }`}>
                          {op.status || (op.isActive ? 'Active' : 'Inactive')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-charcoal-light">
                        {op.createdAt ? new Date(op.createdAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center gap-2 justify-end">
                          {/* Edit button */}
                          <button
                            onClick={() => openEdit(op)}
                            title="Edit operator"
                            className="p-1.5 rounded-lg border border-forest/20 text-forest hover:bg-forest/5 transition-colors"
                          >
                            <Edit2 size={14} />
                          </button>

                          {/* Activate / Deactivate button */}
                          {(op.status === 'Active' || op.isActive) ? (
                            <button
                              onClick={() => handleDeactivate(op.id)}
                              disabled={actionLoading === op.id}
                              title="Deactivate operator"
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-medium transition-colors disabled:opacity-50"
                            >
                              {actionLoading === op.id
                                ? <Loader size={13} className="animate-spin" />
                                : <PowerOff size={13} />}
                              
                            </button>
                          ) : (
                            <button
                              onClick={() => handleActivate(op.id)}
                              disabled={actionLoading === op.id}
                              title="Activate operator"
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-200 text-emerald-600 hover:bg-emerald-50 text-xs font-medium transition-colors disabled:opacity-50"
                            >
                              {actionLoading === op.id
                                ? <Loader size={13} className="animate-spin" />
                                : <Power size={13} />}
                              
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: <Users className="w-8 h-8 text-forest" />,   value: operators.length,                            label: 'Total Operators'    },
            { icon: <Power className="w-8 h-8 text-leaf" />,     value: operators.filter(op => op.isActive || op.status === 'Active').length, label: 'Active Operators'   },
            { icon: <PowerOff className="w-8 h-8 text-red-500" />, value: operators.filter(op => !op.isActive && op.status !== 'Active').length, label: 'Inactive Operators' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-6 shadow-sm border border-forest/5">
              <div className="flex items-center gap-3">
                {s.icon}
                <div>
                  <p className="text-2xl font-bold text-charcoal">{s.value}</p>
                  <p className="text-sm text-charcoal-light">{s.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* ── Create Modal ── */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-semibold text-forest">Create Grid Operator</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-charcoal-light hover:text-charcoal">
                <X size={22} />
              </button>
            </div>
            {createError && (
              <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm flex items-center gap-2">
                <XCircle size={15} /> {createError}
              </div>
            )}
            <form onSubmit={handleCreate} className="space-y-4">
              {[
                { label: 'Full Name', key: 'fullName', type: 'text' },
                { label: 'NIC',       key: 'nic',      type: 'text' },
                { label: 'Email',     key: 'email',    type: 'email' },
                { label: 'Password',  key: 'password', type: 'password', min: 6 },
                { label: 'Phone',     key: 'phoneNumber', type: 'text' },
                { label: 'Address',   key: 'address',  type: 'text' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-sm font-medium text-charcoal mb-1">{f.label} *</label>
                  <input required type={f.type} minLength={f.min}
                    value={createForm[f.key]}
                    onChange={e => setCreateForm({ ...createForm, [f.key]: e.target.value })}
                    className={inputCls}
                  />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-3 border border-forest/20 rounded-xl text-forest hover:bg-forest/5 transition-colors font-medium text-sm">
                  Cancel
                </button>
                <button type="submit" disabled={createLoading}
                  className="flex-1 px-4 py-3 bg-forest text-ivory rounded-xl hover:bg-forest/90 transition-colors font-medium disabled:opacity-50 text-sm flex items-center justify-center gap-2">
                  {createLoading && <Loader size={15} className="animate-spin" />}
                  Create Operator
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit Modal ── */}
      {editTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-semibold text-forest">Edit Operator</h2>
              <button onClick={() => setEditTarget(null)} className="text-charcoal-light hover:text-charcoal">
                <X size={22} />
              </button>
            </div>
            {/* NIC read-only */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-charcoal mb-1">NIC (read-only)</label>
              <input readOnly value={editForm.nic}
                className="w-full px-4 py-3 border border-forest/10 rounded-xl text-sm bg-forest/5 text-charcoal-light" />
            </div>
            {editError && (
              <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm flex items-center gap-2">
                <XCircle size={15} /> {editError}
              </div>
            )}
            <form onSubmit={handleEdit} className="space-y-4">
              {[
                { label: 'Full Name', key: 'fullName',    type: 'text',     required: true },
                { label: 'Email',     key: 'email',       type: 'email',    required: true },
                { label: 'Phone',     key: 'phoneNumber', type: 'text',     required: false },
                { label: 'Address',   key: 'address',     type: 'text',     required: false },
                { label: 'New Password (leave blank to keep)', key: 'password', type: 'password', required: false, min: 6 },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-sm font-medium text-charcoal mb-1">{f.label}</label>
                  <input type={f.type} required={f.required} minLength={f.min}
                    value={editForm[f.key]}
                    onChange={e => setEditForm({ ...editForm, [f.key]: e.target.value })}
                    className={inputCls}
                  />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditTarget(null)}
                  className="flex-1 px-4 py-3 border border-forest/20 rounded-xl text-forest hover:bg-forest/5 transition-colors font-medium text-sm">
                  Cancel
                </button>
                <button type="submit" disabled={editLoading}
                  className="flex-1 px-4 py-3 bg-forest text-ivory rounded-xl hover:bg-forest/90 transition-colors font-medium disabled:opacity-50 text-sm flex items-center justify-center gap-2">
                  {editLoading && <Loader size={15} className="animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GridOperatorsPage;
