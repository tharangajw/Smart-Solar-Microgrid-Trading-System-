import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Dashboard/components/Sidebar';
import DashboardHeader from '../Dashboard/components/DashboardHeader';
import LocationPickerMap from '../../Components/LocationPickerMap';
import { getNodes, createNode, updateNode, deactivateNode } from '../../Services/nodesService';
import { 
  Plus, MapPin, Zap, BatteryCharging, Calendar, Filter, 
  AlertTriangle, Power, Edit3, Search, Navigation, X, ArrowRight
} from 'lucide-react';

const MicrogridNodesPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Near Me Filter state
  const [useNearMe, setUseNearMe] = useState(false);
  const [lat, setLat] = useState('7.4863');
  const [lng, setLng] = useState('80.3647');
  const [radiusKm, setRadiusKm] = useState('50');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);

  const [selectedNode, setSelectedNode] = useState(null);
  const [deactivateError, setDeactivateError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    lat: 7.4863,
    lng: 80.3647,
    capacityKW: 50,
    totalSlots: 10,
    slotCapacityKWh: 5,
    days: ['MON', 'TUE', 'WED', 'THU', 'FRI'],
    openTime: '06:00',
    closeTime: '20:00'
  });

  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const fetchNodesList = async () => {
    setLoading(true);
    try {
      const filters = {};
      if (statusFilter) filters.status = statusFilter;
      if (useNearMe && lat && lng) {
        filters.nearMe = true;
        filters.lat = lat;
        filters.lng = lng;
        filters.radiusKm = radiusKm;
      }
      const data = await getNodes(filters);
      setNodes(data || []);
    } catch (err) {
      console.error('Failed to load nodes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNodesList();
  }, [statusFilter, useNearMe]);

  const handleNearMeSearch = (e) => {
    e.preventDefault();
    setUseNearMe(true);
    fetchNodesList();
  };

  const handleOpenAddModal = () => {
    setFormData({
      name: '',
      code: `MG-${Math.floor(100 + Math.random() * 900)}`,
      lat: 7.4863,
      lng: 80.3647,
      capacityKW: 50,
      totalSlots: 10,
      slotCapacityKWh: 5,
      days: ['MON', 'TUE', 'WED', 'THU', 'FRI'],
      openTime: '06:00',
      closeTime: '20:00'
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (node) => {
    setSelectedNode(node);
    setFormData({
      name: node.name || '',
      code: node.code || '',
      lat: node.gps?.lat || 7.4863,
      lng: node.gps?.lng || 80.3647,
      capacityKW: node.capacityKW || 50,
      totalSlots: node.battery?.totalSlots || 10,
      slotCapacityKWh: node.battery?.slotCapacityKWh || 5,
      days: node.operationalSchedule?.map(s => s.day) || ['MON', 'TUE'],
      openTime: node.operationalSchedule?.[0]?.openTime || '06:00',
      closeTime: node.operationalSchedule?.[0]?.closeTime || '20:00'
    });
    setIsEditModalOpen(true);
  };

  const handleOpenDeactivateModal = (node) => {
    setSelectedNode(node);
    setDeactivateError(null);
    setIsDeactivateModalOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        code: formData.code,
        gps: { lat: parseFloat(formData.lat), lng: parseFloat(formData.lng) },
        capacityKW: parseFloat(formData.capacityKW),
        battery: {
          totalSlots: parseInt(formData.totalSlots, 10),
          slotCapacityKWh: parseFloat(formData.slotCapacityKWh)
        },
        operationalSchedule: formData.days.map(d => ({
          day: d,
          openTime: formData.openTime,
          closeTime: formData.closeTime
        }))
      };
      await createNode(payload);
      setIsAddModalOpen(false);
      fetchNodesList();
    } catch (err) {
      alert(err.message || 'Failed to create node');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedNode) return;
    setSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        code: formData.code,
        gps: { lat: parseFloat(formData.lat), lng: parseFloat(formData.lng) },
        capacityKW: parseFloat(formData.capacityKW),
        battery: {
          totalSlots: parseInt(formData.totalSlots, 10),
          slotCapacityKWh: parseFloat(formData.slotCapacityKWh)
        },
        operationalSchedule: formData.days.map(d => ({
          day: d,
          openTime: formData.openTime,
          closeTime: formData.closeTime
        }))
      };
      await updateNode(selectedNode.id, payload);
      setIsEditModalOpen(false);
      fetchNodesList();
    } catch (err) {
      alert(err.message || 'Failed to update node');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivateConfirm = async () => {
    if (!selectedNode) return;
    setSubmitting(true);
    setDeactivateError(null);
    try {
      await deactivateNode(selectedNode.id);
      setIsDeactivateModalOpen(false);
      fetchNodesList();
    } catch (err) {
      if (err.status === 409 || err.data?.activeReservationCount) {
        setDeactivateError(
          err.data?.error || `Cannot deactivate node: ${err.data?.activeReservationCount || 'active'} reservations exist`
        );
      } else {
        setDeactivateError(err.message || 'Failed to deactivate node');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const filteredNodes = nodes.filter(n => {
    const matchesSearch = 
      n.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.code?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const totalCapacity = nodes.reduce((acc, n) => acc + (n.capacityKW || 0), 0);
  const totalSlots = nodes.reduce((acc, n) => acc + (n.battery?.totalSlots || 0), 0);
  const activeNodesCount = nodes.filter(n => n.status?.toUpperCase() === 'ACTIVE').length;

  return (
    <div className="flex h-screen bg-ivory font-sans text-charcoal overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div className="flex-1 flex flex-col h-full overflow-y-auto overflow-x-hidden">
        <DashboardHeader onMenuClick={toggleSidebar} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display text-2xl font-bold text-forest">Microgrid Stations</h1>
              <p className="text-sm text-charcoal-light mt-1">
                Manage solar grid hubs, capacity specs (kW), battery storage slots, and operational schedules.
              </p>
            </div>

            <button
              onClick={handleOpenAddModal}
              className="flex items-center justify-center gap-2 bg-forest hover:bg-forest-light text-white font-medium px-5 py-2.5 rounded-xl shadow-sm transition-colors text-sm"
            >
              <Plus size={18} /> Add Solar Hub
            </button>
          </div>

          {/* Metrics Summary Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-forest/5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-forest/10 flex items-center justify-center text-forest">
                <Zap size={24} />
              </div>
              <div>
                <p className="text-xs text-charcoal-light font-medium uppercase tracking-wider">Active Stations</p>
                <h3 className="font-display text-2xl font-bold text-forest mt-0.5">
                  {activeNodesCount} <span className="text-sm font-normal text-charcoal-light">/ {nodes.length}</span>
                </h3>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-forest/5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-solar/20 flex items-center justify-center text-forest-dark">
                <BatteryCharging size={24} />
              </div>
              <div>
                <p className="text-xs text-charcoal-light font-medium uppercase tracking-wider">Total Capacity</p>
                <h3 className="font-display text-2xl font-bold text-forest mt-0.5">
                  {totalCapacity} <span className="text-sm font-normal text-charcoal-light">kW/h</span>
                </h3>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-forest/5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-leaf/20 flex items-center justify-center text-forest-light">
                <BatteryCharging size={24} />
              </div>
              <div>
                <p className="text-xs text-charcoal-light font-medium uppercase tracking-wider">Battery Storage</p>
                <h3 className="font-display text-2xl font-bold text-forest mt-0.5">
                  {totalSlots} <span className="text-sm font-normal text-charcoal-light">Slots</span>
                </h3>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-forest/5 mb-8">
            <form onSubmit={handleNearMeSearch} className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-end justify-between">
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStatusFilter('')}
                  className={`px-4 py-2 text-xs font-semibold rounded-xl transition-colors ${
                    statusFilter === '' ? 'bg-forest text-white shadow-sm' : 'bg-forest/5 text-charcoal-light hover:bg-forest/10'
                  }`}
                >
                  All Status
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('ACTIVE')}
                  className={`px-4 py-2 text-xs font-semibold rounded-xl transition-colors ${
                    statusFilter === 'ACTIVE' ? 'bg-forest text-white shadow-sm' : 'bg-forest/5 text-charcoal-light hover:bg-forest/10'
                  }`}
                >
                  Active Only
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('INACTIVE')}
                  className={`px-4 py-2 text-xs font-semibold rounded-xl transition-colors ${
                    statusFilter === 'INACTIVE' ? 'bg-gray-200 text-charcoal shadow-sm' : 'bg-forest/5 text-charcoal-light hover:bg-forest/10'
                  }`}
                >
                  Inactive
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative min-w-[200px] flex-1">
                  <input
                    type="text"
                    placeholder="Search hub name or code..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-forest/20 rounded-xl focus:outline-none focus:border-forest text-sm bg-white"
                  />
                  <Search className="absolute left-3 top-2.5 text-forest/40" size={16} />
                </div>

                <div className="flex items-center gap-2 bg-cream border border-forest/10 px-3 py-1.5 rounded-xl text-xs">
                  <Navigation size={14} className="text-forest" />
                  <span className="text-charcoal-light font-medium">Lat:</span>
                  <input
                    type="text"
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    className="w-14 bg-white border border-forest/20 rounded px-1 text-center font-mono text-xs"
                  />
                  <span className="text-charcoal-light font-medium">Lng:</span>
                  <input
                    type="text"
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                    className="w-14 bg-white border border-forest/20 rounded px-1 text-center font-mono text-xs"
                  />
                  <span className="text-charcoal-light font-medium">Radius:</span>
                  <input
                    type="number"
                    value={radiusKm}
                    onChange={(e) => setRadiusKm(e.target.value)}
                    className="w-12 bg-white border border-forest/20 rounded px-1 text-center text-xs"
                  />
                  <span className="text-charcoal-light">km</span>
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 bg-forest/10 text-forest hover:bg-forest hover:text-white font-medium text-xs rounded-xl border border-forest/20 transition-colors flex items-center gap-1.5"
                >
                  <Filter size={14} /> Near Me
                </button>
              </div>
            </form>
          </div>

          {/* Cards Grid */}
          {loading ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-forest/5">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-forest border-t-transparent"></div>
              <p className="mt-2 text-charcoal-light text-sm">Loading solar station nodes...</p>
            </div>
          ) : filteredNodes.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-forest/5">
              <Zap size={40} className="text-forest/30 mx-auto mb-3" />
              <h3 className="font-display text-lg font-bold text-forest">No Solar Hubs Found</h3>
              <p className="text-charcoal-light text-sm mt-1">Try adjusting your search criteria or add a new hub.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNodes.map((node) => {
                const isActive = node.status?.toUpperCase() === 'ACTIVE';
                return (
                  <div
                    key={node.id}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-forest/10 flex flex-col justify-between hover:border-forest/30 transition-all duration-200"
                  >
                    <div>
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div>
                          <span className="inline-block text-[11px] font-bold tracking-wider text-forest bg-forest/10 px-2.5 py-0.5 rounded-md mb-1.5 uppercase">
                            {node.code || 'MG-NODE'}
                          </span>
                          <h3 className="font-display text-lg font-bold text-forest">
                            {node.name}
                          </h3>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                            isActive
                              ? 'bg-leaf/20 text-forest-light border border-leaf/30'
                              : 'bg-gray-100 text-charcoal-light border border-gray-200'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-forest-light' : 'bg-gray-400'}`}></span>
                          {node.status}
                        </span>
                      </div>

                      {/* Details Box */}
                      <div className="space-y-2.5 text-xs text-charcoal mb-6 bg-cream/60 p-4 rounded-xl border border-forest/5">
                        <div className="flex items-center justify-between">
                          <span className="text-charcoal-light flex items-center gap-1.5">
                            <MapPin size={14} className="text-forest/50" /> GPS Location
                          </span>
                          <span className="font-mono text-charcoal font-medium">
                            {node.gps?.lat?.toFixed(4)}, {node.gps?.lng?.toFixed(4)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-charcoal-light flex items-center gap-1.5">
                            <Zap size={14} className="text-solar" /> Capacity Specs
                          </span>
                          <span className="font-bold text-forest">{node.capacityKW} kW/h</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-charcoal-light flex items-center gap-1.5">
                            <BatteryCharging size={14} className="text-forest-light" /> Storage Slots
                          </span>
                          <span className="font-semibold text-charcoal">
                            {node.battery?.totalSlots} slots ({node.battery?.slotCapacityKWh} kWh/slot)
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-1.5 border-t border-forest/10">
                          <span className="text-charcoal-light flex items-center gap-1.5">
                            <Calendar size={14} className="text-forest/50" /> Schedule
                          </span>
                          <span className="text-charcoal font-medium">
                            {node.operationalSchedule?.length || 0} active days
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2 border-t border-forest/5">
                      <button
                        onClick={() => navigate(`/slots?nodeId=${node.id}`)}
                        className="flex-1 bg-forest/5 hover:bg-forest hover:text-white text-forest font-medium text-xs py-2.5 px-3 rounded-xl border border-forest/10 transition-colors flex items-center justify-center gap-1"
                      >
                        Slots <ArrowRight size={14} />
                      </button>

                      <button
                        onClick={() => handleOpenEditModal(node)}
                        className="p-2.5 text-charcoal-light hover:text-forest hover:bg-forest/5 rounded-xl border border-forest/10 transition-colors"
                        title="Edit Node Schedule/Specs"
                      >
                        <Edit3 size={16} />
                      </button>

                      {isActive && (
                        <button
                          onClick={() => handleOpenDeactivateModal(node)}
                          className="p-2.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl border border-red-200 transition-colors"
                          title="Deactivate Node"
                        >
                          <Power size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Add / Edit Modal with Interactive OpenStreetMap Picker */}
          {(isAddModalOpen || isEditModalOpen) && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest/20 backdrop-blur-sm">
              <div className="bg-white border border-forest/10 w-full max-w-2xl rounded-2xl p-6 shadow-xl relative max-h-[92vh] overflow-y-auto">
                <button
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setIsEditModalOpen(false);
                  }}
                  className="absolute top-5 right-5 text-charcoal-light hover:text-forest"
                >
                  <X size={20} />
                </button>

                <h2 className="font-display text-xl font-bold text-forest mb-1 flex items-center gap-2">
                  <Zap size={20} className="text-solar" />
                  {isAddModalOpen ? 'Create New Solar Microgrid Hub' : 'Edit Solar Hub Specs'}
                </h2>
                <p className="text-xs text-charcoal-light mb-4">
                  Set capacity specs (kW/h), battery storage slots, location via interactive map, and operating schedule.
                </p>

                <form onSubmit={isAddModalOpen ? handleCreateSubmit : handleEditSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-charcoal-light mb-1">Hub Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Kurunegala Hub 1"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-forest/20 rounded-xl focus:outline-none focus:border-forest text-sm bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-charcoal-light mb-1">Hub Code</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. MG-KUR-001"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        className="w-full px-3 py-2 border border-forest/20 rounded-xl focus:outline-none focus:border-forest text-sm bg-white"
                      />
                    </div>
                  </div>

                  {/* Interactive OpenStreetMap Picker */}
                  <div className="p-3 bg-cream/40 rounded-xl border border-forest/10">
                    <LocationPickerMap
                      lat={formData.lat}
                      lng={formData.lng}
                      onChange={(newLat, newLng) => setFormData({ ...formData, lat: newLat, lng: newLng })}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-charcoal-light mb-1">Latitude (GPS)</label>
                      <input
                        type="number"
                        step="any"
                        required
                        value={formData.lat}
                        onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                        className="w-full px-3 py-2 border border-forest/20 rounded-xl focus:outline-none focus:border-forest text-sm bg-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-charcoal-light mb-1">Longitude (GPS)</label>
                      <input
                        type="number"
                        step="any"
                        required
                        value={formData.lng}
                        onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                        className="w-full px-3 py-2 border border-forest/20 rounded-xl focus:outline-none focus:border-forest text-sm bg-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-charcoal-light mb-1">Capacity (kW/h)</label>
                      <input
                        type="number"
                        required
                        value={formData.capacityKW}
                        onChange={(e) => setFormData({ ...formData, capacityKW: e.target.value })}
                        className="w-full px-3 py-2 border border-forest/20 rounded-xl focus:outline-none focus:border-forest text-sm bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-charcoal-light mb-1">Battery Total Slots</label>
                      <input
                        type="number"
                        required
                        value={formData.totalSlots}
                        onChange={(e) => setFormData({ ...formData, totalSlots: e.target.value })}
                        className="w-full px-3 py-2 border border-forest/20 rounded-xl focus:outline-none focus:border-forest text-sm bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-charcoal-light mb-1">Slot Cap (kWh)</label>
                      <input
                        type="number"
                        step="any"
                        required
                        value={formData.slotCapacityKWh}
                        onChange={(e) => setFormData({ ...formData, slotCapacityKWh: e.target.value })}
                        className="w-full px-3 py-2 border border-forest/20 rounded-xl focus:outline-none focus:border-forest text-sm bg-white"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="block text-xs font-medium text-charcoal-light mb-1">Operating Hours Schedule</label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[11px] text-charcoal-light">Open Time</span>
                        <input
                          type="time"
                          value={formData.openTime}
                          onChange={(e) => setFormData({ ...formData, openTime: e.target.value })}
                          className="w-full px-3 py-2 border border-forest/20 rounded-xl focus:outline-none focus:border-forest text-sm bg-white"
                        />
                      </div>
                      <div>
                        <span className="text-[11px] text-charcoal-light">Close Time</span>
                        <input
                          type="time"
                          value={formData.closeTime}
                          onChange={(e) => setFormData({ ...formData, closeTime: e.target.value })}
                          className="w-full px-3 py-2 border border-forest/20 rounded-xl focus:outline-none focus:border-forest text-sm bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-forest/10">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddModalOpen(false);
                        setIsEditModalOpen(false);
                      }}
                      className="px-4 py-2 border border-forest/20 rounded-xl text-xs font-medium text-charcoal-light hover:bg-forest/5"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-5 py-2 bg-forest hover:bg-forest-light text-white rounded-xl text-xs font-medium shadow-sm transition-colors"
                    >
                      {submitting ? 'Saving...' : isAddModalOpen ? 'Create Solar Hub' : 'Update Specs'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Deactivate Confirmation Modal */}
          {isDeactivateModalOpen && selectedNode && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest/20 backdrop-blur-sm">
              <div className="bg-white border border-forest/10 w-full max-w-md rounded-2xl p-6 shadow-xl relative">
                <button
                  onClick={() => setIsDeactivateModalOpen(false)}
                  className="absolute top-5 right-5 text-charcoal-light hover:text-forest"
                >
                  <X size={20} />
                </button>

                <div className="flex items-center gap-3 text-red-600 mb-3">
                  <AlertTriangle size={24} />
                  <h3 className="font-display text-lg font-bold text-forest">Deactivate Solar Node?</h3>
                </div>

                <p className="text-xs text-charcoal mb-4">
                  Are you sure you want to deactivate <strong className="text-forest">{selectedNode.name}</strong> ({selectedNode.code})?
                </p>

                {deactivateError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3.5 rounded-xl mb-4 flex items-start gap-2">
                    <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold">409 Conflict — Deactivation Blocked</strong>
                      {deactivateError}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-3 border-t border-forest/5">
                  <button
                    type="button"
                    onClick={() => setIsDeactivateModalOpen(false)}
                    className="px-4 py-2 border border-forest/20 rounded-xl text-xs font-medium text-charcoal-light hover:bg-forest/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDeactivateConfirm}
                    disabled={submitting}
                    className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-medium shadow-sm transition-colors"
                  >
                    {submitting ? 'Deactivating...' : 'Confirm Deactivate'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default MicrogridNodesPage;
