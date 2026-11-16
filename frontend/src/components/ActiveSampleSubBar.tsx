import React from 'react';
import { Layers, ChevronDown, CheckCircle2, Cpu, ShieldCheck, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Sample } from '../types';
import { SampleTypeBadge } from './SampleTypeBadge';

interface ActiveSampleSubBarProps {
  samples: Sample[];
  selectedSampleId: string;
  onSampleChange: (id: string) => void;
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

export const ActiveSampleSubBar: React.FC<ActiveSampleSubBarProps> = ({
  samples,
  selectedSampleId,
  onSampleChange,
  isSidebarCollapsed,
  onToggleSidebar
}) => {
  const activeSample = samples.find(s => s.sample_id === selectedSampleId);

  return (
    <div className="h-11 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-16 z-20 shadow-2xs select-none gap-4 overflow-hidden">
      {/* Left: Sidebar toggle + Active Profile Selector */}
      <div className="flex items-center space-x-2.5 min-w-0 flex-1 overflow-hidden">
        <button
          onClick={onToggleSidebar}
          className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
          title={isSidebarCollapsed ? "Expand Sidebar (240px)" : "Collapse to Icon Rail (Reclaim 180px width)"}
        >
          {isSidebarCollapsed ? (
            <PanelLeftOpen className="w-4 h-4 text-teal-600" />
          ) : (
            <PanelLeftClose className="w-4 h-4 text-slate-500" />
          )}
        </button>

        <div className="h-4 w-px bg-slate-200 hidden sm:block shrink-0" />

        <div className="flex items-center space-x-2 min-w-0">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 hidden md:inline-flex items-center whitespace-nowrap shrink-0">
            <Layers className="w-3.5 h-3.5 mr-1.5 text-teal-600 shrink-0" />
            <span>Active Profile:</span>
          </span>

          <div className="relative inline-flex items-center shrink-0">
            <select
              value={selectedSampleId}
              onChange={(e) => onSampleChange(e.target.value)}
              title={activeSample ? `${activeSample.name} (${activeSample.tcga_desc})` : ''}
              className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold rounded-lg pl-2.5 pr-6 py-1 text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer transition-colors max-w-[170px] sm:max-w-[210px] md:max-w-[240px] truncate"
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
            <div className="flex items-center space-x-2 shrink-0">
              <span className="font-mono text-teal-900 bg-teal-50 border border-teal-200/90 px-2 py-0.5 rounded text-[11px] font-bold shrink-0 whitespace-nowrap">
                {activeSample.tcga_desc}
              </span>
              <div className="hidden xl:inline-flex shrink-0">
                <SampleTypeBadge type={activeSample.sample_type} />
              </div>
              {activeSample.cosmic_id && (
                <span className="hidden 2xl:inline-flex font-mono text-[10px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 shadow-2xs shrink-0 whitespace-nowrap">
                  COSMIC {activeSample.cosmic_id}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right: Refit Engine Specification Pill */}
      <div className="flex items-center space-x-3 shrink-0 text-[11px] ml-auto">
        <div className="hidden sm:flex items-center space-x-1.5 font-mono text-slate-500 shrink-0 whitespace-nowrap">
          <span className="text-slate-400 font-sans">Baseline ln(IC50):</span>
          <span className="font-bold text-slate-800">
            {(activeSample?.baseline_ln_ic50 || 3.255).toFixed(2)}
          </span>
        </div>

        <div className="h-4 w-px bg-slate-200 hidden lg:block shrink-0" />

        <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-900 font-medium shrink-0 whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
          <span className="font-mono font-semibold">Refit Engine:</span>
          <span className="font-mono font-bold text-emerald-800">MAE 1.027</span>
          <span className="text-slate-300">•</span>
          <span className="font-mono font-bold text-teal-800">R² 0.759</span>
        </div>
      </div>
    </div>
  );
};
