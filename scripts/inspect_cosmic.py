import pandas as pd
df = pd.read_csv('dataset/GDSC2_fitted_dose_response_24Jul22.csv')
names = ['MCF7', 'A549', 'K-562', 'HCT-116', 'A375', 'MDA-MB-231', 'PC-3', 'HT-29', 'SK-MEL-28']
for n in names:
    sub = df[df['CELL_LINE_NAME'].str.upper() == n.upper()][['COSMIC_ID', 'CELL_LINE_NAME', 'TCGA_DESC']].drop_duplicates()
    if sub.empty:
        sub = df[df['CELL_LINE_NAME'].str.replace('-', '').str.upper() == n.replace('-', '').upper()][['COSMIC_ID', 'CELL_LINE_NAME', 'TCGA_DESC']].drop_duplicates()
    for _, r in sub.iterrows():
        print(f"{r['CELL_LINE_NAME']}: COSMIC_ID={r['COSMIC_ID']}, TCGA={r['TCGA_DESC']}")
