import React, { useState, useEffect, useMemo } from 'react';
import { 
  Dna, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Activity, 
  AlertCircle, 
  BarChart2, 
  HelpCircle,
  CheckCircle,
  Flame,
  ArrowRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { api } from '../services/api';
import { Sample } from '../types';
import { SampleTypeBadge } from '../components/SampleTypeBadge';

interface MolecularProfileProps {
  sampleId: string;
  samples: Sample[];
  onSampleChange: (id: string) => void;
  onNavigate: (page: string) => void;
}

export const MolecularProfile: React.FC<MolecularProfileProps> = ({
  sampleId,
  samples,
  onSampleChange,
  onNavigate
}) => {
  const [sampleDetail, setSampleDetail] = useState<Sample | null>(null);
  const [l1000Genes, setL1000Genes] = useState<Array<{ symbol: string; entrez_id: string; pathway: string }>>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [pathwayFilter, setPathwayFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'expr-desc' | 'expr-asc' | 'sym-asc'>('expr-desc');
  const [loading, setLoading] = useState(true);

  // Load sample detail and L1000 genes
  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.getSample(sampleId),
      api.getL1000Genes()
    ])
      .then(([s, genes]) => {
        setSampleDetail(s);
        setL1000Genes(genes);
      })
      .catch(err => console.error("Error fetching molecular profile:", err))
      .finally(() => setLoading(false));
  }, [sampleId]);

  // Merge sample expression with L1000 gene metadata
  const geneRows = useMemo(() => {
    if (!sampleDetail || !sampleDetail.expression) return [];
    const expr = sampleDetail.expression;
    const values = Object.values(expr);
    const mean = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 7.0;
    const std = values.length ? Math.sqrt(values.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / values.length) : 1.0;

    const rows = l1000Genes.map(g => {
      const val = expr[g.symbol];
      const hasValue = val !== undefined && val !== null;
      const numericVal = hasValue ? val : 7.0;
      const zScore = (numericVal - mean) / (std > 0 ? std : 1.0);
      const isOutlier = Math.abs(zScore) > 3.0;

      return {
        symbol: g.symbol,
        entrez_id: g.entrez_id,
        pathway: g.pathway,
        expression: hasValue ? Number(numericVal.toFixed(3)) : null,
        zScore: Number(zScore.toFixed(2)),
        isOutlier,
        isImputed: !hasValue
      };
    });

    return rows;
  }, [sampleDetail, l1000Genes]);

  // Unique pathways for filter
  const pathways = useMemo(() => {
    const pSet = new Set<string>();
    l1000Genes.forEach(g => pSet.add(g.pathway));
    return ['ALL', ...Array.from(pSet).sort()];
  }, [l1000Genes]);

  // Filtered and sorted rows
  const filteredRows = useMemo(() => {
    let list = [...geneRows];

    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      list = list.filter(r => 
        r.symbol.toLowerCase().includes(q) || 
        r.pathway.toLowerCase().includes(q) ||
        r.entrez_id.includes(q)
      );
    }

    if (pathwayFilter !== 'ALL') {
      list = list.filter(r => r.pathway === pathwayFilter);
    }

    if (sortBy === 'expr-desc') {
      list.sort((a, b) => (b.expression ?? -999) - (a.expression ?? -999));
    } else if (sortBy === 'expr-asc') {
      list.sort((a, b) => (a.expression ?? 999) - (b.expression ?? 999));
    } else if (sortBy === 'sym-asc') {
      list.sort((a, b) => a.symbol.localeCompare(b.symbol));
    }

    return list;
  }, [geneRows, searchTerm, pathwayFilter, sortBy]);

  // Distribution bins for chart
  const distributionData = useMemo(() => {
    if (!sampleDetail?.expression) return [];
    const vals = Object.values(sampleDetail.expression);
    if (!vals.length) return [];

    const min = Math.floor(Math.min(...vals));
    const max = Math.ceil(Math.max(...vals));
    const binCount = 10;
    const step = (max - min) / binCount;

    const bins = Array.from({ length: binCount }, (_, i) => {
      const bMin = min + i * step;
      const bMax = bMin + step;
      return {
        bin: `${bMin.toFixed(1)}-${bMax.toFixed(1)}`,
        count: 0,
        bMin,
        bMax
      };
    });

    vals.forEach(v => {
      for (const b of bins) {
        if (v >= b.bMin && v <= b.bMax) {
          b.count++;
          break;
        }
      }
    });

    return bins;
  }, [sampleDetail]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center">
            <Dna className="w-6 h-6 mr-2.5 text-teal-400" />
            Molecular Profile & L1000 Expression Architecture
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Analyzing 978 L1000 landmark gene expression values, pathway annotations, z-scores, and quality control indicators.
          </p>
        </div>

        <button
          onClick={() => onNavigate('prediction')}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-xs transition-all shadow-md shadow-teal-500/20 active:scale-95 shrink-0"
        >
          <span>Proceed to Prediction</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Transcriptomic Scope Notice */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-start space-x-3">
        <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div className="text-slate-300 leading-relaxed">
          <span className="font-semibold text-white">Transcriptomic Scope Notice:</span> Displays <span className="text-cyan-300 font-medium">mRNA transcript abundance (log2 expression)</span> for the 978 LINCS L1000 landmark genes. It does <span className="font-semibold text-white">not</span> report genomic variant calls, point mutations (e.g. SNVs), or copy number amplifications (CNVs) unless annotated in the sample descriptor.
        </div>
      </div>

      {/* Quality Control Metrics Strip */}
      {sampleDetail?.quality && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="text-[11px] text-slate-400">Landmark Coverage</div>
            <div className="text-xl font-bold text-teal-300 font-mono mt-1">
              {sampleDetail.quality.l1000_landmark_matched} / 978
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">{sampleDetail.quality.l1000_coverage_percent}% coverage</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="text-[11px] text-slate-400">Mean Expression</div>
            <div className="text-xl font-bold text-white font-mono mt-1">
              {sampleDetail.quality.mean_expression}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">log2 scale baseline</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="text-[11px] text-slate-400">Standard Deviation</div>
            <div className="text-xl font-bold text-white font-mono mt-1">
              {sampleDetail.quality.std_expression}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">variance across profile</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="text-[11px] text-slate-400">Expression Range</div>
            <div className="text-xl font-bold text-white font-mono mt-1">
              {sampleDetail.quality.min_expression} - {sampleDetail.quality.max_expression}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">min to max bounds</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="text-[11px] text-slate-400">Outliers (|z| &gt; 3)</div>
            <div className="text-xl font-bold text-amber-400 font-mono mt-1">
              {sampleDetail.quality.outlier_count}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">genes outside 3 std devs</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="text-[11px] text-slate-400">Sample Classification</div>
            <div className="mt-1.5 truncate">
              <SampleTypeBadge type={sampleDetail.sample_type} />
            </div>
          </div>
        </div>
      )}

      {/* Full-Width Expression Density Histogram */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center">
            <BarChart2 className="w-4 h-4 mr-2 text-teal-400" />
            L1000 Expression Density Histogram
          </h3>
          <span className="text-xs text-slate-500 font-mono">Binned Log2 Frequencies</span>
        </div>

        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={distributionData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <XAxis dataKey="bin" stroke="#64748b" fontSize={10} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                formatter={(val: any) => [`${val} genes`, 'Frequency']}
              />
              <Bar dataKey="count" fill="#14b8a6" radius={[4, 4, 0, 0]}>
                {distributionData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={index > 7 ? '#f59e0b' : '#0d9488'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800/60">
          <span>Normal biological baseline typically centers between 6.0 and 8.5 log2 intensity.</span>
          <span className="text-amber-400 font-medium">Orange bins indicate hyper-expressed oncogenic outliers.</span>
        </div>
      </div>

      {/* L1000 Expression Table */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Landmark Genes Expression Table
            </h3>
            <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-mono">
              {filteredRows.length} displayed
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search gene or pathway..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 w-48 sm:w-56"
              />
            </div>

            {/* Pathway Filter */}
            <select
              value={pathwayFilter}
              onChange={(e) => setPathwayFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-teal-500 max-w-[180px] truncate"
            >
              <option value="ALL">All Pathways</option>
              {pathways.filter(p => p !== 'ALL').map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-teal-500"
            >
              <option value="expr-desc">Highest Expression</option>
              <option value="expr-asc">Lowest Expression</option>
              <option value="sym-asc">Symbol (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto max-h-[480px] rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 sticky top-0 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Gene Symbol</th>
                <th className="py-3 px-4">Entrez ID</th>
                <th className="py-3 px-4">Signaling Pathway / Category</th>
                <th className="py-3 px-4 text-right">Log2 Expression</th>
                <th className="py-3 px-4 text-right">Z-Score</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredRows.slice(0, 100).map((row) => (
                <tr key={row.symbol} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-4 font-bold text-white font-sans flex items-center space-x-1.5">
                    <span>{row.symbol}</span>
                    {row.isOutlier && (
                      <span title="Outlier expression (|z| > 3)">
                        <Flame className="w-3.5 h-3.5 text-amber-400" />
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-slate-400">{row.entrez_id}</td>
                  <td className="py-2.5 px-4 text-slate-300 font-sans truncate max-w-xs">{row.pathway}</td>
                  <td className="py-2.5 px-4 text-right font-bold text-teal-300">
                    {row.expression !== null ? row.expression.toFixed(3) : 'Imputed 7.000'}
                  </td>
                  <td className={`py-2.5 px-4 text-right font-semibold ${
                    row.zScore > 2 ? 'text-amber-400' : row.zScore < -2 ? 'text-cyan-400' : 'text-slate-400'
                  }`}>
                    {row.zScore > 0 ? `+${row.zScore}` : row.zScore}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    {row.isOutlier ? (
                      <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded font-sans">
                        Outlier
                      </span>
                    ) : (
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-sans">
                        Norm
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredRows.length > 100 && (
          <div className="text-[11px] text-slate-500 text-center font-mono pt-1">
            Displaying top 100 of {filteredRows.length} filtered genes.
          </div>
        )}
      </div>
    </div>
  );
};
