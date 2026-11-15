import React, { useState, useEffect } from 'react';
import { 
  Settings2, 
  FlaskConical, 
  Pill, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Layers, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  PlusCircle,
  Database,
  Sliders,
  Loader2
} from 'lucide-react';
import { api } from '../services/api';
import { Sample, CellLine, Drug } from '../types';
import { SampleTypeBadge } from '../components/SampleTypeBadge';

interface SampleAnalysisSetupProps {
  samples: Sample[];
  selectedSampleId: string;
  onSampleSelect: (id: string) => void;
  onSampleCreated: (sample: Sample) => void;
  onNavigate: (page: string) => void;
}

export const SampleAnalysisSetup: React.FC<SampleAnalysisSetupProps> = ({
  samples,
  selectedSampleId,
  onSampleSelect,
  onSampleCreated,
  onNavigate
}) => {
  // Cell lines & drugs catalog
  const [cellLines, setCellLines] = useState<CellLine[]>([]);
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [tissues, setTissues] = useState<string[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);

  // Search & Filter state for 969 Cell Lines
  const [cellLineSearch, setCellLineSearch] = useState('');
  const [selectedTissueFilter, setSelectedTissueFilter] = useState('ALL');

  // Form Mode: 'catalog' (select from 969) or 'custom'
  const [mode, setMode] = useState<'catalog' | 'custom'>('catalog');

  // Selected or Custom Setup Form state
  const [selectedCellLine, setSelectedCellLine] = useState<CellLine | null>(null);
  const [customName, setCustomName] = useState('');
  const [customTissue, setCustomTissue] = useState('BRCA');
  const [customSampleType, setCustomSampleType] = useState('Established cancer cell line');
  const [customSubtype, setCustomSubtype] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [projectId, setProjectId] = useState('PROJ-ONCO-01');

  // Target Drug Calibration
  const [selectedDrugId, setSelectedDrugId] = useState<number | undefined>(undefined);
  const [minConc, setMinConc] = useState<number>(0.0039);
  const [maxConc, setMaxConc] = useState<number>(1.0);

  // Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      api.getCellLines(),
      api.getDrugs(),
      api.getTissues()
    ]).then(([clData, drugList, tissueList]) => {
      setCellLines(clData.cell_lines);
      setDrugs(drugList);
      setTissues(tissueList);
      
      // Default to MCF7 if available
      const mcf = clData.cell_lines.find(c => c.name === 'MCF7');
      if (mcf) {
        setSelectedCellLine(mcf);
      }
      if (drugList.length > 0) {
        const cisplatin = drugList.find(d => d.DRUG_NAME.toLowerCase().includes('cisplatin')) || drugList[0];
        setSelectedDrugId(cisplatin.DRUG_ID);
        setMinConc(cisplatin.MIN_CONC);
        setMaxConc(cisplatin.MAX_CONC);
      }
    }).catch(err => {
      console.error("Error loading setup catalog:", err);
    }).finally(() => {
      setLoadingCatalog(false);
    });
  }, []);

  const handleDrugChange = (drugIdStr: string) => {
    const id = parseInt(drugIdStr, 10);
    setSelectedDrugId(id);
    const drug = drugs.find(d => d.DRUG_ID === id);
    if (drug) {
      setMinConc(drug.MIN_CONC);
      setMaxConc(drug.MAX_CONC);
    }
  };

  const handleSelectCellLine = (cl: CellLine) => {
    setSelectedCellLine(cl);
    setErrorMessage(null);
  };

  const handleCreateOrActivateSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      let createdProfile: Sample;
      if (mode === 'catalog') {
        if (!selectedCellLine) {
          throw new Error("Please select a cancer cell line from the catalogue.");
        }
        // Create or get from API
        createdProfile = await api.createSample({
          name: `${selectedCellLine.name} (${selectedCellLine.tcga_desc})`,
          cell_line_name: selectedCellLine.name,
          cosmic_id: selectedCellLine.cosmic_id,
          tcga_desc: selectedCellLine.tcga_desc,
          sample_type: 'Established cancer cell line',
          cancer_type: `${selectedCellLine.tcga_desc} Lineage`,
          description: `GDSC2 screened cell line ${selectedCellLine.name}. COSMIC ID: ${selectedCellLine.cosmic_id}. Tested across ${selectedCellLine.tested_drugs} compounds.`,
          research_project_id: projectId
        });
      } else {
        if (!customName.trim()) {
          throw new Error("Please specify a sample name for the custom profile.");
        }
        createdProfile = await api.createSample({
          name: customName.trim(),
          tcga_desc: customTissue,
          sample_type: customSampleType,
          cancer_type: `${customTissue} Cancer`,
          cancer_subtype: customSubtype.trim() || 'Unspecified',
          description: customDescription.trim() || 'Custom oncology research isolate.',
          research_project_id: projectId
        });
      }

      onSampleCreated(createdProfile);
      setSuccessMessage(`Analysis profile '${createdProfile.name}' configured and set as active.`);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to configure analysis profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered cell lines for selection
  const filteredCellLines = cellLines.filter(cl => {
    const matchSearch = cellLineSearch === '' || 
      cl.name.toLowerCase().includes(cellLineSearch.toLowerCase()) || 
      cl.cosmic_id.toString().includes(cellLineSearch);
    const matchTissue = selectedTissueFilter === 'ALL' || cl.tcga_desc === selectedTissueFilter;
    return matchSearch && matchTissue;
  });

  const activeSample = samples.find(s => s.sample_id === selectedSampleId);
  const selectedDrug = drugs.find(d => d.DRUG_ID === selectedDrugId);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-[11px] font-semibold mb-2">
            <Settings2 className="w-3.5 h-3.5 text-teal-600 mr-1" />
            <span>Step 1 of Experimental Workflow</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Sample & Analysis Setup
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-1">
            Configure your target cancer cell line or custom tumor model from 969 COSMIC-verified cell lines, specify tissue lineage, and calibrate drug screening concentration bounds.
          </p>
        </div>

        {/* Quick Jump CTA */}
        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={() => onNavigate('prediction')}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Pill className="w-4 h-4" />
            <span>Go to Prediction</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Success / Error Banners */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button 
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button 
            onClick={() => setErrorMessage(null)}
            className="text-rose-700 hover:text-rose-900 font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Mode Switcher: 969 Verified Cell Lines vs Custom Tumor Profile */}
      <div className="flex items-center space-x-2 p-1.5 bg-slate-100/80 rounded-xl w-fit border border-slate-200">
        <button
          onClick={() => { setMode('catalog'); setErrorMessage(null); }}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            mode === 'catalog'
              ? 'bg-white text-teal-900 shadow-2xs border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Database className="w-3.5 h-3.5 text-teal-600" />
          <span>Select from 969 Verified Cell Lines</span>
        </button>
        <button
          onClick={() => { setMode('custom'); setErrorMessage(null); }}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            mode === 'custom'
              ? 'bg-white text-teal-900 shadow-2xs border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <PlusCircle className="w-3.5 h-3.5 text-indigo-600" />
          <span>Configure Custom / Primary Isolate</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Cell Line / Sample Selector Form */}
        <div className="lg:col-span-2 space-y-6">
          {mode === 'catalog' ? (
            /* Mode 1: Searchable 969 Cell Lines Table / Cards */
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 flex items-center">
                    <FlaskConical className="w-4 h-4 mr-2 text-teal-600" /> GDSC2 Cancer Cell Line Directory
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Search 969 cell lines across 33 TCGA tissues with verified COSMIC IDs.
                  </p>
                </div>
                <div className="text-xs font-mono font-semibold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                  {loadingCatalog ? 'Loading cell lines...' : `${filteredCellLines.length} of ${cellLines.length || 969} Lines`}
                </div>
              </div>

              {/* Search & Tissue Filter Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={cellLineSearch}
                    onChange={(e) => setCellLineSearch(e.target.value)}
                    placeholder="Search by name (e.g. MCF7, A549) or COSMIC ID..."
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg pl-9 pr-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>

                <div>
                  <select
                    value={selectedTissueFilter}
                    onChange={(e) => setSelectedTissueFilter(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 cursor-pointer"
                  >
                    <option value="ALL">All Tissue Lineages (33)</option>
                    {tissues.map(t => (
                      <option key={t} value={t}>{t} Lineage</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Cell Line List Box */}
              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-72 overflow-y-auto divide-y divide-slate-100 min-h-[160px]">
                {loadingCatalog ? (
                  <div className="py-16 text-center text-xs text-slate-500 flex flex-col items-center justify-center space-y-2">
                    <Loader2 className="w-5 h-5 animate-spin text-teal-600 mb-1" />
                    <span>Loading 969 GDSC2 cancer cell lines...</span>
                  </div>
                ) : filteredCellLines.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-500">
                    {cellLineSearch.trim() ? `No cancer cell lines matching "${cellLineSearch}".` : 'No cell lines found for the selected lineage filter.'}
                  </div>
                ) : (
                  filteredCellLines.slice(0, 50).map(cl => {
                    const isSelected = selectedCellLine?.cosmic_id === cl.cosmic_id;
                    return (
                      <div
                        key={cl.cosmic_id}
                        onClick={() => handleSelectCellLine(cl)}
                        className={`p-3.5 flex items-center justify-between text-xs transition-colors cursor-pointer ${
                          isSelected ? 'bg-teal-50/80 border-l-4 border-l-teal-600' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[11px] ${
                            isSelected ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {cl.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center space-x-2">
                              <span>{cl.name}</span>
                              <span className="font-mono text-[10px] text-slate-500 font-normal">
                                COSMIC {cl.cosmic_id}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500">
                              Lineage: <span className="font-semibold text-slate-700">{cl.tcga_desc}</span> • Tested on <span className="font-semibold text-slate-700">{cl.tested_drugs}</span> drugs
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-[10px] text-slate-500 uppercase font-semibold">Baseline ln(IC50)</div>
                          <div className="font-mono font-bold text-slate-800">{cl.median_ln_ic50.toFixed(2)}</div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {filteredCellLines.length > 50 && (
                <div className="text-center text-[11px] text-slate-500">
                  Showing top 50 of {filteredCellLines.length} matched lines. Use search to refine.
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={handleCreateOrActivateSetup}
                disabled={isSubmitting || !selectedCellLine}
                className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Set {selectedCellLine ? selectedCellLine.name : 'Cell Line'} as Active Profile</span>
              </button>
            </div>
          ) : (
            /* Mode 2: Custom Profile Configuration Form */
            <form onSubmit={handleCreateOrActivateSetup} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center">
                  <PlusCircle className="w-4 h-4 mr-2 text-indigo-600" /> Custom Tumor Isolate Configuration
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure a patient-derived specimen or novel preclinical cancer model with tissue lineage mapping.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Sample / Model Identifier *
                  </label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g. PDX-BREAST-2024"
                    required
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    TCGA Tissue Lineage Origin *
                  </label>
                  <select
                    value={customTissue}
                    onChange={(e) => setCustomTissue(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
                  >
                    {tissues.map(t => (
                      <option key={t} value={t}>{t} Lineage</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Model Category
                  </label>
                  <select
                    value={customSampleType}
                    onChange={(e) => setCustomSampleType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
                  >
                    <option value="Established cancer cell line">Established cancer cell line</option>
                    <option value="Patient-derived cell line">Patient-derived cell line</option>
                    <option value="Patient-derived organoid">Patient-derived organoid</option>
                    <option value="Patient-derived xenograft (PDX)">Patient-derived xenograft (PDX)</option>
                    <option value="Other preclinical model">Other preclinical model</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Histological Subtype / Driver Mutation
                  </label>
                  <input
                    type="text"
                    value={customSubtype}
                    onChange={(e) => setCustomSubtype(e.target.value)}
                    placeholder="e.g. KRAS G12D mutant, ER+/HER2-"
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Research Project Notes
                </label>
                <textarea
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  rows={2}
                  placeholder="Optional experimental metadata, passage number, or culture condition notes..."
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              {customSampleType.includes('Patient-derived') && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed text-[11px]">
                    <strong>Preclinical Caution:</strong> Model predictions reflect 2D monolayer cell-line pharmacogenomics. Primary tumor microenvironment, stromal interactions, and vascular delivery are not accounted for.
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Save and Activate Custom Profile</span>
              </button>
            </form>
          )}

          {/* Section: Screening Concentration Calibration */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center">
                  <Sliders className="w-4 h-4 mr-2 text-teal-600" /> Target Drug & Concentration Calibration
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pre-calibrate screening concentration bounds for downstream prediction and 4PL sigmoidal response curves.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
                GDSC2 Calibrated
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Target Drug Compound
                </label>
                <select
                  value={selectedDrugId || (drugs.length > 0 ? drugs[0].DRUG_ID : '')}
                  onChange={(e) => handleDrugChange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
                >
                  {drugs.map(d => (
                    <option key={d.DRUG_ID} value={d.DRUG_ID}>
                      {d.DRUG_NAME} ({d.PUTATIVE_TARGET || 'Target'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Minimum Bound (µM)
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={minConc}
                  onChange={(e) => setMinConc(parseFloat(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg px-3 py-2 font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Maximum Bound (µM)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={maxConc}
                  onChange={(e) => setMaxConc(parseFloat(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg px-3 py-2 font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>

            {selectedDrug && (
              <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 flex flex-wrap items-center justify-between gap-2 border border-slate-100">
                <div>
                  Pathway: <span className="font-semibold text-slate-800">{selectedDrug.PATHWAY_NAME}</span>
                </div>
                <div>
                  Target: <span className="font-semibold text-slate-800">{selectedDrug.PUTATIVE_TARGET}</span>
                </div>
                <div>
                  Tested Range: <span className="font-mono font-semibold text-teal-800">{selectedDrug.MIN_CONC} - {selectedDrug.MAX_CONC} µM</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Active Profile Summary & Saved Profiles */}
        <div className="space-y-6">
          {/* Active Profile Card */}
          <div className="bg-gradient-to-br from-teal-900 to-slate-900 text-white p-6 rounded-2xl shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-300 flex items-center">
                <Layers className="w-3.5 h-3.5 mr-1" /> Active Target Setup
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>

            {activeSample ? (
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    {activeSample.name}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="font-mono text-xs font-bold bg-teal-800/80 px-2 py-0.5 rounded text-teal-200 border border-teal-700">
                      {activeSample.tcga_desc}
                    </span>
                    <span className="text-xs text-slate-300">
                      {activeSample.cancer_type}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-white/10 rounded-xl space-y-1.5 text-xs text-slate-200 border border-white/10">
                  <div className="flex justify-between">
                    <span className="text-slate-400">COSMIC ID:</span>
                    <span className="font-mono font-bold text-white">
                      {activeSample.cosmic_id || 'Custom Profile'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tested Drugs:</span>
                    <span className="font-mono font-bold text-teal-300">
                      {activeSample.tested_drugs || 295} Screened
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Baseline ln(IC50):</span>
                    <span className="font-mono font-bold text-emerald-300">
                      {(activeSample.baseline_ln_ic50 || 3.255).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Probe Assays:</span>
                    <span className="font-mono font-bold text-white">
                      {activeSample.probe_assay_count || 15} Available
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {activeSample.description}
                </p>

                <button
                  onClick={() => onNavigate('prediction')}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-colors shadow-sm cursor-pointer"
                >
                  <Pill className="w-4 h-4" />
                  <span>Run Prediction for {activeSample.name}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="text-xs text-slate-300">
                No active profile selected. Choose a cell line from the catalogue.
              </div>
            )}
          </div>

          {/* Quick Selection: Pre-Loaded Reference Profiles */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center">
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-teal-600" /> Benchmark Reference Cell Lines
            </h3>
            <div className="space-y-2">
              {samples.map(s => {
                const isActive = s.sample_id === selectedSampleId;
                return (
                  <button
                    key={s.sample_id}
                    onClick={() => onSampleSelect(s.sample_id)}
                    className={`w-full text-left p-2.5 rounded-xl text-xs transition-all border flex items-center justify-between cursor-pointer ${
                      isActive
                        ? 'bg-teal-50/80 border-teal-300 shadow-2xs font-semibold'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex-1 min-w-0 pr-3">
                      <div className="font-bold text-slate-900 truncate">{s.name}</div>
                      <div className="text-[10px] text-slate-500 truncate">
                        {s.cancer_type} • {s.tcga_desc}
                      </div>
                    </div>
                    <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded ${
                      isActive ? 'text-teal-700 bg-teal-100/80' : 'text-slate-500 bg-slate-100'
                    }`}>
                      {isActive ? 'Active' : 'Select'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
