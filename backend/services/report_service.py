import os
import io
import json
import logging
import uuid
import datetime
from pathlib import Path
from typing import Dict, List, Any, Optional
import pymupdf
import pandas as pd
from .ml_service import MLService
from .sample_service import SampleService

logger = logging.getLogger("oncomatch.reports")

class ReportService:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(ReportService, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self, output_dir: Optional[str] = None):
        if self._initialized:
            return

        self.ml_service = MLService()
        self.sample_service = SampleService()
        
        backend_dir = Path(__file__).resolve().parent.parent
        self.reports_dir = Path(output_dir) if output_dir else backend_dir / "generated_reports"
        self.reports_dir.mkdir(parents=True, exist_ok=True)

        self.history_file = self.reports_dir / "reports_history.json"
        self.history: List[Dict[str, Any]] = []
        self._load_history()
        self._initialized = True

    def _load_history(self):
        if self.history_file.exists():
            try:
                with open(self.history_file, "r", encoding="utf-8") as f:
                    self.history = json.load(f)
            except Exception as e:
                logger.error(f"Error reading history: {e}")
                self.history = []

    def _save_history(self):
        try:
            with open(self.history_file, "w", encoding="utf-8") as f:
                json.dump(self.history, f, indent=2)
        except Exception as e:
            logger.error(f"Error saving history: {e}")

    def list_reports(self) -> List[Dict[str, Any]]:
        return sorted(self.history, key=lambda x: x.get("timestamp", ""), reverse=True)

    def generate_pdf_report(self, sample_id: str, tissue: Optional[str] = None) -> Dict[str, Any]:
        sample = self.sample_service.get_sample(sample_id)
        if not sample:
            raise ValueError(f"Sample '{sample_id}' not found.")

        target_tissue = tissue or sample.get("tcga_desc", "PANCAN")
        if target_tissue not in self.ml_service.tissues:
            target_tissue = "UNKNOWN"

        # Run predictions across all drugs
        all_preds = self.ml_service.predict_all_drugs(target_tissue)
        top_sensitive = all_preds[:8]
        top_resistant = all_preds[-5:]

        report_id = f"REP-{uuid.uuid4().hex[:8].upper()}"
        now_str = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")

        pdf_filename = f"{report_id}_{sample_id}.pdf"
        pdf_path = self.reports_dir / pdf_filename

        # Generate PDF with pymupdf
        doc = pymupdf.open()
        page = doc.new_page(width=595, height=842) # A4 size

        # Colors
        c_primary = pymupdf.utils.getColor("navy")
        c_dark = (0.1, 0.15, 0.2)
        c_gray = (0.4, 0.45, 0.5)
        c_teal = (0.05, 0.5, 0.55)
        c_red = (0.75, 0.15, 0.15)
        c_light = (0.95, 0.96, 0.98)

        # Header Box
        page.draw_rect(pymupdf.Rect(40, 35, 555, 95), color=None, fill=c_light)
        page.insert_text(pymupdf.Point(55, 60), "ONCOMATCH — COMPREHENSIVE ONCOLOGY REPORT", fontsize=15, fontname="helv", color=c_primary)
        page.insert_text(pymupdf.Point(55, 78), "Personalized Chemotherapy Drug Response Prediction Platform | Research Release", fontsize=9, fontname="helv", color=c_gray)
        page.insert_text(pymupdf.Point(55, 90), f"Report ID: {report_id}   |   Generated: {now_str}", fontsize=8, fontname="helv", color=c_gray)

        y = 120

        # Section 1: Sample & Molecular Profile Summary
        page.insert_text(pymupdf.Point(40, y), "1. SAMPLE & MOLECULAR PROFILE SUMMARY", fontsize=11, fontname="helv", color=c_primary)
        y += 18
        page.draw_line(pymupdf.Point(40, y - 6), pymupdf.Point(555, y - 6), color=c_teal, width=1.5)

        sample_lines = [
            f"Sample ID: {sample.get('sample_id')}     Name: {sample.get('name')}",
            f"Sample Category: {sample.get('sample_type')}     TCGA Tissue Origin: {target_tissue}",
            f"Cancer Subtype: {sample.get('cancer_subtype', 'N/A')}     Project ID: {sample.get('research_project_id', 'N/A')}",
        ]
        q = sample.get("quality", {})
        quality_lines = [
            f"L1000 Landmark Genes Matched: {q.get('l1000_landmark_matched', 0)} / 978 ({q.get('l1000_coverage_percent', 0)}%)",
            f"Mean Expression: {q.get('mean_expression', 0)} | Std: {q.get('std_expression', 0)} | Outliers (|z|>3): {q.get('outlier_count', 0)}"
        ]

        for line in sample_lines:
            page.insert_text(pymupdf.Point(45, y), line, fontsize=9, fontname="helv", color=c_dark)
            y += 14

        y += 4
        for line in quality_lines:
            page.insert_text(pymupdf.Point(45, y), line, fontsize=8.5, fontname="helv", color=c_teal)
            y += 13

        # Warnings if patient derived
        warnings = sample.get("warnings", [])
        if warnings:
            y += 4
            for w in warnings:
                page.insert_text(pymupdf.Point(45, y), f"WARNING: {w}", fontsize=8, fontname="helv", color=c_red)
                y += 12

        y += 12
        # Section 2: Machine Learning Model Summary
        page.insert_text(pymupdf.Point(40, y), "2. MACHINE LEARNING ARCHITECTURE & BENCHMARK", fontsize=11, fontname="helv", color=c_primary)
        y += 18
        page.draw_line(pymupdf.Point(40, y - 6), pymupdf.Point(555, y - 6), color=c_teal, width=1.5)

        m_info = [
            "Model: HistGradientBoostingRegressor (tuned) refitted on 242,036 GDSC2 fitted dose-response curves.",
            "Features: Ordinal categories + log-concentrations + grouped out-of-fold target encodings.",
            "Holdout Metrics (GroupShuffleSplit on unseen cell lines): Test MAE 1.0270 | RMSE 1.3612 | R2 0.7585 (Mean Baseline MAE 2.108).",
            "Sensitivity Thresholds: Sensitive (ln IC50 < 2.19), Intermediate (2.19 - 4.22), Resistant (> 4.22). Median: 3.255."
        ]
        for line in m_info:
            page.insert_text(pymupdf.Point(45, y), line, fontsize=8.5, fontname="helv", color=c_dark)
            y += 13

        y += 12
        # Section 3: Predicted High-Sensitivity Drugs
        page.insert_text(pymupdf.Point(40, y), "3. TOP PREDICTED SENSITIVE CHEMOTHERAPY DRUGS (Ranked by ln(IC50))", fontsize=11, fontname="helv", color=c_primary)
        y += 18
        page.draw_line(pymupdf.Point(40, y - 6), pymupdf.Point(555, y - 6), color=c_teal, width=1.5)

        # Table header
        page.draw_rect(pymupdf.Rect(40, y - 4, 555, y + 14), color=None, fill=c_light)
        page.insert_text(pymupdf.Point(45, y + 8), "Rank", fontsize=8, fontname="helv", color=c_primary)
        page.insert_text(pymupdf.Point(75, y + 8), "Drug Name", fontsize=8, fontname="helv", color=c_primary)
        page.insert_text(pymupdf.Point(195, y + 8), "Putative Target", fontsize=8, fontname="helv", color=c_primary)
        page.insert_text(pymupdf.Point(325, y + 8), "Target Pathway", fontsize=8, fontname="helv", color=c_primary)
        page.insert_text(pymupdf.Point(440, y + 8), "Pred ln(IC50)", fontsize=8, fontname="helv", color=c_primary)
        page.insert_text(pymupdf.Point(505, y + 8), "Classification", fontsize=8, fontname="helv", color=c_primary)
        y += 20

        for drug in top_sensitive:
            page.insert_text(pymupdf.Point(45, y), f"#{drug['rank']}", fontsize=8, fontname="helv", color=c_dark)
            page.insert_text(pymupdf.Point(75, y), str(drug['drug_name'])[:22], fontsize=8, fontname="helv", color=c_dark)
            page.insert_text(pymupdf.Point(195, y), str(drug['putative_target'])[:22], fontsize=8, fontname="helv", color=c_gray)
            page.insert_text(pymupdf.Point(325, y), str(drug['pathway_name'])[:20], fontsize=8, fontname="helv", color=c_gray)
            page.insert_text(pymupdf.Point(440, y), f"{drug['predicted_ln_ic50']:.3f}", fontsize=8, fontname="helv", color=c_dark)
            page.insert_text(pymupdf.Point(505, y), drug['sensitivity_category'], fontsize=8, fontname="helv", color=c_teal)
            y += 15

        y += 10
        # Section 4: Predicted Resistant Drugs Preview
        page.insert_text(pymupdf.Point(40, y), "4. PREDICTED RESISTANT / LOW-SENSITIVITY DRUGS (Highest ln(IC50))", fontsize=11, fontname="helv", color=c_primary)
        y += 18
        page.draw_line(pymupdf.Point(40, y - 6), pymupdf.Point(555, y - 6), color=c_teal, width=1.5)

        for drug in top_resistant:
            page.insert_text(pymupdf.Point(45, y), f"#{drug['rank']}", fontsize=8, fontname="helv", color=c_dark)
            page.insert_text(pymupdf.Point(75, y), str(drug['drug_name'])[:22], fontsize=8, fontname="helv", color=c_dark)
            page.insert_text(pymupdf.Point(195, y), str(drug['putative_target'])[:22], fontsize=8, fontname="helv", color=c_gray)
            page.insert_text(pymupdf.Point(325, y), str(drug['pathway_name'])[:20], fontsize=8, fontname="helv", color=c_gray)
            page.insert_text(pymupdf.Point(440, y), f"{drug['predicted_ln_ic50']:.3f}", fontsize=8, fontname="helv", color=c_dark)
            page.insert_text(pymupdf.Point(505, y), drug['sensitivity_category'], fontsize=8, fontname="helv", color=c_red)
            y += 15

        y += 18
        # Section 5: Mandatory Research Disclaimer & Limitations
        page.draw_rect(pymupdf.Rect(40, y, 555, y + 80), color=c_red, fill=c_light, width=0.8)
        page.insert_text(pymupdf.Point(48, y + 16), "SCIENTIFIC VALIDATION & REGULATORY DISCLAIMER:", fontsize=8.5, fontname="helv", color=c_red)
        disclaimer_text = (
            "OncoMatch is an experimental computational oncology research platform developed for bioinformatics exploration.\n"
            "All predictions are based on in-vitro cancer cell-line dose-response assays from GDSC2 and do not constitute\n"
            "clinical treatment recommendations, medical diagnoses, or efficacy guarantees. Patient-derived models require\n"
            "independent prospective validation before clinical consideration. Never alter patient therapy based on this report."
        )
        dy = y + 28
        for tline in disclaimer_text.split("\n"):
            page.insert_text(pymupdf.Point(48, dy), tline, fontsize=7.5, fontname="helv", color=c_dark)
            dy += 11

        doc.save(pdf_path)
        doc.close()

        # CSV Export
        csv_filename = f"{report_id}_{sample_id}.csv"
        csv_path = self.reports_dir / csv_filename
        pd.DataFrame(all_preds).to_csv(csv_path, index=False)

        record = {
            "report_id": report_id,
            "sample_id": sample_id,
            "sample_name": sample.get("name"),
            "sample_type": sample.get("sample_type"),
            "tissue": target_tissue,
            "timestamp": now_str,
            "total_drugs_predicted": len(all_preds),
            "top_sensitive_drug": top_sensitive[0]["drug_name"] if top_sensitive else "N/A",
            "pdf_file": pdf_filename,
            "csv_file": csv_filename
        }
        self.history.append(record)
        self._save_history()

        return record

    def get_report_file_path(self, filename: str) -> Optional[Path]:
        p = self.reports_dir / filename
        return p if p.exists() else None
