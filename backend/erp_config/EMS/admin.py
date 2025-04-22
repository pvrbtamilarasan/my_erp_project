from django.contrib import admin
from .models import Employee, Department

admin.site.register(Employee)
# Register your models here.
admin.site.register(Department)
