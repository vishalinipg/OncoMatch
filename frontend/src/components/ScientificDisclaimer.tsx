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
    <div className={`p-4 rounded-xl border text-xs leading-relaxed ${
      isWarning 
        ? 'bg-amber-950/20 border-amber-500/30 text-amber-200/90' 
        : 'bg-teal-950/20 border-teal-500/30 text-teal-200/90'
    }`}>
      <div className="flex items-center space-x-2 font-semibold mb-1 text-sm">
        {isWarning ? (
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
        ) : (
          <Info className="w-4 h-4 text-teal-400 shrink-0" />
        )}
        <span className={isWarning ? 'text-amber-300' : 'text-teal-300'}>{title}</span>
      </div>
      {children || (
        <p>
          OncoMatch is an exploratory computational oncology tool designed for preclinical and translational cancer research.
          Predicted ln(IC50) values are derived from in-vitro high-throughput screening data (Sanger GDSC2) and must not be used
          for direct patient therapy selection, off-label prescribing, or medical diagnostic decision-making without independent clinical trial validation.
        </p>
      )}
    </div>
  );
};
