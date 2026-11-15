import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';

interface ScientificDisclaimerProps {
  title?: string;
  variant?: 'warning' | 'info';
  children?: React.ReactNode;
}

export const ScientificDisclaimer: React.FC<ScientificDisclaimerProps> = ({
  title = "Scientific & Regulatory Disclaimer",
  variant = 'warning',
  children
}) => {
  const isWarning = variant === 'warning';

  return (
    <div className={`p-4 rounded-xl border text-xs leading-relaxed shadow-sm ${
      isWarning 
        ? 'bg-amber-50/80 border-amber-200 text-amber-900' 
        : 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
    }`}>
      <div className="flex items-center space-x-2 font-semibold mb-1 text-sm">
        {isWarning ? (
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
        ) : (
          <Info className="w-4 h-4 text-emerald-600 shrink-0" />
        )}
        <span className={isWarning ? 'text-amber-900' : 'text-emerald-900'}>{title}</span>
      </div>
      {children || (
        <p className={isWarning ? 'text-amber-800' : 'text-emerald-800'}>
          OncoMatch is an exploratory computational oncology tool designed for preclinical and translational cancer research.
          Predicted ln(IC50) values are derived from in-vitro high-throughput screening data (Sanger GDSC2) and must not be used
          for direct patient therapy selection, off-label prescribing, or medical diagnostic decision-making without independent clinical trial validation.
        </p>
      )}
    </div>
  );
};
