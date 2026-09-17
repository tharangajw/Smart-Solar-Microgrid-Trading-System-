import React from 'react';

const EnergyConnection = () => {
  return (
    <section id="energy-connection" className="bg-cream">
      <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28">
        <div className="text-center mb-16">
          <div className="text-solar font-medium text-sm tracking-wider uppercase mb-4">
            The Platform
          </div>
          <h2 className="font-display text-forest text-3xl md:text-4xl leading-tight font-semibold max-w-2xl mx-auto mb-4">
            From Sunlight to Shared Possibility.
          </h2>
          <p className="text-charcoal-light text-base max-w-xl mx-auto">
            A platform that connects every part of the solar energy chain — from the people who generate power to the infrastructure that distributes it.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-6">
          {/* Prosumers */}
          <div className="lg:col-span-5 bg-ivory rounded-2xl p-8 lg:p-10 animate-fade-in-up">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="stroke-forest">
              <circle cx="20" cy="24" r="6" strokeWidth="1.5"/>
              <path d="M20 30V38" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M12 12L14 14" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M20 8V11" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M28 12L26 14" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <h3 className="font-display text-forest text-xl font-semibold mt-5 mb-3">
              Prosumers
            </h3>
            <p className="text-charcoal-light text-sm leading-relaxed">
              People who both produce and consume solar energy. Generate power from your own panels, share surplus with the community, and track your contribution to the local grid.
            </p>
          </div>

          {/* Microgrid Stations */}
          <div className="lg:col-span-4 bg-ivory rounded-2xl p-8 lg:p-10 animate-fade-in-up-d1">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="stroke-forest">
              <rect x="16" y="16" width="8" height="8" strokeWidth="1.5"/>
              <path d="M20 16V8" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="20" cy="8" r="1.5" fill="currentColor"/>
              <path d="M16 24L10 30" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="10" cy="30" r="1.5" fill="currentColor"/>
              <path d="M24 24L30 30" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="30" cy="30" r="1.5" fill="currentColor"/>
            </svg>
            <h3 className="font-display text-forest text-xl font-semibold mt-5 mb-3">
              Microgrid Stations
            </h3>
            <p className="text-charcoal-light text-sm leading-relaxed">
              Local energy infrastructure points that collect, store, and redistribute solar power. Each station manages battery capacity and connects to the broader network.
            </p>
          </div>

          {/* Smart Reservations */}
          <div className="lg:col-span-3 bg-ivory rounded-2xl p-8 lg:p-10 animate-fade-in-up-d2">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="stroke-forest">
              <rect x="8" y="10" width="24" height="22" rx="2" strokeWidth="1.5"/>
              <path d="M8 16H32" strokeWidth="1.5"/>
              <path d="M14 8V12" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M26 8V12" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M16 25L19 28L25 21" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h3 className="font-display text-forest text-xl font-semibold mt-5 mb-3">
              Smart Reservations
            </h3>
            <p className="text-charcoal-light text-sm leading-relaxed">
              Reserve energy time slots at nearby stations. Organized access ensures fair distribution and efficient use of stored solar energy.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EnergyConnection;
