import React from 'react';
import { Shield, Coins, Activity, Smartphone } from 'lucide-react';

const features = [
  {
    name: 'Smart Trading',
    description: 'Automatically buy and sell excess energy at the best rates using our AI-driven algorithm.',
    icon: Activity,
  },
  {
    name: 'Lower Bills',
    description: 'Significantly reduce your monthly electricity costs by utilizing locally generated solar power.',
    icon: Coins,
  },
  {
    name: 'Secure & Transparent',
    description: 'Every transaction is recorded securely, giving you complete visibility into your energy usage and earnings.',
    icon: Shield,
  },
  {
    name: 'Mobile Access',
    description: 'Monitor your solar generation, control slots, and track earnings on the go with our mobile app.',
    icon: Smartphone,
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-display font-bold text-forest sm:text-4xl">Why Choose SolarLink?</h2>
          <p className="mt-4 text-lg text-charcoal-light max-w-2xl mx-auto">
            Experience the future of energy sharing with our innovative platform designed for modern prosumers.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <div key={feature.name} className="relative p-8 bg-ivory rounded-3xl border border-forest/10 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="absolute top-8 left-8">
                <span className="inline-flex items-center justify-center p-3 bg-forest rounded-xl shadow-lg">
                  <feature.icon className="h-6 w-6 text-solar" aria-hidden="true" />
                </span>
              </div>
              <div className="mt-16">
                <h3 className="text-xl font-bold text-forest mb-3">{feature.name}</h3>
                <p className="text-charcoal-light leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
