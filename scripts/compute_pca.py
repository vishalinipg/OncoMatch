import json
import numpy as np
import pandas as pd
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
from pathlib import Path

print("Computing PCA on cell-line drug-response landscape across all 969 cell lines...")

df = pd.read_csv("dataset/GDSC2_fitted_dose_response_24Jul22.csv")
df["TCGA_DESC"] = df["TCGA_DESC"].fillna("UNCLASSIFIED")

# Create a cell line x drug pivot table of LN_IC50
pivot = df.pivot_table(index=["COSMIC_ID", "CELL_LINE_NAME", "TCGA_DESC"], 
                       columns="DRUG_ID", 
                       values="LN_IC50", 
                       aggfunc="median")

# Impute missing with drug-specific mean
pivot_imputed = pivot.apply(lambda col: col.fillna(col.mean()), axis=0)

scaler = StandardScaler()
X_scaled = scaler.fit_transform(pivot_imputed)

pca = PCA(n_components=10, random_state=42)
X_pca = pca.fit_transform(X_scaled)

explained_variance = [round(float(v), 4) for v in pca.explained_variance_ratio_]
print("PCA Explained variance ratio (top 5):", explained_variance[:5])

# Build sample records
sample_points = []
for idx, (multi_idx, row) in enumerate(pivot_imputed.iterrows()):
    cosmic_id, cell_name, tcga = multi_idx
    sample_points.append({
        "sample_id": f"COSMIC_{cosmic_id}",
        "name": str(cell_name),
        "tcga_desc": str(tcga),
        "sample_type": "Established cancer cell line",
        "pc1": round(float(X_pca[idx, 0]), 3),
        "pc2": round(float(X_pca[idx, 1]), 3),
        "pc3": round(float(X_pca[idx, 2]), 3),
    })

# Drug loadings on PC1 and PC2
drug_cat = pd.read_csv("ml/artifacts/drug_catalog.csv").set_index("DRUG_ID")
drug_ids = pivot.columns.tolist()

pc1_loadings = []
pc2_loadings = []
for d_idx, d_id in enumerate(drug_ids):
    d_name = drug_cat.loc[d_id, "DRUG_NAME"] if d_id in drug_cat.index else f"Drug_{d_id}"
    d_target = drug_cat.loc[d_id, "PUTATIVE_TARGET"] if d_id in drug_cat.index else "Unspecified"
    d_pathway = drug_cat.loc[d_id, "PATHWAY_NAME"] if d_id in drug_cat.index else "Unclassified"
    
    pc1_loadings.append({
        "drug_id": int(d_id),
        "drug_name": str(d_name),
        "pathway": str(d_pathway),
        "loading": round(float(pca.components_[0, d_idx]), 4)
    })
    pc2_loadings.append({
        "drug_id": int(d_id),
        "drug_name": str(d_name),
        "pathway": str(d_pathway),
        "loading": round(float(pca.components_[1, d_idx]), 4)
    })

# Top loadings
top_pc1 = sorted(pc1_loadings, key=lambda x: abs(x["loading"]), reverse=True)[:10]
top_pc2 = sorted(pc2_loadings, key=lambda x: abs(x["loading"]), reverse=True)[:10]

tissues_in_pca = sorted(list(set(s["tcga_desc"] for s in sample_points)))

pca_output = {
    "total_cell_lines": len(sample_points),
    "total_drugs": len(drug_ids),
    "explained_variance_ratio": explained_variance,
    "pc1_variance": explained_variance[0],
    "pc2_variance": explained_variance[1],
    "samples": sample_points,
    "top_pc1_drugs": top_pc1,
    "top_pc2_drugs": top_pc2,
    "tissues": tissues_in_pca
}

for out_dir in ["ml/artifacts", "oncomatch_artifacts"]:
    out_file = Path(out_dir) / "pca_landscape.json"
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(pca_output, f, indent=2)

print(f"Saved {len(sample_points)} sample points to pca_landscape.json.")
