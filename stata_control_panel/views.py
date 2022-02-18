from asyncio.windows_events import NULL
from email import header
from email.base64mime import header_length
from itertools import count
from multiprocessing.sharedctypes import Value
from operator import mod
import os
import logging
import json
from re import T
from turtle import up, update
from unicodedata import name
from unittest import result
from xml.sax.handler import DTDHandler
from numpy import dtype, float64, sort
import numpy as np
import pandas as pd

import sys
import glob
import numbers
import time

import stata_setup

stata_setup.config("C:/Program Files/Stata17", "mp")

from pathlib import Path
from django.shortcuts import render
from django.http import HttpResponseRedirect, HttpResponseRedirect
from django.views.decorators.csrf import csrf_exempt
from django import forms
from django.http import Http404, JsonResponse, HttpResponseBadRequest
from django.utils.translation import ugettext_lazy as _
from django.core.files.storage import FileSystemStorage
from django.forms import ModelForm
from django.core.files.base import ContentFile

from stata_control_panel.models import Database
from stata_control_panel.models import TagData

from datetime import datetime

from urllib.parse import urlparse, parse_qs


from pystata import stata, config
from .utils.stata_util import status as pystata_status
from .utils.stata_util import clear_output, convert_str_date, get_variables
from .utils.graph_util import gen_graph_data

logger = logging.getLogger(__name__)

if sys.argv[1] == 'runserver':
    stata.config.close_output_file()
    config.set_output_file("stata_output.txt", True)
    # stata.config.set_graph_size('5in', '3in', True)
    # stata.run(f'''set scheme custom''')  # set graph theme


# convert_str_date('Date')

graph_2d_flag = False
# login Form

class LoginForm(forms.Form):
    pin = forms.CharField(initial="", required=True, min_length=4, max_length=4,
                          error_messages={'required': 'Please input your pincode!',
                                          'min_length': 'Input 4 digits, please',
                                          'max_length': 'Input 4 digits, please'})

    def clean_pin(self):
        pin = self.cleaned_data.get('pin')
        if pin != "0912" and pin != "1542":
            raise forms.ValidationError(_("Wrong pin number."))

        return pin


class FileUploadForm(ModelForm):
    class Meta:
        model = Database
        fields = ['file']

def graph_json(request):
    if not request.session.get('db_file', False):
        request.session['db_file'] = 'EQUUS DATA.csv'

    if request.is_ajax():
        db_file = request.session['db_file']
        if Path(db_file).exists():
            data = pd.read_csv(db_file, index_col=False)
        else:
            data = pd.DataFrame()
        #data = data.fillna('')
        data = data.head(999)
        class_name = data['CLASS'].unique().tolist()
        #for i in range(len(class_name)):
        query = "`{0}` == '{1}'".format('CLASS', class_name[0])
        data_class = data.query(query)
        data = data_class
        global graph_2d_flag
        graph_2d_flag = True

        x_variable = request.GET.get('x')
        y_variable = request.GET.get('y')
        group_by = request.GET.get('group_by')
        aggregate = request.GET.get('aggregate')
        variables = get_variables()
        
        data = data.sort_values(by=[y_variable], ascending = True)
        data = data.sort_values(by=[x_variable], ascending = True)

        x_data = data[x_variable]
        y_data = data[y_variable]

        x_dtype = dtype(x_data).name
        y_dtype = dtype(y_data).name

        x_value_list = x_data.values.tolist()
        y_value_list = y_data.values.tolist()
        if x_variable and y_variable:
            output_json = {
                'x_label': x_variable,
                'y_label': y_variable,
                'x_type': x_dtype,
                'y_type': y_dtype,
                'trace': {
                    'x': x_value_list,
                    'y': y_value_list,
                    'mode': 'line',
                    'type': 'scatter',
                    'name': 'Scatter Plot %s-%s' % (x_variable, y_variable),
                    'marker': {
                        'size': 5,
                        'opacity': 0.8,
                        'symbol': 'circle',
                    },
                    'transforms': [
                        {
                            'type': 'aggregate',
                            'groups': x_value_list,
                            'aggregations': [
                                {
                                    'target': 'y',
                                    'func': 'avg',
                                    'enabled': 'true',
                                }
                            ]
                        }
                    ],
                },
                'result': True,
                'variables': variables.tolist(),
                'flag': graph_2d_flag,
            }
        else:
            output_json = {'result': False}

        return JsonResponse(output_json)

    return HttpResponseBadRequest()

