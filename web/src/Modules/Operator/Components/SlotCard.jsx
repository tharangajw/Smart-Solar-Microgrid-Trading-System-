import React from 'react';
import StatusBadge from './StatusBadge';

const SlotCard = ({ node, onUpdateSlot }) => {
  return (
    <div className="group relative overflow-hidden bg-white/70 backdrop-blur-xl p-6 rounded-3xl shadow-lg border border-slate-200/50 flex flex-col justify-between hover:shadow-2xl hover:-translate-y-1 transition-all duration-500">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-100/40 to-teal-100/40 rounded-full blur-2xl -z-10 group-hover:scale-150 transition-transform duration-700"></div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">{node.name}</h3>
            <p className="text-sm font-medium text-slate-500 mt-1 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {node.location}
            </p>
          </div>
          <StatusBadge status={node.status} />
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-slate-50/80 backdrop-blur-sm p-4 rounded-2xl text-center border border-slate-100 shadow-inner group-hover:bg-emerald-50/50 transition-colors duration-300">
            <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Available</span>
            <span className="text-2xl font-black text-emerald-600">{node.availableSlots}</span>
          </div>
          <div className="bg-slate-50/80 backdrop-blur-sm p-4 rounded-2xl text-center border border-slate-100 shadow-inner group-hover:bg-slate-100/50 transition-colors duration-300">
            <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total</span>
            <span className="text-2xl font-black text-slate-700">{node.totalSlots}</span>
          </div>
        </div>
      </div>
      
      <button 
        onClick={() => onUpdateSlot(node)}
        className="relative z-10 w-full py-3 px-4 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-xl transition-all duration-300 font-bold shadow-sm hover:shadow-md active:scale-95 border border-emerald-200 hover:border-transparent flex items-center justify-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Update Availability
      </button>
    </div>
  );
};

export default SlotCard;
