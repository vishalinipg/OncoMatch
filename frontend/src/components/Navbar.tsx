import React, { useState } from 'react';
import { 
  Cpu, 
  Database, 
  ExternalLink, 
  X, 
  ChevronDown, 
  CheckCircle2, 
  Search,
  Sparkles,
  Layers,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

interface NavbarProps {
  currentPageTitle: string;
  activeSample?: {
    sample_id: string;
    name: string;
    cell_line_name?: string;
    sample_type: string;
    tcga_desc: string;
  };
  onOpenSearch?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  currentPageTitle, 
  onOpenSearch
}) => {
  const [showSpecs, setShowSpecs] = useState(false);

  return (
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-30 shadow-subtle">
      {/* Breadcrumbs */}
      <div className="flex items-center space-x-3 min-w-0 pr-4">
        <div className="flex items-center space-x-2 text-xs text-slate-400 font-medium">
          <span className="hover:text-slate-600 transition-colors">OncoMatch</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <h1 className="text-sm font-bold text-slate-900 tracking-tight whitespace-nowrap">
            {currentPageTitle}
          </h1>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center space-x-3 shrink-0 relative">
        {/* Global Quick Search Button */}
        {onOpenSearch && (
          <button
            onClick={onOpenSearch}
            className="flex items-center space-x-2 text-xs text-slate-500 hover:text-slate-800 bg-slate-100/80 hover:bg-slate-100 border border-slate-200/80 px-3 py-1.5 rounded-xl transition-all shadow-subtle group cursor-pointer"
            title="Search therapeutics, cell lines, workflows (⌘K)"
          >
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600 transition-colors shrink-0" />
            <span className="hidden md:inline font-medium">Search therapeutics or lines...</span>
            <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-semibold text-slate-500 bg-white border border-slate-200 rounded-md shrink-0 ml-1">
              ⌘K
            </span>
          </button>
        )}

        {/* Real-time Engine Health Indicator */}
        <div className="hidden xl:flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-[11px] text-emerald-800 font-medium">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold">Engine: HistGradientBoosting</span>
          <span className="text-emerald-600/70 font-mono text-[10px]">(30ms)</span>
        </div>

        {/* Model Specs Drawer Toggle Button */}
        <button
          onClick={() => setShowSpecs(!showSpecs)}
          className={`flex items-center space-x-1.5 text-xs border px-3 py-1.5 rounded-xl transition-all shadow-subtle font-semibold cursor-pointer ${
            showSpecs 
              ? 'bg-teal-50 border-teal-300 text-teal-900 ring-2 ring-teal-500/20' 
              : 'text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border-slate-200'
          }`}
        >
          <Cpu className="w-3.5 h-3.5 text-teal-600" />
          <span>Model Specs</span>
          <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${showSpecs ? 'rotate-180 text-teal-600' : ''}`} />
        </button>

        {/* Model Specs Popover Drawer */}
        {showSpecs && (
          <div className="absolute right-0 top-12 w-[340px] sm:w-[380px] bg-white border border-slate-200 rounded-2xl shadow-card-hover p-4 z-50 text-xs space-y-3.5 animate-slideDown">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <Database className="w-4 h-4 text-teal-600" /> GDSC2 Production Pipeline Architecture
              </span>
              <button 
                onClick={() => setShowSpecs(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 font-mono text-[11px]">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="text-slate-500 font-sans font-medium text-[10px] uppercase tracking-wider">Ground-Truth Scope</div>
                <div className="font-bold text-slate-900 text-xs font-sans">
                  242,036 NLME fitted dose-response curves across 969 cancer cell lines and 286 unique drugs (across 295 screening regimens).
                </div>
              </div>

              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-50/80 to-teal-50/50 border border-emerald-200/80 space-y-1.5">
                <div className="text-emerald-900 font-bold flex items-center font-sans text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-600 shrink-0" /> Tuned HistGradientBoosting
                </div>
                <div className="text-slate-700 text-[11px]">
                  Holdout MAE: <strong className="text-emerald-800 font-mono">1.0270</strong> <span className="text-emerald-700 text-[10px] font-sans">(-51.3% vs baseline)</span>
                </div>
                <div className="text-slate-700 text-[11px]">
                  Explained R² Score: <strong className="text-teal-800 font-mono">0.7585</strong> <span className="text-teal-700 text-[10px] font-sans">(75.85%)</span>
                </div>
                <div className="text-slate-700 text-[11px]">
                  80% Residual Interval: <span className="font-mono text-slate-900">[-1.43, +1.48] ln(IC50)</span>
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-[10px] text-slate-600 leading-relaxed font-sans flex items-start gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
              <span>
                Excludes post-hoc leaky curve metrics (AUC/Z-Score). Inference runs exclusively on pre-exposure chemical descriptors, drug targets, and tissue lineage.
              </span>
            </div>
          </div>
        )}

        <a
          href="https://www.cancerrxgene.org/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center space-x-1.5 text-xs text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl transition-all shadow-subtle font-medium"
          title="Sanger Genomics of Drug Sensitivity in Cancer"
        >
          <span className="hidden sm:inline">Sanger GDSC2</span>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </a>
      </div>
    </header>
  );
};
