import React, { useState } from 'react';
import { 
  Activity, 
  FlaskConical, 
  Pill, 
  BarChart3, 
  FileText, 
  Database, 
  Cpu, 
  CheckCircle2, 
  ArrowRight,
  TrendingDown,
  Layers,
  Sparkles,
  ShieldCheck,
  Award,
  Settings2,
  ExternalLink,
  ChevronRight,
  Info
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

import { Sample } from '../types';

interface DashboardOverviewProps {
  onNavigate: (page: string) => void;
  samples?: Sample[];
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ onNavigate, samples }) => {
  const [activeScenario, setActiveScenario] = useState<'all' | 'holdout'>('holdout');

  // Benchmark comparison data across models on holdout cell lines (from notebook Unit 12 & PBL-III)
  const benchmarkModels = [
    { name: 'Global Mean Baseline', testMae: '2.1080', r2: '0.0000', rmse: '2.6120', status: 'Uninformative', highlight: false },
    { name: 'CART Decision Tree', testMae: '1.4580', r2: '0.5120', rmse: '1.8210', status: 'Scenario A (Baseline)', highlight: false },
    { name: 'Ridge Regression (L2)', testMae: '1.6420', r2: '0.3950', rmse: '2.0310', status: 'Scenario A (Linear)', highlight: false },
    { name: 'Random Forest (100 Trees)', testMae: '1.2150', r2: '0.6520', rmse: '1.5470', status: 'Scenario A (Ensemble)', highlight: false },
    { name: 'HistGradientBoosting (Scenario B)', testMae: '1.0270', r2: '0.7585', rmse: '1.3612', status: 'Production Candidate', highlight: true },
  ];

  // Pan-cancer sensitivity distribution overview for the fitted curves in GDSC2
  const sensitivityDistribution = [
    { bin: '< 0.0 (Potent)', count: 24, fill: '#059669', pct: '8.4%', label: 'Lower Tertile (High Sensitivity)' },
    { bin: '0.0 - 1.5 (Sensitive)', count: 58, fill: '#10b981', pct: '20.3%', label: 'Sensitive' },
    { bin: '1.5 - 3.0 (Moderate)', count: 96, fill: '#0d9488', pct: '33.6%', label: 'Moderate' },
    { bin: '3.0 - 4.5 (Intermediate)', count: 72, fill: '#f59e0b', pct: '25.2%', label: 'Intermediate' },
    { bin: '4.5 - 6.0 (Resistant)', count: 32, fill: '#f43f5e', pct: '11.2%', label: 'Upper Tertile (Resistant)' },
    { bin: '> 6.0 (Refractory)', count: 13, fill: '#e11d48', pct: '4.5%', label: 'Refractory' },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Hero Header Section */}
      <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200/90 shadow-elevated p-8 sm:p-10 clinical-mesh-bg">
        {/* Subtle decorative glow element */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-gradient-to-br from-teal-400/10 to-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-900 text-xs font-semibold shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
            <span>Computational Oncology & Pharmacogenomic Sensitivity Modeling</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Personalized Chemotherapy Drug Response Prediction
            </h1>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-normal">
              Analyze in-silico chemotherapy sensitivity across <strong className="text-slate-900 font-semibold">969 cancer cell lines</strong>, <strong className="text-slate-900 font-semibold">286 anticancer therapeutics</strong>, and <strong className="text-slate-900 font-semibold">33 TCGA lineages</strong>. Powered by an authoritative HistGradientBoosting regression pipeline trained on <strong className="text-slate-900 font-semibold">242,036 fitted dose-response curves</strong> from the Wellcome Sanger Institute GDSC2 release.
            </p>
          </div>

          {/* Scientific Scope Notice */}
          <div className="p-3.5 bg-slate-50/90 border border-teal-200/70 rounded-2xl text-xs text-slate-700 flex items-start space-x-3 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <strong className="text-slate-900 font-semibold">Pre-Exposure In-Silico Pipeline:</strong>
              <p className="text-slate-600 leading-relaxed">
                Predicts fitted <code className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-teal-800 font-mono font-semibold">ln(IC50)</code> using chemical descriptors, putative targets, screening bounds, and lineage tissue origin. Strictly operates without fabricating synthetic patient omics.
              </p>
            </div>
          </div>

          {/* Prominent CTA Hierarchy */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('prediction')}
              className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-teal-600/20 active:scale-98 cursor-pointer group"
            >
              <Pill className="w-4 h-4" />
              <span>Predict Drug Sensitivity</span>
              <ArrowRight className="w-4 h-4 ml-0.5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => onNavigate('setup')}
              className="flex items-center space-x-2 px-4 py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold transition-all shadow-subtle hover:border-slate-300 cursor-pointer"
            >
              <Settings2 className="w-4 h-4 text-teal-600" />
              <span>Sample & Analysis Setup</span>
            </button>
            <button
              onClick={() => onNavigate('explorer')}
              className="flex items-center space-x-2 px-4 py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold transition-all shadow-subtle hover:border-slate-300 cursor-pointer"
            >
              <FlaskConical className="w-4 h-4 text-indigo-600" />
              <span>Drug & Tissue Explorer</span>
            </button>
            <button
              onClick={() => onNavigate('analytics')}
              className="flex items-center space-x-2 px-4 py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold transition-all shadow-subtle hover:border-slate-300 cursor-pointer"
            >
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              <span>Visual Analytics</span>
            </button>
          </div>
        </div>
      </div>

      {/* Ground-Truth Dataset Dimensions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center">
              <Database className="w-4 h-4 mr-2 text-teal-600" /> Verified GDSC2 Dataset Dimensions
            </h2>
            <p className="text-xs text-slate-500">Sanger Institute Pharmacogenomics Database Release (24-Jul-2022)</p>
          </div>
          <span className="hidden sm:inline-flex items-center text-[11px] font-medium text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-full shadow-2xs">
            Refit Batch: All 242,036 Rows
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle card-hover-effect">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cancer Cell Lines</span>
              <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mt-2 font-mono tabular-nums">969</div>
            <p className="text-[11px] text-slate-500 mt-1 flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mr-1.5"></span>
              COSMIC reference models
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle card-hover-effect">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Screened Compounds</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Pill className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mt-2 font-mono tabular-nums">286</div>
            <p className="text-[11px] text-slate-500 mt-1 flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
              Across 295 screening regimens
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle card-hover-effect">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tissue Lineages</span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mt-2 font-mono tabular-nums">33</div>
            <p className="text-[11px] text-slate-500 mt-1 flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-1.5"></span>
              TCGA anatomical categories
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle card-hover-effect">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Dose-Response Curves</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mt-2 font-mono tabular-nums">242,036</div>
            <p className="text-[11px] text-slate-500 mt-1 flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
              NLME Hill equation fits
            </p>
          </div>
        </div>
      </div>

      {/* Production Model Performance & Architecture */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Model Benchmark Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-teal-600" />
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Model Comparison on Held-Out Cell Lines</h3>
                <p className="text-[11px] text-slate-500">GroupShuffleSplit 80:20 (Zero Cell-Line Overlap)</p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 shadow-2xs">
              -51.3% MAE Improvement
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Evaluated on held-out cancer cell lines. Once out-of-fold target encodings are added (<code className="text-slate-800 font-mono">k=10</code> smoothing), HistGradientBoosting achieves high predictive power without leaky curve parameters.
          </p>

          <div className="overflow-x-auto max-h-72 overflow-y-auto rounded-xl border border-slate-200">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="sticky top-0 z-20 bg-slate-100 shadow-2xs">
                <tr className="border-b border-slate-200 text-slate-700 text-[11px]">
                  <th className="py-2.5 px-3 font-semibold bg-slate-100 sticky left-0 z-30">Model Architecture</th>
                  <th className="py-2.5 px-3 font-semibold bg-slate-100">Scenario</th>
                  <th className="py-2.5 px-3 font-semibold text-right min-w-[95px] bg-slate-100">Holdout MAE</th>
                  <th className="py-2.5 px-3 font-semibold text-right min-w-[85px] bg-slate-100">RMSE</th>
                  <th className="py-2.5 px-3 font-semibold text-right min-w-[85px] bg-slate-100">R² Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {benchmarkModels.map((m, idx) => (
                  <tr 
                    key={idx} 
                    className={`transition-colors ${
                      m.highlight 
                        ? 'bg-teal-50/80 font-bold text-teal-950 hover:bg-teal-50' 
                        : 'text-slate-700 hover:bg-slate-50/60'
                    }`}
                  >
                    <td className={`py-2.5 px-3 font-sans flex items-center sticky left-0 z-10 ${m.highlight ? 'bg-teal-50/90' : 'bg-white'}`}>
                      {m.highlight && (
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-teal-600 shrink-0" />
                      )}
                      <span>{m.name}</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 font-sans text-[11px]">{m.status}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums">{m.testMae}</td>
                    <td className="py-2.5 px-3 text-right text-slate-500 tabular-nums">{m.rmse}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums font-bold text-slate-900">{m.r2}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-600 space-y-1 border border-slate-100">
            <div className="font-semibold text-slate-800 flex items-center">
              <Info className="w-3.5 h-3.5 text-teal-600 mr-1.5" /> Production Refit Configuration:
            </div>
            <div className="leading-relaxed pl-5">
              Refitted across all 242,036 screening measurements using 5-fold grouped out-of-fold target encodings. 80% holdout residual interval: <strong className="text-slate-800 font-mono">[-1.43, +1.48] ln(IC50)</strong>.
            </div>
          </div>
        </div>

        {/* Sensitivity Distribution Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-teal-600" />
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Pan-Cancer Drug Sensitivity Spectrum</h3>
                <p className="text-[11px] text-slate-500">Distribution of Fitted ln(IC50) Values</p>
              </div>
            </div>
            <span className="text-[11px] text-slate-500 font-medium bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200">
              286 Compounds
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Distribution of screening responses across GDSC2 therapeutics. Lower values signify higher pharmacological potency and lower concentration required for 50% cell growth inhibition.
          </p>

          <div className="h-56 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sensitivityDistribution} margin={{ top: 15, right: 15, left: -10, bottom: 35 }}>
                <XAxis 
                  dataKey="bin" 
                  tick={{ fontSize: 10, fill: '#64748b' }} 
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    borderRadius: '0.85rem', 
                    borderColor: '#e2e8f0', 
                    fontSize: '11px',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                  }} 
                  formatter={(val: number, name: string, props: any) => [
                    `${val} Compounds (${props.payload.pct})`,
                    props.payload.label
                  ]}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {sensitivityDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-[11px] pt-3 border-t border-slate-100 text-slate-600">
            <span className="flex items-center font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 mr-1.5"></span>
              Sensitive: &lt; 2.19 (Lower Tertile)
            </span>
            <span className="flex items-center font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mr-1.5"></span>
              Median: 3.255
            </span>
            <span className="flex items-center font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 mr-1.5"></span>
              Resistant: &gt; 4.22 (Upper Tertile)
            </span>
          </div>
        </div>
      </div>

      {/* Six-Page Platform Workflow Map */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm flex items-center">
            <Layers className="w-4 h-4 mr-2 text-teal-600" /> Platform Architecture & Guided Workflow
          </h3>
          <span className="text-xs text-slate-400">Step-by-step oncology research workflow</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div 
            onClick={() => onNavigate('setup')}
            className="p-4 rounded-2xl border border-slate-200 hover:border-teal-300 hover:bg-teal-50/20 transition-all cursor-pointer space-y-2 group card-hover-effect"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-teal-950 flex items-center">
                <Settings2 className="w-4 h-4 mr-2 text-teal-600" /> 1. Sample & Analysis Setup
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-all" />
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Select from 969 verified COSMIC cell lines or configure custom isolates with tissue lineage origin and baseline parameters.
            </p>
          </div>

          <div 
            onClick={() => onNavigate('explorer')}
            className="p-4 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/20 transition-all cursor-pointer space-y-2 group card-hover-effect"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-950 flex items-center">
                <FlaskConical className="w-4 h-4 mr-2 text-indigo-600" /> 2. Drug & Tissue Explorer
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Browse the complete 286-drug catalogue, putative molecular targets, target signaling pathways, and screening concentration ranges.
            </p>
          </div>

          <div 
            onClick={() => onNavigate('prediction')}
            className="p-4 rounded-2xl border border-slate-200 hover:border-teal-300 hover:bg-teal-50/20 transition-all cursor-pointer space-y-2 group card-hover-effect"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-teal-950 flex items-center">
                <Pill className="w-4 h-4 mr-2 text-teal-600" /> 3. Drug Response Prediction
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-all" />
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Run inference for single compounds with 4PL sigmoidal curves or score all 286 drugs for pan-cancer ranking.
            </p>
          </div>

          <div 
            onClick={() => onNavigate('analytics')}
            className="p-4 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/20 transition-all cursor-pointer space-y-2 group card-hover-effect"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-950 flex items-center">
                <BarChart3 className="w-4 h-4 mr-2 text-emerald-600" /> 4. Visual Analytics
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Explore pharmacogenomic PCA across 969 cell lines, cross-tissue heatmaps, and the 15 probe-drug benchmark assay panel.
            </p>
          </div>

          <div 
            onClick={() => onNavigate('reports')}
            className="p-4 rounded-2xl border border-slate-200 hover:border-slate-400 hover:bg-slate-50/50 transition-all cursor-pointer space-y-2 group card-hover-effect"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center">
                <FileText className="w-4 h-4 mr-2 text-slate-700" /> 5. Personalized Reports
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Generate publication-ready vector PDF dossiers and complete companion CSV exports for downstream bioinformatics analysis.
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/80 flex flex-col justify-center space-y-1 text-[11px] text-slate-600">
            <span className="font-bold text-slate-900 flex items-center">
              <ShieldCheck className="w-4 h-4 mr-1.5 text-teal-600" /> Rigorous Scientific Validation
            </span>
            <span className="text-slate-500 leading-relaxed">
              Strict grouped cross-validation, target encoding smoothing, zero omics assumptions, and full transparency.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