def graph_3d_json(request):
    if not request.session.get('db_file', False):
        request.session['db_file'] = 'EQUUS DATA.csv'

    if request.is_ajax():
        db_file = request.session['db_file']
        if Path(db_file).exists():
            data = pd.read_csv(db_file, index_col=False)
        else:
            data = pd.DataFrame()
        #data = data.fillna('')
        data = data.head(25000)

        global graph_2d_flag
        graph_2d_flag = False

        x_variable = request.GET.get('x')
        y_variable = request.GET.get('y')
        z_variable = request.GET.get('z')
        group_by = request.GET.get('group_by')
        aggregate = request.GET.get('aggregate')
        variables = get_variables()

        x_data = data[x_variable]
        y_data = data[y_variable]
        z_data = data[z_variable]

        x_dtype = dtype(x_data).name
        y_dtype = dtype(y_data).name
        z_dtype = dtype(z_data).name

        data = data.sort_values(by=[x_variable], ascending = True)
        data = data.sort_values(by=[y_variable], ascending = True)
        data = data.sort_values(by=[z_variable], ascending = True)

        x_value_list = x_data.values.tolist()
        y_value_list = y_data.values.tolist()
        z_value_list = z_data.values.tolist()

        if x_variable and y_variable and z_variable:
            output_json = {
                'x_label': x_variable,
                'y_label': y_variable,
                'z_label': z_variable,
                'x_type': x_dtype,
                'y_type': y_dtype,
                'z_type': z_dtype,
                'trace': {
                    'x': x_value_list,
                    'y': y_value_list,
                    'z': z_value_list,
                    'mode': 'line',
                    'type': 'scatter3d',
                    'name': 'Scatter Plot %s-%s-%s' % (x_variable, y_variable, z_variable),
                    'marker': {
                        'size': 1,
                        'opacity': 0.8,
                        'symbol': 'circle'
                    },
                    'transforms': [
                        {
                            'type': 'aggregate',
                            'groups': x_value_list,
                            'aggregations': [
                                {
                                    'target': 'y',
                                    'func': 'avg',
                                    'enabled': 'true',
                                }
                            ]
                        }
                    ],
                    # 'transforms': [
                    #     {
                    #         'type': 'aggregate',
                    #         'groups': x_value_list,
                    #         'aggregations': [
                    #             {
                    #                 'target': 'y',
                    #                 'func': 'avg',
                    #                 'enabled': 'true',
                    #             }
                    #         ]
                    #     }
                    # ],
                },
                'result': True,
                'variables': variables.tolist(),
                'flag': graph_2d_flag,
            }
        else:
            output_json = {'result': False}

        return JsonResponse(output_json)

    return HttpResponseBadRequest()

def db_file_upload(request):
    if request.method == 'POST':
        form = FileUploadForm(data=request.POST, files=request.FILES)
        if form.is_valid():
            db = form.save()
            db_name = os.path.basename(db.file.name)

            file = Path("stata_files/" + db_name)
            if db_name.lower().endswith('.csv'):
                data = pd.read_csv(file, encoding="ISO-8859-1", on_bad_lines='skip')
            elif db_name.lower().endswith('.dta'):
                data = pd.read_stata(file)

            data = data.fillna('')
            headers = data.columns.values.tolist()
            
            db_columns = [{'title': i, 'data': i} for i in headers]
            db.columns = json.dumps(db_columns)
            db.save()

            output_json = {'result': True, 'file_name': os.path.basename(db.file.name), 'url': db.file.url, 'id': db.id}
            return JsonResponse(output_json)
        else:
            output_json = {'result': False, 'errors': form.errors['file_upload'][0]}
            return JsonResponse(output_json)
    return HttpResponseBadRequest()


def mainnet_upload(request):
    result = True
    if request.method == 'POST':
        if request.POST.get('data'):
            try:
                with open("mainnet.json", "w") as file:
                    file.write(request.POST.get('data'))
            except:
                result = False
            output_json = {'result': result}
            return JsonResponse(output_json)

    return HttpResponseBadRequest()

def db_remove(request, id):
    result = True
    try:
        db_obj = Database.objects.get(id=id)
        db_obj.delete()
        file_name = os.path.basename(db_obj.file.name)
        return JsonResponse({'result': result, 'file_name': file_name})
    except:
        result = False
    return JsonResponse({'result': result})

