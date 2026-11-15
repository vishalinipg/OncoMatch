import os
import io
import json
import logging
import uuid
from typing import Dict, List, Any, Optional
import numpy as np
import pandas as pd
from pathlib import Path
from .ml_service import MLService

logger = logging.getLogger("oncomatch.samples")

class SampleService:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(SampleService, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return

        self.ml_service = MLService()
        self.samples: Dict[str, Dict[str, Any]] = {}
        self._load_demo_samples()
        self._initialized = True

    def _load_demo_samples(self):
        artifacts_path = self.ml_service.artifacts_path
        demo_file = artifacts_path / "demo_samples.json"
        if demo_file.exists():
            with open(demo_file, "r", encoding="utf-8") as f:
                demo_data = json.load(f)
            for key, sample in demo_data.items():
                sid = sample["sample_id"]
                # Calculate quality metrics
                self.samples[sid] = self._enrich_sample_metadata(sample)
            logger.info(f"Loaded {len(self.samples)} demo samples.")

    def _enrich_sample_metadata(self, sample: Dict[str, Any]) -> Dict[str, Any]:
        expr = sample.get("expression", {})
        l1000_ref = self.ml_service.l1000_symbols
        total_l1000 = len(l1000_ref) if l1000_ref else 978

        matched_genes = [g for g in expr.keys() if g in l1000_ref]
        values = [float(v) for v in expr.values() if np.isfinite(v)]
        
        arr = np.array(values) if values else np.array([0.0])
        mean_val = float(np.mean(arr))
        std_val = float(np.std(arr)) if len(arr) > 1 else 1.0
        
        # Outlier count (|z| > 3)
        outliers = int(np.sum(np.abs((arr - mean_val) / (std_val if std_val > 0 else 1.0)) > 3))

        stype = sample.get("sample_type", "Established cancer cell line")
        warnings = []
        if "patient-derived" in stype.lower() and "organoid" in stype.lower():
            warnings.append("Patient-derived organoid model: 3D drug diffusion, matrix interactions, and microenvironment differ from 2D GDSC2 monolayers. Treat predictions as exploratory.")
        elif "patient-derived" in stype.lower():
            warnings.append("Patient-derived cell line: Model generalization from established cell lines has not been clinically validated. Results are for research exploration only.")
        elif stype.lower() == "other molecular profile":
            warnings.append("Exploratory profile mode: Non-standard sample type. Strict feature mapping applied.")

        coverage_pct = round((len(matched_genes) / total_l1000) * 100, 1) if total_l1000 else 100.0

        sample_record = dict(sample)
        sample_record["quality"] = {
            "total_genes_measured": len(expr),
            "l1000_landmark_matched": len(matched_genes),
            "l1000_coverage_percent": coverage_pct,
            "mean_expression": round(mean_val, 3),
            "std_expression": round(std_val, 3),
            "min_expression": round(float(np.min(arr)), 3) if len(arr) else 0.0,
            "max_expression": round(float(np.max(arr)), 3) if len(arr) else 0.0,
            "outlier_count": outliers,
            "missing_l1000_count": max(0, total_l1000 - len(matched_genes))
        }
        sample_record["warnings"] = warnings
        return sample_record

    def list_samples(self) -> List[Dict[str, Any]]:
        # Return samples without the heavy full expression dict for fast list rendering
        out = []
        for s in self.samples.values():
            item = {k: v for k, v in s.items() if k != "expression"}
            item["gene_count"] = len(s.get("expression", {}))
            out.append(item)
        return out

    def get_sample(self, sample_id: str) -> Optional[Dict[str, Any]]:
        return self.samples.get(sample_id)

    def parse_and_validate_file(self, content_str: str, filename: str) -> Dict[str, Any]:
        """
        Parses CSV or TSV molecular expression file.
        Accepts formats:
        - Two columns: Gene, Expression (or Symbol, Value)
        - Matrix format: Gene / Symbol as index or first column
        """
        delimiter = "\t" if filename.lower().endswith((".tsv", ".tab")) or "\t" in content_str[:500] else ","
        df = pd.read_csv(io.StringIO(content_str), sep=delimiter)

        if df.shape[1] < 2:
            raise ValueError("Uploaded file must have at least two columns (Gene Symbol and Expression Value).")

        # Try to locate gene symbol column
        col0 = df.columns[0]
        col1 = df.columns[1]

        # Check if first column has strings like TP53
        gene_col = col0
        val_col = col1

        for c in df.columns:
            if any(k in str(c).lower() for k in ["gene", "symbol", "feature", "id"]):
                gene_col = c
                break
        
        numeric_cols = [c for c in df.columns if c != gene_col and pd.to_numeric(df[c], errors="coerce").notna().sum() > len(df) * 0.5]
        if not numeric_cols:
            raise ValueError("Could not find a valid numeric expression column in uploaded file.")
        val_col = numeric_cols[0]

        expr_dict = {}
        for _, row in df.iterrows():
            sym = str(row[gene_col]).strip().upper()
            val = pd.to_numeric(row[val_col], errors="coerce")
            if sym and pd.notna(val) and np.isfinite(val):
                expr_dict[sym] = round(float(val), 4)

        if not expr_dict:
            raise ValueError("No valid numeric expression values could be extracted.")

        l1000_ref = self.ml_service.l1000_symbols
        total_l1000 = len(l1000_ref) if l1000_ref else 978
        matched = [g for g in expr_dict.keys() if g in l1000_ref]

        return {
            "total_rows_parsed": len(df),
            "valid_genes_extracted": len(expr_dict),
            "l1000_matched": len(matched),
            "l1000_coverage_percent": round((len(matched) / total_l1000) * 100, 1),
            "sample_genes_preview": list(expr_dict.items())[:10],
            "expression_dict": expr_dict
        }

    def create_sample(self, data: Dict[str, Any]) -> Dict[str, Any]:
        sid = data.get("sample_id", "").strip() or f"SAMPLE-{uuid.uuid4().hex[:8].upper()}"
        if sid in self.samples:
            # Append suffix if duplicate
            sid = f"{sid}-{uuid.uuid4().hex[:4].upper()}"

        raw_sample = {
            "sample_id": sid,
            "name": data.get("name", sid),
            "sample_type": data.get("sample_type", "Established cancer cell line"),
            "cancer_type": data.get("cancer_type", "Unknown Cancer"),
            "cancer_subtype": data.get("cancer_subtype", "Unspecified"),
            "tcga_desc": data.get("tcga_desc", "PANCAN"),
            "description": data.get("description", ""),
            "research_project_id": data.get("research_project_id", "PROJ-ONCO-01"),
            "expression": data.get("expression", {})
        }

        enriched = self._enrich_sample_metadata(raw_sample)
        self.samples[sid] = enriched
        return enriched

    def delete_sample(self, sample_id: str) -> bool:
        if sample_id in self.samples:
            del self.samples[sample_id]
            return True
        return False
