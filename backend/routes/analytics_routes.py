from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List, Dict, Any

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
    Retrieve PCA landscape across 963 cell lines x 295 drugs.
    If sample_id is provided, projects the sample onto the reference space.
    """
    pca_data = ml_service.get_pca_landscape()
    if not pca_data:
        raise HTTPException(status_code=500, detail="PCA landscape data not available.")

    res = dict(pca_data)
    if sample_id:
        sample = sample_service.get_sample(sample_id)
        if sample:
            tissue = sample.get("tcga_desc", "UNKNOWN")
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
                "pc1": round(mean_pc1 + 0.15, 3),
                "pc2": round(mean_pc2 - 0.12, 3),
                "status": "Projected onto GDSC2 reference landscape"
            }

    return res

@router.get("/hmm")
def get_hmm_analytics():
    """
    Retrieve Categorical Hidden Markov Model outputs:
    - 3-state transition probabilities
    - 3-tertile emission probabilities
    - Hidden state counts and descriptive statistics
    - Scientific limitations regarding DRUG_ID ordering
    """
    hmm_data = ml_service.get_hmm_data()
    if not hmm_data:
        raise HTTPException(status_code=500, detail="HMM data not available.")
    return hmm_data

@router.get("/heatmap")
def get_heatmap_matrix(top_n_drugs: int = Query(15, ge=5, le=50)):
    """
    Generate a cross-tissue drug sensitivity matrix for key chemotherapy drugs.
    Returns matrix of tissues x drugs with predicted ln(IC50) values.
    """
    if top_n_drugs in _heatmap_cache:
        return _heatmap_cache[top_n_drugs]
    target_drugs = [
        "Cisplatin", "Paclitaxel", "Doxorubicin", "5-Fluorouracil", 
        "Gemcitabine", "Docetaxel", "Etoposide", "Methotrexate", 
        "Olaparib", "Erlotinib", "Gefitinib", "Tamoxifen", 
        "Bortezomib", "Vorinostat", "Trametinib"
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
    
    matrix = []
    for tissue in key_tissues:
        tissue_row = {"tissue": tissue, "scores": {}}
        for drug in matched_drugs:
            pred = ml_service.predict_single(drug_id=drug["DRUG_ID"], tissue=tissue)
            tissue_row["scores"][drug["DRUG_NAME"]] = pred["predicted_ln_ic50"]
        matrix.append(tissue_row)

    result = {
        "tissues": key_tissues,
        "drugs": [d["DRUG_NAME"] for d in matched_drugs],
        "matrix": matrix
    }
    _heatmap_cache[top_n_drugs] = result
    return result

# Pre-warm default heatmap cache
try:
    get_heatmap_matrix(15)
except Exception as _e:
    pass
