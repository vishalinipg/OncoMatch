import os
import sys
import json
import logging
from pathlib import Path
from typing import Dict, List, Any, Optional
import numpy as np
import pandas as pd
import joblib

# Ensure current and parent directories are in python path for imports
current_dir = Path(__file__).resolve().parent
backend_dir = current_dir.parent
root_dir = backend_dir.parent

sys.path.insert(0, str(backend_dir))
sys.path.insert(0, str(root_dir / "ml"))
sys.path.insert(0, str(root_dir))

from oncomatch_features import DrugResponseFeaturizer

logger = logging.getLogger("oncomatch.ml")

class MLService:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(MLService, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self, artifacts_dir: Optional[str] = None):
        if self._initialized:
            return

        if artifacts_dir:
            self.artifacts_path = Path(artifacts_dir)
        else:
            cand1 = root_dir / "ml" / "artifacts"
            cand2 = root_dir / "oncomatch_artifacts"
            self.artifacts_path = cand1 if cand1.exists() else cand2

        logger.info(f"Initializing MLService with artifacts from {self.artifacts_path}")
        self._load_artifacts()
        self._initialized = True

    def _load_artifacts(self):
        # 1. Load model bundle
        bundle_file = self.artifacts_path / "oncomatch_pbl3_bundle.joblib"
        if not bundle_file.exists():
            raise FileNotFoundError(f"Model bundle not found at {bundle_file}")
        self.bundle = joblib.load(bundle_file)
        self.model = self.bundle["model"]
        self.featurizer = self.bundle["featurizer"]
        self.feature_columns = self.bundle["feature_columns"]

        # 2. Load drug catalog and sanitize NaNs for JSON compliance
        cat_file = self.artifacts_path / "drug_catalog.csv"
        self.drug_catalog = pd.read_csv(cat_file)
        self.drug_catalog["PUTATIVE_TARGET"] = self.drug_catalog["PUTATIVE_TARGET"].fillna("Unspecified")
        self.drug_catalog["PATHWAY_NAME"] = self.drug_catalog["PATHWAY_NAME"].fillna("Unclassified")
        
        # Clean drug catalog dicts
        self.drug_list = []
        for r in self.drug_catalog.to_dict(orient="records"):
            clean_r = {}
            for k, v in r.items():
                if isinstance(v, float) and (np.isnan(v) or np.isinf(v)):
                    clean_r[k] = None
                else:
                    clean_r[k] = v
            self.drug_list.append(clean_r)

        self.drug_by_id = {int(r["DRUG_ID"]): r for r in self.drug_list}
        self.drug_by_name = {str(r["DRUG_NAME"]).strip().lower(): r for r in self.drug_list}

        # 3. Load metadata and metrics
        with open(self.artifacts_path / "meta.json", "r", encoding="utf-8") as f:
            self.meta = json.load(f)
        with open(self.artifacts_path / "metrics.json", "r", encoding="utf-8") as f:
            self.metrics = json.load(f)
        with open(self.artifacts_path / "model_card.json", "r", encoding="utf-8") as f:
            self.model_card = json.load(f)

        # 4. Load PCA landscape
        pca_file = self.artifacts_path / "pca_landscape.json"
        if pca_file.exists():
            with open(pca_file, "r", encoding="utf-8") as f:
                self.pca_data = json.load(f)
        else:
            self.pca_data = {}

        # 5. Load HMM metadata and matrices
        hmm_file = self.artifacts_path / "hmm_meta.json"
        if hmm_file.exists():
            with open(hmm_file, "r", encoding="utf-8") as f:
                self.hmm_meta = json.load(f)
        else:
            self.hmm_meta = {}

        # 6. Load L1000 genes reference
        l1000_file = self.artifacts_path / "l1000_genes.json"
        if l1000_file.exists():
            with open(l1000_file, "r", encoding="utf-8") as f:
                self.l1000_genes = json.load(f)
            self.l1000_symbols = {g["symbol"]: g for g in self.l1000_genes}
        else:
            self.l1000_genes = []
            self.l1000_symbols = {}

        self.tissues = self.meta["tissues"]
        self.median_threshold = self.meta["train_median_ln_ic50"]

    def get_model_info(self) -> Dict[str, Any]:
        return {
            "model_card": self.model_card,
            "metrics": self.metrics,
            "meta": self.meta,
            "feature_columns": self.feature_columns,
            "training_rows": self.bundle.get("training_rows", 242036),
            "training_cell_lines": self.bundle.get("training_cell_lines", 969),
            "total_drugs": len(self.drug_catalog),
            "total_tissues": len(self.tissues),
            "median_threshold": self.median_threshold
        }

    def get_drug_catalog(self) -> List[Dict[str, Any]]:
        return self.drug_list

    def get_tissues(self) -> List[str]:
        return self.tissues

    def get_l1000_reference(self) -> List[Dict[str, Any]]:
        return self.l1000_genes

    def classify_sensitivity(self, ln_ic50: float) -> Dict[str, Any]:
        """
        Scientifically justified categorization based on GDSC2 distribution:
        - Sensitive: ln(IC50) < 2.19 (lower tertile of GDSC2 fitted curves)
        - Intermediate: 2.19 <= ln(IC50) <= 4.22 (middle tertile)
        - Resistant: ln(IC50) > 4.22 (upper tertile)
        Also provides distance to training median (3.255).
        """
        q1 = 2.1929
        q2 = 4.2193
        if ln_ic50 < q1:
            cat = "Sensitive"
            badge = "high-sensitivity"
            desc = "Predicted ln(IC50) is in the lower tertile of GDSC2 screens (potent response)."
        elif ln_ic50 <= q2:
            cat = "Intermediate"
            badge = "intermediate-sensitivity"
            desc = "Predicted ln(IC50) is in the middle tertile of GDSC2 screens (moderate response)."
        else:
            cat = "Resistant"
            badge = "resistant"
            desc = "Predicted ln(IC50) is in the upper tertile of GDSC2 screens (low sensitivity / resistant)."

        rel_to_median = "Below median (more sensitive than typical GDSC2 curve)" if ln_ic50 < self.median_threshold else "Above median (less sensitive than typical GDSC2 curve)"
        return {
            "category": cat,
            "badge": badge,
            "description": desc,
            "relative_to_median": rel_to_median
        }

    def predict_single(self, 
                       drug_id: Optional[int] = None, 
                       drug_name: Optional[str] = None, 
                       tissue: str = "PANCAN",
                       min_conc: Optional[float] = None,
                       max_conc: Optional[float] = None) -> Dict[str, Any]:
        # Validate tissue
        if tissue not in self.tissues:
            tissue = "UNKNOWN"

        # Resolve drug
        drug_entry = None
        if drug_id is not None and drug_id in self.drug_by_id:
            drug_entry = self.drug_by_id[drug_id]
        elif drug_name is not None:
            clean_name = str(drug_name).strip().lower()
            if clean_name in self.drug_by_name:
                drug_entry = self.drug_by_name[clean_name]

        if not drug_entry:
            raise ValueError(f"Drug '{drug_id or drug_name}' not found in GDSC2 catalog.")

        final_min = float(min_conc) if min_conc is not None else float(drug_entry["MIN_CONC"])
        final_max = float(max_conc) if max_conc is not None else float(drug_entry["MAX_CONC"])

        if final_min <= 0 or final_max <= 0:
            raise ValueError("Concentrations must be positive numbers.")
        if final_min > final_max:
            raise ValueError("MIN_CONC cannot exceed MAX_CONC.")

        row_df = pd.DataFrame([{
            "DRUG_ID": int(drug_entry["DRUG_ID"]),
            "PUTATIVE_TARGET": str(drug_entry["PUTATIVE_TARGET"]),
            "PATHWAY_NAME": str(drug_entry["PATHWAY_NAME"]),
            "TCGA_DESC": tissue,
            "MIN_CONC": final_min,
            "MAX_CONC": final_max
        }])

        X = self.featurizer.transform(row_df)
        pred_ln = float(self.model.predict(X)[0])
        pred_ic50 = float(np.exp(pred_ln))

        # 80% holdout residual band from model card: [-1.43, 1.48]
        res_low = pred_ln - 1.43
        res_high = pred_ln + 1.48

        sens_info = self.classify_sensitivity(pred_ln)

        return {
            "drug_id": int(drug_entry["DRUG_ID"]),
            "drug_name": str(drug_entry["DRUG_NAME"]),
            "putative_target": str(drug_entry["PUTATIVE_TARGET"]),
            "pathway_name": str(drug_entry["PATHWAY_NAME"]),
            "tissue": tissue,
            "min_conc_uM": final_min,
            "max_conc_uM": final_max,
            "predicted_ln_ic50": round(pred_ln, 4),
            "predicted_ic50_uM": round(pred_ic50, 4),
            "confidence_band_80pct": [round(res_low, 3), round(res_high, 3)],
            "ic50_band_80pct_uM": [round(float(np.exp(res_low)), 4), round(float(np.exp(res_high)), 4)],
            "sensitivity": sens_info,
            "model_version": "HistGradientBoosting-GDSC2-v1.0"
        }

    def predict_all_drugs(self, tissue: str = "PANCAN") -> List[Dict[str, Any]]:
        """
        Batch prediction for all 295 drugs in GDSC2 catalog for a given tissue.
        Returns ranked list ordered from highest sensitivity (lowest ln IC50) to lowest.
        """
        if tissue not in self.tissues:
            tissue = "UNKNOWN"

        rows = []
        for d in self.drug_list:
            rows.append({
                "DRUG_ID": int(d["DRUG_ID"]),
                "PUTATIVE_TARGET": str(d["PUTATIVE_TARGET"]),
                "PATHWAY_NAME": str(d["PATHWAY_NAME"]),
                "TCGA_DESC": tissue,
                "MIN_CONC": float(d["MIN_CONC"]),
                "MAX_CONC": float(d["MAX_CONC"])
            })

        df_batch = pd.DataFrame(rows)
        X = self.featurizer.transform(df_batch)
        preds = self.model.predict(X)

        results = []
        for idx, pred_val in enumerate(preds):
            pred_ln = float(pred_val)
            pred_ic50 = float(np.exp(pred_ln))
            drug = self.drug_list[idx]
            sens = self.classify_sensitivity(pred_ln)
            results.append({
                "drug_id": int(drug["DRUG_ID"]),
                "drug_name": str(drug["DRUG_NAME"]),
                "putative_target": str(drug["PUTATIVE_TARGET"]),
                "pathway_name": str(drug["PATHWAY_NAME"]),
                "tissue": tissue,
                "predicted_ln_ic50": round(pred_ln, 4),
                "predicted_ic50_uM": round(pred_ic50, 4),
                "sensitivity_category": sens["category"],
                "badge": sens["badge"],
            })

        # Rank by predicted_ln_ic50 ascending (lower ln_ic50 = higher sensitivity)
        results.sort(key=lambda x: x["predicted_ln_ic50"])
        for rank, item in enumerate(results, start=1):
            item["rank"] = rank

        return results

    def get_pca_landscape(self) -> Dict[str, Any]:
        return self.pca_data

    def get_hmm_data(self) -> Dict[str, Any]:
        return self.hmm_meta
