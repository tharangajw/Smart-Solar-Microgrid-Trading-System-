import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, Battery, User, Map, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const OperatorLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const operator = JSON.parse(localStorage.getItem('operator_user') || '{}');

  const navItems = [
    { name: 'Dashboard', path: '/operator/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Bookings', path: '/operator/bookings', icon: <CalendarDays size={20} /> },
    { name: 'Slot Availability', path: '/operator/slots', icon: <Battery size={20} /> },
    { name: 'Stations Map', path: '/operator/map', icon: <Map size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-charcoal">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex flex-col">
        <div className="p-6 border-b border-gray-100 flex items-center justify-center">
          <h1 className="text-xl font-bold text-teal-600">Grid Operator</h1>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                  isActive 
                    ? 'bg-teal-50 text-teal-700 font-semibold' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center space-x-3 px-4 py-2">
            <div className="bg-gray-200 rounded-full p-2">
              <User size={20} className="text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium">{operator.fullName || 'Operator Account'}</p>
              <p className="text-xs text-gray-500">{operator.email || 'Grid Operator'}</p>
            </div>
          </div>
          <button onClick={() => { localStorage.removeItem('operator_token'); localStorage.removeItem('operator_user'); navigate('/operator/login'); }} className="mt-3 flex w-full items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"><LogOut size={18} /> Log out</button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default OperatorLayout;
