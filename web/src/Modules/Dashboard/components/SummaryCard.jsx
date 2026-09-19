import React from 'react';

const SummaryCard = ({ title, value, subtitle, icon: Icon, trend, trendValue }) => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-forest/5 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-medium text-charcoal-light mb-1">{title}</p>
          <h3 className="text-2xl font-display font-semibold text-forest">{value}</h3>
        </div>
        <div className="p-3 bg-sage/10 rounded-xl text-sage">
          <Icon size={24} strokeWidth={1.5} />
        </div>
      </div>
      
      <div className="flex items-center gap-2 mt-4">
        {trend === 'up' && (
          <span className="text-xs font-medium text-forest-light bg-leaf/20 px-2 py-1 rounded-md">
            ↑ {trendValue}
          </span>
        )}
        {trend === 'down' && (
          <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-md">
            ↓ {trendValue}
          </span>
        )}
        <span className="text-xs text-charcoal-light">{subtitle}</span>
      </div>
    </div>
  );
};

export default SummaryCard;
