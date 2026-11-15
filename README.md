# OncoMatch — Personalized Chemotherapy Drug Response Prediction in Cancer Treatments

[![CI/CD Pipeline](https://github.com/oncomatch/oncomatch/actions/workflows/ci_cd.yml/badge.svg)](https://github.com/oncomatch/oncomatch)
[![Python 3.11](https://img.shields.io/badge/python-3.11-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.141.1-009688.svg)](https://fastapi.tiangolo.com)
[![React 18](https://img.shields.io/badge/React-18.3.1-61DAFB.svg)](https://react.dev/)
[![Scikit-Learn](https://img.shields.io/badge/scikit--learn-1.4.2-F7931E.svg)](https://scikit-learn.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 1. Executive Summary

**OncoMatch** is an end-to-end, scientifically responsible computational oncology platform for analyzing cancer molecular profiles and predicting sensitivity to chemotherapy and targeted anticancer therapeutics.

Built on the Sanger Institute **Genomics of Drug Sensitivity in Cancer (GDSC2)** dataset, OncoMatch pairs a leakage-safe gradient-boosted regression pipeline with an interactive pharmacogenomic visualization dashboard and personalized research report generator.

### Key Capabilities
- **Trained on 242,036 Experimental Curves:** Covers 969 cancer cell lines, 295 anticancer drugs, and 33 TCGA tissue origins.
- **Grouped Hold-Out Validation:** Evaluated on cell lines strictly unseen during training, achieving a **test MAE of 1.0270** (a >51% reduction over the baseline MAE of 2.108) and an **$R^2$ of 0.7585**.
- **L1000 Landmark Transcriptomics:** Preloaded with the 978 official LINCS landmark genes, outlier detection ($|z| > 3$), and log2 expression quality control.
- **Interactive Visual Analytics:** 2D PCA landscape across 963 cell lines x 295 drugs ($PC_1$ 38.45%, $PC_2$ 4.40%), cross-tissue drug sensitivity heatmaps, and 3-state Categorical HMM transition modeling.
- **Personalized Report Generation:** One-click vector PDF generation and CSV exports with full model metadata and research-use caveats.

---

## 2. Six Core Application Pages

| # | Page Name | Core Functionality |
|---|---|---|
| **1** | **Dashboard Overview** | Dataset overview (242,036 curves, 969 cell lines, 295 drugs, 33 tissues), model benchmark summary, quick navigation, and research disclaimer. |
| **2** | **Patient Profile & Upload** | Sample registration with strict categorization (Established cell line, Patient-derived cell line, Patient-derived organoid, Exploratory profile), drag-and-drop CSV/TSV expression upload, and L1000 validation. |
| **3** | **Molecular Profile** | 978 L1000 landmark gene expression table, search/filter by signaling pathway, expression density histogram, outlier analysis, and normalization context. |
| **4** | **Drug Response Prediction** | Single and batch chemotherapy predictions for any of 295 drugs. Reports predicted $\ln(\text{IC}_{50})$, micromolar $\text{IC}_{50}$, 80% holdout confidence intervals, and empirical tertile classification. |
| **5** | **Visual Analytics** | Interactive 2D PCA scatter plot with sample projection, top drug loadings ($PC_1$ & $PC_2$), 15-drug cross-tissue sensitivity heatmap, and 3-state Categorical HMM transition matrix. |
| **6** | **Personalized Reports** | Vector PDF report compiler, complete CSV data exports, session history archive, and timestamped reproducibility records. |

---

## 3. Machine Learning Architecture & Benchmark Results

### Data Source & Feature Engineering
- **Dataset:** Sanger Institute GDSC2 release (24-Jul-2022).
- **Target:** Natural log of half-maximal inhibitory concentration: $\ln(\text{IC}_{50})$.
- **Leakage Elimination:** In-vitro curve parameters derived from the target curve (e.g. `AUC`, `Z_SCORE`, `RMSE`) are strictly excluded as inputs.
- **Leakage-Safe Featurizer (`DrugResponseFeaturizer`):**
  - Ordinal encodings for `DRUG_ID`, `PUTATIVE_TARGET`, `PATHWAY_NAME`, and `TCGA_DESC`.
  - Log concentration scaling: $\log_{10}(\text{MAX\_CONC})$ and $\log_{10}(\text{MAX\_CONC} / \text{MIN\_CONC})$.
  - Empirical Bayes grouped out-of-fold target encodings ($k=10$ smoothing) on training splits; global priors on unseen inference.

### Benchmark Results (Independent Holdout on Unseen Cell Lines)

| Model | MAE | RMSE | $R^2$ | Notes |
|---|---|---|---|---|
| **Mean Baseline** | 2.108 | 2.761 | 0.000 | Predicts training mean $\ln(\text{IC}_{50})$ |
| **Linear Regression** | 1.123 | 1.662 | 0.641 | Leaky baseline in early notebook |
| **Random Forest Regressor** | 1.062 | 1.566 | 0.681 | 100 trees, depth 12 |
| **Voting Ensemble (RF+GB+HGB)** | 1.021 | 1.352 | 0.762 | Multimodel ensemble |
| **HistGradientBoosting (Tuned)** | **1.027** | **1.361** | **0.7585** | **Production Champion (Compact 222 KB)** |

---

## 4. Zero-Cost Technology Stack Comparison

To ensure perpetual free public accessibility without recurring charges or credit card requirements:

| Component | Selected Free Technology | Rationale & Free Tier Limits |
|---|---|---|
| **Frontend Framework** | React 18 + Vite + TypeScript + Tailwind | Zero runtime overhead, fast HMR, type-safe interfaces. |
| **Backend & ML Engine** | FastAPI + Scikit-Learn + Hmmlearn | High-performance async Python 3.11 with sub-10ms inference. |
| **Container & Hosting** | Hugging Face Spaces / Render | **Hugging Face Spaces:** 16 GB RAM, 2 vCPU, 50 GB storage, free HTTPS, persistent URL, zero credit card requirement. |
| **Frontend Delivery** | Cloudflare Pages / Static Mount | Unlimited bandwidth, global CDN, 0ms cold start. |
| **Database & State** | In-Memory + Session File Store + IndexedDB | Zero external database dependency, zero latency, 100% privacy for patient records. |

---

## 5. Quick Start & Local Execution

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm

### 1. Install Backend Dependencies
```bash
pip install -r requirements.txt
```

### 2. Build Frontend Static Assets
```bash
cd frontend
npm install
npm run build
cd ..
```

### 3. Run Automated Tests
```bash
pytest tests/ -v
```
*Expected: 18 passing tests covering ML properties, inference determinism, batch integrity, API endpoints, PCA, HMM, and report generation.*

### 4. Start Unified Application
```bash
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```
Navigate to `http://localhost:8000` in your web browser. The backend automatically serves the compiled React application on `/` and API routes on `/api/*`.

---

## 6. Public HTTPS Deployment Guide

### Deploying to Hugging Face Spaces (Recommended: 16 GB Free RAM)
1. Create a free account at [Hugging Face](https://huggingface.co).
2. Create a new Space:
   - Select **Docker** SDK (Blank).
   - Space Hardware: Free (2 vCPU, 16 GB RAM).
3. Push this repository to your Space:
   ```bash
   git remote add space https://huggingface.co/spaces/<YOUR_USERNAME>/oncomatch
   git push space main
   ```
4. Hugging Face automatically executes the multi-stage `Dockerfile`, runs test verification, and serves the application with a permanent public HTTPS URL.

---

## 7. Scientific Validation & Bioethical Disclaimers

> [!WARNING]
> **Research Use Only:** OncoMatch is developed strictly as a translational bioinformatics exploration system. Predictions are based on in-vitro cell line dose-response curves (GDSC2) and do not reflect in-vivo tumor microenvironments, vascular perfusion, immune interactions, or clinical pharmacokinetics. Never use predictions from this system to direct patient therapy, modify prescribed treatments, or make medical diagnoses.
