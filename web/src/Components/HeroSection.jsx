import React from 'react';
import heroImage from '../assets/hero-solar.png';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section 
      id="hero" 
      className="relative w-full h-screen max-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Solar microgrid in a tropical community" 
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-forest/95 via-forest/80 to-transparent"></div>
        <div className="absolute inset-0 bg-black/20"></div> {/* Extra darkening for text readability */}
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 h-full flex flex-col justify-center pt-20">
        <div className="max-w-2xl">
          <div className="inline-block bg-solar text-forest px-5 py-2 rounded-full text-xs font-bold tracking-widest uppercase mb-8 shadow-sm">
            Solar Microgrid Platform
          </div>
          <h1 className="font-display text-[#ffffff] text-5xl md:text-6xl lg:text-[4rem] leading-[1.1] tracking-tight font-bold mb-6 animate-fade-in-up drop-shadow-lg" style={{ color: 'white' }}>
            A Smarter Way to Share Solar Energy.
          </h1>
          <p className="text-[#ffffff]/90 text-xl leading-relaxed max-w-lg mb-10 animate-fade-in-up-d1 drop-shadow-md" style={{ color: 'white' }}>
            Connecting prosumers, microgrid stations, and clean energy through one intelligent platform.
          </p>
          <div className="flex gap-4 flex-wrap animate-fade-in-up-d2">
            <a href="#how-it-works" className="inline-flex items-center bg-solar text-forest px-8 py-4 rounded-full hover:bg-yellow-400 transition-all duration-300 font-bold text-sm tracking-wide shadow-lg hover:-translate-y-1">
              Explore the Network
            </a>
            <button 
              onClick={() => {
                const backofficeToken = localStorage.getItem('backoffice_token');
                const operatorToken = localStorage.getItem('operator_token');
                const token = localStorage.getItem('token');

                if (backofficeToken) {
                  navigate('/backoffice/dashboard');
                } else if (operatorToken) {
                  navigate('/operator/dashboard');
                } else if (token) {
                  navigate('/dashboard');
                } else {
                  navigate('/login');
                }
              }}
              className="inline-flex items-center border-2 border-[#ffffff] text-[#ffffff] px-8 py-4 rounded-full hover:bg-[#ffffff] hover:text-forest transition-all duration-300 font-bold text-sm tracking-wide backdrop-blur-sm hover:-translate-y-1 shadow-lg"
            >
              Access Your Account
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
