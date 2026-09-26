import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Sidebar from '../Dashboard/components/Sidebar';
import DashboardHeader from '../Dashboard/components/DashboardHeader';
import { getSlots, createSlot, updateSlotStatus } from '../../Services/slotsService';
import { getNodes } from '../../Services/nodesService';
import { 
  BatteryCharging, Plus, Filter, Clock, CheckCircle2, 
  X, RefreshCw, Calendar, Zap, AlertTriangle
} from 'lucide-react';

const EnergySlotsPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const initialNodeId = searchParams.get('nodeId') || '';

  const [slots, setSlots] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedNodeId, setSelectedNodeId] = useState(initialNodeId);
  const [statusFilter, setStatusFilter] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [createError, setCreateError] = useState(null);

  // New Slot Form
  const [formData, setFormData] = useState({
    nodeId: '',
    slotNumber: 1,
    startTime: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
    endTime: new Date(Date.now() + 7200000).toISOString().slice(0, 16)
  });

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const nodesData = await getNodes();
      setNodes(nodesData || []);

      const filters = {};
      if (selectedNodeId) filters.nodeId = selectedNodeId;
      if (statusFilter) filters.status = statusFilter;
      if (availableOnly) filters.available = true;

      const slotsData = await getSlots(filters);
      setSlots(slotsData || []);
    } catch (err) {
      console.error('Failed to fetch energy slots data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedNodeId, statusFilter, availableOnly]);

  const handleOpenAddModal = () => {
    const activeNode = nodes.find(n => n.status?.toUpperCase() === 'ACTIVE') || nodes[0];
    setFormData({
      nodeId: activeNode?.id || '',
      slotNumber: 1,
      startTime: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
      endTime: new Date(Date.now() + 7200000).toISOString().slice(0, 16)
    });
    setCreateError(null);
    setIsAddModalOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setCreateError(null);
    try {
      const payload = {
        nodeId: formData.nodeId,
        slotNumber: parseInt(formData.slotNumber, 10),
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
        status: 'AVAILABLE'
      };
      await createSlot(payload);
      setIsAddModalOpen(false);
      fetchData();
    } catch (err) {
      setCreateError(err.message || err.data?.error || 'Failed to create slot');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (slotId, newStatus) => {
    try {
      await updateSlotStatus(slotId, newStatus);
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to update slot status');
    }
  };

  const selectedNode = nodes.find(n => n.id === formData.nodeId);
  const maxSlots = selectedNode?.battery?.totalSlots || 10;

  const availableCount = slots.filter(s => s.status?.toUpperCase() === 'AVAILABLE').length;
  const reservedCount = slots.filter(s => s.status?.toUpperCase() === 'RESERVED').length;
  const bookedCount = slots.filter(s => s.status?.toUpperCase() === 'BOOKED').length;

  return (
    <div className="flex h-screen bg-ivory font-sans text-charcoal overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div className="flex-1 flex flex-col h-full overflow-y-auto overflow-x-hidden">
        <DashboardHeader onMenuClick={toggleSidebar} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display text-2xl font-bold text-forest">Energy Booking Slots</h1>
              <p className="text-sm text-charcoal-light mt-1">
                Configure battery storage booking slots, verify availability, and manage status transitions.
              </p>
            </div>

            <button
              onClick={handleOpenAddModal}
              className="flex items-center justify-center gap-2 bg-forest hover:bg-forest-light text-white font-medium px-5 py-2.5 rounded-xl shadow-sm transition-colors text-sm"
            >
              <Plus size={18} /> Create Booking Slot
            </button>
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-5 mb-8">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-forest/5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-leaf/20 flex items-center justify-center text-forest-light">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <p className="text-[11px] text-charcoal-light font-medium uppercase tracking-wider">Available</p>
                <h3 className="font-display text-xl font-bold text-forest">{availableCount}</h3>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-forest/5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-solar/20 flex items-center justify-center text-forest-dark">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-[11px] text-charcoal-light font-medium uppercase tracking-wider">Reserved</p>
                <h3 className="font-display text-xl font-bold text-forest">{reservedCount}</h3>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-forest/5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-forest/10 flex items-center justify-center text-forest">
                <Zap size={20} />
              </div>
              <div>
                <p className="text-[11px] text-charcoal-light font-medium uppercase tracking-wider">Booked</p>
                <h3 className="font-display text-xl font-bold text-forest">{bookedCount}</h3>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-forest/5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cream flex items-center justify-center text-charcoal">
                <BatteryCharging size={20} />
              </div>
              <div>
                <p className="text-[11px] text-charcoal-light font-medium uppercase tracking-wider">Total Slots</p>
                <h3 className="font-display text-xl font-bold text-forest">{slots.length}</h3>
              </div>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-forest/5 mb-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Node Select */}
              <div className="flex items-center gap-2 border border-forest/20 rounded-xl px-3 py-2 bg-white">
                <Zap size={16} className="text-forest" />
                <select
                  value={selectedNodeId}
                  onChange={(e) => {
                    setSelectedNodeId(e.target.value);
                    setSearchParams(e.target.value ? { nodeId: e.target.value } : {});
                  }}
                  className="bg-transparent text-xs font-medium text-charcoal focus:outline-none"
                >
                  <option value="">All Solar Microgrids</option>
                  {nodes.map(n => (
                    <option key={n.id} value={n.id}>
                      {n.name} ({n.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Select */}
              <div className="flex items-center gap-2 border border-forest/20 rounded-xl px-3 py-2 bg-white">
                <Filter size={16} className="text-forest/60" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent text-xs font-medium text-charcoal focus:outline-none"
                >
                  <option value="">All Statuses</option>
                  <option value="AVAILABLE">AVAILABLE</option>
                  <option value="RESERVED">RESERVED</option>
                  <option value="BOOKED">BOOKED</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              {/* Available Only Checkbox */}
              <label className="flex items-center gap-2 text-xs text-charcoal-light cursor-pointer bg-cream px-3 py-2 rounded-xl border border-forest/10">
                <input
                  type="checkbox"
                  checked={availableOnly}
                  onChange={(e) => setAvailableOnly(e.target.checked)}
                  className="rounded text-forest focus:ring-forest border-forest/20"
                />
                <span>Available Only</span>
              </label>
            </div>

            <button
              onClick={fetchData}
              className="bg-forest/5 hover:bg-forest/10 text-forest text-xs px-3.5 py-2 rounded-xl border border-forest/10 flex items-center justify-center gap-1.5 transition-colors"
            >
              <RefreshCw size={14} /> Refresh
            </button>
          </div>

          {/* Slots Grid */}
          {loading ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-forest/5">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-forest border-t-transparent"></div>
              <p className="mt-2 text-charcoal-light text-sm">Loading slots schedule...</p>
            </div>
          ) : slots.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-forest/5">
              <BatteryCharging size={40} className="text-forest/30 mx-auto mb-3" />
              <h3 className="font-display text-lg font-bold text-forest">No Slots Found</h3>
              <p className="text-charcoal-light text-sm mt-1">Create a slot for a microgrid battery station.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {slots.map((slot) => {
                const nodeMatch = nodes.find(n => n.id === slot.nodeId);
                const statusUpper = slot.status?.toUpperCase() || 'AVAILABLE';

                let statusBadge = 'bg-leaf/20 text-forest-light border-leaf/30';
                if (statusUpper === 'RESERVED') statusBadge = 'bg-solar/20 text-forest-dark border-solar/30';
                if (statusUpper === 'BOOKED') statusBadge = 'bg-forest/10 text-forest border-forest/20';
                if (statusUpper === 'COMPLETED') statusBadge = 'bg-purple-100 text-purple-700 border-purple-200';
                if (statusUpper === 'CANCELLED') statusBadge = 'bg-red-100 text-red-600 border-red-200';

                const startTimeFormatted = new Date(slot.startTime).toLocaleString([], {
                  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                });
                const endTimeFormatted = new Date(slot.endTime).toLocaleString([], {
                  hour: '2-digit', minute: '2-digit'
                });

                return (
                  <div
                    key={slot.id}
                    className="bg-white rounded-2xl p-5 shadow-sm border border-forest/10 flex flex-col justify-between hover:border-forest/30 transition-all duration-200"
                  >
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-light">
                            {nodeMatch ? nodeMatch.name : `Node ID: ${slot.nodeId.slice(-6)}`}
                          </span>
                          <h3 className="font-display text-lg font-bold text-forest flex items-center gap-2 mt-0.5">
                            Battery Slot #{slot.slotNumber}
                          </h3>
                        </div>
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${statusBadge}`}>
                          {statusUpper}
                        </span>
                      </div>

                      <div className="bg-cream/60 p-3.5 rounded-xl border border-forest/5 text-xs space-y-2 mb-4">
                        <div className="flex items-center justify-between text-charcoal">
                          <span className="text-charcoal-light flex items-center gap-1.5">
                            <Calendar size={14} className="text-forest/50" /> Start
                          </span>
                          <span className="font-semibold text-forest">{startTimeFormatted}</span>
                        </div>
                        <div className="flex items-center justify-between text-charcoal">
                          <span className="text-charcoal-light flex items-center gap-1.5">
                            <Clock size={14} className="text-forest/50" /> End
                          </span>
                          <span className="font-semibold text-forest">{endTimeFormatted}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status update selector */}
                    <div className="pt-3 border-t border-forest/5 flex items-center justify-between gap-2">
                      <span className="text-[10px] uppercase font-bold text-charcoal-light">Status:</span>
                      <select
                        value={statusUpper}
                        onChange={(e) => handleStatusChange(slot.id, e.target.value)}
                        className="bg-white text-xs font-medium text-forest border border-forest/20 rounded-lg px-2.5 py-1 focus:outline-none focus:border-forest"
                      >
                        <option value="AVAILABLE">AVAILABLE</option>
                        <option value="RESERVED">RESERVED</option>
                        <option value="BOOKED">BOOKED</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Add Slot Modal */}
          {isAddModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest/20 backdrop-blur-sm">
              <div className="bg-white border border-forest/10 w-full max-w-lg rounded-2xl p-6 shadow-xl relative">
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="absolute top-5 right-5 text-charcoal-light hover:text-forest"
                >
                  <X size={20} />
                </button>

                <h2 className="font-display text-xl font-bold text-forest mb-1 flex items-center gap-2">
                  <BatteryCharging size={20} className="text-solar" />
                  Create Booking Slot
                </h2>
                <p className="text-xs text-charcoal-light mb-6">
                  Assign a battery slot schedule for microgrid charging/discharging.
                </p>

                {createError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3.5 rounded-xl mb-4 flex items-start gap-2">
                    <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold">Slot Creation Rejected</strong>
                      {createError}
                    </div>
                  </div>
                )}

                <form onSubmit={handleCreateSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-charcoal-light mb-1">Microgrid Node</label>
                    <select
                      required
                      value={formData.nodeId}
                      onChange={(e) => setFormData({ ...formData, nodeId: e.target.value, slotNumber: 1 })}
                      className="w-full px-3 py-2 border border-forest/20 rounded-xl focus:outline-none focus:border-forest text-sm bg-white"
                    >
                      {nodes.map(n => (
                        <option key={n.id} value={n.id}>
                          {n.name} ({n.code}) - {n.status}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-charcoal-light mb-1">
                      Slot Number (1 to {maxSlots})
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={maxSlots}
                      required
                      value={formData.slotNumber}
                      onChange={(e) => setFormData({ ...formData, slotNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-forest/20 rounded-xl focus:outline-none focus:border-forest text-sm bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-charcoal-light mb-1">Start Date & Time</label>
                      <input
                        type="datetime-local"
                        required
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                        className="w-full px-3 py-2 border border-forest/20 rounded-xl focus:outline-none focus:border-forest text-xs bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-charcoal-light mb-1">End Date & Time</label>
                      <input
                        type="datetime-local"
                        required
                        value={formData.endTime}
                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                        className="w-full px-3 py-2 border border-forest/20 rounded-xl focus:outline-none focus:border-forest text-xs bg-white"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-forest/10">
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(false)}
                      className="px-4 py-2 border border-forest/20 rounded-xl text-xs font-medium text-charcoal-light hover:bg-forest/5"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-5 py-2 bg-forest hover:bg-forest-light text-white rounded-xl text-xs font-medium shadow-sm transition-colors"
                    >
                      {submitting ? 'Creating...' : 'Create Slot'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default EnergySlotsPage;
