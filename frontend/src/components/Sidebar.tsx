import React from 'react';
import { 
  Activity, 
  Dna, 
  Pill, 
  BarChart3, 
  FileText, 
  UploadCloud, 
  Layers
} from 'lucide-react';
import { SampleTypeBadge } from './SampleTypeBadge';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  selectedSampleId: string;
  samples: Array<{ sample_id: string; name: string; sample_type: string; tcga_desc: string }>;
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
    { id: 'dashboard', label: 'Dashboard Overview', icon: Activity },
    { id: 'upload', label: 'Patient Profile & Upload', icon: UploadCloud },
    { id: 'molecular', label: 'Molecular Profile', icon: Dna },
    { id: 'prediction', label: 'Drug Response Prediction', icon: Pill },
    { id: 'analytics', label: 'Visual Analytics (PCA & HMM)', icon: BarChart3 },
    { id: 'reports', label: 'Personalized Reports', icon: FileText },
  ];

  const activeSample = samples.find(s => s.sample_id === selectedSampleId);

  return (
    <aside className="w-72 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 select-none z-20 shadow-xs shrink-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 flex items-center space-x-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center shadow-sm shadow-teal-500/20 shrink-0">
          <Dna className="w-5 h-5 text-white font-bold" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold tracking-tight text-slate-900">OncoMatch</span>
            <span className="text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200 px-1.5 py-0.5 rounded">v1.0</span>
          </div>
          <p className="text-xs text-slate-600 font-medium">Chemotherapy Response AI</p>
        </div>
      </div>

      {/* Global Active Sample Selector Card (Clean, no redundant counts) */}
      <div className="p-3.5 mx-3 my-3 bg-slate-50 border border-slate-200 rounded-xl">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider flex items-center">
            <Layers className="w-3 h-3 mr-1.5 text-teal-600" /> Active Target Profile
          </span>
        </div>
        <select
          value={selectedSampleId}
          onChange={(e) => onSampleChange(e.target.value)}
          title={activeSample ? `${activeSample.name} (${activeSample.tcga_desc})` : ''}
          className="w-full bg-white border border-slate-300 text-xs rounded-lg px-2.5 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-colors shadow-2xs font-medium cursor-pointer"
        >
          {samples.map((s) => (
            <option key={s.sample_id} value={s.sample_id}>
              {s.name} ({s.tcga_desc})
            </option>
          ))}
        </select>
        {activeSample && (
          <div className="mt-2.5 pt-2 border-t border-slate-200 flex items-center justify-between gap-1.5 text-[10px]">
            <span className="font-mono text-teal-900 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded font-bold shrink-0">
              {activeSample.tcga_desc}
            </span>
            <SampleTypeBadge type={activeSample.sample_type} />
          </div>
        )}
      </div>

      {/* Main Navigation (Clean, no redundant stacked tags) */}
      <nav className="flex-1 px-3 py-1 space-y-1 overflow-y-auto">
        <div className="text-[10px] font-bold text-slate-500 uppercase px-3 py-1.5 tracking-wider">
          Workspace Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all group cursor-pointer ${
                isActive
                  ? 'bg-teal-50/90 text-teal-950 font-bold border border-teal-200 shadow-2xs'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-teal-600' : 'text-slate-500 group-hover:text-slate-700'}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
