import React from 'react';

interface SensitivityBadgeProps {
  category: string;
}

export const SensitivityBadge: React.FC<SensitivityBadgeProps> = ({ category }) => {
  const cat = (category || '').toLowerCase();

  if (cat === 'sensitive') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-sm">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
        Sensitive
      </span>
    );
  }

  if (cat === 'intermediate') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-semibold bg-teal-50 text-teal-700 border border-teal-300 shadow-sm">
        <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mr-1.5"></span>
        Intermediate
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-300 shadow-sm">
      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5"></span>
      Resistant
    </span>
  );
};
