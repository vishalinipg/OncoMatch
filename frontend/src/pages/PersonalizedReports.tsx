import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  FileSpreadsheet, 
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { api } from '../services/api';
import { ReportRecord, Sample } from '../types';
import { SampleTypeBadge } from '../components/SampleTypeBadge';

interface PersonalizedReportsProps {
  sampleId: string;
  samples: Sample[];
  onSampleChange: (id: string) => void;
  onNavigate: (page: string) => void;
}

export const PersonalizedReports: React.FC<PersonalizedReportsProps> = ({
  sampleId,
  samples,
  onSampleChange,
  onNavigate
}) => {
  const [history, setHistory] = useState<ReportRecord[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const activeSample = samples.find(s => s.sample_id === sampleId);

  const loadHistory = () => {
    api.getReportHistory()
      .then(records => setHistory(records))
      .catch(err => console.error("Error loading report history:", err));
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleGenerateReport = async () => {
    if (!activeSample) return;
    setIsGenerating(true);
    setErrorNotice(null);
    setSuccessNotice(null);

    try {
      const record = await api.generateReport(activeSample.sample_id, activeSample.tcga_desc);
      setSuccessNotice(`Report ${record.report_id} generated successfully.`);
      loadHistory();
    } catch (err: any) {
      setErrorNotice(err.message || "Failed to generate report.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center">
            <FileText className="w-6 h-6 mr-2.5 text-indigo-400" />
            Personalized Oncology Report Generation & Export
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Export publication-ready vector PDF clinical-research reports and complete CSV prediction matrices.
          </p>
        </div>

        <button
          onClick={loadHistory}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh History</span>
        </button>
      </div>

      {/* Report Generation Trigger Panel */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Generate Report for Active Sample
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Compiles molecular quality metrics, 295 chemotherapy sensitivity rankings, and model cards into a multi-format package.
            </p>
          </div>

          <button
            onClick={handleGenerateReport}
            disabled={isGenerating || !activeSample}
            className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-teal-500/20 active:scale-95 disabled:opacity-50 shrink-0"
          >
            <FileText className="w-4 h-4" />
            <span>{isGenerating ? "Compiling PDF..." : "Generate Vector PDF & CSV"}</span>
          </button>
        </div>

        {activeSample && (
          <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-white text-sm">{activeSample.name}</span>
                <span className="text-slate-500">({activeSample.sample_id})</span>
                <SampleTypeBadge type={activeSample.sample_type} />
              </div>
              <div className="text-slate-400 text-[11px]">
                {activeSample.cancer_type} • Tissue Origin: <span className="text-teal-400 font-mono font-semibold">{activeSample.tcga_desc}</span>
              </div>
            </div>

            <div className="flex items-center space-x-4 font-mono text-[11px] text-slate-400">
              <div>L1000 Landmark: <span className="text-white font-bold">{activeSample.quality?.l1000_landmark_matched || 978}/978</span></div>
              <div>Outliers: <span className="text-amber-400 font-bold">{activeSample.quality?.outlier_count || 0}</span></div>
            </div>
          </div>
        )}

        {successNotice && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-lg text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{successNotice}</span>
          </div>
        )}

        {errorNotice && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-lg text-xs flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>{errorNotice}</span>
          </div>
        )}
      </div>

      {/* Generated Reports History Table */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center">
              <Clock className="w-4 h-4 mr-2 text-indigo-400" />
              Report History & Reproducibility Archive
            </h3>
            <span className="text-xs text-slate-400">
              {history.length} generated analysis reports persisted in session storage
            </span>
          </div>
        </div>

        {history.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 sticky top-0 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Report ID</th>
                  <th className="py-3 px-4">Sample Name & ID</th>
                  <th className="py-3 px-4">Tissue</th>
                  <th className="py-3 px-4">Top Sensitive Agent</th>
                  <th className="py-3 px-4">Generated Timestamp</th>
                  <th className="py-3 px-4 text-right">Downloads</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {history.map((rep) => (
                  <tr key={rep.report_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-teal-400">{rep.report_id}</td>
                    <td className="py-3 px-4 font-sans">
                      <div className="font-semibold text-white">{rep.sample_name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{rep.sample_id}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{rep.tissue}</td>
                    <td className="py-3 px-4 text-emerald-400 font-sans font-semibold">
                      {rep.top_sensitive_drug}
                    </td>
                    <td className="py-3 px-4 text-slate-400">{rep.timestamp}</td>
                    <td className="py-3 px-4 text-right font-sans">
                      <div className="inline-flex items-center space-x-2">
                        <a
                          href={api.getDownloadUrl(rep.pdf_file)}
                          download={rep.pdf_file}
                          className="flex items-center space-x-1 px-2.5 py-1 rounded bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-semibold transition-colors"
                        >
                          <Download className="w-3 h-3" />
                          <span>PDF</span>
                        </a>
                        <a
                          href={api.getDownloadUrl(rep.csv_file)}
                          download={rep.csv_file}
                          className="flex items-center space-x-1 px-2.5 py-1 rounded bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[11px] font-semibold transition-colors"
                        >
                          <FileSpreadsheet className="w-3 h-3" />
                          <span>CSV</span>
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-slate-500 bg-slate-950/40 rounded-xl border border-dashed border-slate-800">
            No reports generated yet. Click "Generate Vector PDF & CSV" above to compile a comprehensive report for the active sample.
          </div>
        )}
      </div>
    </div>
  );
};