def get_columns(request, name):
    result = True
    col_data = []
    fname = "stata_files/" + name
    file = Path("stata_files/" + name)
    if name.lower().endswith('.csv'):
        data = pd.read_csv(file, encoding="ISO-8859-1", on_bad_lines='skip')
    elif name.lower().endswith('.dta'):
        data = pd.read_stata(file)
    data = data.fillna('')

    headers = data.columns.values.tolist()
    header_len = len(headers)

    date_obj = []
    object_count = []
    int_count = []
    for i in range(header_len):
        column_data = data[headers[i]]
        column_type = dtype(column_data)
        if (column_type == 'object'):
            if (_validate_date(column_data[0])):
                date_obj.append(i)
            else:
                object_count.append(i)
        else:
            int_count.append(i)
        
    for i in headers:
        col_data.append(data[i].unique().tolist())

    tag_data = data.columns.values.tolist()

    db_datas = Database.objects.get(file=fname)

    return JsonResponse({
        "result":result, 
        "columns": db_datas.columns, 
        "tagdata": tag_data, 
        "colData":col_data, 
        "date_obj": date_obj, 
        "object_count": object_count, 
        "int_count": int_count, 
        })

def db_link(request, name):
    result = True

    request_data = json.loads(request.body.decode('utf8').replace('\\', ''))

    length = int(request_data['length'])
    start = int(request_data['start'])

    file = Path("stata_files/" + name)
    order_column = int(request_data['order'][0]['column'])
    order_type = request_data['order'][0]['dir']

    if order_type == 'asc':
        order_flag = True
    else:
        order_flag = False
    
    search_key = ''
    search_key = request_data['search']['value']
    columns = request_data['columns']

    column_count = len(columns)
    search_val = []
    search_col_name = []
    search_count = 0
    for i in range(column_count):
        if columns[i]['search']['value'] != '':
            search_val.append(columns[i]['search']['value'])
            search_col_name.append(columns[i]['data'])
            search_count = len(search_val)

    if name.lower().endswith('.csv'):
        data = pd.read_csv(file, encoding="ISO-8859-1", on_bad_lines='skip')
    elif name.lower().endswith('.dta'):
        data = pd.read_stata(file)
    data = data.fillna('')

    if search_key != '':
        data = data[data.isin([search_key]).any(axis=1)]
    
    if search_count >= 1:
        for i in range(search_count):
            col_data = data[search_col_name[i]]
            col_type = dtype(col_data)
            search_key = _change_val(search_val[i], col_type)
            search_kind = _search_kind(search_key, col_type)

            if (search_kind == "string_filter"):
                query = "`{0}` == '{1}'".format(search_col_name[i], search_key)
                data = data.query(query)

            else:
                key = _split_key(search_key)
                min_key = key[0]
                max_key = key[1]
                if (search_kind == "date_filter"):
                    min_date = "{0}".format(min_key)
                    max_date = "{0}".format(max_key)
                    min_key = datetime.strptime(min_date, "%m/%d/%Y").strftime('%d/%m/%Y')
                    min_key = datetime.strptime(min_key, "%d/%m/%Y")
                    max_key = datetime.strptime(max_date, "%m/%d/%Y").strftime('%d/%m/%Y')
                    max_key = datetime.strptime(max_key, "%d/%m/%Y")

                    data[search_col_name[i]] = pd.to_datetime(data[search_col_name[i]])

                    data = data[(data[search_col_name[i]] > min_key) & (data[search_col_name[i]] < max_key)]
                else:
                    max_key = _change_val(max_key, col_type)
                    min_key = _change_val(min_key, col_type)

                    query = '((`{0}` <= {1}) & (`{0}` >= {2}))'.format(search_col_name[i], max_key, min_key)
                    data = data.query(query)

    data = data.sort_values(data.columns[order_column], ascending = order_flag)
    data['row_num'] = data.index

    data = data.fillna('')
    
    headers_data = data.columns.values.tolist()
    
    body = data.to_dict('records')[start:(length+start)]
    fields = [{'label': i, 'name': i} for i in headers_data]

    totalCount = len(data.index)

    return JsonResponse({'result': result,
                        'file_name': name,
                        'data': body,
                        'recordsTotal': totalCount,
                        'recordsFiltered': totalCount,
                        'fields' : fields,
                        })


