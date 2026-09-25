import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, UserPlus, ShieldCheck, BatteryCharging, CalendarCheck, Zap, X, ArrowRight } from 'lucide-react';
import { getAllUsers, getPendingActivations } from '../../../Services/backofficeApi';
import backofficeApi from '../../../Services/backofficeApi';

const BackofficeDashboard = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [prosumerCount, setProsumerCount] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [recentReservations, setRecentReservations] = useState([]);
  const [loadingReservations, setLoadingReservations] = useState(true);
  const [stations, setStations] = useState([]);
  const [loadingStations, setLoadingStations] = useState(true);
  const [showCreateOperatorModal, setShowCreateOperatorModal] = useState(false);
  const [operatorForm, setOperatorForm] = useState({
    email: '',
    password: '',
    fullName: '',
    nic: '',
    phoneNumber: '',
    address: ''
  });
  const [operatorError, setOperatorError] = useState('');
  const [operatorLoading, setOperatorLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const [pendingRes, usersRes] = await Promise.all([getPendingActivations(), getAllUsers()]);
        const pending = pendingRes.data || [];
        const prosumers = (usersRes.data || []).filter((user) => user.role === 'Prosumer');
        setPendingUsers(pending);
        setProsumerCount(prosumers.length);
        setActiveCount(prosumers.filter((user) => user.isActive).length);
      } catch {
        setPendingUsers([]);
      }
    };
    load();
  }, []);

  // Fetch real stations for Microgrid Status panel
  useEffect(() => {
    const loadStations = async () => {
      try {
        const res = await backofficeApi.get('/stations');
        setStations(res.data || []);
      } catch {
        setStations([]);
      } finally {
        setLoadingStations(false);
      }
    };
    loadStations();
  }, []);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const response = await fetch('/api/reservations/pending');
        if (response.ok) {
          const data = await response.json();
          setRecentReservations(Array.isArray(data) ? data.slice(0, 3) : []);
        }
      } catch (err) {
        console.error('Failed to fetch recent reservations:', err);
      } finally {
        setLoadingReservations(false);
      }
    };
    fetchRecent();
  }, []);

  const pendingCount = pendingUsers.length;
  const activeStationsCount = stations.filter((s) => s.isActive).length;

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'completed': return 'bg-leaf/20 text-forest-light';
      case 'active': return 'bg-solar/20 text-solar-dark text-yellow-700';
      case 'pending': return 'bg-gray-100 text-charcoal-light';
      case 'cancelled': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-charcoal-light';
    }
  };


  return (
    <div className="w-full space-y-6 lg:space-y-8">
        <h1 className="font-display text-2xl font-bold text-forest">Backoffice Dashboard</h1>
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-forest/5">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-forest" />
              <span className="text-xs font-medium text-leaf bg-leaf/20 px-2 py-1 rounded-full">+12%</span>
            </div>
            <h3 className="text-3xl font-bold text-charcoal">{prosumerCount}</h3>
            <p className="text-sm text-charcoal-light mt-1">Total Prosumers</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-forest/5">
            <div className="flex items-center justify-between mb-4">
              <ShieldCheck className="w-8 h-8 text-forest" />
              <span className="text-xs font-medium text-leaf bg-leaf/20 px-2 py-1 rounded-full">{activeCount}</span>
            </div>
            <h3 className="text-3xl font-bold text-charcoal">{activeCount}</h3>
            <p className="text-sm text-charcoal-light mt-1">Active Prosumers</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-forest/5">
            <div className="flex items-center justify-between mb-4">
              <UserPlus className="w-8 h-8 text-solar" />
              <span className="text-xs font-medium text-solar bg-solar/20 px-2 py-1 rounded-full">{pendingCount}</span>
            </div>
            <h3 className="text-3xl font-bold text-charcoal">{pendingCount}</h3>
            <p className="text-sm text-charcoal-light mt-1">Pending Activations</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-forest/5">
            <div className="flex items-center justify-between mb-4">
              <BatteryCharging className="w-8 h-8 text-forest" />
              <span className="text-xs font-medium text-leaf bg-leaf/20 px-2 py-1 rounded-full">
                {loadingStations ? '…' : activeStationsCount}
              </span>
            </div>
            <h3 className="text-3xl font-bold text-charcoal">
              {loadingStations ? '…' : activeStationsCount}
            </h3>
            <p className="text-sm text-charcoal-light mt-1">Active Stations</p>
          </div>
        </div>


        {/* Main Content Area Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
          
          {/* Left Column (Spans 2 on desktop) */}
          <div className="lg:col-span-2 space-y-6 lg:space-y-8 min-w-0">
            
            {/* Recent Reservations Section */}
            <section className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-forest/5">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-lg font-semibold text-forest">Recent Reservations</h2>
                <Link to="/backoffice/reservations" className="text-sm font-medium text-sage hover:text-forest transition-colors">
                  View All
                </Link>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-charcoal-light uppercase bg-forest/5 border-b border-forest/10 rounded-t-lg">
                    <tr>
                      <th className="px-4 py-3 rounded-tl-lg font-medium">User NIC</th>
                      <th className="px-4 py-3 font-medium">Station/Node</th>
                      <th className="px-4 py-3 font-medium">Date</th>
                      <th className="px-4 py-3 rounded-tr-lg font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingReservations ? (
                      <tr>
                        <td colSpan="4" className="px-4 py-6 text-center text-charcoal-light">Loading...</td>
                      </tr>
                    ) : recentReservations.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-4 py-6 text-center text-charcoal-light">No recent reservations found.</td>
                      </tr>
                    ) : (
                      recentReservations.map((res) => (
                        <tr 
                          key={res.id} 
                          onClick={() => navigate(`/reservations/${res.id}`)}
                          className="border-b border-forest/5 hover:bg-forest/5/50 transition-colors cursor-pointer"
                        >
                          <td className="px-4 py-3 font-medium text-charcoal">{res.prosumerNic}</td>
                          <td className="px-4 py-3 text-charcoal-light">{res.nodeId}</td>
                          <td className="px-4 py-3 text-charcoal-light">
                            {new Date(res.reservationDate).toLocaleString()}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(res.status)}`}>
                              {res.status || 'Pending'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Activation Queue */}
            <section className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-forest/5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg font-semibold text-forest">Activation Queue</h2>
                <Link to="/backoffice/pending" className="text-sm font-medium text-sage hover:text-forest transition-colors">
                  Open Pending List
                </Link>
              </div>
              <p className="text-sm text-charcoal-light">
                Mobile registrations are stored as inactive. Use Pending Activations to approve a prosumer so they can log in and book energy slots.
              </p>
              {pendingCount > 0 && (
                <div className="mt-4 space-y-3">
                  <p className="text-sm font-medium text-solar-dark">
                    {pendingCount} prosumer(s) waiting for activation
                  </p>
                  <div className="overflow-x-auto rounded-xl border border-solar/30">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-charcoal-light uppercase bg-solar/10 border-b border-solar/20">
                        <tr>
                          <th className="px-4 py-2.5 font-medium">NIC</th>
                          <th className="px-4 py-2.5 font-medium">Name</th>
                          <th className="px-4 py-2.5 font-medium">Email</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingUsers.slice(0, 5).map((user) => (
                          <tr
                            key={user.id}
                            onClick={() => navigate('/backoffice/pending')}
                            className="border-b border-solar/10 last:border-0 hover:bg-solar/10 transition-colors cursor-pointer bg-white/60"
                          >
                            <td className="px-4 py-2.5 font-medium text-charcoal">{user.nic}</td>
                            <td className="px-4 py-2.5 text-charcoal">{user.fullName}</td>
                            <td className="px-4 py-2.5 text-charcoal-light">{user.email}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {pendingCount > 5 && (
                    <Link to="/backoffice/pending" className="text-xs font-medium text-sage hover:text-forest transition-colors">
                      View all {pendingCount} pending prosumers
                    </Link>
                  )}
                </div>
              )}
            </section>

          </div>

          {/* Right Column */}
          <div className="space-y-6 lg:space-y-8 lg:sticky lg:top-20 w-full min-w-0">
            
            {/* Station Status */}
            <section className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-forest/5">
              <h2 className="font-display text-lg font-semibold text-forest mb-6">Microgrid Status</h2>
              
              <div className="space-y-4">
                {loadingStations ? (
                  <p className="text-sm text-charcoal-light text-center py-4">Loading stations...</p>
                ) : stations.length === 0 ? (
                  <p className="text-sm text-charcoal-light text-center py-4">No stations available.</p>
                ) : (
                  stations.slice(0, 3).map((station) => {
                    const usedPct = station.totalSlots > 0
                      ? Math.round(((station.totalSlots - station.availableSlots) / station.totalSlots) * 100)
                      : 0;
                    return (
                      <div key={station.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-forest/5 transition-colors border border-transparent hover:border-forest/10">
                        <div>
                          <p className="font-medium text-sm text-charcoal">{station.name}</p>
                          <p className="text-xs text-charcoal-light mt-0.5">
                            {station.isActive ? `Capacity: ${usedPct}%` : 'Inactive'}
                          </p>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${
                          !station.isActive ? 'bg-red-400' :
                          station.status === 'full' || usedPct >= 80 ? 'bg-solar' : 'bg-leaf'
                        }`} />
                      </div>
                    );
                  })
                )}
              </div>
              <Link to="/backoffice/nodes" className="block w-full mt-4 py-2 text-sm font-medium text-center border border-forest/20 rounded-xl text-forest hover:bg-forest hover:text-ivory transition-colors">
                View All Stations
              </Link>
            </section>

          </div>
        </div>

      {/* Create Grid Operator Modal */}
      {showCreateOperatorModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-semibold text-forest">Create Grid Operator</h2>
              <button
                onClick={() => {
                  setShowCreateOperatorModal(false);
                  setOperatorError('');
                  setOperatorForm({
                    email: '',
                    password: '',
                    fullName: '',
                    nic: '',
                    phoneNumber: '',
                    address: ''
                  });
                }}
                className="text-charcoal-light hover:text-charcoal transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {operatorError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {operatorError}
              </div>
            )}

            <form onSubmit={async (e) => {
              e.preventDefault();
              setOperatorLoading(true);
              setOperatorError('');

              try {
                const { createGridOperator } = await import('../../../Services/backofficeApi');
                const response = await createGridOperator(operatorForm);
                
                if (response.data) {
                  setShowCreateOperatorModal(false);
                  setOperatorForm({
                    email: '',
                    password: '',
                    fullName: '',
                    nic: '',
                    phoneNumber: '',
                    address: ''
                  });
                  alert('Grid Operator created successfully!');
                } else {
                  setOperatorError('Failed to create Grid Operator');
                }
              } catch (err) {
                setOperatorError(err.response?.data?.message || 'Failed to create Grid Operator');
              } finally {
                setOperatorLoading(false);
              }
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  value={operatorForm.fullName}
                  onChange={(e) => setOperatorForm({ ...operatorForm, fullName: e.target.value })}
                  className="w-full px-4 py-3 border border-forest/20 rounded-xl focus:ring-2 focus:ring-forest focus:border-transparent outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">NIC</label>
                <input
                  type="text"
                  required
                  value={operatorForm.nic}
                  onChange={(e) => setOperatorForm({ ...operatorForm, nic: e.target.value })}
                  className="w-full px-4 py-3 border border-forest/20 rounded-xl focus:ring-2 focus:ring-forest focus:border-transparent outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={operatorForm.email}
                  onChange={(e) => setOperatorForm({ ...operatorForm, email: e.target.value })}
                  className="w-full px-4 py-3 border border-forest/20 rounded-xl focus:ring-2 focus:ring-forest focus:border-transparent outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={operatorForm.password}
                  onChange={(e) => setOperatorForm({ ...operatorForm, password: e.target.value })}
                  className="w-full px-4 py-3 border border-forest/20 rounded-xl focus:ring-2 focus:ring-forest focus:border-transparent outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">Phone Number</label>
                <input
                  type="text"
                  required
                  value={operatorForm.phoneNumber}
                  onChange={(e) => setOperatorForm({ ...operatorForm, phoneNumber: e.target.value })}
                  className="w-full px-4 py-3 border border-forest/20 rounded-xl focus:ring-2 focus:ring-forest focus:border-transparent outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">Address</label>
                <input
                  type="text"
                  required
                  value={operatorForm.address}
                  onChange={(e) => setOperatorForm({ ...operatorForm, address: e.target.value })}
                  className="w-full px-4 py-3 border border-forest/20 rounded-xl focus:ring-2 focus:ring-forest focus:border-transparent outline-none transition"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateOperatorModal(false);
                    setOperatorError('');
                    setOperatorForm({
                      email: '',
                      password: '',
                      fullName: '',
                      nic: '',
                      phoneNumber: '',
                      address: ''
                    });
                  }}
                  className="flex-1 px-4 py-3 border border-forest/20 rounded-xl text-forest hover:bg-forest/5 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={operatorLoading}
                  className="flex-1 px-4 py-3 bg-forest text-ivory rounded-xl hover:bg-forest/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {operatorLoading ? 'Creating...' : 'Create Operator'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BackofficeDashboard;
