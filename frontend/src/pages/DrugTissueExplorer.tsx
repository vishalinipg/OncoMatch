import React, { useState, useEffect, useMemo } from 'react';
import { 
  FlaskConical, 
  Search, 
  Filter, 
  Pill, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  Layers, 
  Sliders, 
  Database,
  ExternalLink,
  Tag,
  LayoutGrid,
  List,
  CheckCircle2,
  CheckSquare,
  Square
} from 'lucide-react';
import { api } from '../services/api';
import { Drug, Sample, ComparisonItem } from '../types';

interface DrugTissueExplorerProps {
  onNavigate: (page: string) => void;
  activeSample?: Sample;
  pinnedItems?: ComparisonItem[];
  onTogglePin?: (item: ComparisonItem) => void;
}

export const DrugTissueExplorer: React.FC<DrugTissueExplorerProps> = ({
  onNavigate,
  activeSample,
  pinnedItems = [],
  onTogglePin
}) => {
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [tissues, setTissues] = useState<string[]>([]);
  const [probeIds, setProbeIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPathway, setSelectedPathway] = useState('ALL');
  const [probeFilterOnly, setProbeFilterOnly] = useState(false);
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  useEffect(() => {
    Promise.all([
      api.getDrugs(),
      api.getTissues(),
      api.getProbeAssays()
    ]).then(([drugList, tissueList, probeData]) => {
      setDrugs(drugList);
      setTissues(tissueList);
      const extractedIds = (probeData.probe_ids && probeData.probe_ids.length > 0)
        ? probeData.probe_ids
        : (probeData.probe_drugs ? probeData.probe_drugs.map(p => p.drug_id) : []);
      setProbeIds(extractedIds);
      if (drugList.length > 0) {
        setSelectedDrug(drugList[0]);
      }
    }).catch(err => {
      console.error("Error loading explorer data:", err);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  // Distinct pathways
  const pathways = useMemo(() => {
    return Array.from(new Set(drugs.map(d => d.PATHWAY_NAME).filter(Boolean))).sort();
  }, [drugs]);

  const topPathways = ['ALL', 'DNA replication', 'RTK signaling', 'Cell cycle', 'Apoptosis', 'Chromatin histone', 'PI3K/MTOR'];

  const probeSet = useMemo(() => new Set(probeIds.map(Number)), [probeIds]);

  // Clean concentration bounds formatter
  const formatConcVal = (val: number | undefined): string => {
    if (val === undefined || val === null || isNaN(val)) return '-';
    if (val < 0.001) return Number(val.toFixed(5)).toString();
    if (val < 0.01) return Number(val.toFixed(4)).toString();
    if (val < 1.0) return Number(val.toFixed(3)).toString();
    return Number(val.toFixed(2)).toString();
  };

  // Filter logic
  const filteredDrugs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return drugs.filter(d => {
      const matchSearch = q === '' ||
        (d.DRUG_NAME || '').toLowerCase().includes(q) ||
        (d.PUTATIVE_TARGET || '').toLowerCase().includes(q) ||
        String(d.DRUG_ID).includes(q);
      
      const matchPathway = selectedPathway === 'ALL' || d.PATHWAY_NAME === selectedPathway;
      const matchProbe = !probeFilterOnly || probeSet.has(Number(d.DRUG_ID));

      return matchSearch && matchPathway && matchProbe;
    });
  }, [drugs, searchQuery, selectedPathway, probeFilterOnly, probeSet]);

  const isCurrentPinned = selectedDrug ? pinnedItems.some(p => p.id === selectedDrug.DRUG_ID) : false;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 text-[11px] font-semibold mb-1 shadow-2xs">
            <FlaskConical className="w-3.5 h-3.5 text-indigo-600 mr-1" />
            <span>Comprehensive GDSC2 Pharmacopeia (286 Compounds)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Drug & Tissue Lineage Explorer
          </h1>
          <p className="text-slate-500 text-xs mt-0.5 max-w-3xl">
            Explore 286 unique anticancer therapeutics across 295 screening regimens with putative molecular targets, signaling pathways, screening concentration ranges, and 15 benchmark probe assays.
          </p>
        </div>

        {/* Quick Jump CTA */}
        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={() => onNavigate('prediction')}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 transition-all cursor-pointer group"
          >
            <Pill className="w-4 h-4" />
            <span>Predict Sensitivity</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-subtle space-y-3">
        {/* Quick Pathway Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-2">Top Pathways:</span>
          {topPathways.map(pw => {
            const isSelected = selectedPathway === pw;
            return (
              <button
                key={pw}
                onClick={() => setSelectedPathway(pw)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all border cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                {pw === 'ALL' ? 'All Pathways' : pw}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search Box (6 cols) */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search drug name (e.g. Cisplatin), target, or ID..."
              className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl pl-9 pr-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium transition-all"
            />
          </div>

          {/* Pathway Dropdown (4 cols) */}
          <div className="md:col-span-4">
            <select
              value={selectedPathway}
              onChange={(e) => setSelectedPathway(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer font-medium"
            >
              <option value="ALL">All Signaling Pathways ({pathways.length})</option>
              {pathways.map(pw => (
                <option key={pw} value={pw}>{pw}</option>
              ))}
            </select>
          </div>

          {/* 15 Probe Drug Toggle (3 cols) */}
          <div className="md:col-span-3 flex items-center">
            <button
              onClick={() => setProbeFilterOnly(!probeFilterOnly)}
              className={`w-full flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                probeFilterOnly
                  ? 'bg-amber-50 text-amber-950 border-amber-300 shadow-2xs font-bold'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>15 Reference Probe Panel</span>
              {probeFilterOnly && <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-1.5 py-0.2 rounded-full ml-1">Active</span>}
            </button>
          </div>
        </div>

        {/* Catalog Summary Counter & View Switcher */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <div>
            Showing <strong className="text-slate-900 font-semibold">{filteredDrugs.length}</strong> of {drugs.length} regimens (286 unique compounds)
          </div>
          <div className="flex items-center space-x-3">
            {/* View Mode Switcher */}
            <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md transition-all ${
                  viewMode === 'table' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-400 hover:text-slate-600'
                }`}
                title="Table View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-md transition-all ${
                  viewMode === 'cards' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-400 hover:text-slate-600'
                }`}
                title="Card Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="hidden sm:flex items-center space-x-2 font-mono text-[11px]">
              <span className="text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-semibold">
                15 Probes
              </span>
              <span className="text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full font-semibold">
                33 Lineages
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Drug Table / Cards & Selected Drug Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7-8 Cols: Viewport-Locked Table or Cards (Requirement 3) */}
        <div className="lg:col-span-8">
          {viewMode === 'table' ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle overflow-hidden flex flex-col">
              {/* Viewport-locked container with frozen header and sticky left column */}
              <div className="h-[calc(100vh-270px)] min-h-[460px] overflow-auto relative">
                <table className="w-full text-left text-xs border-collapse min-w-[650px]">
                  <thead className="sticky top-0 z-20 bg-slate-100 shadow-2xs text-slate-700 font-semibold text-[11px]">
                    <tr>
                      <th className="py-3 px-4 bg-slate-100 sticky top-0 left-0 z-30 min-w-[150px] shadow-sm">
                        Drug Compound
                      </th>
                      <th className="py-3 px-4 bg-slate-100 sticky top-0 min-w-[140px]">Putative Target</th>
                      <th className="py-3 px-4 bg-slate-100 sticky top-0 min-w-[120px]">Signaling Pathway</th>
                      <th className="py-3 px-4 text-right bg-slate-100 sticky top-0 min-w-[110px]">Tested Bounds (µM)</th>
                      <th className="py-3 px-4 text-center bg-slate-100 sticky top-0 w-20">Type</th>
                      <th className="py-3 px-4 text-center bg-slate-100 sticky top-0 w-20">Compare</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    {filteredDrugs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-500 font-sans">
                          No chemotherapy compounds found matching your filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredDrugs.map(d => {
                        const isProbe = probeSet.has(Number(d.DRUG_ID));
                        const isSelected = selectedDrug?.DRUG_ID === d.DRUG_ID;
                        const isPinned = pinnedItems.some(p => p.id === d.DRUG_ID);
                        return (
                          <tr
                            key={d.DRUG_ID}
                            onClick={() => setSelectedDrug(d)}
                            className={`transition-colors cursor-pointer ${
                              isSelected ? 'bg-indigo-50/80 font-semibold' : 'hover:bg-slate-50/80'
                            }`}
                          >
                            <td className="py-3 px-4 font-bold text-slate-900 font-sans sticky left-0 z-10 bg-white group-hover:bg-slate-50 truncate max-w-[150px] flex items-center space-x-2">
                              <Pill className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                              <span className="truncate">{d.DRUG_NAME}</span>
                              <span className="font-mono text-[10px] text-slate-400 font-normal">
                                #{d.DRUG_ID}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-700 font-sans font-medium truncate max-w-[140px]">
                              {d.PUTATIVE_TARGET || 'Unspecified'}
                            </td>
                            <td className="py-3 px-4 text-slate-500 font-sans text-[11px] truncate max-w-[120px]">
                              {d.PATHWAY_NAME || 'Unclassified'}
                            </td>
                            <td className="py-3 px-4 text-right font-mono text-slate-700 tabular-nums">
                              {formatConcVal(d.MIN_CONC)} – {formatConcVal(d.MAX_CONC)} µM
                            </td>
                            <td className="py-3 px-4 text-center font-sans">
                              {isProbe ? (
                                <span className="inline-flex items-center text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                                  Probe
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-400 font-mono">Screen</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (onTogglePin) {
                                    onTogglePin({
                                      id: d.DRUG_ID,
                                      type: 'drug',
                                      title: d.DRUG_NAME,
                                      subtitle: d.PUTATIVE_TARGET,
                                      tissue: activeSample?.tcga_desc || 'PANCAN',
                                      min_conc_uM: d.MIN_CONC,
                                      max_conc_uM: d.MAX_CONC,
                                      putative_target: d.PUTATIVE_TARGET,
                                      pathway_name: d.PATHWAY_NAME,
                                      color: '#10b981'
                                    });
                                  }
                                }}
                                className={`p-1 rounded-md transition-colors ${
                                  isPinned ? 'text-teal-600 bg-teal-100' : 'text-slate-300 hover:text-slate-500'
                                }`}
                              >
                                {isPinned ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Cards View with Viewport Lock */
            <div className="h-[calc(100vh-270px)] min-h-[460px] overflow-auto pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredDrugs.map(d => {
                  const isProbe = probeSet.has(Number(d.DRUG_ID));
                  const isSelected = selectedDrug?.DRUG_ID === d.DRUG_ID;
                  const isPinned = pinnedItems.some(p => p.id === d.DRUG_ID);
                  return (
                    <div
                      key={d.DRUG_ID}
                      onClick={() => setSelectedDrug(d)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 card-hover-effect ${
                        isSelected
                          ? 'bg-indigo-50/80 border-indigo-300 shadow-subtle ring-2 ring-indigo-500/20'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-slate-900 text-sm flex items-center space-x-1.5 truncate pr-2">
                          <Pill className="w-4 h-4 text-teal-600 shrink-0" />
                          <span className="truncate">{d.DRUG_NAME}</span>
                        </div>
                        <div className="flex items-center space-x-1 shrink-0">
                          {isProbe && (
                            <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                              Probe
                            </span>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onTogglePin) {
                                onTogglePin({
                                  id: d.DRUG_ID,
                                  type: 'drug',
                                  title: d.DRUG_NAME,
                                  subtitle: d.PUTATIVE_TARGET,
                                  tissue: activeSample?.tcga_desc || 'PANCAN',
                                  min_conc_uM: d.MIN_CONC,
                                  max_conc_uM: d.MAX_CONC,
                                  putative_target: d.PUTATIVE_TARGET,
                                  pathway_name: d.PATHWAY_NAME,
                                  color: '#10b981'
                                });
                              }
                            }}
                            className={`p-1 rounded-md transition-colors ${
                              isPinned ? 'text-teal-600 bg-teal-100' : 'text-slate-300 hover:text-slate-500'
                            }`}
                          >
                            {isPinned ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div className="text-xs text-slate-600 space-y-1">
                        <div>Target: <strong className="text-slate-800">{d.PUTATIVE_TARGET || 'Cytotoxic'}</strong></div>
                        <div>Pathway: <span className="text-slate-500">{d.PATHWAY_NAME}</span></div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
                        <span>ID #{d.DRUG_ID}</span>
                        <span className="text-teal-800 font-semibold">{formatConcVal(d.MIN_CONC)} – {formatConcVal(d.MAX_CONC)} µM</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right 4-5 Cols: Pinned Selected Drug Inspector */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle space-y-4 sticky top-32">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center">
                <Tag className="w-3.5 h-3.5 mr-1.5 text-indigo-600" /> Pharmacological Dossier
              </span>
              <span className="text-xs font-mono font-bold text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                #{selectedDrug?.DRUG_ID}
              </span>
            </div>

            {selectedDrug ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                    {selectedDrug.DRUG_NAME}
                  </h3>
                  <div className="text-xs text-slate-500 mt-1 flex items-center space-x-2">
                    <span>Target Pathway:</span>
                    <span className="font-semibold text-slate-800">{selectedDrug.PATHWAY_NAME || 'Unclassified'}</span>
                  </div>
                </div>

                <div className="space-y-2 font-mono text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl space-y-1 border border-slate-100">
                    <span className="text-[10px] text-slate-500 uppercase font-sans font-semibold">Putative Molecular Target</span>
                    <div className="font-bold text-slate-900 text-sm font-sans">{selectedDrug.PUTATIVE_TARGET || 'Broad Cytotoxic Mechanism'}</div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl space-y-1 border border-slate-100">
                    <span className="text-[10px] text-slate-500 uppercase font-sans font-semibold">Tested Concentration Bounds</span>
                    <div className="font-bold text-teal-800 text-sm">
                      {formatConcVal(selectedDrug.MIN_CONC)} µM – {formatConcVal(selectedDrug.MAX_CONC)} µM
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl space-y-1 border border-slate-100">
                    <span className="text-[10px] text-slate-500 uppercase font-sans font-semibold">Sanger Screening Classification</span>
                    <div className="font-semibold text-slate-700 font-sans">
                      {probeSet.has(Number(selectedDrug.DRUG_ID)) ? (
                        <span className="text-amber-800 font-bold flex items-center">
                          <Sparkles className="w-3.5 h-3.5 mr-1" /> 15 Reference Probe Panel Assay
                        </span>
                      ) : (
                        'Standard GDSC2 Screening Regimen'
                      )}
                    </div>
                  </div>
                </div>

                {/* Compare / Pin button */}
                <button
                  onClick={() => {
                    if (onTogglePin && selectedDrug) {
                      onTogglePin({
                        id: selectedDrug.DRUG_ID,
                        type: 'drug',
                        title: selectedDrug.DRUG_NAME,
                        subtitle: selectedDrug.PUTATIVE_TARGET,
                        tissue: activeSample?.tcga_desc || 'PANCAN',
                        min_conc_uM: selectedDrug.MIN_CONC,
                        max_conc_uM: selectedDrug.MAX_CONC,
                        putative_target: selectedDrug.PUTATIVE_TARGET,
                        pathway_name: selectedDrug.PATHWAY_NAME,
                        color: '#10b981'
                      });
                    }
                  }}
                  className={`w-full flex items-center justify-center space-x-1.5 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    isCurrentPinned 
                      ? 'bg-teal-50 text-teal-800 border-teal-300' 
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  <span>{isCurrentPinned ? "Pinned in Comparison Tray" : "Pin to Comparison Tray"}</span>
                </button>

                {/* Direct Action: Predict for this Drug */}
                <button
                  onClick={() => onNavigate('prediction')}
                  className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-xs transition-all shadow-md shadow-teal-600/20 cursor-pointer active:scale-98"
                >
                  <Pill className="w-4 h-4" />
                  <span>Predict Response for {selectedDrug.DRUG_NAME}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <a
                    href={`https://www.cancerrxgene.org/translation/Drug/${selectedDrug.DRUG_ID}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-indigo-600 flex items-center space-x-1 font-medium"
                  >
                    <span>Sanger Entry</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                  <a
                    href={`https://pubchem.ncbi.nlm.nih.gov/#query=${encodeURIComponent(selectedDrug.DRUG_NAME)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-indigo-600 flex items-center space-x-1 font-medium"
                  >
                    <span>PubChem Database</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500">Select a drug to view details.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
