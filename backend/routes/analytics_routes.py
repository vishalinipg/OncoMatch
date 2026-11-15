from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List, Dict, Any
import pandas as pd

try:
    from services.ml_service import MLService
    from services.sample_service import SampleService
except ImportError:
    from ..services.ml_service import MLService
    from ..services.sample_service import SampleService

router = APIRouter(prefix="/api/analytics", tags=["Visual Analytics"])
ml_service = MLService()
sample_service = SampleService()
_heatmap_cache: Dict[int, Any] = {}

@router.get("/pca")
def get_pca_analytics(sample_id: Optional[str] = None):
    """
    Retrieve Pharmacogenomic PCA landscape across 969 cell lines x 286 drugs.
    If sample_id is provided, projects or highlights the sample in the reference space.
    """
    pca_data = ml_service.get_pca_landscape()
    if not pca_data:
        raise HTTPException(status_code=500, detail="PCA landscape data not available.")

    res = dict(pca_data)
    if sample_id:
        sample = sample_service.get_sample(sample_id)
        if sample:
            tissue = sample.get("tcga_desc", "UNKNOWN")
            cosmic_id = sample.get("cosmic_id")
            
            # Check if this exact cell line is already plotted in PCA
            exact_match = None
            if cosmic_id:
                for s in pca_data.get("samples", []):
                    if s.get("sample_id") == f"COSMIC_{cosmic_id}":
                        exact_match = s
                        break
            
            if exact_match:
                res["current_sample_projection"] = {
                    "sample_id": sample_id,
                    "name": sample.get("name"),
                    "sample_type": sample.get("sample_type"),
                    "tcga_desc": tissue,
                    "pc1": exact_match["pc1"],
                    "pc2": exact_match["pc2"],
                    "status": "Exact GDSC2 Cell Line Coordinates"
                }
            else:
                tissue_samples = [s for s in pca_data.get("samples", []) if s.get("tcga_desc") == tissue]
                if tissue_samples:
                    mean_pc1 = sum(s["pc1"] for s in tissue_samples) / len(tissue_samples)
                    mean_pc2 = sum(s["pc2"] for s in tissue_samples) / len(tissue_samples)
                else:
                    mean_pc1 = 0.0
                    mean_pc2 = 0.0

                res["current_sample_projection"] = {
                    "sample_id": sample_id,
                    "name": sample.get("name"),
                    "sample_type": sample.get("sample_type"),
                    "tcga_desc": tissue,
                    "pc1": round(mean_pc1, 3),
                    "pc2": round(mean_pc2, 3),
                    "status": f"Projected to {tissue} lineage centroid"
                }

    return res

@router.get("/probe-assays")
def get_probe_assay_analytics(tissue: Optional[str] = None):
    """
    Retrieve GDSC2 15 Probe-Drug Reference Panel (Unit 12.11 / Scenario C).
    These 15 compounds were tested across nearly all 969 cell lines and serve
    as the experimental reference baseline for cross-lineage sensitivity comparisons.
    """
    data = ml_service.get_probe_assays()
    if not data or not data.get("probe_drugs"):
        raise HTTPException(status_code=500, detail="Probe assay benchmark data not available.")

    probe_drugs = data.get("probe_drugs", [])
    probe_ids = data.get("probe_ids", [p["drug_id"] for p in probe_drugs])
    
    if tissue and tissue.upper() != "ALL":
        t_clean = tissue.upper()
        out = []
        for pdrug in probe_drugs:
            t_data = pdrug.get("tissue_distribution", {}).get(t_clean, {
                "mean_ln_ic50": pdrug["overall_mean_ln_ic50"],
                "median_ln_ic50": pdrug["overall_median_ln_ic50"],
                "count": 0
            })
            out.append({
                **pdrug,
                "selected_tissue": t_clean,
                "tissue_mean_ln_ic50": t_data.get("mean_ln_ic50"),
                "tissue_median_ln_ic50": t_data.get("median_ln_ic50"),
                "tissue_tested_lines": t_data.get("count", 0)
            })
        return {
            "probe_drugs": out,
            "probe_ids": probe_ids,
            "tissue": t_clean,
            "total_probes": len(out)
        }

    return {
        "probe_drugs": probe_drugs,
        "probe_ids": probe_ids,
        "total_probes": len(probe_drugs)
    }

@router.get("/heatmap")
def get_heatmap_matrix(top_n_drugs: int = Query(15, ge=5, le=50)):
    """
    Generate a cross-tissue drug sensitivity matrix for key chemotherapy drugs.
    Returns matrix of tissues x drugs with predicted ln(IC50) values.
    Optimized with batch inference for high-speed response.
    """
    if top_n_drugs in _heatmap_cache:
        return _heatmap_cache[top_n_drugs]

    target_drugs = [
        "Cisplatin", "Paclitaxel", "5-Fluorouracil", "Gemcitabine", 
        "Docetaxel", "Methotrexate", "Olaparib", "Erlotinib", 
        "Gefitinib", "Tamoxifen", "Bortezomib", "Vorinostat", 
        "Trametinib", "Camptothecin", "Vinblastine"
    ]
    catalog = ml_service.get_drug_catalog()
    matched_drugs = []
    for dname in target_drugs:
        found = [d for d in catalog if dname.lower() in str(d["DRUG_NAME"]).lower()]
        if found:
            matched_drugs.append(found[0])
    
    if len(matched_drugs) < top_n_drugs:
        for d in catalog:
            if d not in matched_drugs and len(matched_drugs) < top_n_drugs:
                matched_drugs.append(d)

    key_tissues = ["BRCA", "LUAD", "SKCM", "COREAD", "PAAD", "OV", "GBM", "LAML", "PRAD", "KIRC"]
    
    # Fast vectorized batch prediction for all (tissue, drug) pairs
    batch_rows = []
    for tissue in key_tissues:
        for drug in matched_drugs:
            batch_rows.append({
                "DRUG_ID": int(drug["DRUG_ID"]),
                "PUTATIVE_TARGET": str(drug["PUTATIVE_TARGET"]),
                "PATHWAY_NAME": str(drug["PATHWAY_NAME"]),
                "TCGA_DESC": tissue,
                "MIN_CONC": float(drug["MIN_CONC"]),
                "MAX_CONC": float(drug["MAX_CONC"]),
                "_tissue": tissue,
                "_drug_name": str(drug["DRUG_NAME"])
            })

    df_all = pd.DataFrame(batch_rows)
    scored = ml_service.predict_response(df_all[["DRUG_ID", "PUTATIVE_TARGET", "PATHWAY_NAME", "TCGA_DESC", "MIN_CONC", "MAX_CONC"]])
    df_all["PRED_LN_IC50"] = scored["PRED_LN_IC50"]

    matrix = []
    for tissue in key_tissues:
        sub = df_all[df_all["_tissue"] == tissue]
        tissue_row = {
            "tissue": tissue,
            "scores": {row["_drug_name"]: round(float(row["PRED_LN_IC50"]), 4) for _, row in sub.iterrows()}
        }
        matrix.append(tissue_row)

    res = {
        "tissues": key_tissues,
        "drugs": [d["DRUG_NAME"] for d in matched_drugs],
        "matrix": matrix
    }
    _heatmap_cache[top_n_drugs] = res
    return res
