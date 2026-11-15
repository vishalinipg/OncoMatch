import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart3, 
  Layers, 
  Flame, 
  Sparkles, 
  Activity, 
  Database,
  ArrowRight,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  TrendingDown,
  Info
} from 'lucide-react';
import { 
  Scatter, 
  XAxis, 
  YAxis, 
  ZAxis, 
  Tooltip, 
  ResponsiveContainer, 
  ScatterChart as RechartsScatterChart,
  Cell,
  BarChart,
  Bar,
  CartesianGrid
} from 'recharts';
import { api } from '../services/api';
import { PCALandscape, HeatmapData, ProbeDrug, Sample } from '../types';

interface VisualAnalyticsProps {
  sampleId: string;
  samples: Sample[];
  onSampleChange: (id: string) => void;
  onNavigate: (page: string) => void;
}

export const VisualAnalytics: React.FC<VisualAnalyticsProps> = ({
  sampleId,
  samples,
  onSampleChange,
  onNavigate
}) => {
  const [activeTab, setActiveTab] = useState<'pca' | 'heatmap' | 'probes'>('pca');
  const [pcaData, setPcaData] = useState<PCALandscape | null>(null);
  const [heatmapData, setHeatmapData] = useState<HeatmapData | null>(null);
  const [probeData, setProbeData] = useState<ProbeDrug[]>([]);
  const [selectedTissueFilter, setSelectedTissueFilter] = useState('ALL');
  const [selectedProbeTissue, setSelectedProbeTissue] = useState('ALL');
  
  const [pcaLoading, setPcaLoading] = useState(true);
  const [heatmapLoading, setHeatmapLoading] = useState(true);
  const [probeLoading, setProbeLoading] = useState(true);

  const activeSample = samples.find(s => s.sample_id === sampleId);

  useEffect(() => {
    setPcaLoading(true);
    api.getPCA(sampleId)
      .then(data => setPcaData(data))
      .catch(err => console.error("Error loading PCA:", err))
      .finally(() => setPcaLoading(false));

    setHeatmapLoading(true);
    api.getHeatmap(15)
      .then(data => setHeatmapData(data))
      .catch(err => console.error("Error loading Heatmap:", err))
      .finally(() => setHeatmapLoading(false));

    setProbeLoading(true);
    api.getProbeAssays(activeSample?.tcga_desc)
      .then(res => setProbeData(res.probe_drugs))
      .catch(err => console.error("Error loading probe assays:", err))
      .finally(() => setProbeLoading(false));
  }, [sampleId]);

  const tissueColors: Record<string, string> = {
    BRCA: '#db2777',
    LUAD: '#2563eb',
    COREAD: '#ea580c',
    SKCM: '#ca8a04',
    GBM: '#9333ea',
    PAAD: '#0891b2',
    OV: '#0d9488',
    LAML: '#dc2626',
    PRAD: '#7c3aed',
    KIRC: '#059669',
    UNKNOWN: '#64748b',
    UNCLASSIFIED: '#475569'
  };

  const filteredPcaSamples = useMemo(() => {
    if (!pcaData?.samples) return [];
    if (selectedTissueFilter === 'ALL') return pcaData.samples;
    return pcaData.samples.filter(s => s.tcga_desc === selectedTissueFilter);
  }, [pcaData, selectedTissueFilter]);

  const getHeatmapColor = (score: number | undefined) => {
    if (score === undefined || score === null) return 'bg-slate-50 text-slate-400';
    if (score < 2.2) return 'bg-emerald-100 text-emerald-950 font-bold border-r border-emerald-200/60';
    if (score <= 4.2) return 'bg-amber-100 text-amber-950 font-medium border-r border-amber-200/60';
    return 'bg-rose-100 text-rose-950 font-medium border-r border-rose-200/60';
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-[11px] font-semibold mb-2">
            <Activity className="w-3.5 h-3.5 text-teal-600 mr-1" />
            <span>High-Dimensional Response Analytics</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Visual Analytics & Reference Benchmarks
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-1">
            Explore pharmacogenomic response landscapes across 969 cancer cell lines, cross-tissue sensitivity matrices, and the GDSC2 15 reference probe-drug benchmark panel.
          </p>
        </div>

        {/* Tab Navigation Controls */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 shrink-0">
          <button
            onClick={() => setActiveTab('pca')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'pca'
                ? 'bg-white text-teal-900 shadow-2xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-teal-600" />
            <span>Pharmacogenomic PCA</span>
          </button>

          <button
            onClick={() => setActiveTab('heatmap')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'heatmap'
                ? 'bg-white text-teal-900 shadow-2xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-rose-500" />
            <span>Cross-Tissue Heatmap</span>
          </button>

          <button
            onClick={() => setActiveTab('probes')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'probes'
                ? 'bg-white text-teal-900 shadow-2xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>15 Probe Assays</span>
          </button>
        </div>
      </div>

      {/* TAB 1: Pharmacogenomic PCA */}
      {activeTab === 'pca' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* PCA Scatter Plot (8 cols) */}
            <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center">
                    <Layers className="w-4 h-4 mr-2 text-teal-600" /> Cell-Line Drug Response Coordinates (969 Lines)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Decomposed from median ln(IC50) screening profiles across 286 compounds.
                  </p>
                </div>

                {/* Lineage Filter */}
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] text-slate-500 font-semibold">Tissue:</span>
                  <select
                    value={selectedTissueFilter}
                    onChange={(e) => setSelectedTissueFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-xs rounded-lg px-2.5 py-1 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
                  >
                    <option value="ALL">All Tissues (969 Lines)</option>
                    {pcaData?.tissues?.map(t => (
                      <option key={t} value={t}>{t} Lineage</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Scatter Plot */}
              <div className="h-96 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis 
                      type="number" 
                      dataKey="pc1" 
                      name="PC1" 
                      stroke="#94a3b8" 
                      fontSize={10}
                      label={{ 
                        value: `PC1 (${((pcaData?.pc1_variance || 0.384) * 100).toFixed(1)}% Variance — Broad Sensitivity)`, 
                        position: 'insideBottom', 
                        offset: -10, 
                        fontSize: 10,
                        fill: '#64748b'
                      }} 
                    />
                    <YAxis 
                      type="number" 
                      dataKey="pc2" 
                      name="PC2" 
                      stroke="#94a3b8" 
                      fontSize={10}
                      label={{ 
                        value: `PC2 (${((pcaData?.pc2_variance || 0.045) * 100).toFixed(1)}% Variance — Lineage Specificity)`, 
                        angle: -90, 
                        position: 'insideLeft', 
                        offset: 10, 
                        fontSize: 10,
                        fill: '#64748b'
                      }} 
                    />
                    <ZAxis range={[30, 45]} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#ffffff', 
                        borderRadius: '0.75rem', 
                        borderColor: '#cbd5e1', 
                        fontSize: '11px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }} 
                      formatter={(value: any, name: string) => [Number(value).toFixed(2), name]}
                      labelFormatter={(_: any, payload: any) => {
                        const pt = payload?.[0]?.payload;
                        return pt ? `${pt.name} (${pt.tcga_desc})` : '';
                      }}
                    />
                    <Scatter data={filteredPcaSamples}>
                      {filteredPcaSamples.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={tissueColors[entry.tcga_desc] || '#64748b'} 
                          opacity={0.65}
                        />
                      ))}
                    </Scatter>

                    {/* Active Target Projection Point */}
                    {pcaData?.current_sample_projection && (
                      <Scatter 
                        data={[pcaData.current_sample_projection]} 
                        fill="#0d9488" 
                        shape="star"
                      >
                        <Cell fill="#0d9488" stroke="#ffffff" strokeWidth={2} />
                      </Scatter>
                    )}
                  </RechartsScatterChart>
                </ResponsiveContainer>
              </div>

              {/* Active Sample Status Callout */}
              {pcaData?.current_sample_projection && (
                <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-950 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>
                      Active Profile: <strong>{pcaData.current_sample_projection.name}</strong> ({pcaData.current_sample_projection.tcga_desc})
                    </span>
                  </div>
                  <span className="font-mono text-[11px] font-bold text-teal-800 bg-white px-2 py-0.5 rounded border border-teal-200">
                    PC1: {pcaData.current_sample_projection.pc1.toFixed(2)}, PC2: {pcaData.current_sample_projection.pc2.toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            {/* PC Loadings & Biplot Drivers (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center">
                  <BarChart3 className="w-4 h-4 mr-2 text-teal-600" /> PC1 Top Chemotherapy Drivers
                </h3>
                <p className="text-xs text-slate-500">
                  Compounds with the largest loadings on PC1, reflecting global cellular sensitivity vs pan-resistance.
                </p>

                <div className="space-y-2">
                  {pcaData?.top_pc1_drugs?.slice(0, 6).map((d) => (
                    <div key={d.drug_id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-900">{d.drug_name}</div>
                        <div className="text-[10px] text-slate-500">{d.pathway}</div>
                      </div>
                      <span className="font-mono font-bold text-teal-700 text-xs">
                        {d.loading > 0 ? `+${d.loading.toFixed(3)}` : d.loading.toFixed(3)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center">
                  <BarChart3 className="w-4 h-4 mr-2 text-indigo-600" /> PC2 Lineage-Specific Drivers
                </h3>
                <div className="space-y-2">
                  {pcaData?.top_pc2_drugs?.slice(0, 6).map((d) => (
                    <div key={d.drug_id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-900">{d.drug_name}</div>
                        <div className="text-[10px] text-slate-500">{d.pathway}</div>
                      </div>
                      <span className="font-mono font-bold text-indigo-700 text-xs">
                        {d.loading > 0 ? `+${d.loading.toFixed(3)}` : d.loading.toFixed(3)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Cross-Tissue Sensitivity Heatmap */}
      {activeTab === 'heatmap' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center">
                <Flame className="w-4 h-4 mr-2 text-rose-500" /> Cross-Tissue Chemotherapy Sensitivity Matrix
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Model-predicted ln(IC50) responses across 10 major oncology lineages and 15 clinical chemotherapies.
              </p>
            </div>

            {/* Heatmap Legend */}
            <div className="flex items-center space-x-3 text-xs bg-slate-50 p-2 rounded-xl border border-slate-200">
              <span className="flex items-center">
                <span className="w-3 h-3 rounded bg-emerald-200 border border-emerald-300 mr-1.5"></span>
                Sensitive (&lt; 2.2)
              </span>
              <span className="flex items-center">
                <span className="w-3 h-3 rounded bg-amber-200 border border-amber-300 mr-1.5"></span>
                Intermediate (2.2 - 4.2)
              </span>
              <span className="flex items-center">
                <span className="w-3 h-3 rounded bg-rose-200 border border-rose-300 mr-1.5"></span>
                Resistant (&gt; 4.2)
              </span>
            </div>
          </div>

          {/* Matrix Table */}
          {heatmapData ? (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-xs text-center border-collapse font-mono">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3 text-left font-sans text-xs bg-slate-100 border-r border-slate-200 sticky left-0 z-10">
                      Tissue Lineage
                    </th>
                    {heatmapData.drugs.map(d => (
                      <th key={d} className="py-3 px-2 font-sans font-semibold text-[11px] min-w-[85px] border-r border-slate-200 last:border-r-0">
                        {d}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {heatmapData.matrix.map(row => (
                    <tr key={row.tissue} className="hover:opacity-90">
                      <td className="py-2.5 px-3 text-left font-sans font-bold text-slate-900 bg-slate-50 border-r border-slate-200 sticky left-0 z-10 flex items-center space-x-1.5">
                        <span 
                          className="w-2.5 h-2.5 rounded-full shrink-0" 
                          style={{ backgroundColor: tissueColors[row.tissue] || '#64748b' }}
                        ></span>
                        <span>{row.tissue}</span>
                      </td>
                      {heatmapData.drugs.map(drugName => {
                        const val = row.scores[drugName];
                        return (
                          <td 
                            key={drugName} 
                            className={`py-2 px-2 text-[11px] ${getHeatmapColor(val)}`}
                            title={`${drugName} in ${row.tissue}: ln(IC50) = ${val?.toFixed(2)}`}
                          >
                            {val !== undefined ? val.toFixed(1) : '-'}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-500">
              Loading sensitivity matrix...
            </div>
          )}

          <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 leading-relaxed border border-slate-100">
            <strong>Lineage Pharmacogenomics:</strong> Liquid tumors (LAML) generally exhibit marked sensitivity (emerald green) across DNA-damaging agents, whereas glioblastoma (GBM) and pancreatic adenocarcinoma (PAAD) display intrinsic resistance patterns across standard regimens.
          </div>
        </div>
      )}

      {/* TAB 3: 15 Reference Probe-Drug Benchmark Assay Panel */}
      {activeTab === 'probes' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center">
                <Sparkles className="w-4 h-4 mr-2 text-amber-500" /> GDSC2 15 Probe-Drug Reference Panel (Unit 12.11 / Scenario C)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Standard reference fingerprint compounds evaluated across nearly all 969 cell lines in the Sanger GDSC2 repository.
              </p>
            </div>

            <div className="text-xs font-mono font-bold text-teal-800 bg-teal-50 border border-teal-200 px-3 py-1 rounded-lg">
              Active Lineage: {activeSample ? activeSample.tcga_desc : 'PANCAN'}
            </div>
          </div>

          {/* 15 Probe Drugs Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider font-mono">
                <tr>
                  <th className="py-3 px-4 font-sans">#</th>
                  <th className="py-3 px-4 font-sans">Probe Compound</th>
                  <th className="py-3 px-4 font-sans">Putative Molecular Target</th>
                  <th className="py-3 px-4 font-sans">Target Pathway</th>
                  <th className="py-3 px-4 text-right">Tested Cell Lines</th>
                  <th className="py-3 px-4 text-right">Global Mean ln(IC50)</th>
                  <th className="py-3 px-4 text-right">Active Tissue Mean</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {probeData.map((pb, idx) => {
                  const tMean = pb.tissue_mean_ln_ic50 !== undefined ? pb.tissue_mean_ln_ic50 : pb.overall_mean_ln_ic50;
                  return (
                    <tr key={pb.drug_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-4 text-slate-400 font-bold">{idx + 1}</td>
                      <td className="py-2.5 px-4 font-sans font-bold text-slate-900">
                        {pb.drug_name}
                        <span className="ml-2 font-mono text-[10px] text-slate-400 font-normal">#{pb.drug_id}</span>
                      </td>
                      <td className="py-2.5 px-4 font-sans text-slate-700 font-medium">
                        {pb.putative_target}
                      </td>
                      <td className="py-2.5 px-4 font-sans text-slate-500">
                        {pb.pathway_name}
                      </td>
                      <td className="py-2.5 px-4 text-right font-bold text-slate-800">
                        {pb.cell_lines_tested} / 969
                      </td>
                      <td className="py-2.5 px-4 text-right text-slate-700">
                        {pb.overall_mean_ln_ic50.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-4 text-right font-bold text-teal-700">
                        {tMean !== null ? Number(tMean).toFixed(2) : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-950 space-y-1">
            <div className="font-bold flex items-center">
              <ShieldCheck className="w-4 h-4 mr-1 text-amber-600" /> Scenario C Fingerprint Benchmarks in GDSC2:
            </div>
            <p className="text-[11px] leading-relaxed">
              These 15 compounds (e.g. Camptothecin, Navitoclax, Olaparib, Palbociclib, 5-Fluorouracil, Docetaxel) represent core biological probes spanning diverse oncology mechanisms (Apoptosis, Cell cycle, DNA replication, Genome integrity, RTK and PI3K/MTOR signaling). In Scenario C of the modeling protocol, these probe responses serve as cell line fingerprints for predicting novel compound sensitivity.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
