import React from 'react';
import heroImage from '../assets/hero-solar.png';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section id="hero" className="bg-ivory">
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-20 lg:pt-40 lg:pb-28">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left column */}
          <div>
            <div className="inline-block text-sage bg-sage/10 px-4 py-1.5 rounded-full text-xs font-medium tracking-wider uppercase mb-6">
              Solar Microgrid Platform
            </div>
            <h1 className="font-display text-forest text-4xl md:text-5xl lg:text-[3.5rem] leading-[1.1] tracking-tight font-semibold mb-6 animate-fade-in-up">
              A Smarter Way to Share Solar Energy.
            </h1>
            <p className="text-charcoal-light text-lg leading-relaxed max-w-lg mb-10 animate-fade-in-up-d1">
              Connecting prosumers, microgrid stations, and clean energy through one intelligent platform.
            </p>
            <div className="flex gap-4 flex-wrap animate-fade-in-up-d2">
              <a href="#" className="inline-flex items-center bg-forest text-ivory px-8 py-3.5 rounded-full hover:bg-forest-light transition-colors duration-300 font-medium text-sm tracking-wide">
                Explore the Network
              </a>
              <button 
                onClick={() => navigate('/backoffice/login')}
                className="inline-flex items-center border-2 border-forest/20 text-forest px-8 py-3.5 rounded-full hover:border-forest hover:bg-forest hover:text-ivory transition-all duration-300 font-medium text-sm tracking-wide"
              >
                Access Your Account
              </button>
            </div>
          </div>

          {/* Right column */}
          <div className="relative animate-fade-in">
            <img 
              src={heroImage} 
              alt="Solar microgrid in a tropical community" 
              className="w-full rounded-2xl shadow-xl" 
            />
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-solar/15 rounded-full -z-10 blur-2xl"></div>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
