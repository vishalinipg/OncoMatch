import json
import pandas as pd
import numpy as np
from pathlib import Path

df = pd.read_csv("dataset/GDSC2_fitted_dose_response_24Jul22.csv")
df["TCGA_DESC"] = df["TCGA_DESC"].fillna("UNCLASSIFIED")
print(f"Loaded GDSC2 dataset with {len(df)} rows. Unique COSMIC_IDs: {df['COSMIC_ID'].nunique()}")

# 1. 969 Cell Lines
cell_lines_agg = df.groupby(["COSMIC_ID", "CELL_LINE_NAME", "TCGA_DESC"]).agg(
    tested_drugs=("DRUG_ID", "nunique"),
    mean_ln_ic50=("LN_IC50", "mean"),
    median_ln_ic50=("LN_IC50", "median"),
    min_ln_ic50=("LN_IC50", "min"),
    max_ln_ic50=("LN_IC50", "max")
).reset_index()

cell_lines_list = []
for _, row in cell_lines_agg.iterrows():
    cell_lines_list.append({
        "cosmic_id": int(row["COSMIC_ID"]),
        "name": str(row["CELL_LINE_NAME"]),
        "tcga_desc": str(row["TCGA_DESC"]),
        "tested_drugs": int(row["tested_drugs"]),
        "mean_ln_ic50": round(float(row["mean_ln_ic50"]), 3),
        "median_ln_ic50": round(float(row["median_ln_ic50"]), 3),
        "min_ln_ic50": round(float(row["min_ln_ic50"]), 3),
        "max_ln_ic50": round(float(row["max_ln_ic50"]), 3)
    })

cell_lines_list.sort(key=lambda x: x["name"])
print(f"Extracted {len(cell_lines_list)} unique cell lines.")

# 2. 15 Reference Probe Drugs (from Unit 12.11)
probe_ids = df.groupby("DRUG_ID")["COSMIC_ID"].nunique().sort_values(ascending=False).head(15).index.tolist()
print(f"15 Probe DRUG_IDs: {probe_ids}")

probe_drugs_list = []
for did in probe_ids:
    sub = df[df["DRUG_ID"] == did]
    first = sub.iloc[0]
    
    tissue_dist = {}
    for tissue, tdf in sub.groupby("TCGA_DESC"):
        tissue_dist[str(tissue)] = {
            "mean_ln_ic50": round(float(tdf["LN_IC50"].mean()), 3),
            "median_ln_ic50": round(float(tdf["LN_IC50"].median()), 3),
            "std_ln_ic50": round(float(tdf["LN_IC50"].std()), 3) if len(tdf) > 1 else 0.0,
            "count": int(len(tdf))
        }

    probe_drugs_list.append({
        "drug_id": int(did),
        "drug_name": str(first["DRUG_NAME"]),
        "putative_target": str(first["PUTATIVE_TARGET"]) if pd.notna(first["PUTATIVE_TARGET"]) else "Unspecified",
        "pathway_name": str(first["PATHWAY_NAME"]) if pd.notna(first["PATHWAY_NAME"]) else "Unclassified",
        "min_conc": float(first["MIN_CONC"]),
        "max_conc": float(first["MAX_CONC"]),
        "cell_lines_tested": int(sub["COSMIC_ID"].nunique()),
        "overall_mean_ln_ic50": round(float(sub["LN_IC50"].mean()), 3),
        "overall_median_ln_ic50": round(float(sub["LN_IC50"].median()), 3),
        "overall_std_ln_ic50": round(float(sub["LN_IC50"].std()), 3),
        "tissue_distribution": tissue_dist
    })

# 3. Save probe assay fingerprints per cell line for the 15 probe drugs
probe_pivot = df[df["DRUG_ID"].isin(probe_ids)].pivot_table(
    index="COSMIC_ID", columns="DRUG_ID", values="LN_IC50", aggfunc="mean"
)
cell_line_fingerprints = {}
for cosmic_id, row in probe_pivot.iterrows():
    fps = {}
    for did in probe_ids:
        val = row.get(did)
        if pd.notna(val):
            fps[str(did)] = round(float(val), 3)
    cell_line_fingerprints[str(cosmic_id)] = fps

print(f"Extracted fingerprints for {len(cell_line_fingerprints)} cell lines.")

# Save to both ml/artifacts and oncomatch_artifacts
for art_dir in ["ml/artifacts", "oncomatch_artifacts"]:
    p = Path(art_dir)
    p.mkdir(parents=True, exist_ok=True)
    with open(p / "cell_lines.json", "w", encoding="utf-8") as f:
        json.dump(cell_lines_list, f, indent=2)
    with open(p / "probe_assays.json", "w", encoding="utf-8") as f:
        json.dump({
            "probe_drugs": probe_drugs_list,
            "probe_ids": probe_ids,
            "cell_line_fingerprints": cell_line_fingerprints
        }, f, indent=2)

print("Saved cell_lines.json and probe_assays.json successfully.")
