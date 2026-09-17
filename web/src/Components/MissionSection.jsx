import React from 'react';
import missionImage from '../assets/mission-solar.png';

const MissionSection = () => {
  return (
    <section id="mission" className="bg-ivory">
      <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Left column */}
          <div>
            <div className="text-solar font-medium text-sm tracking-wider uppercase mb-4">
              Our Mission
            </div>
            <h2 className="font-display text-forest text-3xl md:text-4xl leading-tight font-semibold mb-6">
              Building a More Connected Energy Future.
            </h2>
            <p className="text-charcoal-light text-base leading-relaxed mb-4">
              SmartSolar brings together solar energy producers, local energy infrastructure, and organized energy access into a single, thoughtfully designed platform. We believe clean energy should be accessible, community-driven, and simple to manage.
            </p>
            <p className="text-charcoal-light text-base leading-relaxed mb-8">
              Built as a university software engineering project, SmartSolar demonstrates how technology can facilitate real connections between prosumers and microgrid stations — making shared solar energy practical and transparent.
            </p>
            <div className="w-16 h-0.5 bg-solar"></div>
          </div>

          {/* Right column */}
          <div>
            <img 
              src={missionImage} 
              alt="Solar panels among tropical greenery" 
              className="w-full rounded-2xl shadow-lg" 
            />
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default MissionSection;
