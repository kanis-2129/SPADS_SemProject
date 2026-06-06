import React from 'react';

const StatCard = ({ icon, label, value, color, trend }) => (
  <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-2xl bg-slate-50 group-hover:scale-110 transition-transform duration-300 ${color}`}>
        {icon}
      </div>
      {trend && (
        <span className="text-[10px] font-bold px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg">
          +{trend}%
        </span>
      )}
    </div>
    
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">
        {label}
      </p>
      <h2 className="text-3xl font-black text-slate-800 tracking-tight">
        {value}
      </h2>
    </div>

    {/* Subtle Progress Bar for Visual Polish */}
    <div className="mt-4 h-1 w-full bg-slate-50 rounded-full overflow-hidden">
      <div className={`h-full opacity-20 ${color.replace('text-', 'bg-')}`} style={{ width: '60%' }}></div>
    </div>
  </div>
);

export default StatCard;