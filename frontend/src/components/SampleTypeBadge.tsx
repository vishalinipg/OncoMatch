import React from 'react';

interface SampleTypeBadgeProps {
  type: string;
}

export const SampleTypeBadge: React.FC<SampleTypeBadgeProps> = ({ type }) => {
  const t = (type || '').toLowerCase();
  
  if (t.includes('organoid')) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-purple-500/15 text-purple-300 border border-purple-500/30">
        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mr-1.5"></span>
        Patient-Derived Organoid
      </span>
    );
  }
  
  if (t.includes('patient-derived')) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-1.5"></span>
        Patient-Derived Cell Line
      </span>
    );
  }

  if (t.includes('established')) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5"></span>
        Established Cell Line
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-500/15 text-slate-300 border border-slate-500/30">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-1.5"></span>
      Exploratory Profile
    </span>
  );
};
