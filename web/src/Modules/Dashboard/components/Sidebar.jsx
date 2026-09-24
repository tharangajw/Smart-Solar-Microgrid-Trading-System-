import { 
  LayoutDashboard, 
  Users, 
  Zap, 
  BatteryCharging, 
  MapPin,
  Clock, 
  CalendarCheck, 
  ReceiptText, 
  BarChart3, 
  Settings,
  LogOut,
  X
} from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Users', icon: Users, path: '#' },
    { name: 'Prosumers', icon: Zap, path: '#' },
    { name: 'Microgrid Stations', icon: BatteryCharging, path: '/microgrid' },
    { name: 'Station Map', icon: MapPin, path: '/map' },
    { name: 'Energy Slots', icon: Clock, path: '/slots' },
    { name: 'Reservations', icon: CalendarCheck, path: '/reservations' },
    { name: 'Transactions', icon: ReceiptText, path: '#' },
    { name: 'Reports', icon: BarChart3, path: '/reports' },
    { name: 'Settings', icon: Settings, path: '#' },
  ];

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-forest/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-forest/10 transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo Area */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-forest/10 shrink-0">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="SolarLink Logo" className="h-8 w-auto" />
            <span className="font-display font-semibold text-lg text-forest">SolarLink</span>
          </Link>
          <button 
            className="lg:hidden text-charcoal-light hover:text-forest"
            onClick={() => setIsOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/' && item.path !== '#' && location.pathname.startsWith(item.path));
            
            if (item.path === '#') {
              return (
                <div
                  key={item.name}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-charcoal-light/60 cursor-not-allowed"
                >
                  <Icon size={18} />
                  {item.name}
                </div>
              );
            }

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-forest text-ivory shadow-md shadow-forest/20 font-semibold' 
                    : 'text-charcoal-light hover:bg-forest/5 hover:text-forest'
                }`}
              >
                <Icon size={18} />
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-forest/10 shrink-0">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-solar-soft flex items-center justify-center text-forest font-bold shadow-sm">
              JD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-charcoal truncate">Jane Doe</p>
              <p className="text-xs text-charcoal-light truncate">Platform Admin</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-forest border border-forest/20 rounded-xl hover:bg-forest hover:text-ivory transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
