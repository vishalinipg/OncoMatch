import React from 'react';
import { 
  Activity, 
  FlaskConical, 
  Pill, 
  BarChart3, 
  FileText, 
  Settings2, 
  Layers,
  ChevronRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { SampleTypeBadge } from './SampleTypeBadge';
import { Sample } from '../types';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  selectedSampleId: string;
  samples: Sample[];
  onSampleChange: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onPageChange,
  selectedSampleId,
  samples,
  onSampleChange
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: Activity, shortcut: '1' },
    { id: 'setup', label: 'Sample & Analysis Setup', icon: Settings2, shortcut: '2' },
    { id: 'explorer', label: 'Drug & Tissue Explorer', icon: FlaskConical, shortcut: '3' },
    { id: 'prediction', label: 'Drug Response Prediction', icon: Pill, shortcut: '4' },
    { id: 'analytics', label: 'Visual Analytics', icon: BarChart3, shortcut: '5' },
    { id: 'reports', label: 'Personalized Reports', icon: FileText, shortcut: '6' },
  ];

  const activeSample = samples.find(s => s.sample_id === selectedSampleId);

  return (
    <aside className="w-80 bg-white border-r border-slate-200/80 flex flex-col h-screen sticky top-0 select-none z-20 shadow-subtle shrink-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-600 via-teal-500 to-emerald-500 flex items-center justify-center shadow-md shadow-teal-500/25 shrink-0">
            <FlaskConical className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-base font-extrabold tracking-tight text-slate-900">OncoMatch</span>
              <span className="text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200/90 px-1.5 py-0.5 rounded-full">
                v1.0
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium tracking-tight">Personalized Oncology AI</p>
          </div>
        </div>
      </div>

      {/* Global Active Sample Selector Card */}
      <div className="p-3.5 mx-3.5 my-3 bg-gradient-to-b from-slate-50 to-slate-100/60 border border-slate-200/90 rounded-2xl shadow-subtle">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center">
            <Layers className="w-3.5 h-3.5 mr-1.5 text-teal-600" /> Active Target Lineage
          </span>
          <span className="inline-flex items-center text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse"></span>
            Synced
          </span>
        </div>

        <select
          value={selectedSampleId}
          onChange={(e) => onSampleChange(e.target.value)}
          title={activeSample ? `${activeSample.name} (${activeSample.tcga_desc})` : ''}
          className="w-full bg-white border border-slate-200 text-xs rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-subtle font-medium cursor-pointer"
        >
          {samples.map((s) => (
            <option key={s.sample_id} value={s.sample_id}>
              {s.cell_line_name ? `${s.cell_line_name} (${s.tcga_desc})` : s.name}
            </option>
          ))}
        </select>

        {activeSample && (
          <div className="mt-2.5 pt-2 border-t border-slate-200/80 flex items-center justify-between gap-1.5 text-[10px]">
            <span className="font-mono text-teal-900 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md font-bold shrink-0">
              {activeSample.tcga_desc}
            </span>
            <SampleTypeBadge type={activeSample.sample_type} />
          </div>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-1 space-y-1 overflow-y-auto">
        <div className="text-[10px] font-bold text-slate-400 uppercase px-3 py-1.5 tracking-wider">
          Workspace Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group cursor-pointer ${
                isActive
                  ? 'bg-teal-50/90 text-teal-950 font-bold border border-teal-200/90 shadow-subtle'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/80 border border-transparent'
              }`}
            >
              <div className="flex items-center space-x-3 min-w-0">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                  isActive ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-400 group-hover:text-slate-700 bg-slate-100'
                }`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="truncate">{item.label}</span>
              </div>
              <span className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded ${
                isActive ? 'text-teal-700 bg-teal-100/60' : 'text-slate-400 group-hover:text-slate-600'
              }`}>
                ⌘{item.shortcut}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Footer Info & Model Pipeline Health */}
      <div className="p-4 border-t border-slate-100 text-[11px] text-slate-500 space-y-2 bg-slate-50/60">
        <div className="space-y-1">
          <div className="flex items-center justify-between font-medium">
            <span>GDSC2 Screened Lines</span>
            <span className="font-mono text-slate-800 font-bold">969</span>
          </div>
          <div className="flex items-center justify-between font-medium">
            <span>Anticancer Therapeutics</span>
            <span className="font-mono text-slate-800 font-bold">286 (295 Regimens)</span>
          </div>
          <div className="flex items-center justify-between font-medium">
            <span>TCGA Lineages</span>
            <span className="font-mono text-slate-800 font-bold">33</span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-emerald-800 font-medium">
          <span className="flex items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
            Refit Engine Active
          </span>
          <span className="font-mono text-slate-500 font-semibold">MAE 1.027</span>
        </div>
      </div>
    </aside>
  );
};
