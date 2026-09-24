import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function CallToAction() {
  const navigate = useNavigate();

  return (
    <section className="relative py-24 overflow-hidden bg-forest">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-forest via-forest/80 to-transparent"></div>
      
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl font-display font-bold text-ivory mb-6 sm:text-5xl">
          Ready to join the Energy Revolution?
        </h2>
        <p className="text-xl text-sage mb-10 max-w-2xl mx-auto">
          Start generating, sharing, and earning from clean solar energy today. Connect with your local microgrid and become a prosumer.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={() => navigate('/register')}
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold rounded-xl text-forest bg-solar hover:bg-yellow-400 transition-colors shadow-lg hover:shadow-solar/30"
          >
            Get Started Now
            <ArrowRight className="ml-2 w-5 h-5" />
          </button>
          <button 
            onClick={() => navigate('/login')}
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold rounded-xl text-ivory bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 transition-all"
          >
            Sign In to Dashboard
          </button>
        </div>
      </div>
    </section>
  );
}
