import os
import json
import pandas as pd

ART = "oncomatch_artifacts"
os.makedirs(ART, exist_ok=True)

# State summary
summary_data = {
    "HIDDEN_STATE": [0, 1, 2],
    "Records": [52200, 52136, 137700],
    "Mean_LN_IC50": [1.6464, 1.6285, 3.7402],
    "Median_LN_IC50": [2.2567, 2.1425, 4.1858],
    "Mean_Observation_Category": [0.6093, 0.6365, 1.2857]
}
summary_df = pd.DataFrame(summary_data).set_index("HIDDEN_STATE")
summary_df.to_csv(f"{ART}/OncoMatch_HMM_State_Summary.csv")

# Transition matrix
trans_data = [
    [0.0010, 0.9990, 0.0000],
    [0.9035, 0.0089, 0.0876],
    [0.0264, 0.0039, 0.9697]
]
trans_df = pd.DataFrame(
    trans_data,
    index=["State 0", "State 1", "State 2"],
    columns=["State 0", "State 1", "State 2"]
)
trans_df.to_csv(f"{ART}/OncoMatch_HMM_Transition_Matrix.csv")

# Emission matrix
emission_data = [
    [0.4885, 0.4120, 0.0995],
    [0.5099, 0.3475, 0.1426],
    [0.1960, 0.2951, 0.5088]
]
emission_df = pd.DataFrame(
    emission_data,
    index=["State 0", "State 1", "State 2"],
    columns=["Lower LN_IC50", "Middle LN_IC50", "Higher LN_IC50"]
)
emission_df.to_csv(f"{ART}/OncoMatch_HMM_Emission_Matrix.csv")

hmm_meta = {
    "model_type": "CategoricalHMM (n_components=3, n_features=3)",
    "tertile_1_boundary": 2.1929,
    "tertile_2_boundary": 4.2193,
    "converged": True,
    "iterations": 100,
    "log_likelihood": -254147.5986,
    "startprob": [1.0, 0.0, 0.0],
    "transition_matrix": trans_data,
    "emission_matrix": emission_data,
    "hidden_state_counts": {"0": 52200, "1": 52136, "2": 137700},
    "scientific_limitation": "HMM sequence order is by DRUG_ID (artificial convention, not a biological time series). Learned transitions describe this artificial ordering and must not be interpreted as biological progression or real temporal transitions."
}
with open(f"{ART}/hmm_meta.json", "w") as f:
    json.dump(hmm_meta, f, indent=2)

print("Saved exact HMM files from notebook outputs.")
