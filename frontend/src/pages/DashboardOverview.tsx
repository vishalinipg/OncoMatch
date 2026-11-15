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
  Layers
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
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-teal-50/40 to-emerald-50/30 border border-teal-200/80 p-8 shadow-xs">
        <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-100/70 border border-teal-300 text-teal-800 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse"></span>
            <span>Computational Oncology & Translational Pharmacogenomics</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Personalized Chemotherapy Drug Response Prediction in Cancer Treatments
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            OncoMatch empowers oncology researchers to analyze cancer molecular profiles, map transcriptomic landscapes, and evaluate predicted chemotherapy sensitivity across 295 anticancer therapeutics trained on the Sanger Institute GDSC2 dataset.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('prediction')}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition-all shadow-sm shadow-teal-600/20 active:scale-95"
            >
              <Pill className="w-4 h-4" />
              <span>Predict Drug Sensitivity</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
            <button
              onClick={() => onNavigate('upload')}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold transition-all shadow-2xs"
            >
              <UploadCloud className="w-4 h-4 text-teal-600" />
              <span>Upload Molecular Sample</span>
            </button>
            <button
              onClick={() => onNavigate('analytics')}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold transition-all shadow-2xs"
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

      {/* Production ML Benchmark Results */}
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
              Ordinal drug & target encodings + log concentration bounds + Empirical Bayes grouped out-of-fold target encodings ($k=10$). Strictly excludes leaky curve parameters (AUC/Z-Score).
            </p>
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