def _change_val(value, type):
    if (type == 'object'):
        return np.array([value]).astype(type)[0]
    else:
        return value

def _search_kind(search_key, type):
    if (type == 'object'):
        key_length = len(search_key)
        split = search_key.split(" - ")
        if (key_length == 23 and _validate_date(split[0]) == True):
            return "date_filter"
        else:
            return "string_filter"
    else:
        return "int_filter"
    
def _split_key(search_key):
    key = []
    value = search_key.replace("'", "")
    key = value.split(" - ")
    return key

def _validate_date(date_text):
    try:
        datetime.strptime(date_text, '%d/%m/%Y')
        return True
    except:
        return False

def _check_user_input(input_value):
    try:
        # Convert it into integer
        val = int(input_value)
        print("Input is an integer number. Number = ", val)
    except ValueError:
        try:
            # Convert it into float
            val = float(input_value)
            print("Input is a float number. Number = ", val)
        except ValueError:
            print("No.. input is not a number. It's a string")

def _filter_data(data, filter_kind, filter_key, col_name):
    flag = isinstance(data, pd.DataFrame)
    if(flag):
        data = data
    else:
        data = pd.DataFrame([data])

    if (filter_kind == "string_filter"):
        query = "`{0}` == '{1}'".format(col_name, filter_key)
        data = data.query(query)

    else:
        key = _split_key(filter_key)
        min_key = key[0]
        max_key = key[1]
        if (filter_kind == "date_filter"):
            min_date = "{0}".format(min_key)
            max_date = "{0}".format(max_key)
            min_key = datetime.strptime(min_date, "%m/%d/%Y").strftime('%d/%m/%Y')
            min_key = datetime.strptime(min_key, "%d/%m/%Y")
            max_key = datetime.strptime(max_date, "%m/%d/%Y").strftime('%d/%m/%Y')
            max_key = datetime.strptime(max_key, "%d/%m/%Y")

            data[col_name] = pd.to_datetime(data[col_name])

            data = data[(data[col_name] > min_key) & (data[col_name] < max_key)]
        else:
            col_type = dtype(data[col_name])
            max_key = _change_val(max_key, col_type)
            min_key = _change_val(min_key, col_type)

            query = '((`{0}` <= {1}) & (`{0}` >= {2}))'.format(col_name, max_key, min_key)
            data = data.query(query)
    return data

def db_update(request):
    if request.method == 'POST':
        result = True

        name = request.POST.get('name')
        file = Path("stata_files/" + name)
        if name.lower().endswith('.csv'):
            file_data = pd.read_csv(file, encoding="ISO-8859-1", on_bad_lines='skip').fillna('')
        elif name.lower().endswith('.dta'):
            file_data = pd.read_stata(file).fillna('')

        file_data = file_data.fillna('')
        headers = file_data.columns.values.tolist()
        data = json.loads(request.POST.get('json'))
        count = len(data)
        for i in range(count):
            data = json.loads(request.POST.get('json'))[i] 
            row = int(list(data.keys())[0])
            col_data = data[list(data.keys())[0]]
            col_id = int(list(col_data.keys())[0])
            change_value = list(col_data.values())[0]
            col_name = headers[col_id]
            file_data.at[row, col_name] = change_value

        update_data = file_data.iloc[[row]].to_dict('records')
        update_data[0].update({ "row_num" : row })

        if name.lower().endswith('.csv'):
            file_data.to_csv(file, index=False)
        elif name.lower().endswith('.dta'):
            stata.pdataframe_to_data(file_data, True)
            stata.run('''save %s, replace''' % file)

        return JsonResponse({'result': result, 'data': update_data})

def get_variable_ranges(request, col_name):
    result = True
    # if not request.session.get('db_file', False):
    #     request.session['db_file'] = 'EQUUS DATA.csv'
    #
    # if Path(request.session['db_file']).exists():
    #     data = pd.read_csv(request.session['db_file'])
    #
    data = stata.pdataframe_from_frame('default')
    col_name = col_name.replace(" ", "")
    print(col_name)
    #data = data.fillna('')
    col_data = data[col_name]
    type = dtype(col_data).name
    
    values = col_data.unique().tolist()

    return JsonResponse({'result': result, 'dtype': type, 'data': values})

