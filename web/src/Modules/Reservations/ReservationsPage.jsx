import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Dashboard/components/Sidebar';
import DashboardHeader from '../Dashboard/components/DashboardHeader';
import { Search, Filter } from 'lucide-react';

const ReservationsPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [nicSearch, setNicSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const fetchReservations = async () => {
    setLoading(true);
    try {
      // Build query string
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (nicSearch) params.append('nic', nicSearch);
      if (dateFrom) params.append('from', dateFrom);
      if (dateTo) params.append('to', dateTo);

      let url = '/api/reservations/search';
      if (statusFilter === 'Pending' && !nicSearch && !dateFrom && !dateTo) {
        url = '/api/reservations/pending';
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setReservations(Array.isArray(data) ? data : []);
      } else {
        console.error('Failed to fetch reservations');
      }
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchReservations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, dateFrom, dateTo]); // nicSearch is handled by a submit/button

  const handleSearch = (e) => {
    e.preventDefault();
    fetchReservations();
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'completed': return 'bg-leaf/20 text-forest-light';
      case 'active': return 'bg-solar/20 text-solar-dark';
      case 'pending': return 'bg-gray-100 text-charcoal-light';
      case 'cancelled': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-charcoal-light';
    }
  };

  return (
    <div className="flex h-screen bg-ivory font-sans text-charcoal overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <div className="flex-1 flex flex-col h-full overflow-y-auto overflow-x-hidden">
        <DashboardHeader onMenuClick={toggleSidebar} />
        
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <h1 className="font-display text-2xl font-bold text-forest">Reservations</h1>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-forest/5 mb-6">
            <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4 items-end">
              <div className="w-full lg:w-1/4">
                <label className="block text-xs font-medium text-charcoal-light mb-1">Search by NIC</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter NIC..."
                    className="w-full pl-9 pr-4 py-2 border border-forest/20 rounded-xl focus:outline-none focus:border-forest text-sm"
                    value={nicSearch}
                    onChange={(e) => setNicSearch(e.target.value)}
                  />
                  <Search className="absolute left-3 top-2.5 text-forest/40" size={16} />
                </div>
              </div>

              <div className="w-full lg:w-1/4">
                <label className="block text-xs font-medium text-charcoal-light mb-1">Status</label>
                <select 
                  className="w-full px-4 py-2 border border-forest/20 rounded-xl focus:outline-none focus:border-forest text-sm bg-white"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="w-full lg:w-1/4">
                <label className="block text-xs font-medium text-charcoal-light mb-1">Date From</label>
                <input
                  type="date"
                  className="w-full px-4 py-2 border border-forest/20 rounded-xl focus:outline-none focus:border-forest text-sm"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>

              <div className="w-full lg:w-1/4">
                <label className="block text-xs font-medium text-charcoal-light mb-1">Date To</label>
                <input
                  type="date"
                  className="w-full px-4 py-2 border border-forest/20 rounded-xl focus:outline-none focus:border-forest text-sm"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>

              <div className="w-full lg:w-auto">
                <button type="submit" className="w-full lg:w-auto px-6 py-2 bg-forest text-white rounded-xl text-sm font-medium hover:bg-forest-light transition-colors flex items-center justify-center gap-2">
                  <Filter size={16} />
                  Filter
                </button>
              </div>
            </form>
          </div>

          {/* List Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-forest/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-charcoal-light uppercase bg-forest/5 border-b border-forest/10">
                  <tr>
                    <th className="px-6 py-4 font-medium">NIC</th>
                    <th className="px-6 py-4 font-medium">Station/Node</th>
                    <th className="px-6 py-4 font-medium">Slot</th>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-charcoal-light">
                        Loading reservations...
                      </td>
                    </tr>
                  ) : reservations.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-charcoal-light">
                        No reservations found matching the criteria.
                      </td>
                    </tr>
                  ) : (
                    reservations.map((res) => (
                      <tr 
                        key={res.id} 
                        onClick={() => navigate(`/reservations/${res.id}`)}
                        className="border-b border-forest/5 hover:bg-forest/5/50 transition-colors cursor-pointer"
                      >
                        <td className="px-6 py-4 font-medium text-charcoal">{res.prosumerNic}</td>
                        <td className="px-6 py-4 text-charcoal-light">{res.nodeId}</td>
                        <td className="px-6 py-4 text-charcoal-light">{res.slotId}</td>
                        <td className="px-6 py-4 text-charcoal-light">
                          {new Date(res.reservationDate).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
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
          </div>
        </main>
      </div>
    </div>
  );
};

export default ReservationsPage;
