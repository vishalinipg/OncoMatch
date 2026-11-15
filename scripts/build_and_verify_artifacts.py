import os
import json
import time
import shutil
import numpy as np
import pandas as pd
from pathlib import Path
from sklearn.model_selection import GroupKFold
from sklearn.preprocessing import OrdinalEncoder
from sklearn.ensemble import HistGradientBoostingRegressor
import joblib

print("Starting artifact generation & verification...")
t0 = time.time()

# 1. Define and write oncomatch_features.py
features_code = '''"""Leakage-safe feature builder for OncoMatch."""
import numpy as np, pandas as pd
from sklearn.model_selection import GroupKFold
from sklearn.preprocessing import OrdinalEncoder

class DrugResponseFeaturizer:
    """Ordinal categories + log10 concentration features + smoothed target encodings.
    Statistics come from training rows only; training rows get out-of-fold (cell-line-grouped) encodings."""
    CATS = ["DRUG_ID", "PUTATIVE_TARGET", "PATHWAY_NAME", "TCGA_DESC"]
    KEYS = [(["DRUG_ID"], "DRUG_TE"), (["DRUG_ID", "TCGA_DESC"], "DRUG_TISSUE_TE"), (["TCGA_DESC"], "TISSUE_TE")]
    def __init__(self, smoothing=10, n_folds=5, target_encoding=True):
        self.smoothing, self.n_folds, self.target_encoding = smoothing, n_folds, target_encoding
    @staticmethod
    def _clean(d):
        d = d.copy()
        d["PUTATIVE_TARGET"] = d["PUTATIVE_TARGET"].fillna("UNKNOWN")
        d["TCGA_DESC"] = d["TCGA_DESC"].fillna("UNKNOWN")
        return d
    def _stats(self, d):
        return {n: d.groupby(k)["LN_IC50"].agg(["sum", "count"]) for k, n in self.KEYS}
    def _encode(self, stats, d, prior):
        out = pd.DataFrame(index=d.index)
        for k, n in self.KEYS:
            m = d[k].merge(stats[n], left_on=k, right_index=True, how="left")
            out[n] = (m["sum"].fillna(0).values + self.smoothing * prior) / (m["count"].fillna(0).values + self.smoothing)
        return out
    def _base(self, d):
        X = pd.DataFrame(self.enc_.transform(d[self.CATS].astype(str)), columns=self.CATS, index=d.index)
        X["LOG_MAX"] = np.log10(d["MAX_CONC"])
        X["LOG_RANGE"] = np.log10(d["MAX_CONC"] / d["MIN_CONC"])
        return X
    def fit_transform(self, d, groups):
        d = self._clean(d)
        self.enc_ = OrdinalEncoder(handle_unknown="use_encoded_value", unknown_value=-1).fit(d[self.CATS].astype(str))
        self.prior_ = d["LN_IC50"].mean()
        self.stats_ = self._stats(d)
        X = self._base(d)
        if self.target_encoding:
            oof = pd.DataFrame(index=d.index, columns=[n for _, n in self.KEYS], dtype=float)
            for a, b in GroupKFold(self.n_folds).split(d, groups=groups):
                fa = d.iloc[a]
                oof.iloc[b] = self._encode(self._stats(fa), d.iloc[b], fa["LN_IC50"].mean()).values
            X = pd.concat([X, oof], axis=1)
        self.columns_ = list(X.columns)
        return X
    def transform(self, d):
        d = self._clean(d)
        X = self._base(d)
        if self.target_encoding:
            X = pd.concat([X, self._encode(self.stats_, d, self.prior_)], axis=1)
        return X[self.columns_]
'''
Path('oncomatch_features.py').write_text(features_code, encoding='utf-8')
from oncomatch_features import DrugResponseFeaturizer

ART = "oncomatch_artifacts"
os.makedirs(ART, exist_ok=True)

# 2. Load GDSC2 dataset
csv_path = "GDSC2_fitted_dose_response_24Jul22.csv"
print(f"Reading {csv_path}...")
g = pd.read_csv(csv_path)
print(f"Loaded: shape={g.shape}, cell_lines={g['COSMIC_ID'].nunique()}, drugs={g['DRUG_ID'].nunique()}")

SEED = 42
TARGET = "LN_IC50"
K_SMOOTH = 10
best_params = {
    'min_samples_leaf': 100,
    'max_leaf_nodes': 15,
    'max_iter': 200,
    'max_depth': 6,
    'learning_rate': 0.03,
    'l2_regularization': 0
}

# 3. Fit production featurizer and model
print("Fitting production featurizer...")
production_featurizer = DrugResponseFeaturizer(K_SMOOTH, 5)
X_full_B = production_featurizer.fit_transform(g, groups=g["COSMIC_ID"])
y_full = g[TARGET].to_numpy()

print("Fitting HistGradientBoostingRegressor on full dataset...")
production_model = HistGradientBoostingRegressor(random_state=SEED, **best_params)
production_model.fit(X_full_B, y_full)

