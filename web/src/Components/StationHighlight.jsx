import React from 'react';

const StationHighlight = () => {
  return (
    <section id="stations" className="bg-forest text-ivory">
      <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left Column - Features */}
          <div className="animate-fade-in-up">
            <div className="text-solar font-medium text-sm tracking-wider uppercase mb-4">
              Infrastructure
            </div>
            <h2 className="font-display text-ivory text-3xl md:text-4xl leading-tight font-semibold mb-6">
              The Microgrid Network
            </h2>
            <p className="text-ivory/70 text-base leading-relaxed mb-10">
              Each station in the SolarLink network is a managed energy hub â€” equipped with solar panels, battery storage, and intelligent scheduling.
            </p>

            <div className="space-y-6">
              {/* Feature 1 */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-ivory/10 flex items-center justify-center flex-shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="stroke-solar stroke-[1.5px]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s-8-9-8-14a8 8 0 1116 0c0 5-8 14-8 14z" />
                    <circle cx="12" cy="7" r="3" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-ivory font-medium text-sm mb-1">Station Locations</h4>
                  <p className="text-ivory/50 text-sm">Find stations near you across the microgrid network.</p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-ivory/10 flex items-center justify-center flex-shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="stroke-solar stroke-[1.5px]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-ivory font-medium text-sm mb-1">Energy Capacity</h4>
                  <p className="text-ivory/50 text-sm">View real-time capacity and output for each station.</p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-ivory/10 flex items-center justify-center flex-shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="stroke-solar stroke-[1.5px]">
                    <rect x="4" y="6" width="16" height="12" rx="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M22 10v4" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 10v4M12 10v4" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-ivory font-medium text-sm mb-1">Battery Storage</h4>
                  <p className="text-ivory/50 text-sm">Monitor available battery slots and charge levels.</p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-ivory/10 flex items-center justify-center flex-shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="stroke-solar stroke-[1.5px]">
                    <rect x="3" y="4" width="18" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 2v4M8 2v4M3 10h18" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 16l2 2 4-4" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-ivory font-medium text-sm mb-1">Availability Scheduling</h4>
                  <p className="text-ivory/50 text-sm">Check open time slots and plan your energy transfers.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - SVG Visualization */}
          <div className="p-8 flex justify-center items-center animate-fade-in-up-d1">
            <svg viewBox="0 0 400 400" className="w-full max-w-md h-auto" xmlns="http://www.w3.org/2000/svg">
              {/* Connections */}
              <line x1="200" y1="200" x2="100" y2="120" className="stroke-ivory/20" strokeWidth="1" />
              <line x1="200" y1="200" x2="300" y2="100" className="stroke-ivory/20" strokeWidth="1" />
              <line x1="200" y1="200" x2="80" y2="280" className="stroke-ivory/20" strokeWidth="1" />
              <line x1="200" y1="200" x2="320" y2="260" className="stroke-ivory/20" strokeWidth="1" />
              <line x1="200" y1="200" x2="220" y2="340" className="stroke-ivory/20" strokeWidth="1" />
              
              <line x1="100" y1="120" x2="300" y2="100" className="stroke-ivory/10" strokeWidth="1" />
              <line x1="80" y1="280" x2="100" y2="120" className="stroke-ivory/10" strokeWidth="1" />
              <line x1="320" y1="260" x2="300" y2="100" className="stroke-ivory/10" strokeWidth="1" />
              <line x1="320" y1="260" x2="220" y2="340" className="stroke-ivory/10" strokeWidth="1" />

              {/* Nodes */}
              {/* Central Hub */}
              <circle cx="200" cy="200" r="14" fill="#D4A843" className="animate-pulse-node" />
              
              {/* Peripheral Nodes */}
              <circle cx="100" cy="120" r="8" fill="#D4A843" className="animate-pulse-node-d1" />
              <text x="70" y="105" fill="#FFFBF0" fillOpacity="0.4" fontSize="10" fontFamily="DM Sans, sans-serif">Station A</text>

              <circle cx="300" cy="100" r="9" fill="#D4A843" className="animate-pulse-node-d2" />
              <text x="315" y="105" fill="#FFFBF0" fillOpacity="0.4" fontSize="10" fontFamily="DM Sans, sans-serif">Station B</text>

              <circle cx="80" cy="280" r="10" fill="#D4A843" className="animate-pulse-node-d3" />
              
              <circle cx="320" cy="260" r="8" fill="#D4A843" className="animate-pulse-node-d1" />
              <text x="335" y="265" fill="#FFFBF0" fillOpacity="0.4" fontSize="10" fontFamily="DM Sans, sans-serif">Station C</text>

              <circle cx="220" cy="340" r="9" fill="#D4A843" className="animate-pulse-node-d2" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StationHighlight;
