export interface Drug {
  DRUG_ID: number;
  DRUG_NAME: string;
  PUTATIVE_TARGET: string;
  PATHWAY_NAME: string;
  MIN_CONC: number;
  MAX_CONC: number;
}

export interface ModelInfo {
  model_card: {
    name: string;
    model: string;
    target: string;
    intended_use: string;
    not_for: string;
    data: {
      source: string;
      rows: number;
      cell_lines: number;
      drug_names: number;
      tissue_labels: number;
    };
    evaluation: {
      method: string;
      train_rows: number;
      test_rows: number;
      train_cell_lines: number;
      test_cell_lines: number;
      test_metrics: {
        MAE: number;
        RMSE: number;
        R2: number;
      };
      mean_baseline_test_MAE: number;
    };
    limitations: string[];
    best_params: Record<string, any>;
  };
  metrics: {
    mean_baseline_test_MAE: number;
    tuned_histgb_holdout: {
      MAE: number;
      RMSE: number;
      R2: number;
    };
    train_rows: number;
    test_rows: number;
    train_cell_lines: number;
    test_cell_lines: number;
    classification_view_threshold: number;
  };
  meta: {
    tissues: string[];
    train_median_ln_ic50: number;
    training_rows: number;
    training_cell_lines: number;
    total_drugs: number;
    drug_names_count: number;
  };
  training_rows: number;
  training_cell_lines: number;
  total_drugs: number;
  total_tissues: number;
  median_threshold: number;
}

export interface SampleQuality {
  total_genes_measured: number;
  l1000_landmark_matched: number;
  l1000_coverage_percent: number;
  mean_expression: number;
  std_expression: number;
  min_expression: number;
  max_expression: number;
  outlier_count: number;
  missing_l1000_count: number;
}

export interface Sample {
  sample_id: string;
  name: string;
  sample_type: string;
  cancer_type: string;
  cancer_subtype?: string;
  tcga_desc: string;
  description?: string;
  research_project_id?: string;
  gene_count?: number;
  quality?: SampleQuality;
  warnings?: string[];
  expression?: Record<string, number>;
}

export interface SinglePredictionResult {
  drug_id: number;
  drug_name: string;
  putative_target: string;
  pathway_name: string;
  tissue: string;
  min_conc_uM: number;
  max_conc_uM: number;
  predicted_ln_ic50: number;
  predicted_ic50_uM: number;
  confidence_band_80pct: [number, number];
  ic50_band_80pct_uM: [number, number];
  sensitivity: {
    category: 'Sensitive' | 'Intermediate' | 'Resistant';
    badge: string;
    description: string;
    relative_to_median: string;
  };
  model_version: string;
}

export interface BatchPredictionItem {
  drug_id: number;
  drug_name: string;
  putative_target: string;
  pathway_name: string;
  tissue: string;
  predicted_ln_ic50: number;
  predicted_ic50_uM: number;
  sensitivity_category: string;
  badge: string;
  rank: number;
}

export interface PCALandscape {
  total_cell_lines: number;
  total_drugs: number;
  explained_variance_ratio: number[];
  pc1_variance: number;
  pc2_variance: number;
  samples: Array<{
    sample_id: string;
    name: string;
    tcga_desc: string;
    sample_type: string;
    pc1: number;
    pc2: number;
    pc3: number;
  }>;
  top_pc1_drugs: Array<{
    drug_id: number;
    drug_name: string;
    pathway: string;
    loading: number;
  }>;
  top_pc2_drugs: Array<{
    drug_id: number;
    drug_name: string;
    pathway: string;
    loading: number;
  }>;
  tissues: string[];
  current_sample_projection?: {
    sample_id: string;
    name: string;
    sample_type: string;
    tcga_desc: string;
    pc1: number;
    pc2: number;
    status: string;
  };
}

export interface HMMData {
  model_type: string;
  tertile_1_boundary: number;
  tertile_2_boundary: number;
  converged: boolean;
  iterations: number;
  log_likelihood: number;
  startprob: number[];
  transition_matrix: number[][];
  emission_matrix: number[][];
  hidden_state_counts: Record<string, number>;
  scientific_limitation: string;
}

export interface HeatmapData {
  tissues: string[];
  drugs: string[];
  matrix: Array<{
    tissue: string;
    scores: Record<string, number>;
  }>;
}

export interface ReportRecord {
  report_id: string;
  sample_id: string;
  sample_name: string;
  sample_type: string;
  tissue: string;
  timestamp: string;
  total_drugs_predicted: number;
  top_sensitive_drug: string;
  pdf_file: string;
  csv_file: string;
}
