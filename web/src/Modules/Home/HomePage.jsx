import React from 'react';
import Navbar from '../../Components/Navbar';
import HeroSection from '../../Components/HeroSection';
import FeaturesSection from '../../Components/FeaturesSection';
import HowItWorks from '../../Components/HowItWorks';
import ImpactStats from '../../Components/ImpactStats';
import StationHighlight from '../../Components/StationHighlight';
import EnergyConnection from '../../Components/EnergyConnection';
import MissionSection from '../../Components/MissionSection';
import CallToAction from '../../Components/CallToAction';
import Footer from '../../Components/Footer';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-ivory font-sans text-charcoal">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorks />
        <ImpactStats />
        <StationHighlight />
        <EnergyConnection />
        <MissionSection />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
