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
  CheckCircle2,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { Sample } from '../types';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  selectedSampleId?: string;
  samples?: Sample[];
  onSampleChange?: (id: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onPageChange,
  isCollapsed = false,
  onToggleCollapse
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: Activity, shortcut: '1' },
    { id: 'setup', label: 'Sample & Analysis Setup', icon: Settings2, shortcut: '2' },
    { id: 'explorer', label: 'Drug & Tissue Explorer', icon: FlaskConical, shortcut: '3' },
    { id: 'prediction', label: 'Drug Response Prediction', icon: Pill, shortcut: '4' },
    { id: 'analytics', label: 'Visual Analytics', icon: BarChart3, shortcut: '5' },
    { id: 'reports', label: 'Personalized Reports', icon: FileText, shortcut: '6' },
  ];

  return (
    <aside 
      className={`bg-white border-r border-slate-200/80 flex flex-col h-screen sticky top-0 select-none z-30 shadow-subtle shrink-0 transition-all duration-200 ${
        isCollapsed ? 'w-18' : 'w-72'
      }`}
    >
      {/* Brand Header */}
      <div className={`p-4 border-b border-slate-100 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 via-teal-500 to-emerald-500 flex items-center justify-center shadow-md shadow-teal-500/20 shrink-0">
            <FlaskConical className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0 truncate">
              <div className="flex items-center space-x-1.5">
                <span className="text-base font-extrabold tracking-tight text-slate-900 truncate">OncoMatch</span>
                <span className="text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200/90 px-1.5 py-0.5 rounded-full">
                  v1.0
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium truncate">Personalized Oncology AI</p>
            </div>
          )}
        </div>

        {!isCollapsed && onToggleCollapse && (
          <button 
            onClick={onToggleCollapse}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
            title="Collapse sidebar to icon rail (⌘B)"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-2.5 py-4 space-y-1.5 overflow-y-auto">
        {!isCollapsed && (
          <div className="text-[10px] font-bold text-slate-400 uppercase px-3 py-1 tracking-wider">
            Workspace
          </div>
        )}
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              title={isCollapsed ? `${item.label} (⌘${item.shortcut})` : undefined}
              className={`w-full flex items-center rounded-xl text-xs font-medium transition-all group cursor-pointer ${
                isCollapsed 
                  ? 'justify-center p-2.5' 
                  : 'justify-between px-3 py-2.5'
              } ${
                isActive
                  ? 'bg-teal-50 text-teal-950 font-bold border border-teal-200/90 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/80 border border-transparent'
              }`}
            >
              <div className="flex items-center space-x-3 min-w-0">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                  isActive ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-400 group-hover:text-slate-700 bg-slate-100'
                }`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </div>
              {!isCollapsed && (
                <span className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded ${
                  isActive ? 'text-teal-700 bg-teal-100/60' : 'text-slate-400 group-hover:text-slate-600'
                }`}>
                  ⌘{item.shortcut}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info & Toggle */}
      <div className="p-3 border-t border-slate-100 text-[11px] text-slate-500 bg-slate-50/60">
        {isCollapsed ? (
          <div className="flex flex-col items-center space-y-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Refit Engine Active (MAE 1.027)" />
            {onToggleCollapse && (
              <button 
                onClick={onToggleCollapse}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/70 transition-colors"
                title="Expand sidebar"
              >
                <PanelLeftOpen className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between font-medium text-[10px]">
              <span>GDSC2 Lines / Regimens</span>
              <span className="font-mono text-slate-800 font-bold">969 / 295</span>
            </div>
            <div className="pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-emerald-800 font-medium">
              <span className="flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                Refit Engine Ready
              </span>
              <span className="font-mono text-slate-500 font-semibold">refit-v1.0</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
