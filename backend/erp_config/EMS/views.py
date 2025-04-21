# C:\scripts\my_app\my_erp_project\backend\erp_config\EMS\views.py

from rest_framework import viewsets, permissions
from .models import Employee
from .serializers import EmployeeSerializer

# Create your views here.
class EmployeeViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows employees to be viewed or edited.
    Provides list, create, retrieve, update, partial_update, destroy actions.
    """
    queryset = Employee.objects.all().order_by('-date_joined') # Get all Employee objects, newest joined first
    serializer_class = EmployeeSerializer # Use the serializer we created
    permission_classes = [permissions.IsAuthenticated] # Only allow logged-in users to access

    # Optional: You can add custom actions or override methods here later if needed
    # For example, an action to import employees from Excel
    # Or override perform_create to link the user automatically
    # def perform_create(self, serializer):
    #    serializer.save(user=self.request.user) # Example, adjust based on how users/employees are created