from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import Optional, List, Dict, Any

try:
    from schemas.schemas import SampleCreateRequest
    from services.sample_service import SampleService
    from services.ml_service import MLService
except ImportError:
    from ..schemas.schemas import SampleCreateRequest
    from ..services.sample_service import SampleService
    from ..services.ml_service import MLService

router = APIRouter(prefix="/api", tags=["Samples"])
sample_service = SampleService()
ml_service = MLService()

@router.get("/samples")
def list_samples():
    """List all loaded cancer samples (demo and user-uploaded) with quality summaries."""
    return sample_service.list_samples()

@router.get("/samples/{sample_id}")
def get_sample(sample_id: str):
    """Get detailed profile and molecular expression values for a specific cancer sample."""
    s = sample_service.get_sample(sample_id)
    if not s:
        raise HTTPException(status_code=404, detail=f"Sample '{sample_id}' not found.")
    return s

@router.post("/samples")
def create_sample(req: SampleCreateRequest):
    """Create a new sample profile with molecular expression data."""
    try:
        sample = sample_service.create_sample(req.model_dump())
        return sample
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/samples/{sample_id}")
def delete_sample(sample_id: str):
    """Delete a sample from the workspace."""
    success = sample_service.delete_sample(sample_id)
    if not success:
        raise HTTPException(status_code=404, detail="Sample not found.")
    return {"message": f"Sample {sample_id} deleted."}

@router.post("/samples/upload")
async def upload_expression_file(file: UploadFile = File(...)):
    """Upload and validate a CSV/TSV molecular profile containing gene expression measurements."""
    try:
        content_bytes = await file.read()
        content_str = content_bytes.decode("utf-8", errors="replace")
        res = sample_service.parse_and_validate_file(content_str, file.filename or "upload.csv")
        return res
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"File parsing error: {str(e)}")

@router.get("/l1000/genes")
def get_l1000_genes():
    """Retrieve the official 978 L1000 landmark gene catalog with Entrez IDs and functional annotations."""
    return ml_service.get_l1000_reference()
