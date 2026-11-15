import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart3, 
  ScatterChart, 
  Layers, 
  Info, 
  Flame, 
  Sliders, 
  Sparkles, 
  AlertTriangle,
  HelpCircle,
  Activity,
  Grid
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
  Bar
} from 'recharts';
import { api } from '../services/api';
import { PCALandscape, HMMData, HeatmapData, Sample } from '../types';

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
  const [activeTab, setActiveTab] = useState<'pca' | 'heatmap' | 'hmm'>('pca');
  const [pcaData, setPcaData] = useState<PCALandscape | null>(null);
  const [hmmData, setHmmData] = useState<HMMData | null>(null);
  const [heatmapData, setHeatmapData] = useState<HeatmapData | null>(null);
  const [selectedTissueFilter, setSelectedTissueFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Load analytics data
  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.getPCA(sampleId),
      api.getHMM(),
      api.getHeatmap(12)
    ])
      .then(([pca, hmm, heat]) => {
        setPcaData(pca);
        setHmmData(hmm);
        setHeatmapData(heat);
      })
      .catch(err => console.error("Error loading analytics data:", err))
      .finally(() => setLoading(false));
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
    UNKNOWN: '#64748b'
  };

  const filteredPcaSamples = useMemo(() => {
    if (!pcaData?.samples) return [];
    if (selectedTissueFilter === 'ALL') return pcaData.samples;
    return pcaData.samples.filter(s => s.tcga_desc === selectedTissueFilter);
  }, [pcaData, selectedTissueFilter]);

  const getHeatmapColor = (score: number) => {
    if (score < 2.0) return 'bg-emerald-100 text-emerald-950 font-bold border-r border-emerald-200/50';
    if (score < 3.2) return 'bg-teal-50 text-teal-900 border-r border-teal-100';
    if (score < 4.5) return 'bg-amber-50 text-amber-900 border-r border-amber-100';
    return 'bg-rose-100 text-rose-950 font-bold border-r border-rose-200/50';
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center">
            <BarChart3 className="w-6 h-6 mr-2.5 text-teal-600" />
            Visual Analytics: PCA Landscape, Cross-Tissue Heatmap & HMM
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Multivariate dimensionality reduction, pharmacogenomic sensitivity heatmaps, and exploratory Hidden Markov Models.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          <button
            onClick={() => setActiveTab('pca')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'pca'
                ? 'bg-white text-teal-800 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            A. PCA Landscape
          </button>
          <button
            onClick={() => setActiveTab('heatmap')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'heatmap'
                ? 'bg-white text-teal-800 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            B. Drug Heatmap
          </button>
          <button
            onClick={() => setActiveTab('hmm')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'hmm'
                ? 'bg-white text-teal-800 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            C. Exploratory HMM
          </button>
        </div>
      </div>

      {/* TAB A: PCA */}
      {activeTab === 'pca' && (
        <div className="space-y-6 animate-fadeIn">
          {/* PCA Metrics Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
              <div className="text-xs text-slate-500 font-medium">PC1 Explained Variance</div>
              <div className="text-2xl font-extrabold text-teal-700 font-mono mt-1">
                {pcaData ? (pcaData.pc1_variance * 100).toFixed(2) : "38.45"}%
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Captures primary pan-drug sensitivity gradient</div>
            </div>

            <div className="p-5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
              <div className="text-xs text-slate-500 font-medium">PC2 Explained Variance</div>
              <div className="text-2xl font-extrabold text-teal-600 font-mono mt-1">
                {pcaData ? (pcaData.pc2_variance * 100).toFixed(2) : "4.40"}%
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Captures pathway-specific selectivity</div>
            </div>

            <div className="p-5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
              <div className="text-xs text-slate-500 font-medium">Reference Cell Lines & Drugs</div>
              <div className="text-2xl font-extrabold text-slate-900 font-mono mt-1">
                {pcaData?.total_cell_lines || 963} Cell Lines
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Across 295 screened therapeutics</div>
            </div>
          </div>

          {/* Scatter Chart & Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                    2D Pharmacogenomic PCA Projection (PC1 vs PC2)
                  </h3>
                  <span className="text-xs text-slate-500">
                    Showing {filteredPcaSamples.length} reference cell lines
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-500 font-medium">Filter Tissue:</span>
                  <select
                    value={selectedTissueFilter}
                    onChange={(e) => setSelectedTissueFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value="ALL">All Tissues</option>
                    {pcaData?.tissues.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Scatter Plot */}
              <div className="h-96 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                    <XAxis 
                      type="number" 
                      dataKey="pc1" 
                      name="PC1" 
                      stroke="#94a3b8" 
                      fontSize={10} 
                      label={{ value: 'Principal Component 1 (38.45% Variance)', position: 'insideBottom', offset: -10, fill: '#64748b', fontSize: 11 }}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="pc2" 
                      name="PC2" 
                      stroke="#94a3b8" 
                      fontSize={10} 
                      label={{ value: 'Principal Component 2 (4.40% Variance)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }}
                    />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }} 
                      content={({ payload }) => {
                        if (!payload || !payload.length) return null;
                        const data = payload[0].payload;
                        return (
                          <div className="p-3 bg-white border border-slate-200 rounded-lg text-xs space-y-1 shadow-md font-mono">
                            <div className="font-bold text-slate-900 font-sans">{data.name}</div>
                            <div className="text-teal-700 font-semibold">Tissue: {data.tcga_desc}</div>
                            <div className="text-slate-500">ID: {data.sample_id}</div>
                            <div className="text-slate-600">PC1: {data.pc1} | PC2: {data.pc2}</div>
                          </div>
                        );
                      }}
                    />
                    <Scatter name="Cell Lines" data={filteredPcaSamples}>
                      {filteredPcaSamples.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={tissueColors[entry.tcga_desc] || '#0d9488'} 
                          fillOpacity={0.65}
                        />
                      ))}
                    </Scatter>

                    {pcaData?.current_sample_projection && (
                      <Scatter 
                        name="Active Sample" 
                        data={[pcaData.current_sample_projection]} 
                        fill="#0284c7" 
                        shape="cross"
                      />
                    )}
                  </RechartsScatterChart>
                </ResponsiveContainer>
              </div>

              {/* Legend of Tissue Colors */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 text-[10px]">
                {Object.entries(tissueColors).slice(0, 10).map(([t, color]) => (
                  <div key={t} className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-slate-50 border border-slate-200">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></span>
                    <span className="font-mono text-slate-700">{t}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Loadings on PC1 & PC2 (4 cols) */}
            <div className="lg:col-span-4 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-5">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  Top PC1 Drug Loadings
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Compounds driving primary sensitivity separation
                </p>

                <div className="mt-3 space-y-2">
                  {pcaData?.top_pc1_drugs.slice(0, 6).map((d) => (
                    <div key={d.drug_id} className="p-2.5 bg-slate-50 hover:bg-slate-100/70 border border-slate-100 rounded-lg text-xs flex items-center justify-between transition-colors">
                      <div className="truncate max-w-[170px]">
                        <span className="font-semibold text-slate-900 block truncate">{d.drug_name}</span>
                        <span className="text-[10px] text-slate-500 truncate block">{d.pathway}</span>
                      </div>
                      <span className="font-mono font-bold text-teal-700 text-[11px]">
                        {d.loading.toFixed(3)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  Top PC2 Drug Loadings
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Compounds driving pathway-specific divergence
                </p>

                <div className="mt-3 space-y-2">
                  {pcaData?.top_pc2_drugs.slice(0, 5).map((d) => (
                    <div key={d.drug_id} className="p-2.5 bg-slate-50 hover:bg-slate-100/70 border border-slate-100 rounded-lg text-xs flex items-center justify-between transition-colors">
                      <div className="truncate max-w-[170px]">
                        <span className="font-semibold text-slate-900 block truncate">{d.drug_name}</span>
                        <span className="text-[10px] text-slate-500 truncate block">{d.pathway}</span>
                      </div>
                      <span className="font-mono font-bold text-teal-600 text-[11px]">
                        {d.loading.toFixed(3)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB B: Drug Response Heatmap */}
      {activeTab === 'heatmap' && heatmapData && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center">
                <Grid className="w-4 h-4 mr-2 text-teal-600" />
                Cross-Tissue Chemotherapy Sensitivity Heatmap
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Predicted ln(IC50) across 10 major cancer tissues and 15 benchmark anticancer agents
              </p>
            </div>
            <div className="flex items-center space-x-2 text-[10px]">
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">Sensitive (&lt; 2.0)</span>
              <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-800 font-medium border border-teal-200">Intermediate</span>
              <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-semibold border border-rose-200">Resistant (&gt; 4.5)</span>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-xs text-center border-collapse">
              <thead className="bg-slate-50 text-slate-600 sticky top-0 font-semibold font-mono border-b border-slate-200">
                <tr>
                  <th className="p-3 text-left bg-slate-50 border-r border-slate-200 font-sans">Cancer Tissue</th>
                  {heatmapData.drugs.map(d => (
                    <th key={d} className="p-2.5 font-sans font-medium text-[11px] truncate max-w-[100px] border-r border-slate-200/80 text-slate-700">
                      {d}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {heatmapData.matrix.map((row) => (
                  <tr key={row.tissue} className="hover:opacity-90 transition-opacity">
                    <td className="p-3 text-left font-bold text-slate-900 bg-slate-50 border-r border-slate-200 font-sans">
                      {row.tissue}
                    </td>
                    {heatmapData.drugs.map(drug => {
                      const val = row.scores[drug];
                      return (
                        <td key={drug} className={`p-2.5 ${getHeatmapColor(val)}`}>
                          {val !== undefined ? val.toFixed(2) : '-'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB C: Exploratory HMM */}
      {activeTab === 'hmm' && hmmData && (
        <div className="space-y-6 animate-fadeIn">
          {/* HMM Scientific Caveat Alert */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1.5">
            <div className="flex items-center space-x-2 text-sm font-semibold text-amber-950">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Scientific Caveat: Artificial Sequence Ordering Convention</span>
            </div>
            <p className="leading-relaxed">
              {hmmData.scientific_limitation}
              Different drugs are <strong className="text-slate-900">not sequential time steps</strong>, and numeric <code className="bg-amber-100/70 px-1 py-0.5 rounded text-amber-900 font-mono">DRUG_ID</code> ordering is purely an arbitrary catalog convention. Hidden states (State 0, State 1, State 2) represent latent statistical clusters along this convention, <strong className="text-slate-900">not biological progression or clinical resistance evolution</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Transition Matrix */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                3-State Transition Probability Matrix
              </h3>
              <p className="text-xs text-slate-500">
                Probability of moving to next hidden state given current state along DRUG_ID sequence
              </p>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-xs text-center border-collapse font-mono">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="p-3 text-left font-sans">Current \ Next</th>
                      <th className="p-3">State 0</th>
                      <th className="p-3">State 1</th>
                      <th className="p-3">State 2</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {hmmData.transition_matrix.map((row, i) => (
                      <tr key={i}>
                        <td className="p-3 text-left font-sans font-bold text-slate-900 bg-slate-50 border-r border-slate-200">
                          State {i}
                        </td>
                        {row.map((prob, j) => (
                          <td 
                            key={j} 
                            className={`p-3 font-bold border-r border-slate-100 last:border-r-0 ${
                              prob > 0.8 ? 'bg-teal-50 text-teal-800' : 'text-slate-600'
                            }`}
                          >
                            {prob.toFixed(4)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Emission Matrix */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Emission Probabilities (Observed ln IC50 Tertiles)
              </h3>
              <p className="text-xs text-slate-500">
                Probability of observing Lower, Middle, or Higher ln(IC50) for each hidden state
              </p>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-xs text-center border-collapse font-mono">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="p-3 text-left font-sans">Hidden State</th>
                      <th className="p-3 text-emerald-700">Lower ln(IC50)</th>
                      <th className="p-3 text-teal-700">Middle Category</th>
                      <th className="p-3 text-rose-700">Higher ln(IC50)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {hmmData.emission_matrix.map((row, i) => (
                      <tr key={i}>
                        <td className="p-3 text-left font-sans font-bold text-slate-900 bg-slate-50 border-r border-slate-200">
                          State {i}
                        </td>
                        {row.map((prob, j) => (
                          <td 
                            key={j} 
                            className={`p-3 font-bold border-r border-slate-100 last:border-r-0 ${
                              prob > 0.45 ? 'bg-teal-50 text-teal-800' : 'text-slate-600'
                            }`}
                          >
                            {prob.toFixed(4)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="text-[11px] text-slate-600 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                • Tertile 1 cut-off: <span className="font-mono text-slate-900 font-semibold">{hmmData.tertile_1_boundary}</span> ln(IC50)<br />
                • Tertile 2 cut-off: <span className="font-mono text-slate-900 font-semibold">{hmmData.tertile_2_boundary}</span> ln(IC50)<br />
                • Total Sequence Log-Likelihood: <span className="font-mono text-slate-900 font-semibold">{hmmData.log_likelihood}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
