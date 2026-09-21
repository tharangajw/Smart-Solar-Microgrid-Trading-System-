import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  BarChart, 
  Bar, 
  Legend 
} from 'recharts';

const hourlyData = [
  { time: '06:00', generation: 12, availableSlots: 15, bookedSlots: 3, battery: 40 },
  { time: '08:00', generation: 45, availableSlots: 22, bookedSlots: 10, battery: 55 },
  { time: '10:00', generation: 85, availableSlots: 30, bookedSlots: 25, battery: 78 },
  { time: '12:00', generation: 120, availableSlots: 38, bookedSlots: 34, battery: 95 },
  { time: '14:00', generation: 110, availableSlots: 35, bookedSlots: 30, battery: 92 },
  { time: '16:00', generation: 70, availableSlots: 28, bookedSlots: 20, battery: 80 },
  { time: '18:00', generation: 25, availableSlots: 18, bookedSlots: 14, battery: 65 },
  { time: '20:00', generation: 5, availableSlots: 10, bookedSlots: 8, battery: 50 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-xl shadow-lg border border-forest/10 text-xs">
        <p className="font-semibold text-forest mb-2">{`Time Slot: ${label}`}</p>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center gap-2 my-1">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-charcoal-light font-medium">{entry.name}:</span>
            <span className="font-bold text-charcoal">{entry.value} {entry.unit || ''}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const EnergyAnalyticsChart = () => {
  const [chartType, setChartType] = useState('area'); // 'area' | 'bar'

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 bg-ivory p-1 rounded-xl border border-forest/10">
          <button
            onClick={() => setChartType('area')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
              chartType === 'area'
                ? 'bg-forest text-ivory shadow-sm'
                : 'text-charcoal-light hover:text-forest'
            }`}
          >
            Solar & Battery Curve
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
              chartType === 'bar'
                ? 'bg-forest text-ivory shadow-sm'
                : 'text-charcoal-light hover:text-forest'
            }`}
          >
            Booked vs Available Slots
          </button>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5 text-forest">
            <span className="w-2.5 h-2.5 rounded-full bg-forest inline-block"></span>
            <span>Generation (kW)</span>
          </div>
          <div className="flex items-center gap-1.5 text-solar">
            <span className="w-2.5 h-2.5 rounded-full bg-solar inline-block"></span>
            <span>Available Slots</span>
          </div>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorGen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1B4D3E" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#1B4D3E" stopOpacity={0.05}/>
                </linearGradient>
                <linearGradient id="colorBat" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F9A826" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#F9A826" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="time" stroke="#718096" fontSize={11} tickLine={false} />
              <YAxis stroke="#718096" fontSize={11} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="generation" 
                name="Generation" 
                unit="kW"
                stroke="#1B4D3E" 
                strokeWidth={2.5}
                fillOpacity={1} 
                fill="url(#colorGen)" 
              />
              <Area 
                type="monotone" 
                dataKey="battery" 
                name="Battery Charge" 
                unit="%"
                stroke="#F9A826" 
                strokeWidth={2.5}
                fillOpacity={1} 
                fill="url(#colorBat)" 
              />
            </AreaChart>
          ) : (
            <BarChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="time" stroke="#718096" fontSize={11} tickLine={false} />
              <YAxis stroke="#718096" fontSize={11} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Bar dataKey="availableSlots" name="Available Slots" fill="#4A7C59" radius={[4, 4, 0, 0]} />
              <Bar dataKey="bookedSlots" name="Booked Slots" fill="#F9A826" radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EnergyAnalyticsChart;
