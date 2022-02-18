"""stata URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, re_path
from stata_control_panel import views as stata_views
from stata_control_panel import filebrowser
from django.conf.urls.static import static
from django.conf import settings

urlpatterns = [
    path('admin/', admin.site.urls),
    path('login/', stata_views.login),
    path('logout/', stata_views.logout),
    path('pin_request/', stata_views.pin_request),
    path('filter', stata_views.filter),
    path('apply/', stata_views.apply),
    path('graph_json/', stata_views.graph_json),
    path('graph_3d_json/', stata_views.graph_3d_json),
    path('draw_2d_graph/', stata_views.draw_2d_graph),
    path('draw_3d_graph/', stata_views.draw_3d_graph),
    path('db_upload/', stata_views.db_file_upload),
    path('run_command/', stata_views.run_command),
    path('mainnet_upload/', stata_views.mainnet_upload),
    path('tag_data/', stata_views.tag_data),
    path('db_update/', stata_views.db_update),
    re_path(r'remove_db/(?P<id>\d+)/$', stata_views.db_remove),
    re_path(r'get_columns/(?P<name>[^\n]+)/$', stata_views.get_columns),
    re_path(r'db_link/(?P<name>[^\n]+)/$', stata_views.db_link),
    re_path(r'get_variable_ranges/(?P<col_name>[^\n]+)/$', stata_views.get_variable_ranges),
    # file browser
    path('fb_browse', filebrowser.browse),
    re_path(r'fb_show_text/(.*)$', filebrowser.show_text),
    re_path(r'fb_save/(.*)$', filebrowser.save),
    re_path(r'fb_delete/(.*)$', filebrowser.delete),
    re_path(r'fb_create/(.*)$', filebrowser.create),

    path('', stata_views.index)
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

