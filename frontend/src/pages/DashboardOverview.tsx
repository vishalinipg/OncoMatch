import React from 'react';
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
  Settings2
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
  // Benchmark comparison data across models on holdout cell lines (from notebook Unit 12 & PBL-III)
  const benchmarkModels = [
    { name: 'Global Mean Baseline', testMae: '2.1080', r2: '0.0000', rmse: '2.6120', status: 'Uninformative' },
    { name: 'CART Decision Tree', testMae: '1.4580', r2: '0.5120', rmse: '1.8210', status: 'Scenario A' },
    { name: 'Ridge Regression (L2)', testMae: '1.6420', r2: '0.3950', rmse: '2.0310', status: 'Scenario A' },
    { name: 'Random Forest (100 Trees)', testMae: '1.2150', r2: '0.6520', rmse: '1.5470', status: 'Scenario A' },
    { name: 'HistGradientBoosting (Scenario B)', testMae: '1.0270', r2: '0.7585', rmse: '1.3612', status: 'Production Candidate' },
  ];

  // Pan-cancer sensitivity distribution overview for the fitted curves in GDSC2
  const sensitivityDistribution = [
    { bin: '< 0.0 (Potent)', count: 24, fill: '#059669', label: 'Lower Tertile (High Sensitivity)' },
    { bin: '0.0 - 1.5 (Sensitive)', count: 58, fill: '#10b981', label: 'Sensitive' },
    { bin: '1.5 - 3.0 (Moderate)', count: 96, fill: '#0d9488', label: 'Moderate' },
    { bin: '3.0 - 4.5 (Intermediate)', count: 72, fill: '#f59e0b', label: 'Intermediate' },
    { bin: '4.5 - 6.0 (Resistant)', count: 32, fill: '#f43f5e', label: 'Upper Tertile (Resistant)' },
    { bin: '> 6.0 (Refractory)', count: 13, fill: '#e11d48', label: 'Refractory' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Hero Header Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-teal-50/50 to-emerald-50/30 border border-teal-100 p-8 sm:p-10 shadow-sm">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-100/80 border border-teal-200/80 text-teal-900 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse"></span>
            <span>Computational Oncology & In-Vitro Pharmacogenomics</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Personalized Chemotherapy Drug Response Prediction in Cancer Treatments
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            OncoMatch empowers cancer researchers to analyze chemotherapy sensitivity profiles across 969 cancer cell lines, 286 anticancer therapeutics, and 33 tissue lineages. Powered by a tuned HistGradientBoosting pipeline trained on 242,036 fitted dose-response curves from the Wellcome Sanger Institute GDSC2 dataset.
          </p>

          {/* Scientific Scope Notice */}
          <div className="p-3 bg-white/90 border border-teal-200/70 rounded-xl text-xs text-slate-700 flex items-start space-x-2.5">
            <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Pre-Exposure Modeling Architecture:</strong> OncoMatch predicts fitted ln(IC50) using drug chemical features, putative molecular targets, signaling pathways, screening concentration bounds, and tissue lineage. It does not require or fabricate synthetic patient gene-expression profiles.
            </p>
          </div>

          {/* Prominent CTA Hierarchy */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('prediction')}
              className="flex items-center space-x-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-sm transition-all shadow-md shadow-teal-600/25 ring-2 ring-teal-500/20 active:scale-95 cursor-pointer"
            >
              <Pill className="w-4 h-4" />
              <span>Predict Drug Sensitivity</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
            <button
              onClick={() => onNavigate('setup')}
              className="flex items-center space-x-2 px-4 py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold transition-all shadow-2xs hover:border-slate-300 cursor-pointer"
            >
              <Settings2 className="w-4 h-4 text-teal-600" />
              <span>Sample & Analysis Setup</span>
            </button>
            <button
              onClick={() => onNavigate('explorer')}
              className="flex items-center space-x-2 px-4 py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold transition-all shadow-2xs hover:border-slate-300 cursor-pointer"
            >
              <FlaskConical className="w-4 h-4 text-indigo-600" />
              <span>Drug & Tissue Explorer</span>
            </button>
            <button
              onClick={() => onNavigate('analytics')}
              className="flex items-center space-x-2 px-4 py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold transition-all shadow-2xs hover:border-slate-300 cursor-pointer"
            >
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              <span>Visual Analytics</span>
            </button>
          </div>
        </div>
      </div>

      {/* Ground-Truth Dataset Statistics */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center">
            <Database className="w-5 h-5 mr-2 text-teal-600" /> Verified GDSC2 Dataset Dimensions
          </h2>
          <span className="text-xs text-slate-500 font-medium">Sanger Institute Release 24-Jul-2022</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-teal-200 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase">Cancer Cell Lines</span>
              <Layers className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mt-2 font-mono">969</div>
            <p className="text-[11px] text-slate-500 mt-1">Unique COSMIC screened lines</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-teal-200 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase">Screened Compounds</span>
              <Pill className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mt-2 font-mono">286</div>
            <p className="text-[11px] text-slate-500 mt-1">Across 295 screening regimens</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-teal-200 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase">Tissue Lineages</span>
              <Activity className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mt-2 font-mono">33</div>
            <p className="text-[11px] text-slate-500 mt-1">TCGA anatomical categories</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-teal-200 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase">Dose-Response Curves</span>
              <Sparkles className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mt-2 font-mono">242,036</div>
            <p className="text-[11px] text-slate-500 mt-1">NLME sigmoidal fits</p>
          </div>
        </div>
      </div>

      {/* Production Model Performance & Architecture */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Model Benchmark Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-teal-600" />
              <h3 className="font-bold text-slate-900 text-sm">Model Comparison on Held-Out Cell Lines</h3>
            </div>
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              -51.3% MAE Improvement
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Evaluated using strict <strong>GroupShuffleSplit</strong> on untouched cell lines (zero test-line overlap). Once target encodings are added, HistGradientBoosting achieves state-of-the-art accuracy.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500 text-[11px]">
                  <th className="pb-2.5 px-3 font-semibold">Model Architecture</th>
                  <th className="pb-2.5 px-3 font-semibold">Scenario</th>
                  <th className="pb-2.5 px-4 font-semibold text-right min-w-[100px]">Holdout MAE</th>
                  <th className="pb-2.5 px-4 font-semibold text-right min-w-[90px]">RMSE</th>
                  <th className="pb-2.5 px-4 font-semibold text-right min-w-[90px]">R² Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {benchmarkModels.map((m, idx) => (
                  <tr 
                    key={idx} 
                    className={m.name.includes('HistGradientBoosting') ? 'bg-teal-50/60 font-bold text-teal-950' : 'text-slate-700'}
                  >
                    <td className="py-2.5 px-3 font-sans flex items-center">
                      {m.name.includes('HistGradientBoosting') && (
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-teal-600 shrink-0" />
                      )}
                      <span>{m.name}</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 font-sans text-[11px]">{m.status}</td>
                    <td className="py-2.5 px-4 text-right">{m.testMae}</td>
                    <td className="py-2.5 px-4 text-right text-slate-500">{m.rmse}</td>
                    <td className="py-2.5 px-4 text-right">{m.r2}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-600 space-y-1">
            <div className="font-semibold text-slate-800">Production Refit Configuration:</div>
            <div>Refit on all 242,036 rows using 5-fold grouped out-of-fold target encodings (k=10 smoothing). 80% holdout residual interval: [-1.43, +1.48] ln(IC50).</div>
          </div>
        </div>

        {/* Sensitivity Distribution Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-teal-600" />
              <h3 className="font-bold text-slate-900 text-sm">Pan-Cancer Drug Sensitivity Spectrum</h3>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Fitted ln(IC50) Tiers</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Distribution of screening responses across the 286 GDSC2 therapeutics. Lower values signify higher pharmacological potency and lower concentration required for 50% cell growth inhibition.
          </p>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sensitivityDistribution} margin={{ top: 15, right: 15, left: 0, bottom: 35 }}>
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
                    borderRadius: '0.75rem', 
                    borderColor: '#cbd5e1', 
                    fontSize: '11px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }} 
                  formatter={(val: number) => [`${val} Compounds`, 'Catalogue Count']}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {sensitivityDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-100 text-slate-600">
            <span className="flex items-center">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 mr-1.5"></span>
              Sensitive: &lt; 2.19 (Lower Tertile)
            </span>
            <span className="flex items-center">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mr-1.5"></span>
              Median: 3.255
            </span>
            <span className="flex items-center">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 mr-1.5"></span>
              Resistant: &gt; 4.22 (Upper Tertile)
            </span>
          </div>
        </div>
      </div>

      {/* Six-Page Platform Workflow Map */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center">
          <Layers className="w-4 h-4 mr-2 text-teal-600" /> Platform Architecture & Guided Workflow
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div 
            onClick={() => onNavigate('setup')}
            className="p-4 rounded-xl border border-slate-200 hover:border-teal-300 hover:bg-teal-50/30 transition-all cursor-pointer space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-teal-900 flex items-center">
                <Settings2 className="w-3.5 h-3.5 mr-1.5 text-teal-600" /> 1. Sample & Analysis Setup
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Select from 969 verified COSMIC cell lines or configure custom isolates with tissue lineage origin and baseline parameters.
            </p>
          </div>

          <div 
            onClick={() => onNavigate('explorer')}
            className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all cursor-pointer space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-900 flex items-center">
                <FlaskConical className="w-3.5 h-3.5 mr-1.5 text-indigo-600" /> 2. Drug & Tissue Explorer
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Browse the complete 286-drug catalogue, putative molecular targets, target signaling pathways, and screening concentration ranges.
            </p>
          </div>

          <div 
            onClick={() => onNavigate('prediction')}
            className="p-4 rounded-xl border border-slate-200 hover:border-teal-300 hover:bg-teal-50/30 transition-all cursor-pointer space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-teal-900 flex items-center">
                <Pill className="w-3.5 h-3.5 mr-1.5 text-teal-600" /> 3. Drug Response Prediction
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Run inference for single compounds with 4PL sigmoidal curves or score all 286 drugs for pan-cancer ranking.
            </p>
          </div>

          <div 
            onClick={() => onNavigate('analytics')}
            className="p-4 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all cursor-pointer space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-900 flex items-center">
                <BarChart3 className="w-3.5 h-3.5 mr-1.5 text-emerald-600" /> 4. Visual Analytics
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Explore pharmacogenomic PCA across 969 cell lines, cross-tissue heatmaps, and the 15 probe-drug benchmark assay panel.
            </p>
          </div>

          <div 
            onClick={() => onNavigate('reports')}
            className="p-4 rounded-xl border border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition-all cursor-pointer space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center">
                <FileText className="w-3.5 h-3.5 mr-1.5 text-slate-700" /> 5. Personalized Reports
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Generate publication-ready vector PDF dossiers and complete companion CSV exports for downstream bioinformatics analysis.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-center space-y-1 text-[11px] text-slate-600">
            <span className="font-bold text-slate-900 flex items-center">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-teal-600" /> Rigorous Scientific Validation
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
