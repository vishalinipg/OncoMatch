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
        self.profiles: Dict[str, Dict[str, Any]] = {}
        self._load_reference_profiles()
        self._initialized = True

    def _load_reference_profiles(self):
        """
        Load key reference profiles from the 969 GDSC2 cell lines as default analysis setups.
        """
        cell_lines = self.ml_service.get_cell_lines()
        probe_data = self.ml_service.get_probe_assays()
        fps = probe_data.get("cell_line_fingerprints", {})

        # Default high-impact reference cancer lines across distinct tissues
        ref_keys = [
            ("MCF7", "BRCA", 905946, "MCF7 (BRCA) Breast", "ER+/PR+ luminal breast adenocarcinoma"),
            ("A549", "LUAD", 905949, "A549 (LUAD) Lung", "KRAS G12S mutant non-small cell lung carcinoma"),
            ("K-562", "LCML", 905940, "K-562 (LCML) Leukemia", "BCR-ABL1 fusion positive leukemia"),
            ("HCT-116", "COREAD", 905936, "HCT-116 (COREAD) Colon", "KRAS G13D mutant colorectal carcinoma"),
            ("A375", "SKCM", 906793, "A375 (SKCM) Melanoma", "BRAF V600E mutant metastatic melanoma"),
            ("MDA-MB-231", "BRCA", 905960, "MDA-MB-231 (BRCA) TNBC", "Triple-negative basal breast adenocarcinoma")
        ]

        for name, tissue, cosmic_id, display_name, desc in ref_keys:
            # Find matching line
            matched = next((cl for cl in cell_lines if cl.get("cosmic_id") == cosmic_id or cl.get("name") == name), None)
            fingerprint = fps.get(str(cosmic_id), {})
            
            profile_id = f"CL-{name}"
            self.profiles[profile_id] = {
                "sample_id": profile_id,
                "name": display_name,
                "cell_line_name": name,
                "cosmic_id": cosmic_id,
                "sample_type": "Established cancer cell line",
                "tcga_desc": tissue,
                "cancer_type": f"{tissue} Carcinoma",
                "description": desc,
                "is_reference": True,
                "tested_drugs": matched.get("tested_drugs", 295) if matched else 295,
                "baseline_ln_ic50": matched.get("median_ln_ic50", 3.25) if matched else 3.25,
                "probe_fingerprint": fingerprint,
                "probe_assay_count": len(fingerprint),
                "warnings": []
            }
        
        logger.info(f"Initialized {len(self.profiles)} reference cell line profiles.")

    def list_samples(self) -> List[Dict[str, Any]]:
        return list(self.profiles.values())

    def get_sample(self, sample_id: str) -> Optional[Dict[str, Any]]:
        # Match by exact sample_id or cell_line_name or cosmic_id
        if sample_id in self.profiles:
            return self.profiles[sample_id]
        
        # Check if matching a COSMIC ID or cell line name from the 969 catalog
        cell_lines = self.ml_service.get_cell_lines()
        clean_id = str(sample_id).strip().upper()
        
        matched = None
        for cl in cell_lines:
            if str(cl.get("cosmic_id")) == clean_id or cl.get("name", "").upper() == clean_id:
                matched = cl
                break
        
        if matched:
            probe_data = self.ml_service.get_probe_assays()
            cid = str(matched["cosmic_id"])
            fingerprint = probe_data.get("cell_line_fingerprints", {}).get(cid, {})
            
            created_profile = {
                "sample_id": f"COSMIC-{cid}",
                "name": f"{matched['name']} (COSMIC {cid})",
                "cell_line_name": matched["name"],
                "cosmic_id": matched["cosmic_id"],
                "sample_type": "Established cancer cell line",
                "tcga_desc": matched.get("tcga_desc", "UNKNOWN"),
                "cancer_type": f"{matched.get('tcga_desc', 'Cancer')} Lineage",
                "description": f"GDSC2 screened cell line {matched['name']}. {matched.get('tested_drugs', 0)} drugs evaluated.",
                "is_reference": False,
                "tested_drugs": matched.get("tested_drugs", 0),
                "baseline_ln_ic50": matched.get("median_ln_ic50", 3.25),
                "probe_fingerprint": fingerprint,
                "probe_assay_count": len(fingerprint),
                "warnings": []
            }
            self.profiles[created_profile["sample_id"]] = created_profile
            return created_profile

        return None

    def create_sample(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new analysis profile (cell line or custom patient-derived model).
        """
        name = data.get("name") or data.get("cell_line_name") or f"Analysis-{uuid.uuid4().hex[:6].upper()}"
        tissue = data.get("tcga_desc", "UNKNOWN").upper()
        if tissue not in self.ml_service.tissues:
            tissue = "UNKNOWN"

        sample_type = data.get("sample_type", "Established cancer cell line")
        cosmic_id = data.get("cosmic_id")
        
        # Check if cosmic_id matches an existing line to link probe assays
        fingerprint = {}
        tested_drugs = 0
        baseline_ln = 3.255
        
        if cosmic_id:
            probe_data = self.ml_service.get_probe_assays()
            fingerprint = probe_data.get("cell_line_fingerprints", {}).get(str(cosmic_id), {})
            matched = next((cl for cl in self.ml_service.get_cell_lines() if cl.get("cosmic_id") == int(cosmic_id)), None)
            if matched:
                tested_drugs = matched.get("tested_drugs", 0)
                baseline_ln = matched.get("median_ln_ic50", 3.255)

        warnings = []
        if "patient-derived" in sample_type.lower() and "organoid" in sample_type.lower():
            warnings.append("Patient-derived organoid model: 3D drug diffusion and extracellular matrix differ from GDSC2 2D monolayer screens. Interpret predicted sensitivities as exploratory.")
        elif "patient-derived" in sample_type.lower():
            warnings.append("Patient-derived primary model: In-vitro cell-line predictions have not been clinically validated for direct patient dosing decisions.")

        profile_id = data.get("sample_id") or f"ANALYSIS-{uuid.uuid4().hex[:8].upper()}"
        
        profile = {
            "sample_id": profile_id,
            "name": name,
            "cell_line_name": data.get("cell_line_name") or name,
            "cosmic_id": cosmic_id,
            "sample_type": sample_type,
            "tcga_desc": tissue,
            "cancer_type": data.get("cancer_type") or f"{tissue} Cancer",
            "cancer_subtype": data.get("cancer_subtype"),
            "description": data.get("description", "Custom oncology analysis configuration."),
            "research_project_id": data.get("research_project_id"),
            "is_reference": False,
            "tested_drugs": tested_drugs,
            "baseline_ln_ic50": baseline_ln,
            "probe_fingerprint": fingerprint,
            "probe_assay_count": len(fingerprint),
            "warnings": warnings
        }

        self.profiles[profile_id] = profile
        return profile

    def delete_sample(self, sample_id: str) -> bool:
        if sample_id in self.profiles:
            # Don't delete protected reference profiles
            if self.profiles[sample_id].get("is_reference"):
                return False
            del self.profiles[sample_id]
            return True
        return False
