import pandas as pd
import numpy as np


def gen_graph_data(data):
    output = dict()
    df_grouped = data.groupby([data['Date'].dt.date, 'SEX']).size().reset_index(name='COUNT')

    df_sex_gelding = df_grouped[df_grouped['SEX'] == 'Gelding']
    df_sex_colt = df_grouped[df_grouped['SEX'] == 'Colt']
    df_sex_filly = df_grouped[df_grouped['SEX'] == 'Filly']
    df_sex_horse = df_grouped[df_grouped['SEX'] == 'Horse']
    df_sex_mare = df_grouped[df_grouped['SEX'] == 'Mare']

    output['gelding'] = _df_list(df_sex_gelding)
    output['colt'] = _df_list(df_sex_colt)
    output['filly'] = _df_list(df_sex_filly)
    output['horse'] = _df_list(df_sex_horse)
    output['mare'] = _df_list(df_sex_mare)

    # mean sp, fp
    data = data[['SP', 'FP', 'JXF']].groupby([data['Date'].dt.date]).mean()

    dates = [v.strftime('%m/%d/%Y') for v in list(data.SP.keys())]
    sp_values = data.SP.tolist()
    fp_values = data.FP.tolist()

    output['sp'] = {'dates': dates, 'values': sp_values}
    output['fp'] = {'dates': dates, 'values': fp_values}

    return output


def _df_list(data):
    dates_list = data.Date.tolist()
    dates = [v.strftime('%m/%d/%Y') for v in dates_list]
    counts = data.COUNT.tolist()
    output = dict()
    output['dates'] = dates
    output['values'] = counts
    return output
