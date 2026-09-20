import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import DashboardHeader from './components/DashboardHeader';
import SummaryCard from './components/SummaryCard';
import { Users, BatteryCharging, CalendarCheck, Zap } from 'lucide-react';

const DashboardPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-ivory font-sans text-charcoal overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <div className="flex-1 flex flex-col h-full overflow-y-auto overflow-x-hidden">
        <DashboardHeader onMenuClick={toggleSidebar} />
        
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
                  <button className="text-sm font-medium text-sage hover:text-forest transition-colors">
                    View All
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-charcoal-light uppercase bg-forest/5 border-b border-forest/10 rounded-t-lg">
                      <tr>
                        <th className="px-4 py-3 rounded-tl-lg font-medium">User</th>
                        <th className="px-4 py-3 font-medium">Station</th>
                        <th className="px-4 py-3 font-medium">Time Slot</th>
                        <th className="px-4 py-3 rounded-tr-lg font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-forest/5 hover:bg-forest/5/50 transition-colors">
                        <td className="px-4 py-3 font-medium text-charcoal">Alex M.</td>
                        <td className="px-4 py-3 text-charcoal-light">North Campus Solar</td>
                        <td className="px-4 py-3 text-charcoal-light">09:00 - 10:00 AM</td>
                        <td className="px-4 py-3">
                          <span className="bg-leaf/20 text-forest-light px-2 py-1 rounded-md text-xs font-medium">Completed</span>
                        </td>
                      </tr>
                      <tr className="border-b border-forest/5 hover:bg-forest/5/50 transition-colors">
                        <td className="px-4 py-3 font-medium text-charcoal">Sarah J.</td>
                        <td className="px-4 py-3 text-charcoal-light">Library Hub</td>
                        <td className="px-4 py-3 text-charcoal-light">11:30 - 12:30 PM</td>
                        <td className="px-4 py-3">
                          <span className="bg-solar/20 text-solar-dark px-2 py-1 rounded-md text-xs font-medium text-yellow-700">Active</span>
                        </td>
                      </tr>
                      <tr className="border-b border-forest/5 hover:bg-forest/5/50 transition-colors">
                        <td className="px-4 py-3 font-medium text-charcoal">Michael T.</td>
                        <td className="px-4 py-3 text-charcoal-light">Engineering Bldg</td>
                        <td className="px-4 py-3 text-charcoal-light">02:00 - 04:00 PM</td>
                        <td className="px-4 py-3">
                          <span className="bg-gray-100 text-charcoal-light px-2 py-1 rounded-md text-xs font-medium">Pending</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Energy Slot Availability */}
              <section className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-forest/5">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-lg font-semibold text-forest">Energy Slot Overview</h2>
                  <button className="text-sm font-medium text-sage hover:text-forest transition-colors">
                    Manage
                  </button>
                </div>
                
                <div className="h-48 flex items-center justify-center bg-ivory/50 rounded-xl border border-dashed border-forest/20 text-charcoal-light text-sm">
                  [Energy Availability Chart Placeholder]
                </div>
              </section>

            </div>

            {/* Right Column */}
            <div className="space-y-6 lg:space-y-8">
              
              {/* Station Status */}
              <section className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-forest/5">
                <h2 className="font-display text-lg font-semibold text-forest mb-6">Microgrid Status</h2>
                
                <div className="space-y-4">
                  {[
                    { name: 'North Campus Solar', capacity: '85%', status: 'optimal' },
                    { name: 'Library Hub', capacity: '42%', status: 'warning' },
                    { name: 'Engineering Bldg', capacity: '98%', status: 'optimal' },
                  ].map((station, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-forest/5 transition-colors border border-transparent hover:border-forest/10">
                      <div>
                        <p className="font-medium text-sm text-charcoal">{station.name}</p>
                        <p className="text-xs text-charcoal-light mt-0.5">Capacity: {station.capacity}</p>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${station.status === 'optimal' ? 'bg-leaf' : 'bg-solar'}`}></div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-4 py-2 text-sm font-medium border border-forest/20 rounded-xl text-forest hover:bg-forest hover:text-ivory transition-colors">
                  View All Stations
                </button>
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
    </div>
  );
};

export default DashboardPage;
