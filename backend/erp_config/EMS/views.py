# backend/erp_config/EMS/views.py (Corrected - Only Employee + Department Views)

from rest_framework import viewsets, permissions
from django.contrib.auth.models import User
# Import models and serializers needed
from .models import Employee, Department # Import Employee and Department
from .serializers import EmployeeSerializer, DepartmentSerializer # Import relevant serializers
# Removed UserViewSet import if it wasn't defined or needed here

# Employee ViewSet (keep as is, ensure queryset is correct)
class EmployeeViewSet(viewsets.ModelViewSet):
    # Using select_related('user') optimizes fetching linked user data
    queryset = Employee.objects.select_related('user').all()
    serializer_class = EmployeeSerializer
    permission_classes = [permissions.IsAuthenticated]

# Department ViewSet (ReadOnly for now)
class DepartmentViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint that allows departments to be viewed.
    """
    queryset = Department.objects.all().order_by('name')
    serializer_class = DepartmentSerializer
    permission_classes = [permissions.IsAuthenticated] # Or adjust permissions as needed