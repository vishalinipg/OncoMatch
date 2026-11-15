import pandas as pd
import json

df = pd.read_csv('dataset/GDSC2_fitted_dose_response_24Jul22.csv')
print(f'Total rows: {len(df)}')
print(f'Unique COSMIC_ID: {df["COSMIC_ID"].nunique()}')
print(f'Unique CELL_LINE_NAME: {df["CELL_LINE_NAME"].nunique()}')
print(f'Unique DRUG_NAME: {df["DRUG_NAME"].nunique()}')
print(f'Unique DRUG_ID: {df["DRUG_ID"].nunique()}')
print(f'Unique TCGA_DESC: {df["TCGA_DESC"].nunique()}')

probe_ids = df.groupby('DRUG_ID')['COSMIC_ID'].nunique().sort_values(ascending=False).head(15)
print('\nTop 15 probe drugs by cell line coverage:')
for did, cnt in probe_ids.items():
    sub = df[df['DRUG_ID'] == did].iloc[0]
    print(f"DRUG_ID {did:4d}: {sub['DRUG_NAME']:25s} | Target: {str(sub['PUTATIVE_TARGET']):30s} | Pathway: {str(sub['PATHWAY_NAME']):25s} | Lines: {cnt}")

print('\nCheck cell line mapping:')
cell_lines = df[['COSMIC_ID', 'CELL_LINE_NAME', 'TCGA_DESC']].drop_duplicates()
print(f'Unique cell line tuples: {len(cell_lines)}')
duplicate_cosmic = cell_lines[cell_lines.duplicated(subset=['COSMIC_ID'], keep=False)]
print(f'Duplicate COSMIC_IDs: {len(duplicate_cosmic)}')
