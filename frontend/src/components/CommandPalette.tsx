import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Pill, Layers, ArrowRight, CornerDownLeft, Sparkles, Activity, FileText, FlaskConical, BarChart3, Settings2 } from 'lucide-react';
import { Sample, Drug, CellLine } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: string) => void;
  samples: Sample[];
  onSelectSample: (sampleId: string) => void;
  drugs: Drug[];
  onSelectDrug?: (drugId: number) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  samples,
  onSelectSample,
  drugs,
  onSelectDrug,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Keyboard navigation & ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, allResults.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (allResults[selectedIndex]) {
          allResults[selectedIndex].action();
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, query]);

  if (!isOpen) return null;

  // Pages
  const pages = [
    { id: 'dashboard', name: 'Dashboard Overview', desc: 'System overview & GDSC2 dataset dimensions', icon: Activity },
    { id: 'setup', name: 'Sample & Analysis Setup', desc: 'Select from 969 cell lines or configure custom isolate', icon: Settings2 },
    { id: 'explorer', name: 'Drug & Tissue Explorer', desc: 'Browse 286 anticancer therapeutics & targets', icon: FlaskConical },
    { id: 'prediction', name: 'Drug Response Prediction', desc: 'Single & batch ln(IC50) inference with 4PL curves', icon: Pill },
    { id: 'analytics', name: 'Visual Analytics', desc: 'Pharmacogenomic PCA & cross-tissue sensitivity heatmap', icon: BarChart3 },
    { id: 'reports', name: 'Personalized Reports', desc: 'Generate clinical PDF dossier & CSV companion data', icon: FileText },
  ];

  const matchedPages = pages
    .filter(p => p.name.toLowerCase().includes(query.toLowerCase()) || p.desc.toLowerCase().includes(query.toLowerCase()))
    .map(p => ({
      type: 'page' as const,
      id: p.id,
      title: p.name,
      subtitle: p.desc,
      icon: p.icon,
      action: () => onNavigate(p.id)
    }));

  // Matched Samples
  const matchedSamples = samples
    .filter(s => 
      s.name.toLowerCase().includes(query.toLowerCase()) || 
      s.tcga_desc.toLowerCase().includes(query.toLowerCase()) ||
      (s.cell_line_name && s.cell_line_name.toLowerCase().includes(query.toLowerCase()))
    )
    .slice(0, 5)
    .map(s => ({
      type: 'sample' as const,
      id: s.sample_id,
      title: s.cell_line_name ? `${s.cell_line_name} (${s.tcga_desc})` : s.name,
      subtitle: `Target Profile • ${s.sample_type}`,
      icon: Layers,
      action: () => {
        onSelectSample(s.sample_id);
        onNavigate('prediction');
      }
    }));

  // Matched Drugs
  const matchedDrugs = drugs
    .filter(d => 
      d.DRUG_NAME.toLowerCase().includes(query.toLowerCase()) ||
      (d.PUTATIVE_TARGET && d.PUTATIVE_TARGET.toLowerCase().includes(query.toLowerCase())) ||
      (d.PATHWAY_NAME && d.PATHWAY_NAME.toLowerCase().includes(query.toLowerCase()))
    )
    .slice(0, 6)
    .map(d => ({
      type: 'drug' as const,
      id: String(d.DRUG_ID),
      title: d.DRUG_NAME,
      subtitle: `${d.PATHWAY_NAME || 'Targeted'} • Target: ${d.PUTATIVE_TARGET || 'Cytotoxic'} • [ID: ${d.DRUG_ID}]`,
      icon: Pill,
      action: () => {
        if (onSelectDrug) onSelectDrug(d.DRUG_ID);
        onNavigate('prediction');
      }
    }));

  const allResults = [...matchedPages, ...matchedSamples, ...matchedDrugs];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-24 px-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      {/* Backdrop click to close */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Palette Card */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10 flex flex-col max-h-[80vh] animate-slideDown">
        {/* Search Header */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
          <Search className="w-5 h-5 text-teal-600 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search drugs, cell lines, molecular targets, or pages..."
            className="w-full bg-transparent text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono font-semibold text-slate-400 bg-white border border-slate-200 rounded-md shadow-2xs">
            ESC
          </kbd>
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {allResults.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No matching pages, therapeutics, or cell lines found for "{query}".
            </div>
          ) : (
            allResults.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={`${item.type}-${item.id}`}
                  onClick={() => {
                    item.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-teal-50/90 text-teal-950 border border-teal-200 shadow-2xs'
                      : 'hover:bg-slate-50 text-slate-700 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      item.type === 'drug'
                        ? 'bg-emerald-100/70 text-emerald-700'
                        : item.type === 'sample'
                        ? 'bg-teal-100/70 text-teal-700'
                        : 'bg-indigo-100/70 text-indigo-700'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold text-slate-900 truncate flex items-center gap-2">
                        <span>{item.title}</span>
                        {item.type === 'page' && (
                          <span className="text-[10px] font-mono text-slate-400 font-normal px-1.5 py-0.2 bg-slate-100 rounded">
                            Page
                          </span>
                        )}
                        {item.type === 'drug' && (
                          <span className="text-[10px] font-mono text-emerald-700 font-semibold px-1.5 py-0.2 bg-emerald-50 border border-emerald-200 rounded">
                            Drug
                          </span>
                        )}
                        {item.type === 'sample' && (
                          <span className="text-[10px] font-mono text-teal-700 font-semibold px-1.5 py-0.2 bg-teal-50 border border-teal-200 rounded">
                            Profile
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">
                        {item.subtitle}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center text-xs text-slate-400 gap-1 pl-3 shrink-0">
                    {isSelected && (
                      <span className="flex items-center text-[11px] text-teal-600 font-semibold">
                        Select <CornerDownLeft className="w-3 h-3 ml-1" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono text-slate-500 font-semibold shadow-2xs">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono text-slate-500 font-semibold shadow-2xs">↓</kbd>
              <span>to navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono text-slate-500 font-semibold shadow-2xs">↵</kbd>
              <span>to select</span>
            </span>
          </div>
          <span className="text-[10px] text-teal-700 font-semibold">
            OncoMatch Global Search
          </span>
        </div>
      </div>
    </div>
  );
};
