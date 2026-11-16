import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, 
  Download, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  FileSpreadsheet, 
  Search,
  ChevronRight,
  ShieldCheck,
  ExternalLink,
  Sparkles,
  Layers,
  ArrowRight,
  Loader2,
  Eye
} from 'lucide-react';
import { api } from '../services/api';
import { ReportRecord, Sample } from '../types';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(true);

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

  const filteredHistory = useMemo(() => {
    if (!searchTerm.trim()) return history;
    const q = searchTerm.trim().toLowerCase();
    return history.filter(r => 
      r.report_id.toLowerCase().includes(q) ||
      r.sample_name.toLowerCase().includes(q) ||
      r.top_sensitive_drug.toLowerCase().includes(q) ||
      r.timestamp.toLowerCase().includes(q)
    );
  }, [history, searchTerm]);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-[11px] font-semibold mb-2 shadow-2xs">
            <FileText className="w-3.5 h-3.5 text-teal-600 mr-1" />
            <span>Workflow Stage 5 — Clinical Pharmacogenomic Reports</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Personalized Oncology Report Generation & Export
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-3xl">
            Export publication-ready vector PDF clinical dossiers and complete CSV prediction matrices for <strong className="text-slate-800 font-semibold">{activeSample?.name || 'Active Profile'}</strong>.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 transition-all shadow-subtle cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-teal-600" />
            <span>{showPreview ? "Hide Live Preview" : "Show Live Preview"}</span>
          </button>
        </div>
      </div>

      {/* Streamlined Report Generation Trigger Panel */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-subtle space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Compile Analysis Report Package
            </h3>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Generates a reproducible report for target{' '}
              <strong className="text-slate-900">{activeSample?.name || 'Selected Sample'}</strong>{' '}
              <span className="font-mono text-teal-900 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200 font-bold text-[11px]">
                {activeSample?.tcga_desc} Lineage
              </span>{' '}
              including 286 ranked drug sensitivities, 15 reference probe assay benchmarks, and model performance metrics.
            </p>
          </div>

          <button
            onClick={handleGenerateReport}
            disabled={isGenerating || !activeSample}
            className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-xs transition-all shadow-md shadow-teal-600/20 active:scale-98 disabled:opacity-50 shrink-0 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Compiling Vector PDF & CSV...</span>
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                <span>Generate Vector PDF & CSV</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </>
            )}
          </button>
        </div>

        {successNotice && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-950 rounded-xl text-xs flex items-center justify-between shadow-2xs animate-slideDown">
            <div className="flex items-center space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-medium">{successNotice}</span>
            </div>
            <button 
              onClick={() => setSuccessNotice(null)}
              className="text-emerald-700 hover:text-emerald-900 font-bold ml-4 p-1"
            >
              ✕
            </button>
          </div>
        )}

        {errorNotice && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-950 rounded-xl text-xs flex items-center justify-between shadow-2xs animate-slideDown">
            <div className="flex items-center space-x-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="font-medium">{errorNotice}</span>
            </div>
            <button 
              onClick={() => setErrorNotice(null)}
              className="text-rose-700 hover:text-rose-900 font-bold ml-4 p-1"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Live Interactive Dossier Preview Card */}
      {showPreview && activeSample && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle p-6 space-y-5 animate-slideDown">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Live Dossier Preview</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Publication Grade • 300 DPI Vector Spec</span>
          </div>

          {/* Dossier Mockup */}
          <div className="p-6 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-4 font-sans text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <div className="text-base font-extrabold text-slate-900 tracking-tight">ONCOMATCH CLINICAL PHARMACOGENOMICS DOSSIER</div>
                <div className="text-[11px] text-slate-500 font-mono">Reference Study: Sanger Wellcome GDSC2 Dataset (242,036 Fitted Curves)</div>
              </div>
              <div className="text-right">
                <span className="font-mono text-teal-800 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200 font-bold text-xs">
                  {activeSample.tcga_desc}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-[11px]">
              <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                <div className="text-slate-700 font-bold font-sans text-[10px] uppercase tracking-wider">TARGET SPECIMEN</div>
                <div className="font-bold text-slate-900 truncate mt-0.5">{activeSample.name}</div>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                <div className="text-slate-700 font-bold font-sans text-[10px] uppercase tracking-wider">TCGA LINEAGE</div>
                <div className="font-bold text-teal-800 mt-0.5">{activeSample.tcga_desc}</div>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                <div className="text-slate-700 font-bold font-sans text-[10px] uppercase tracking-wider">COSMIC ID</div>
                <div className="font-bold text-slate-900 mt-0.5">{activeSample.cosmic_id || 'Primary Isolate'}</div>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                <div className="text-slate-700 font-bold font-sans text-[10px] uppercase tracking-wider">MODEL ARCHITECTURE</div>
                <div className="font-bold text-emerald-800 mt-0.5">HistGB (R² 0.7585)</div>
              </div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1 text-slate-700 text-[11px] leading-relaxed break-words whitespace-normal">
              <strong className="text-slate-900 font-bold">Validation Statement:</strong> Model evaluated with strict GroupShuffleSplit cross-validation on held-out cancer cell lines (Zero line overlap, Holdout MAE: 1.0270). Operates purely on verified pre-exposure chemical and lineage features.
            </div>
          </div>
        </div>
      )}

      {/* Generated Reports History Table */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-subtle space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center">
              <Clock className="w-4 h-4 mr-2 text-teal-600" />
              Report History & Reproducibility Archive
            </h3>
            <span className="text-xs text-slate-500">
              {filteredHistory.length} of {history.length} generated analysis reports in storage
            </span>
          </div>

          {/* Quick Search & Bulk Actions on Reports Table */}
          {history.length > 0 && (
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative w-full sm:w-60">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter by ID, compound or date..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 font-medium"
                />
              </div>

              <button
                onClick={() => {
                  if (filteredHistory.length === 0) return;
                  const csvRows = [
                    ["Report ID", "Sample Name", "Tissue", "Top Sensitive Agent", "Timestamp", "Total Drugs Predicted"],
                    ...filteredHistory.map(r => [
                      r.report_id,
                      `"${r.sample_name}"`,
                      r.tissue,
                      r.top_sensitive_drug,
                      r.timestamp,
                      r.total_drugs_predicted
                    ])
                  ];
                  const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.join(",")).join("\n");
                  const encodedUri = encodeURI(csvContent);
                  const link = document.createElement("a");
                  link.setAttribute("href", encodedUri);
                  link.setAttribute("download", `OncoMatch_Reports_Archive_${new Date().toISOString().slice(0, 10)}.csv`);
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer shrink-0"
                title="Export entire report history index as CSV"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Export Index ({filteredHistory.length})</span>
              </button>
            </div>
          )}
        </div>

        {filteredHistory.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 sticky top-0 text-slate-700 font-semibold border-b border-slate-200 font-mono">
                <tr>
                  <th className="py-3 px-4 min-w-[130px] whitespace-nowrap border-r border-slate-200">Report ID</th>
                  <th className="py-3 px-4 font-sans border-r border-slate-200">Target Profile</th>
                  <th className="py-3 px-4 font-sans border-r border-slate-200">Top Sensitive Agent</th>
                  <th className="py-3 px-4 border-r border-slate-200">Generated Timestamp</th>
                  <th className="py-3 px-4 text-right font-sans">Downloads</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80 font-mono text-[11px]">
                {filteredHistory.map((rep) => (
                  <tr key={rep.report_id} className="even:bg-slate-50/60 odd:bg-white hover:bg-teal-50/40 transition-colors border-b border-slate-200/80">
                    <td className="py-3.5 px-4 font-bold text-teal-900 whitespace-nowrap min-w-[130px] border-r border-slate-100">
                      {rep.report_id}
                    </td>
                    <td className="py-3.5 px-4 font-sans border-r border-slate-100">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-slate-900">{rep.sample_name}</span>
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-teal-50 text-teal-800 border border-teal-200 shrink-0">
                          {rep.tissue}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-emerald-800 font-sans font-semibold border-r border-slate-100">
                      {rep.top_sensitive_drug}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap border-r border-slate-100">{rep.timestamp}</td>
                    <td className="py-3.5 px-4 text-right font-sans">
                      <div className="inline-flex items-center space-x-2">
                        <a
                          href={api.getDownloadUrl(rep.pdf_file)}
                          download={rep.pdf_file}
                          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 text-xs font-semibold transition-all shadow-2xs cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>PDF</span>
                        </a>
                        <a
                          href={api.getDownloadUrl(rep.csv_file)}
                          download={rep.csv_file}
                          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-semibold transition-all shadow-2xs cursor-pointer"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5" />
                          <span>CSV</span>
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : history.length > 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
            No reports match search query "{searchTerm}".
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-slate-600 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            No reports generated yet. Click "Generate Vector PDF & CSV" above to compile a comprehensive report for the active sample.
          </div>
        )}
      </div>
    </div>
  );
};