bundle = {
    "featurizer": production_featurizer,
    "model": production_model,
    "feature_columns": production_featurizer.columns_,
    "training_rows": int(len(g)),
    "training_cell_lines": int(g["COSMIC_ID"].nunique()),
    "training_scope": "All available GDSC2 rows; grouped OOF target encodings",
}
bundle_path = f"{ART}/oncomatch_pbl3_bundle.joblib"
joblib.dump(bundle, bundle_path, compress=3)
shutil.copy("oncomatch_features.py", f"{ART}/oncomatch_features.py")
print(f"Saved model bundle to {bundle_path} ({os.path.getsize(bundle_path)/1024:.1f} KB)")

# 4. Drug catalog
drug_catalog = (g.groupby("DRUG_ID").agg(
    DRUG_NAME=("DRUG_NAME", "first"),
    PUTATIVE_TARGET=("PUTATIVE_TARGET", "first"),
    PATHWAY_NAME=("PATHWAY_NAME", "first"),
    MIN_CONC=("MIN_CONC", lambda s: s.mode().iloc[0]),
    MAX_CONC=("MAX_CONC", lambda s: s.mode().iloc[0])
).reset_index())
drug_catalog.to_csv(f"{ART}/drug_catalog.csv", index=False)
print(f"Saved drug catalog ({len(drug_catalog)} unique drugs)")

tissues = sorted(g["TCGA_DESC"].fillna("UNKNOWN").unique().tolist())
train_median = float(g[TARGET].median())

# Extract exact metrics from notebook
metrics_data = {
    "evaluation_split": "GroupShuffleSplit by COSMIC_ID, 80:20, seed 42",
    "train_rows": 193708,
    "test_rows": 48328,
    "train_cell_lines": 775,
    "test_cell_lines": 194,
    "mean_baseline_test_MAE": 2.108,
    "tuned_histgb_holdout": {
        "MAE": 1.0270,
        "RMSE": 1.3612,
        "R2": 0.7585
    },
    "production_refit_rows": int(len(g)),
    "production_refit_cell_lines": int(g["COSMIC_ID"].nunique()),
    "best_params": best_params,
    "classification_view_threshold": train_median
}
json.dump(metrics_data, open(f"{ART}/metrics.json", "w"), indent=2)

meta_data = {
    "tissues": tissues,
    "train_median_ln_ic50": train_median,
    "training_rows": int(len(g)),
    "training_cell_lines": int(g["COSMIC_ID"].nunique()),
    "total_drugs": int(len(drug_catalog)),
    "drug_names_count": int(g["DRUG_NAME"].nunique())
}
json.dump(meta_data, open(f"{ART}/meta.json", "w"), indent=2)

card = {
    "name": "OncoMatch PBL-III drug-response regressor",
    "model": "HistGradientBoostingRegressor (tuned; refitted on all available data)",
    "target": "LN_IC50 (GDSC2 fitted)",
    "intended_use": "Course project: exploratory estimate of ln(IC50) for a drug in a cancer tissue type",
    "not_for": "Clinical decisions or patient treatment selection",
    "data": {
        "source": "GDSC2_fitted_dose_response_24Jul22.csv",
        "rows": int(len(g)),
        "cell_lines": int(g["COSMIC_ID"].nunique()),
        "drug_names": int(g["DRUG_NAME"].nunique()),
        "tissue_labels": len(tissues)
    },
    "evaluation": {
        "method": "Cell-line-grouped 80:20 hold-out (seed 42); test cell lines unseen during model selection",
        "train_rows": 193708,
        "test_rows": 48328,
        "train_cell_lines": 775,
        "test_cell_lines": 194,
        "test_metrics": {
            "MAE": 1.0270,
            "RMSE": 1.3612,
            "R2": 0.7585
        },
        "mean_baseline_test_MAE": 2.108
    },
    "production_refit": {
        "rows": int(len(g)),
        "cell_lines": int(g["COSMIC_ID"].nunique()),
        "feature_strategy": "Scenario B; grouped out-of-fold target encodings for model-fitting rows",
        "hyperparameters_selected_on": "Training split only, using grouped cross-validation"
    },
    "inputs": ["DRUG_ID", "PUTATIVE_TARGET", "PATHWAY_NAME", "TCGA_DESC", "MIN_CONC", "MAX_CONC"],
    "excluded_inputs": ["AUC", "RMSE", "Z_SCORE"],
    "limitations": [
        "No omics columns in raw GDSC2 fitted curves: tissue-level baselines modulated by drug chemistry",
        "Cell-line data does not establish clinical effectiveness",
        "Predictions for unseen drugs are not validated",
        "UNCLASSIFIED is the largest tissue group"
    ],
    "best_params": best_params
}
json.dump(card, open(f"{ART}/model_card.json", "w"), indent=2)

print("Artifact generation completed in", round(time.time() - t0, 1), "seconds.")
