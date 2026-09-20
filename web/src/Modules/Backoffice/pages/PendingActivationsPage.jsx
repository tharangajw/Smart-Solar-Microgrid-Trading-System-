import React, { useEffect, useState } from 'react';
import { activateUser, getPendingActivations } from '../../../Services/backofficeApi';
import { CheckCircle, Loader, RefreshCw, UserPlus } from 'lucide-react';

const PendingActivationsPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadPending = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getPendingActivations();
      setUsers(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load pending activations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPending();
  }, []);

  const handleActivate = async (id) => {
    setActingId(id);
    setMessage('');
    setError('');
    try {
      const res = await activateUser(id);
      setMessage(res.data?.message || 'User activated successfully');
      setUsers((current) => current.filter((user) => user.id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Activation failed.');
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-forest">Pending Activations</h1>
          <p className="text-sm text-charcoal-light mt-1">
            Prosumers who registered on mobile stay inactive until a Backoffice officer activates them.
          </p>
        </div>
        <button
          onClick={loadPending}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-forest/20 rounded-xl text-forest hover:bg-forest hover:text-ivory transition-colors"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {message && (
        <div className="bg-leaf/20 text-forest px-4 py-3 rounded-xl text-sm font-medium">{message}</div>
      )}
      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">{error}</div>
      )}

      <section className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-forest/5">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-sage gap-2">
            <Loader size={18} className="animate-spin" />
            Loading pending accounts...
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16">
            <UserPlus className="mx-auto text-sage mb-3" size={32} />
            <p className="text-charcoal font-medium">No pending activations</p>
            <p className="text-sm text-charcoal-light mt-1">New mobile registrations will appear here.</p>
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
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-forest/5 hover:bg-forest/[0.03]">
                    <td className="px-4 py-3 font-medium text-charcoal">{user.nic}</td>
                    <td className="px-4 py-3">{user.fullName}</td>
                    <td className="px-4 py-3 text-charcoal-light">{user.email}</td>
                    <td className="px-4 py-3 text-charcoal-light">{user.phoneNumber || '—'}</td>
                    <td className="px-4 py-3">
                      <span className="bg-solar/20 text-yellow-700 px-2 py-1 rounded-md text-xs font-medium">
                        {user.status === 'Deactivated' ? 'Deactivated' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleActivate(user.id)}
                        disabled={actingId === user.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-forest text-ivory text-xs font-semibold rounded-lg hover:bg-forest-light disabled:opacity-60"
                      >
                        {actingId === user.id ? (
                          <Loader size={14} className="animate-spin" />
                        ) : (
                          <CheckCircle size={14} />
                        )}
                        Activate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default PendingActivationsPage;
