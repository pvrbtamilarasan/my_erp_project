# backend/erp_config/EMS/urls.py (Corrected - Register Employee & Department URLs)

from django.urls import path, include
from rest_framework.routers import DefaultRouter
# Import only the needed viewsets
from .views import EmployeeViewSet, DepartmentViewSet

# Create a router and register our viewsets with it.
router = DefaultRouter()
router.register(r'employees', EmployeeViewSet, basename='employee')
router.register(r'departments', DepartmentViewSet, basename='department') # Register Department

# The API URLs are now determined automatically by the router.
urlpatterns = [
    path('', include(router.urls)),
]