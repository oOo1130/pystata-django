import pandas as pd
import numpy as np

from pathlib import Path

if Path("EQUUS DATA.csv").exists():
    data = pd.read_csv("EQUUS DATA.csv", parse_dates=['Date'])
else:
    data = pd.DataFrame()

# data = data[['SP', 'FP', 'JXF', 'SEX']].groupby([data['Date'].dt.date, 'SEX']).agg('mean')
df_grouped = data.groupby([data['Date'].dt.date, 'SEX']).size().reset_index(name='counts')

df_sex_gelding = df_grouped[df_grouped['SEX']=='Gelding']
df_sex_colt = df_grouped[df_grouped['SEX']=='Colt']
df_sex_filly = df_grouped[df_grouped['SEX']=='Filly']
df_sex_horse = df_grouped[df_grouped['SEX']=='Horse']
df_sex_mare = df_grouped[df_grouped['SEX']=='Mare']

dates_list = df_sex_gelding.Date.tolist()
dates = [v.strftime('%m/%d/%Y') for v in dates_list]

print(dates)



#
# data = pd.DataFrame(data, columns=["SP", "FP"])
# dates = [v.strftime('%m/%d/%Y') for v in list(data.SP.keys())]
#
# sp_values = data.SP.tolist()
# fp_values = data.FP.tolist()

# data.sort_values(by='Date', inplace=True, ascending=False)
# dates = [v.strftime('%m/%d/%Y') for v in list(pd.to_datetime(data['Date']))]
# values = list(data.Date.keys())

