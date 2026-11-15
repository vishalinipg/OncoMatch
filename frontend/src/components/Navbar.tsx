import React from 'react';
import { ShieldCheck, Cpu, Database, ExternalLink, HelpCircle, Activity } from 'lucide-react';

interface NavbarProps {
  currentPageTitle: string;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPageTitle }) => {
  return (
    <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center space-x-3">
        <h1 className="text-base font-semibold text-white tracking-wide">
          {currentPageTitle}
        </h1>
        <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
          GDSC2 Refit Active
        </span>
      </div>

      <div className="flex items-center space-x-3">
        <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-400 bg-slate-950/60 border border-slate-800 px-3 py-1.5 rounded-lg">
          <Database className="w-3.5 h-3.5 text-teal-400" />
          <span>242,036 Curves</span>
          <span className="text-slate-600">|</span>
          <Cpu className="w-3.5 h-3.5 text-emerald-400" />
          <span>HistGB (MAE 1.027)</span>
        </div>

        <div className="flex items-center space-x-2">
          <a
            href="https://github.com/cancerrxgene"
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-1 text-xs text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 px-2.5 py-1.5 rounded-lg transition-colors"
          >
            <span>Sanger GDSC2</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
        </div>
      </div>
    </header>
  );
};
