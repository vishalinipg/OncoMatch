import React from 'react';

interface SensitivityBadgeProps {
  category: string;
}

export const SensitivityBadge: React.FC<SensitivityBadgeProps> = ({ category }) => {
  const cat = (category || '').toLowerCase();

  if (cat === 'sensitive') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#79AC78]/25 text-[#D0E7D2] border border-[#79AC78]/40">
        <span className="w-1.5 h-1.5 rounded-full bg-[#B0D9B1] mr-1.5"></span>
        Sensitive
      </span>
    );
  }

  if (cat === 'intermediate') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#618264]/30 text-[#D0E7D2] border border-[#618264]/50">
        <span className="w-1.5 h-1.5 rounded-full bg-[#79AC78] mr-1.5"></span>
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
