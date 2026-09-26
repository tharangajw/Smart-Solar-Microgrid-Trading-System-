import React from 'react';
import { Menu, Bell } from 'lucide-react';

const DashboardHeader = ({ onMenuClick }) => {
  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-forest/10 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-charcoal hover:text-forest rounded-lg hover:bg-forest/5 transition-colors"
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>
        <div>
          <h1 className="font-display text-xl font-semibold text-forest leading-tight">Dashboard</h1>
          <p className="text-xs text-charcoal-light hidden sm:block">Welcome back to the SolarLink network.</p>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-5">
        <button className="relative p-2 text-charcoal hover:text-forest transition-colors rounded-full hover:bg-forest/5">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-solar rounded-full border-2 border-white"></span>
        </button>
        
        <div className="flex items-center gap-2 pl-3 sm:pl-5 border-l border-forest/10">
          <div className="w-8 h-8 rounded-full bg-forest text-ivory flex items-center justify-center text-sm font-semibold shadow-sm">
            JD
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-charcoal leading-none">Jane Doe</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
