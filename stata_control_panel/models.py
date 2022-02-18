import os
from django.db import models
from django.dispatch import receiver


class Database(models.Model):
    file = models.FileField(max_length=50, upload_to='stata_files/')
    columns = models.CharField(max_length=1000)

    def filename(self):
        return os.path.basename(self.file.name)


@receiver(models.signals.post_delete, sender=Database)
def auto_delete_file_on_delete(sender, instance, **kwargs):
    if instance.file:
        if os.path.isfile(instance.file.path):
            os.remove(instance.file.path)


class TagData(models.Model):
    name = models.CharField(max_length=100, primary_key=True)
    title = models.CharField(max_length=1000)