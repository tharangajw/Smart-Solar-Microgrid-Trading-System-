import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import DashboardHeader from './components/DashboardHeader';
import SummaryCard from './components/SummaryCard';
import EnergyAnalyticsChart from '../../Components/EnergyAnalyticsChart';
import { Users, UserPlus, ShieldCheck, BatteryCharging, CalendarCheck, Zap } from 'lucide-react';
import { getAllUsers, getPendingActivations } from '../../Services/backofficeApi';
import backofficeApi from '../../Services/backofficeApi';

const DashboardPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [recentReservations, setRecentReservations] = useState([]);
  const [loadingReservations, setLoadingReservations] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [prosumerCount, setProsumerCount] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [stations, setStations] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const response = await backofficeApi.get('/reservations/pending');
        const data = response.data;
        setRecentReservations(Array.isArray(data) ? data.slice(0, 3) : []);
      } catch (err) {
        console.error('Failed to fetch recent reservations:', err);
        setRecentReservations([]);
      } finally {
        setLoadingReservations(false);
      }
    };
    fetchRecent();
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const [pendingRes, usersRes, stationsRes] = await Promise.all([
          getPendingActivations(),
          getAllUsers(),
          backofficeApi.get('/stations'),
        ]);
        const pending = pendingRes.data || [];
        const prosumers = (usersRes.data || []).filter((user) => user.role === 'Prosumer');
        setPendingCount(pending.length);
        setProsumerCount(prosumers.length);
        setActiveCount(prosumers.filter((user) => user.isActive).length);
        setStations(stationsRes.data || []);
      } catch {
        setPendingCount(0);
      }
    };
    load();
  }, []);

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
    <div className="flex h-screen bg-ivory font-sans text-charcoal overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <div className="flex-1 flex flex-col h-full overflow-y-auto overflow-x-hidden">
        <DashboardHeader onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <SummaryCard 
              title="Total Prosumers" 
              value="1,248" 
              subtitle="vs last month"
              icon={Users}
              trend="up"
              trendValue="12%"
            />
            <SummaryCard 
              title="Active Stations" 
              value="42" 
              subtitle="online right now"
              icon={BatteryCharging}
              trend="up"
              trendValue="3"
            />
            <SummaryCard 
              title="Today's Reservations" 
              value="156" 
              subtitle="scheduled for today"
              icon={CalendarCheck}
              trend="up"
              trendValue="24%"
            />
            <SummaryCard 
              title="Available Slots" 
              value="89" 
              subtitle="open for booking"
              icon={Zap}
              trend="down"
              trendValue="5%"
            />
          </div>

          {/* Main Content Area Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            
            {/* Left Column (Spans 2 on desktop) */}
            <div className="lg:col-span-2 space-y-6 lg:space-y-8">
              
              {/* Recent Reservations Section */}
              <section className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-forest/5">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-lg font-semibold text-forest">Recent Reservations</h2>
                  <Link to="/reservations" className="text-sm font-medium text-sage hover:text-forest transition-colors">
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

              {/* Energy Slot Availability */}
              <section className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-forest/5">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-lg font-semibold text-forest">Energy Slot Overview</h2>
                  <Link to="/slots" className="text-sm font-medium text-sage hover:text-forest transition-colors">
                    Manage
                  </Link>
                </div>
                
                <EnergyAnalyticsChart />
              </section>

            </div>

            {/* Right Column */}
            <div className="space-y-6 lg:space-y-8">
              
              {/* Station Status */}
              <section className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-forest/5">
                <h2 className="font-display text-lg font-semibold text-forest mb-6">Microgrid Status</h2>
                
                <div className="space-y-4">
                  {stations.length === 0 ? (
                    <p className="text-sm text-charcoal-light text-center py-4">No stations available.</p>
                  ) : (
                    stations.slice(0, 5).map((station) => {
                      const usedPct = station.totalSlots > 0
                        ? Math.round(((station.totalSlots - station.availableSlots) / station.totalSlots) * 100)
                        : 0;
                      const isOptimal = station.isActive && station.status !== 'full';
                      return (
                        <div key={station.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-forest/5 transition-colors border border-transparent hover:border-forest/10">
                          <div>
                            <p className="font-medium text-sm text-charcoal">{station.name}</p>
                            <p className="text-xs text-charcoal-light mt-0.5">
                              {station.isActive ? `Slots used: ${usedPct}%` : 'Inactive'}
                            </p>
                          </div>
                          <div className={`w-2 h-2 rounded-full ${
                            !station.isActive ? 'bg-red-400' :
                            station.status === 'full' ? 'bg-solar' : 'bg-leaf'
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

              {/* Recent Transactions */}
              <section className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-forest/5">
                <h2 className="font-display text-lg font-semibold text-forest mb-6">Recent Transactions</h2>
                
                <div className="space-y-4">
                  {[
                    { id: 'TRX-892', amount: '+ 12.50', type: 'Credit', time: '2h ago' },
                    { id: 'TRX-891', amount: '- 4.20', type: 'Debit', time: '5h ago' },
                    { id: 'TRX-890', amount: '+ 8.00', type: 'Credit', time: '1d ago' },
                  ].map((trx, i) => (
                    <div key={i} className="flex items-center justify-between border-b border-forest/5 pb-3 last:border-0 last:pb-0">
                      <div>
                        <p className="font-medium text-sm text-charcoal">{trx.id}</p>
                        <p className="text-xs text-charcoal-light mt-0.5">{trx.time}</p>
                      </div>
                      <div className={`text-sm font-medium ${trx.type === 'Credit' ? 'text-forest' : 'text-charcoal'}`}>
                        {trx.amount}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

            </div>
          </div>
        </main>
      </div>

      <section className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-forest/5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold text-forest">Activation queue</h2>
          <Link to="/backoffice/prosumers" className="text-sm font-medium text-sage hover:text-forest transition-colors">
            Open pending list
          </Link>
        </div>
        <p className="text-sm text-charcoal-light">
          Mobile registrations are stored as inactive. Use Pending Activations to approve a prosumer so they can log in and book energy slots.
        </p>
      </section>
    </div>
  );
};

export default DashboardPage;
