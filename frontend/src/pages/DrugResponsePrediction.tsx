import React, { useState, useEffect } from 'react';
import { 
  Pill, 
  Search, 
  Sparkles, 
  ArrowUpDown, 
  CheckCircle2, 
  AlertTriangle, 
  Sliders, 
  ExternalLink,
  ChevronRight,
  Info,
  Zap,
  ShieldCheck,
  TrendingDown,
  BarChart3
} from 'lucide-react';
import { api } from '../services/api';
import { Drug, Sample, SinglePredictionResult, BatchPredictionItem, ModelInfo } from '../types';
import { SensitivityBadge } from '../components/SensitivityBadge';
import { SampleTypeBadge } from '../components/SampleTypeBadge';

interface DrugResponsePredictionProps {
  sampleId: string;
  samples: Sample[];
  onSampleChange: (id: string) => void;
  onNavigate: (page: string) => void;
}

export const DrugResponsePrediction: React.FC<DrugResponsePredictionProps> = ({
  sampleId,
  samples,
  onSampleChange,
  onNavigate
}) => {
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [selectedDrugId, setSelectedDrugId] = useState<number | null>(null);
  const [singleResult, setSingleResult] = useState<SinglePredictionResult | null>(null);
  const [batchResults, setBatchResults] = useState<BatchPredictionItem[]>([]);
  const [isBatchRunning, setIsBatchRunning] = useState(false);
  const [isSingleRunning, setIsSingleRunning] = useState(false);
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pathwayFilter, setPathwayFilter] = useState('ALL');
  const [sensitivityFilter, setSensitivityFilter] = useState('ALL');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showModelCard, setShowModelCard] = useState(false);

  // Active sample
  const activeSample = samples.find(s => s.sample_id === sampleId);
  const tissue = activeSample?.tcga_desc || 'PANCAN';

  // Load drugs and model info on mount
  useEffect(() => {
    Promise.all([
      api.getDrugs(),
      api.getModelInfo()
    ])
      .then(([drugList, info]) => {
        setDrugs(drugList);
        setModelInfo(info);
        if (drugList.length > 0) {
          const cis = drugList.find(d => d.DRUG_NAME.toLowerCase() === 'cisplatin');
          const defDrug = cis || drugList[0];
          setSelectedDrugId(defDrug.DRUG_ID);
          runSinglePrediction(defDrug.DRUG_ID, tissue);
        }
      })
      .catch(err => setErrorMsg("Failed to initialize drug catalog: " + err.message));
  }, []);

  // Whenever sample changes, re-run prediction
  useEffect(() => {
    if (selectedDrugId && activeSample) {
      runSinglePrediction(selectedDrugId, activeSample.tcga_desc);
      if (batchResults.length > 0) {
        runBatchPrediction(activeSample.tcga_desc);
      }
    }
  }, [sampleId]);

  const runSinglePrediction = async (drugId: number, targetTissue: string) => {
    setIsSingleRunning(true);
    setErrorMsg(null);
    try {
      const res = await api.predictSingle({
        drug_id: drugId,
        tissue: targetTissue
      });
      setSingleResult(res);
    } catch (err: any) {
      setErrorMsg(err.message || "Prediction failed.");
    } finally {
      setIsSingleRunning(false);
    }
  };

  const runBatchPrediction = async (targetTissue?: string) => {
    setIsBatchRunning(true);
    setErrorMsg(null);
    try {
      const res = await api.predictAllDrugs(targetTissue || tissue);
      setBatchResults(res.predictions);
    } catch (err: any) {
      setErrorMsg("Batch prediction failed: " + err.message);
    } finally {
      setIsBatchRunning(false);
    }
  };

  const pathways = Array.from(new Set(drugs.map(d => d.PATHWAY_NAME))).filter(Boolean).sort();

  const filteredBatch = batchResults.filter(item => {
    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      const match = item.drug_name.toLowerCase().includes(q) || 
                    item.putative_target.toLowerCase().includes(q) || 
                    item.pathway_name.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (pathwayFilter !== 'ALL' && item.pathway_name !== pathwayFilter) return false;
    if (sensitivityFilter !== 'ALL' && item.sensitivity_category !== sensitivityFilter) return false;
    return true;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center">
            <Pill className="w-6 h-6 mr-2.5 text-[#79AC78]" />
            Chemotherapy Drug Response Prediction & Sensitivity Ranking
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Production HistGradientBoosting inference across 295 anticancer therapeutics.
          </p>
        </div>

        <button
          onClick={() => setShowModelCard(!showModelCard)}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
        >
          <Info className="w-3.5 h-3.5 text-[#79AC78]" />
          <span>{showModelCard ? "Hide Model Card" : "Model Card & Metrics"}</span>
        </button>
      </div>

      {/* Model Card Modal */}
      {showModelCard && modelInfo && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-[#79AC78]/40 text-xs space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-[#79AC78]" />
              <span className="text-sm font-bold text-white">{modelInfo.model_card.name}</span>
            </div>
            <span className="text-[11px] font-mono text-[#D0E7D2] bg-[#618264]/30 px-2 py-0.5 rounded border border-[#79AC78]/30">
              Cell-Line Grouped 80:20 Split
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
            <div className="p-3 bg-slate-950 rounded-lg">
              <div className="text-slate-500 text-[10px]">INDEPENDENT TEST MAE</div>
              <div className="text-base font-bold text-[#D0E7D2] mt-1">
                {modelInfo.metrics.tuned_histgb_holdout.MAE} <span className="text-xs text-slate-400 font-sans">(baseline {modelInfo.metrics.mean_baseline_test_MAE})</span>
              </div>
            </div>
            <div className="p-3 bg-slate-950 rounded-lg">
              <div className="text-slate-500 text-[10px]">TEST EXPLAINED VARIANCE (R²)</div>
              <div className="text-base font-bold text-[#B0D9B1] mt-1">
                {modelInfo.metrics.tuned_histgb_holdout.R2} <span className="text-xs text-slate-400 font-sans">(75.9%)</span>
              </div>
            </div>
            <div className="p-3 bg-slate-950 rounded-lg">
              <div className="text-slate-500 text-[10px]">FULL DATASET REFIT SCOPE</div>
              <div className="text-base font-bold text-white mt-1">
                242,036 Rows / 969 Cell Lines
              </div>
            </div>
          </div>

          <div className="space-y-1.5 text-slate-300 leading-relaxed font-sans">
            <div><strong className="text-white">Excluded Leaky Inputs:</strong> AUC, Z_SCORE, RMSE (derived from the same fitted dose-response curve).</div>
            <div><strong className="text-white">Target Variable:</strong> ln(IC50) in micromolar (µM). Lower values represent higher cell death at lower drug concentrations.</div>
            <div><strong className="text-white">Scientific Sensitivity Tertiles:</strong> Sensitive (&lt; 2.19 ln IC50), Intermediate (2.19 - 4.22), Resistant (&gt; 4.22). Median: 3.255.</div>
          </div>
        </div>
      )}

      {/* Prediction Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input Selection & Single Drug Prediction (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center">
                <Sliders className="w-4 h-4 mr-2 text-[#79AC78]" />
                Select Chemotherapy Drug
              </h3>
              <span className="text-xs font-mono text-[#B0D9B1]">
                {drugs.length} Compounds
              </span>
            </div>

            {/* Drug Dropdown */}
            <select
              value={selectedDrugId ?? ''}
              onChange={(e) => {
                const did = Number(e.target.value);
                setSelectedDrugId(did);
                runSinglePrediction(did, tissue);
              }}
              className="w-full bg-slate-950 border border-slate-700 text-xs rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#79AC78] font-medium"
            >
              {drugs.map(d => (
                <option key={d.DRUG_ID} value={d.DRUG_ID}>
                  {d.DRUG_NAME} — {d.PUTATIVE_TARGET} ({d.PATHWAY_NAME})
                </option>
              ))}
            </select>

            {/* Batch Run Button */}
            <div className="pt-2">
              <button
                onClick={() => runBatchPrediction()}
                disabled={isBatchRunning}
                className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-gradient-to-r from-[#79AC78] to-[#618264] hover:from-[#618264] hover:to-[#506e53] text-slate-950 font-bold text-xs transition-all shadow-lg shadow-[#618264]/25 active:scale-95 disabled:opacity-50"
              >
                <Zap className="w-4 h-4" />
                <span>{isBatchRunning ? "Predicting Across 295 Drugs..." : "Rank All 295 Drugs for This Profile"}</span>
              </button>
            </div>
          </div>

          {/* Single Prediction Output Card */}
          {singleResult && (
            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-[#618264]/20 border border-[#79AC78]/40 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-base font-bold text-white">{singleResult.drug_name}</span>
                  <div className="text-[11px] text-slate-400 font-mono">
                    ID #{singleResult.drug_id} • {singleResult.tissue} Tissue
                  </div>
                </div>
                <SensitivityBadge category={singleResult.sensitivity.category} />
              </div>

              {/* Primary Value Display */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">Predicted ln(IC50)</div>
                  <div className="text-2xl font-extrabold text-[#D0E7D2] font-mono mt-1">
                    {singleResult.predicted_ln_ic50}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    80% Holdout CI: [{singleResult.confidence_band_80pct[0]}, {singleResult.confidence_band_80pct[1]}]
                  </div>
                </div>

                <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">Estimated IC50 (µM)</div>
                  <div className="text-2xl font-extrabold text-white font-mono mt-1">
                    {singleResult.predicted_ic50_uM} µM
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    Range: [{singleResult.ic50_band_80pct_uM[0]} - {singleResult.ic50_band_80pct_uM[1]} µM]
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-slate-800/80">
                <div className="flex justify-between">
                  <span className="text-slate-500">Putative Target:</span>
                  <span className="font-semibold text-white">{singleResult.putative_target}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Signaling Pathway:</span>
                  <span className="text-[#B0D9B1] font-medium">{singleResult.pathway_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Screening Range:</span>
                  <span className="font-mono text-slate-400">{singleResult.min_conc_uM} µM - {singleResult.max_conc_uM} µM</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                {singleResult.sensitivity.description}
              </div>
            </div>
          )}
        </div>

        {/* Right: Batch Ranked Table across All 295 Drugs (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center">
                  <TrendingDown className="w-4 h-4 mr-2 text-[#79AC78]" />
                  Drug Sensitivity Ranking for {tissue}
                </h3>
                <span className="text-xs text-slate-400">
                  {batchResults.length > 0 ? `Displaying ${filteredBatch.length} of ${batchResults.length} drugs (Ranked by lowest ln IC50)` : "Click button on left to rank all 295 drugs"}
                </span>
              </div>

              {batchResults.length > 0 && (
                <button
                  onClick={() => onNavigate('reports')}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#618264]/20 hover:bg-[#618264]/30 text-[#D0E7D2] border border-[#79AC78]/40 text-xs font-semibold transition-colors"
                >
                  <span>Export Report</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {batchResults.length > 0 ? (
              <>
                {/* Search & Filters */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <div className="relative flex-1 min-w-[160px]">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Filter by drug, target or pathway..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#79AC78]"
                    />
                  </div>

                  <select
                    value={pathwayFilter}
                    onChange={(e) => setPathwayFilter(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-[#79AC78] max-w-[150px] truncate"
                  >
                    <option value="ALL">All Pathways</option>
                    {pathways.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>

                  <select
                    value={sensitivityFilter}
                    onChange={(e) => setSensitivityFilter(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-[#79AC78]"
                  >
                    <option value="ALL">All Sensitivity</option>
                    <option value="Sensitive">Sensitive</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Resistant">Resistant</option>
                  </select>
                </div>

                {/* Ranked Table */}
                <div className="overflow-x-auto max-h-[500px] rounded-xl border border-slate-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/80 sticky top-0 text-slate-400 font-semibold border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-3 w-12 text-center">Rank</th>
                        <th className="py-3 px-3">Chemotherapy Drug</th>
                        <th className="py-3 px-3">Target & Pathway</th>
                        <th className="py-3 px-3 text-right">Pred ln(IC50)</th>
                        <th className="py-3 px-3 text-right">IC50 (µM)</th>
                        <th className="py-3 px-3 text-center">Classification</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {filteredBatch.map((item) => {
                        const isCurrent = item.drug_id === selectedDrugId;
                        return (
                          <tr 
                            key={item.drug_id}
                            onClick={() => {
                              setSelectedDrugId(item.drug_id);
                              runSinglePrediction(item.drug_id, tissue);
                            }}
                            className={`cursor-pointer transition-colors ${
                              isCurrent 
                                ? 'bg-[#618264]/25 text-white font-bold' 
                                : 'hover:bg-slate-800/40 text-slate-300'
                            }`}
                          >
                            <td className="py-2 px-3 text-center font-bold text-[#79AC78]">
                              #{item.rank}
                            </td>
                            <td className="py-2 px-3 font-sans font-semibold text-white">
                              {item.drug_name}
                            </td>
                            <td className="py-2 px-3 font-sans text-slate-400 text-[11px] truncate max-w-[180px]">
                              {item.putative_target} • <span className="text-[#B0D9B1]">{item.pathway_name}</span>
                            </td>
                            <td className="py-2 px-3 text-right font-bold text-[#D0E7D2]">
                              {item.predicted_ln_ic50.toFixed(3)}
                            </td>
                            <td className="py-2 px-3 text-right text-slate-300">
                              {item.predicted_ic50_uM.toFixed(3)}
                            </td>
                            <td className="py-2 px-3 text-center font-sans">
                              <SensitivityBadge category={item.sensitivity_category} />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="py-16 text-center space-y-3 bg-slate-950/40 rounded-xl border border-dashed border-slate-800">
                <Pill className="w-10 h-10 text-slate-600 mx-auto" />
                <div className="text-sm font-semibold text-slate-300">No Batch Prediction Executed</div>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Click 'Rank All 295 Drugs for This Profile' on the left to evaluate complete sensitivity rankings.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
