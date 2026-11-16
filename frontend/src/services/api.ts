import { 
  Drug, 
  ModelInfo, 
  CellLine,
  ProbeDrug,
  Sample, 
  SinglePredictionResult, 
  BatchPredictionItem, 
  PCALandscape, 
  HeatmapData, 
  ReportRecord 
} from '../types';

const API_BASE = '/api';

const batchPredictionCache = new Map<string, { tissue: string; total_drugs: number; predictions: BatchPredictionItem[] }>();

export const api = {
  // Model info
  async getModelInfo(): Promise<ModelInfo> {
    const res = await fetch(`${API_BASE}/model/info`);
    if (!res.ok) throw new Error('Failed to fetch model info');
    return res.json();
  },

  // Cell Lines (969 GDSC2 cell lines)
  async getCellLines(search?: string, tissue?: string, limit: number = 969): Promise<{
    total: number;
    filtered_count: number;
    cell_lines: CellLine[];
  }> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (tissue) params.append('tissue', tissue);
    params.append('limit', limit.toString());
    const res = await fetch(`${API_BASE}/cell-lines?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch cell lines');
    return res.json();
  },

  async getCellLine(cosmicId: number): Promise<{
    cell_line: CellLine;
    probe_fingerprint: Record<string, number>;
    probe_assays: Array<{
      drug_id: number;
      drug_name: string;
      putative_target: string;
      pathway_name: string;
      observed_ln_ic50: number | null;
      overall_mean_ln_ic50: number;
    }>;
  }> {
    const res = await fetch(`${API_BASE}/cell-lines/${cosmicId}`);
    if (!res.ok) throw new Error('Failed to fetch cell line details');
    return res.json();
  },

  // Drugs (286 unique compounds)
  async getDrugs(search?: string): Promise<Drug[]> {
    const url = search ? `${API_BASE}/drugs?search=${encodeURIComponent(search)}` : `${API_BASE}/drugs`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch drugs');
    return res.json();
  },

  // Tissues (33 lineages)
  async getTissues(): Promise<string[]> {
    const res = await fetch(`${API_BASE}/tissues`);
    if (!res.ok) throw new Error('Failed to fetch tissues');
    return res.json();
  },

  // Single Prediction
  async predictSingle(params: {
    drug_id?: number;
    drug_name?: string;
    tissue: string;
    min_conc?: number;
    max_conc?: number;
  }): Promise<SinglePredictionResult> {
    const res = await fetch(`${API_BASE}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Prediction failed' }));
      throw new Error(err.detail || 'Prediction failed');
    }
    return res.json();
  },

  // Batch Prediction
  async predictAllDrugs(tissue: string, forceRefresh = false): Promise<{ tissue: string; total_drugs: number; predictions: BatchPredictionItem[] }> {
    const key = (tissue || 'BRCA').trim().toUpperCase();
    if (!forceRefresh && batchPredictionCache.has(key)) {
      return batchPredictionCache.get(key)!;
    }
    const res = await fetch(`${API_BASE}/predict/all`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tissue: key }),
    });
    if (!res.ok) throw new Error('Failed to run batch prediction');
    const data = await res.json();
    batchPredictionCache.set(key, data);
    return data;
  },

  getCachedBatchPredictions(tissue: string): BatchPredictionItem[] | null {
    const key = (tissue || 'BRCA').trim().toUpperCase();
    return batchPredictionCache.get(key)?.predictions || null;
  },

  // Samples & Analysis Profiles
  async getSamples(): Promise<Sample[]> {
    const res = await fetch(`${API_BASE}/samples`);
    if (!res.ok) throw new Error('Failed to fetch samples');
    return res.json();
  },

  async getSample(sampleId: string): Promise<Sample> {
    const res = await fetch(`${API_BASE}/samples/${encodeURIComponent(sampleId)}`);
    if (!res.ok) throw new Error('Failed to fetch sample details');
    return res.json();
  },

  async createSample(sample: Partial<Sample>): Promise<Sample> {
    const res = await fetch(`${API_BASE}/samples`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sample),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to create sample' }));
      throw new Error(err.detail || 'Failed to create sample');
    }
    return res.json();
  },

  // Visual Analytics
  async getPCA(sampleId?: string): Promise<PCALandscape> {
    const url = sampleId ? `${API_BASE}/analytics/pca?sample_id=${encodeURIComponent(sampleId)}` : `${API_BASE}/analytics/pca`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch PCA data');
    return res.json();
  },

  async getProbeAssays(tissue?: string): Promise<{
    probe_drugs: ProbeDrug[];
    probe_ids?: number[];
    selected_tissue?: string;
    total_probes: number;
  }> {
    const url = tissue ? `${API_BASE}/analytics/probe-assays?tissue=${encodeURIComponent(tissue)}` : `${API_BASE}/analytics/probe-assays`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch probe assay benchmarks');
    return res.json();
  },

  async getHeatmap(topN: number = 15): Promise<HeatmapData> {
    const res = await fetch(`${API_BASE}/analytics/heatmap?top_n_drugs=${topN}`);
    if (!res.ok) throw new Error('Failed to fetch heatmap data');
    return res.json();
  },

  // Reports
  async generateReport(sampleId: string, tissue?: string): Promise<ReportRecord> {
    const res = await fetch(`${API_BASE}/reports/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sample_id: sampleId, tissue }),
    });
    if (!res.ok) throw new Error('Failed to generate report');
    return res.json();
  },

  async getReportHistory(): Promise<ReportRecord[]> {
    const res = await fetch(`${API_BASE}/reports/history`);
    if (!res.ok) throw new Error('Failed to fetch report history');
    return res.json();
  },

  getDownloadUrl(filename: string): string {
    return `${API_BASE}/reports/download/${encodeURIComponent(filename)}`;
  }
};
