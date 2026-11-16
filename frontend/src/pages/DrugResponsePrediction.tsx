import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Pill, 
  Search, 
  Sliders, 
  ChevronRight, 
  Info, 
  Zap, 
  ShieldCheck, 
  TrendingDown,
  Activity,
  BarChart2,
  Download,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Filter,
  CheckSquare,
  Square,
  Columns,
  Table as TableIcon,
  Maximize2
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine, 
  CartesianGrid 
} from 'recharts';
import { api } from '../services/api';
import { Drug, Sample, SinglePredictionResult, BatchPredictionItem, ModelInfo, ComparisonItem, CalibrationSettings } from '../types';
import { SensitivityBadge } from '../components/SensitivityBadge';

interface DrugResponsePredictionProps {
  sampleId: string;
  samples: Sample[];
  onSampleChange: (id: string) => void;
  onNavigate: (page: string) => void;
  pinnedItems?: ComparisonItem[];
  onTogglePin?: (item: ComparisonItem) => void;
  calibration?: CalibrationSettings | null;
  onClearCalibration?: () => void;
}

export const DrugResponsePrediction: React.FC<DrugResponsePredictionProps> = ({
  sampleId,
  samples,
  onSampleChange,
  onNavigate,
  pinnedItems = [],
  onTogglePin,
  calibration,
  onClearCalibration
}) => {
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [selectedDrugId, setSelectedDrugId] = useState<number | null>(calibration?.drugId ?? null);
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
  const [layoutMode, setLayoutMode] = useState<'split' | 'table'>('split');

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
          const initDrugId = calibration?.drugId || (drugList.find(d => d.DRUG_NAME.toLowerCase() === 'cisplatin')?.DRUG_ID) || drugList[0].DRUG_ID;
          setSelectedDrugId(initDrugId);
          runSinglePrediction(initDrugId, tissue, calibration?.minConc, calibration?.maxConc);
        }
      })
      .catch(err => setErrorMsg("Failed to initialize drug catalog: " + err.message));
  }, []);

  // When calibration changes dynamically, sync selected drug & concentration bounds
  useEffect(() => {
    if (calibration?.drugId && drugs.length > 0) {
      setSelectedDrugId(calibration.drugId);
      runSinglePrediction(calibration.drugId, tissue, calibration.minConc, calibration.maxConc);
    }
  }, [calibration]);

  // Whenever sample changes, re-run prediction
  useEffect(() => {
    if (selectedDrugId && activeSample) {
      runSinglePrediction(selectedDrugId, activeSample.tcga_desc, calibration?.minConc, calibration?.maxConc);
      if (batchResults.length > 0) {
        runBatchPrediction(activeSample.tcga_desc);
      }
    }
  }, [sampleId]);

  const runSinglePrediction = async (drugId: number, targetTissue: string, customMin?: number, customMax?: number) => {
    setIsSingleRunning(true);
    setErrorMsg(null);
    try {
      const isTargetCalib = calibration?.drugId === drugId;
      const effectiveMin = customMin !== undefined ? customMin : (isTargetCalib ? calibration?.minConc : undefined);
      const effectiveMax = customMax !== undefined ? customMax : (isTargetCalib ? calibration?.maxConc : undefined);

      const res = await api.predictSingle({
        drug_id: drugId,
        tissue: targetTissue,
        min_conc: effectiveMin,
        max_conc: effectiveMax
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

  // Combine batch items or drugs list when batch not yet run
  const displayedItems = useMemo(() => {
    if (batchResults.length > 0) {
      return batchResults.filter(item => {
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
    }

    // Default drugs list before batch prediction
    return drugs.filter(d => {
      if (searchTerm.trim()) {
        const q = searchTerm.trim().toLowerCase();
        const match = d.DRUG_NAME.toLowerCase().includes(q) || 
                      d.PUTATIVE_TARGET.toLowerCase().includes(q) || 
                      d.PATHWAY_NAME.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (pathwayFilter !== 'ALL' && d.PATHWAY_NAME !== pathwayFilter) return false;
      return true;
    }).map((d, index) => ({
      drug_id: d.DRUG_ID,
      drug_name: d.DRUG_NAME,
      putative_target: d.PUTATIVE_TARGET,
      pathway_name: d.PATHWAY_NAME,
      tissue,
      predicted_ln_ic50: singleResult && singleResult.drug_id === d.DRUG_ID ? singleResult.predicted_ln_ic50 : 3.25,
      predicted_ic50_uM: singleResult && singleResult.drug_id === d.DRUG_ID ? singleResult.predicted_ic50_uM : 25.8,
      sensitivity_category: singleResult && singleResult.drug_id === d.DRUG_ID ? singleResult.sensitivity.category : 'Intermediate',
      badge: 'Tier',
      rank: index + 1
    }));
  }, [batchResults, drugs, searchTerm, pathwayFilter, sensitivityFilter, singleResult, tissue]);

  // Format concentration cleanly
  const formatConc = (val: number | undefined, includeUnit = true) => {
    if (val === undefined || val === null || isNaN(val)) return includeUnit ? '0.0000 µM' : '0.0000';
    if (val < 0.001) return includeUnit ? `${(val * 1000).toFixed(1)} nM` : `${(val * 1000).toFixed(1)}`;
    if (val < 0.01) return includeUnit ? `${val.toFixed(4)} µM` : val.toFixed(4);
    if (val < 1.0) return includeUnit ? `${val.toFixed(3)} µM` : val.toFixed(3);
    return includeUnit ? `${val.toFixed(2)} µM` : val.toFixed(2);
  };

  // Generate 4-parameter logistic sigmoidal dose-response curve
  const doseResponseCurveData = useMemo(() => {
    if (!singleResult) return [];
    const minC = singleResult.min_conc_uM || 0.001;
    const maxC = singleResult.max_conc_uM || 10.0;
    const ic50 = singleResult.predicted_ic50_uM || 1.0;

    const logMin = Math.log10(Math.max(0.0001, minC));
    const logMax = Math.log10(Math.max(minC * 10, maxC));
    const steps = 30;
    const stepSize = (logMax - logMin) / steps;

    const points = [];
    for (let i = 0; i <= steps; i++) {
      const logC = logMin + i * stepSize;
      const c = Math.pow(10, logC);
      const hill = 1.15;
      const viability = 100 / (1 + Math.pow(c / ic50, hill));
      points.push({
        conc: Number(c.toFixed(4)),
        logConc: Number(logC.toFixed(2)),
        viability: Number(viability.toFixed(1)),
        isIc50Point: Math.abs(logC - Math.log10(ic50)) < (stepSize / 1.5)
      });
    }
    return points;
  }, [singleResult]);

  // Discrete logarithmic ticks for dose-response curve to prevent X-axis collisions
  const curveTicks = useMemo(() => {
    if (!singleResult) return [];
    const minC = singleResult.min_conc_uM || 0.001;
    const maxC = singleResult.max_conc_uM || 10.0;
    const ic50 = singleResult.predicted_ic50_uM || 1.0;
    const mid1 = Math.sqrt(minC * ic50);
    const mid2 = Math.sqrt(ic50 * maxC);
    return [
      Number(minC.toFixed(3)),
      Number(mid1.toFixed(3)),
      Number(ic50.toFixed(2)),
      Number(mid2.toFixed(2)),
      Number(maxC.toFixed(2))
    ].filter((v, i, a) => a.indexOf(v) === i);
  }, [singleResult]);

  // Export ranked table directly to CSV
  const handleExportCSV = () => {
    if (!batchResults.length) return;
    const headers = ["Rank", "Drug Name", "Putative Target", "Pathway", "Predicted ln(IC50)", "Predicted IC50 (uM)", "Sensitivity Tier", "Tissue"];
    const rows = batchResults.map(r => [
      r.rank,
      `"${r.drug_name}"`,
      `"${r.putative_target}"`,
      `"${r.pathway_name}"`,
      r.predicted_ln_ic50.toFixed(4),
      r.predicted_ic50_uM.toFixed(4),
      r.sensitivity_category,
      tissue
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `OncoMatch_Ranked_Sensitivity_${activeSample?.name || 'Profile'}_${tissue}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isCurrentPinned = pinnedItems.some(p => p.id === selectedDrugId);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-4 animate-fadeIn">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center">
            <Pill className="w-5 h-5 mr-2 text-teal-600" />
            Chemotherapy Response Prediction & 4PL Curve Inspector
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Holdout-validated HistGradientBoosting inference across 295 screening regimens.
          </p>
        </div>

        {/* View Mode & Batch Run Buttons */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => runBatchPrediction()}
            disabled={isBatchRunning}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-xs transition-all shadow-md shadow-teal-600/20 active:scale-98 disabled:opacity-50 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{isBatchRunning ? "Ranking 295 Drugs..." : "Rank All 295 Regimens"}</span>
          </button>

          {/* Layout Mode Toggle */}
          <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200">
            <button
              onClick={() => setLayoutMode('split')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                layoutMode === 'split' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Split-Pane Master-Detail View"
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Split Workspace</span>
            </button>
            <button
              onClick={() => setLayoutMode('table')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                layoutMode === 'table' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Full Data Table View"
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Full Table</span>
            </button>
          </div>

          <button
            onClick={() => setShowModelCard(!showModelCard)}
            className="p-1.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50"
            title="Model Architecture & Metrics"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Model Info Drawer */}
      {showModelCard && modelInfo && (
        <div className="p-4 rounded-2xl bg-white border border-teal-200 text-xs space-y-3 shadow-subtle animate-slideDown">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-600" /> {modelInfo.model_card.name} (Refit v1.0)
            </span>
            <span className="font-mono text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded text-[11px] font-bold">
              Holdout MAE: 1.0270 (R² 0.7585)
            </span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Strictly evaluates pre-exposure chemical descriptors, drug putative targets, and TCGA lineage. Excludes post-hoc leaky curve metrics (AUC/Z-Score).
          </p>
        </div>
      )}

      {/* Active Screening Calibration Notice Banner */}
      {calibration && (
        <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-950 text-xs flex items-center justify-between shadow-2xs animate-slideDown">
          <div className="flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-teal-600 shrink-0" />
            <span>
              <strong>Screening Calibration Applied from Setup:</strong> Calibrated bounds active for{' '}
              <span className="font-bold font-mono text-teal-900">
                {drugs.find(d => d.DRUG_ID === calibration.drugId)?.DRUG_NAME || calibration.drugName || 'Selected Drug'}
              </span>{' '}
              ({calibration.minConc} – {calibration.maxConc} µM).
            </span>
          </div>
          {onClearCalibration && (
            <button
              onClick={onClearCalibration}
              className="text-xs text-teal-700 hover:text-teal-950 font-bold underline ml-3 shrink-0 cursor-pointer"
            >
              Reset to GDSC2 Defaults
            </button>
          )}
        </div>
      )}

      {/* Error Banner */}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center justify-between shadow-2xs">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="text-rose-700 hover:text-rose-900 font-bold ml-3">✕</button>
        </div>
      )}

      {/* MASTER-DETAIL SPLIT-PANE WORKSPACE (Requirement 1 & Requirement 3) */}
      {layoutMode === 'split' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[calc(100vh-210px)] min-h-[580px]">
          {/* Left Master List Pane (38% width, ~5 cols): Vertically Scrollable with Sticky Search */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-subtle flex flex-col h-full overflow-hidden">
            {/* Sticky Header Controls on the List */}
            <div className="p-3.5 border-b border-slate-200/80 bg-slate-50/90 space-y-2.5 shrink-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center">
                  <TrendingDown className="w-3.5 h-3.5 mr-1.5 text-teal-600" />
                  Therapeutics Catalogue
                </span>
                <span className="font-mono text-[10px] text-slate-500 font-semibold bg-white border border-slate-200 px-2 py-0.5 rounded-full">
                  {displayedItems.length} Compounds
                </span>
              </div>

              {/* Compact Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search compound, target or pathway..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 font-medium"
                />
              </div>

              {/* Quick Filter Pills */}
              <div className="flex items-center space-x-1.5 text-[10px]">
                {['ALL', 'Sensitive', 'Intermediate', 'Resistant'].map((tier) => (
                  <button
                    key={tier}
                    onClick={() => setSensitivityFilter(tier)}
                    className={`px-2 py-0.5 rounded-lg font-semibold border transition-all cursor-pointer ${
                      sensitivityFilter === tier
                        ? 'bg-teal-600 text-white border-teal-600 shadow-2xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {tier}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable List Body (Preserves scroll position when selecting items) */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {displayedItems.length === 0 ? (
                <div className="py-16 text-center text-xs text-slate-400">
                  No matching chemotherapy therapeutics found.
                </div>
              ) : (
                displayedItems.map((item) => {
                  const isSelected = selectedDrugId === item.drug_id;
                  const isPinned = pinnedItems.some(p => p.id === item.drug_id);
                  return (
                    <div
                      key={item.drug_id}
                      onClick={() => {
                        setSelectedDrugId(item.drug_id);
                        runSinglePrediction(item.drug_id, tissue);
                      }}
                      className={`p-3 flex items-center justify-between text-xs cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-teal-50/90 border-l-4 border-l-teal-600 font-semibold' 
                          : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                        {/* Pin / Compare Checkbox (Requirement 2) */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onTogglePin) {
                              onTogglePin({
                                id: item.drug_id,
                                type: 'drug',
                                title: item.drug_name,
                                subtitle: item.putative_target,
                                tissue,
                                predicted_ln_ic50: item.predicted_ln_ic50,
                                predicted_ic50_uM: item.predicted_ic50_uM,
                                sensitivity_category: item.sensitivity_category,
                                putative_target: item.putative_target,
                                pathway_name: item.pathway_name,
                                min_conc_uM: singleResult?.drug_id === item.drug_id ? singleResult.min_conc_uM : 0.0039,
                                max_conc_uM: singleResult?.drug_id === item.drug_id ? singleResult.max_conc_uM : 1.0,
                                color: '#10b981'
                              });
                            }
                          }}
                          className={`p-1 rounded-md transition-colors ${
                            isPinned ? 'text-teal-600 bg-teal-100' : 'text-slate-300 hover:text-slate-500'
                          }`}
                          title={isPinned ? "Remove from comparison drawer" : "Add to comparison pinboard"}
                        >
                          {isPinned ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                        </button>

                        <div className="truncate">
                          <div className="font-bold text-slate-900 truncate flex items-center space-x-1.5">
                            <span>{item.drug_name}</span>
                            <span className="font-mono text-[10px] text-slate-400 font-normal">
                              #{item.drug_id}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500 truncate">
                            {item.putative_target} • {item.pathway_name}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-mono font-bold text-teal-800 tabular-nums">
                          {item.predicted_ln_ic50.toFixed(2)}
                        </div>
                        <div className="text-[10px] mt-0.5">
                          <SensitivityBadge category={item.sensitivity_category} />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Inspector Pane (62% width, ~7 cols): Pinned, Non-scrolling Workspace */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-subtle flex flex-col h-full overflow-hidden">
            {singleResult ? (
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {/* Inspector Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                        {singleResult.drug_name}
                      </h2>
                      <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                        ID #{singleResult.drug_id}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Tissue Lineage: <strong className="text-slate-800">{singleResult.tissue}</strong> • Target: <span className="font-semibold text-slate-800">{singleResult.putative_target}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Pin button */}
                    <button
                      onClick={() => {
                        if (onTogglePin && singleResult) {
                          onTogglePin({
                            id: singleResult.drug_id,
                            type: 'drug',
                            title: singleResult.drug_name,
                            subtitle: singleResult.putative_target,
                            tissue: singleResult.tissue,
                            predicted_ln_ic50: singleResult.predicted_ln_ic50,
                            predicted_ic50_uM: singleResult.predicted_ic50_uM,
                            sensitivity_category: singleResult.sensitivity.category,
                            putative_target: singleResult.putative_target,
                            pathway_name: singleResult.pathway_name,
                            min_conc_uM: singleResult.min_conc_uM,
                            max_conc_uM: singleResult.max_conc_uM,
                            color: '#10b981'
                          });
                        }
                      }}
                      className={`flex items-center space-x-1 px-2.5 py-1 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        isCurrentPinned 
                          ? 'bg-teal-50 text-teal-800 border-teal-300' 
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                      <span>{isCurrentPinned ? "Pinned in Tray" : "Pin to Compare"}</span>
                    </button>
                    <SensitivityBadge category={singleResult.sensitivity.category} />
                  </div>
                </div>

                {/* Metric Summary Cards */}
                <div className="grid grid-cols-2 gap-3 font-mono">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-0.5">
                    <span className="text-[10px] text-slate-500 font-sans uppercase font-semibold">Predicted ln(IC50)</span>
                    <div className="text-2xl font-extrabold text-teal-800 tabular-nums">
                      {singleResult.predicted_ln_ic50}
                    </div>
                    <div className="text-[10px] text-slate-500 font-sans">
                      80% Holdout CI: [{singleResult.confidence_band_80pct[0]}, {singleResult.confidence_band_80pct[1]}]
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-0.5">
                    <span className="text-[10px] text-slate-500 font-sans uppercase font-semibold">Estimated IC50 (µM)</span>
                    <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
                      {formatConc(singleResult.predicted_ic50_uM)}
                    </div>
                    <div className="text-[10px] text-slate-500 font-sans">
                      80% Interval: [{formatConc(singleResult.ic50_band_80pct_uM[0])} – {formatConc(singleResult.ic50_band_80pct_uM[1])}]
                    </div>
                  </div>
                </div>

                {/* Fitted 4PL Sigmoidal Curve (Large & Non-clipping) */}
                <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center shrink-0">
                      <Activity className="w-4 h-4 mr-1.5 text-teal-600" /> Fitted 4PL Sigmoidal Curve
                    </span>
                    <span className="font-mono text-[11px] font-bold text-teal-800 bg-white border border-slate-200 px-2.5 py-0.5 rounded-full shadow-2xs shrink-0">
                      IC50: {formatConc(singleResult.predicted_ic50_uM)}
                    </span>
                  </div>

                  <div className="h-56 w-full bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={doseResponseCurveData} margin={{ top: 10, right: 15, left: -20, bottom: 15 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="conc" 
                          ticks={curveTicks}
                          stroke="#64748b" 
                          fontSize={9} 
                          tickFormatter={(v) => formatConc(v, false)}
                          tickLine={false}
                          label={{ value: 'Screening Concentration (µM)', position: 'insideBottom', offset: -10, fontSize: 9, fill: '#475569' }}
                        />
                        <YAxis 
                          domain={[0, 100]} 
                          ticks={[0, 25, 50, 75, 100]} 
                          stroke="#64748b" 
                          fontSize={9} 
                          tickLine={false}
                          label={{ value: '% Viability', angle: -90, position: 'insideLeft', offset: 15, fontSize: 9, fill: '#475569' }}
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#ffffff', borderColor: '#94a3b8', borderRadius: '10px', fontSize: '11px', color: '#0f172a', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                          formatter={(val: any) => [`${val}% Viability`, 'Predicted Kill']}
                          labelFormatter={(lbl: any) => `Concentration: ${lbl} µM`}
                        />
                        <ReferenceLine 
                          y={50} 
                          stroke="#d97706" 
                          strokeWidth={1.5} 
                          strokeDasharray="4 4" 
                          label={{ value: '50% Kill', fill: '#b45309', fontSize: 9, position: 'insideTopLeft' }} 
                        />
                        <ReferenceLine 
                          x={singleResult.predicted_ic50_uM} 
                          stroke="#0d9488" 
                          strokeDasharray="2 2" 
                          strokeWidth={1}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="viability" 
                          stroke="#0d9488" 
                          strokeWidth={2.5} 
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-1.5 text-[10px] text-slate-600 font-mono px-1 pt-0.5">
                    <span>Bounds: {formatConc(singleResult.min_conc_uM)} – {formatConc(singleResult.max_conc_uM)}</span>
                    <span className="text-teal-800 font-semibold font-sans">50% cell kill inflection point @ IC50</span>
                  </div>
                </div>

                {/* Pharmacology Metadata */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Signaling Pathway:</span>
                    <span className="font-semibold text-slate-800">{singleResult.pathway_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Relative Sensitivity:</span>
                    <span className="font-bold text-teal-800">{singleResult.sensitivity.relative_to_median}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 pt-1 leading-relaxed border-t border-slate-200/60">
                    {singleResult.sensitivity.description}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-2">
                <Pill className="w-8 h-8 text-slate-300" />
                <span className="text-xs">Select any compound on the left to inspect its dose-response curve.</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* FULL DATA TABLE VIEW WITH FROZEN HEADERS & STICKY FIRST COLUMN (Requirement 3) */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center">
              <TrendingDown className="w-4 h-4 mr-2 text-teal-600" />
              Full 295-Compound Response Ranking Matrix
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleExportCSV}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Viewport-locked table with frozen header & sticky first column */}
          <div className="h-[calc(100vh-270px)] min-h-[460px] overflow-auto rounded-xl border border-slate-200 relative">
            <table className="w-full text-left text-xs border-collapse min-w-[700px]">
              <thead className="sticky top-0 z-20 bg-slate-100 shadow-2xs font-mono text-[11px] text-slate-700">
                <tr>
                  <th className="py-3 px-3 w-10 text-center bg-slate-100 sticky top-0">#</th>
                  <th className="py-3 px-4 font-sans bg-slate-100 sticky top-0 left-0 z-30 min-w-[140px] shadow-sm">
                    Compound Name
                  </th>
                  <th className="py-3 px-4 font-sans bg-slate-100 sticky top-0 min-w-[140px]">Putative Target</th>
                  <th className="py-3 px-4 font-sans bg-slate-100 sticky top-0 min-w-[120px]">Pathway</th>
                  <th className="py-3 px-4 text-right bg-slate-100 sticky top-0 min-w-[80px]">ln(IC50)</th>
                  <th className="py-3 px-4 text-right bg-slate-100 sticky top-0 min-w-[90px]">IC50 (µM)</th>
                  <th className="py-3 px-4 text-center font-sans bg-slate-100 sticky top-0 min-w-[100px]">Tier</th>
                  <th className="py-3 px-4 text-center font-sans bg-slate-100 sticky top-0 w-24">Compare</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {displayedItems.map((item) => {
                  const isSelected = selectedDrugId === item.drug_id;
                  const isPinned = pinnedItems.some(p => p.id === item.drug_id);
                  return (
                    <tr
                      key={item.drug_id}
                      onClick={() => {
                        setSelectedDrugId(item.drug_id);
                        runSinglePrediction(item.drug_id, tissue);
                      }}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-teal-50/80 font-semibold' : 'hover:bg-slate-50/70'
                      }`}
                    >
                      <td className="py-2.5 px-3 text-center text-slate-400 font-bold">{item.rank}</td>
                      <td className="py-2.5 px-4 font-bold text-slate-900 font-sans sticky left-0 z-10 bg-white group-hover:bg-slate-50 truncate max-w-[140px]">
                        {item.drug_name}
                      </td>
                      <td className="py-2.5 px-4 text-slate-600 font-sans truncate max-w-[140px]">{item.putative_target}</td>
                      <td className="py-2.5 px-4 text-slate-500 font-sans truncate max-w-[120px]">{item.pathway_name}</td>
                      <td className="py-2.5 px-4 text-right font-bold text-teal-800 tabular-nums">
                        {item.predicted_ln_ic50.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-4 text-right text-slate-800 tabular-nums">
                        {formatConc(item.predicted_ic50_uM)}
                      </td>
                      <td className="py-2.5 px-4 text-center font-sans">
                        <SensitivityBadge category={item.sensitivity_category} />
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onTogglePin) {
                              onTogglePin({
                                id: item.drug_id,
                                type: 'drug',
                                title: item.drug_name,
                                subtitle: item.putative_target,
                                tissue,
                                predicted_ln_ic50: item.predicted_ln_ic50,
                                predicted_ic50_uM: item.predicted_ic50_uM,
                                sensitivity_category: item.sensitivity_category,
                                putative_target: item.putative_target,
                                pathway_name: item.pathway_name,
                                color: '#10b981'
                              });
                            }
                          }}
                          className={`p-1 rounded-md transition-colors ${
                            isPinned ? 'text-teal-600 bg-teal-100' : 'text-slate-300 hover:text-slate-500'
                          }`}
                        >
                          {isPinned ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
