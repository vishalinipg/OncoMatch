import pytest
import numpy as np
import pandas as pd
import json
from pathlib import Path
import sys

root_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(root_dir / "backend"))
sys.path.insert(0, str(root_dir / "ml"))
sys.path.insert(0, str(root_dir))

from services.ml_service import MLService

@pytest.fixture(scope="module")
def ml_service():
    return MLService()

def test_model_loading_and_properties(ml_service):
    assert ml_service.bundle is not None
    assert ml_service.model is not None
    assert ml_service.featurizer is not None
    assert len(ml_service.feature_columns) == 9
    assert "DRUG_TE" in ml_service.feature_columns
    assert "DRUG_TISSUE_TE" in ml_service.feature_columns
    assert "TISSUE_TE" in ml_service.feature_columns

def test_prediction_determinism(ml_service):
    p1 = ml_service.predict_single(drug_name="Cisplatin", tissue="LUAD")
    p2 = ml_service.predict_single(drug_name="Cisplatin", tissue="LUAD")
    assert np.isclose(p1["predicted_ln_ic50"], p2["predicted_ln_ic50"])
    assert np.isclose(p1["predicted_ic50_uM"], p2["predicted_ic50_uM"])
    assert p1["predicted_ln_ic50"] > -10 and p1["predicted_ln_ic50"] < 15

def test_prediction_batch_integrity(ml_service):
    batch = ml_service.predict_all_drugs(tissue="BRCA")
    assert len(batch) >= 200
    # verify monotonic ranks
    for i in range(len(batch) - 1):
        assert batch[i]["predicted_ln_ic50"] <= batch[i+1]["predicted_ln_ic50"]
        assert batch[i]["rank"] == i + 1

def test_invalid_drug_handling(ml_service):
    with pytest.raises(ValueError, match="not found"):
        ml_service.predict_single(drug_id=999999, tissue="LUAD")

def test_invalid_concentration_handling(ml_service):
    with pytest.raises(ValueError, match="positive"):
        ml_service.predict_single(drug_name="Cisplatin", tissue="LUAD", min_conc=-1.0)
    
    with pytest.raises(ValueError, match="exceed"):
        ml_service.predict_single(drug_name="Cisplatin", tissue="LUAD", min_conc=100.0, max_conc=1.0)

def test_unknown_tissue_graceful_fallback(ml_service):
    # Unknown tissue falls back to UNKNOWN
    pred = ml_service.predict_single(drug_name="Cisplatin", tissue="NON_EXISTENT_TISSUE")
    assert np.isfinite(pred["predicted_ln_ic50"])

def test_pca_data_integrity(ml_service):
    pca = ml_service.get_pca_landscape()
    assert pca["total_cell_lines"] > 900
    assert len(pca["top_pc1_drugs"]) > 0
    assert len(pca["top_pc2_drugs"]) > 0
    assert "explained_variance_ratio" in pca
    assert sum(pca["explained_variance_ratio"][:2]) > 0.40

def test_hmm_data_integrity(ml_service):
    hmm = ml_service.get_hmm_data()
    assert hmm["converged"] is True
    assert len(hmm["transition_matrix"]) == 3
    assert len(hmm["emission_matrix"]) == 3
    # Check probabilities sum to approx 1.0 for each row
    for row in hmm["transition_matrix"]:
        assert np.isclose(sum(row), 1.0, atol=1e-3)
    for row in hmm["emission_matrix"]:
        assert np.isclose(sum(row), 1.0, atol=1e-3)
