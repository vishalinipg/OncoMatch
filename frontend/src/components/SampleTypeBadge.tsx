import React from 'react';

interface SampleTypeBadgeProps {
  type: string;
}

export const SampleTypeBadge: React.FC<SampleTypeBadgeProps> = ({ type }) => {
  const t = (type || '').toLowerCase();
  
  if (t.includes('organoid')) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-50 text-purple-800 border border-purple-200 whitespace-nowrap shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-purple-600 mr-1.5 shrink-0"></span>
        Patient-Derived Organoid
      </span>
    );
  }
  
  if (t.includes('patient-derived')) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-900 border border-amber-200 whitespace-nowrap shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mr-1.5 shrink-0"></span>
        Patient-Derived Cell Line
      </span>
    );
  }

  if (t.includes('established')) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 whitespace-nowrap shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1.5 shrink-0"></span>
        Established Cell Line
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap shrink-0">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-500 mr-1.5 shrink-0"></span>
      Exploratory Profile
    </span>
  );
};
