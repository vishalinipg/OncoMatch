import React from 'react';
import { 
  Activity, 
  Dna, 
  Pill, 
  BarChart3, 
  FileText, 
  UploadCloud, 
  AlertTriangle,
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
    { id: 'dashboard', label: '1. Dashboard Overview', icon: Activity, badge: 'Overview' },
    { id: 'upload', label: '2. Patient Profile & Upload', icon: UploadCloud, badge: 'Profiles' },
    { id: 'molecular', label: '3. Molecular Profile', icon: Dna, badge: 'L1000' },
    { id: 'prediction', label: '4. Drug Response & Prediction', icon: Pill, badge: 'Core ML' },
    { id: 'analytics', label: '5. Visual Analytics (PCA & HMM)', icon: BarChart3, badge: 'PCA/HMM' },
    { id: 'reports', label: '6. Personalized Reports', icon: FileText, badge: 'PDF Export' },
  ];

  const activeSample = samples.find(s => s.sample_id === selectedSampleId);

  return (
    <aside className="w-72 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 select-none z-20 shadow-sm">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 flex items-center space-x-3 bg-gradient-to-b from-emerald-50/30 to-transparent">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-500/25">
          <Dna className="w-6 h-6 text-white font-bold" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold tracking-tight text-slate-900">OncoMatch</span>
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded">v1.0</span>
          </div>
          <p className="text-xs text-slate-500 font-medium">Chemotherapy Response AI</p>
        </div>
      </div>

      {/* Global Active Sample Selector Card */}
      <div className="p-3.5 mx-3 my-3 bg-emerald-50/50 border border-emerald-100/90 rounded-xl shadow-xs">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider flex items-center">
            <Layers className="w-3 h-3 mr-1 text-emerald-600" /> Active Profile
          </span>
          <span className="text-[10px] text-emerald-700 font-mono font-semibold bg-emerald-100/70 px-1.5 py-0.2 rounded">
            {samples.length} loaded
          </span>
        </div>
        <select
          value={selectedSampleId}
          onChange={(e) => onSampleChange(e.target.value)}
          className="w-full bg-white border border-slate-300 text-xs rounded-lg px-2.5 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-colors shadow-2xs font-medium"
        >
          {samples.map((s) => (
            <option key={s.sample_id} value={s.sample_id}>
              {s.name} ({s.tcga_desc})
            </option>
          ))}
        </select>
        {activeSample && (
          <div className="mt-2 pt-2 border-t border-emerald-200/50 flex items-center justify-between text-[10px]">
            <span className="font-mono text-emerald-700 font-bold bg-white px-1.5 py-0.5 rounded border border-emerald-100">
              {activeSample.tcga_desc}
            </span>
            <SampleTypeBadge type={activeSample.sample_type} />
          </div>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-1 space-y-1 overflow-y-auto">
        <div className="text-[10px] font-bold text-slate-400 uppercase px-3 py-1 tracking-wider">
          Workspace Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-200 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <div className="flex items-center space-x-2.5 truncate">
                <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                isActive 
                  ? 'bg-emerald-200/70 text-emerald-900 font-bold' 
                  : 'bg-slate-100 text-slate-500 group-hover:text-slate-700'
              }`}>
                {item.badge}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Persistent Research Use Disclaimer in Sidebar */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/70">
        <div className="flex items-start space-x-2 text-[10px] text-amber-900 bg-amber-50/90 border border-amber-200/80 rounded-lg p-2.5 shadow-2xs">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600 mt-0.5" />
          <div className="leading-tight">
            <span className="font-bold text-amber-950">Research Use Only.</span> Cell-line predictions do not substitute for clinical diagnostics or therapy guidance.
          </div>
        </div>
      </div>
    </aside>
  );
};
