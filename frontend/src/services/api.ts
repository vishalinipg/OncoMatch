import { 
  Drug, 
  ModelInfo, 
  Sample, 
  SinglePredictionResult, 
  BatchPredictionItem, 
  PCALandscape, 
  HMMData, 
  HeatmapData, 
  ReportRecord 
} from '../types';

const API_BASE = '/api';

export const api = {
  // Model info
  async getModelInfo(): Promise<ModelInfo> {
    const res = await fetch(`${API_BASE}/model/info`);
    if (!res.ok) throw new Error('Failed to fetch model info');
    return res.json();
  },

  // Drugs
  async getDrugs(search?: string): Promise<Drug[]> {
    const url = search ? `${API_BASE}/drugs?search=${encodeURIComponent(search)}` : `${API_BASE}/drugs`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch drugs');
    return res.json();
  },

  // Tissues
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
  async predictAllDrugs(tissue: string): Promise<{ tissue: string; total_drugs: number; predictions: BatchPredictionItem[] }> {
    const res = await fetch(`${API_BASE}/predict/all`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tissue }),
    });
    if (!res.ok) throw new Error('Failed to run batch prediction');
    return res.json();
  },

  // Samples
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

  async uploadExpressionFile(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/samples/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'File upload validation failed' }));
      throw new Error(err.detail || 'File upload failed');
    }
    return res.json();
  },

  async getL1000Genes(): Promise<Array<{ symbol: string; entrez_id: string; pathway: string }>> {
    const res = await fetch(`${API_BASE}/l1000/genes`);
    if (!res.ok) throw new Error('Failed to fetch L1000 genes');
    return res.json();
  },

  // Analytics
  async getPCA(sampleId?: string): Promise<PCALandscape> {
    const url = sampleId ? `${API_BASE}/analytics/pca?sample_id=${encodeURIComponent(sampleId)}` : `${API_BASE}/analytics/pca`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch PCA data');
    return res.json();
  },

  async getHMM(): Promise<HMMData> {
    const res = await fetch(`${API_BASE}/analytics/hmm`);
    if (!res.ok) throw new Error('Failed to fetch HMM data');
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
