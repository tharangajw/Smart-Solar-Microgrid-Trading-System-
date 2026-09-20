import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../Dashboard/components/Sidebar';
import DashboardHeader from '../Dashboard/components/DashboardHeader';
import { ArrowLeft, Calendar, User, Zap, MapPin, Clock, Info } from 'lucide-react';

const ReservationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const fetchReservation = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/reservations/${id}`);
        if (response.ok) {
          const data = await response.json();
          setReservation(data);
        } else {
          setError('Failed to fetch reservation details. It may not exist.');
        }
      } catch (err) {
        setError('An error occurred while fetching the reservation.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchReservation();
    }
  }, [id]);

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
        <DashboardHeader onMenuClick={toggleSidebar} />
        
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <div className="mb-6">
            <button 
              onClick={() => navigate('/reservations')} 
              className="flex items-center text-sm font-medium text-sage hover:text-forest transition-colors"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to Reservations
            </button>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <h1 className="font-display text-2xl font-bold text-forest">Reservation Details</h1>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-forest/5 text-center text-charcoal-light">
              Loading details...
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 rounded-2xl p-8 shadow-sm border border-red-100 text-center">
              {error}
            </div>
          ) : reservation ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              {/* Main Info Card */}
              <div className="lg:col-span-2 space-y-6">
                <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-forest/5">
                  <div className="flex items-center justify-between border-b border-forest/10 pb-6 mb-6">
                    <div>
                      <p className="text-sm text-charcoal-light mb-1">Reservation ID</p>
                      <p className="font-mono text-lg text-charcoal font-medium">{reservation.id}</p>
                    </div>
                    <div>
                      <span className={`px-3 py-1.5 rounded-lg text-sm font-medium ${getStatusColor(reservation.status)}`}>
                        {reservation.status || 'Pending'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <div className="flex items-center text-sm font-medium text-charcoal-light mb-2">
                          <User size={16} className="mr-2" />
                          Prosumer NIC
                        </div>
                        <p className="font-medium text-charcoal">{reservation.prosumerNic}</p>
                      </div>

                      <div>
                        <div className="flex items-center text-sm font-medium text-charcoal-light mb-2">
                          <MapPin size={16} className="mr-2" />
                          Node ID / Station
                        </div>
                        <p className="font-medium text-charcoal">{reservation.nodeId}</p>
                      </div>

                      <div>
                        <div className="flex items-center text-sm font-medium text-charcoal-light mb-2">
                          <Zap size={16} className="mr-2" />
                          Energy Slot ID
                        </div>
                        <p className="font-medium text-charcoal">{reservation.slotId}</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <div className="flex items-center text-sm font-medium text-charcoal-light mb-2">
                          <Calendar size={16} className="mr-2" />
                          Reservation Date
                        </div>
                        <p className="font-medium text-charcoal">
                          {new Date(reservation.reservationDate).toLocaleDateString()}
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center text-sm font-medium text-charcoal-light mb-2">
                          <Clock size={16} className="mr-2" />
                          Reservation Time
                        </div>
                        <p className="font-medium text-charcoal">
                          {new Date(reservation.reservationDate).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {reservation.status === 'Cancelled' && reservation.cancelledReason && (
                    <div className="mt-8 p-4 bg-red-50 rounded-xl border border-red-100 flex items-start">
                      <Info size={20} className="text-red-500 mr-3 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-red-800 mb-1">Cancellation Reason</h4>
                        <p className="text-sm text-red-600">{reservation.cancelledReason}</p>
                      </div>
                    </div>
                  )}
                </section>
              </div>

              {/* Side Card for Timestamps & Actions */}
              <div className="space-y-6">
                <section className="bg-white rounded-2xl p-6 shadow-sm border border-forest/5">
                  <h3 className="font-display text-lg font-semibold text-forest mb-4">Metadata</h3>
                  
                  <div className="space-y-4">
                    <div className="border-b border-forest/5 pb-3">
                      <p className="text-xs text-charcoal-light mb-1">Created At</p>
                      <p className="text-sm font-medium text-charcoal">
                        {new Date(reservation.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="pb-1">
                      <p className="text-xs text-charcoal-light mb-1">Last Updated</p>
                      <p className="text-sm font-medium text-charcoal">
                        {new Date(reservation.updatedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </section>

                <section className="bg-white rounded-2xl p-6 shadow-sm border border-forest/5">
                  <h3 className="font-display text-lg font-semibold text-forest mb-4">Actions</h3>
                  
                  <div className="space-y-3">
                    <button className="w-full py-2.5 bg-forest text-white rounded-xl text-sm font-medium hover:bg-forest-light transition-colors">
                      Edit Reservation
                    </button>
                    {reservation.status !== 'Cancelled' && (
                      <button className="w-full py-2.5 bg-white border border-red-200 text-red-600 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors">
                        Cancel Reservation
                      </button>
                    )}
                  </div>
                </section>
              </div>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
};

export default ReservationDetailPage;
