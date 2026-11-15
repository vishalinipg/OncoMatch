from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List, Dict, Any

try:
    from schemas.schemas import SampleCreateRequest
    from services.sample_service import SampleService
    from services.ml_service import MLService
except ImportError:
    from ..schemas.schemas import SampleCreateRequest
    from ..services.sample_service import SampleService
    from ..services.ml_service import MLService

router = APIRouter(prefix="/api", tags=["Samples & Cell Lines"])
sample_service = SampleService()
ml_service = MLService()

@router.get("/cell-lines")
def list_cell_lines(
    search: Optional[str] = Query(None, description="Search by cell line name or COSMIC ID"),
    tissue: Optional[str] = Query(None, description="Filter by TCGA tissue lineage"),
    limit: int = Query(969, ge=1, le=1000)
):
    """
    List all 969 verified GDSC2 cancer cell lines with their COSMIC IDs, 
    tissue lineages, tested drug counts, and baseline sensitivities.
    """
    all_lines = ml_service.get_cell_lines()
    filtered = all_lines

    if tissue and tissue.upper() != "ALL":
        t_upper = tissue.upper()
        filtered = [cl for cl in filtered if cl.get("tcga_desc", "").upper() == t_upper]

    if search:
        s_lower = search.strip().lower()
        filtered = [
            cl for cl in filtered 
            if s_lower in cl.get("name", "").lower() or s_lower in str(cl.get("cosmic_id", ""))
        ]

    return {
        "total": len(all_lines),
        "filtered_count": len(filtered),
        "cell_lines": filtered[:limit]
    }

@router.get("/cell-lines/{cosmic_id}")
def get_cell_line(cosmic_id: int):
    """
    Get detailed screening information and 15-probe drug assay fingerprint 
    for a specific cell line by COSMIC ID.
    """
    all_lines = ml_service.get_cell_lines()
    matched = next((cl for cl in all_lines if cl.get("cosmic_id") == cosmic_id), None)
    if not matched:
        raise HTTPException(status_code=404, detail=f"Cell line with COSMIC ID {cosmic_id} not found.")

    probe_data = ml_service.get_probe_assays()
    fingerprint = probe_data.get("cell_line_fingerprints", {}).get(str(cosmic_id), {})

    # Detailed probe records
    probe_details = []
    for pdrug in probe_data.get("probe_drugs", []):
        did_str = str(pdrug["drug_id"])
        val = fingerprint.get(did_str)
        probe_details.append({
            "drug_id": pdrug["drug_id"],
            "drug_name": pdrug["drug_name"],
            "putative_target": pdrug["putative_target"],
            "pathway_name": pdrug["pathway_name"],
            "observed_ln_ic50": val,
            "overall_mean_ln_ic50": pdrug["overall_mean_ln_ic50"]
        })

    return {
        "cell_line": matched,
        "probe_fingerprint": fingerprint,
        "probe_assays": probe_details
    }

@router.get("/samples")
def list_samples():
    """List active analysis setups and cell-line profiles."""
    return sample_service.list_samples()

@router.get("/samples/{sample_id}")
def get_sample(sample_id: str):
    """Get detailed analysis configuration and cell-line profile."""
    s = sample_service.get_sample(sample_id)
    if not s:
        raise HTTPException(status_code=404, detail=f"Sample or Cell Line '{sample_id}' not found.")
    return s

@router.post("/samples")
def create_sample(req: SampleCreateRequest):
    """Create a new sample analysis profile."""
    try:
        sample = sample_service.create_sample(req.model_dump())
        return sample
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/samples/{sample_id}")
def delete_sample(sample_id: str):
    """Delete a custom analysis profile."""
    success = sample_service.delete_sample(sample_id)
    if not success:
        raise HTTPException(status_code=400, detail="Cannot delete reference profile or profile not found.")
    return {"message": f"Sample {sample_id} deleted."}
