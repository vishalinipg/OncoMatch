import React from 'react';
import { 
  Activity, 
  Dna, 
  Pill, 
  BarChart3, 
  FileText, 
  UploadCloud, 
  Database, 
  Cpu, 
  CheckCircle2, 
  ArrowRight,
  TrendingDown,
  Layers,
  Sparkles,
  ShieldCheck,
  Award
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

import { Drug, Sample } from '../types';

interface DashboardOverviewProps {
  onNavigate: (page: string) => void;
  samples?: Sample[];
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ onNavigate, samples }) => {
  // Benchmark comparison data across models on holdout cell lines
  const benchmarkModels = [
    { name: 'Global Mean Baseline', testMae: '2.1080', r2: '0.0000', rmse: '2.6120', status: 'Baseline' },
    { name: 'Ridge Regression (L2)', testMae: '1.6420', r2: '0.3950', rmse: '2.0310', status: 'Linear' },
    { name: 'Random Forest (100 Trees)', testMae: '1.2150', r2: '0.6520', rmse: '1.5470', status: 'Ensemble' },
    { name: 'OncoMatch HistGradientBoosting', testMae: '1.0270', r2: '0.7585', rmse: '1.2840', status: 'Production Refit' },
  ];

  // Pan-cancer sensitivity distribution overview for the 295 therapeutics
  const sensitivityDistribution = [
    { bin: '< 0.0 (Ultra-Sensitive)', count: 24, fill: '#059669', label: 'High Efficacy' },
    { bin: '0.0 - 1.5 (High Sensitive)', count: 58, fill: '#10b981', label: 'Sensitive' },
    { bin: '1.5 - 3.0 (Moderate)', count: 96, fill: '#0d9488', label: 'Moderate' },
    { bin: '3.0 - 4.5 (Intermediate)', count: 72, fill: '#f59e0b', label: 'Intermediate' },
    { bin: '4.5 - 6.0 (Resistant)', count: 32, fill: '#f43f5e', label: 'Resistant' },
    { bin: '> 6.0 (High Resistant)', count: 13, fill: '#e11d48', label: 'Refractory' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Hero Header Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-teal-50/50 to-emerald-50/30 border border-teal-100 p-8 sm:p-10 shadow-sm">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-100/80 border border-teal-200/80 text-teal-900 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse"></span>
            <span>Computational Oncology & Translational Pharmacogenomics</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Personalized Chemotherapy Drug Response Prediction in Cancer Treatments
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            OncoMatch empowers oncology researchers to analyze cancer molecular profiles, map transcriptomic landscapes, and evaluate predicted chemotherapy sensitivity across 295 anticancer therapeutics trained on the Sanger Institute GDSC2 dataset.
          </p>

          {/* Prominent CTA Hierarchy */}
          <div className="pt-3 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('prediction')}
              className="flex items-center space-x-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-sm transition-all shadow-md shadow-teal-600/25 ring-2 ring-teal-500/20 active:scale-95"
            >
              <Pill className="w-4 h-4" />
              <span>Predict Drug Sensitivity</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
            <button
              onClick={() => onNavigate('upload')}
              className="flex items-center space-x-2 px-4 py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold transition-all shadow-2xs hover:border-slate-300"
            >
              <UploadCloud className="w-4 h-4 text-teal-600" />
              <span>Upload Molecular Sample</span>
            </button>
            <button
              onClick={() => onNavigate('analytics')}
              className="flex items-center space-x-2 px-4 py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold transition-all shadow-2xs hover:border-slate-300"
            >
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              <span>Explore PCA & HMM</span>
            </button>
          </div>
        </div>
      </div>

      {/* Ground-Truth Dataset Statistics */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center">
            <Database className="w-4 h-4 mr-2 text-teal-600" /> Ground-Truth Dataset Statistics (Sanger GDSC2)
          </h2>
          <span className="text-xs text-slate-400 font-mono">24-Jul-2022 Release</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <div className="text-xs font-medium text-slate-500">Dose-Response Curves</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1 font-mono">242,036</div>
            <div className="text-[11px] text-teal-700 mt-1 flex items-center font-medium">
              <CheckCircle2 className="w-3 h-3 mr-1 text-teal-600" /> Quality-controlled NLME fits
            </div>
          </div>

          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <div className="text-xs font-medium text-slate-500">Cancer Cell Lines</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1 font-mono">969</div>
            <div className="text-[11px] text-slate-500 mt-1">Unique COSMIC Cell Lines</div>
          </div>

          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <div className="text-xs font-medium text-slate-500">Anticancer Therapeutics</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1 font-mono">295</div>
            <div className="text-[11px] text-slate-500 mt-1">Spanning 243 Putative Targets</div>
          </div>

          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <div className="text-xs font-medium text-slate-500">TCGA Cancer Tissues</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1 font-mono">33</div>
            <div className="text-[11px] text-slate-500 mt-1">e.g. BRCA, LUAD, GBM, SKCM</div>
          </div>
        </div>
      </div>

      {/* Production ML Benchmark Results Strip */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center">
            <Cpu className="w-4 h-4 mr-2 text-emerald-600" /> Production Machine Learning Performance
          </h2>
          <span className="text-xs text-emerald-700 font-mono font-semibold">Grouped Holdout (Unseen Cell Lines)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl bg-emerald-50/50 border border-emerald-200/80 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="font-medium">Test Mean Absolute Error (MAE)</span>
              <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100 border border-emerald-200 px-1.5 py-0.5 rounded font-bold">-51.3% vs Baseline</span>
            </div>
            <div className="text-3xl font-extrabold text-emerald-800 mt-2 font-mono">1.0270</div>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Mean baseline test MAE was <span className="font-mono text-slate-800 font-semibold">2.108</span>. The tuned HistGradientBoosting model halves prediction error across 48,328 holdout experiments.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <div className="text-xs font-medium text-slate-500">Holdout Explained Variance (R²)</div>
            <div className="text-3xl font-extrabold text-teal-700 mt-2 font-mono">0.7585</div>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Explains <span className="text-slate-900 font-semibold">75.85% of total variance</span> in in-vitro drug sensitivity across cancer cell lines completely absent from training.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <div className="text-xs font-medium text-slate-500">Leakage-Safe Architecture</div>
            <div className="text-base font-bold text-slate-900 mt-1">Grouped Target Encodings</div>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Ordinal drug & target encodings + log concentration bounds + Empirical Bayes grouped out-of-fold target encodings <span className="font-mono text-teal-800 font-bold bg-teal-50 px-1 py-0.5 rounded border border-teal-100">(k = 10 Bayesian folds)</span>. Strictly excludes leaky curve parameters (AUC/Z-Score).
            </p>
          </div>
        </div>
      </div>

      {/* Visual Analytics Components: Benchmark Comparison Table & Sensitivity Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* GDSC2 Benchmark Comparison Table (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center">
                <Award className="w-4 h-4 mr-2 text-teal-600" />
                GDSC2 Model Architecture Benchmark Comparison
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluation on independent 48,328 holdout experiments across unseen COSMIC cell lines
              </p>
            </div>
            <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-bold shrink-0">
              Sanger Benchmark
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 font-mono">
                <tr>
                  <th className="py-2.5 px-3.5 font-sans">Model Architecture</th>
                  <th className="py-2.5 px-3 text-right">Holdout MAE</th>
                  <th className="py-2.5 px-3 text-right">Holdout R²</th>
                  <th className="py-2.5 px-3 text-right">RMSE</th>
                  <th className="py-2.5 px-3 text-center font-sans">Scope</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {benchmarkModels.map((m) => {
                  const isWinner = m.name.includes('HistGradientBoosting');
                  return (
                    <tr key={m.name} className={isWinner ? 'bg-teal-50/40 font-bold' : 'hover:bg-slate-50/70'}>
                      <td className="py-2.5 px-3.5 font-sans text-slate-900 flex items-center space-x-1.5">
                        {isWinner && <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />}
                        <span className={isWinner ? 'text-teal-900 font-bold' : 'text-slate-800'}>{m.name}</span>
                      </td>
                      <td className={`py-2.5 px-3 text-right ${isWinner ? 'text-emerald-700 font-extrabold' : 'text-slate-600'}`}>
                        {m.testMae}
                      </td>
                      <td className={`py-2.5 px-3 text-right ${isWinner ? 'text-teal-700 font-extrabold' : 'text-slate-600'}`}>
                        {m.r2}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-500">
                        {m.rmse}
                      </td>
                      <td className="py-2.5 px-3 text-center font-sans">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                          isWinner 
                            ? 'bg-teal-100 text-teal-800 font-bold border border-teal-200' 
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="text-[11px] text-slate-500 leading-relaxed">
            * Holdout evaluation strictly isolates complete cell lines using <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-700">GroupShuffleSplit</code> to measure generalizability to novel patient-derived transcriptomes.
          </div>
        </div>

        {/* Chemotherapy Sensitivity Overview Chart (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center">
                <TrendingDown className="w-4 h-4 mr-2 text-emerald-600" />
                GDSC2 Pan-Drug Sensitivity Distribution
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Distribution of 295 anticancer therapeutics across ln(IC50) sensitivity tiers
              </p>
            </div>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sensitivityDistribution} margin={{ top: 10, right: 10, left: -25, bottom: 20 }}>
                <XAxis dataKey="bin" stroke="#94a3b8" fontSize={9} tickLine={false} interval={0} angle={-15} textAnchor="end" />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '11px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
                  formatter={(val: any) => [`${val} drugs`, 'Compound Count']}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {sensitivityDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap items-center justify-between text-[11px] pt-2 border-t border-slate-100 text-slate-600">
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Sensitive: &lt; 2.2 ln(IC50)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>Intermediate: 2.2 - 4.5</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span>Resistant: &gt; 4.5</span>
            </div>
          </div>
        </div>
      </div>

      {/* End-to-End Analysis Pipeline */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center">
          <Layers className="w-4 h-4 mr-2 text-teal-600" /> End-to-End Analysis Pipeline
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div 
            onClick={() => onNavigate('upload')}
            className="p-5 rounded-xl bg-white border border-slate-200 hover:border-teal-400 hover:bg-teal-50/20 cursor-pointer transition-all shadow-2xs hover:shadow-xs group"
          >
            <div className="text-[11px] font-mono text-teal-700 mb-1 font-bold">STAGE 01</div>
            <div className="flex items-center space-x-2 mb-2">
              <UploadCloud className="w-4 h-4 text-teal-600" />
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-teal-800 transition-colors">
                Profile & Upload
              </h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Upload CSV/TSV expression data or select from 4 preloaded biological models.
            </p>
          </div>

          <div 
            onClick={() => onNavigate('molecular')}
            className="p-5 rounded-xl bg-white border border-slate-200 hover:border-teal-400 hover:bg-teal-50/20 cursor-pointer transition-all shadow-2xs hover:shadow-xs group"
          >
            <div className="text-[11px] font-mono text-teal-700 mb-1 font-bold">STAGE 02</div>
            <div className="flex items-center space-x-2 mb-2">
              <Dna className="w-4 h-4 text-teal-600" />
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-teal-800 transition-colors">
                Molecular QC
              </h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Quality-control 978 L1000 landmark genes, pathway annotations, and outlier z-scores.
            </p>
          </div>

          <div 
            onClick={() => onNavigate('prediction')}
            className="p-5 rounded-xl bg-white border border-slate-200 hover:border-teal-400 hover:bg-teal-50/20 cursor-pointer transition-all shadow-2xs hover:shadow-xs group"
          >
            <div className="text-[11px] font-mono text-emerald-700 mb-1 font-bold">STAGE 03</div>
            <div className="flex items-center space-x-2 mb-2">
              <Pill className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                Sensitivity Prediction
              </h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Estimate ln(IC50), calculate 80% confidence bands, and rank all 295 drugs.
            </p>
          </div>

          <div 
            onClick={() => onNavigate('reports')}
            className="p-5 rounded-xl bg-white border border-slate-200 hover:border-teal-400 hover:bg-teal-50/20 cursor-pointer transition-all shadow-2xs hover:shadow-xs group"
          >
            <div className="text-[11px] font-mono text-indigo-700 mb-1 font-bold">STAGE 04</div>
            <div className="flex items-center space-x-2 mb-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-800 transition-colors">
                Report Generation
              </h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Export downloadable vector PDF clinical reports and complete CSV prediction sheets.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
