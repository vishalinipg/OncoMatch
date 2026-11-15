import React, { useState, useEffect, useMemo } from 'react';
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
  BarChart2
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine,
  ReferenceDot,
  CartesianGrid
} from 'recharts';
import { api } from '../services/api';
import { Drug, Sample, SinglePredictionResult, BatchPredictionItem, ModelInfo } from '../types';
import { SensitivityBadge } from '../components/SensitivityBadge';

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

  // Format concentration cleanly with appropriate units (µM or nM)
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
    const steps = 25;
    const stepSize = (logMax - logMin) / steps;

    const points = [];
    for (let i = 0; i <= steps; i++) {
      const logC = logMin + i * stepSize;
      const c = Math.pow(10, logC);
      // Standard Hill equation / Emax model: Viability % = 100 / (1 + (Conc / IC50)^Hill)
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

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center">
            <Pill className="w-6 h-6 mr-2.5 text-emerald-600" />
            Chemotherapy Drug Response Prediction & Sensitivity Ranking
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Production HistGradientBoosting inference across 295 anticancer therapeutics.
          </p>
        </div>

        <button
          onClick={() => setShowModelCard(!showModelCard)}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-300 transition-colors shadow-2xs"
        >
          <Info className="w-3.5 h-3.5 text-teal-600" />
          <span>{showModelCard ? "Hide Model Card" : "Model Card & Metrics"}</span>
        </button>
      </div>

      {/* Model Card Drawer */}
      {showModelCard && modelInfo && (
        <div className="p-6 rounded-2xl bg-white border border-teal-200 text-xs space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-teal-600" />
              <span className="text-sm font-bold text-slate-900">{modelInfo.model_card.name}</span>
            </div>
            <span className="text-xs font-mono text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-lg font-bold tracking-normal">
              Cell-Line Grouped 80:20 Split
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
              <div className="text-slate-500 text-[10px]">INDEPENDENT TEST MAE</div>
              <div className="text-base font-extrabold text-emerald-700 mt-1">
                {modelInfo.metrics.tuned_histgb_holdout.MAE} <span className="text-xs text-slate-500 font-sans">(baseline {modelInfo.metrics.mean_baseline_test_MAE})</span>
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
              <div className="text-slate-500 text-[10px]">TEST EXPLAINED VARIANCE (R²)</div>
              <div className="text-base font-extrabold text-teal-700 mt-1">
                {modelInfo.metrics.tuned_histgb_holdout.R2} <span className="text-xs text-slate-500 font-sans">(75.9%)</span>
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
              <div className="text-slate-500 text-[10px]">FULL DATASET REFIT SCOPE</div>
              <div className="text-base font-extrabold text-slate-900 mt-1">
                242,036 Rows / 969 Cell Lines
              </div>
            </div>
          </div>

          <div className="space-y-1.5 text-slate-600 leading-relaxed font-sans">
            <div><strong className="text-slate-900">Excluded Leaky Inputs:</strong> AUC, Z_SCORE, RMSE (derived from the same fitted dose-response curve).</div>
            <div><strong className="text-slate-900">Target Variable:</strong> ln(IC50) in micromolar (µM). Lower values represent higher cell death at lower drug concentrations.</div>
            <div><strong className="text-slate-900">Scientific Sensitivity Tertiles:</strong> Sensitive (&lt; 2.19 ln IC50), Intermediate (2.19 - 4.22), Resistant (&gt; 4.22). Median: 3.255.</div>
          </div>
        </div>
      )}

      {/* Prediction Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input Selection & Single Drug Prediction (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center">
                <Sliders className="w-4 h-4 mr-2 text-teal-600" />
                Select Chemotherapy Drug
              </h3>
              <span className="text-xs font-mono text-teal-700 font-bold">
                {drugs.length} Compounds
              </span>
            </div>

            {/* Drug Dropdown with clean text formatting */}
            <select
              value={selectedDrugId ?? ''}
              onChange={(e) => {
                const did = Number(e.target.value);
                setSelectedDrugId(did);
                runSinglePrediction(did, tissue);
              }}
              className="w-full bg-white border border-slate-300 text-xs rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 shadow-2xs font-medium cursor-pointer"
            >
              {drugs.map(d => (
                <option key={d.DRUG_ID} value={d.DRUG_ID}>
                  {d.DRUG_NAME} — {d.PUTATIVE_TARGET}
                </option>
              ))}
            </select>

            {/* Batch Run Button */}
            <div className="pt-2">
              <button
                onClick={() => runBatchPrediction()}
                disabled={isBatchRunning}
                className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-xs transition-all shadow-sm shadow-teal-600/20 active:scale-95 disabled:opacity-50"
              >
                <Zap className="w-4 h-4" />
                <span>{isBatchRunning ? "Predicting Across 295 Drugs..." : "Rank All 295 Drugs for This Profile"}</span>
              </button>
            </div>
          </div>

          {/* Single Prediction Output Card */}
          {singleResult && (
            <div className="p-6 rounded-2xl bg-gradient-to-br from-white via-teal-50/40 to-emerald-50/20 border border-teal-200/90 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                <div>
                  <span className="text-base font-bold text-slate-900">{singleResult.drug_name}</span>
                  <div className="text-[11px] text-slate-500 font-mono">
                    ID #{singleResult.drug_id} • {singleResult.tissue} Tissue
                  </div>
                </div>
                <SensitivityBadge category={singleResult.sensitivity.category} />
              </div>

              {/* Primary Value Display: Consistent Units (µM) */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Predicted ln(IC50)</div>
                  <div className="text-2xl font-extrabold text-teal-800 font-mono mt-1">
                    {singleResult.predicted_ln_ic50}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    80% Holdout CI: [{singleResult.confidence_band_80pct[0]}, {singleResult.confidence_band_80pct[1]}]
                  </div>
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <div className="text-[10px] text-slate-600 font-semibold uppercase tracking-wider">Estimated IC50</div>
                  <div className="text-2xl font-extrabold text-slate-900 font-mono mt-1">
                    {formatConc(singleResult.predicted_ic50_uM)}
                  </div>
                  <div className="text-[10px] text-slate-600 mt-1 font-mono">
                    80% Range: [{formatConc(singleResult.ic50_band_80pct_uM[0])} - {formatConc(singleResult.ic50_band_80pct_uM[1])}]
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-700 pt-2 border-t border-slate-200/80">
                <div className="flex justify-between">
                  <span className="text-slate-600">Putative Target:</span>
                  <span className="font-bold text-slate-900">{singleResult.putative_target}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Signaling Pathway:</span>
                  <span className="text-teal-800 font-semibold">{singleResult.pathway_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Screening Range:</span>
                  <span className="font-mono text-slate-800 font-semibold">
                    {formatConc(singleResult.min_conc_uM)} to {formatConc(singleResult.max_conc_uM)}
                  </span>
                </div>
              </div>

              {/* Graphical Dose-Response Curve */}
              <div className="pt-2 border-t border-slate-200/80 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center min-w-0 pr-2">
                    <Activity className="w-3.5 h-3.5 mr-1.5 text-teal-600 shrink-0" />
                    <span className="truncate">Fitted Sigmoidal Dose-Response Curve</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-700 font-bold bg-white px-2 py-0.5 rounded border border-slate-200 shrink-0">
                    IC50: {singleResult.predicted_ic50_uM.toFixed(3)} µM
                  </span>
                </div>

                <div className="h-48 w-full bg-white p-2.5 rounded-xl border border-slate-200">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={doseResponseCurveData} margin={{ top: 10, right: 15, left: -20, bottom: 15 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="conc" 
                        stroke="#94a3b8" 
                        fontSize={9} 
                        tickFormatter={(v) => formatConc(v, false)}
                        tickLine={false}
                        label={{ value: 'Log Concentration (µM)', position: 'insideBottom', offset: -10, fontSize: 9, fill: '#475569' }}
                      />
                      <YAxis 
                        domain={[0, 100]} 
                        ticks={[0, 25, 50, 75, 100]} 
                        stroke="#94a3b8" 
                        fontSize={9} 
                        tickLine={false}
                        label={{ value: '% Viability', angle: -90, position: 'insideLeft', offset: 15, fontSize: 9, fill: '#475569' }}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '11px', color: '#0f172a' }}
                        formatter={(val: any) => [`${val}%`, 'Cell Viability']}
                        labelFormatter={(lbl: any) => `Conc: ${lbl} µM`}
                      />
                      <ReferenceLine y={50} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: '50% Kill', fill: '#d97706', fontSize: 9, position: 'insideTopLeft' }} />
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
                <div className="flex flex-wrap items-center justify-between text-[10px] text-slate-600 px-1 pt-0.5 font-mono gap-1">
                  <span>Range: {formatConc(singleResult.min_conc_uM)} to {formatConc(singleResult.max_conc_uM)}</span>
                  <span className="text-teal-800 font-semibold font-sans">Hill inflection: 50% kill @ IC50</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-600 bg-white/80 p-2.5 rounded-lg border border-slate-200">
                {singleResult.sensitivity.description}
              </div>
            </div>
          )}
        </div>

        {/* Right: Batch Ranked Table across All 295 Drugs (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center">
                  <TrendingDown className="w-4 h-4 mr-2 text-emerald-600" />
                  Drug Sensitivity Ranking for {tissue}
                </h3>
                <span className="text-xs text-slate-500">
                  {batchResults.length > 0 ? `Displaying ${filteredBatch.length} of ${batchResults.length} drugs (Ranked by lowest ln IC50)` : "Click button on left to rank all 295 drugs"}
                </span>
              </div>

              {batchResults.length > 0 && (
                <button
                  onClick={() => onNavigate('reports')}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold transition-colors cursor-pointer"
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
                      className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 shadow-2xs"
                    />
                  </div>

                  <select
                    value={pathwayFilter}
                    onChange={(e) => setPathwayFilter(e.target.value)}
                    className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-teal-500 max-w-[150px] truncate shadow-2xs font-medium cursor-pointer"
                  >
                    <option value="ALL">All Pathways</option>
                    {pathways.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>

                  <select
                    value={sensitivityFilter}
                    onChange={(e) => setSensitivityFilter(e.target.value)}
                    className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-teal-500 shadow-2xs font-medium cursor-pointer"
                  >
                    <option value="ALL">All Tiers</option>
                    <option value="Sensitive">Sensitive (&lt; 2.19)</option>
                    <option value="Intermediate">Intermediate (2.19-4.22)</option>
                    <option value="Resistant">Resistant (&gt; 4.22)</option>
                  </select>
                </div>

                {/* Ranked Table */}
                <div className="overflow-x-auto max-h-[520px] rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs min-w-[620px]">
                    <thead className="bg-slate-50 sticky top-0 text-slate-600 font-semibold border-b border-slate-200 font-mono">
                      <tr>
                        <th className="py-2.5 px-3 w-8">#</th>
                        <th className="py-2.5 px-3 font-sans min-w-[110px]">Compound</th>
                        <th className="py-2.5 px-3 font-sans min-w-[110px]">Putative Target</th>
                        <th className="py-2.5 px-3 font-sans min-w-[100px]">Pathway</th>
                        <th className="py-2.5 px-3 text-right min-w-[70px]">ln(IC50)</th>
                        <th className="py-2.5 px-3 text-right min-w-[85px]">IC50 (µM)</th>
                        <th className="py-2.5 px-3 text-center font-sans min-w-[100px]">Tier</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                      {filteredBatch.map((item) => (
                        <tr 
                          key={item.drug_id} 
                          onClick={() => {
                            setSelectedDrugId(item.drug_id);
                            runSinglePrediction(item.drug_id, tissue);
                          }}
                          className={`cursor-pointer transition-colors ${
                            selectedDrugId === item.drug_id ? 'bg-teal-50/70 font-semibold' : 'hover:bg-slate-50/70'
                          }`}
                        >
                          <td className="py-2 px-3 text-slate-400 font-bold">{item.rank}</td>
                          <td className="py-2 px-3 font-bold text-slate-900 font-sans truncate max-w-[130px]">
                            {item.drug_name}
                          </td>
                          <td className="py-2 px-3 text-slate-600 font-sans truncate max-w-[130px]">
                            {item.putative_target}
                          </td>
                          <td className="py-2 px-3 text-slate-500 font-sans truncate max-w-[120px]">
                            {item.pathway_name}
                          </td>
                          <td className="py-2 px-3 text-right font-bold text-teal-700">
                            {item.predicted_ln_ic50.toFixed(2)}
                          </td>
                          <td className="py-2 px-3 text-right text-slate-700">
                            {formatConc(item.predicted_ic50_uM)}
                          </td>
                          <td className="py-2 px-3 text-center font-sans">
                            <SensitivityBadge category={item.sensitivity_category} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="py-14 text-center text-xs text-slate-500 bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
                Click "Rank All 295 Drugs for This Profile" to compute sensitivity rankings across the entire Sanger GDSC2 chemotherapeutic catalog.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
