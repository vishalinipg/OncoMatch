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
  Tag
} from 'lucide-react';
import { api } from '../services/api';
import { Drug, Sample } from '../types';

interface DrugTissueExplorerProps {
  onNavigate: (page: string) => void;
  activeSample?: Sample;
}

export const DrugTissueExplorer: React.FC<DrugTissueExplorerProps> = ({
  onNavigate,
  activeSample
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

  const probeSet = useMemo(() => new Set(probeIds.map(Number)), [probeIds]);

  // Clean concentration bounds formatter to remove floating-point artifacts
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

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 text-[11px] font-semibold mb-2">
            <FlaskConical className="w-3.5 h-3.5 text-indigo-600 mr-1" />
            <span>Comprehensive GDSC2 Catalogue</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Drug & Tissue Lineage Explorer
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-1">
            Explore 286 unique anticancer compounds across 295 screening regimens with putative molecular targets, signaling pathways, screening concentration ranges, and 15 benchmark probe assays across 33 TCGA tissue lineages.
          </p>
        </div>

        {/* Quick Jump CTA */}
        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={() => onNavigate('prediction')}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Pill className="w-4 h-4" />
            <span>Predict Sensitivity</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search drug name (e.g. Cisplatin), target, or ID..."
              className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg pl-9 pr-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          {/* Pathway Dropdown */}
          <div>
            <select
              value={selectedPathway}
              onChange={(e) => setSelectedPathway(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
            >
              <option value="ALL">All Signaling Pathways ({pathways.length})</option>
              {pathways.map(pw => (
                <option key={pw} value={pw}>{pw}</option>
              ))}
            </select>
          </div>

          {/* 15 Probe Drug Toggle */}
          <div className="flex items-center">
            <button
              onClick={() => setProbeFilterOnly(!probeFilterOnly)}
              className={`w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
                probeFilterOnly
                  ? 'bg-amber-50 text-amber-900 border-amber-300 shadow-2xs font-bold'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>15 Reference Probe Panel Only</span>
              {probeFilterOnly && <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-1.5 py-0.5 rounded ml-1">Active</span>}
            </button>
          </div>
        </div>

        {/* Catalog Summary Counter */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <div>
            Showing <strong className="text-slate-900">{filteredDrugs.length}</strong> of {drugs.length} regimens (286 unique compounds)
          </div>
          <div className="flex items-center space-x-2 font-mono text-[11px]">
            <span className="text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
              15 Probe Compounds
            </span>
            <span className="text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
              33 TCGA Tissues
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Drug Table & Selected Drug Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Table of Drugs */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                <tr>
                  <th className="py-3 px-4">Drug Compound</th>
                  <th className="py-3 px-4">Putative Target</th>
                  <th className="py-3 px-4">Signaling Pathway</th>
                  <th className="py-3 px-4 text-right">Tested Bounds (µM)</th>
                  <th className="py-3 px-4 text-center">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDrugs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500">
                      No chemotherapy compounds found matching your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredDrugs.slice(0, 50).map(d => {
                    const isProbe = probeSet.has(Number(d.DRUG_ID));
                    const isSelected = selectedDrug?.DRUG_ID === d.DRUG_ID;
                    return (
                      <tr
                        key={d.DRUG_ID}
                        onClick={() => setSelectedDrug(d)}
                        className={`transition-colors cursor-pointer ${
                          isSelected ? 'bg-indigo-50/70 font-semibold' : 'hover:bg-slate-50/80'
                        }`}
                      >
                        <td className="py-3 px-4 font-bold text-slate-900 flex items-center space-x-2">
                          <Pill className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          <span>{d.DRUG_NAME}</span>
                          <span className="font-mono text-[10px] text-slate-400 font-normal">
                            #{d.DRUG_ID}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-700 font-medium">
                          {d.PUTATIVE_TARGET || 'Unspecified'}
                        </td>
                        <td className="py-3 px-4 text-slate-500 text-[11px]">
                          {d.PATHWAY_NAME || 'Unclassified'}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-slate-700 text-[11px]">
                          {formatConcVal(d.MIN_CONC)} – {formatConcVal(d.MAX_CONC)} µM
                        </td>
                        <td className="py-3 px-4 text-center">
                          {isProbe ? (
                            <span className="inline-flex items-center text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                              Probe
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">Screen</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {filteredDrugs.length > 50 && (
            <div className="p-3 text-center text-xs text-slate-500 border-t border-slate-100 bg-slate-50/50">
              Showing first 50 results. Use the search box above to narrow down results.
            </div>
          )}
        </div>

        {/* Selected Drug Inspection Panel */}
        <div className="space-y-6">
          {selectedDrug ? (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5 sticky top-24">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                  Compound Specification
                </span>
                {probeSet.has(Number(selectedDrug.DRUG_ID)) && (
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded flex items-center">
                    <Sparkles className="w-3 h-3 mr-1 text-amber-600" /> Scenario C Probe
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  {selectedDrug.DRUG_NAME}
                </h3>
                <div className="text-xs text-slate-500 font-mono mt-0.5">
                  GDSC2 DRUG_ID: #{selectedDrug.DRUG_ID}
                </div>
              </div>

              <div className="space-y-3 text-xs divide-y divide-slate-100">
                <div className="pt-2">
                  <div className="text-slate-500 font-medium text-[11px]">Putative Molecular Target</div>
                  <div className="font-bold text-slate-900 mt-0.5 text-sm">
                    {selectedDrug.PUTATIVE_TARGET || 'Unspecified'}
                  </div>
                </div>

                <div className="pt-2">
                  <div className="text-slate-500 font-medium text-[11px]">Target Signaling Pathway</div>
                  <div className="font-semibold text-indigo-900 mt-0.5">
                    {selectedDrug.PATHWAY_NAME || 'Unclassified'}
                  </div>
                </div>

                <div className="pt-2">
                  <div className="text-slate-500 font-medium text-[11px]">Screening Concentration Bounds</div>
                  <div className="font-mono text-slate-800 mt-0.5">
                    Min: <strong>{formatConcVal(selectedDrug.MIN_CONC)} µM</strong> — Max: <strong>{formatConcVal(selectedDrug.MAX_CONC)} µM</strong>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="text-slate-500 font-medium text-[11px]">Active Target Lineage</div>
                  <div className="font-semibold text-slate-900 mt-0.5 flex items-center space-x-1.5">
                    <span className="font-mono text-teal-800 bg-teal-50 border border-teal-200 px-1.5 py-0.2 rounded text-[11px]">
                      {activeSample ? activeSample.tcga_desc : 'PANCAN'}
                    </span>
                    <span>{activeSample ? activeSample.name : 'Pan-Cancer Target'}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => onNavigate('prediction')}
                  className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
                >
                  <Pill className="w-4 h-4" />
                  <span>Predict Response for {selectedDrug.DRUG_NAME}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onNavigate('analytics')}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors cursor-pointer"
                >
                  <span>Compare Cross-Tissue Sensitivity</span>
                </button>
              </div>

              {/* Informational Callout */}
              <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-600 leading-relaxed border border-slate-100">
                <strong>Pre-Exposure Modeling:</strong> Response is estimated through target encoding of compound ID, molecular target, pathway, and concentration range against GDSC2 cell line responses.
              </div>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
              Select a drug from the table to view its mechanisms and screening parameters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
