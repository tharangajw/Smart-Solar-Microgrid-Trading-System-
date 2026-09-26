import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../Dashboard/components/Sidebar';
import DashboardHeader from '../Dashboard/components/DashboardHeader';
import { exportToCSV } from '../../Utils/exportUtils';
import {
  BarChart3,
  TrendingUp,
  Zap,
  BatteryCharging,
  Leaf,
  Download,
  Printer,
  RefreshCw,
  Calendar,
  Filter,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Sun,
  DollarSign,
  Activity,
  CheckCircle2,
  FileText
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

// --- Sample / Mock Data for Visual Analytics ---
const GENERATION_DATA = [
  { day: 'Mon', generation: 420, consumption: 310, trading: 280 },
  { day: 'Tue', generation: 580, consumption: 410, trading: 390 },
  { day: 'Wed', generation: 640, consumption: 460, trading: 430 },
  { day: 'Thu', generation: 510, consumption: 390, trading: 340 },
  { day: 'Fri', generation: 720, consumption: 510, trading: 480 },
  { day: 'Sat', generation: 810, consumption: 580, trading: 560 },
  { day: 'Sun', generation: 750, consumption: 530, trading: 510 },
];

const HOURLY_PEAK_DATA = [
  { hour: '06:00', outputKw: 15 },
  { hour: '08:00', outputKw: 45 },
  { hour: '10:00', outputKw: 110 },
  { hour: '12:00', outputKw: 165 },
  { hour: '14:00', outputKw: 140 },
  { hour: '16:00', outputKw: 85 },
  { hour: '18:00', outputKw: 25 },
];

const STATION_DISTRIBUTION = [
  { name: 'Colombo Central Hub', value: 38, color: '#1B4D3E' },
  { name: 'Kandy Hill Node', value: 24, color: '#2E7D63' },
  { name: 'Kurunegala Hub', value: 18, color: '#4CAF50' },
  { name: 'Galle Coastal Grid', value: 12, color: '#F5A623' },
  { name: 'Jaffna North Park', value: 8, color: '#8BC34A' },
];

const MOCK_TRADING_REPORTS = [
  { id: 'TRX-1092', date: '2026-09-24 14:30', station: 'Colombo Central Hub', prosumer: 'Sunil Perera', energyKwh: 45, rateLkr: 52, totalLkr: 2340, status: 'COMPLETED' },
  { id: 'TRX-1093', date: '2026-09-24 13:15', station: 'Kandy Hill Node', prosumer: 'Nimal Fernando', energyKwh: 30, rateLkr: 50, totalLkr: 1500, status: 'COMPLETED' },
  { id: 'TRX-1094', date: '2026-09-24 12:45', station: 'Kurunegala Hub', prosumer: 'Kavinda Silva', energyKwh: 60, rateLkr: 54, totalLkr: 3240, status: 'COMPLETED' },
  { id: 'TRX-1095', date: '2026-09-24 11:20', station: 'Galle Coastal Grid', prosumer: 'Mahesh Jayawardena', energyKwh: 25, rateLkr: 48, totalLkr: 1200, status: 'COMPLETED' },
  { id: 'TRX-1096', date: '2026-09-24 10:05', station: 'Jaffna North Park', prosumer: 'T. Rajan', energyKwh: 80, rateLkr: 55, totalLkr: 4400, status: 'COMPLETED' },
  { id: 'TRX-1097', date: '2026-09-23 16:50', station: 'Colombo Central Hub', prosumer: 'Anura Bandara', energyKwh: 50, rateLkr: 52, totalLkr: 2600, status: 'COMPLETED' },
  { id: 'TRX-1098', date: '2026-09-23 15:10', station: 'Kandy Hill Node', prosumer: 'Chathuri Wijesinghe', energyKwh: 35, rateLkr: 50, totalLkr: 1750, status: 'COMPLETED' },
];

const MOCK_STATION_PERFORMANCE = [
  { code: 'MG-CMB-01', name: 'Colombo Central Hub', capacityKw: 150, outputKwh: 1420, slotsUsed: '12 / 15', uptime: '99.9%' },
  { code: 'MG-KDY-02', name: 'Kandy Hill Node', capacityKw: 100, outputKwh: 980, slotsUsed: '8 / 10', uptime: '99.5%' },
  { code: 'MG-KRN-04', name: 'Kurunegala Junction Hub', capacityKw: 120, outputKwh: 1150, slotsUsed: '10 / 12', uptime: '98.7%' },
  { code: 'MG-GLE-03', name: 'Galle Coastal Solar Grid', capacityKw: 80, outputKwh: 760, slotsUsed: '6 / 8', uptime: '99.2%' },
  { code: 'MG-JAF-05', name: 'Jaffna North Solar Park', capacityKw: 200, outputKwh: 1890, slotsUsed: '15 / 20', uptime: '100.0%' },
];

const MOCK_ENVIRONMENTAL_IMPACT = [
  { region: 'Western Province (Colombo)', cleanEnergyKwh: 14200, co2SavedKg: 9940, treesPlanted: 450, greenRating: 'A+' },
  { region: 'Central Province (Kandy)', cleanEnergyKwh: 9800, co2SavedKg: 6860, treesPlanted: 310, greenRating: 'A' },
  { region: 'North Western (Kurunegala)', cleanEnergyKwh: 11500, co2SavedKg: 8050, treesPlanted: 365, greenRating: 'A+' },
  { region: 'Southern Province (Galle)', cleanEnergyKwh: 7600, co2SavedKg: 5320, treesPlanted: 240, greenRating: 'A' },
  { region: 'Northern Province (Jaffna)', cleanEnergyKwh: 18900, co2SavedKg: 13230, treesPlanted: 600, greenRating: 'A+' },
];

const ReportsPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [timeframe, setTimeframe] = useState('7d');
  const [selectedHub, setSelectedHub] = useState('ALL');
  const [activeTab, setActiveTab] = useState('trading');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const isEmbedded = location.pathname.startsWith('/backoffice') || location.pathname.startsWith('/operator');

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const handleExportData = () => {
    if (activeTab === 'trading') {
      const data = MOCK_TRADING_REPORTS.map(r => ({
        TransactionID: r.id,
        Date: r.date,
        StationHub: r.station,
        Prosumer: r.prosumer,
        EnergyKWh: r.energyKwh,
        RateLKR: r.rateLkr,
        TotalLKR: r.totalLkr,
        Status: r.status
      }));
      exportToCSV(data, `microgrid_trading_report_${timeframe}.csv`);
    } else if (activeTab === 'performance') {
      const data = MOCK_STATION_PERFORMANCE.map(p => ({
        Code: p.code,
        StationName: p.name,
        CapacityKW: p.capacityKw,
        OutputKWh: p.outputKwh,
        StorageSlotsUsed: p.slotsUsed,
        UptimePct: p.uptime
      }));
      exportToCSV(data, `station_performance_report_${timeframe}.csv`);
    } else {
      const data = MOCK_ENVIRONMENTAL_IMPACT.map(e => ({
        Region: e.region,
        CleanEnergyKWh: e.cleanEnergyKwh,
        CO2SavedKg: e.co2SavedKg,
        TreesEquivalent: e.treesPlanted,
        GreenRating: e.greenRating
      }));
      exportToCSV(data, `environmental_impact_report_${timeframe}.csv`);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredTradingData = MOCK_TRADING_REPORTS.filter(r => {
    const matchesSearch = r.prosumer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.station.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesHub = selectedHub === 'ALL' || r.station.includes(selectedHub);
    return matchesSearch && matchesHub;
  });

  const mainContent = (
    <div className="flex flex-col gap-6 w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-forest flex items-center gap-2">
            <BarChart3 className="text-solar" size={26} /> Microgrid Analytics & Reports
          </h1>
          <p className="text-sm text-charcoal-light mt-1">
            Comprehensive solar energy trading statistics, station capacity performance, and carbon offset tracking.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRefresh}
            className={`p-2.5 text-forest border border-forest/20 rounded-xl hover:bg-forest/5 transition-colors bg-white ${
              isRefreshing ? 'animate-spin' : ''
            }`}
            title="Refresh Report Data"
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-forest bg-white border border-forest/20 rounded-xl hover:bg-forest/5 transition-colors shadow-2xs"
          >
            <Printer size={15} /> Print Report
          </button>
          <button
            onClick={handleExportData}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-forest text-ivory rounded-xl hover:bg-forest/90 transition-colors shadow-sm"
          >
            <Download size={15} /> Export CSV
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-forest/10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-medium text-charcoal-light flex items-center gap-1 shrink-0 mr-1">
            <Calendar size={14} className="text-forest" /> Timeframe:
          </span>
          {[
            { id: '24h', label: 'Today' },
            { id: '7d', label: 'Last 7 Days' },
            { id: '30d', label: 'Last 30 Days' },
            { id: 'year', label: 'Year to Date' }
          ].map((tf) => (
            <button
              key={tf.id}
              onClick={() => setTimeframe(tf.id)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all shrink-0 ${
                timeframe === tf.id
                  ? 'bg-forest text-white shadow-xs'
                  : 'bg-cream/60 text-charcoal-light hover:bg-forest/10 hover:text-forest'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 bg-ivory border border-forest/15 px-3 py-1.5 rounded-xl text-xs flex-1 md:flex-none">
            <Filter size={14} className="text-forest" />
            <span className="text-charcoal-light">Hub:</span>
            <select
              value={selectedHub}
              onChange={(e) => setSelectedHub(e.target.value)}
              className="bg-transparent text-forest font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Grid Hubs</option>
              <option value="Colombo">Colombo Central</option>
              <option value="Kandy">Kandy Hill</option>
              <option value="Kurunegala">Kurunegala Junction</option>
              <option value="Galle">Galle Coastal</option>
              <option value="Jaffna">Jaffna North</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-forest/10 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-charcoal-light uppercase tracking-wider">Total Energy Traded</p>
            <h3 className="font-display text-2xl font-bold text-forest mt-1">4,430 <span className="text-sm font-normal text-charcoal-light">kWh</span></h3>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-1">
              <ArrowUpRight size={13} /> +14.8% vs last week
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-forest/10 flex items-center justify-center text-forest">
            <Zap size={24} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-forest/10 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-charcoal-light uppercase tracking-wider">Revenue Generated</p>
            <h3 className="font-display text-2xl font-bold text-forest mt-1">LKR 238.4K</h3>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-1">
              <ArrowUpRight size={13} /> +8.2% peer trade growth
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-solar/20 flex items-center justify-center text-amber-800">
            <DollarSign size={24} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-forest/10 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-charcoal-light uppercase tracking-wider">Active Storage Slots</p>
            <h3 className="font-display text-2xl font-bold text-forest mt-1">51 / 65 <span className="text-sm font-normal text-charcoal-light">Slots</span></h3>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-forest mt-1">
              <Activity size={13} /> 78.4% Occupancy
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-leaf/20 flex items-center justify-center text-forest-light">
            <BatteryCharging size={24} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-forest/10 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-charcoal-light uppercase tracking-wider">Carbon Offset</p>
            <h3 className="font-display text-2xl font-bold text-forest mt-1">43.4 <span className="text-sm font-normal text-charcoal-light">Tons CO₂</span></h3>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-1">
              <Leaf size={13} /> ~1,965 Trees Equivalent
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
            <Sun size={24} />
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart: Generation vs Consumption Trend */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-forest/10 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display text-lg font-bold text-forest">Solar Generation & Consumption Trend</h3>
              <p className="text-xs text-charcoal-light">Daily generation vs prosumer trading throughput (kWh)</p>
            </div>
            <span className="text-xs font-semibold bg-forest/10 text-forest px-3 py-1 rounded-full">
              Real-time Analytics
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={GENERATION_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorGen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1B4D3E" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#1B4D3E" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorTrade" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F5A623" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#F5A623" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFF', borderRadius: '12px', borderColor: '#1B4D3E15', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                />
                <Legend iconType="circle" />
                <Area type="monotone" dataKey="generation" name="Solar Gen (kWh)" stroke="#1B4D3E" strokeWidth={2.5} fillOpacity={1} fill="url(#colorGen)" />
                <Area type="monotone" dataKey="trading" name="Traded (kWh)" stroke="#F5A623" strokeWidth={2.5} fillOpacity={1} fill="url(#colorTrade)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart: Station Share */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-forest/10 flex flex-col justify-between">
          <div>
            <h3 className="font-display text-lg font-bold text-forest">Grid Share by Station</h3>
            <p className="text-xs text-charcoal-light mb-4">Percentage of total energy generated per hub</p>

            <div className="h-52 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={STATION_DISTRIBUTION}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {STATION_DISTRIBUTION.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="font-display text-xl font-bold text-forest">100%</span>
                <span className="text-[10px] text-charcoal-light uppercase font-semibold">5 Hubs</span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-forest/10">
            {STATION_DISTRIBUTION.slice(0, 3).map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <span className="text-charcoal font-medium truncate max-w-[140px]">{item.name}</span>
                </div>
                <span className="font-bold text-forest">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hourly Peak Generation Bar Chart */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-forest/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display text-lg font-bold text-forest">Diurnal Solar Output Distribution</h3>
            <p className="text-xs text-charcoal-light">Average kilowatt generation across daylight operational hours</p>
          </div>
          <span className="text-xs font-semibold bg-solar/20 text-amber-900 px-3 py-1 rounded-full">
            Peak at 12:00 PM (165 kW)
          </span>
        </div>

        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={HOURLY_PEAK_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="hour" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#FFF', borderRadius: '10px', borderColor: '#1B4D3E15' }}
              />
              <Bar dataKey="outputKw" name="Output (kW)" fill="#1B4D3E" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabbed Data Reports Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-forest/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-forest/10">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('trading')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'trading'
                  ? 'bg-forest text-white shadow-sm'
                  : 'bg-forest/5 text-charcoal-light hover:bg-forest/10 hover:text-forest'
              }`}
            >
              Trading Transactions Log
            </button>
            <button
              onClick={() => setActiveTab('performance')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'performance'
                  ? 'bg-forest text-white shadow-sm'
                  : 'bg-forest/5 text-charcoal-light hover:bg-forest/10 hover:text-forest'
              }`}
            >
              Station Hub Specs & Uptime
            </button>
            <button
              onClick={() => setActiveTab('environmental')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'environmental'
                  ? 'bg-forest text-white shadow-sm'
                  : 'bg-forest/5 text-charcoal-light hover:bg-forest/10 hover:text-forest'
              }`}
            >
              Sustainability & Carbon Metrics
            </button>
          </div>

          <div className="relative min-w-[220px]">
            <input
              type="text"
              placeholder="Search in report..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-forest/20 rounded-xl text-xs bg-white focus:outline-none focus:border-forest"
            />
            <Search size={14} className="absolute left-3 top-2 text-forest/40" />
          </div>
        </div>

        {/* Tab 1: Trading Transactions Log */}
        {activeTab === 'trading' && (
          <div className="overflow-x-auto pt-4">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-forest/10 text-[11px] font-semibold text-charcoal-light uppercase tracking-wider">
                  <th className="py-3 px-4">Transaction ID</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Station Hub</th>
                  <th className="py-3 px-4">Prosumer</th>
                  <th className="py-3 px-4">Energy (kWh)</th>
                  <th className="py-3 px-4">Rate (LKR/kWh)</th>
                  <th className="py-3 px-4">Total Value</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forest/5 text-xs">
                {filteredTradingData.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-8 text-charcoal-light">No transaction report records found.</td>
                  </tr>
                ) : (
                  filteredTradingData.map((row) => (
                    <tr key={row.id} className="hover:bg-cream/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-forest">{row.id}</td>
                      <td className="py-3 px-4 text-charcoal-light">{row.date}</td>
                      <td className="py-3 px-4 font-semibold text-charcoal">{row.station}</td>
                      <td className="py-3 px-4">{row.prosumer}</td>
                      <td className="py-3 px-4 font-mono font-bold text-forest">{row.energyKwh} kWh</td>
                      <td className="py-3 px-4">LKR {row.rateLkr}</td>
                      <td className="py-3 px-4 font-bold text-forest">LKR {row.totalLkr.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 bg-leaf/20 text-forest font-bold text-[10px] px-2.5 py-0.5 rounded-full border border-leaf/30">
                          <CheckCircle2 size={12} /> {row.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Station Performance */}
        {activeTab === 'performance' && (
          <div className="overflow-x-auto pt-4">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-forest/10 text-[11px] font-semibold text-charcoal-light uppercase tracking-wider">
                  <th className="py-3 px-4">Station Code</th>
                  <th className="py-3 px-4">Station Name</th>
                  <th className="py-3 px-4">Installed Capacity</th>
                  <th className="py-3 px-4">Solar Output</th>
                  <th className="py-3 px-4">Storage Slots Occupied</th>
                  <th className="py-3 px-4">Grid Uptime</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forest/5 text-xs">
                {MOCK_STATION_PERFORMANCE.map((st) => (
                  <tr key={st.code} className="hover:bg-cream/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-forest">{st.code}</td>
                    <td className="py-3 px-4 font-semibold text-charcoal">{st.name}</td>
                    <td className="py-3 px-4 font-mono">{st.capacityKw} kW</td>
                    <td className="py-3 px-4 font-bold text-forest">{st.outputKwh} kWh</td>
                    <td className="py-3 px-4 font-semibold">{st.slotsUsed}</td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                        {st.uptime}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Environmental Impact */}
        {activeTab === 'environmental' && (
          <div className="overflow-x-auto pt-4">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-forest/10 text-[11px] font-semibold text-charcoal-light uppercase tracking-wider">
                  <th className="py-3 px-4">Province / Region</th>
                  <th className="py-3 px-4">Clean Solar Generated</th>
                  <th className="py-3 px-4">CO₂ Displaced (kg)</th>
                  <th className="py-3 px-4">Equivalent Trees Saved</th>
                  <th className="py-3 px-4">Green Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forest/5 text-xs">
                {MOCK_ENVIRONMENTAL_IMPACT.map((env) => (
                  <tr key={env.region} className="hover:bg-cream/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-forest">{env.region}</td>
                    <td className="py-3 px-4 font-mono font-bold text-charcoal">{env.cleanEnergyKwh.toLocaleString()} kWh</td>
                    <td className="py-3 px-4 font-bold text-emerald-700">{env.co2SavedKg.toLocaleString()} kg</td>
                    <td className="py-3 px-4 font-semibold text-charcoal">{env.treesPlanted} Trees</td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-forest bg-forest/10 px-2.5 py-0.5 rounded-md border border-forest/20">
                        {env.greenRating}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  if (isEmbedded) {
    return mainContent;
  }

  return (
    <div className="flex h-screen bg-ivory font-sans text-charcoal overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="flex-1 flex flex-col h-full overflow-y-auto overflow-x-hidden">
        <DashboardHeader onMenuClick={toggleSidebar} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {mainContent}
        </main>
      </div>
    </div>
  );
};

export default ReportsPage;