def tag_data(request):
    if request.method == 'POST':
        try:
            result = True
            tagName = request.POST.get('name')
            tagTitle = request.POST.get('title')
            tagData = TagData(name=tagName, title=tagTitle)
            tagData.save()
            return JsonResponse({'result': result, 'name': tagName})
        except Exception as e:
                output_json = {'result': False, 'errors': repr(e)}
                return JsonResponse(output_json)

def run_command(request):
    if request.method == 'POST':
        clear_output()

        command = request.POST.get("command")
        try:
            stata.run(f'''{command}''')
            result = Path("stata_output.txt").read_text()  # stata.get_return()
        except Exception as e:
            output_json = {'result': False, 'errors': repr(e)}
            return JsonResponse(output_json)

        if not result:
            result = "There is no result"

        # save command to command history
        now = datetime.now()
        dt_string = now.strftime("%d/%m/%Y %H:%M")

        df = pd.DataFrame()
        df["Command"] = [command]
        df["RunAt"] = [dt_string]
        df["User"] = [request.session.get('username')]

        df.to_csv("command_history.csv", index=False, mode="a",
                  header=not Path("command_history.csv").exists())

        # save result to command history
        with open("result_history.txt", "a") as file:
            file.write(f"{result}\n")
        try:
            pd.read_csv(
                "command_history.csv").values.tolist()
        except Exception as e:
            output_json = {'result': False, 'errors': repr(e)}
            return JsonResponse(output_json)

        now = datetime.now()
        cmd_time = now.strftime("%d/%m/%Y %H:%M")

        output_json = {
            "result": True,
            "command": {'user': 'Mark', 'command': command, 'time': cmd_time},
            "stata_result": result
        }
        return JsonResponse(output_json)
    return HttpResponseBadRequest()

def draw_2d_graph(request):
    if request.method == 'POST':
        result = True
        post_data = dict(request.POST.items())
        data = stata.pdataframe_from_frame('default')
        #data = data.fillna('')
        data = data.head(999)

        global graph_2d_flag
        graph_2d_flag = True

        variables = get_variables()
        x_variable = post_data['x-2d-data']
        y_variable = post_data['y-2d-data']
        x_data = data[x_variable]
        y_data = data[y_variable]
        
        x_dtype = dtype(x_data).name
        y_dtype = dtype(y_data).name

        if (x_dtype == 'object'):
            x_key = post_data['x']
        else:
            x_min = post_data['x_min']
            x_max = post_data['x_max']
            if (x_min == ''):
                x_min = x_data.min()
            if (x_max == ''):
                x_max = x_data.max()
            x_key = ''
            x_key += str(x_min)
            x_key += ' - '
            x_key += str(x_max)

        if (y_dtype == 'object'):
            y_key = post_data['y']
        else:
            y_min = post_data['y_min']
            y_max = post_data['y_max']
            if (y_min == ''):
                y_min = y_data.min()
            if (y_max == ''):
                y_max = y_data.max()
            y_key = ''
            y_key += str(y_min)
            y_key += ' - '
            y_key += str(y_max)
        
        if(x_key != ''):
            filter_key_x = _change_val(x_key, x_dtype)
            filter_type_x = _search_kind(filter_key_x, x_dtype)
            x_data = _filter_data(data, filter_type_x, filter_key_x, x_variable)
        else:
            x_data = data

        if(y_key != ''):
            filter_key_y = _change_val(y_key, y_dtype)
            filter_type_y = _search_kind(filter_key_y, y_dtype)
            y_data = _filter_data(x_data, filter_type_y, filter_key_y, y_variable)
        
            data = y_data

        data = data.sort_values(by=[x_variable], ascending = True)

        x_value_list = data[x_variable].values.tolist()
        y_value_list = data[y_variable].values.tolist()
        if x_variable and y_variable:
            output_json = {
                'x_label': x_variable,
                'y_label': y_variable,
                'x_type': x_dtype,
                'y_type': y_dtype,
                'trace': {
                    'x': x_value_list,
                    'y': y_value_list,
                    'mode': 'line',
                    'type': 'scatter',
                    'name': 'Scatter Plot %s-%s' % (x_variable, y_variable),
                    'marker': {
                        'size': 1,
                        'opacity': 0.8,
                        'symbol': 'circle',
                    },
                    'transforms': [
                        {
                            'type': 'aggregate',
                            'groups': x_value_list,
                            'aggregations': [
                                {
                                    'target': 'y',
                                    'func': 'avg',
                                    'enabled': 'true',
                                }
                            ]
                        }
                    ],
                },
                'result': True,
                'variables': variables.tolist(),
                'flag': graph_2d_flag,
            }

        return JsonResponse(output_json)

    return HttpResponseBadRequest()

