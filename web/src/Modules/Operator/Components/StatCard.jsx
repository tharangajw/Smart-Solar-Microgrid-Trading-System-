import React from 'react';

const StatCard = ({ title, value, icon, bgColor = "bg-white/70", textColor = "text-teal-600" }) => {
  return (
    <div className={`group relative overflow-hidden p-6 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/60 backdrop-blur-xl ${bgColor} hover:-translate-y-1`}>
      <div className="absolute top-0 right-0 -mr-12 -mt-12 w-40 h-40 rounded-full bg-gradient-to-br from-white/60 to-transparent opacity-60 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
      
      <div className="relative z-10 flex items-center space-x-5">
        <div className={`p-4 rounded-2xl shadow-inner bg-gradient-to-br from-white to-slate-50 border border-white/80 ${textColor} group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
          {icon}
        </div>
        <div>
          <h3 className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">{title}</h3>
          <p className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
