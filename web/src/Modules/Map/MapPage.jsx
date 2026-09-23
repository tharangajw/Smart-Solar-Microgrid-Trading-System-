import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../Dashboard/components/Sidebar';
import DashboardHeader from '../Dashboard/components/DashboardHeader';
import { getNodes } from '../../Services/nodesService';
import { exportToCSV } from '../../Utils/exportUtils';
import { MapPin, Search, Filter, Download, Zap, BatteryCharging, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker default icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Fallback high quality demo stations across Sri Lanka
const DEMO_STATIONS = [
  {
    id: 'demo-cmb',
    name: 'Colombo Central Solar Hub',
    code: 'MG-CMB-01',
    gps: { lat: 6.9271, lng: 79.8612 },
    address: 'Colombo Fort Grid Station, Western Province',
    capacityKW: 150,
    availableKw: 120,
    status: 'ONLINE'
  },
  {
    id: 'demo-kdy',
    name: 'Kandy Hill Microgrid Node',
    code: 'MG-KDY-02',
    gps: { lat: 7.2906, lng: 80.6337 },
    address: 'Peradeniya Energy Hub, Central Province',
    capacityKW: 100,
    availableKw: 75,
    status: 'ONLINE'
  },
  {
    id: 'demo-gle',
    name: 'Galle Coastal Solar Grid',
    code: 'MG-GLE-03',
    gps: { lat: 6.0535, lng: 80.2210 },
    address: 'Galle Fort Coastal Energy Station',
    capacityKW: 80,
    availableKw: 60,
    status: 'ONLINE'
  },
  {
    id: 'demo-krn',
    name: 'Kurunegala Junction Hub',
    code: 'MG-KRN-04',
    gps: { lat: 7.4863, lng: 80.3647 },
    address: 'Kurunegala Town Grid Terminal',
    capacityKW: 120,
    availableKw: 95,
    status: 'MAINTENANCE'
  },
  {
    id: 'demo-jaf',
    name: 'Jaffna North Solar Park',
    code: 'MG-JAF-05',
    gps: { lat: 9.6615, lng: 80.0255 },
    address: 'Jaffna Energy Hub, Northern Province',
    capacityKW: 200,
    availableKw: 160,
    status: 'ONLINE'
  }
];

// Helper functions for safe property extraction
const getStationName = (s) => s.name || s.stationName || s.code || 'Solar Hub';
const getLat = (s) => (s.gps?.lat !== undefined ? s.gps.lat : (s.latitude !== undefined ? s.latitude : s.lat));
const getLng = (s) => (s.gps?.lng !== undefined ? s.gps.lng : (s.longitude !== undefined ? s.longitude : s.lng));
const getCapacity = (s) => s.capacityKW ?? s.capacityKw ?? (s.battery?.totalSlots ? s.battery.totalSlots * (s.battery.slotCapacityKWh || 5) : 50);
const getAvailable = (s) => s.availableKw ?? s.availableKW ?? Math.round(getCapacity(s) * 0.8);
const getStatus = (s) => {
  const raw = (s.status || 'ONLINE').toUpperCase();
  if (raw === 'ACTIVE') return 'ONLINE';
  if (raw === 'INACTIVE') return 'OFFLINE';
  return raw;
};

const MapPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedStation, setSelectedStation] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    try {
      setLoading(true);
      const data = await getNodes();
      if (Array.isArray(data) && data.length > 0) {
        setStations(data);
      } else {
        // Use demo stations if API returns empty array
        setStations(DEMO_STATIONS);
      }
    } catch (err) {
      console.error('Failed to fetch stations for map, falling back to demo stations:', err);
      setStations(DEMO_STATIONS);
    } finally {
      setLoading(false);
    }
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const filteredStations = stations.filter(station => {
    const name = getStationName(station).toLowerCase();
    const address = (station.address || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch = name.includes(query) || address.includes(query);

    const st = getStatus(station);
    const matchesStatus = statusFilter === 'ALL' || st === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExportCSV = () => {
    const exportData = filteredStations.map(s => ({
      ID: s.id,
      StationName: getStationName(s),
      CapacityKW: getCapacity(s),
      AvailableKW: getAvailable(s),
      Status: getStatus(s),
      Latitude: getLat(s),
      Longitude: getLng(s),
      Address: s.address || 'Sri Lanka Grid'
    }));
    exportToCSV(exportData, 'microgrid_stations.csv');
  };

  return (
    <div className="flex h-screen bg-ivory font-sans text-charcoal overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div className="flex-1 flex flex-col h-full overflow-y-auto overflow-x-hidden">
        <DashboardHeader onMenuClick={toggleSidebar} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full flex flex-col gap-6">
          {/* Header section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl font-bold text-forest">Microgrid Station Map</h1>
              <p className="text-sm text-charcoal-light mt-1">
                Explore active solar microgrid nodes across Sri Lanka in real-time
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-forest bg-white border border-forest/20 rounded-xl hover:bg-forest/5 transition-colors shadow-sm"
              >
                <Download size={16} />
                Export CSV
              </button>
              <button
                onClick={() => navigate('/microgrid')}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-forest text-ivory rounded-xl hover:bg-forest/90 transition-colors shadow-sm"
              >
                Manage Stations
              </button>
            </div>
          </div>

          {/* Filter and Search Bar */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-forest/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 w-full">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-light" />
              <input
                type="text"
                placeholder="Search by station name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-ivory/50 border border-forest/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest/30"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter size={18} className="text-forest" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-ivory/50 border border-forest/10 rounded-xl text-sm font-medium text-forest focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="ONLINE">Online</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="OFFLINE">Offline</option>
              </select>
            </div>
          </div>

          {/* Map & List Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[500px]">
            {/* Map Container */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-2 shadow-sm border border-forest/10 relative overflow-hidden h-[500px] lg:h-auto">
              {loading ? (
                <div className="w-full h-full flex items-center justify-center bg-ivory/30 text-forest font-medium">
                  Loading Interactive Map...
                </div>
              ) : (
                <StationMapView 
                  stations={filteredStations} 
                  selectedStation={selectedStation} 
                  setSelectedStation={setSelectedStation}
                />
              )}
            </div>

            {/* Station List Sidebar */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-forest/10 flex flex-col h-[500px] lg:h-auto">
              <h2 className="font-display font-semibold text-forest mb-4 flex items-center justify-between">
                <span>Station Directory ({filteredStations.length})</span>
                <span className="text-xs bg-forest/10 text-forest px-2.5 py-1 rounded-full font-medium">Sri Lanka Grid</span>
              </h2>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {filteredStations.length === 0 ? (
                  <p className="text-sm text-charcoal-light text-center py-8">No stations match your criteria.</p>
                ) : (
                  filteredStations.map(station => {
                    const stName = getStationName(station);
                    const stStatus = getStatus(station);
                    const isSelected = selectedStation?.id === station.id;

                    return (
                      <div
                        key={station.id}
                        onClick={() => setSelectedStation(station)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                          isSelected 
                            ? 'border-forest bg-forest/5 shadow-sm ring-1 ring-forest' 
                            : 'border-forest/10 hover:border-forest/30 bg-ivory/30'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-sm text-forest">{stName}</h3>
                            <p className="text-xs text-charcoal-light flex items-center gap-1 mt-1">
                              <MapPin size={12} className="shrink-0" />
                              {station.address || 'Sri Lanka Microgrid'}
                            </p>
                          </div>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase ${
                            stStatus === 'ONLINE' ? 'bg-leaf/20 text-forest' : 'bg-solar/20 text-yellow-800'
                          }`}>
                            {stStatus}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-forest/10 text-xs">
                          <div>
                            <span className="text-charcoal-light block">Capacity:</span>
                            <span className="font-semibold text-charcoal">{getCapacity(station)} kW</span>
                          </div>
                          <div>
                            <span className="text-charcoal-light block">Available:</span>
                            <span className="font-semibold text-forest">{getAvailable(station)} kW</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

// Internal Map Component using native Leaflet
const StationMapView = ({ stations, selectedStation, setSelectedStation }) => {
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;

    if (!leafletMapRef.current) {
      const initialLat = selectedStation ? getLat(selectedStation) : 7.4863;
      const initialLng = selectedStation ? getLng(selectedStation) : 80.3647;
      const map = L.map(mapRef.current).setView([initialLat, initialLng], 8);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      leafletMapRef.current = map;
    }

    const map = leafletMapRef.current;

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    const markersGroup = [];

    // Add station markers
    stations.forEach((station) => {
      const lat = getLat(station);
      const lng = getLng(station);
      const name = getStationName(station);
      const cap = getCapacity(station);
      const avail = getAvailable(station);
      const st = getStatus(station);

      if (lat !== undefined && lng !== undefined && !isNaN(lat) && !isNaN(lng)) {
        const marker = L.marker([lat, lng]).addTo(map);
        markersGroup.push(marker);

        marker.bindPopup(`
          <div style="font-family: sans-serif; padding: 4px; min-width: 160px;">
            <h4 style="margin: 0 0 4px 0; color: #1B4D3E; font-weight: bold; font-size: 14px;">${name}</h4>
            <p style="margin: 0 0 6px 0; font-size: 11px; color: #4A5568;">${station.address || 'Smart Grid Station'}</p>
            <div style="font-size: 11px; margin-bottom: 6px;">
              <b>Capacity:</b> ${cap} kW<br/>
              <b>Available:</b> ${avail} kW
            </div>
            <div style="font-size: 11px; font-weight: bold; color: ${st === 'ONLINE' ? '#1B4D3E' : '#D69E2E'};">
              Status: ${st}
            </div>
          </div>
        `);

        marker.on('click', () => {
          setSelectedStation(station);
        });

        if (selectedStation?.id === station.id) {
          map.setView([lat, lng], 12);
          marker.openPopup();
        }
      }
    });

    // Invalidate map size so Leaflet renders properly in flex layouts
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

  }, [stations, selectedStation]);

  return <div ref={mapRef} className="w-full h-full rounded-xl z-0" style={{ minHeight: '480px' }} />;
};

export default MapPage;
