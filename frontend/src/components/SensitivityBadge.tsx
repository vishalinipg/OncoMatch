import React from 'react';

interface SensitivityBadgeProps {
  category: string;
}

export const SensitivityBadge: React.FC<SensitivityBadgeProps> = ({ category }) => {
  const cat = (category || '').toLowerCase();

  if (cat === 'sensitive') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1.5"></span>
        Sensitive
      </span>
    );
  }

  if (cat === 'intermediate') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-cyan-50 text-cyan-900 border border-cyan-200">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-600 mr-1.5"></span>
        Intermediate
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
      <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mr-1.5"></span>
      Resistant
    </span>
  );
};
