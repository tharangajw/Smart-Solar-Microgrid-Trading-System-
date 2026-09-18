import React from 'react';
import Navbar from '../../Components/Navbar';
import HeroSection from '../../Components/HeroSection';
import HowItWorks from '../../Components/HowItWorks';
import StationHighlight from '../../Components/StationHighlight';
import EnergyConnection from '../../Components/EnergyConnection';
import MissionSection from '../../Components/MissionSection';
import Footer from '../../Components/Footer';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-ivory font-sans text-charcoal">
      <Navbar />
      <main>
        <HeroSection />
        <HowItWorks />
        <StationHighlight />
        <EnergyConnection />
        <MissionSection />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
