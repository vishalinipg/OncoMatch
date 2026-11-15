import React, { useState } from 'react';
import { Cpu, Database, ExternalLink, X, ChevronDown, CheckCircle2 } from 'lucide-react';
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
  const [showSpecs, setShowSpecs] = useState(false);

  return (
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
      <div className="flex items-center space-x-3 min-w-0 pr-4">
        <h1 className="text-base font-bold text-slate-900 tracking-tight whitespace-nowrap shrink-0">
          {currentPageTitle}
        </h1>
        {activeSample && (
          <div className="hidden lg:flex items-center space-x-2 pl-3 border-l border-slate-200 text-xs shrink-0">
            <span className="text-slate-500 font-medium">Target:</span>
            <span className="font-bold text-slate-900 font-mono">{activeSample.name}</span>
            <span className="text-slate-300">•</span>
            <span className="text-teal-900 font-mono font-bold bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200 text-[10px]">
              {activeSample.tcga_desc}
            </span>
            <SampleTypeBadge type={activeSample.sample_type} />
          </div>
        )}
      </div>

      <div className="flex items-center space-x-3 shrink-0 relative">
        {/* Model Specs Drawer Toggle Button */}
        <button
          onClick={() => setShowSpecs(!showSpecs)}
          className="flex items-center space-x-1.5 text-xs text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors shadow-2xs font-semibold cursor-pointer"
        >
          <Cpu className="w-3.5 h-3.5 text-teal-600" />
          <span>Model Specs</span>
          <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform ${showSpecs ? 'rotate-180' : ''}`} />
        </button>

        {/* Model Specs Popover Drawer */}
        {showSpecs && (
          <div className="absolute right-0 top-11 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 z-50 text-xs space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="font-bold text-slate-900 flex items-center">
                <Database className="w-3.5 h-3.5 mr-1.5 text-teal-600" /> GDSC2 Production Pipeline
              </span>
              <button 
                onClick={() => setShowSpecs(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 font-mono text-[11px]">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                <div className="text-slate-600">Dataset Scope</div>
                <div className="font-bold text-slate-900 text-xs font-sans">
                  242,036 NLME fitted dose-response curves across 969 cell lines and 286 drugs (295 regimens).
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-100 space-y-1">
                <div className="text-emerald-800 font-bold flex items-center">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" /> HistGradientBoosting (Refit)
                </div>
                <div className="text-slate-700">
                  Holdout MAE: <strong className="text-emerald-800">1.0270</strong> (-51.3% vs 2.108 baseline)
                </div>
                <div className="text-slate-700">
                  Holdout Explained R²: <strong className="text-teal-800">0.7585</strong> (75.85%)
                </div>
              </div>
            </div>

            <div className="pt-1 border-t border-slate-100 text-[10px] text-slate-500 leading-relaxed font-sans">
              Strictly excludes leaky curve parameters (AUC/Z-Score). Trained exclusively on pre-exposure chemical and lineage features.
            </div>
          </div>
        )}

        <a
          href="https://github.com/cancerrxgene"
          target="_blank"
          rel="noreferrer"
          className="flex items-center space-x-1 text-xs text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg transition-colors shadow-2xs font-medium"
          title="Sanger Genomics of Drug Sensitivity in Cancer"
        >
          <span>Sanger GDSC2</span>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </a>
      </div>
    </header>
  );
};