def draw_3d_graph(request):
    if request.method == 'POST':
        result = True
        post_data = dict(request.POST.items())
        data = stata.pdataframe_from_frame('default')
        #data = data.fillna('')
        data = data.head(25000)

        global graph_2d_flag
        graph_2d_flag = False

        variables = get_variables()
        x_variable = post_data['x-3d-data']
        y_variable = post_data['y-3d-data']
        z_variable = post_data['z-3d-data']
        
        x_data = data[x_variable]
        y_data = data[y_variable]
        z_data = data[z_variable]
        
        x_dtype = dtype(x_data).name
        y_dtype = dtype(y_data).name
        z_dtype = dtype(z_data).name

        if (x_dtype == 'object'):
            x_key = post_data['x']
        else:
            x_min = post_data['x_min']
            x_max = post_data['x_max']
            if (x_min == ''):
                x_min = x_data.min()
            if (x_max == ''):
                x_max = x_data.max()
            x_key = ''
            x_key += str(x_min)
            x_key += ' - '
            x_key += str(x_max)

        if (y_dtype == 'object'):
            y_key = post_data['y']
        else:
            y_min = post_data['y_min']
            y_max = post_data['y_max']
            if (y_min == ''):
                y_min = y_data.min()
            if (y_max == ''):
                y_max = y_data.max()
            y_key = ''
            y_key += str(y_min)
            y_key += ' - '
            y_key += str(y_max)

        if (z_dtype == 'object'):
            z_key = post_data['z']
        else:
            z_min = post_data['z_min']
            z_max = post_data['z_max']
            if (z_min == ''):
                z_min = z_data.min()
            if (z_max == ''):
                z_max = z_data.max()
            z_key = ''
            z_key += str(z_min)
            z_key += ' - '
            z_key += str(z_max)
        
        if(x_key != ''):
            filter_key_x = _change_val(x_key, x_dtype)
            filter_type_x = _search_kind(filter_key_x, x_dtype)
            x_data = _filter_data(data, filter_type_x, filter_key_x, x_variable)
        else:
            x_data = data
        if(y_key != ''):
            filter_key_y = _change_val(y_key, y_dtype)
            filter_type_y = _search_kind(filter_key_y, y_dtype)
            y_data = _filter_data(x_data, filter_type_y, filter_key_y, y_variable)
        else:
            y_data = data
        if(z_key != ''):
            filter_key_z = _change_val(z_key, z_dtype)
            filter_type_z = _search_kind(filter_key_z, z_dtype)
            z_data = _filter_data(y_data, filter_type_z, filter_key_z, z_variable)
            data = z_data

        data = data.sort_values(by=[y_variable], ascending = True)
        data = data.sort_values(by=[x_variable], ascending = True)
        data = data.sort_values(by=[z_variable], ascending = True)
        
        x_value_list = data[x_variable].values.tolist()
        y_value_list = data[y_variable].values.tolist()
        z_value_list = data[z_variable].values.tolist()

        if x_variable and y_variable and z_variable:
            output_json = {
                'x_label': x_variable,
                'y_label': y_variable,
                'z_label': z_variable,
                'x_type': x_dtype,
                'y_type': y_dtype,
                'z_type': z_dtype,
                'trace': {
                    'x': x_value_list,
                    'y': y_value_list,
                    'z': z_value_list,
                    'mode': 'line',
                    'type': 'scatter3d',
                    'name': 'Scatter Plot %s-%s-%s' % (x_variable, y_variable, z_variable),
                    'marker': {
                        'size': 1,
                        'opacity': 0.8,
                        'symbol': 'circle',
                    },
                    'transforms': [
                        {
                            'type': 'aggregate',
                            'groups': x_value_list,
                            'aggregations': [
                                {
                                    'target': 'y',
                                    'func': 'avg',
                                    'enabled': 'true',
                                }
                            ]
                        }
                    ],
                },
                'result': True,
                'variables': variables.tolist(),
                'flag': graph_2d_flag,
            }

        return JsonResponse(output_json)

    return HttpResponseBadRequest()

