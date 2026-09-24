import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-[#142e24] w-full">
      <div className="max-w-7xl mx-auto px-6 py-16">
        
        {/* Top section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8">
          
          {/* Column 1: Brand & Description */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <img src="/logo_footer.png" alt="SolarLink Logo" className="h-20 w-auto" />
            </div>
            <p className="text-sage text-sm max-w-xs leading-relaxed">
              Connecting prosumers, microgrid stations, and clean energy through one intelligent platform.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="flex flex-col">
            <h3 className="text-ivory text-sm font-semibold uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="flex flex-col space-y-2.5">
              <li>
                <a href="#hero" className="text-sage hover:text-ivory transition-colors text-sm">Home</a>
              </li>
              <li>
                <a href="#how-it-works" className="text-sage hover:text-ivory transition-colors text-sm">How It Works</a>
              </li>
              <li>
                <a href="#stations" className="text-sage hover:text-ivory transition-colors text-sm">Microgrid Stations</a>
              </li>
              <li>
                <a href="#mission" className="text-sage hover:text-ivory transition-colors text-sm">About</a>
              </li>
            </ul>
          </div>

          {/* Column 3: Information */}
          <div className="flex flex-col">
            <h3 className="text-ivory text-sm font-semibold uppercase tracking-wider mb-4">
              Information
            </h3>
            <ul className="flex flex-col space-y-2.5">
              <li className="text-sage text-sm">University Project</li>
              <li className="text-sage text-sm">Software Engineering Module</li>
              <li>
                <a href="mailto:contact@SolarLink.lk" className="text-sage hover:text-solar transition-colors text-sm">
                  contact@SolarLink.lk
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sage/60 text-xs">
            Â© 2025 SolarLink. University Project.
          </p>
          <p className="text-sage/60 text-xs">
            Built with purpose for a sustainable future.
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
