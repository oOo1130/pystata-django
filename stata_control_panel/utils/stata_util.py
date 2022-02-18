import os
from pystata.config import stlib, stversion, stedition, stinitialized, sfiinitialized, stlibpath, stipython, stoutputf, stconfig, pyversion

from pystata import stata
from pathlib import Path
from sfi import Data, SFIToolkit, Missing, Scalar, Datetime
import numpy as np
import pandas as pd
from datetime import datetime
from .system_util import get_summary_system


def get_stata_version_str():
    if stversion == '':
        return stedition
    else:
        return 'Stata ' + stversion + ' (' + stedition + ')'


def get_python_version_str():
    s = [str(i) for i in pyversion]
    return ".".join(s)


def get_graph_size_str(info):
    global stconfig
    if info == 'gw':
        grwidth = stconfig['grwidth']
        if grwidth[0] == 'default':
            return 'default'
        else:
            return str(grwidth[0])+grwidth[1]
    else:
        grheight = stconfig['grheight']
        if grheight[0] == 'default':
            return 'default'
        else:
            return str(grheight[0])+grheight[1]


def status():
    """
    Display current system information and settings.
    """
    clear_output()
    
    result = ""
    if stinitialized is False:
        result = 'Stata environment has not been initialized yet'
        stata_version = ""
    else:
        # result = f'    System information\n' + \
        #          f'-------------------------------------------------------------------------------\n' +\
        #          f'      Python version         {get_python_version_str()}\n' + \
        #          f'      Stata version          {get_stata_version_str()}\n' + \
        #          f'      Stata library path     {stlibpath}\n' + \
        #          f'      Stata initialized      {str(stinitialized)}\n' + \
        #          f'      sfi initialized        {str(sfiinitialized)}\n' + \
        #          f'    Settings\n' + \
        #          f"      graphic display        {stconfig['grshow']}\n" + \
        #          f"      graphic display        width = {get_graph_size_str('gw')}, height = {get_graph_size_str('gh')}\n" + \
        #          f"      graphic format         {stconfig['grformat']}\n"
        stata.run('about')
        cmd_result = Path("stata_output.txt").read_text()  # stata.get_return()
        result += cmd_result

        result += get_summary_system()
        stata_version = get_stata_version_str()

    return stata_version, result

def clear_output():
    with open(Path("stata_output.txt"), "w") as file:
        file.write("")

def convert_str_date(variable, dformat=None):
    print('Date conversion start')
    vals = np.array(Data.get(var=variable))
    new_vals = []
    for v in vals:
        try:
            py_dt = datetime.strptime(v, '%d/%m/%Y')
        except:
            py_dt = datetime.strptime(v, '%Y-%m-%d')
        st_dt = Datetime.getSIF(py_dt, '%td')
        new_vals.append(st_dt)
    Data.dropVar(variable)
    Data.addVarFloat(variable)
    Data.store(variable, None, new_vals)
    Data.setVarFormat(variable, '%tdDD/NN/CCYY')
    # print(repr(new_vals))
    print('Date conversion end')


def get_variables():
    if Path("EQUUS DATA.csv").exists():
        data = pd.read_csv("EQUUS DATA.csv")
        variables = data.keys().delete(len(data.keys()) - 1)
    else:
        variables = []
    return variables
