from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import Response
import json
from typing import Optional, List, Dict, Any

try:
    from schemas.schemas import PredictRequest, BatchPredictRequest
    from services.ml_service import MLService
except ImportError:
    from ..schemas.schemas import PredictRequest, BatchPredictRequest
    from ..services.ml_service import MLService

router = APIRouter(prefix="/api", tags=["Prediction"])
ml_service = MLService()

@router.get("/model/info")
def get_model_info():
    """Retrieve verified model card, architecture parameters, and holdout evaluation metrics."""
    return ml_service.get_model_info()

@router.get("/drugs")
def get_drugs(search: Optional[str] = None):
    """Retrieve the full GDSC2 drug catalog (295 drugs) with targets and concentration ranges."""
    drugs = ml_service.get_drug_catalog()
    if search:
        s = str(search).strip().lower()
        drugs = [d for d in drugs if s in str(d["DRUG_NAME"]).lower() or s in str(d["PUTATIVE_TARGET"]).lower() or s in str(d["PATHWAY_NAME"]).lower()]
    return drugs

@router.get("/tissues")
def get_tissues():
    """Retrieve the list of 33 TCGA cancer tissue classifications supported by the model."""
    return ml_service.get_tissues()

@router.post("/predict")
def predict_drug_response(req: PredictRequest):
    """Predict ln(IC50) and micromolar sensitivity for a specific chemotherapy drug in a tissue type."""
    try:
        return ml_service.predict_single(
            drug_id=req.drug_id,
            drug_name=req.drug_name,
            tissue=req.tissue,
            min_conc=req.min_conc,
            max_conc=req.max_conc
        )
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@router.post("/predict/all")
def predict_all_drugs(req: BatchPredictRequest):
    """Predict and rank all 295 GDSC2 drugs for a specified tissue type."""
    try:
        results = ml_service.predict_all_drugs(tissue=req.tissue)
        payload = json.dumps({
            "tissue": req.tissue,
            "total_drugs": len(results),
            "predictions": results
        })
        return Response(content=payload, media_type="application/json")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch prediction error: {str(e)}")
