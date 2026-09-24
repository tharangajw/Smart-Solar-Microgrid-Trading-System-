import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#hero' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Microgrid Stations', href: '#stations' },
    { name: 'About', href: '#mission' },
  ];

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLoginClick = () => {
    navigate('/dashboard');
  };

  return (
    <nav 
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'nav-scrolled py-3 bg-white/90 backdrop-blur-md shadow-sm' : 'bg-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        
        {/* Left: Logo & Brand */}
        <div className="flex items-center gap-2">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="32" height="32" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="text-forest"
          >
            <circle cx="12" cy="12" r="4"></circle>
            <path d="M12 2v2"></path>
            <path d="M12 20v2"></path>
            <path d="m4.93 4.93 1.41 1.41"></path>
            <path d="m17.66 17.66 1.41 1.41"></path>
            <path d="M2 12h2"></path>
            <path d="M20 12h2"></path>
            <path d="m6.34 17.66-1.41 1.41"></path>
            <path d="m19.07 4.93-1.41 1.41"></path>
          </svg>
          <span className="font-display font-semibold text-xl text-forest">SmartSolar</span>
        </div>

        {/* Center/Right: Desktop Nav */}
        <div className="hidden lg:flex items-center space-x-8">
          <div className="flex space-x-8">
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href} 
                className="text-charcoal-light hover:text-forest transition-colors text-sm font-medium tracking-wide uppercase"
              >
                {link.name}
              </a>
            ))}
          </div>
          <button 
            onClick={handleLoginClick}
            className="border border-forest text-forest hover:bg-forest hover:text-ivory rounded-full px-6 py-2 text-sm font-medium transition-all duration-300"
          >
            Login
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="lg:hidden">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-forest focus:outline-none"
            aria-label="Toggle menu"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              {isMobileMenuOpen ? (
                <>
                  <path d="M18 6 6 18"></path>
                  <path d="m6 6 12 12"></path>
                </>
              ) : (
                <>
                  <line x1="4" x2="20" y1="12" y2="12"></line>
                  <line x1="4" x2="20" y1="6" y2="6"></line>
                  <line x1="4" x2="20" y1="18" y2="18"></line>
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      <div 
        className={`lg:hidden absolute top-full left-0 w-full bg-ivory shadow-lg overflow-hidden transition-all duration-300 ${
          isMobileMenuOpen ? 'max-h-[400px] border-t border-forest/10' : 'max-h-0'
        }`}
      >
        <div className="px-6 py-4 flex flex-col space-y-4">
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              href={link.href}
              onClick={handleLinkClick}
              className="text-charcoal hover:text-forest transition-colors text-sm font-medium tracking-wide uppercase py-2"
            >
              {link.name}
            </a>
          ))}
          <button 
            onClick={handleLoginClick}
            className="border border-forest text-forest hover:bg-forest hover:text-ivory rounded-full px-6 py-2 text-sm font-medium transition-all duration-300 w-fit mt-4"
          >
            Login
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
