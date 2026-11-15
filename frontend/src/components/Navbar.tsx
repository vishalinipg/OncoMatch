import React from 'react';
import { Cpu, Database, ExternalLink } from 'lucide-react';
import { SampleTypeBadge } from './SampleTypeBadge';

interface NavbarProps {
  currentPageTitle: string;
  activeSample?: {
    sample_id: string;
    name: string;
    sample_type: string;
    tcga_desc: string;
  };
}

export const Navbar: React.FC<NavbarProps> = ({ currentPageTitle, activeSample }) => {
  return (
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-10 shadow-2xs">
      <div className="flex items-center space-x-3 min-w-0 pr-4">
        <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight whitespace-nowrap shrink-0">
          {currentPageTitle}
        </h1>
        {activeSample && (
          <div className="hidden xl:flex items-center space-x-2 pl-3 border-l border-slate-200 text-xs shrink-0">
            <span className="text-slate-400">Active Target:</span>
            <span className="font-bold text-slate-800 font-mono">{activeSample.name}</span>
            <span className="text-slate-300">•</span>
            <span className="text-teal-700 font-mono font-bold bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200 text-[10px]">
              {activeSample.tcga_desc}
            </span>
            <SampleTypeBadge type={activeSample.sample_type} />
          </div>
        )}
      </div>

      <div className="flex items-center space-x-3 shrink-0">
        <div className="hidden md:flex items-center space-x-2 text-xs text-slate-600 bg-slate-50 border border-slate-200/90 px-3 py-1.5 rounded-lg font-mono">
          <Database className="w-3.5 h-3.5 text-teal-600" />
          <span className="font-semibold text-slate-700">242,036 Curves</span>
          <span className="text-slate-300">|</span>
          <Cpu className="w-3.5 h-3.5 text-emerald-600" />
          <span className="font-semibold text-slate-700">HistGB (MAE 1.027)</span>
        </div>

        <a
          href="https://github.com/cancerrxgene"
          target="_blank"
          rel="noreferrer"
          className="flex items-center space-x-1 text-xs text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg transition-colors shadow-2xs font-medium"
          title="Sanger Genomics of Drug Sensitivity in Cancer"
        >
          <span>Sanger GDSC2</span>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </a>
      </div>
    </header>
  );
};
