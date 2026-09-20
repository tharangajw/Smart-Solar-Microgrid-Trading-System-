import React, { useEffect, useState } from 'react';
import { activateUser, deactivateUser, getAllUsers } from '../../../Services/backofficeApi';
import { Loader, RefreshCw } from 'lucide-react';

const ProsumerManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAllUsers();
      const prosumers = (res.data || []).filter((user) => user.role === 'Prosumer');
      setUsers(prosumers);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load prosumers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleToggle = async (user) => {
    setActingId(user.id);
    setMessage('');
    setError('');
    try {
      const res = user.isActive ? await deactivateUser(user.id) : await activateUser(user.id);
      setMessage(res.data?.message || 'Account updated');
      await loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed.');
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-forest">Prosumer Accounts</h1>
          <p className="text-sm text-charcoal-light mt-1">
            Only Backoffice officers can activate or reactivate deactivated prosumer accounts.
          </p>
        </div>
        <button
          onClick={loadUsers}
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
            Loading prosumers...
          </div>
        ) : users.length === 0 ? (
          <p className="text-sm text-charcoal-light text-center py-12">No prosumer accounts yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-charcoal-light uppercase bg-forest/5 border-b border-forest/10">
                <tr>
                  <th className="px-4 py-3 font-medium">NIC</th>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
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
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-md text-xs font-medium ${
                          user.isActive
                            ? 'bg-leaf/20 text-forest'
                            : 'bg-solar/20 text-yellow-700'
                        }`}
                      >
                        {user.isActive ? 'Active' : user.status || 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleToggle(user)}
                        disabled={actingId === user.id}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg disabled:opacity-60 ${
                          user.isActive
                            ? 'border border-red-200 text-red-700 hover:bg-red-50'
                            : 'bg-forest text-ivory hover:bg-forest-light'
                        }`}
                      >
                        {actingId === user.id ? 'Saving...' : user.isActive ? 'Deactivate' : 'Activate'}
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

export default ProsumerManagementPage;
