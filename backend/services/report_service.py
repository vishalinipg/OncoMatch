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
            raise ValueError(f"Sample or Cell Line '{sample_id}' not found.")

        target_tissue = tissue or sample.get("tcga_desc", "BRCA")
        if target_tissue not in self.ml_service.tissues:
            target_tissue = "UNKNOWN"

        # Run predictions across all drugs
        all_preds = self.ml_service.predict_all_drugs(target_tissue)
        top_sensitive = all_preds[:8]
        top_resistant = all_preds[-5:]

        # Get probe assays for benchmark comparison
        probe_data = self.ml_service.get_probe_assays()
        probe_drugs = probe_data.get("probe_drugs", [])[:6]

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

        # Section 1: Cell Line & Lineage Context
        page.insert_text(pymupdf.Point(40, y), "1. SAMPLE & LINEAGE PROFILE SUMMARY", fontsize=11, fontname="helv", color=c_primary)
        y += 18
        page.draw_line(pymupdf.Point(40, y - 6), pymupdf.Point(555, y - 6), color=c_teal, width=1.5)

        cosmic_str = f"COSMIC ID: {sample.get('cosmic_id')}" if sample.get("cosmic_id") else "COSMIC ID: Custom / Primary"
        sample_lines = [
            f"Sample / Cell Line: {sample.get('name')}     {cosmic_str}",
            f"Lineage Category: {sample.get('sample_type')}     TCGA Tissue Origin: {target_tissue}",
            f"Cancer Diagnosis: {sample.get('cancer_type', 'Cancer')}     Subtype: {sample.get('cancer_subtype', 'Standard')}",
            f"Screening Context: {sample.get('tested_drugs', 295)} drugs benchmarked     Baseline ln(IC50): {sample.get('baseline_ln_ic50', 3.255)}"
        ]

        for line in sample_lines:
            page.insert_text(pymupdf.Point(45, y), line, fontsize=9, fontname="helv", color=c_dark)
            y += 14

        # Warnings if patient derived
        warnings = sample.get("warnings", [])
        if warnings:
            y += 4
            for w in warnings:
                page.insert_text(pymupdf.Point(45, y), f"WARNING: {w}", fontsize=8, fontname="helv", color=c_red)
                y += 12

        y += 12
        # Section 2: Machine Learning Architecture & Benchmark
        page.insert_text(pymupdf.Point(40, y), "2. MACHINE LEARNING ARCHITECTURE & BENCHMARK", fontsize=11, fontname="helv", color=c_primary)
        y += 18
        page.draw_line(pymupdf.Point(40, y - 6), pymupdf.Point(555, y - 6), color=c_teal, width=1.5)

        m_info = [
            "Model: HistGradientBoostingRegressor (tuned) refitted on 242,036 GDSC2 fitted dose-response curves.",
            "Features: Drug ID, putative target, pathway, TCGA tissue lineage, and log-concentration bounds.",
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
        page.insert_text(pymupdf.Point(435, y + 8), "ln(IC50)", fontsize=8, fontname="helv", color=c_primary)
        page.insert_text(pymupdf.Point(485, y + 8), "IC50 (uM)", fontsize=8, fontname="helv", color=c_primary)
        page.insert_text(pymupdf.Point(525, y + 8), "Status", fontsize=8, fontname="helv", color=c_primary)
        y += 18

        for item in top_sensitive:
            bg_col = (0.97, 0.99, 0.97) if item["rank"] <= 3 else None
            if bg_col:
                page.draw_rect(pymupdf.Rect(40, y - 3, 555, y + 11), color=None, fill=bg_col)
            
            page.insert_text(pymupdf.Point(45, y + 7), f"#{item['rank']}", fontsize=8, fontname="helv", color=c_dark)
            page.insert_text(pymupdf.Point(75, y + 7), str(item['drug_name'])[:20], fontsize=8, fontname="helv", color=c_primary)
            page.insert_text(pymupdf.Point(195, y + 7), str(item['putative_target'])[:22], fontsize=7.5, fontname="helv", color=c_dark)
            page.insert_text(pymupdf.Point(325, y + 7), str(item['pathway_name'])[:18], fontsize=7.5, fontname="helv", color=c_gray)
            page.insert_text(pymupdf.Point(435, y + 7), f"{item['predicted_ln_ic50']:.2f}", fontsize=8, fontname="helv", color=c_dark)
            page.insert_text(pymupdf.Point(485, y + 7), f"{item['predicted_ic50_uM']:.2f}", fontsize=8, fontname="helv", color=c_dark)
            page.insert_text(pymupdf.Point(525, y + 7), "Sensitive", fontsize=7.5, fontname="helv", color=(0.1, 0.6, 0.2))
            y += 14

        y += 10
        # Section 4: 15 Probe-Drug Benchmark Assay Panel
        page.insert_text(pymupdf.Point(40, y), "4. REFERENCE PROBE-DRUG ASSAY BENCHMARK (GDSC2 Scenario C Panel)", fontsize=11, fontname="helv", color=c_primary)
        y += 18
        page.draw_line(pymupdf.Point(40, y - 6), pymupdf.Point(555, y - 6), color=c_teal, width=1.5)

        page.draw_rect(pymupdf.Rect(40, y - 4, 555, y + 14), color=None, fill=c_light)
        page.insert_text(pymupdf.Point(45, y + 8), "Probe Drug", fontsize=8, fontname="helv", color=c_primary)
        page.insert_text(pymupdf.Point(175, y + 8), "Mechanism / Target", fontsize=8, fontname="helv", color=c_primary)
        page.insert_text(pymupdf.Point(325, y + 8), "Pathway", fontsize=8, fontname="helv", color=c_primary)
        page.insert_text(pymupdf.Point(435, y + 8), "Global ln(IC50)", fontsize=8, fontname="helv", color=c_primary)
        page.insert_text(pymupdf.Point(505, y + 8), "Tested Lines", fontsize=8, fontname="helv", color=c_primary)
        y += 18

        for pb in probe_drugs:
            page.insert_text(pymupdf.Point(45, y + 7), str(pb['drug_name'])[:20], fontsize=8, fontname="helv", color=c_primary)
            page.insert_text(pymupdf.Point(175, y + 7), str(pb['putative_target'])[:24], fontsize=7.5, fontname="helv", color=c_dark)
            page.insert_text(pymupdf.Point(325, y + 7), str(pb['pathway_name'])[:18], fontsize=7.5, fontname="helv", color=c_gray)
            page.insert_text(pymupdf.Point(435, y + 7), f"{pb['overall_mean_ln_ic50']:.2f}", fontsize=8, fontname="helv", color=c_dark)
            page.insert_text(pymupdf.Point(505, y + 7), f"{pb['cell_lines_tested']} / 969", fontsize=8, fontname="helv", color=c_dark)
            y += 14

        y += 10
        # Section 5: Regulatory & Clinical Disclaimer
        page.draw_rect(pymupdf.Rect(40, y, 555, y + 54), color=c_red, fill=(0.99, 0.96, 0.96), width=0.8)
        page.insert_text(pymupdf.Point(48, y + 14), "RESEARCH USE ONLY — NOT FOR CLINICAL DIAGNOSTIC OR TREATMENT DECISIONS", fontsize=8, fontname="helv", color=c_red)
        disc_text = (
            "This report provides computational machine-learning predictions trained on in-vitro cell line screens (GDSC2). "
            "In-vitro viability measurements do not account for in-vivo pharmacokinetics, tumor vascularization, drug penetration, "
            "immune microenvironment, or patient-specific toxicity. All predictions must be experimentally validated before clinical translation."
        )
        page.insert_textbox(pymupdf.Rect(48, y + 20, 545, y + 50), disc_text, fontsize=7, fontname="helv", color=c_dark)

        # Save PDF
        doc.save(str(pdf_path))
        doc.close()

        # Generate companion CSV with all 295 predictions
        csv_filename = f"{report_id}_{sample_id}.csv"
        csv_path = self.reports_dir / csv_filename
        df_export = pd.DataFrame(all_preds)
        df_export["sample_id"] = sample_id
        df_export["sample_name"] = sample.get("name")
        df_export["tcga_desc"] = target_tissue
        df_export.to_csv(csv_path, index=False)

        # Update History
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
        self.history.insert(0, record)
        self._save_history()

        return {
            "report_id": report_id,
            "message": "Report generated successfully.",
            "pdf_filename": pdf_filename,
            "csv_filename": csv_filename,
            "record": record
        }

    def get_report_file(self, filename: str) -> Optional[Path]:
        p = self.reports_dir / filename
        if p.exists() and p.is_file():
            return p
        return None

    get_report_file_path = get_report_file
