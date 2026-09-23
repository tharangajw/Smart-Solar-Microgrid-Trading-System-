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
            <img 
              src="/Infrastructure.png" 
              alt="Microgrid Infrastructure" 
              className="w-full max-w-md h-auto rounded-xl shadow-lg border border-forest-light/20" 
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default StationHighlight;
