import pytest
from fastapi.testclient import TestClient
import sys
from pathlib import Path

# Add backend and ml to path
root_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(root_dir / "backend"))
sys.path.insert(0, str(root_dir / "ml"))
sys.path.insert(0, str(root_dir))

from main import app

client = TestClient(app)

def test_health_check():
    resp = client.get("/api/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "online"
    assert "GDSC2" in data["dataset"]

def test_get_model_info():
    resp = client.get("/api/model/info")
    assert resp.status_code == 200
    data = resp.json()
    assert data["training_rows"] == 242036
    assert data["training_cell_lines"] == 969
    assert "metrics" in data
    assert data["metrics"]["tuned_histgb_holdout"]["MAE"] == 1.0270

def test_get_drugs():
    resp = client.get("/api/drugs")
    assert resp.status_code == 200
    drugs = resp.json()
    assert len(drugs) >= 200
    # Check cisplatin is in catalog
    cisplatin = [d for d in drugs if "cisplatin" in d["DRUG_NAME"].lower()]
    assert len(cisplatin) > 0

def test_get_tissues():
    resp = client.get("/api/tissues")
    assert resp.status_code == 200
    tissues = resp.json()
    assert "LUAD" in tissues
    assert "BRCA" in tissues

def test_single_prediction():
    resp = client.post("/api/predict", json={
        "drug_name": "Cisplatin",
        "tissue": "LUAD"
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "predicted_ln_ic50" in data
    assert "predicted_ic50_uM" in data
    assert "confidence_band_80pct" in data
    assert data["drug_name"] == "Cisplatin"
    assert data["tissue"] == "LUAD"

def test_batch_prediction():
    resp = client.post("/api/predict/all", json={"tissue": "BRCA"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_drugs"] >= 200
    assert len(data["predictions"]) >= 200
    # verify ordered by predicted_ln_ic50 ascending
    preds = data["predictions"]
    assert preds[0]["predicted_ln_ic50"] <= preds[-1]["predicted_ln_ic50"]

def test_samples_endpoints():
    # list samples
    resp = client.get("/api/samples")
    assert resp.status_code == 200
    samples = resp.json()
    assert len(samples) >= 4 # at least 4 demo samples

    # get single sample
    first_id = samples[0]["sample_id"]
    resp2 = client.get(f"/api/samples/{first_id}")
    assert resp2.status_code == 200
    s_detail = resp2.json()
    assert "expression" in s_detail
    assert "quality" in s_detail

def test_pca_endpoint():
    resp = client.get("/api/analytics/pca")
    assert resp.status_code == 200
    pca = resp.json()
    assert "pc1_variance" in pca
    assert "samples" in pca
    assert len(pca["samples"]) > 500

def test_hmm_endpoint():
    resp = client.get("/api/analytics/hmm")
    assert resp.status_code == 200
    hmm = resp.json()
    assert "transition_matrix" in hmm
    assert "emission_matrix" in hmm
    assert "scientific_limitation" in hmm
    assert len(hmm["transition_matrix"]) == 3

def test_report_generation():
    # generate for MCF7-REF
    resp = client.post("/api/reports/generate", json={
        "sample_id": "MCF7-REF",
        "tissue": "BRCA"
    })
    assert resp.status_code == 200
    rep = resp.json()
    assert "pdf_file" in rep
    assert "csv_file" in rep
    
    # check history
    h_resp = client.get("/api/reports/history")
    assert h_resp.status_code == 200
    assert len(h_resp.json()) >= 1
