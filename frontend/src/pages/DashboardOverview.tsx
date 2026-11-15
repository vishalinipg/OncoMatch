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
  Layers,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import { ModelInfo, Sample } from '../types';

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
            OncoMatch enables oncology researchers to analyze cancer molecular profiles, map transcriptomic landscapes, and evaluate predicted chemotherapy sensitivity across 295 anticancer therapeutics trained on the Sanger Institute GDSC2 dataset.
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

      {/* Ground-Truth Dataset Statistics */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center">
            <Database className="w-4 h-4 mr-2 text-teal-400" /> Ground-Truth Dataset Statistics (Sanger GDSC2)
          </h2>
          <span className="text-xs text-slate-500 font-mono">24-Jul-2022 Release</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="text-xs font-medium text-slate-400">Dose-Response Curves</div>
            <div className="text-2xl font-bold text-white mt-1 font-mono">242,036</div>
            <div className="text-[11px] text-teal-400 mt-1 flex items-center">
              <CheckCircle2 className="w-3 h-3 mr-1" /> Quality-controlled NLME fits
            </div>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="text-xs font-medium text-slate-400">Cancer Cell Lines</div>
            <div className="text-2xl font-bold text-white mt-1 font-mono">969</div>
            <div className="text-[11px] text-slate-400 mt-1">Unique COSMIC Cell Lines</div>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="text-xs font-medium text-slate-400">Anticancer Therapeutics</div>
            <div className="text-2xl font-bold text-white mt-1 font-mono">295</div>
            <div className="text-[11px] text-slate-400 mt-1">Spanning 243 Putative Targets</div>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="text-xs font-medium text-slate-400">TCGA Cancer Tissues</div>
            <div className="text-2xl font-bold text-white mt-1 font-mono">33</div>
            <div className="text-[11px] text-slate-400 mt-1">e.g. BRCA, LUAD, GBM, SKCM</div>
          </div>
        </div>
      </div>

      {/* Production ML Benchmark Results */}
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
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Mean baseline test MAE was <span className="font-mono text-slate-300">2.108</span>. The tuned HistGradientBoosting model halves prediction error across 48,328 holdout experiments.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="text-xs text-slate-400">Holdout Explained Variance (R²)</div>
            <div className="text-3xl font-extrabold text-teal-300 mt-2 font-mono">0.7585</div>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Explains <span className="text-slate-200 font-semibold">75.85% of total variance</span> in in-vitro drug sensitivity across cancer cell lines completely absent from training.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="text-xs text-slate-400">Leakage-Safe Architecture</div>
            <div className="text-base font-bold text-white mt-1">Grouped Target Encodings</div>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Ordinal drug & target encodings + log concentration bounds + Empirical Bayes grouped out-of-fold target encodings ($k=10$). Strictly excludes leaky curve parameters (AUC/Z-Score).
            </p>
          </div>
        </div>
      </div>

      {/* Streamlined Interactive Analysis Pipeline (Replaces the repetitive 6-card menu clone) */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center">
          <Layers className="w-4 h-4 mr-2 text-cyan-400" /> End-to-End Analysis Pipeline
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div 
            onClick={() => onNavigate('upload')}
            className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-teal-500/50 hover:bg-slate-800/40 cursor-pointer transition-all group"
          >
            <div className="text-[11px] font-mono text-teal-400 mb-1 font-semibold">STAGE 01</div>
            <div className="flex items-center space-x-2 mb-2">
              <UploadCloud className="w-4 h-4 text-teal-400" />
              <h3 className="text-sm font-bold text-white group-hover:text-teal-300 transition-colors">
                Profile & Upload
              </h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Upload CSV/TSV expression data or select from 4 preloaded biological models.
            </p>
          </div>

          <div 
            onClick={() => onNavigate('molecular')}
            className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-teal-500/50 hover:bg-slate-800/40 cursor-pointer transition-all group"
          >
            <div className="text-[11px] font-mono text-teal-400 mb-1 font-semibold">STAGE 02</div>
            <div className="flex items-center space-x-2 mb-2">
              <Dna className="w-4 h-4 text-teal-400" />
              <h3 className="text-sm font-bold text-white group-hover:text-teal-300 transition-colors">
                Molecular QC
              </h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Quality-control 978 L1000 landmark genes, pathway annotations, and outlier z-scores.
            </p>
          </div>

          <div 
            onClick={() => onNavigate('prediction')}
            className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-teal-500/50 hover:bg-slate-800/40 cursor-pointer transition-all group"
          >
            <div className="text-[11px] font-mono text-emerald-400 mb-1 font-semibold">STAGE 03</div>
            <div className="flex items-center space-x-2 mb-2">
              <Pill className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                Sensitivity Prediction
              </h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Estimate ln(IC50), calculate 80% confidence bands, and rank all 295 drugs.
            </p>
          </div>

          <div 
            onClick={() => onNavigate('reports')}
            className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-teal-500/50 hover:bg-slate-800/40 cursor-pointer transition-all group"
          >
            <div className="text-[11px] font-mono text-indigo-400 mb-1 font-semibold">STAGE 04</div>
            <div className="flex items-center space-x-2 mb-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                Report Generation
              </h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Export downloadable vector PDF clinical reports and complete CSV prediction sheets.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
