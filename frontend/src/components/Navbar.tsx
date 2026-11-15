import React from 'react';
import { Cpu, Database, ExternalLink, Dna } from 'lucide-react';
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
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-10 shadow-xs">
      <div className="flex items-center space-x-3 truncate">
        <h1 className="text-base font-bold text-slate-900 tracking-tight truncate">
          {currentPageTitle}
        </h1>
        {activeSample && (
          <div className="hidden lg:flex items-center space-x-2 pl-3 border-l border-slate-200 text-xs">
            <span className="text-slate-400 font-medium">Active:</span>
            <span className="font-bold text-emerald-700 font-mono bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
              {activeSample.name}
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-emerald-700 font-mono font-bold">{activeSample.tcga_desc}</span>
            <SampleTypeBadge type={activeSample.sample_type} />
          </div>
        )}
      </div>

      <div className="flex items-center space-x-3 shrink-0">
        <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-700 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg font-mono shadow-2xs">
          <Database className="w-3.5 h-3.5 text-emerald-600" />
          <span className="font-semibold text-slate-800">242,036 Curves</span>
          <span className="text-slate-300">|</span>
          <Cpu className="w-3.5 h-3.5 text-emerald-600" />
          <span>HistGB (MAE 1.027)</span>
        </div>

        <a
          href="https://github.com/cancerrxgene"
          target="_blank"
          rel="noreferrer"
          className="flex items-center space-x-1.5 text-xs text-slate-600 hover:text-emerald-700 bg-white hover:bg-emerald-50/50 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors shadow-2xs font-medium"
          title="Sanger Genomics of Drug Sensitivity in Cancer"
        >
          <span>Sanger GDSC2</span>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </a>
      </div>
    </header>
  );
};
