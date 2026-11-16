import React, { useState } from 'react';
import { 
  Cpu, 
  Database, 
  ExternalLink, 
  X, 
  ChevronDown, 
  CheckCircle2, 
  Search,
  Layers,
  ChevronRight,
  ShieldCheck,
  PanelLeftClose,
  PanelLeftOpen,
  FlaskConical
} from 'lucide-react';
import { Sample } from '../types';
import { SampleTypeBadge } from './SampleTypeBadge';

interface NavbarProps {
  currentPageTitle: string;
  samples?: Sample[];
  selectedSampleId?: string;
  onSampleChange?: (id: string) => void;
  activeSample?: Sample;
  onOpenSearch?: () => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  currentPageTitle, 
  samples,
  selectedSampleId,
  onSampleChange,
  activeSample,
  onOpenSearch,
  isSidebarCollapsed,
  onToggleSidebar
}) => {
  const [showSpecs, setShowSpecs] = useState(false);

  return (
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-subtle select-none">
      {/* Left Block: Sidebar Toggle + Brand/Page Title + Active Profile Selector (ALL ON SAME LINE) */}
      <div className="flex items-center space-x-3 min-w-0 pr-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            title={isSidebarCollapsed ? "Expand Sidebar (⌘B)" : "Collapse Sidebar (⌘B)"}
          >
            {isSidebarCollapsed ? (
              <PanelLeftOpen className="w-4 h-4 text-teal-600" />
            ) : (
              <PanelLeftClose className="w-4 h-4 text-slate-500" />
            )}
          </button>
        )}

        {/* When sidebar is collapsed, display the logo icon and OncoMatch name here */}
        {isSidebarCollapsed && (
          <div className="flex items-center space-x-2 shrink-0">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-teal-600 via-teal-500 to-emerald-500 flex items-center justify-center shadow-xs">
              <FlaskConical className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-extrabold text-sm text-slate-900 tracking-tight">OncoMatch</span>
          </div>
        )}

        {/* Breadcrumb Page Title */}
        <div className="flex items-center space-x-1.5 text-xs text-slate-500 shrink-0">
          {!isSidebarCollapsed && (
            <>
              <span className="font-semibold text-slate-400 hover:text-slate-600 transition-colors hidden sm:inline">OncoMatch</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 hidden sm:inline" />
            </>
          )}
          <h1 className="text-sm font-bold text-slate-900 tracking-tight whitespace-nowrap">
            {currentPageTitle}
          </h1>
        </div>

        <div className="h-4 w-px bg-slate-200 shrink-0 hidden sm:block" />

        {/* ACTIVE PROFILE SELECTOR (Placed on the SAME line as Logo & Navigation) */}
        {samples && selectedSampleId && onSampleChange && (
          <div className="flex items-center space-x-2 min-w-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 hidden xl:inline-flex items-center shrink-0">
              <Layers className="w-3.5 h-3.5 mr-1 text-teal-600" /> Active Profile:
            </span>

            <div className="relative inline-flex items-center">
              <select
                value={selectedSampleId}
                onChange={(e) => onSampleChange(e.target.value)}
                title={activeSample ? `${activeSample.name} (${activeSample.tcga_desc})` : ''}
                className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold rounded-lg pl-2.5 pr-6 py-1 text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer transition-colors w-auto max-w-[190px] sm:max-w-[230px] truncate"
              >
                {samples.map((s) => (
                  <option key={s.sample_id} value={s.sample_id}>
                    {s.cell_line_name ? `${s.cell_line_name} (${s.tcga_desc})` : s.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-1.5 pointer-events-none" />
            </div>

            {activeSample && (
              <div className="hidden lg:flex items-center space-x-1.5 text-xs shrink-0">
                <span className="font-mono text-teal-900 bg-teal-50 border border-teal-200/90 px-2 py-0.5 rounded text-[11px] font-bold">
                  {activeSample.tcga_desc}
                </span>
                <SampleTypeBadge type={activeSample.sample_type} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Block: Global Search + Engine Status + Specs + Sanger */}
      <div className="flex items-center space-x-2 sm:space-x-2.5 shrink-0 relative">
        {onOpenSearch && (
          <button
            onClick={onOpenSearch}
            className="flex items-center space-x-2 text-xs text-slate-500 hover:text-slate-800 bg-slate-100/80 hover:bg-slate-100 border border-slate-200/80 px-2.5 py-1.5 rounded-xl transition-all shadow-subtle group cursor-pointer"
            title="Search therapeutics, cell lines, workflows (⌘K)"
          >
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600 transition-colors shrink-0" />
            <span className="hidden xl:inline font-medium">Search therapeutics...</span>
            <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-semibold text-slate-500 bg-white border border-slate-200 rounded-md shrink-0 ml-1">
              ⌘K
            </span>
          </button>
        )}

        {/* Refit Engine Status & Metrics */}
        <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[11px] text-emerald-900 font-medium shrink-0">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold hidden lg:inline">HistGB Refit:</span>
          <span className="font-mono font-bold text-emerald-800">MAE 1.027</span>
          <span className="text-slate-300">•</span>
          <span className="font-mono font-bold text-teal-800">R² 0.759</span>
        </div>

        {/* Model Specs Drawer Toggle */}
        <button
          onClick={() => setShowSpecs(!showSpecs)}
          className={`flex items-center space-x-1.5 text-xs border px-2.5 py-1.5 rounded-xl transition-all font-semibold cursor-pointer ${
            showSpecs 
              ? 'bg-teal-50 border-teal-300 text-teal-900 ring-2 ring-teal-500/20' 
              : 'text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border-slate-200 shadow-2xs'
          }`}
        >
          <Cpu className="w-3.5 h-3.5 text-teal-600" />
          <span className="hidden sm:inline">Model Specs</span>
          <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${showSpecs ? 'rotate-180 text-teal-600' : ''}`} />
        </button>

        {/* External Sanger GDSC2 link */}
        <a
          href="https://www.cancerrxgene.org/"
          target="_blank"
          rel="noreferrer"
          className="hidden sm:flex items-center space-x-1 text-xs text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl transition-all shadow-subtle font-medium shrink-0"
          title="Sanger Genomics of Drug Sensitivity in Cancer"
        >
          <span>GDSC2</span>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </a>

        {/* Model Specs Popover Drawer */}
        {showSpecs && (
          <div className="absolute right-0 top-12 w-88 bg-white border border-slate-200 rounded-2xl shadow-card-hover p-4 z-50 text-xs space-y-3.5 animate-slideDown">
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
      </div>
    </header>
  );
};
