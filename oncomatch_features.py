"""Leakage-safe feature builder for OncoMatch."""
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
