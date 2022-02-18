import json
import os
from django.core.files.storage import FileSystemStorage
from django.http import (Http404, JsonResponse, HttpResponse)
from django.shortcuts import render

ROOT_DIRECTORY = "Dofiles"


def browse(request):
    fs = FileSystemStorage()
    output = fs.listdir('DoFiles')[1]

    output = map(lambda f: [f,
                            fs.get_created_time(os.path.join(ROOT_DIRECTORY, f)).strftime("%m/%d/%Y, %H:%M:%S"),
                            fs.get_modified_time(os.path.join(ROOT_DIRECTORY, f)).strftime("%m/%d/%Y, %H:%M:%S")], output)
    return render(request, "dofiles.html", {"files": output})


def show_text(request, filename):
    fs = FileSystemStorage()

    path = os.path.join(ROOT_DIRECTORY, filename)
    with fs.open(path, 'r') as f:
        output = f.read()

    return HttpResponse(output)


def save(request, filename):
    body = json.loads(request.body)
    content = body['content']
    result = 'ok'
    fs = FileSystemStorage()
    try:
        path = os.path.join(ROOT_DIRECTORY, filename)
        with fs.open(path, 'w') as f:
            f.write(content)
    except:
        result = 'failed'

    return JsonResponse({'result': result, 'output': content})


def create(request, filename):
    result = 'ok'
    fs = FileSystemStorage()
    try:
        path = os.path.join(ROOT_DIRECTORY, filename)
        if fs.exists(path):
            result = 'exist'
        else:
            with fs.open(path, 'w') as f:
                f.write('')
    except:
        result = 'failed'
    return JsonResponse({'result': result})


def delete(request, filename):
    fs = FileSystemStorage()
    result = 'ok'
    try:
        path = os.path.join(ROOT_DIRECTORY, filename)
        fs.delete(path)
    except:
        result = 'failed'
    return JsonResponse({'result': result})