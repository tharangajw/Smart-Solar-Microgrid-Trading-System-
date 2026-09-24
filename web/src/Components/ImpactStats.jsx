import React from 'react';
import { Zap, Users, Leaf, BatteryCharging } from 'lucide-react';

const stats = [
  { id: 1, name: 'Energy Traded', value: '2.5M kWh', icon: Zap },
  { id: 2, name: 'Active Prosumers', value: '1,200+', icon: Users },
  { id: 3, name: 'CO₂ Saved', value: '15,000 kg', icon: Leaf },
  { id: 4, name: 'Microgrids', value: '24', icon: BatteryCharging },
];

export default function ImpactStats() {
  return (
    <section className="py-20 bg-forest text-ivory">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-display font-bold tracking-tight sm:text-4xl">Our Impact So Far</h2>
          <p className="mt-4 text-lg text-sage max-w-2xl mx-auto">
            Together, we are building a more sustainable and resilient energy future.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.id} className="flex flex-col items-center p-6 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors">
              <div className="p-3 bg-solar/20 rounded-full mb-4">
                <stat.icon className="w-8 h-8 text-solar" aria-hidden="true" />
              </div>
              <dd className="text-4xl font-bold tracking-tight mb-2">{stat.value}</dd>
              <dt className="text-sm font-medium text-sage uppercase tracking-wider">{stat.name}</dt>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
