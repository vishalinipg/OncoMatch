import React from 'react';

interface SensitivityBadgeProps {
  category: string;
}

export const SensitivityBadge: React.FC<SensitivityBadgeProps> = ({ category }) => {
  const cat = (category || '').toLowerCase();

  if (cat === 'sensitive') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5"></span>
        Sensitive
      </span>
    );
  }

  if (cat === 'intermediate') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mr-1.5"></span>
        Intermediate
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mr-1.5"></span>
      Resistant
    </span>
  );
};
