import React from 'react';

interface SampleTypeBadgeProps {
  type: string;
}

export const SampleTypeBadge: React.FC<SampleTypeBadgeProps> = ({ type }) => {
  const t = (type || '').toLowerCase();
  
  if (t.includes('organoid')) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-200 shadow-sm">
        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mr-1.5"></span>
        Patient-Derived Organoid
      </span>
    );
  }
  
  if (t.includes('patient-derived')) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200 shadow-sm">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
        Patient-Derived Cell Line
      </span>
    );
  }

  if (t.includes('established')) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
        Established Cell Line
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200 shadow-sm">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-500 mr-1.5"></span>
      Exploratory Profile
    </span>
  );
};
