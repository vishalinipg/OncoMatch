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
  ExternalLink
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
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center">
            <FileText className="w-6 h-6 mr-2.5 text-teal-600" />
            Personalized Oncology Report Generation & Export
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Export publication-ready vector PDF clinical-research reports and complete CSV prediction matrices.
          </p>
        </div>
      </div>

      {/* Streamlined Report Generation Trigger Panel */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Compile Analysis Report Package
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Generates a reproducible report for active target{' '}
              <strong className="text-slate-900">{activeSample?.name || 'Selected Sample'}</strong>{' '}
              <span className="font-mono text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200 font-bold text-[11px]">
                {activeSample?.tcga_desc}
              </span>{' '}
              including 286 ranked drug sensitivities, 15 reference probe assay benchmarks, and model performance metrics.
            </p>
          </div>

          <button
            onClick={handleGenerateReport}
            disabled={isGenerating || !activeSample}
            className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-all shadow-sm shadow-teal-600/20 active:scale-95 disabled:opacity-50 shrink-0 cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>{isGenerating ? "Compiling PDF..." : "Generate Vector PDF & CSV"}</span>
          </button>
        </div>

        {successNotice && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{successNotice}</span>
          </div>
        )}

        {errorNotice && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-900 rounded-lg text-xs flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-medium">{errorNotice}</span>
          </div>
        )}
      </div>

      {/* Generated Reports History Table */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center">
              <Clock className="w-4 h-4 mr-2 text-teal-600" />
              Report History & Reproducibility Archive
            </h3>
            <span className="text-xs text-slate-600">
              {filteredHistory.length} of {history.length} generated analysis reports in session storage
            </span>
          </div>

          {/* Quick Search on Reports Table */}
          {history.length > 0 && (
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Filter by ID, compound or date..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 shadow-2xs"
              />
            </div>
          )}
        </div>

        {filteredHistory.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 sticky top-0 text-slate-700 font-semibold border-b border-slate-200 font-mono">
                <tr>
                  <th className="py-3 px-4 min-w-[130px] whitespace-nowrap">Report ID</th>
                  <th className="py-3 px-4 font-sans">Target Profile</th>
                  <th className="py-3 px-4 font-sans">Top Sensitive Agent</th>
                  <th className="py-3 px-4">Generated Timestamp</th>
                  <th className="py-3 px-4 text-right font-sans">Downloads</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {filteredHistory.map((rep) => (
                  <tr key={rep.report_id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Report ID with whitespace-nowrap & min-w-[130px] so it never line breaks */}
                    <td className="py-3 px-4 font-bold text-teal-800 whitespace-nowrap min-w-[130px]">
                      {rep.report_id}
                    </td>
                    <td className="py-3 px-4 font-sans">
                      <div className="font-semibold text-slate-900">{rep.sample_name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{rep.tissue}</div>
                    </td>
                    <td className="py-3 px-4 text-emerald-800 font-sans font-semibold">
                      {rep.top_sensitive_drug}
                    </td>
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">{rep.timestamp}</td>
                    <td className="py-3 px-4 text-right font-sans">
                      <div className="inline-flex items-center space-x-2">
                        <a
                          href={api.getDownloadUrl(rep.pdf_file)}
                          download={rep.pdf_file}
                          className="flex items-center space-x-1 px-2.5 py-1 rounded bg-indigo-50/80 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 text-[11px] font-semibold transition-colors"
                        >
                          <Download className="w-3 h-3" />
                          <span>PDF</span>
                        </a>
                        <a
                          href={api.getDownloadUrl(rep.csv_file)}
                          download={rep.csv_file}
                          className="flex items-center space-x-1 px-2.5 py-1 rounded bg-teal-50/80 hover:bg-teal-100 text-teal-800 border border-teal-200 text-[11px] font-semibold transition-colors"
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
