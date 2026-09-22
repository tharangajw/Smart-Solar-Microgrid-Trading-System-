/**
 * OperatorLayout.jsx
 * Shell layout for all Grid Operator pages.
 * Mirrors the User Dashboard design system (forest/ivory theme, Sidebar + Header).
 * Reads the authenticated operator from localStorage and renders a sticky header
 * with a collapsible sidebar for mobile.
 * Author: Member 4 – Operator Product
 */

import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  Battery,
  Map,
  LogOut,
  Menu,
  Bell,
  X,
  Zap,
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard',       path: '/operator/dashboard', icon: LayoutDashboard },
  { name: 'Bookings',        path: '/operator/bookings',  icon: CalendarDays },
  { name: 'Slot Availability', path: '/operator/slots',   icon: Battery },
  { name: 'Stations Map',    path: '/operator/map',       icon: Map },
];

/* ── Sidebar ─────────────────────────────────────────────────────────────── */
const OperatorSidebar = ({ isOpen, setIsOpen, operator, onLogout }) => {
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-forest/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-forest/10 flex flex-col
          transform transition-transform duration-300 ease-in-out
          lg:static lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Brand */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-forest/10 shrink-0">
          <div className="flex items-center gap-2">
            <Zap size={22} className="text-forest" />
            <span className="font-display font-semibold text-lg text-forest">SmartSolar</span>
          </div>
          <button
            className="lg:hidden text-charcoal-light hover:text-forest"
            onClick={() => setIsOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Role badge */}
        <div className="px-5 py-3 shrink-0">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-sage bg-sage/10 px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-sage inline-block" />
            Grid Operator
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-2 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                  ${isActive
                    ? 'bg-forest text-ivory shadow-md shadow-forest/20'
                    : 'text-charcoal-light hover:bg-forest/5 hover:text-forest'
                  }`}
              >
                <Icon size={18} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User profile + logout */}
        <div className="p-4 border-t border-forest/10 shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-solar-soft flex items-center justify-center text-forest font-bold text-sm shadow-sm shrink-0">
              {(operator.fullName || 'GO').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-charcoal truncate">{operator.fullName || 'Grid Operator'}</p>
              <p className="text-xs text-charcoal-light truncate">{operator.email || ''}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-forest border border-forest/20 rounded-xl hover:bg-forest hover:text-ivory transition-colors"
          >
            <LogOut size={15} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

/* ── Header ──────────────────────────────────────────────────────────────── */
const OperatorHeader = ({ onMenuClick, operator }) => (
  <header className="h-16 bg-white/80 backdrop-blur-md border-b border-forest/10 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30 shrink-0">
    <div className="flex items-center gap-4">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 -ml-2 text-charcoal hover:text-forest rounded-lg hover:bg-forest/5 transition-colors"
        aria-label="Open menu"
      >
        <Menu size={24} />
      </button>
      <div>
        <p className="font-display text-xl font-semibold text-forest leading-tight">Operator Dashboard</p>
        <p className="text-xs text-charcoal-light hidden sm:block">Grid Operator Portal — SmartSolar Network</p>
      </div>
    </div>

    <div className="flex items-center gap-3 sm:gap-5">
      <button className="relative p-2 text-charcoal hover:text-forest transition-colors rounded-full hover:bg-forest/5">
        <Bell size={20} />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-solar rounded-full border-2 border-white" />
      </button>
      <div className="flex items-center gap-2 pl-3 sm:pl-5 border-l border-forest/10">
        <div className="w-8 h-8 rounded-full bg-forest text-ivory flex items-center justify-center text-sm font-semibold shadow-sm">
          {(operator.fullName || 'GO').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
        </div>
        <div className="hidden sm:block">
          <p className="text-sm font-medium text-charcoal leading-none">{operator.fullName || 'Grid Operator'}</p>
        </div>
      </div>
    </div>
  </header>
);

/* ── Layout ──────────────────────────────────────────────────────────────── */
const OperatorLayout = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const operator = JSON.parse(localStorage.getItem('operator_user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('operator_token');
    localStorage.removeItem('operator_user');
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-ivory font-sans text-charcoal overflow-hidden">
      <OperatorSidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        operator={operator}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col h-full overflow-y-auto overflow-x-hidden">
        <OperatorHeader
          onMenuClick={() => setIsSidebarOpen(true)}
          operator={operator}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default OperatorLayout;
