import React from 'react';

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="bg-ivory">
      <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28">
        <div className="text-center mb-16">
          <div className="text-solar font-medium text-sm tracking-wider uppercase mb-4">
            Simple Process
          </div>
          <h2 className="font-display text-forest text-3xl md:text-4xl leading-tight font-semibold">
            How It Works
          </h2>
        </div>

        <div className="grid lg:grid-cols-3 gap-12 lg:gap-16 relative">
          {/* Step 1 */}
          <div className="text-left lg:text-center animate-fade-in-up">
            <span className="font-display text-7xl lg:text-8xl font-light text-solar/20 block mb-4">
              01
            </span>
            <h3 className="font-display text-forest text-xl font-semibold mb-3">
              Discover a Station
            </h3>
            <p className="text-charcoal-light text-sm leading-relaxed max-w-xs mx-auto lg:mx-auto ml-0">
              Browse nearby microgrid stations on the network map. View available capacity, battery storage, and station details.
            </p>
          </div>

          {/* Step 2 */}
          <div className="text-left lg:text-center animate-fade-in-up-d1">
            <span className="font-display text-7xl lg:text-8xl font-light text-solar/20 block mb-4">
              02
            </span>
            <h3 className="font-display text-forest text-xl font-semibold mb-3">
              Reserve an Energy Slot
            </h3>
            <p className="text-charcoal-light text-sm leading-relaxed max-w-xs mx-auto lg:mx-auto ml-0">
              Select a convenient time slot at your preferred station. The system ensures fair access and real-time availability.
            </p>
          </div>

          {/* Step 3 */}
          <div className="text-left lg:text-center animate-fade-in-up-d2">
            <span className="font-display text-7xl lg:text-8xl font-light text-solar/20 block mb-4">
              03
            </span>
            <h3 className="font-display text-forest text-xl font-semibold mb-3">
              Complete Your Transfer
            </h3>
            <p className="text-charcoal-light text-sm leading-relaxed max-w-xs mx-auto lg:mx-auto ml-0">
              Transfer or receive energy through the station. Track your transaction and see your impact on the local grid.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
