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
    <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center space-x-3 truncate">
        <h1 className="text-base font-semibold text-white tracking-wide truncate">
          {currentPageTitle}
        </h1>
        {activeSample && (
          <div className="hidden lg:flex items-center space-x-2 pl-3 border-l border-slate-800 text-xs">
            <span className="text-slate-500">Active:</span>
            <span className="font-semibold text-teal-300 font-mono">{activeSample.name}</span>
            <span className="text-slate-600">•</span>
            <span className="text-teal-400 font-mono font-medium">{activeSample.tcga_desc}</span>
            <SampleTypeBadge type={activeSample.sample_type} />
          </div>
        )}
      </div>

      <div className="flex items-center space-x-3 shrink-0">
        <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-400 bg-slate-950/60 border border-slate-800 px-3 py-1.5 rounded-lg font-mono">
          <Database className="w-3.5 h-3.5 text-teal-400" />
          <span>242,036 Curves</span>
          <span className="text-slate-700">|</span>
          <Cpu className="w-3.5 h-3.5 text-emerald-400" />
          <span>HistGB (MAE 1.027)</span>
        </div>

        <a
          href="https://github.com/cancerrxgene"
          target="_blank"
          rel="noreferrer"
          className="flex items-center space-x-1 text-xs text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 px-2.5 py-1.5 rounded-lg transition-colors"
          title="Sanger Genomics of Drug Sensitivity in Cancer"
        >
          <span>Sanger GDSC2</span>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </a>
      </div>
    </header>
  );
};
