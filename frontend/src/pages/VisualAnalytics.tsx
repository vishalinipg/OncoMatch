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
  Info,
  Loader2,
  ChevronRight,
  X,
  Pill,
  ExternalLink
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
  CartesianGrid,
  LineChart,
  Line,
  ReferenceLine
} from 'recharts';
import { api } from '../services/api';
import { PCALandscape, HeatmapData, ProbeDrug, Sample, ComparisonItem } from '../types';
import { SensitivityBadge } from '../components/SensitivityBadge';

interface VisualAnalyticsProps {
  sampleId: string;
  samples: Sample[];
  onSampleChange: (id: string) => void;
  onNavigate: (page: string) => void;
  onTogglePin?: (item: ComparisonItem) => void;
}

export const VisualAnalytics: React.FC<VisualAnalyticsProps> = ({
  sampleId,
  samples,
  onSampleChange,
  onNavigate,
  onTogglePin
}) => {
  const [activeTab, setActiveTab] = useState<'pca' | 'heatmap' | 'probes'>('heatmap');
  const [pcaData, setPcaData] = useState<PCALandscape | null>(null);
  const [heatmapData, setHeatmapData] = useState<HeatmapData | null>(null);
  const [probeData, setProbeData] = useState<ProbeDrug[]>([]);
  const [selectedTissueFilter, setSelectedTissueFilter] = useState('ALL');
  
  const [pcaLoading, setPcaLoading] = useState(true);
  const [heatmapLoading, setHeatmapLoading] = useState(true);
  const [probeLoading, setProbeLoading] = useState(true);

  // Requirement 4: Interactive Matrix Inspector Popover State
  const [inspectCell, setInspectCell] = useState<{
    tissue: string;
    drug: string;
    score: number;
  } | null>(null);

  const activeSample = samples.find(s => s.sample_id === sampleId);

  useEffect(() => {
    setPcaLoading(true);
    api.getPCA(sampleId)
      .then(data => setPcaData(data))
      .catch(err => console.error("Error loading PCA:", err))
      .finally(() => setPcaLoading(false));

    setHeatmapLoading(true);
    api.getHeatmap(15)
      .then(data => {
        setHeatmapData(data);
        // Default inspect cell to BRCA x Olaparib if available
        if (data && data.matrix.length > 0 && data.drugs.length > 0) {
          const firstRow = data.matrix.find(m => m.tissue === 'BRCA') || data.matrix[0];
          const firstDrug = data.drugs[0];
          setInspectCell({
            tissue: firstRow.tissue,
            drug: firstDrug,
            score: firstRow.scores[firstDrug] ?? 3.25
          });
        }
      })
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
    if (score === undefined || score === null || isNaN(score)) return 'bg-slate-100 text-slate-400';
    if (score < 2.19) return 'bg-emerald-200 text-emerald-950 font-bold hover:bg-emerald-300';
    if (score <= 4.22) return 'bg-amber-200 text-amber-950 font-semibold hover:bg-amber-300';
    return 'bg-rose-200 text-rose-950 font-semibold hover:bg-rose-300';
  };

  const getTier = (score: number) => {
    if (score < 2.19) return 'Sensitive';
    if (score <= 4.22) return 'Intermediate';
    return 'Resistant';
  };

  // Mini 4PL Curve data for the inspected cell
  const inspectCurveData = useMemo(() => {
    if (!inspectCell) return [];
    const ic50 = Math.exp(inspectCell.score);
    const minC = ic50 / 50;
    const maxC = ic50 * 50;

    const logMin = Math.log10(Math.max(0.0001, minC));
    const logMax = Math.log10(Math.max(minC * 10, maxC));
    const steps = 20;
    const stepSize = (logMax - logMin) / steps;

    const points = [];
    for (let i = 0; i <= steps; i++) {
      const logC = logMin + i * stepSize;
      const c = Math.pow(10, logC);
      const hill = 1.15;
      const viability = 100 / (1 + Math.pow(c / ic50, hill));
      points.push({
        conc: Number(c.toFixed(3)),
        viability: Number(viability.toFixed(1))
      });
    }
    return points;
  }, [inspectCell]);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-[11px] font-semibold mb-1 shadow-2xs">
            <Activity className="w-3.5 h-3.5 text-teal-600 mr-1" />
            <span>High-Dimensional Visual Analytics</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Visual Analytics & Responsive Matrix Inspector
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Cross-tissue chemotherapy sensitivity matrix, pharmacogenomic PCA coordinates, and 15 probe assay fingerprints.
          </p>
        </div>

        {/* Tab Navigation Controls */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 shrink-0 shadow-subtle">
          <button
            onClick={() => setActiveTab('heatmap')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'heatmap'
                ? 'bg-white text-teal-950 shadow-2xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-rose-500" />
            <span>Sensitivity Matrix</span>
          </button>

          <button
            onClick={() => setActiveTab('pca')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'pca'
                ? 'bg-white text-teal-950 shadow-2xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-teal-600" />
            <span>PCA Landscape</span>
          </button>

          <button
            onClick={() => setActiveTab('probes')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'probes'
                ? 'bg-white text-teal-950 shadow-2xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>15 Probe Assays</span>
          </button>
        </div>
      </div>

      {/* TAB 1: CROSS-TISSUE SENSITIVITY HEATMAP WITH HOVER/CLICK MATRIX INSPECTOR (Requirement 4) */}
      {activeTab === 'heatmap' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Auto-fitting Responsive Matrix (8 cols) */}
            <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center">
                    <Flame className="w-4 h-4 mr-1.5 text-rose-500" /> Cross-Tissue Chemotherapy Matrix
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Click any cell to inspect predicted parameters and dose-response thumbnail.
                  </span>
                </div>

                {/* Heatmap Legend */}
                <div className="flex items-center space-x-3 text-[10px] bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200 font-medium">
                  <span className="flex items-center">
                    <span className="w-2.5 h-2.5 rounded bg-emerald-200 mr-1"></span>
                    &lt; 2.19 Sensitive
                  </span>
                  <span className="flex items-center">
                    <span className="w-2.5 h-2.5 rounded bg-amber-200 mr-1"></span>
                    2.19–4.22 Intermediate
                  </span>
                  <span className="flex items-center">
                    <span className="w-2.5 h-2.5 rounded bg-rose-200 mr-1"></span>
                    &gt; 4.22 Resistant
                  </span>
                </div>
              </div>

              {/* Matrix Container: Auto-fitting with responsive sizing */}
              {heatmapData ? (
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-[10px] text-center border-collapse font-mono select-none">
                    <thead className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-2 text-left font-sans text-[11px] bg-slate-100 sticky left-0 z-10 border-r border-slate-200 min-w-[70px]">
                          Tissue
                        </th>
                        {heatmapData.drugs.map((d) => (
                          <th 
                            key={d} 
                            className="py-2.5 px-1 font-sans font-semibold truncate max-w-[65px] border-r border-slate-200 last:border-r-0"
                            title={d}
                          >
                            {d.slice(0, 7)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {heatmapData.matrix.map((row) => (
                        <tr key={row.tissue}>
                          <td className="py-2 px-2 text-left font-sans font-bold text-slate-900 bg-slate-50 sticky left-0 z-10 border-r border-slate-200 flex items-center space-x-1">
                            <span 
                              className="w-2 h-2 rounded-full shrink-0" 
                              style={{ backgroundColor: tissueColors[row.tissue] || '#64748b' }}
                            />
                            <span>{row.tissue}</span>
                          </td>
                          {heatmapData.drugs.map((drugName) => {
                            const val = row.scores[drugName];
                            const isInspected = inspectCell?.tissue === row.tissue && inspectCell?.drug === drugName;
                            return (
                              <td
                                key={drugName}
                                onClick={() => {
                                  if (val !== undefined) {
                                    setInspectCell({
                                      tissue: row.tissue,
                                      drug: drugName,
                                      score: val
                                    });
                                  }
                                }}
                                className={`py-1.5 px-0.5 cursor-pointer transition-all border-r border-slate-200/50 last:border-r-0 ${getHeatmapColor(val)} ${
                                  isInspected ? 'ring-2 ring-teal-600 z-10 font-extrabold shadow-sm scale-105' : ''
                                }`}
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
                <div className="py-16 text-center text-xs text-slate-400 flex flex-col items-center justify-center space-y-2">
                  <Loader2 className="w-5 h-5 animate-spin text-teal-600 mb-1" />
                  <span>Loading cross-tissue sensitivity matrix...</span>
                </div>
              )}
            </div>

            {/* Anchored Interactive Matrix Inspector (4 cols) (Requirement 4) */}
            <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center">
                  <Pill className="w-3.5 h-3.5 mr-1.5 text-teal-600" /> Matrix Cell Inspector
                </span>
                {inspectCell && (
                  <span className="font-mono text-[10px] text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full font-bold">
                    {inspectCell.tissue} × {inspectCell.drug}
                  </span>
                )}
              </div>

              {inspectCell ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-base font-extrabold text-slate-900 tracking-tight">
                      {inspectCell.drug}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Tissue Lineage: <strong className="text-slate-800">{inspectCell.tissue}</strong>
                    </p>
                  </div>

                  {/* Metric Readouts */}
                  <div className="grid grid-cols-2 gap-2.5 font-mono">
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
                      <div className="text-[10px] text-slate-500 font-sans font-semibold">PREDICTED ln(IC50)</div>
                      <div className="text-xl font-extrabold text-teal-800 mt-0.5 tabular-nums">
                        {inspectCell.score.toFixed(2)}
                      </div>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
                      <div className="text-[10px] text-slate-500 font-sans font-semibold">ESTIMATED IC50</div>
                      <div className="text-xl font-extrabold text-slate-900 mt-0.5 tabular-nums">
                        {Math.exp(inspectCell.score).toFixed(2)} µM
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                    <span className="text-slate-500">Predicted Sensitivity:</span>
                    <SensitivityBadge category={getTier(inspectCell.score) as any} />
                  </div>

                  {/* Mini Dose-Response Thumbnail */}
                  <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-600 uppercase">
                      <span>4PL Response Thumbnail</span>
                      <span className="font-mono text-teal-800">IC50: {Math.exp(inspectCell.score).toFixed(2)} µM</span>
                    </div>

                    <div className="h-32 w-full bg-white rounded-lg border border-slate-200 p-1">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={inspectCurveData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                          <XAxis dataKey="conc" hide />
                          <YAxis domain={[0, 100]} hide />
                          <Tooltip 
                            formatter={(val: any) => [`${val}%`, 'Viability']}
                            contentStyle={{ fontSize: '10px', padding: '4px 8px' }}
                          />
                          <ReferenceLine y={50} stroke="#f59e0b" strokeDasharray="2 2" />
                          <Line type="monotone" dataKey="viability" stroke="#0d9488" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="text-[10px] text-slate-400 text-center font-mono">
                      Simulated Hill Curve (Inflection @ 50% kill)
                    </div>
                  </div>

                  {/* Direct Action */}
                  <button
                    onClick={() => onNavigate('prediction')}
                    className="w-full flex items-center justify-center space-x-1.5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-colors shadow-2xs cursor-pointer"
                  >
                    <span>Inspect Full Dose-Response Curve</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-slate-400">
                  Click any matrix cell on the left to inspect its values and dose-response curve.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PHARMACOGENOMIC PCA */}
      {activeTab === 'pca' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* PCA Scatter Plot (8 cols) */}
            <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center">
                    <Layers className="w-4 h-4 mr-1.5 text-teal-600" /> Cell-Line Drug Response Coordinates (969 Lines)
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Decomposed from median ln(IC50) screening profiles across 286 compounds.
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-[11px] text-slate-500 font-semibold">Tissue:</span>
                  <select
                    value={selectedTissueFilter}
                    onChange={(e) => setSelectedTissueFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-xs rounded-xl px-2.5 py-1 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
                  >
                    <option value="ALL">All Tissues (969 Lines)</option>
                    {pcaData?.tissues?.map(t => (
                      <option key={t} value={t}>{t} Lineage</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Scatter Plot */}
              <div className="h-88 w-full pt-1">
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
                    <ZAxis range={[35, 50]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '0.75rem', borderColor: '#cbd5e1', fontSize: '11px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
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

                    {pcaData?.current_sample_projection && (
                      <Scatter data={[pcaData.current_sample_projection]} fill="#0d9488" shape="star">
                        <Cell fill="#0d9488" stroke="#ffffff" strokeWidth={2} />
                      </Scatter>
                    )}
                  </RechartsScatterChart>
                </ResponsiveContainer>
              </div>

              {pcaData?.current_sample_projection && (
                <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-950 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>
                      Active Target: <strong>{pcaData.current_sample_projection.name}</strong> ({pcaData.current_sample_projection.tcga_desc})
                    </span>
                  </div>
                  <span className="font-mono text-[11px] font-bold text-teal-900 bg-white px-2 py-0.5 rounded border border-teal-200">
                    PC1: {pcaData.current_sample_projection.pc1.toFixed(2)}, PC2: {pcaData.current_sample_projection.pc2.toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            {/* PC Loadings (4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-subtle space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center">
                  <BarChart3 className="w-4 h-4 mr-1.5 text-teal-600" /> PC1 Top Chemotherapy Drivers
                </h4>
                <div className="space-y-1.5">
                  {pcaData?.top_pc1_drugs?.slice(0, 6).map((d) => (
                    <div key={d.drug_id} className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                      <div className="truncate pr-2">
                        <div className="font-bold text-slate-900 truncate">{d.drug_name}</div>
                        <div className="text-[10px] text-slate-500 truncate">{d.pathway}</div>
                      </div>
                      <span className="font-mono font-bold text-teal-800 text-xs tabular-nums shrink-0">
                        {d.loading > 0 ? `+${d.loading.toFixed(3)}` : d.loading.toFixed(3)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-subtle space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center">
                  <BarChart3 className="w-4 h-4 mr-1.5 text-indigo-600" /> PC2 Lineage Drivers
                </h4>
                <div className="space-y-1.5">
                  {pcaData?.top_pc2_drugs?.slice(0, 6).map((d) => (
                    <div key={d.drug_id} className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                      <div className="truncate pr-2">
                        <div className="font-bold text-slate-900 truncate">{d.drug_name}</div>
                        <div className="text-[10px] text-slate-500 truncate">{d.pathway}</div>
                      </div>
                      <span className="font-mono font-bold text-indigo-800 text-xs tabular-nums shrink-0">
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

      {/* TAB 3: 15 PROBE ASSAYS */}
      {activeTab === 'probes' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center">
                <Sparkles className="w-4 h-4 mr-1.5 text-amber-500" /> GDSC2 15 Probe-Drug Reference Panel
              </h3>
              <p className="text-xs text-slate-500">
                Biological fingerprints spanning diverse mechanisms across 969 cell lines.
              </p>
            </div>
            <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
              Active Tissue: {activeSample?.tcga_desc || 'PANCAN'}
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 font-mono text-[10px] text-slate-600 uppercase">
                <tr>
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3 font-sans">Probe Compound</th>
                  <th className="py-2.5 px-3 font-sans">Molecular Target</th>
                  <th className="py-2.5 px-3 font-sans">Pathway</th>
                  <th className="py-2.5 px-3 text-right">Tested Cell Lines</th>
                  <th className="py-2.5 px-3 text-right">Pan-Cancer Mean</th>
                  <th className="py-2.5 px-3 text-right">Active Tissue Mean</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {probeData.map((pb, idx) => {
                  const tMean = pb.tissue_mean_ln_ic50 !== undefined ? pb.tissue_mean_ln_ic50 : pb.overall_mean_ln_ic50;
                  return (
                    <tr key={pb.drug_id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3 text-slate-400 font-bold">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-sans font-bold text-slate-900">
                        {pb.drug_name}
                      </td>
                      <td className="py-2.5 px-3 font-sans text-slate-700">{pb.putative_target}</td>
                      <td className="py-2.5 px-3 font-sans text-slate-500">{pb.pathway_name}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-800">{pb.cell_lines_tested} / 969</td>
                      <td className="py-2.5 px-3 text-right text-slate-700">{pb.overall_mean_ln_ic50.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-teal-800">
                        {tMean !== null ? Number(tMean).toFixed(2) : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
