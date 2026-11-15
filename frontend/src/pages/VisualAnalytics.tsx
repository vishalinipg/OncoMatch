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
    BRCA: '#79AC78',
    LUAD: '#B0D9B1',
    COREAD: '#D0E7D2',
    SKCM: '#eab308',
    GBM: '#a855f7',
    PAAD: '#618264',
    OV: '#38bdf8',
    LAML: '#f43f5e',
    PRAD: '#8b5cf6',
    KIRC: '#10b981',
    UNKNOWN: '#64748b'
  };

  const filteredPcaSamples = useMemo(() => {
    if (!pcaData?.samples) return [];
    if (selectedTissueFilter === 'ALL') return pcaData.samples;
    return pcaData.samples.filter(s => s.tcga_desc === selectedTissueFilter);
  }, [pcaData, selectedTissueFilter]);

  const getHeatmapColor = (score: number) => {
    if (score < 2.0) return 'bg-[#79AC78] text-slate-950 font-bold';
    if (score < 3.2) return 'bg-[#618264]/40 text-[#D0E7D2]';
    if (score < 4.5) return 'bg-amber-500/40 text-white';
    return 'bg-rose-500/60 text-white font-bold';
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center">
            <BarChart3 className="w-6 h-6 mr-2.5 text-[#79AC78]" />
            Visual Analytics: PCA Landscape, Cross-Tissue Heatmap & HMM
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Multivariate dimensionality reduction, pharmacogenomic sensitivity heatmaps, and exploratory Hidden Markov Models.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('pca')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'pca'
                ? 'bg-[#79AC78] text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            A. PCA Landscape
          </button>
          <button
            onClick={() => setActiveTab('heatmap')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'heatmap'
                ? 'bg-[#79AC78] text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            B. Drug Heatmap
          </button>
          <button
            onClick={() => setActiveTab('hmm')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'hmm'
                ? 'bg-[#79AC78] text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
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
            <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="text-xs text-slate-400">PC1 Explained Variance</div>
              <div className="text-2xl font-extrabold text-[#D0E7D2] font-mono mt-1">
                {pcaData ? (pcaData.pc1_variance * 100).toFixed(2) : "38.45"}%
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Captures primary pan-drug sensitivity gradient</div>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="text-xs text-slate-400">PC2 Explained Variance</div>
              <div className="text-2xl font-extrabold text-[#B0D9B1] font-mono mt-1">
                {pcaData ? (pcaData.pc2_variance * 100).toFixed(2) : "4.40"}%
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Captures pathway-specific selectivity</div>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="text-xs text-slate-400">Reference Cell Lines & Drugs</div>
              <div className="text-2xl font-extrabold text-white font-mono mt-1">
                {pcaData?.total_cell_lines || 963} Cell Lines
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Across 295 screened therapeutics</div>
            </div>
          </div>

          {/* Scatter Chart & Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                    2D Pharmacogenomic PCA Projection (PC1 vs PC2)
                  </h3>
                  <span className="text-xs text-slate-400">
                    Showing {filteredPcaSamples.length} reference cell lines
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-500">Filter Tissue:</span>
                  <select
                    value={selectedTissueFilter}
                    onChange={(e) => setSelectedTissueFilter(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-[#79AC78]"
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
                      stroke="#64748b" 
                      fontSize={10} 
                      label={{ value: 'Principal Component 1 (38.45% Variance)', position: 'insideBottom', offset: -10, fill: '#94a3b8', fontSize: 11 }}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="pc2" 
                      name="PC2" 
                      stroke="#64748b" 
                      fontSize={10} 
                      label={{ value: 'Principal Component 2 (4.40% Variance)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }}
                    />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }} 
                      content={({ payload }) => {
                        if (!payload || !payload.length) return null;
                        const data = payload[0].payload;
                        return (
                          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs space-y-1 shadow-lg font-mono">
                            <div className="font-bold text-white font-sans">{data.name}</div>
                            <div className="text-[#B0D9B1]">Tissue: {data.tcga_desc}</div>
                            <div className="text-slate-400">ID: {data.sample_id}</div>
                            <div className="text-slate-300">PC1: {data.pc1} | PC2: {data.pc2}</div>
                          </div>
                        );
                      }}
                    />
                    <Scatter name="Cell Lines" data={filteredPcaSamples}>
                      {filteredPcaSamples.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={tissueColors[entry.tcga_desc] || '#79AC78'} 
                          fillOpacity={0.65}
                        />
                      ))}
                    </Scatter>

                    {pcaData?.current_sample_projection && (
                      <Scatter 
                        name="Active Sample" 
                        data={[pcaData.current_sample_projection]} 
                        fill="#D0E7D2" 
                        shape="cross"
                      />
                    )}
                  </RechartsScatterChart>
                </ResponsiveContainer>
              </div>

              {/* Legend of Tissue Colors */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800/80 text-[10px]">
                {Object.entries(tissueColors).slice(0, 10).map(([t, color]) => (
                  <div key={t} className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-slate-950/60 border border-slate-800">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></span>
                    <span className="font-mono text-slate-300">{t}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Loadings on PC1 & PC2 (4 cols) */}
            <div className="lg:col-span-4 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Top PC1 Drug Loadings
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Compounds driving primary sensitivity separation
                </p>

                <div className="mt-3 space-y-2">
                  {pcaData?.top_pc1_drugs.slice(0, 6).map((d) => (
                    <div key={d.drug_id} className="p-2 bg-slate-950/70 rounded-lg text-xs flex items-center justify-between">
                      <div className="truncate max-w-[170px]">
                        <span className="font-semibold text-white block truncate">{d.drug_name}</span>
                        <span className="text-[10px] text-slate-500 truncate block">{d.pathway}</span>
                      </div>
                      <span className="font-mono font-bold text-[#79AC78] text-[11px]">
                        {d.loading.toFixed(3)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Top PC2 Drug Loadings
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Compounds driving pathway-specific divergence
                </p>

                <div className="mt-3 space-y-2">
                  {pcaData?.top_pc2_drugs.slice(0, 5).map((d) => (
                    <div key={d.drug_id} className="p-2 bg-slate-950/70 rounded-lg text-xs flex items-center justify-between">
                      <div className="truncate max-w-[170px]">
                        <span className="font-semibold text-white block truncate">{d.drug_name}</span>
                        <span className="text-[10px] text-slate-500 truncate block">{d.pathway}</span>
                      </div>
                      <span className="font-mono font-bold text-[#B0D9B1] text-[11px]">
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
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center">
                <Grid className="w-4 h-4 mr-2 text-[#79AC78]" />
                Cross-Tissue Chemotherapy Sensitivity Heatmap
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Predicted ln(IC50) across 10 major cancer tissues and 15 benchmark anticancer agents
              </p>
            </div>
            <div className="flex items-center space-x-2 text-[10px]">
              <span className="px-2 py-0.5 rounded bg-[#79AC78] text-slate-950 font-bold">Sensitive (&lt; 2.0)</span>
              <span className="px-2 py-0.5 rounded bg-[#618264]/40 text-[#D0E7D2]">Intermediate</span>
              <span className="px-2 py-0.5 rounded bg-rose-500/60 text-white font-bold">Resistant (&gt; 4.5)</span>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-xs text-center border-collapse">
              <thead className="bg-slate-950 text-slate-400 sticky top-0 font-semibold font-mono">
                <tr>
                  <th className="p-3 text-left bg-slate-950 border-r border-slate-800 font-sans">Cancer Tissue</th>
                  {heatmapData.drugs.map(d => (
                    <th key={d} className="p-2.5 font-sans font-medium text-[11px] truncate max-w-[100px] border-r border-slate-800/60">
                      {d}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
                {heatmapData.matrix.map((row) => (
                  <tr key={row.tissue} className="hover:opacity-90">
                    <td className="p-3 text-left font-bold text-white bg-slate-950 border-r border-slate-800 font-sans">
                      {row.tissue}
                    </td>
                    {heatmapData.drugs.map(drug => {
                      const val = row.scores[drug];
                      return (
                        <td key={drug} className={`p-2.5 border-r border-slate-800/40 ${getHeatmapColor(val)}`}>
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
          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-200/90 text-xs space-y-1.5">
            <div className="flex items-center space-x-2 text-sm font-semibold text-amber-300">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Scientific Caveat: Artificial Sequence Ordering Convention</span>
            </div>
            <p className="leading-relaxed">
              {hmmData.scientific_limitation}
              Different drugs are <strong className="text-white">not sequential time steps</strong>, and numeric <code className="bg-slate-900 px-1 py-0.5 rounded text-amber-300">DRUG_ID</code> ordering is purely an arbitrary catalog convention. Hidden states (State 0, State 1, State 2) represent latent statistical clusters along this convention, <strong className="text-white">not biological progression or clinical resistance evolution</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Transition Matrix */}
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                3-State Transition Probability Matrix
              </h3>
              <p className="text-xs text-slate-400">
                Probability of moving to next hidden state given current state along DRUG_ID sequence
              </p>

              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-xs text-center border-collapse font-mono">
                  <thead className="bg-slate-950 text-slate-400">
                    <tr>
                      <th className="p-3 text-left font-sans">Current \ Next</th>
                      <th className="p-3">State 0</th>
                      <th className="p-3">State 1</th>
                      <th className="p-3">State 2</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {hmmData.transition_matrix.map((row, i) => (
                      <tr key={i}>
                        <td className="p-3 text-left font-sans font-bold text-white bg-slate-950">
                          State {i}
                        </td>
                        {row.map((prob, j) => (
                          <td 
                            key={j} 
                            className={`p-3 font-bold ${
                              prob > 0.8 ? 'bg-[#618264]/30 text-[#D0E7D2]' : 'text-slate-300'
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
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Emission Probabilities (Observed ln IC50 Tertiles)
              </h3>
              <p className="text-xs text-slate-400">
                Probability of observing Lower, Middle, or Higher ln(IC50) for each hidden state
              </p>

              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-xs text-center border-collapse font-mono">
                  <thead className="bg-slate-950 text-slate-400">
                    <tr>
                      <th className="p-3 text-left font-sans">Hidden State</th>
                      <th className="p-3 text-[#B0D9B1]">Lower ln(IC50)</th>
                      <th className="p-3 text-[#D0E7D2]">Middle Category</th>
                      <th className="p-3 text-rose-400">Higher ln(IC50)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {hmmData.emission_matrix.map((row, i) => (
                      <tr key={i}>
                        <td className="p-3 text-left font-sans font-bold text-white bg-slate-950">
                          State {i}
                        </td>
                        {row.map((prob, j) => (
                          <td 
                            key={j} 
                            className={`p-3 font-bold ${
                              prob > 0.45 ? 'bg-[#618264]/30 text-[#D0E7D2]' : 'text-slate-300'
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

              <div className="text-[11px] text-slate-400 bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                • Tertile 1 cut-off: <span className="font-mono text-white">{hmmData.tertile_1_boundary}</span> ln(IC50)<br />
                • Tertile 2 cut-off: <span className="font-mono text-white">{hmmData.tertile_2_boundary}</span> ln(IC50)<br />
                • Total Sequence Log-Likelihood: <span className="font-mono text-white">{hmmData.log_likelihood}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
