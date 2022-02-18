from django.contrib import admin
from django.utils.translation import ugettext_lazy
from django.contrib.admin import AdminSite

AdminSite.site_title = ugettext_lazy('Stata System Admin')

AdminSite.site_header = ugettext_lazy('Stata System Administration')

AdminSite.index_title = ugettext_lazy('System Administration')


from stata_control_panel.models import Database


class DatabaseAdmin(admin.ModelAdmin):
    pass

admin.site.register(Database, DatabaseAdmin)
