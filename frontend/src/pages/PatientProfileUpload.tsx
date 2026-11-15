import React, { useState } from 'react';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  AlertTriangle, 
  CheckCircle2, 
  PlusCircle, 
  Info, 
  Sparkles,
  Layers,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { api } from '../services/api';
import { Sample } from '../types';
import { SampleTypeBadge } from '../components/SampleTypeBadge';
import { ScientificDisclaimer } from '../components/ScientificDisclaimer';

interface PatientProfileUploadProps {
  samples: Sample[];
  selectedSampleId: string;
  onSampleSelect: (id: string) => void;
  onSampleCreated: (newSample: Sample) => void;
  onNavigate: (page: string) => void;
}

export const PatientProfileUpload: React.FC<PatientProfileUploadProps> = ({
  samples,
  selectedSampleId,
  onSampleSelect,
  onSampleCreated,
  onNavigate
}) => {
  // Form state
  const [sampleId, setSampleId] = useState('');
  const [name, setName] = useState('');
  const [sampleType, setSampleType] = useState('Established cancer cell line');
  const [cancerType, setCancerType] = useState('Lung Adenocarcinoma');
  const [cancerSubtype, setCancerSubtype] = useState('');
  const [tcgaDesc, setTcgaDesc] = useState('LUAD');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('PROJ-ONCO-01');

  // File upload state
  const [uploadedData, setUploadedData] = useState<any | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const tcgaOptions = [
    "BRCA", "LUAD", "SKCM", "COREAD", "PAAD", "OV", "GBM", "LAML", 
    "PRAD", "KIRC", "HNSC", "BLCA", "STAD", "LIHC", "CESC", "SCLC", "PANCAN"
  ];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      setUploadError("File size exceeds 25 MB limit.");
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setSuccessMessage(null);

    try {
      const res = await api.uploadExpressionFile(file);
      setUploadedData(res);
    } catch (err: any) {
      setUploadError(err.message || "Failed to parse molecular profile file.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setUploadError("Sample name is required.");
      return;
    }

    setIsSubmitting(true);
    setUploadError(null);

    try {
      const payload: Partial<Sample> = {
        sample_id: sampleId.trim() || undefined,
        name: name.trim(),
        sample_type: sampleType,
        cancer_type: cancerType,
        cancer_subtype: cancerSubtype || "Unspecified",
        tcga_desc: tcgaDesc,
        description: description,
        research_project_id: projectId,
        expression: uploadedData ? uploadedData.expression_dict : {}
      };

      const created = await api.createSample(payload);
      onSampleCreated(created);
      onSampleSelect(created.sample_id);
      setSuccessMessage(`Profile '${created.name}' (${created.sample_id}) created successfully.`);
      
      // Reset form
      setSampleId('');
      setName('');
      setDescription('');
      setUploadedData(null);
    } catch (err: any) {
      setUploadError(err.message || "Failed to create sample profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeSample = samples.find(s => s.sample_id === selectedSampleId);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center">
            <UploadCloud className="w-6 h-6 mr-2.5 text-teal-400" />
            Patient Profile & Molecular Sample Upload
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Establish sample metadata, manage patient-derived vs. cell line distinctions, and upload 978 L1000 molecular expression data.
          </p>
        </div>

        {activeSample && (
          <div className="flex items-center space-x-3 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-xs">
            <span className="text-slate-400">Current Selection:</span>
            <span className="font-semibold text-white">{activeSample.name}</span>
            <SampleTypeBadge type={activeSample.sample_type} />
          </div>
        )}
      </div>

      {/* Critical Scientific Note on Sample Generalization */}
      <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-200/90 text-xs space-y-2">
        <div className="flex items-center space-x-2 text-sm font-semibold text-amber-300">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <span>Scientific Generalization & Model Transferability Advisory</span>
        </div>
        <p className="leading-relaxed">
          The underlying ML model was trained on <span className="font-semibold text-white">242,036 high-throughput 2D cancer cell line dose-response curves</span> from GDSC2. While patient-derived cell lines (PDCs) and patient-derived organoids (PDOs) can be profiled for translational research, <span className="underline decoration-amber-400">in-vitro 2D cell-line predictions do not automatically generalize to 3D microenvironments or human clinical outcomes</span>. OncoMatch enforces explicit sample categorization and highlights transferability disclaimers on all outputs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Profile Creation & Upload (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-teal-400 flex items-center">
              <PlusCircle className="w-4 h-4 mr-2" /> New Sample Profile Registration
            </h3>

            {successMessage && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-lg text-xs flex items-center justify-between">
                <span>{successMessage}</span>
                <button 
                  onClick={() => onNavigate('molecular')}
                  className="font-semibold text-emerald-400 hover:underline flex items-center"
                >
                  View Profile <ArrowRight className="w-3 h-3 ml-1" />
                </button>
              </div>
            )}

            {uploadError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-lg text-xs flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleCreateProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Sample Name / Cell Line Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PDC-LUNG-088"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Custom Sample ID (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Auto-generated if empty"
                    value={sampleId}
                    onChange={(e) => setSampleId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              {/* Sample Category Selection */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Sample Category *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    "Established cancer cell line",
                    "Patient-derived cancer cell line",
                    "Patient-derived organoid",
                    "Other molecular profile"
                  ].map((st) => (
                    <button
                      type="button"
                      key={st}
                      onClick={() => setSampleType(st)}
                      className={`text-left p-2.5 rounded-lg border text-xs transition-all ${
                        sampleType === st
                          ? 'bg-teal-500/10 border-teal-500 text-teal-300 font-semibold'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="truncate">{st}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    TCGA Tissue Type *
                  </label>
                  <select
                    value={tcgaDesc}
                    onChange={(e) => setTcgaDesc(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                  >
                    {tcgaOptions.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Cancer Type
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Non-Small Cell Lung"
                    value={cancerType}
                    onChange={(e) => setCancerType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Subtype / Driver Mutation
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. EGFR L858R / T790M"
                    value={cancerSubtype}
                    onChange={(e) => setCancerSubtype(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Sample Description & Clinical History (De-identified)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Isolated from treatment-naive biopsy, passage 3, confirmed p53 deficient..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* Molecular File Upload Dropzone */}
              <div className="pt-2">
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Molecular Expression File (CSV / TSV format)
                </label>
                <div className="border-2 border-dashed border-slate-800 hover:border-teal-500/50 rounded-xl p-5 text-center bg-slate-950/40 transition-colors">
                  <input
                    type="file"
                    id="expression-file-input"
                    accept=".csv,.tsv,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="expression-file-input"
                    className="cursor-pointer flex flex-col items-center space-y-2"
                  >
                    <FileSpreadsheet className="w-8 h-8 text-teal-400/80" />
                    <span className="text-xs font-medium text-slate-200">
                      {isUploading ? "Validating & Extracting Genes..." : "Drag & drop or click to upload expression file"}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Supports 2-column CSV (Gene, Expression) or Matrix TSV. Up to 978 L1000 landmark genes.
                    </span>
                  </label>
                </div>

                {uploadedData && (
                  <div className="mt-3 p-3 bg-teal-500/10 border border-teal-500/20 rounded-lg text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-teal-300 font-semibold">
                      <span>✓ File Validated Successfully</span>
                      <span>{uploadedData.valid_genes_extracted} Genes Extracted</span>
                    </div>
                    <div className="text-slate-400 text-[11px]">
                      L1000 Landmark Matches: <span className="text-white font-mono">{uploadedData.l1000_matched} / 978</span> ({uploadedData.l1000_coverage_percent}% coverage)
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-xs transition-all shadow-md shadow-teal-500/20 active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? "Saving Profile..." : "Create & Activate Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Preloaded Reference Library & Sample Cards (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center">
                <Layers className="w-4 h-4 mr-2 text-teal-400" />
                Available Reference Profiles
              </h3>
              <span className="text-xs text-slate-500 font-mono">{samples.length} loaded</span>
            </div>

            <p className="text-xs text-slate-400">
              Select any preloaded biological reference sample to instantly explore molecular features, predict drug sensitivity, or compare profiles.
            </p>

            <div className="space-y-3">
              {samples.map((s) => {
                const isSelected = s.sample_id === selectedSampleId;
                return (
                  <div
                    key={s.sample_id}
                    onClick={() => onSampleSelect(s.sample_id)}
                    className={`p-4 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-teal-500/10 border-teal-500 shadow-md shadow-teal-500/10'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-white text-sm">{s.name}</span>
                      <SampleTypeBadge type={s.sample_type} />
                    </div>
                    <div className="flex items-center space-x-2 text-slate-400 text-[11px] mb-2 font-mono">
                      <span>{s.sample_id}</span>
                      <span>•</span>
                      <span className="text-teal-400 font-semibold">{s.tcga_desc}</span>
                      <span>•</span>
                      <span>{s.cancer_type}</span>
                    </div>
                    {s.description && (
                      <p className="text-slate-400 text-[11px] line-clamp-2 leading-relaxed">
                        {s.description}
                      </p>
                    )}
                    {s.quality && (
                      <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                        <span>L1000: {s.quality.l1000_landmark_matched}/978</span>
                        <span>Outliers: {s.quality.outlier_count}</span>
                        <span>Coverage: {s.quality.l1000_coverage_percent}%</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
