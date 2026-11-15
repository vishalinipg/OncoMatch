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

def test_spa_serving():
    resp = client.get("/")
    assert resp.status_code == 200
    assert "OncoMatch" in resp.text

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
    assert len(drugs) >= 286
    # Check cisplatin is in catalog
    cisplatin = [d for d in drugs if "cisplatin" in d["DRUG_NAME"].lower()]
    assert len(cisplatin) > 0

def test_get_tissues():
    resp = client.get("/api/tissues")
    assert resp.status_code == 200
    tissues = resp.json()
    assert "LUAD" in tissues
    assert "BRCA" in tissues
    assert len(tissues) >= 32

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
    assert data["total_drugs"] >= 286
    assert len(data["predictions"]) >= 286
    # verify ordered by predicted_ln_ic50 ascending
    preds = data["predictions"]
    assert preds[0]["predicted_ln_ic50"] <= preds[-1]["predicted_ln_ic50"]

def test_cell_lines_endpoint():
    resp = client.get("/api/cell-lines")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 969
    assert len(data["cell_lines"]) == 969

    # Test filtering by search query
    resp_search = client.get("/api/cell-lines?search=MCF7")
    assert resp_search.status_code == 200
    assert resp_search.json()["filtered_count"] >= 1

    # Test filtering by tissue
    resp_tissue = client.get("/api/cell-lines?tissue=BRCA")
    assert resp_tissue.status_code == 200
    assert resp_tissue.json()["filtered_count"] > 10

def test_cell_line_detail_and_probe_assays():
    # MCF-7 COSMIC ID is 905946
    resp = client.get("/api/cell-lines/905946")
    assert resp.status_code == 200
    data = resp.json()
    assert "cell_line" in data
    assert data["cell_line"]["name"] == "MCF7"
    assert "probe_fingerprint" in data
    assert len(data["probe_fingerprint"]) > 0

def test_samples_endpoints():
    # list samples
    resp = client.get("/api/samples")
    assert resp.status_code == 200
    samples = resp.json()
    assert len(samples) >= 4

    # get single sample
    first_id = samples[0]["sample_id"]
    resp2 = client.get(f"/api/samples/{first_id}")
    assert resp2.status_code == 200
    s_detail = resp2.json()
    assert "tcga_desc" in s_detail
    assert "sample_type" in s_detail

def test_pca_endpoint():
    resp = client.get("/api/analytics/pca")
    assert resp.status_code == 200
    pca = resp.json()
    assert "pc1_variance" in pca
    assert "samples" in pca
    assert len(pca["samples"]) == 969

def test_probe_assays_endpoint():
    resp = client.get("/api/analytics/probe-assays")
    assert resp.status_code == 200
    data = resp.json()
    assert "probe_drugs" in data
    assert len(data["probe_drugs"]) == 15
    # Verify Camptothecin (1003) is in probe drugs
    campt = next((p for p in data["probe_drugs"] if p["drug_id"] == 1003), None)
    assert campt is not None
    assert campt["drug_name"] == "Camptothecin"

def test_report_generation():
    # Generate report for MCF7 reference
    resp = client.post("/api/reports/generate", json={
        "sample_id": "CL-MCF7",
        "tissue": "BRCA"
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "report_id" in data
    assert "pdf_filename" in data
    assert "csv_filename" in data
