import React, { useEffect, useState } from 'react';
import { 
  Database, 
  Cpu, 
  Dna, 
  Pill, 
  BarChart3, 
  FileText, 
  UploadCloud, 
  CheckCircle2, 
  ArrowRight, 
  ShieldAlert, 
  TrendingDown, 
  Activity,
  Layers
} from 'lucide-react';
import { api } from '../services/api';
import { ModelInfo, Sample } from '../types';
import { ScientificDisclaimer } from '../components/ScientificDisclaimer';

interface DashboardOverviewProps {
  onNavigate: (page: string) => void;
  samples: Sample[];
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ onNavigate, samples }) => {
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getModelInfo()
      .then(info => setModelInfo(info))
      .catch(err => console.error("Error fetching model info:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-teal-950/40 to-slate-900 border border-teal-500/20 p-8 shadow-2xl">
        <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
            <span>Computational Oncology & Translational Pharmacogenomics</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Personalized Chemotherapy Drug Response Prediction in Cancer Treatments
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            OncoMatch empowers oncology researchers to analyze cancer molecular profiles, map transcriptomic landscapes, and evaluate predicted chemotherapy sensitivity across 295 anticancer therapeutics trained on the Sanger Institute GDSC2 dataset.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('prediction')}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-xs transition-all shadow-lg shadow-teal-500/25 active:scale-95"
            >
              <Pill className="w-4 h-4" />
              <span>Predict Drug Sensitivity</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
            <button
              onClick={() => onNavigate('upload')}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-medium transition-all"
            >
              <UploadCloud className="w-4 h-4 text-teal-400" />
              <span>Upload Molecular Sample</span>
            </button>
            <button
              onClick={() => onNavigate('analytics')}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-medium transition-all"
            >
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <span>Explore PCA & HMM</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dataset Statistics vs Model Evaluation vs Workspace Activity */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center">
            <Database className="w-4 h-4 mr-2 text-teal-400" /> Ground-Truth Dataset Statistics (Sanger GDSC2)
          </h2>
          <span className="text-xs text-slate-500 font-mono">Released 24-Jul-2022</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all">
            <div className="text-xs font-medium text-slate-400">Total Dose-Response Curves</div>
            <div className="text-2xl font-bold text-white mt-1 font-mono">242,036</div>
            <div className="text-[11px] text-teal-400 mt-1 flex items-center">
              <CheckCircle2 className="w-3 h-3 mr-1" /> Quality-controlled NLME fits
            </div>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all">
            <div className="text-xs font-medium text-slate-400">Cancer Cell Lines</div>
            <div className="text-2xl font-bold text-white mt-1 font-mono">969</div>
            <div className="text-[11px] text-slate-400 mt-1">Unique COSMIC Cell Lines</div>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all">
            <div className="text-xs font-medium text-slate-400">Anticancer Drugs</div>
            <div className="text-2xl font-bold text-white mt-1 font-mono">295</div>
            <div className="text-[11px] text-slate-400 mt-1">Spanning 243 Putative Targets</div>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all">
            <div className="text-xs font-medium text-slate-400">TCGA Cancer Tissues</div>
            <div className="text-2xl font-bold text-white mt-1 font-mono">33</div>
            <div className="text-[11px] text-slate-400 mt-1">e.g. BRCA, LUAD, GBM, SKCM</div>
          </div>
        </div>
      </div>

      {/* Rigorous ML Benchmark Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center">
            <Cpu className="w-4 h-4 mr-2 text-emerald-400" /> Production Machine Learning Performance
          </h2>
          <span className="text-xs text-emerald-400 font-mono">Grouped Holdout (Unseen Cell Lines)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl bg-slate-900/90 border border-emerald-500/20 bg-emerald-950/5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Test Mean Absolute Error (MAE)</span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">-51.3% vs Baseline</span>
            </div>
            <div className="text-3xl font-extrabold text-emerald-300 mt-2 font-mono">1.0270</div>
            <p className="text-xs text-slate-400 mt-2">
              Mean baseline test MAE was <span className="font-mono text-slate-300">2.108</span>. The tuned HistGradientBoosting model halves prediction error across 48,328 holdout experiments.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="text-xs text-slate-400">Holdout Explained Variance (R²)</div>
            <div className="text-3xl font-extrabold text-teal-300 mt-2 font-mono">0.7585</div>
            <p className="text-xs text-slate-400 mt-2">
              Explains <span className="text-slate-200 font-semibold">75.85% of total variance</span> in in-vitro drug sensitivity across cancer cell lines completely absent from training.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="text-xs text-slate-400">Feature Engineering Architecture</div>
            <div className="text-base font-bold text-white mt-1">Leakage-Safe Target Encodings</div>
            <p className="text-xs text-slate-400 mt-2">
              Ordinal drug & target encodings + log concentration bounds + Empirical Bayes grouped out-of-fold target encodings ($k=10$). Strictly excludes leaky curve parameters (AUC/Z-Score).
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Cards to Six Core Pages */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center">
          <Layers className="w-4 h-4 mr-2 text-cyan-400" /> Platform Workflow & Core Pages
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div 
            onClick={() => onNavigate('upload')}
            className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-teal-500/50 hover:bg-slate-800/40 cursor-pointer transition-all group"
          >
            <div className="w-9 h-9 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-teal-300 transition-colors">
              Page 2 — Patient Profile & Upload
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Create sample profiles, upload CSV/TSV expression data, and validate 978 L1000 landmark genes with generalization warnings.
            </p>
          </div>

          <div 
            onClick={() => onNavigate('molecular')}
            className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-teal-500/50 hover:bg-slate-800/40 cursor-pointer transition-all group"
          >
            <div className="w-9 h-9 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Dna className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-teal-300 transition-colors">
              Page 3 — Molecular Profile
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Explore 978 L1000 landmark gene expression distributions, pathway annotations, z-scores, and quality control indicators.
            </p>
          </div>

          <div 
            onClick={() => onNavigate('prediction')}
            className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-teal-500/50 hover:bg-slate-800/40 cursor-pointer transition-all group"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Pill className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
              Page 4 — Drug Response Prediction
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Execute production HistGB model to estimate ln(IC50), calculate 80% confidence bands, and rank 295 chemotherapy agents.
            </p>
          </div>

          <div 
            onClick={() => onNavigate('analytics')}
            className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-teal-500/50 hover:bg-slate-800/40 cursor-pointer transition-all group"
          >
            <div className="w-9 h-9 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
              Page 5 — Visual Analytics (PCA & HMM)
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Interactive 2D PCA landscape across 963 cell lines, drug loadings, sensitivity heatmaps, and exploratory 3-state HMM matrices.
            </p>
          </div>

          <div 
            onClick={() => onNavigate('reports')}
            className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-teal-500/50 hover:bg-slate-800/40 cursor-pointer transition-all group"
          >
            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
              Page 6 — Personalized Report Generation
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Compile comprehensive scientific reports with vector PDF export, CSV datasets, and timestamped reproducibility history.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800/60 flex flex-col justify-center">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Active Workspace Summary
            </div>
            <div className="text-xs text-slate-300 space-y-1">
              <div>• {samples.length} Cancer Sample Profiles Ready</div>
              <div>• 4 Validated Demo Cell Lines & Organoids</div>
              <div>• Zero Recurring Infrastructure Overhead</div>
            </div>
          </div>
        </div>
      </div>

      {/* Mandatory Scientific Disclaimer */}
      <ScientificDisclaimer />
    </div>
  );
};