def index(request):
    # stata status
    if not config.is_stata_initialized():
        stata_status = "Failed to initialize stata"
    try:
        # This does not return stata status, just prints out stata status to console
        stata_version, stata_status = pystata_status()
    except Exception as e:
        logger.exception(e)
        stata_status = "No stata installed"
    # PIN login
    if not request.session.get('pincode', False):
        return HttpResponseRedirect('/login')

    if not request.session.get('db_file', False):
        request.session['db_file'] = 'EQUUS DATA.csv'

    if stata.sfi.Data.getObsTotal() == 0:
        if Path(request.session['db_file']).exists():
            data = pd.read_csv(request.session['db_file'])
        else:
            data = pd.DataFrame()

        stata.pdataframe_to_data(data, True)

    if Path("command_list.txt").exists():
        command_list = [command.strip() for command in list(Path("command_list.txt").read_text().split(','))]
    else:
        command_list = []

    variables = get_variables()

    tagtitle = TagData.objects.all()
    tagData = []

    for tag in tagtitle:
        data = {"name": tag.name,
                "title": json.loads(tag.title)}
        tagData.append(data)

    # POST request
    if request.method == 'POST':
        if "reset" in request.POST:  # Reset
            df = pd.DataFrame()
            df["Command"] = []
            df["RunAt"] = []
            df["User"] = []

            df.to_csv("command_history.csv", index=False, header=True)
            command_history = []

            if Path("result_history.txt").exists():
                try:
                    with open(Path("result_history.txt"), "w") as file:
                        file.write("")
                except PermissionError:
                    result_history = "Unable to access result history"
            result_history = ""
    else:
        try:
            command_history = pd.read_csv(
                "command_history.csv").values.tolist()
        except Exception as e:
            print(repr(e))
            command_history = ""

        if Path("result_history.txt").exists():
            result_history = Path("result_history.txt").read_text()
        else:
            result_history = ""

    # Get DB files
    db_files = Database.objects.all()

    # Load Saved Main Net
    mainnet = json.loads(Path("mainnet.json").read_text())

    return render(request, "index.html",
                  {
                      "command_history": command_history,
                      "result_history": result_history,
                      "variables": variables,
                      "stata_status": stata_status,
                      "command_list": command_list,
                      "stata_version": stata_version,
                      "tagData": tagData,
                      "db_files": db_files,
                      "mainnet": json.dumps(mainnet)
                  })


def filter(request):
    if not request.session.get('pincode', False):
        return HttpResponseRedirect('/login')
    if Path("EQUUS DATA.csv").exists():
        data = pd.read_csv("EQUUS DATA.csv")
        variables = data.keys().delete(len(data.keys()) - 1)

    else:
        variables = []
    temp = variables.tolist()
    return HttpResponseRedirect(json.dumps({"data": temp}))


@csrf_exempt
def apply(request):
    data = request.body
    range = json.loads(data)['arr']
    request.session['date_range'] = range
    #
    # if Path("EQUUS DATA.csv").exists():
    #     pdata = pd.read_csv("EQUUS DATA.csv")
    # else:
    #     pdata = pd.DataFrame()
    # try:
    #     py_dt_from = datetime.strptime(range[0], '%d/%m/%Y')
    #     py_dt_to = datetime.strptime(range[1], '%d/%m/%Y')
    #
    #     pdata['Date'] = pd.to_datetime(pdata['Date'], format='%d/%m/%Y')
    #     filtered_data = pdata[(pdata['Date'] >= py_dt_from) & (pdata['Date'] <= py_dt_to)]
    #     stata.pdataframe_to_data(filtered_data, True)
    #     convert_str_date('Date')
    # except:
    #     print(traceback.format_exc())
    #     return JsonResponse({'result': 'Failed'})
    return JsonResponse({'result': 'success'})


def login(request):
    if request.session.get('pincode', False):
        return HttpResponseRedirect('/')

    form = LoginForm()
    return render(request, 'login.html', {'form': form})


def logout(request):
    request.session.clear()

    return HttpResponseRedirect('/login')


def pin_request(request):
    if request.method == "POST":
        pinform = LoginForm(request.POST)

        if pinform.is_valid():
            request.session['pincode'] = pinform.cleaned_data['pin']
            print('login pin_code---->' + pinform.cleaned_data['pin'])
            if pinform.cleaned_data['pin'] == '0912':
                request.session['username'] = 'Mark'
            else:
                request.session['username'] = 'Chris'
            return HttpResponseRedirect('/')
        else:
            return render(request, "login.html", {'form': pinform})
    else:
        raise Http404
