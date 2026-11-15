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

def test_authoritative_build_query_and_predict_response(ml_service):
    # Test authoritative build_query from notebook cell 13.2
    q = ml_service.build_query(1003, "BRCA")
    assert list(q.columns) == ["DRUG_ID", "PUTATIVE_TARGET", "PATHWAY_NAME", "TCGA_DESC", "MIN_CONC", "MAX_CONC"]
    assert q["DRUG_ID"].iloc[0] == 1003
    assert q["TCGA_DESC"].iloc[0] == "BRCA"

    # Test predict_response directly matching notebook cell 13.2
    pred_df = ml_service.predict_response(q)
    assert "PRED_LN_IC50" in pred_df.columns
    val = pred_df["PRED_LN_IC50"].iloc[0]
    assert np.isfinite(val)
    assert -10 < val < 15

    # Determinism test
    pred_df2 = ml_service.predict_response(q)
    assert np.allclose(pred_df["PRED_LN_IC50"].values, pred_df2["PRED_LN_IC50"].values)

def test_authoritative_sanity_checks(ml_service):
    # Missing required columns raises ValueError
    bad_df = pd.DataFrame([{"DRUG_ID": 1003, "TCGA_DESC": "BRCA"}])
    with pytest.raises(ValueError, match="Missing required columns"):
        ml_service.predict_response(bad_df)

    # Invalid concentration raises ValueError
    q_neg = ml_service.build_query(1003, "BRCA")
    q_neg["MIN_CONC"] = -1.0
    with pytest.raises(ValueError, match="positive"):
        ml_service.predict_response(q_neg)

    # MIN_CONC > MAX_CONC raises ValueError
    q_inv = ml_service.build_query(1003, "BRCA")
    q_inv["MIN_CONC"] = 100.0
    q_inv["MAX_CONC"] = 1.0
    with pytest.raises(ValueError, match="cannot exceed"):
        ml_service.predict_response(q_inv)

    # Unknown drug in build_query raises ValueError
    with pytest.raises(ValueError, match="Unknown drug"):
        ml_service.build_query("NotARealDrugName123", "BRCA")

    # Unknown tissue in build_query raises ValueError
    with pytest.raises(ValueError, match="Unknown tissue"):
        ml_service.build_query(1003, "NOT_A_VALID_TISSUE")

def test_prediction_batch_integrity(ml_service):
    batch = ml_service.predict_all_drugs(tissue="BRCA")
    assert len(batch) >= 286
    # verify monotonic ranks
    for i in range(len(batch) - 1):
        assert batch[i]["predicted_ln_ic50"] <= batch[i+1]["predicted_ln_ic50"]
        assert batch[i]["rank"] == i + 1

def test_pca_data_integrity(ml_service):
    pca = ml_service.get_pca_landscape()
    assert pca["total_cell_lines"] == 969
    assert len(pca["top_pc1_drugs"]) > 0
    assert len(pca["top_pc2_drugs"]) > 0
    assert "explained_variance_ratio" in pca
    assert sum(pca["explained_variance_ratio"][:2]) > 0.40

def test_cell_lines_and_probe_assays_integrity(ml_service):
    cell_lines = ml_service.get_cell_lines()
    assert len(cell_lines) == 969

    probes = ml_service.get_probe_assays()
    assert len(probes["probe_drugs"]) == 15
    assert len(probes["probe_ids"]) == 15
    assert len(probes["cell_line_fingerprints"]) == 969
